#!/usr/bin/env python3
"""Assemble reviewed Figma-exported PDF pages in presentation order.

Requires Poppler's pdfinfo, pdfseparate, and pdfunite on PATH.
"""

import argparse
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path


SLUG = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def page_count(source):
    result = subprocess.run(["pdfinfo", str(source)], check=True, text=True, capture_output=True)
    match = re.search(r"^Pages:\s*(\d+)$", result.stdout, re.MULTILINE)
    if not match:
        raise ValueError("pdfinfo output did not contain a page count")
    return int(match.group(1))


def validate_plan(plan, count):
    segments = plan.get("segments")
    if not isinstance(segments, list) or not segments:
        raise ValueError("plan must contain a nonempty segments list")
    names = set()
    for segment in segments:
        if not isinstance(segment, dict) or not SLUG.fullmatch(str(segment.get("name", ""))):
            raise ValueError("each segment needs a lowercase kebab-case name")
        name = segment["name"]
        if name in names:
            raise ValueError(f"duplicate segment name: {name}")
        names.add(name)
        pages = segment.get("pages")
        if not isinstance(pages, list) or not pages:
            raise ValueError(f"{name}: pages must be a nonempty list")
        for page in pages:
            if type(page) is not int or page < 1 or page > count:
                raise ValueError(f"{name}: invalid source page {page!r}; PDF has {count} pages")
    return segments


def build(source, segments, output_dir, combined_name):
    output_dir.mkdir(parents=True, exist_ok=True)
    pages = {page for segment in segments for page in segment["pages"]}
    with tempfile.TemporaryDirectory(prefix="figma-slides-") as scratch:
        scratch = Path(scratch)
        for page in sorted(pages):
            subprocess.run([
                "pdfseparate", "-f", str(page), "-l", str(page),
                str(source), str(scratch / f"page-{page:05d}.pdf")
            ], check=True)

        def unite(name, page_numbers):
            target = output_dir / f"{name}.pdf"
            inputs = [str(scratch / f"page-{page:05d}.pdf") for page in page_numbers]
            subprocess.run(["pdfunite", *inputs, str(target)], check=True)
            print(f"{target}: {len(page_numbers)} pages")

        for segment in segments:
            unite(segment["name"], segment["pages"])
        if combined_name:
            unite(combined_name, [page for segment in segments for page in segment["pages"]])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Figma's native Export frames to PDF file")
    parser.add_argument("--plan", type=Path, required=True, help="Reviewed JSON page order")
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--combined-name", help="Also create one PDF joining every segment")
    parser.add_argument("--dry-run", action="store_true", help="Validate and print the plan without writing PDFs")
    args = parser.parse_args()

    if not args.source.is_file():
        parser.error(f"source PDF not found: {args.source}")
    for command in ("pdfinfo", "pdfseparate", "pdfunite"):
        if not shutil.which(command):
            parser.error(f"{command} is required; install Poppler")
    if args.combined_name and not SLUG.fullmatch(args.combined_name):
        parser.error("--combined-name must be lowercase kebab-case")

    try:
        segments = validate_plan(json.loads(args.plan.read_text(encoding="utf-8")), page_count(args.source))
    except (OSError, ValueError, json.JSONDecodeError) as error:
        parser.error(str(error))
    if args.combined_name in {segment["name"] for segment in segments}:
        parser.error("--combined-name must differ from segment names")

    for segment in segments:
        print(f"{segment['name']}: {len(segment['pages'])} pages, source pages {segment['pages']}")
    if not args.dry_run:
        build(args.source, segments, args.output_dir, args.combined_name)


if __name__ == "__main__":
    main()

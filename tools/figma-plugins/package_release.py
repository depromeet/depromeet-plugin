"""Build runnable Figma plugin release ZIPs from a verified checkout."""
import argparse
import json
import re
import subprocess
import zipfile
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    tools = Path(__file__).resolve().parent
    repo = tools.parents[1]
    version = json.loads((repo / "plugins/depromeet-plugin/.codex-plugin/plugin.json").read_text())["version"]
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo, text=True).strip()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name in ("html-to-figma", "flow-inspector"):
        source = tools / name
        manifest = json.loads((source / "manifest.json").read_text())
        files = {"manifest.json", manifest["main"], manifest["ui"]}
        for file in files:
            path = (source / file).resolve()
            if not path.is_relative_to(source.resolve()) or not path.is_file():
                raise ValueError(f"Missing or invalid distribution file: {file}")
        archive = args.output_dir / f"{name}-v{version}.zip"
        with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as bundle:
            for file in sorted(files):
                bundle.write(source / file, file)
            guide = (tools / "README.md").read_text()
            guide = re.sub(
                r"\]\((html-to-figma/[^)]+|flow-inspector/[^)]+)\)",
                lambda match: f"](https://github.com/depromeet/depromeet-plugin/blob/{commit}/tools/figma-plugins/{match.group(1)})",
                guide,
            )
            bundle.writestr("INSTALL.md", guide)
            bundle.writestr("VERSION.txt", f"v{version}\ncommit: {commit}\n")
        with zipfile.ZipFile(archive) as bundle:
            if bundle.testzip() is not None:
                raise ValueError(f"Corrupt ZIP: {archive}")
            assert files | {"INSTALL.md", "VERSION.txt"} == set(bundle.namelist())
        print(archive)


if __name__ == "__main__":
    main()

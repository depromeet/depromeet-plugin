#!/usr/bin/env python3
import argparse
import json
import re
import subprocess
from pathlib import Path


SEMVER = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")


def git(repository, *arguments):
    return subprocess.run(
        ["git", *arguments],
        cwd=repository,
        capture_output=True,
        check=True,
        text=True,
    ).stdout


def changed_plugins(repository, base_sha, head_sha):
    output = git(
        repository,
        "diff",
        "--name-status",
        "--find-renames",
        base_sha,
        head_sha,
        "--",
        "plugins/",
    )
    plugins = set()
    for line in output.splitlines():
        fields = line.split("\t")
        for changed_path in fields[1:]:
            parts = Path(changed_path).parts
            if len(parts) >= 3 and parts[0] == "plugins":
                plugins.add(parts[1])
    return sorted(plugins)


def json_at(repository, revision, path):
    try:
        content = git(repository, "show", f"{revision}:{path}")
    except subprocess.CalledProcessError:
        return None
    return json.loads(content)


def plugin_versions(repository, revision, plugin):
    claude = json_at(
        repository,
        revision,
        f"plugins/{plugin}/.claude-plugin/plugin.json",
    )
    codex = json_at(
        repository,
        revision,
        f"plugins/{plugin}/.codex-plugin/plugin.json",
    )
    marketplace = json_at(repository, revision, ".claude-plugin/marketplace.json")
    if claude is None or codex is None or marketplace is None:
        return None

    marketplace_entry = next(
        (entry for entry in marketplace.get("plugins", []) if entry.get("name") == plugin),
        None,
    )
    if marketplace_entry is None:
        return None

    return {
        "Claude manifest": claude.get("version"),
        "Codex manifest": codex.get("version"),
        "Claude marketplace": marketplace_entry.get("version"),
    }


def semver(version):
    if not isinstance(version, str):
        return None
    match = SEMVER.fullmatch(version)
    if match is None:
        return None
    return tuple(int(part) for part in match.groups())


def validate_plugin(repository, base_sha, head_sha, plugin):
    head_versions = plugin_versions(repository, head_sha, plugin)
    if head_versions is None:
        return [f"{plugin}: required manifests or marketplace entry are missing"]

    unique_versions = set(head_versions.values())
    if len(unique_versions) != 1:
        details = ", ".join(f"{name}={value}" for name, value in head_versions.items())
        return [f"{plugin}: versions do not match ({details})"]

    head_version = next(iter(unique_versions))
    parsed_head = semver(head_version)
    if parsed_head is None:
        return [f"{plugin}: version must use major.minor.patch ({head_version!r})"]

    base_versions = plugin_versions(repository, base_sha, plugin)
    if base_versions is None:
        return []

    base_version = base_versions["Claude manifest"]
    parsed_base = semver(base_version)
    if parsed_base is None:
        return [f"{plugin}: base version is not valid major.minor.patch ({base_version!r})"]
    if parsed_head <= parsed_base:
        return [
            f"{plugin}: version was not increased "
            f"(base={base_version}, head={head_version})"
        ]
    return []


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("base_sha")
    parser.add_argument("head_sha")
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    arguments = parser.parse_args()

    plugins = changed_plugins(
        arguments.repo,
        arguments.base_sha,
        arguments.head_sha,
    )
    errors = []
    for plugin in plugins:
        errors.extend(
            validate_plugin(
                arguments.repo,
                arguments.base_sha,
                arguments.head_sha,
                plugin,
            )
        )

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    if plugins:
        print(f"Validated plugin versions: {', '.join(plugins)}")
    else:
        print("No plugin deployment changes detected")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

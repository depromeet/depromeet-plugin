import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


CHECKER = Path(__file__).parents[1] / ".github/scripts/check_plugin_versions.py"


class PluginVersionCheckTest(unittest.TestCase):
    def test_rejects_plugin_change_without_version_bump(self):
        with tempfile.TemporaryDirectory() as directory:
            repository = Path(directory)
            self._initialize_plugin(repository)
            base_sha = self._git(repository, "rev-parse", "HEAD").stdout.strip()

            skill = repository / "plugins/example-plugin/skills/example/SKILL.md"
            skill.write_text("changed\n")
            self._commit(repository, "change skill")

            result = self._run_checker(repository, base_sha)

            self.assertEqual(result.returncode, 1)
            self.assertIn("version was not increased", result.stdout)

    def test_accepts_plugin_change_with_matching_version_bump(self):
        with tempfile.TemporaryDirectory() as directory:
            repository = Path(directory)
            self._initialize_plugin(repository)
            base_sha = self._git(repository, "rev-parse", "HEAD").stdout.strip()

            skill = repository / "plugins/example-plugin/skills/example/SKILL.md"
            skill.write_text("changed\n")
            self._set_versions(repository, "1.0.1")
            self._commit(repository, "change skill and bump version")

            result = self._run_checker(repository, base_sha)

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("Validated plugin versions: example-plugin", result.stdout)

    def test_rejects_versions_that_do_not_match(self):
        with tempfile.TemporaryDirectory() as directory:
            repository = Path(directory)
            self._initialize_plugin(repository)
            base_sha = self._git(repository, "rev-parse", "HEAD").stdout.strip()

            skill = repository / "plugins/example-plugin/skills/example/SKILL.md"
            skill.write_text("changed\n")
            self._write_json(
                repository / "plugins/example-plugin/.claude-plugin/plugin.json",
                {"name": "example-plugin", "version": "1.0.1"},
            )
            self._commit(repository, "create version mismatch")

            result = self._run_checker(repository, base_sha)

            self.assertEqual(result.returncode, 1)
            self.assertIn("versions do not match", result.stdout)

    def test_ignores_changes_outside_plugin_directories(self):
        with tempfile.TemporaryDirectory() as directory:
            repository = Path(directory)
            self._initialize_plugin(repository)
            base_sha = self._git(repository, "rev-parse", "HEAD").stdout.strip()

            (repository / "README.md").write_text("documentation\n")
            self._commit(repository, "change root documentation")

            result = self._run_checker(repository, base_sha)

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("No plugin deployment changes detected", result.stdout)

    def _initialize_plugin(self, repository):
        self._git(repository, "init")
        self._git(repository, "config", "user.email", "test@example.com")
        self._git(repository, "config", "user.name", "Test User")

        self._write_json(
            repository / ".claude-plugin/marketplace.json",
            {
                "plugins": [
                    {"name": "example-plugin", "version": "1.0.0"},
                ]
            },
        )
        self._write_json(
            repository / "plugins/example-plugin/.claude-plugin/plugin.json",
            {"name": "example-plugin", "version": "1.0.0"},
        )
        self._write_json(
            repository / "plugins/example-plugin/.codex-plugin/plugin.json",
            {"name": "example-plugin", "version": "1.0.0"},
        )
        skill = repository / "plugins/example-plugin/skills/example/SKILL.md"
        skill.parent.mkdir(parents=True, exist_ok=True)
        skill.write_text("original\n")

        self._commit(repository, "initial")

    def _set_versions(self, repository, version):
        self._write_json(
            repository / ".claude-plugin/marketplace.json",
            {
                "plugins": [
                    {"name": "example-plugin", "version": version},
                ]
            },
        )
        self._write_json(
            repository / "plugins/example-plugin/.claude-plugin/plugin.json",
            {"name": "example-plugin", "version": version},
        )
        self._write_json(
            repository / "plugins/example-plugin/.codex-plugin/plugin.json",
            {"name": "example-plugin", "version": version},
        )

    def _commit(self, repository, message):
        self._git(repository, "add", ".")
        self._git(repository, "commit", "-m", message)

    @staticmethod
    def _run_checker(repository, base_sha):
        return subprocess.run(
            [sys.executable, CHECKER, base_sha, "HEAD", "--repo", repository],
            capture_output=True,
            text=True,
        )

    @staticmethod
    def _write_json(path, value):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value))

    @staticmethod
    def _git(repository, *arguments):
        return subprocess.run(
            ["git", *arguments],
            cwd=repository,
            capture_output=True,
            check=True,
            text=True,
        )


if __name__ == "__main__":
    unittest.main()

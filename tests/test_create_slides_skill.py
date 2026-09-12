import re
import unittest
from pathlib import Path


ROOT = Path(__file__).parents[1]
SKILL_ROOT = ROOT / "plugins/depromeet-plugin/skills/create-slides"
MARKDOWN_LINK = re.compile(r"\[[^]]+\]\(([^)]+)\)")


class CreateSlidesSkillTest(unittest.TestCase):
    def test_skill_entrypoint_and_linked_resources_exist(self):
        skill = SKILL_ROOT / "SKILL.md"

        self.assertTrue(skill.is_file())
        self.assertIn("name: create-slides", skill.read_text())

        missing = []
        for markdown in SKILL_ROOT.rglob("*.md"):
            for target in MARKDOWN_LINK.findall(markdown.read_text()):
                if "://" in target or target.startswith("#"):
                    continue
                resolved = (markdown.parent / target.split("#", 1)[0]).resolve()
                if not resolved.exists():
                    missing.append(f"{markdown.relative_to(ROOT)} -> {target}")

        self.assertEqual(missing, [])


if __name__ == "__main__":
    unittest.main()

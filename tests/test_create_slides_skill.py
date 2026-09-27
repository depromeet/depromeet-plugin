import re
import struct
import unittest
from pathlib import Path


ROOT = Path(__file__).parents[1]
SKILL_ROOT = ROOT / "plugins/depromeet-plugin/skills/create-slides"
PROFILE_ROOT = SKILL_ROOT / "profiles/depromeet_19"
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

    def test_visual_profile_owns_style_and_layout(self):
        profile = PROFILE_ROOT / "PROFILE.md"
        skeleton = PROFILE_ROOT / "layout-skeleton.html"
        stylesheet = PROFILE_ROOT / "style.css"

        self.assertTrue(profile.is_file())
        self.assertTrue(skeleton.is_file())
        self.assertTrue(stylesheet.is_file())
        self.assertIn('href="style.css"', skeleton.read_text())
        self.assertIn("#1659D5", stylesheet.read_text())
        self.assertIn("Pretendard", stylesheet.read_text())
        self.assertIn("--gradient-black-blue", stylesheet.read_text())

        for common in [SKILL_ROOT / "SKILL.md", *list((SKILL_ROOT / "references").glob("*.md"))]:
            content = common.read_text()
            self.assertNotRegex(content, r"#[0-9A-Fa-f]{6}\b")
            self.assertNotIn("font-family", content)
        self.assertFalse((SKILL_ROOT / "assets/layout-skeleton.html").exists())
        self.assertFalse((SKILL_ROOT / "references/depromeet-style.md").exists())

    def test_depromeet_profile_covers_common_layout_families(self):
        profile = (PROFILE_ROOT / "PROFILE.md").read_text()
        skeleton = (PROFILE_ROOT / "layout-skeleton.html").read_text()
        stylesheet = (PROFILE_ROOT / "style.css").read_text()

        layout_ids = re.findall(r'<section class="layout-card" id="(L\d\d)"', skeleton)
        self.assertEqual(layout_ids, [f"L{number:02d}" for number in range(1, 13)])
        self.assertEqual(len(re.findall(r'data-region-id="[^"]+"', skeleton)), 61)
        self.assertEqual(len(re.findall(r'data-for-region="[^"]+"', skeleton)), 61)
        for section in re.findall(
            r'<section class="layout-card".*?(?=<section class="layout-card"|</main>)',
            skeleton,
            re.DOTALL,
        ):
            self.assertEqual(
                re.findall(r'data-region-id="([^"]+)"', section),
                re.findall(r'data-for-region="([^"]+)"', section),
            )
        self.assertIn('href="style.css"', skeleton)
        self.assertNotIn("<style>", skeleton)
        self.assertNotRegex(skeleton, r'(?:src|href)="https?://')
        self.assertIn("--blue-500: #1659D5", stylesheet)
        self.assertIn("12 layout families", profile)

    def test_profile_overview_images_are_full_size_pngs(self):
        profile = (PROFILE_ROOT / "PROFILE.md").read_text()
        images = [PROFILE_ROOT / name for name in ("layout-overview.png", "design-overview.png")]

        for path in images:
            self.assertIn(f"]({path.name})", profile)
            data = path.read_bytes()
            self.assertTrue(data.startswith(b"\x89PNG\r\n\x1a\n"))
            width, height = struct.unpack(">II", data[16:24])
            self.assertGreaterEqual(width, 2000)
            self.assertGreaterEqual(height, 2000)
        self.assertNotEqual(images[0].read_bytes(), images[1].read_bytes())


if __name__ == "__main__":
    unittest.main()

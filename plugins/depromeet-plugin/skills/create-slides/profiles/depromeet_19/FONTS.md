# depromeet_19 font acquisition

This profile distributes no font binaries. The design-guide PDFs contain
specimens, not reusable font files. For each deck, obtain the fonts actually
used from their original distributors. Keep the downloaded version and license
with the deck so its typography works offline.

| Role | Original distribution | License and copyright notice |
| --- | --- | --- |
| Korean, Korean with Latin, and mixed lines: Pretendard | [Pretendard releases](https://github.com/orioncactus/pretendard/releases) | [SIL Open Font License 1.1, Pretendard LICENSE](https://github.com/orioncactus/pretendard/blob/main/LICENSE) |
| English-only or numbers-only: Instrument Sans | [Instrument Sans](https://github.com/Instrument/instrument-sans) | [SIL Open Font License 1.1, Instrument Sans OFL.txt](https://github.com/Instrument/instrument-sans/blob/master/OFL.txt) |
| Short English display: Space Grotesk | [Space Grotesk releases](https://github.com/floriankarsten/space-grotesk/releases) | [SIL Open Font License 1.1, Space Grotesk OFL.txt](https://github.com/floriankarsten/space-grotesk/blob/master/OFL.txt) |
| Short English slogan: Space Mono | [Space Mono](https://github.com/googlefonts/spacemono) | [SIL Open Font License 1.1, Space Mono OFL.txt](https://github.com/googlefonts/spacemono/blob/main/OFL.txt) |

Use an unmodified font file supplied by the original project. Do not extract a
font from the design-guide PDFs or make a new subset or format conversion. A
modified Pretendard file has Reserved Font Name conditions that require separate
handling.

1. Download the chosen original font files into the deck's `assets/fonts/`.
   Download each matching copyright notice and complete license text into
   `assets/licenses/`. Use the license shipped with the same font version when
   one is available.
2. Add local `@font-face` rules to the deck's copied `style.css`, using the
   actual font family, file format, and weight range. The skeleton and final
   slides must load the same files. Copy only fonts used by the deck.
3. Record the font name, resolved version or commit, original download URL,
   local file path, license path, and successful load or fallback in
   `style-profile.md`.
4. Inspect the rendered font and line wrapping. A CSS `font-family` declaration
   alone does not prove that the font loaded.

If a download or load fails, tell the user that a fallback font is being used
before requesting layout confirmation. Name the fallback in `style-profile.md`
and repeat that fact in the final handoff. If font loading cannot be checked,
report it as unverified rather than claiming success or fallback.

SIL's [OFL FAQ](https://openfontlicense.org/ofl-faq/) distinguishes using a
font in artwork from distributing a font file. When a deck contains font files,
keep their copyright notices and license texts with that deck. OFL fonts may
be used commercially, but the font files cannot be sold by themselves. A
locally installed font does not make a shared HTML deck portable.

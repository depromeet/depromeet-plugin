# Depromeet 사용 안내

Depromeet Plugin은 메모로 발표자료를 만들고, Figma에서 편집하거나 발표 순서대로 PDF를 준비하는 일을 돕습니다. 코드를 작성할 줄 몰라도 사용할 수 있습니다. 다만 AI에게 요청하는 작업과 Figma에서 직접 클릭하는 작업이 있으므로, 각 안내에서 누가 무엇을 하는지 확인하세요.

처음이라면 [처음 시작하기](onboarding.md)를 따라가세요. 이미 설치했다면 아래에서 필요한 작업을 선택하면 됩니다.

| 하고 싶은 일 | 안내 |
|---|---|
| AI에게 사용법을 물어보기 | [navigate-guide 사용하기](guides/ask-for-help.md) |
| Claude Code 또는 Codex에 설치하기 | [AI 플러그인 설치](guides/install.md) |
| 메모로 발표자료 만들기 | [발표자료 만들기](guides/create-slides.md) |
| 완성한 자료를 Figma에서 편집하기 | [Figma로 가져오기](guides/import-to-figma.md) |
| Figma 장표를 발표 순서대로 PDF로 만들기 | [발표용 PDF 만들기](guides/export-pdf.md) |
| Figma 도구 설치·업데이트, 실행 문제 해결 | [Figma 도구 관리](guides/figma-setup.md) |

## 두 종류의 플러그인

**Claude Code·Codex용 `depromeet-plugin`**은 AI가 이 작업을 수행할 때 따르는 안내 묶음입니다. 그 안의 ‘스킬’은 발표자료 제작이나 사용법 설명처럼 특정 일을 맡습니다. 사용자는 대화창에 원하는 일을 적어 요청합니다.

**Figma용 플러그인**은 Figma Desktop 안에서 실행하는 도구입니다. HTML → Figma는 발표자료를 가져오고, Depromeet Flow Inspector는 발표 순서를 확인하는 데 필요한 정보를 추출합니다. AI 플러그인을 설치해도 Figma 도구는 별도로 설치해야 합니다. HTML 발표자료만 만들 때는 Figma 도구가 필요하지 않습니다.

사용 중 막히면 설치된 AI의 대화창에 다음처럼 요청하세요.

```text
navigate-guide로 안내해줘. 처음 사용하는데 메모로 발표자료를 만들고 싶어.
```

유지 관리와 개발 방법은 [기여 안내](../CONTRIBUTING.md)를 참고하세요.

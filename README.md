# Depromeet Plugin Marketplace

Depromeet 팀이 Claude Code와 Codex에서 함께 사용할 플러그인을 관리하기 위한 시작 템플릿입니다. 현재는 `depromeet-plugin` 하나로 시작하며, 필요할 때 같은 마켓플레이스에 플러그인을 추가할 수 있습니다.

## 구조

```text
.
├── .agents/plugins/marketplace.json    # Codex 마켓플레이스
├── .claude-plugin/marketplace.json     # Claude Code 마켓플레이스
├── plugins/
│   └── depromeet-plugin/
│       ├── .claude-plugin/plugin.json
│       ├── .codex-plugin/plugin.json
│       └── skills/
│           ├── ask-depromeet/         # 발표 작업 경로 안내와 이어서 실행
│           ├── create-slides/
│           │   ├── SKILL.md
│           │   ├── agents/openai.yaml
│           │   ├── profiles/depromeet_19/
│           │   └── references/
│           ├── convert-html-to-figma/
│           │   ├── SKILL.md
│           │   └── tool/
│           └── extract-figma-slides/   # Figma 연결 검사와 PDF 순서 조립
├── CLAUDE.md
└── CONTRIBUTING.md
```

## 제공 스킬

### [`ask-depromeet`](plugins/depromeet-plugin/skills/ask-depromeet/SKILL.md)

어떤 작업부터 시작할지 모르거나 여러 발표 작업을 연결하고 싶을 때 사용합니다. 요청이 분명하면 HTML 발표자료 제작, HTML의 Figma 변환, Figma 장표 PDF 조립 중 필요한 작업으로 바로 이어갑니다. 각 작업 스킬을 직접 요청해도 됩니다.

```text
Use ask-depromeet to help me choose and complete a Depromeet presentation task.
```

### `create-slides`

디프만 19기 프로필은 발표자료를 만들 때 필요한 공식 폰트를 받아
결과물에 라이선스 고지와 함께 보관합니다. 폰트 로딩에 실패하면
대체 폰트 사용 사실을 알립니다. 플러그인 자체에는 폰트 파일을 넣지
않습니다.

발표 목적과 자료를 바탕으로 선택한 프로필의 HTML 슬라이드를 만듭니다. 기본 프로필 `depromeet_19`는 중앙 오브젝트의 짙은 남색 표지와 챕터, 흰색 본문, 어두운 핵심 문장 페이지를 사용합니다. 19기 디자인 가이드의 색상·서체와 12가지 공통 레이아웃 구조를 적용합니다. 개요 PNG에는 3D 표지 예시가 있지만 재사용 가능한 원본 이미지 파일은 포함되지 않습니다. 실제 덱에는 사용자가 이미지를 제공하고 사용 범위를 확인한 경우에만 적용하며, 이미지가 없으면 CSS 궤도 장식을 사용한다고 알립니다. 필요한 레이아웃 스켈레톤과 모든 페이지의 실제 문구·배치를 차례로 확인한 뒤 최종 `index.html`을 생성합니다.

```text
Use create-slides to turn these notes into a Depromeet-style HTML presentation.
```

### `convert-html-to-figma`

이미 만든 HTML 파일이나 ZIP을 Figma Design의 편집 가능한 프레임으로 옮깁니다. [`convert-html-to-figma`](plugins/depromeet-plugin/skills/convert-html-to-figma/SKILL.md)는 `create-slides`와 독립적이며, 빌드된 [HTML → Figma 도구](plugins/depromeet-plugin/skills/convert-html-to-figma/tool/README.md)를 안내합니다. 사용자는 로컬 플러그인을 등록한 뒤 페이지 썸네일을 확인하고, 새 가로 행과 독립 Flow로 가져올 수 있습니다.

### `extract-figma-slides`

Figma 개발 플러그인으로 섹션의 장표 문구와 프로토타입 연결을 JSON으로 추출합니다. Figma에서 내보낸 원본 PDF의 페이지와 대조해 발표 순서를 정한 뒤, 포함된 Python 스크립트로 구간별 PDF와 통합본을 만듭니다. 플러그인은 Figma 문서를 변경하거나 데이터를 외부로 전송하지 않습니다.

Figma 데스크톱 앱에서 **Plugins → Development → Import plugin from manifest…**를 선택하고 [`manifest.json`](plugins/depromeet-plugin/skills/extract-figma-slides/figma-plugin/manifest.json)을 지정하세요. 사용 절차와 PDF 조립 명령은 [`SKILL.md`](plugins/depromeet-plugin/skills/extract-figma-slides/SKILL.md)에 있습니다. PDF 조립에는 Poppler의 `pdfinfo`, `pdfseparate`, `pdfunite`가 필요합니다.

## 새 플러그인 추가

1. `plugins/<plugin-name>/` 디렉터리를 만듭니다.
2. `.claude-plugin/plugin.json`과 `.codex-plugin/plugin.json`을 모두 추가합니다.
3. `skills/<skill-name>/SKILL.md`에 스킬 frontmatter와 지침을 작성합니다.
4. 두 루트 마켓플레이스 파일에 같은 순서로 플러그인을 등록합니다.
5. 설명, 이름, 버전, 문서를 검토한 뒤 PR을 만듭니다.

플러그인의 버전을 올릴 때는 Claude 매니페스트, Codex 매니페스트, Claude 마켓플레이스 항목의 `version`을 같은 값으로 함께 변경해야 합니다.

## 설치와 로컬 개발

GitHub 마켓플레이스 등록 및 예시 플러그인 설치:

```bash
# Claude Code
claude plugin marketplace add depromeet/depromeet-plugin
claude plugin install depromeet-plugin@depromeet-plugins

# Codex
codex plugin marketplace add depromeet/depromeet-plugin
codex plugin add depromeet-plugin@depromeet-plugins
```

현재 저장소를 로컬에서 개발할 때는 저장소 루트에서 `.`을 마켓플레이스 경로로 사용합니다.

```bash
# Claude Code
claude plugin marketplace add .
claude plugin install depromeet-plugin@depromeet-plugins

# Codex
codex plugin marketplace add .
codex plugin add depromeet-plugin@depromeet-plugins
```

## Developing

플러그인과 스킬을 추가하거나 로컬에서 실행하려면 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

<a href="https://github.com/depromeet/depromeet-plugin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=depromeet%2Fdepromeet-plugin" alt="Depromeet Plugin contributors" />
</a>

## 라이선스

라이선스는 아직 팀에서 결정하지 않았습니다. 배포 또는 외부 기여를 받기 전에 라이선스 정책을 정하고 별도 파일을 추가하세요.

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
│       └── skills/create-slides/
│           ├── SKILL.md
│           ├── agents/openai.yaml
│           ├── profiles/
│           │   ├── INDEX.md
│           │   └── depromeet_19/
│           │       ├── PROFILE.md
│           │       ├── style.css
│           │       └── layout-skeleton.html
│           └── references/
├── CLAUDE.md
└── CONTRIBUTING.md
```

## 제공 스킬

### `create-slides`

디프만 19기 프로필은 발표자료를 만들 때 필요한 공식 폰트를 받아
결과물에 라이선스 고지와 함께 보관합니다. 폰트 로딩에 실패하면
대체 폰트 사용 사실을 알립니다. 플러그인 자체에는 폰트 파일을 넣지
않습니다.

발표 목적과 자료를 바탕으로 선택한 프로필의 HTML 슬라이드를 만듭니다. 기본 프로필은 `depromeet_19`이며, 19기 디자인 가이드의 색상·서체와 12가지 공통 레이아웃 구조를 슬라이드에 맞게 적용합니다. 프로필이 스타일과 레이아웃을 소유하고, 공통 스킬은 검토·제작 절차를 담당합니다. 필요한 레이아웃 스켈레톤과 모든 페이지의 실제 문구·배치를 차례로 확인한 뒤 최종 `index.html`을 생성합니다.

```text
Use create-slides to turn these notes into a Depromeet-style HTML presentation.
```

### `convert-html-to-figma`

이미 만든 HTML 파일이나 ZIP을 Figma Design의 편집 가능한 프레임으로 옮깁니다. [`convert-html-to-figma`](plugins/depromeet-plugin/skills/convert-html-to-figma/SKILL.md)는 `create-slides`와 독립적이며, 로컬 [HTML → Figma 도구](plugins/depromeet-plugin/skills/convert-html-to-figma/tool/README.md)의 설치와 가져오기를 안내합니다. 페이지의 실제 썸네일을 확인한 뒤 순서대로 가로 배치하고 가져오기마다 독립 Flow를 만듭니다.

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

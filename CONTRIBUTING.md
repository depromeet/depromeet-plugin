# 기여 가이드

Depromeet Plugin Marketplace에는 플러그인, 스킬, 문서, 버그 수정과 개선 제안을 기여할 수 있습니다. 이슈 등록은 항상 선택 사항이며, 작은 수정은 바로 PR로 제안해도 됩니다.

## 브랜치와 PR

작업 목적이 드러나는 짧은 브랜치를 만들고 PR로 변경을 제안하세요. PR에는 변경 이유, 영향을 받는 플러그인, Claude Code와 Codex에 미치는 영향을 적습니다. 제공된 PR 템플릿의 확인 항목도 검토하세요.

## 플러그인과 스킬 추가

새 플러그인은 `plugins/<plugin-name>/` 아래에 추가합니다. 각 플러그인에는 다음이 필요합니다.

- `.claude-plugin/plugin.json`
- `.codex-plugin/plugin.json`
- `skills/<skill-name>/SKILL.md` 하나 이상

플러그인을 추가하면 `.claude-plugin/marketplace.json`과 `.agents/plugins/marketplace.json`에 모두 같은 순서로 등록합니다. 두 런타임 매니페스트를 함께 유지하고, Claude 매니페스트·Codex 매니페스트·Claude 마켓플레이스 항목의 버전을 같은 값으로 맞추세요.

## 이름과 문서

플러그인과 스킬 디렉터리 이름은 소문자 kebab-case를 사용합니다. 플러그인 이름은 디렉터리 이름과 두 매니페스트의 `name`이 일치해야 합니다. 스킬의 frontmatter에는 `name`과 `description`을 작성하고, 실제 사용자가 이해할 수 있는 지침을 본문에 남기세요.

README, 매니페스트 설명, 스킬 설명은 변경한 기능과 설치 방법을 반영해야 합니다. Claude Code와 Codex 중 한쪽에만 영향을 주는 변경도 문서에 그 범위를 명확히 적어 주세요.

## 기여자 표시

README의 Contributors 영역은 GitHub의 기본 브랜치에 반영된 커밋을 기준으로 `contrib.rocks`가 자동 생성합니다. 별도로 이름이나 프로필 이미지를 이 문서에 추가할 필요는 없습니다.

이슈 제안이나 리뷰처럼 커밋으로 남지 않는 기여까지 별도로 표시해야 한다면, 프로젝트 운영 방식과 표시 기준을 먼저 합의한 뒤 수동 목록이나 All Contributors 도입을 검토합니다.

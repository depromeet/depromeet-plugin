# 저장소 유지 관리

이 저장소는 Claude Code와 Codex용 Depromeet 플러그인 마켓플레이스를 함께 관리합니다.

- 플러그인은 `plugins/<plugin-name>/` 아래에 둡니다.
- 각 플러그인에 Claude와 Codex 매니페스트 및 하나 이상의 `skills/<skill-name>/SKILL.md`를 유지합니다.
- 두 루트 마켓플레이스에는 같은 플러그인을 같은 순서로 등록합니다.
- Claude 매니페스트, Codex 매니페스트, Claude 마켓플레이스 항목의 버전은 항상 일치시킵니다.
- 플러그인·스킬 이름은 소문자 kebab-case를 사용하고, 문서와 매니페스트 설명을 변경 내용에 맞춰 갱신합니다.

## 버전 관리

스킬과 그 참조 문서·스크립트·에셋, 플러그인 매니페스트 등 `plugins/<plugin-name>/` 아래의 배포 내용을 추가·변경·삭제하면 같은 PR에서 해당 플러그인의 버전을 반드시 올립니다. 버전은 PR 기준 브랜치의 버전보다 높아야 하며, 이미 배포한 버전으로 다른 내용을 재배포하지 않습니다.

대상 플러그인의 다음 세 버전은 같은 값으로 변경합니다.

- `plugins/<plugin-name>/.claude-plugin/plugin.json`
- `plugins/<plugin-name>/.codex-plugin/plugin.json`
- `.claude-plugin/marketplace.json`의 대상 플러그인 `version`

루트 안내 문서, GitHub 템플릿 또는 테스트만 바뀌고 플러그인의 배포 내용이 달라지지 않으면 버전을 올리지 않습니다.

# 저장소 유지 관리

이 저장소는 Claude Code와 Codex용 Depromeet 플러그인 마켓플레이스를 함께 관리합니다.

- 플러그인은 `plugins/<plugin-name>/` 아래에 둡니다.
- 각 플러그인에 Claude와 Codex 매니페스트 및 하나 이상의 `skills/<skill-name>/SKILL.md`를 유지합니다.
- 두 루트 마켓플레이스에는 같은 플러그인을 같은 순서로 등록합니다.
- Claude 매니페스트, Codex 매니페스트, Claude 마켓플레이스 항목의 버전은 항상 일치시킵니다.
- 플러그인·스킬 이름은 소문자 kebab-case를 사용하고, 문서와 매니페스트 설명을 변경 내용에 맞춰 갱신합니다.

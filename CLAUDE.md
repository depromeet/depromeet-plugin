# 저장소 유지 관리

이 저장소는 Claude Code와 Codex용 Depromeet 플러그인 마켓플레이스를 함께 관리합니다.

- 플러그인은 `plugins/<plugin-name>/` 아래에 둡니다.
- 각 플러그인에 Claude와 Codex 매니페스트 및 하나 이상의 `skills/<skill-name>/SKILL.md`를 유지합니다.
- 두 루트 마켓플레이스에는 같은 플러그인을 같은 순서로 등록합니다.
- Claude 매니페스트, Codex 매니페스트, Claude 마켓플레이스 항목의 버전은 항상 일치시킵니다.
- 플러그인·스킬 이름은 소문자 kebab-case를 사용하고, 문서와 매니페스트 설명을 변경 내용에 맞춰 갱신합니다.

## 버전 관리

스킬과 그 참조 문서·스크립트·에셋, 플러그인 매니페스트 등 `plugins/<plugin-name>/` 아래의 배포 내용 또는 연결된 `tools/figma-plugins/` 도구를 추가·변경·삭제하면 같은 PR에서 해당 플러그인의 버전을 반드시 올립니다. 버전은 PR 기준 브랜치의 버전보다 높아야 하며, 이미 배포한 버전으로 다른 내용을 재배포하지 않습니다.

대상 플러그인의 다음 세 버전은 같은 값으로 변경합니다.

- `plugins/<plugin-name>/.claude-plugin/plugin.json`
- `plugins/<plugin-name>/.codex-plugin/plugin.json`
- `.claude-plugin/marketplace.json`의 대상 플러그인 `version`

루트 안내 문서, GitHub 템플릿 또는 테스트만 바뀌고 플러그인의 배포 내용이 달라지지 않으면 버전을 올리지 않습니다.

## Figma 도구와 Release 배포

- Figma에서 실행하는 도구와 공통 설치 문서는 루트 `tools/figma-plugins/` 아래에 둡니다. 스킬은 도구를 중복 포함하지 않고 Release 설치 파일과 공통 안내로 연결합니다.
- `depromeet-plugin` 버전을 변경하면 해당 버전의 Git 태그와 GitHub Release를 반드시 발행합니다. 버전 변경만 하고 배포를 완료했다고 보고하지 않습니다.
- Release에는 `html-to-figma-v<버전>.zip`과 `flow-inspector-v<버전>.zip`을 첨부합니다. 각 ZIP에 실행용 manifest·코드·UI, 공통 설치 안내, `VERSION.txt`를 포함하고 파일 구조와 manifest 참조를 검사합니다.
- 도구 소스가 바뀌면 검사·빌드 후 빌드 결과도 커밋합니다. Release는 검증한 커밋을 가리키며, 이미 발행한 태그나 같은 버전의 내용을 교체하지 않습니다.
- 정식 Release는 머지된 커밋을 기준으로 발행합니다. 머지 전 배포를 사용자가 요청한 경우 검증한 PR 커밋을 대상으로 prerelease를 발행하고 미머지 상태와 검증 범위를 명시합니다. PR 승인이나 Release 요청만으로 PR을 머지하지 않습니다.
- Release 본문에는 도구별 변경점과 설치·업데이트 안내를 넣고, 발행 후 태그의 커밋과 두 첨부 파일을 다시 확인합니다.

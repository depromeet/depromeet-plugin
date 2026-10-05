# Figma 플러그인 설치·업데이트

Figma Desktop에서 사용하는 두 로컬 개발 플러그인의 공통 안내입니다. Claude Code·Codex용 `depromeet-plugin` 설치와는 별개입니다. AI 없이도 아래 절차를 따라 설치할 수 있습니다.

| 플러그인 | 기능 | 저장소에 포함된 폴더 |
|---|---|---|
| HTML → Figma | HTML·ZIP을 편집 가능한 프레임으로 가져오기 | [변환 도구](html-to-figma/README.md) |
| Depromeet Flow Inspector | 장표 문구·프로토타입 연결을 JSON으로 추출 | [추출 도구](flow-inspector/manifest.json) |

## ask-depromeet에서 시작하는 흐름

`ask-depromeet`의 “Figma 플러그인 설치·업데이트·복구”를 선택하면 대상과 작업 계획을 확인합니다. 메뉴 선택은 계획 승인이 아니며, 승인 후 설치 스킬로 이어집니다. 아래는 스킬에 정의된 안내 흐름입니다.

### 최초 사용자

```text
[ask-depromeet 호출]
         |
         v
[설치·업데이트·복구 선택]
         |
         v
[사용할 플러그인 확인]
 HTML → Figma / Flow Inspector
         |
         v
[설치 계획 안내 → 사용자 승인]
         |
         v
[setup-figma-plugins로 연결]
         |
         v
[실행용 Release ZIP이 있나?]
         |
    +----+----+
    |         |
   있음      없음
    |         |
    v         v
[ZIP 받기] [저장소의 실행 파일 사용]
    |         |
    +----+----+
         |
         v
[고정 설치 폴더에 배치]
         |
         v
[Figma에서 manifest 등록]
         |
         v
[실행 확인 · 설치 경로 기록]
```

### 기존 사용자 — 업데이트

```text
[ask-depromeet에 업데이트 요청]
              |
              v
[대상 플러그인 · 설치 경로 확인]
              |
              v
[업데이트 계획 안내 → 사용자 승인]
              |
              v
[setup-figma-plugins로 연결]
 기존 정보·승인 유지
              |
              v
[새 배포 파일 확인 · 준비]
              |
              v
[기존 설치 경로를 아나?]
              |
       +------+------+
       |             |
      알고 있음     모름
       |             |
       v             v
[종료 · 폴더 백업] [새 고정 폴더에 배치]
       |             |
       v             v
[같은 경로에 교체] [새 manifest 등록]
       |             |
       +------+------+
              |
              v
[Figma에서 다시 실행]
              |
              v
[정상 실행되나?]
              |
       +------+------+
       |             |
      예            아니요
       |             |
       v             v
[업데이트 확인] [경로·중복 등록 확인]
                     |
                     v
              [재등록 → 다시 실행]
```

Release나 실행용 ZIP이 없으면 기존 사용자도 저장소에 포함된 실행 파일을 사용합니다. 컴퓨터 조작 도구가 없다면 Figma 등록·재실행은 사용자가 진행합니다. 설치·업데이트만 요청하면 실행 확인에서 끝나고, 변환·추출까지 승인한 경우에는 준비 완료 후 원래 작업으로 이어집니다. 직접 `setup-figma-plugins`를 호출하면 `ask-depromeet`의 계획 단계를 추가하지 않습니다.

## 다운로드와 설치 위치

[GitHub Releases](https://github.com/depromeet/depromeet-plugin/releases)에서 실제 게시된 버전과 첨부 파일을 확인하세요. 실행용 ZIP이 제공되면 해당 파일을 사용합니다. GitHub의 `Source code (zip)`은 전체 저장소 압축이며, 플러그인별 실행용 ZIP과 다릅니다.

Release나 실행용 ZIP이 없다면 해당 버전의 저장소를 내려받고 `tools/figma-plugins/` 아래 위 표의 폴더를 복사하세요. 도구는 Claude Code·Codex용 설치 스킬 패키지에 포함되지 않으므로 플러그인 캐시 안에서 찾지 마세요. HTML 변환 도구는 `manifest.json`과 `dist/` 전체가 필요하고, Flow Inspector는 `manifest.json`, `code.js`, `ui.html`이 필요합니다. 변환 도구에는 빌드된 파일이 포함돼 있어 사용자는 Node.js나 npm을 설치할 필요가 없습니다.

설치 폴더는 버전과 무관하게 유지하세요. 예를 들어 사용자 문서 폴더 아래 다음 위치를 사용할 수 있습니다.

```text
DepromeetPlugins/
├── html-to-figma/
│   ├── manifest.json
│   └── dist/
│       ├── code.js
│       └── ui.html
└── flow-inspector/
    ├── manifest.json
    ├── code.js
    └── ui.html
```

ZIP에 상위 폴더가 있으면 한 단계 안쪽의 파일을 배치해 위 구조를 맞추세요. 플러그인 설치 폴더 안에는 개인 HTML·PDF·JSON 결과물을 보관하지 않는 편이 좋습니다. 임시 폴더나 설치 캐시를 직접 등록하면 삭제·캐시 갱신으로 경로가 사라질 수 있으므로 별도 고정 폴더를 권장합니다.

## 처음 설치

1. 다운로드한 파일을 위와 같은 고정 폴더에 배치합니다.
2. 각 `manifest.json`의 `main`, `ui` 경로에 해당 파일이 있는지 확인합니다.
3. Figma Desktop의 디자인 파일에서 **Plugins → Development → Import plugin from manifest…**를 선택합니다. 앱 버전에 따라 메뉴 문구가 조금 다를 수 있습니다.
4. 사용할 플러그인의 `manifest.json`을 선택합니다. 두 플러그인을 모두 쓰려면 각각 등록합니다.
5. Development 목록에서 **HTML → Figma** 또는 **Depromeet Flow Inspector**를 실행해 화면이 열리는지 확인합니다.

등록한 manifest의 전체 경로와 다운로드한 버전을 기록해 두세요. 플러그인 화면이 열렸다는 사실과 실제 HTML 변환·장표 추출 성공은 별도 확인입니다.

## 이미 설치한 경우 업데이트

Release 게시나 Claude Code·Codex 플러그인 업데이트만으로 별도 설치 폴더의 Figma 파일이 바뀌지는 않습니다.

1. 최초 등록 때 기록한 경로나 실제 설치 폴더를 확인하고 실행 중인 플러그인을 닫습니다. 경로를 확인할 수 없다면 아래 “설치 위치를 모르거나 폴더를 옮긴 경우” 절차를 사용합니다.
2. 새 버전을 임시 폴더에 풀고 파일 구조를 확인합니다. 이전 설치 폴더는 복구용으로 별도 복사합니다.
3. 기존 등록 경로를 유지하면서 새 `manifest.json`과 배포 파일을 교체합니다. HTML 변환 도구는 `dist/`를 통째로 교체하고, Inspector는 `code.js`, `ui.html`을 교체합니다. 동봉된 `VERSION.txt`와 설치 안내도 새 파일로 교체합니다. 개인 파일이 있다면 보존하세요.
4. Figma에서 플러그인을 다시 실행합니다. 같은 manifest 경로를 유지했다면 우선 재등록 없이 실행해 봅니다.
5. 이전 화면이 계속 나오거나 실행에 실패하면 의도한 폴더의 manifest를 다시 등록합니다. Development 목록에 같은 이름이 여러 개면 경로를 확인해 새 설치를 실행하고, 사용하지 않는 항목을 정리합니다.

설치 폴더 이름에는 버전을 붙이지 않아야 매번 등록 경로를 바꾸지 않아도 됩니다. 다운로드 ZIP 이름에는 버전을 붙여 구분할 수 있습니다.

## 설치 위치를 모르거나 폴더를 옮긴 경우

기존 위치를 확인할 수 있으면 먼저 그 경로를 사용하세요. 확인할 수 없다면 기존 폴더를 추측해 삭제하지 말고 새 고정 폴더에 설치한 후 그 manifest를 등록합니다. 새 플러그인이 열리는 것을 확인한 뒤 불필요한 등록 항목을 정리하세요.

## 버전 확인과 이전 버전 복구

현재 두 플러그인 UI에는 배포 버전 표시가 없습니다. Figma manifest의 `api: "1.0.0"`은 Figma API 버전이며 배포 버전이 아닙니다. Release 태그·다운로드 파일명·동봉된 버전 파일이 있으면 그것을 출처 기록으로 사용하세요. 저장소에서 직접 복사했다면 원본 커밋과 `depromeet-plugin` 매니페스트 버전을 기록합니다. 이것만으로 Figma가 해당 사본을 실행했음을 확인한 것은 아니므로 등록 경로와 실행도 확인하세요.

복구하려면 실제 존재하는 이전 Release의 ZIP이나 보관한 설치 폴더를 사용합니다. 플러그인을 닫고 같은 설치 경로에 이전 배포 파일과 동봉된 버전 기록을 복원한 뒤 재실행합니다. 이전 Release·백업이 없으면 복구 가능하다고 안내하지 마세요.

## 배포 담당자의 버전 관리

두 Figma 도구를 `depromeet-plugin` 배포 버전으로 함께 관리합니다. 배포 내용 변경 시 Claude·Codex 매니페스트와 Claude 마켓플레이스 항목의 버전을 동일하게 올리고, 같은 버전의 Git 태그와 Release를 준비합니다. 변경되지 않은 도구는 Release 설명에 “변경 없음”으로 표시합니다.

실행용 첨부 파일명은 `html-to-figma-v<버전>.zip`, `flow-inspector-v<버전>.zip`을 권장합니다. ZIP에는 위 설치 구조에 필요한 빌드 결과와 이 안내 문서, 출처를 식별할 `VERSION.txt`를 포함하세요. 이는 배포 시 준비할 규칙이며, 이 문서 추가만으로 ZIP이나 Release가 생성되지는 않습니다. HTML 변환 소스를 수정했다면 도구 README의 검사·빌드를 먼저 완료합니다. 검증한 커밋에서 저장소 루트 기준 `python3 tools/figma-plugins/package_release.py --output-dir /tmp/depromeet-release`로 두 실행용 ZIP을 만들 수 있습니다. 패키징은 manifest 참조 파일과 ZIP 무결성을 검사하며 `INSTALL.md`, `VERSION.txt`를 포함합니다. Release 게시는 별도로 진행합니다.

Release 설명에는 각 도구의 변경점, 설치·업데이트 절차 링크, 필요한 사용자 조치를 적습니다. 두 도구는 현재 네트워크 접근을 차단하고 있어 최신 Release 조회나 자동 업데이트를 하지 않습니다. 팀 공지와 Releases 페이지를 통해 업데이트를 안내합니다.

[Figma 매니페스트 문서](https://developers.figma.com/docs/plugins/manifest/) · [GitHub Releases 안내](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

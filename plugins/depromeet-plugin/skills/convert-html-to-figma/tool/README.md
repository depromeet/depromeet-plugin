# HTML → Figma

로컬 HTML 파일이나 ZIP을 Figma Design의 편집 가능한 프레임으로 가져오는 개발용 플러그인입니다. 가져오기마다 기존 작업 아래에 새 행을 만들고, 페이지를 왼쪽에서 오른쪽으로 배치한 뒤 그 행에 별도 Flow를 연결합니다.

## 처음 준비하기

Node.js 22 이상, Figma Desktop, Chromium이 필요합니다. 이 디렉터리에서 실행합니다.

```bash
npm ci
npx playwright install chromium
npm test
npm run typecheck
npm run build
npm run serve
```

`npm run serve`는 로컬 HTML을 렌더링하는 캡처 서비스를 `localhost:4179`에 실행합니다. 플러그인을 사용하는 동안 터미널을 열어 두세요. 빌드와 서비스가 `.local/connection-token`을 자동으로 공유합니다. 이 파일과 토큰이 삽입된 `dist/`는 Git에 포함하지 않습니다. 토큰을 화면에 입력하거나 복사할 필요가 없습니다. 다른 기계에서 사용한다면 그 기계에서 다시 빌드하고 서비스를 실행하세요.

Figma Desktop의 디자인 파일에서 **Plugins → Development → Import new plugin from manifest…**를 열고 이 디렉터리의 `manifest.json`을 선택합니다. 이후에는 Development 목록에서 **HTML → Figma**를 실행합니다. 개발용 등록에는 Figma 플러그인 ID 발급이나 Community 게시가 필요하지 않습니다. Figma 등록은 처음 한 번만 하면 되지만, 플러그인을 사용할 때마다 로컬 캡처 서비스는 실행해야 합니다.

컴퓨터 사용 자동화가 없다면 사용자가 Figma 안에서 등록과 가져오기를 진행합니다. 스킬은 파일 준비, 빌드, 서비스 실행, 검증 방법을 안내할 수 있습니다. 별도 배포 방식으로는 Community 공개 게시나 조직 내부 게시가 있으나, 현재 변환 구조에서는 어느 방식이든 사용자의 로컬 캡처 서비스가 필요합니다.

## 가져오기

1. 플러그인에서 `.html`, `.htm`, `.zip` 파일을 선택합니다. CSS, 이미지, 로컬 폰트를 참조한다면 관련 파일을 상대 경로 그대로 ZIP에 담으세요.
2. 자동 감지된 각 페이지의 **실제 렌더링 썸네일**을 보고, 필요하면 ↑ ↓로 순서를 바꿉니다.
3. **새 행으로 가져오기**를 누릅니다. 두 번째 가져오기는 첫 행 아래에 추가되고 기존 프레임과 Flow는 유지됩니다.
4. Figma에서 레이어, 폰트, 레이아웃, Prototype 연결을 확인합니다.

예를 들어 추석 덱은 해당 디렉터리에서 아래처럼 묶을 수 있습니다.

```bash
zip -r /tmp/chuseok-html.zip index.html style.css assets
```

페이지 구획과 프레임 사이 간격은 자동으로 처리합니다. 간격은 내부적으로 120 px입니다. 플러그인에는 웹 주소 입력, 페이지 나누기, 간격 설정이 없습니다.

## 변환 범위와 제한

- 한 파일에 `[data-page-id]`, `[data-slide]`, `.slide` 구획이 두 개 이상 있으면 그 순서대로 페이지를 만듭니다. 나머지는 HTML 파일마다 한 페이지입니다.
- 텍스트, 단색 배경, 테두리, 둥근 모서리는 편집 가능한 Figma 노드가 됩니다. `img`, SVG, canvas, video, CSS 배경 이미지는 이미지 레이어로 만듭니다. 로컬 HTML의 JavaScript는 실행하지 않습니다.
- 그림자, 필터, 복잡한 CSS, 글꼴 렌더링 등은 완전히 재현되지 않을 수 있습니다. 모든 요소가 편집 가능하거나 원본과 픽셀 단위로 같다고 보장하지 않습니다.
- Figma에서 원본 폰트를 사용할 수 없으면 `Noto Sans KR`, 이어서 `Inter`를 시도하고 대체 내역을 결과에 표시합니다. 폰트 파일은 포함하지 않습니다. 필요한 폰트는 사용자가 라이선스를 확인해 직접 설치합니다.
- ZIP과 압축 해제된 파일을 합쳐 40 MB, HTML 페이지 100개, 페이지당 DOM 요소 5000개, 래스터 이미지 100개로 제한합니다. ZIP 경로 이탈을 거절합니다. 사용 후 캡처 서비스를 종료하세요.

행과 페이지 ID는 Figma의 shared plugin data에 저장합니다. 이 데이터는 다른 플러그인도 읽을 수 있으므로 비밀 정보는 저장하지 않습니다.

## 검증 범위

자동 테스트는 입력 계약, ZIP 안전성, HTML 캡처와 실제 썸네일, 숨겨진 페이지의 레이아웃 복원, 폰트 대체, 가로 행과 Flow, 오류 복구, 3단계 UI를 검사합니다. 기존 버전에서는 추석 덱 10장과 Figma Desktop의 행별 Flow를 수동으로 확인했습니다. 새 UI와 이름으로 Figma Desktop에서 다시 등록한 결과는 별도 확인이 필요합니다.

[Figma 개발 플러그인 등록](https://help.figma.com/hc/en-us/articles/360042786733-Create-a-plugin-for-development), [매니페스트](https://developers.figma.com/docs/plugins/manifest/), [네트워크 요청](https://developers.figma.com/docs/plugins/making-network-requests/), [조직 내부 배포](https://help.figma.com/hc/en-us/articles/4404228629655-Create-internal-plugins-for-an-organization)를 참고했습니다.

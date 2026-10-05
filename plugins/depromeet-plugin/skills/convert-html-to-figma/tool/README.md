# HTML → Figma

로컬 HTML 파일이나 ZIP을 Figma Design의 편집 가능한 프레임으로 가져오는 개발용 플러그인입니다. 가져오기마다 기존 작업 아래에 새 행을 만들고, 페이지를 왼쪽에서 오른쪽으로 배치한 뒤 그 행에 별도 Flow를 연결합니다.

## 처음 준비하기

Figma Desktop이 필요합니다. 저장소에는 빌드된 `dist/code.js`와 `dist/ui.html`이 포함되어 있습니다. 사용자는 Node.js 설치나 빌드 없이 바로 등록할 수 있습니다. HTML 분석과 캡처는 Figma 플러그인 내부에서 처리합니다.

최초 등록, 기존 설치 업데이트와 이전 버전 복구는 [공통 설치 안내](../../../figma-plugins/README.md)를 따르세요. 컴퓨터 사용 자동화가 없다면 사용자가 Figma 안에서 등록과 가져오기를 진행합니다.

소스를 수정하는 유지 관리자는 Node.js 22 이상에서 `npm ci && npm test && npm run typecheck && npm run build`를 실행하고 변경된 `dist/code.js`, `dist/ui.html`도 함께 커밋합니다. CI가 빌드 결과의 최신 상태를 검사합니다.

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
- ZIP과 압축 해제된 파일을 합쳐 40 MB, HTML 페이지 100개, 페이지당 DOM 요소 5000개, 래스터 이미지 100개로 제한합니다. ZIP 경로 이탈을 거절합니다. 외부 웹 리소스는 가져오지 않고 경고를 표시합니다.

행과 페이지 ID는 Figma의 shared plugin data에 저장합니다. 이 데이터는 다른 플러그인도 읽을 수 있으므로 비밀 정보는 저장하지 않습니다.

## 검증 범위

자동 테스트는 입력 계약, ZIP 안전성, 브라우저 내부 HTML 캡처와 실제 썸네일, 숨겨진 페이지의 레이아웃 복원, 폰트 대체, 가로 행과 Flow, 오류 복구, 3단계 UI를 검사합니다. 테스트 실행에는 `npx playwright install chromium && npm test`가 필요합니다. 추석 덱 10장의 썸네일을 브라우저와 Figma Desktop에서 확인했고, Figma에서 10개 프레임과 Prototype의 Flow 시작점·클릭 연결이 생성되는 것을 확인했습니다. 이 기계의 Figma에서는 `Pretendard Variable`을 사용할 수 없어 `Noto Sans KR`로 대체됐으며 결과 화면에 해당 사실이 표시됐습니다. 이후 추가한 글줄·Flow·모달 수정은 자동 검사와 새 Figma 가져오기로 확인합니다.

[Figma 개발 플러그인 등록](https://help.figma.com/hc/en-us/articles/360042786733-Create-a-plugin-for-development), [매니페스트](https://developers.figma.com/docs/plugins/manifest/), [네트워크 요청](https://developers.figma.com/docs/plugins/making-network-requests/), [조직 내부 배포](https://help.figma.com/hc/en-us/articles/4404228629655-Create-internal-plugins-for-an-organization)를 참고했습니다.

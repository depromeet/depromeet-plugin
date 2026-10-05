# AI 플러그인 설치

`depromeet-plugin`을 설치하면 Claude Code 또는 Codex가 발표자료 제작과 사용 안내에 필요한 스킬을 찾을 수 있습니다. 아래에서는 사용할 프로그램 하나에만 설치하면 됩니다. Figma 도구 설치는 [별도 안내](figma-setup.md)를 따릅니다.

## 준비

Claude Code 또는 Codex가 설치되어 있고, 계정으로 사용할 수 있는 상태여야 합니다. 이 페이지는 해당 제품 자체의 계정 생성·설치를 다루지 않습니다. 명령을 실행하는 프로그램이 준비되지 않았다면 팀 담당자와 먼저 확인하세요.

아래 명령은 **터미널**에 입력합니다. 터미널은 컴퓨터에 글로 된 명령을 입력하는 앱입니다. macOS에서는 Terminal, Windows에서는 PowerShell 등의 앱을 사용합니다. AI 대화창에 붙여 넣는 요청문과 구분하세요. 사용할 프로그램에 맞는 두 줄을 한 줄씩 실행합니다.

### Claude Code를 쓰는 경우

```bash
claude plugin marketplace add depromeet/depromeet-plugin
claude plugin install depromeet-plugin@depromeet-plugins
```

### Codex를 쓰는 경우

```bash
codex plugin marketplace add depromeet/depromeet-plugin
codex plugin add depromeet-plugin@depromeet-plugins
```

첫 줄은 설치할 플러그인을 찾는 목록을 등록하고, 둘째 줄은 그 목록에서 Depromeet Plugin을 설치합니다. `command not found`나 지원하지 않는 명령이라는 오류가 나오면 설치가 끝난 것이 아닙니다. 프로그램 이름·버전과 오류 문구를 담당자에게 전달해 해당 환경의 설치 방법을 확인하세요. 위 명령은 저장소에 안내된 CLI 방식이며 제품 버전과 사용 환경에 따라 설치 화면이 다를 수 있습니다.

CLI 명령의 구성은 [Codex 플러그인 문서](https://developers.openai.com/plugins/build/plugins)를 참고할 수 있습니다. 이 설명서의 명령은 현재 작업 환경의 Claude Code·Codex 도움말과도 대조했습니다.

## 설치 확인

설치를 마친 프로그램에서 새 AI 대화를 열고 요청합니다.

```text
depromeet-plugin의 navigate-guide를 사용해 처음 시작하는 방법을 안내해줘.
```

스킬을 찾는지, 사용 안내를 읽을 수 있는지 확인합니다. 읽기 도구나 네트워크가 없으면 AI가 문서 링크만 제공할 수 있습니다. 이 경우 [처음 시작하기](../onboarding.md)를 직접 읽으세요.

[사용 안내 목록으로 돌아가기](../README.md)

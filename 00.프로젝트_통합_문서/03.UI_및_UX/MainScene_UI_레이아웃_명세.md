# MainScene UI 레이아웃 명세 (Main Menu Scene)

> **[문서 목적]** 본 명세서는 MainScene(타이틀/메인 메뉴 화면)의 UI 레이아웃과 구성 요소를 Unity MCP 하이어라키 조회를 통해 정확하게 기술한 명세서입니다.

## 0. 기획 의도 (Design Intent)
> 메인 메뉴는 플레이어가 게임에 처음 진입할 때 마주치는 첫 인상입니다. 로고 애니메이션과 배경에 자동으로 NPC가 전시되는(`NPCShowcaseAnimator`) 구성을 통해, 타이틀 화면 자체에서 이미 '마왕물산의 다양한 종족 직원들'이라는 세계관을 직관적으로 전달하는 것이 목적입니다.

---

## 1. 씬 구성 요약

| 구성 오브젝트 | 역할 |
| :--- | :--- |
| `====System====/MainUIManager` | `MainUIController.cs` — 메인 메뉴 전반의 상호작용 제어 |
| `====System====/AudioManager` | `AudioManager.cs` — BGM 재생 |
| `====UI====/Canvas_MainMenu` | 메인 메뉴 전체 UI 캔버스 |
| `[System_Logger]` | `LogToFileManager.cs` — 개발용 로그 파일 저장 (포트폴리오 비공개 대상) |

---

## 2. Canvas_MainMenu 하이어라키 (실측)

```
Canvas_MainMenu (RectTransform, Canvas, CanvasScaler, GraphicRaycaster, AudioSource)
├── Background          — 전체 배경 이미지
├── MainBG              — 메인 배경 이미지 (로고 뒤 배경)
├── Logo                — 게임 타이틀 로고 이미지 (Animator 포함 — 등장 애니메이션)
├── NPC_Panel           — NPC 쇼케이스 이미지 (NPCShowcaseAnimator — 자동 NPC 전환)
├── Menu_Group          — 메인 버튼 그룹 컨테이너 (Image)
│   ├── Btn_Start       — [새 게임 시작] 버튼 (Button, EventTrigger)
│   ├── Btn_Continue    — [이어 하기] 버튼 (Button, EventTrigger)
│   ├── Btn_Setting     — [설정] 버튼 → SettingPopup 호출 (Button, EventTrigger)
│   └── Btn_Quit        — [종료] 버튼 (Button, EventTrigger)
├── Btn_Credit          — [크레딧] 버튼 → CraditPopup 호출 (Button, EventTrigger)
└── Btn_Achievement     — [업적] 버튼 → 업적 UI 호출 (Button, EventTrigger) [구현 예정]
```

---

## 3. 주요 컴포넌트 설명

### 3.1. NPC_Panel + NPCShowcaseAnimator
- **스크립트**: `NPCShowcaseAnimator.cs`
- **역할**: 타이틀 화면에서 게임 내 등장하는 다양한 종족 NPC의 스프라이트를 주기적으로 자동 전환하며 전시합니다.
- **목적**: 플레이어가 메뉴에서도 게임의 세계관(다양한 종족의 마왕물산 직원)을 자연스럽게 인식하도록 유도합니다.

### 3.2. Logo + Animator
- **컴포넌트**: `Image`, `Animator`
- **역할**: 씬 진입 시 로고 등장 애니메이션(페이드인 또는 슬라이드) 재생.

### 3.3. 연결 팝업 목록
| 버튼 | 호출 팝업/씬 |
| :--- | :--- |
| `Btn_Start` | `GameScene` 로드 (새 세이브 생성) |
| `Btn_Continue` | `GameScene` 로드 (기존 세이브 불러오기) |
| `Btn_Setting` | `SettingPopup` |
| `Btn_Quit` | 앱 종료 |
| `Btn_Credit` | `CraditPopup` |
| `Btn_Achievement` | 업적 UI (기획 전용, 현재 빌드 미완성) |

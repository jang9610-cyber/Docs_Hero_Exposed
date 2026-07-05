# 엔딩 분기 및 EndScene UI 명세 (Ending & EndScene Specification)

> **[문서 목적]** 본 명세서는 5일차 종료 시 실행되는 엔딩 분기 판별 로직(`SettlementController.DetermineEndingType()`)과 `EndScene` UI 구조를 코드 기반으로 정확하게 기술합니다.

## 0. 기획 의도 (Design Intent)
> 엔딩 시스템은 5일간의 플레이어 행동 결과가 단순한 점수가 아닌 **"어떤 사람이었는지"를 정의하는 심판**이 되도록 설계되었습니다.
> 두 개의 독립적인 축(신뢰 vs 비자금)으로 엔딩을 판별함으로써, 단일 지표가 아닌 **2x2 매트릭스 구조**로 플레이어의 도덕적 선택을 평가합니다.
> "영앤리치"라는 최상위 엔딩은 '완벽한 줄타기'를 요구하여 리플레이어빌리티를 높이고, 어떤 플레이스타일도 의미 있는 결말을 맺을 수 있도록 4종의 분기를 설계했습니다.

---

## 1. 엔딩 분기 판별 로직 (`DetermineEndingType()`)

`SettlementController.LeaveWork()`에서 `DayState > normalModeDate(5)` 조건이 충족되면 호출됩니다.

### 1.1. 판별 기준 수치 (StaticData 실측값)

| 기준 필드 | 실제 임계값 | 비교 대상 (SaveData) |
| :--- | :--- | :--- |
| `brideThreshold` | **2,000G** | `saveData.TotalBribe` (5일 누적 비자금) |
| `ejectsThreshold` | **15** | `saveData.trustPoint` (5일 누적 신뢰 포인트) |

### 1.2. 엔딩 분기 매트릭스 (코드 기반)

| 비자금 (TotalBribe) \ 신뢰 (trustPoint) | >= 15 (합격) | < 15 (불합격) |
| :--- | :---: | :---: |
| **>= 2,000G** | 👑 영앤리치 (`Ending_True`) | 💀 카르텔 (`Ending_Bad`) |
| **< 2,000G** | 👔 우수 사축 (`Ending_Normal`) | 🗑️ 해고 (`Ending_Fire`) |

> **별도 파산 조건**: `LeaveWork()`에서 엔딩 분기 전에 `saveData.TotalMoney < 0`을 먼저 체크. 자금이 마이너스가 되면 어떤 조건과 무관하게 즉시 `Ending_Fire`로 강제 전환.

---

## 2. 엔딩 4종 상세 명세

### 2.1. 👑 영앤리치 (Ending_True) — "완벽한 줄타기"
- **발동 조건**: `TotalBribe >= 2000 AND trustPoint >= 15`
- **컷씬 타입**: `CutSceneType.Ending_True`
- **게임적 의미**: 뇌물도 충분히 챙기면서 보안 업무도 충실히 수행한 최상위 결말. 시스템을 완전히 이해하고 전략적으로 플레이한 플레이어의 엔딩.
- **달성 난이도**: 매우 어려움. 밀수꾼(Smuggler) NPC를 전략적으로 통과시키면서 감사관(Inspector) NPC를 정확히 솎아내야 함.

### 2.2. 💀 카르텔 (Ending_Bad) — "보안 붕괴"
- **발동 조건**: `TotalBribe >= 2000 AND trustPoint < 15`
- **컷씬 타입**: `CutSceneType.Ending_Bad`
- **게임적 의미**: 뇌물을 무분별하게 수수하여 회사 보안이 붕괴된 결말. '악'의 선택을 일관되게 추진한 플레이어의 엔딩.

### 2.3. 👔 우수 사축 (Ending_Normal) — "가난한 충견"
- **발동 조건**: `TotalBribe < 2000 AND trustPoint >= 15`
- **컷씬 타입**: `CutSceneType.Ending_Normal`
- **게임적 의미**: 청렴하게 업무를 수행했지만 돈이 없어 회사에 예속된 결말. '선'의 선택을 일관되게 추진한 플레이어의 엔딩.

### 2.4. 🗑️ 해고/파산 (Ending_Fire) — "토사구팽"
- **발동 조건 A**: `TotalBribe < 2000 AND trustPoint < 15`
- **발동 조건 B**: `saveData.TotalMoney < 0` (자금 마이너스)
- **컷씬 타입**: `CutSceneType.Ending_Fire`
- **게임적 의미**: 뇌물도 못 챙기고 업무도 못한 최하위 결말. 또는 감사관 벌금 등으로 파산한 결말.

---

## 3. 씬 전환 흐름 (엔딩 진입 경로)

```
SettlementController.LeaveWork()
    ├── [파산 체크] saveData.TotalMoney < 0
    │       → CutSceneManager.ChooseCutScene(Ending_Fire)
    │       → SceneController.EndCutSceneLoad()
    │
    ├── [5일차 완료] sessionData.DayState > staticData.normalModeDate(5)
    │       → DetermineEndingType() → CutSceneType 결정
    │       → CutSceneManager.ChooseCutScene(endingType)
    │       → SceneController.EndCutSceneLoad()  ← CutScene 씬 로드
    │                                              ← EndScene 씬 로드
    │
    └── [일반 다음 날] SceneController.GameSceneLoad()
```

> **CutScene 경유**: 엔딩 분기는 `EndScene`으로 직접 가지 않고, `CutScene`을 거쳐 해당 엔딩 연출을 재생한 후 `EndScene`에 도달합니다.

---

## 4. EndScene UI 레이아웃 (실측 하이어라키)

```
EndScene
├── [전역 매니저들] (GameScene/SettlementScene과 동일 구성)
│   SceneManager, DataManager, GlobalUIManager, AudioManager, VFX_Managers, GameManager
│
└── ====UI====
    └── Canvas_Endding (RectTransform, Canvas, CanvasScaler, GraphicRaycaster, AudioSource)
        ├── BG_Overlay          — 배경 이미지 오버레이
        ├── Global Volume       — URP Volume (포스트 프로세싱 효과)
        ├── Txt_Title           — 엔딩 제목 텍스트 (TextMeshProUGUI) [기본 비활성]
        └── Grp_Buttons         — 버튼 그룹 컨테이너
            ├── Btn_Restart     — [다시 시작] 버튼 (Button, EventTrigger)
            ├── Btn_Menu        — [메인 메뉴] 버튼 (Button, EventTrigger)
            └── Btn_Exit        — [게임 종료] 버튼 (Button, EventTrigger)
```

### 4.1. EndUIManager 핵심 동작

- **스크립트**: `EndUIManager.cs` (`DataConector` 상속, `IPanelBase` 구현)
- **`Awake()` 시 자동 실행**: `RequestRemoveSavedata()` → 세이브 파일 자동 삭제. 다음 게임 실행 시 새 게임으로 시작되도록 보장.
- **`Btn_Restart`**: `RequestResetGame()` → `RequestStartGame()` → 새 게임 시작
- **`Btn_Menu`**: `OnMainMenuRequested` 이벤트 발행 → `MainScene` 전환
- **`Btn_Exit`**: `RequestQuit()` → 앱 종료

### 4.2. `Txt_Title` 비활성 상태
- 현재 `Txt_Title`은 기본 비활성(`activeSelf: false`) 상태입니다.
- 엔딩별 타이틀 텍스트 표시는 `CutScene` 연출에서 처리되는 것으로 보이며, `EndScene` 자체에서는 버튼 UI만 표시됩니다.

---

## 5. 엔딩 달성 전략 가이드 (플레이어 참고용)

| 목표 엔딩 | 핵심 전략 |
| :--- | :--- |
| 영앤리치 | 밀수꾼(Smuggler) PASS → 뇌물 500G/회 × 4회 이상 + 감사관 반드시 EJECT |
| 카르텔 | 밀수꾼 무조건 PASS + 감사관/마족 무시 → 신뢰 하락 감수 |
| 우수 사축 | 모든 마족 PASS, 모든 인간 EJECT, 밀수꾼/감사관 정확 처리 |
| 파산 방지 | 감사관 PASS(신뢰 -5) 최소화, 일일 세금 200G 고려한 수지 관리 |

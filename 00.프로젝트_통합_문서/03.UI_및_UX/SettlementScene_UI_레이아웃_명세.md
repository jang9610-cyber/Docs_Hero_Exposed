# SettlementScene UI 레이아웃 명세 (정산 씬)

> **[문서 목적]** 본 명세서는 SettlementScene(일일 정산 및 상점 씬)의 UI 레이아웃과 구성 요소를 Unity MCP 하이어라키 조회를 통해 정확하게 기술한 명세서입니다.

## 0. 기획 의도 (Design Intent)
> 정산 씬은 하루의 심문 결과를 확인하고 내일을 준비하는 '리셋 포인트'입니다. 단순한 점수 집계 화면이 아닌, 상점(자판기)을 통한 아이템 구매와 정산 로그 확인이 동시에 가능한 구조로 설계하여, 플레이어가 '다음 날 전략을 세우는 시간'으로 느끼도록 합니다. 모니터 줌인(`Pnl_MonitorZoomBG`)이라는 연출을 통해 씬 전환 없이 정보 집중 모드로 전환하는 느낌을 줍니다.

---

## 1. 씬 구성 요약

| 구성 오브젝트 | 스크립트 | 역할 |
| :--- | :--- | :--- |
| `SettlementManager` | `SettlementController.cs`, `AudioSource` x2 | 정산 씬 전체 로직 제어, BGM/SFX 재생 |
| `Canvas_Settlement` | — | 전체 정산 UI 캔버스 |
| 글로벌 매니저들 | `DataManager`, `AudioManager`, `SceneController` 등 | GameScene과 동일한 전역 매니저 구성 |

---

## 2. Canvas_Settlement 하이어라키 (실측)

```
Canvas_Settlement (RectTransform, Canvas, CanvasScaler, GraphicRaycaster, CanvasGroup)
└── Pnl_MonitorZoomBG  (RectTransform, CanvasRenderer, Image)   — 모니터 줌인 배경 패널
    ├── Panel_SettlementBox   (RectTransform, Image, CanvasGroup, VFX_UI_Helper)
    │   ├── Txt_SettlementLog      — 일일 정산 결과 텍스트 (TextMeshProUGUI)
    │   ├── Grp_BtnContainer       — 판정 결과 요약 버튼 컨테이너 (Image)
    │   │   ├── [PASS 판정 요약 버튼 등]
    │   │   └── [EJECT 판정 요약 버튼 등]
    │   └── Btn_CloseSettlement    — 정산 닫기 버튼 (Button)
    ├── ShopIcon    — 상점(자판기) 전환 아이콘 버튼 (Button)
    └── SettleIcon  — 정산 내역 확인 전환 아이콘 버튼 (Button)
```

> **[참고]** `ShopIcon`과 `SettleIcon`은 탭처럼 동작하여 `Panel_SettlementBox` 내 콘텐츠를 전환합니다.

---

## 3. 주요 요소 설명

### 3.1. Pnl_MonitorZoomBG (모니터 줌인 배경)
- **컴포넌트**: `RectTransform`, `CanvasRenderer`, `Image`
- **역할**: 정산 씬 진입 시, 마치 경비실 모니터 화면으로 카메라가 줌인하는 것처럼 보이는 배경 패널. `CanvasGroup`을 통한 페이드인 효과가 적용됩니다.

### 3.2. Panel_SettlementBox (정산 박스)
- **컴포넌트**: `RectTransform`, `Image`, `CanvasGroup`, `VFX_UI_Helper`
- **역할**: 정산 결과 텍스트와 아이템 목록, 닫기 버튼을 담은 메인 컨텐츠 박스.
- **VFX_UI_Helper**: DOTween 기반 UI 등장/퇴장 애니메이션 적용을 위한 헬퍼 컴포넌트.

### 3.3. Txt_SettlementLog (정산 텍스트)
- **컴포넌트**: `TextMeshProUGUI`
- **역할**: 해당 날의 PASS/EJECT 판정 통계, 획득 재화, 소비 재화, 현재 잔고 등을 텍스트로 출력합니다.

### 3.4. ShopIcon / SettleIcon (탭 전환 버튼)
- **컴포넌트**: `Image`, `Button`
- **역할**: 두 아이콘 버튼으로 정산 보기(SettleIcon)와 상점 보기(ShopIcon)를 전환합니다. 상점을 선택하면 자판기 팝업(`Canvas_Shop`)을 호출합니다.

### 3.5. Btn_CloseSettlement (정산 닫기 버튼)
- **컴포넌트**: `Image`, `Button`
- **역할**: 정산을 완료하고 다음 날(`GameScene`)로 씬을 전환하는 버튼.

---

## 4. SettlementScene 전용 매니저
- **`SettlementController.cs`**: 정산 데이터 로드, UI 업데이트, 상점 연동, 씬 전환 제어를 담당하는 정산 씬 전용 컨트롤러.
- AudioSource가 2개(`SettlementManager`에 직접 부착): BGM 채널과 SFX 채널을 분리하여 정산 BGM과 버튼 클릭음을 독립적으로 제어합니다.

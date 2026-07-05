# VFX 및 라이팅 연출 명세 (VFX & Lighting Specification)

> **[문서 목적]** 본 명세서는 GameScene 내 시각적 연출 시스템(파티클, 라이팅, 주기적 깜빡임 등)에 대한 기술 명세입니다. Unity MCP를 통해 확인한 실제 하이어라키 및 컴포넌트 정보를 기반으로 작성되었습니다.

## 0. 기획 의도 (Design Intent)
> 시각 연출의 핵심 목표는 **[공간적 몰입감]**과 **[감성적 피로감]**을 동시에 자아내는 것입니다.
> 마왕물산 보안 데스크라는 좁고 낙후된 공간을 묘사하기 위해, 일정 주기로 깜빡이는 낡은 형광등(`FluorescentFlicker`), 흔들리는 횃불 4개(`TorchFlicker`), 그리고 공중에 떠다니는 먼지 파티클(`DustParticleUI`)을 조합하여 '살아있는 배경'을 구성했습니다.

---

## 1. 파티클 & UI VFX

### 1.1. Canvas_DustOverlay (먼지 파티클)
- **스크립트**: `DustParticleUI.cs`
- **위치**: GameScene 루트 → `Canvas_DustOverlay`
- **컴포넌트**: `Canvas`, `CanvasScaler`, `GraphicRaycaster`
- **역할**: 게임 화면 전체(Full-screen Overlay)에 먼지 부유 파티클을 표시합니다. 마왕물산 경비실의 퀴퀴하고 낙후된 공간감을 시각적으로 보강합니다.
- **연출 방식**: UI Canvas 최상단(Sort Order: Overlay)에 배치되어 다른 모든 UI 위에 렌더링됩니다.

### 1.2. Panel_FluorescentFlicker (형광등 깜빡임)
- **스크립트**: `FluorescentFlicker.cs`, `AudioSource`
- **위치**: `====UI====/Canvas_MainUI/MainUI_Panel/Panel_FluorescentFlicker`
- **컴포넌트**: `RectTransform`, `CanvasRenderer`, `Image`, `FluorescentFlicker`, `AudioSource`
- **역할**: 화면 전체를 덮는 반투명 오버레이 이미지를 주기적으로 Alpha 변화시켜 낡은 형광등이 깜빡이는 시각 효과를 구현합니다. `AudioSource`가 함께 붙어있어 깜빡임과 동시에 전기 지직거리는 효과음도 재생합니다.
- **연출 의도**: 단순히 분위기를 위한 연출이지만, 불규칙한 주기 덕분에 플레이어가 무의식적으로 화면에 집중하게 유도합니다.

---

## 2. 2D 라이팅 시스템 (`====Lighting2D====`)

GameScene에는 URP 2D 라이팅 시스템이 구성되어 있으며, 총 6개의 `Light2D` 오브젝트가 존재합니다.

| 오브젝트명 | 스크립트 | 역할 |
| :--- | :--- | :--- |
| `Light_LowBG` | ─ | 배경(`WO_LowBG`) 조명. 기본 앰비언스 라이트. |
| `Light_NPC` | `LightSwing.cs` | NPC 위에 드리워지는 조명. **진자 운동**처럼 좌우로 천천히 흔들리며 심문 분위기를 조성. |
| `Torch_Light_01` | `TorchFlicker.cs` | 횃불 1번. 불규칙한 강도(Intensity) 변화로 횃불 연소 연출. |
| `Torch_Light_02` | `TorchFlicker.cs` | 횃불 2번. |
| `Torch_Light_03` | `TorchFlicker.cs` | 횃불 3번. |
| `Torch_Light_04` | `TorchFlicker.cs` | 횃불 4번. |

### 2.1. LightSwing (NPC 조명 진자 운동)
- **스크립트**: `LightSwing.cs`
- **연출 의도**: NPC를 향해 드리워진 조명이 천천히 좌우로 흔들림으로써, 취조실 또는 심문 공간의 긴장감과 불안감을 서브리미널하게 전달합니다.

### 2.2. TorchFlicker (횃불 깜빡임)
- **스크립트**: `TorchFlicker.cs`
- **적용 대상**: `Torch_Light_01 ~ 04` (총 4개)
- **연출 의도**: 마왕물산이 근대화된 기업이지만 배경이 마계(판타지)임을 암시하는 시각적 요소. 횃불의 불규칙한 깜빡임이 형광등 깜빡임과 겹쳐 독특한 혼합 분위기를 만듭니다.

---

## 3. VFX 이벤트 시스템

씬 내 VFX 연출은 직접 스크립트 참조 대신 **이벤트 버스(Event Bus)** 방식으로 호출됩니다.

- **`VFXEvents.cs`**: VFX 트리거 이벤트를 정의하는 정적 이벤트 클래스. `GameManager` → `VFXManager_*` 간 결합도를 제거합니다.
- **`VFXManager_NPC.cs`**: NPC 관련 VFX (등장/퇴장 연출, 스프라이트 전환 등).
- **`VFXManager_Scene.cs`**: 씬 전환, EJECT 격벽 하강, 화면 암전 등 씬 레벨 연출.
- **`VFXManager_UI.cs`**: 버튼 클릭 바운스, 팝업 슬라이드인 등 UI 레벨 마이크로 애니메이션. `DOTweenUIExtensions.cs` 활용.
- **`DOTweenUIExtensions.cs`**: DOTween 라이브러리 기반 UI 애니메이션 확장 유틸. `VFXManager_UI`에서 직접 사용.

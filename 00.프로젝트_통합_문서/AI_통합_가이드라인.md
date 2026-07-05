# AI 통합 가이드라인 (Project Hero Exposed)

## 1. 프로젝트 개요 (Overview)
- **프로젝트 명:** Document_Hero_Exposed (유니티 프로젝트 명: UnityProject_Hero_Exposed)
- **핵심 씬(Scene):** `GameScene` (Build Index: 2)
- **아키텍처 패턴:** 다양한 매니저(GameManager, UIManager, DataManager 등)가 최상위 하이어라키에서 싱글톤 또는 전역 참조 형태로 관리되며, NPC와 1:1 대화(채팅)를 기반으로 하는 AI 텍스트 어드벤처/시뮬레이션 형태입니다.
- **문서화 원칙 (역기획 기반 검증):** AI는 유니티 에디터를 **읽기 전용(Read-only)**으로 접근하며, 오직 `00.프로젝트_통합_문서` 경로 내에 있는 마크다운 파일들만 수정합니다. 문서를 작성할 때는 레거시 기획서를 참고하되, 반드시 **현재 유니티 프로젝트에 실제 코드로 구현되어 작동하고 있는 내용만** 작성해야 합니다. 기획안에만 있고 실제 구현되지 않은 기능(더미 데이터, 미구현 연출 등)은 문서에 포함하지 않으며, '미구현' 같은 주석도 남기지 않고 오직 깨끗한 '실제 구현 내용'만 명세해야 합니다. 이를 위해 작성 전후로 유니티 실제 로직을 교차 검증하는 과정이 필수적입니다.

---

## 2. 하이어라키 구조 (Scene Hierarchy)
게임의 뼈대는 명확한 구역(Category)별로 분리되어 있습니다.

### 2.1 매니저 (Managers)
- **`GlobalUIManager`**: 전역 UI 상태 관리
- **`DataManager`**: 세션 데이터 및 캐릭터 정보 로드 (`LoadCharacterData`, `LoadSuperiorLog`)
- **`SceneManager`**: 씬 전환 및 컷신 관리 (`SceneController`, `LoadingManager`, `CutSceneManager`)
- **`GameManager`**: 게임 전반적 흐름 및 아이템 처리 (`ItemManager` 등)
- **`AudioManager` / `VFX_Managers`**: 시각/청각 피드백 종합 관리

### 2.2 시스템 및 UI 요소 (System & UI)
- **`====System====`**
  - **`Main Camera`**: 메인 카메라
  - **`UIManager`**: UI 요소 컨트롤러 (게임 패스/이젝트 버튼, NPC 창, 신분증, 아이템 테이블 등 맵핑)
  - **`System`**: **핵심!** `OpenAIClient`, `NPCChatManager`, `GameVFXManager`를 포함. 프롬프트 로직과 통신을 전담.
- **`====UI====`**
  - **`Canvas_MainUI`**: 실제 화면에 표시되는 UI (`Left_Area`, `Center_Area`, `Right_Area`, `Bubble_Chat` 등 구역별 패널 존재)
- **`====WorldObjects====`**
  - **`WO_NPC`**: 2D/3D 공간 상에 렌더링되는 실제 NPC 대리자 (`NPCWorldProxy`)
  - **`BG_NPC_Spawner`**: 뒷배경 NPC 스포너

---

## 3. 세션 및 플레이어 데이터 (SessionData.cs)
게임 진행은 `DataManager.instance.sessionData`에 의해 저장 및 추적됩니다.

### 주요 수치 및 변수
- **진행도**: `DayState` (현재 스테이지/일차)
- **NPC 데이터**: 
  - `npcList` (등장 인물 목록), `maxNpcNum` (기본값: 5)
  - `nowNpcIdx`, `nowNpcInfo` (현재 대화 중인 NPC 정보)
- **기록 및 자원**:
  - `correctCounts` (정답/검거 수)
  - `wrongDecision` (오판 수)
  - `passInspector` (감사관 패스 수)
  - `playerItems` (인벤토리 크기 고정: **최대 3칸**)
  - `playerMoney` (보유 자금), `trustPoint` (신뢰도), `slushFund` (비자금)

---

## 4. NPC 프롬프트 어셈블리 시스템 (NPCChatManager.cs)
NPC 대화는 미리 정의된 다양한 프롬프트 블록을 합쳐서 **하나의 시스템 프롬프트**로 완성됩니다. 

### 4.1 조립 순서 (MakePrompt())
1. **공통 규칙 (`CommonPrompt`)**: `chatRulePrompt`, `responseRulePrompt`
2. **기본 정보 (`BasicInfo`)**: NPC 이름, 종족, 직책, 목적. (기억 상실/완전한 거짓 상태일 경우 일부 누락 처리됨)
3. **타입 정보 (`NpcTypePrompt`)**: 성향에 따른 가드레일 제어 (예: 소심, 오만 등)
4. **종족 정보 (`RacePrompt`)**: `isPass` (진실/거짓) 여부에 따라 `npcInfoFormat` 또는 `fakeNpcInfoFormat` 분기
5. **오늘의 일일 정보 (`DailyMemoPrompt`)**: `DayState`에 따라 로드되며, `isPass`에 따라 `realMemoContent` 또는 `fakeMemoContent` 분기
6. **감정/스트레스 정보**: 지능 수준 및 **스트레스 수치**(`stressThreshold`)
7. **아이템 (TruthItem)**: 진실 아이템 사용 시 `[TruthItem] On` 강제 추가

### 4.2 스트레스 및 감정 시스템 (NPCEmotionState)
- **스트레스 한계치 (`MAX_STRESS`)**: `200`
- **스트레스 변화**: 플레이어와의 상호작용(AI 응답의 `stress_change` 필드)에 의해 누적 또는 감소.
- **감정 분기**: `commonPrompt.stressPrompts`의 `threshold` 기준치(절대값)와 비교하여 `EmotionType` 상태 변경. 스트레스 100 이상 시 `GameManager.instance.TriggerAngryMovement()` 호출 가능.

---

## 5. 작업 방식 요약 (How to Work)
1. 기능 추가/수정을 위한 사전 조사 시, 반드시 MCP를 활용해 읽기 전용 접근을 진행할 것 (`manage_asset`의 `search` 및 `read` 활용).
2. NPC의 대화 패턴이나 종족 설정값 수정은 `01.프롬프트_기획/` 내의 템플릿을 기반으로 기획 의도를 먼저 수정한 후, 유니티 에디터(수동)에서 변경하도록 유도.
3. 스크립트 명세 및 추가 구조 문서는 `02.시스템_및_구현/` 폴더 내에 저장.

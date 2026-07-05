# [Dev] 표준 변수 딕셔너리 (Standard Variable Dictionary)

**대상:** PM(이남기), 개발(강다영), 디자인(심수영)
**목적:** 기획-개발 간 용어 혼선 방지 및 데이터 무결성 확보 (Single Source of Truth)
**규칙:** 모든 변수명은 **CamelCase** 또는 **PascalCase**를 따르며, 띄어쓰기 대신 대문자로 구분합니다.

---

## 🏛️ 1. 핵심 시스템 변수 (Core System Variables)

| 의미 (한글) | 표준 변수명 (English) | 데이터 타입 | 설명 |
| :--- | :--- | :---: | :--- |
| **보안 평점** | `TrustPoint` | Float | 플레이어의 신뢰도 수치 (0 ~ 100). |
| **누적 비자금** | `TotalBribe` | Int | 엔딩 판정용 누적 뇌물 획득액. |
| **현재 잔액** | `CurrentGold` | Int | 상점에서 사용 가능한 [월급 + 비자금] 합산액. |
| **일일 수당** | `DailySalary` | Int | 업무 종료 시 지급되는 기본 급여. |
| **질문 카운트** | `QuestionCount` | Int | 현재 NPC에게 수행한 질문 횟수. (Max: 5) |

---

## 👹 2. NPC/캐릭터 관련 변수 (NPC Data Variables)

| 의미 (한글) | 표준 변수명 (English) | 데이터 타입 | 설명 |
| :--- | :--- | :---: | :--- |
| **종족** | `Species` | Enum/String | 오크, 다크 엘프, 구울 등 생물학적 분류. |
| **지능** | `Intelligence` | Int | AI 답변의 치밀도 및 논리적 난이도 자원. |
| **스트레스** | `Stress` | Float | 현재 NPC의 정신적 압박 상태. |
| **임계치** | `StressThreshold` | Float | `Stress`가 이 수치를 넘으면 정체가 노출됨. |
| **뇌물 제시액** | `OfferAmount` | Int | 밀수꾼 NPC가 최초 제시하는 뇌물 액수. |

---

## 📁 3. 아이템 관련 변수 (Item Data Variables)

| 의미 (한글) | 표준 변수명 (English) | 데이터 타입 | 설명 |
| :--- | :--- | :---: | :--- |
| **아이템 ID** | `ItemID` | String | 아이템 고유 코드 (예: ITM_01). |
| **구매가** | `Price` | Int | 상점 판매 가격. |
| **효과값** | `EffectValue` | Float | 아이템 사용 시 변화되는 수치량. |
| **효과 대상** | `EffectTarget` | Enum | 적용될 타겟 변수 (예: TrustPoint, QuestionLimit). |

---

## 🛠️ 4. 가이드라인 (Usage Rule)

1.  **기획서 작성 시:** 앞으로 모든 기획서에서 명칭을 언급할 때 "보안 평점" 혹은 "TrustPoint"로 고정하여 사용합니다. (Security Rating 금지)
2.  **코드 구현 시:** 다영님은 위 표의 변수명을 `SerializeField` 또는 `JSON Key`로 그대로 사용해 주세요.
3.  **데이터 추가 시:** 새로운 변수가 필요할 경우 이 문서에 먼저 등록한 뒤 사용합니다.

---
*최종 업데이트: 2026-03-23*
*관리: Antigravity (AI Co-PM)*

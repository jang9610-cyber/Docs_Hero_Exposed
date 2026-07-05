# [Dev] 마스터 데이터 사양서 및 JSON 가이드라인 (v1.0)

**대상:** 강다영 레이서 (개발 담당)
**작성:** 이남기 PM (기획 담당 / Antigravity 서포트)
**목적:** 기획된 수치를 유니티 엔진 및 Gemini API에서 활용 가능하도록 데이터 구조화(JSON) 명세

---

## 🏗️ 1. 캐릭터 데이터 구조 (CharacterData.json)

캐릭터의 기본 정보 및 심문 로직에 사용되는 사양입니다. 다영님은 이를 `ScriptableObject`나 `List<Character>` 형태로 활용해 주세요.

```json
{
  "characters": [
    {
      "id": "NPC_01",
      "name": "오크",
      "species": "Orc",
      "Intelligence": 30,
      "stressThreshold": 40,
      "dialogueComplexity": "Low",
      "contradictionType": "Explicit",
      "isBribable": false,
      "systemPrompt": "너는 무식하지만 일은 잘하는 오크 수리공이야. 반말을 쓰고 투박하게 대답해."
    },
    {
      "id": "NPC_08",
      "name": "밀수꾼",
      "species": "Random",
      "Intelligence": 75,
      "stressThreshold": 50,
      "dialogueComplexity": "Mid",
      "contradictionType": "Behavior",
      "isBribable": true,
      "offerAmount": 8000
    }
  ]
}
```

### **[Data Dictionary]**
*   `Intelligence`: Gemini Prompt의 논리력 세팅 및 답변 치밀도 제어값 (0~100).
*   `stressThreshold`: `Flustered` 표정으로 변하는 기준값.
*   `contradictionType`: 추리 난이도 (명시적: 오타 찾기 / 암시적: 논리적 지식 대조).
*   `isBribable`: `true`일 경우에만 매수 로직 트리거.

---

## 📅 2. 레벨 및 시스템 설정 (LevelSettings.json)

일차별 난이도 흐름과 시스템 제약 사항을 정의합니다.

```json
{
  "globalSettings": {
    "maxQuestionCount": 5, 
    "baseDailySalary": 500,
    "incorrectJudgmentPenalty": 250
  },
  "dayProgression": [
    {
      "day": 1,
      "npcPool": ["NPC_01", "NPC_04"],
      "appearanceWeight": [0.8, 0.2],
      "newRuleIntroduced": "Basic ID Check"
    },
    {
      "day": 7,
      "npcPool": ["NPC_03", "NPC_06", "NPC_07"],
      "appearanceWeight": [0.3, 0.4, 0.3],
      "newRuleIntroduced": "Final Inquisitor Audit"
    }
  ]
}
```

### **[Logic Guide]**
*   `maxQuestionCount`: 모든 일차 고정 (토큰 최적화 및 전략성 강화).
*   `npcPool` & `appearanceWeight`: 해당 일차에 어떤 몬스터가 어떤 확률로 나올지 결정하는 확률 풀(Pool).

---

## 💰 3. 경제 및 엔딩 판정 변수 (Economy_Ending.json)

플레이어의 게임 상태를 저장하고 엔딩을 판정하는 핵심 변수입니다.

```json
{
  "endingThresholds": {
    "bribeAccumulatedMax": 50000,
    "trustPointPassMin": 60,
    "endings": [
      { "id": "End01", "name": "실업급여는 없습니다", "condition": "Bribe < 50k && Trust < 60" },
      { "id": "End02", "name": "이달의 우수 사축", "condition": "Bribe < 50k && Trust >= 60" },
      { "id": "End03", "name": "어둠의 카르텔", "condition": "Bribe >= 50k && Trust < 60" },
      { "id": "End04", "name": "영앤리치", "condition": "Bribe >= 50k && Trust >= 60" }
    ]
  }
}
```

---

## 3. 아이템 데이터 및 상점 규격 (ItemData.json)

플레이어가 상점에서 구매하고 심문 과정에서 **NPC에게 사용하여** 보너스 질문을 획득하는 구조입니다.

```json
{
  "items": [
    {
      "itemID": "ITM_01",
      "itemName": "진실의 elixir",
      "price": 5000,
      "effectTarget": "QuestionCount",
      "effectValue": 2,
      "targetSubject": "NPC",
      "description": "몬스터가 가장 환장하는 기밀 음료. 대접 시 황홀경에 빠져 경계심이 풀리며 질문 2회를 더 허용합니다."
    }
  ]
}
```

---

## 4. Gemini API 응답 규격 (Response Schema)

NPC와의 대화 결과로 수신되는 동적 데이터 구조입니다. 다영님은 이를 통해 **실시간 대사 출력** 및 **UI 연출(감정 변화)**을 제어해 주세요.

```json
{
  "dialogue": "오오, 마왕님의 은총이 가득하시길... 면접 준비는 철저히 했습니다.",
  "status": {
    "emotional_state": "nervous", 
    "suspicion_level": 15,
    "thought": "들키면 안 돼... 성수 냄새가 아직 나진 않겠지?"
  },
  "metadata": {
    "speaker": "NPC_01",
    "habit_triggered": "empathy_slip"
  }
}
```

### **[Field Description]**
*   `dialogue`: 플레이어 화면에 출력될 최종 대사.
*   `emotional_state`: 유니티 쉐이더(lilToon) 트리거용 감정 태그 (`calm`, `nervous`, `panicked` 등).
*   `suspicion_level`: AI가 스스로 판단한 자신의 정체 탄로 수치 (0-100).
*   `thought`: NPC의 내부 속마음 (디버깅용, 유저에게 미노출).

---

## 🛠️ 5. 개발자를 위한 가이드 (Implementation Note)

1.  **데이터 확장성:** 새로운 캐릭터나 아이템이 추가되더라도 `CharacterData.json`만 수정하면 되도록 유연하게 설계해 주세요.
2.  **API 연동 시:** `Intelligence`와 `dialogueComplexity` 수치를 Gemini API의 `Temperature` 및 `Max_Tokens` 파라미터와 연산하여 답변의 인상을 조절해 주세요.
3.  **UI 연동:** `maxQuestionCount`는 플레이어 화면 상단에 5개의 게이지(총알 모양 등)로 시각화해 주세요.

---
*최종 업데이트: 2026-03-23*
*관리: Antigravity (AI Co-PM)*

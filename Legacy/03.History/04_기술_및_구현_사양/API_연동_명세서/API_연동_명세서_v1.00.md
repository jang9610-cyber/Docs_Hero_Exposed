# Gemini API Response Schema Specification (DV-01)

## 📋 개요
NPC와의 대화 결과로 단순 텍스트만 받는 것이 아니라, 시스템적으로 활용 가능한 감정 상태, 용사 의심도 등을 정형화된 JSON 데이터로 수신합니다.

## 🛠 JSON Schema 정의

```json
{
  "dialogue": "오오, 마왕님의 은총이 가득하시길... 면접 준비는 철저히 했습니다.",
  "status": {
    "emotional_state": "nervous", 
    "suspicion_level": 15,
    "thought": "들키면 안 돼... 성수 냄새가 아직 나진 않겠지?"
  },
  "metadata": {
    "speaker": "Loktar",
    "habit_triggered": "empathy_slip"
  }
}
```

### 필드 설명
- **dialogue**: 플레이어에게 노출될 실제 대사.
- **status.emotional_state**: NPC의 현재 감정 (calm, nervous, angry, panicked 등). UI 연출(초상화 변경 등)에 사용.
- **status.suspicion_level**: AI가 판단한 스스로의 '들통 확률' (0-100). 내부 로직에서 난이도 조절에 활용.
- **status.thought**: NPC의 속마음 (플레이어에게 보이지 않음). 디버깅 및 프롬프트 정확도 확인용.
- **metadata.habit_triggered**: 이번 대답에서 노출된 '용사 특유의 습관' 태그.

---

## 📜 Revision History
| 날짜 | 시간 | 버전 | 수정 내용 |
| :--- | :--- | :--- | :--- |
| 2026-03-17 | 14:05 | v1.0 | 초기 API 인터페이스 명세서(JSON) 작성 |
| 2026-03-18 | - | - | [보존/복구] 파일 한글화 및 폴더 구조 재편성 |

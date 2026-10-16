# 마켓 인사이트 소비자물가(CPI) 26년 9월 최신화 및 1개월 밀림 버그 수정 계획

## 1. 개요 및 목적
1. **소비자물가(CPI) 2026년 9월 최신 데이터 동기화**:
   - 10월 14일 공식 발표된 미국 9월 CPI 확정치(3.74%)를 정적 파일 및 동적 API에 반영.
2. **런타임 1개월 밀림(Shift) 버그 원천 해결**:
   - FRED 공식 CSV에서 관측월(`2026-09-01`)을 수집했을 때 1개월 차감하던 로직을 수정하여, 매월 새로운 데이터 수집 시 날짜가 왜곡되지 않고 정상 축적되도록 엔진 개선.

---

## 2. 버그 발생 메커니즘 및 개선 구조 (Mermaid)

```mermaid
flowchart TD
  subgraph AS_IS["[기존 로직: 1개월 차감 버그 발생]"]
    A1["FRED 최신 데이터 수집<br/>date: 2026-09-01, value: 3.74%"] --> A2["Date 객체 변환 후 1개월 차감 ❌<br/>d.setUTCMonth(d.getUTCMonth() - 1)"]
    A2 --> A3["날짜가 '2026.08'로 왜곡됨"]
    A3 --> A4["차트 2026.08 자리에 3.74% 덮어씀 ⚠️<br/>(2026.09 포인트 미생성 & 1달 밀림)"]
    A3 --> A5["요약 카드는 '3.74%', 차트는 '26.08'<br/>화면 간 불일치 및 사용자 혼란 유발"]
  end

  subgraph TO_BE["[개선 로직: 정밀 기준월 매핑]"]
    B1["FRED 최신 데이터 수집<br/>date: 2026-09-01, value: 3.74%"] --> B2["FRED 데이터 판별 분기 ✅<br/>관측월 그대로 YYYY.MM 추출 (2026.09)"]
    B3["캘린더 이벤트 발표일 수집<br/>date: 2026-10-14"] --> B4["발표일인 경우에만 1개월 차감<br/>10월 발표 ➔ 9월 데이터 (2026.09)"]
    B2 --> B5["정확한 2026.09 포인트 생성<br/>8월은 3.40%, 9월은 3.74% 안착"]
    B4 --> B5
    B5 --> B6["요약 카드와 5년 차트가 모두<br/>2026년 9월(3.74%)로 100% 일치"]
  end
```

---

## 3. 세부 작업 내역
1. `src/utils/marketCalendarSync.ts`:
   - FRED 관측월(`cpiDate`, `unemploymentDate`) 직접 매핑 분기 추가 (`isCpiObservationMonth`).
2. `src/data/marketCalendar.ts`:
   - `MACRO_SUMMARY_ITEMS`: 소비자물가 3.74% 최신화.
   - `MACRO_ASSET_CHARTS.CPI_YOY`: 3.74%, 5년 변동폭 -1.65%p, 2026.09 포인트 추가(60개월 슬라이딩 유지).
3. `src/app/api/market/daily/route.ts` & `src/components/calendar/MarketWeatherSection.tsx`:
   - 캐시된 차트가 최신 코드 정의보다 이전 날짜일 경우 코드 정의를 우선 채택하는 방어 로직 적용.

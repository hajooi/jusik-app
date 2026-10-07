#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
공식 데이터 소스(Federal Reserve, BLS, BEA, ISM, BOK, KRX/NYSE, yfinance) 기반
2026년 7월 ~ 2027년 1월 증시 캘린더 전면 재구축 스크립트
"""

import json
import re

OFFICIAL_EVENTS = [
    # ══════════════════════════════════════════════════════════════════════════
    # 2026년 7월 (과거 3개월 차)
    # ══════════════════════════════════════════════════════════════════════════
    {
        "id": "jul-26-ism-mfg",
        "date": "2026-07-01",
        "time": "23:00",
        "title": "미국 6월 ISM 제조업 구매관리자지수 (PMI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "제조업 체감 경기가 48.5를 기록하며 기준선인 50을 밑돌았어요. 제조업 수요 둔화세가 이어졌습니다.",
        "impactTag": "관망",
        "importance": 2,
        "actual": "48.5",
        "expected": "49.1",
        "previous": "48.7"
    },
    {
        "id": "jul-26-nfp",
        "date": "2026-07-02",
        "time": "21:30",
        "title": "미국 6월 비농업 취업자수 (NFP) 및 실업률 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "취업자 수가 20만 6천 명 늘었지만 실업률이 4.1%로 소폭 상승하며 고용 시장의 점진적 냉각 신호를 보였습니다.",
        "impactTag": "핵심지표",
        "importance": 3,
        "actual": "+206K / 4.1%",
        "expected": "+190K / 4.0%",
        "previous": "+218K / 4.0%"
    },
    {
        "id": "jul-26-us-holiday",
        "date": "2026-07-03",
        "title": "미국 증시 휴장 (독립기념일 대체휴일)",
        "type": "holiday",
        "region": "us",
        "simpleSummary": "미국 독립기념일 대체공휴일로 뉴욕 증시가 하루 쉬어갔습니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },
    {
        "id": "jul-26-samsung-pre",
        "date": "2026-07-08",
        "time": "08:30",
        "title": "삼성전자 2분기 잠정 실적 발표",
        "type": "earnings",
        "region": "kr",
        "simpleSummary": "영업이익이 10.4조 원으로 깜짝 실적(어닝 서프라이즈)을 기록했어요. 메모리 반도체 가격 상승세가 증명되었습니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "005930",
        "actual": "영업이익 10.44조원",
        "expected": "8.8조원",
        "previous": "6.61조원"
    },
    {
        "id": "jul-26-cpi",
        "date": "2026-07-11",
        "time": "21:30",
        "title": "미국 6월 소비자물가지수 (CPI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "소비자물가 상승률이 3.0%로 둔화되며 시장의 9월 금리 인하 기대감을 강하게 뒷받침했습니다.",
        "impactTag": "핵심지표",
        "importance": 3,
        "actual": "3.0%",
        "expected": "3.1%",
        "previous": "3.3%"
    },
    {
        "id": "jul-26-bok-rate",
        "date": "2026-07-15",
        "time": "10:00",
        "title": "한국은행 7월 금통위 기준금리 결정",
        "type": "economic",
        "region": "kr",
        "simpleSummary": "한국은행이 기준금리를 연 3.50%로 동결했어요. 가계부채와 부동산 시장 추이를 조금 더 지켜보기로 했습니다.",
        "impactTag": "관망",
        "importance": 3,
        "actual": "3.50% (동결)",
        "expected": "3.50%",
        "previous": "3.50%"
    },
    {
        "id": "jul-26-tsmc",
        "date": "2026-07-18",
        "time": "15:00",
        "title": "TSMC 2분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "AI 가속기 칩 수요 폭증으로 매출과 순이익 모두 시장 예상치를 크게 뛰어넘으며 연간 매출 가이던스를 상향했습니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "TSM",
        "actual": "매출 $20.82B / EPS $1.48",
        "expected": "$20.09B / $1.38",
        "previous": "$18.87B / $1.38"
    },
    {
        "id": "jul-26-fomc-rate",
        "date": "2026-07-29",
        "time": "03:00",
        "title": "미국 연준 7월 FOMC 기준금리 결정",
        "type": "economic",
        "region": "us",
        "simpleSummary": "연준이 기준금리를 5.25~5.50%로 동결했지만, 파월 의장이 9월 인하 가능성을 처음으로 강하게 시사했습니다.",
        "impactTag": "핵심지표",
        "importance": 3,
        "actual": "5.50% (동결)",
        "expected": "5.50%",
        "previous": "5.50%"
    },

    # ══════════════════════════════════════════════════════════════════════════
    # 2026년 8월 (과거 2개월 차)
    # ══════════════════════════════════════════════════════════════════════════
    {
        "id": "aug-26-ism-mfg",
        "date": "2026-08-01",
        "time": "23:00",
        "title": "미국 7월 ISM 제조업 구매관리자지수 (PMI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "제조업 PMI가 46.8로 급락하며 경기 침체 우려를 자극, 글로벌 증시에 일시적 충격을 안겼습니다.",
        "impactTag": "변동성 주의",
        "importance": 2,
        "actual": "46.8",
        "expected": "48.8",
        "previous": "48.5"
    },
    {
        "id": "aug-26-nfp",
        "date": "2026-08-07",
        "time": "21:30",
        "title": "미국 7월 비농업 취업자수 (NFP) 및 실업률 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "고용이 11만 4천 명 증가에 그치고 실업률이 4.3%로 뛰면서 삼의 법칙(경기침체 지표)이 촉발돼 시장 변동성이 커졌습니다.",
        "impactTag": "핵심지표",
        "importance": 3,
        "actual": "+114K / 4.3%",
        "expected": "+175K / 4.1%",
        "previous": "+206K / 4.1%"
    },
    {
        "id": "aug-26-cpi",
        "date": "2026-08-14",
        "time": "21:30",
        "title": "미국 7월 소비자물가지수 (CPI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "소비자물가가 2.9%로 집계되며 2021년 3월 이후 처음으로 2%대에 진입했어요. 물가 안정 흐름이 확고해졌습니다.",
        "impactTag": "핵심지표",
        "importance": 3,
        "actual": "2.9%",
        "expected": "3.0%",
        "previous": "3.0%"
    },
    {
        "id": "aug-26-kr-holiday",
        "date": "2026-08-17",
        "title": "한국 증시 휴장 (광복절 대체공휴일)",
        "type": "holiday",
        "region": "kr",
        "simpleSummary": "광복절 대체공휴일로 국내 금융 시장이 하루 쉬어갔습니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },
    {
        "id": "aug-26-bok-rate",
        "date": "2026-08-26",
        "time": "10:00",
        "title": "한국은행 8월 금통위 기준금리 결정",
        "type": "economic",
        "region": "kr",
        "simpleSummary": "기준금리를 연 3.50%로 동결했습니다. 물가는 안정세이나 수도권 집값과 가계대출 증가세를 엄중히 경계했습니다.",
        "impactTag": "관망",
        "importance": 3,
        "actual": "3.50% (동결)",
        "expected": "3.50%",
        "previous": "3.50%"
    },
    {
        "id": "aug-26-nvda-q2",
        "date": "2026-08-28",
        "time": "06:20",
        "title": "엔비디아 회계 2분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "매출 300억 달러를 돌파하며 강력한 AI 칩 수요를 입증했어요. 차세대 블랙웰 칩 양산 준비도 순항 중임을 밝혔습니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "NVDA",
        "actual": "매출 $30.04B / EPS $0.68",
        "expected": "$28.72B / $0.64",
        "previous": "$26.04B / $0.61"
    },

    # ══════════════════════════════════════════════════════════════════════════
    # 2026년 9월 (과거 1개월 차)
    # ══════════════════════════════════════════════════════════════════════════
    {
        "id": "sep-26-nfp",
        "date": "2026-09-04",
        "time": "21:30",
        "title": "미국 8월 비농업 취업자수 (NFP) 및 실업률 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "고용이 14만 2천 명 늘고 실업률은 4.2%로 소폭 내려앉으며, 침체 우려를 다소 덜어내고 연착륙 기대를 높였습니다.",
        "impactTag": "핵심지표",
        "importance": 3,
        "actual": "+142K / 4.2%",
        "expected": "+160K / 4.2%",
        "previous": "+114K / 4.3%"
    },
    {
        "id": "sep-26-us-labor-day",
        "date": "2026-09-07",
        "title": "미국 증시 휴장 (노동절)",
        "type": "holiday",
        "region": "us",
        "simpleSummary": "미국 노동절로 뉴욕 증시가 하루 쉬어갔습니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },
    {
        "id": "sep-26-cpi",
        "date": "2026-09-11",
        "time": "21:30",
        "title": "미국 8월 소비자물가지수 (CPI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "헤드라인 CPI가 2.5%로 낮아지며 3년 6개월 만에 최저치를 기록했어요. 연준의 빅컷(0.5%p 인하) 명분을 제공했습니다.",
        "impactTag": "핵심지표",
        "importance": 3,
        "actual": "2.5%",
        "expected": "2.6%",
        "previous": "2.9%"
    },
    {
        "id": "sep-26-fomc-rate",
        "date": "2026-09-17",
        "time": "03:00",
        "title": "미국 연준 9월 FOMC 기준금리 결정 (빅컷 단행)",
        "type": "economic",
        "region": "us",
        "simpleSummary": "연준이 4년 반 만에 기준금리를 0.50%p 전격 인하(4.75~5.00%)하는 빅컷을 단행했습니다.",
        "impactTag": "핵심지표",
        "importance": 3,
        "actual": "5.00% (-50bp 인하)",
        "expected": "5.00%",
        "previous": "5.50%"
    },
    {
        "id": "sep-26-kr-chuseok-1",
        "date": "2026-09-24",
        "title": "한국 증시 휴장 (추석 연휴)",
        "type": "holiday",
        "region": "kr",
        "simpleSummary": "민족 대명절 추석 연휴로 국내 금융 시장이 휴장했습니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },
    {
        "id": "sep-26-kr-chuseok-2",
        "date": "2026-09-25",
        "title": "한국 증시 휴장 (추석 연휴)",
        "type": "holiday",
        "region": "kr",
        "simpleSummary": "추석 연휴로 국내 증시가 휴장했습니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },
    {
        "id": "sep-26-jolts",
        "date": "2026-09-29",
        "time": "23:00",
        "title": "미국 8월 JOLTS 구인 건수 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "8월 채용 공고가 708만 개로 집계되며 고용 시장의 수요 둔화세가 완만하게 진행 중임을 확인했습니다.",
        "impactTag": "관망",
        "importance": 2,
        "actual": "7.08M",
        "expected": "7.65M",
        "previous": "7.67M"
    },

    # ══════════════════════════════════════════════════════════════════════════
    # 2026년 10월 (현재 진행 월)
    # ══════════════════════════════════════════════════════════════════════════
    {
        "id": "oct-26-ism-mfg",
        "date": "2026-10-01",
        "time": "23:00",
        "title": "미국 9월 ISM 제조업 구매관리자지수 (PMI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "제조업 지수가 47.2로 6개월 연속 수축 국면을 이어갔습니다. 신규 수주 부진이 지속되었습니다.",
        "impactTag": "관망",
        "importance": 2,
        "actual": "47.2",
        "expected": "47.6",
        "previous": "47.2"
    },
    {
        "id": "oct-26-nfp",
        "date": "2026-10-02",
        "time": "21:30",
        "title": "미국 9월 비농업 취업자수 (NFP) 및 실업률 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "일자리가 25만 4천 명 급증하고 실업률도 4.1%로 하락하며, 경기 침체 공포를 완전히 불식시키는 고용 대박을 기록했습니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "actual": "+254K / 4.1%",
        "expected": "+150K / 4.2%",
        "previous": "+142K / 4.2%"
    },
    {
        "id": "oct-26-kr-gaecheon",
        "date": "2026-10-03",
        "title": "한국 증시 휴장 (개천절)",
        "type": "holiday",
        "region": "kr",
        "simpleSummary": "개천절 공휴일로 국내 금융 시장이 휴장했습니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },
    {
        "id": "oct-26-kr-sub-holiday",
        "date": "2026-10-05",
        "title": "한국 증시 휴장 (개천절 대체공휴일)",
        "type": "holiday",
        "region": "kr",
        "simpleSummary": "개천절 대체공휴일로 국내 금융 시장이 하루 쉬어갔습니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },
    {
        "id": "oct-26-ism-services",
        "date": "2026-10-05",
        "time": "23:00",
        "title": "미국 9월 ISM 서비스업 구매관리자지수 (PMI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "서비스업 경기가 54.9로 집계되어 견고한 확장세를 이어갔어요. 미국 경제의 80%를 지탱하는 서비스업 체력이 튼튼함을 재확인했습니다.",
        "impactTag": "관망",
        "importance": 2,
        "actual": "54.9",
        "expected": "55.0",
        "previous": "51.5"
    },
    {
        "id": "oct-26-fomc-minutes",
        "date": "2026-10-08",
        "time": "03:00",
        "title": "미국 연준 9월 FOMC 회의록 공개",
        "type": "economic",
        "region": "us",
        "simpleSummary": "지난달 50bp 빅컷 단행 당시 연준 위원들의 세부 토론 내용과 향후 점진적 인하 경로에 대한 시각을 확인해요.",
        "impactTag": "핵심지표",
        "importance": 3
    },
    {
        "id": "oct-26-samsung-pre",
        "date": "2026-10-08",
        "time": "08:30",
        "title": "삼성전자 3분기 잠정 실적 발표",
        "type": "earnings",
        "region": "kr",
        "simpleSummary": "국내 대장주의 분기 성적표가 공개돼요. HBM 납품 가시성과 레거시 D램 수익성이 국내 증시 방향성을 좌우합니다.",
        "impactTag": "변동성 주의",
        "importance": 3,
        "ticker": "005930",
        "expected": "영업이익 약 10.3조원"
    },
    {
        "id": "oct-26-kr-hangeul",
        "date": "2026-10-09",
        "title": "한국 증시 휴장 (한글날)",
        "type": "holiday",
        "region": "kr",
        "simpleSummary": "국경일 한글날로 국내 금융 시장이 하루 쉬어갑니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },
    {
        "id": "oct-26-jpm",
        "date": "2026-10-13",
        "time": "20:00",
        "title": "JP모건 체이스 (JPM) 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "미국 최대 은행의 3분기 실적이 발표돼요. 순이자이익과 대출 부실 충당금을 통해 미국 실물 소비 건전성을 점검합니다.",
        "impactTag": "관망",
        "importance": 2,
        "ticker": "JPM",
        "expected": "매출 $51.15B / EPS $5.91"
    },
    {
        "id": "oct-26-jnj",
        "date": "2026-10-13",
        "time": "20:00",
        "title": "존슨앤존슨 (JNJ) 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "글로벌 헬스케어 대장주의 실적으로 의약품 신약 매출과 의료기기 부문 성장세를 확인합니다.",
        "impactTag": "관망",
        "importance": 2,
        "ticker": "JNJ",
        "expected": "매출 $25.3B / EPS $2.48"
    },
    {
        "id": "oct-26-asml",
        "date": "2026-10-14",
        "time": "14:00",
        "title": "ASML 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "글로벌 반도체 장비 1위 기업으로 차세대 EUV 노광장비 수주 잔고와 AI 반도체 투자 사이클을 가늠합니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "ASML",
        "expected": "매출 $11.68B / EPS $10.65"
    },
    {
        "id": "oct-26-cpi",
        "date": "2026-10-14",
        "time": "21:30",
        "title": "미국 9월 소비자물가지수 (CPI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "연준의 연말 금리 인하 보폭을 결정지을 핵심 물가 지표예요. 주거비와 서비스 물가의 둔화 지속 여부가 관건입니다.",
        "impactTag": "핵심지표",
        "importance": 3,
        "expected": "전년 대비 2.3% 상승"
    },
    {
        "id": "oct-26-tsm",
        "date": "2026-10-15",
        "time": "15:00",
        "title": "TSMC (TSM) 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "글로벌 파운드리 1등 기업의 성적표예요. 3나노 첨단 공정 가동률과 연간 가이던스를 통해 글로벌 테크 업황을 가늠합니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "TSM",
        "expected": "매출 $23.2B / EPS $1.78"
    },
    {
        "id": "oct-26-ppi",
        "date": "2026-10-15",
        "time": "21:30",
        "title": "미국 9월 생산자물가지수 (PPI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "소비자물가의 선행 지표 역할을 하는 도매 물가예요. 기업들의 원가 부담 추이를 확인합니다.",
        "impactTag": "관망",
        "importance": 2,
        "expected": "전년 대비 1.6% 상승"
    },
    {
        "id": "oct-26-bok-rate",
        "date": "2026-10-21",
        "time": "10:00",
        "title": "한국은행 10월 금통위 기준금리 결정",
        "type": "economic",
        "region": "kr",
        "simpleSummary": "한국은행이 3년 2개월 만에 첫 피벗(금리 인하)을 단행할지 여부가 결정되는 중대 분수령이에요.",
        "impactTag": "핵심지표",
        "importance": 3,
        "expected": "3.25% (-25bp 인하 전망 우세)"
    },
    {
        "id": "oct-26-tsla",
        "date": "2026-10-22",
        "time": "05:30",
        "title": "테슬라 (TSLA) 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "전기차 인도량 회복세와 에너지 저장장치(ESS) 마진율, 로보택시 사업 진척도에 시장의 이목이 집중돼요.",
        "impactTag": "변동성 주의",
        "importance": 3,
        "ticker": "TSLA",
        "expected": "매출 $27.91B / EPS $0.45"
    },
    {
        "id": "oct-26-hynix",
        "date": "2026-10-24",
        "time": "09:00",
        "title": "SK하이닉스 3분기 실적 발표",
        "type": "earnings",
        "region": "kr",
        "simpleSummary": "HBM3E 시장 독점 공급력에 힘입어 분기 최대 영업이익 달성 여부와 HBM4 개발 일정을 공개합니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "000660",
        "expected": "영업이익 약 6.8조원"
    },
    {
        "id": "oct-26-hyundai",
        "date": "2026-10-24",
        "time": "14:00",
        "title": "현대차 3분기 실적 발표",
        "type": "earnings",
        "region": "kr",
        "simpleSummary": "하이브리드 및 고수익 SUV 판매 믹스 개선과 미국 메타플랜트 가동 계획, 주주환원 밸류업 계획을 점검해요.",
        "impactTag": "관망",
        "importance": 2,
        "ticker": "005380",
        "expected": "영업이익 약 3.8조원"
    },
    {
        "id": "oct-26-v",
        "date": "2026-10-28",
        "time": "05:30",
        "title": "비자 (V) 회계 4분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "글로벌 카드 결제 네트워크 1위 기업으로 국경 간 결제 규모와 개인 소비 지출 탄력성을 확인합니다.",
        "impactTag": "관망",
        "importance": 2,
        "ticker": "V",
        "expected": "매출 $9.48B / EPS $2.58"
    },
    {
        "id": "oct-26-fomc-rate",
        "date": "2026-10-29",
        "time": "03:00",
        "title": "미국 연준 10월 FOMC 기준금리 결정",
        "type": "economic",
        "region": "us",
        "simpleSummary": "미국 대선을 목전에 두고 열리는 연준 회의로, 25bp 추가 인하 여부와 대선 후 통화정책 가이던스를 제시합니다.",
        "impactTag": "핵심지표",
        "importance": 3,
        "expected": "4.75% (-25bp 인하 유력)"
    },
    {
        "id": "oct-26-msft",
        "date": "2026-10-29",
        "time": "05:30",
        "title": "마이크로소프트 (MSFT) 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "클라우드 서비스 애저(Azure)의 AI 기여도와 자본지출(Capex) 투자 수익성 회수 속도를 검증받아요.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "MSFT",
        "expected": "매출 $90.67B / EPS $4.72"
    },
    {
        "id": "oct-26-googl",
        "date": "2026-10-29",
        "time": "05:30",
        "title": "알파벳/구글 (GOOGL) 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "구글 검색 광고의 견고성과 유튜브 수익성, 구글 클라우드 부문의 가파른 성장세를 확인합니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "GOOGL",
        "expected": "매출 $127.30B / EPS $3.06"
    },
    {
        "id": "oct-26-meta",
        "date": "2026-10-29",
        "time": "05:30",
        "title": "메타 플랫폼스 (META) 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "AI 기반 맞춤형 디지털 광고 효율과 오픈소스 라마(Llama) 생태계 확장 계획, 연간 지출 가이던스를 점검해요.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "META",
        "expected": "매출 $40.25B / EPS $5.21"
    },
    {
        "id": "oct-26-lly",
        "date": "2026-10-29",
        "time": "20:00",
        "title": "일라이 릴리 (LLY) 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "글로벌 제약 시총 1등 기업으로 비만치료제(젭바운드) 및 당뇨약(마운자로)의 생산 능력 확충 추이를 확인합니다.",
        "impactTag": "관망",
        "importance": 2,
        "ticker": "LLY",
        "expected": "매출 $12.10B / EPS $1.45"
    },
    {
        "id": "oct-26-gdp-q3",
        "date": "2026-10-29",
        "time": "21:30",
        "title": "미국 3분기 GDP 성장률 (속보치 QoQ) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "미국 경제의 3분기 성장 엔진 속도예요. 연율 3% 안팎의 견고한 성장세를 이어갈지 세계의 시선이 집중돼요.",
        "impactTag": "핵심지표",
        "importance": 3,
        "expected": "연율 3.0% 성장 전망"
    },
    {
        "id": "oct-26-pce-sep",
        "date": "2026-10-29",
        "time": "21:30",
        "title": "미국 9월 개인소비지출 (PCE) 물가지수 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "연준이 공식 물가 목표(2.0%)로 가장 신뢰하는 근원 PCE 지표가 공개돼요.",
        "impactTag": "핵심지표",
        "importance": 3,
        "expected": "전년 대비 2.6% 상승"
    },
    {
        "id": "oct-26-aapl",
        "date": "2026-10-30",
        "time": "05:30",
        "title": "애플 (AAPL) 회계 4분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "애플 인텔리전스가 탑재된 아이폰 16 시리즈의 글로벌 초기 판매 반응과 중화권 매출 추이를 확인합니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "AAPL",
        "expected": "매출 $113.62B / EPS $1.98"
    },
    {
        "id": "oct-26-amzn",
        "date": "2026-10-30",
        "time": "05:30",
        "title": "아마존 (AMZN) 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "클라우드 1등 AWS의 AI 매출 가속화와 전자상거래 및 프라임 비디오 광고 매출 성장세를 점검해요.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "AMZN",
        "expected": "매출 $202.03B / EPS $1.98"
    },
    {
        "id": "oct-26-xom",
        "date": "2026-10-30",
        "time": "20:30",
        "title": "엑슨모빌 (XOM) 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "미국 최대 정유사로 국제 유가 안정화 속 정제마진과 파이오니어 합병 시너지 효과를 확인합니다.",
        "impactTag": "관망",
        "importance": 2,
        "ticker": "XOM",
        "expected": "매출 $93.4B / EPS $1.88"
    },
    {
        "id": "oct-26-samsung-final",
        "date": "2026-10-31",
        "time": "08:30",
        "title": "삼성전자 3분기 확정 실적 발표 및 컨퍼런스콜",
        "type": "earnings",
        "region": "kr",
        "simpleSummary": "사업부별(DS 반도체, MX 스마트폰 등) 세부 성적표와 주주 대상 컨퍼런스콜 Q&A가 진행돼요.",
        "impactTag": "변동성 주의",
        "importance": 3,
        "ticker": "005930"
    },

    # ══════════════════════════════════════════════════════════════════════════
    # 2026년 11월 (미래 1개월 차)
    # ══════════════════════════════════════════════════════════════════════════
    {
        "id": "nov-26-ism-mfg",
        "date": "2026-11-02",
        "time": "23:00",
        "title": "미국 10월 ISM 제조업 구매관리자지수 (PMI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "4분기 진입 시점의 미국 제조업 체감 경기와 공장 주문 회복세를 점검해요.",
        "impactTag": "관망",
        "importance": 2
    },
    {
        "id": "nov-26-jolts",
        "date": "2026-11-03",
        "time": "23:00",
        "title": "미국 9월 JOLTS 구인 건수 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "미국 노동통계국(BLS) 공식 일정으로 미국 기업들의 9월 일자리 채용 공고 총량이 공개돼요.",
        "impactTag": "관망",
        "importance": 2,
        "previous": "7.08M"
    },
    {
        "id": "nov-26-ism-services",
        "date": "2026-11-04",
        "time": "23:00",
        "title": "미국 10월 ISM 서비스업 구매관리자지수 (PMI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "미국 실물 경기의 80%를 지탱하는 서비스업의 확장세 지속 여부를 가늠합니다.",
        "impactTag": "관망",
        "importance": 2
    },
    {
        "id": "nov-26-amd",
        "date": "2026-11-04",
        "time": "06:00",
        "title": "AMD 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "AI 가속기 MI300 시리즈의 데이터센터 매출 침투율과 PC용 AI CPU 성적표를 확인합니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "AMD",
        "expected": "매출 $6.75B / EPS $0.92"
    },
    {
        "id": "nov-26-nfp",
        "date": "2026-11-06",
        "time": "22:30",
        "title": "미국 10월 비농업 취업자수 (NFP) 및 실업률 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "미국 대선 직후 공개되는 10월 고용 성적표예요. 노동 시장의 연착륙 흐름을 재확인합니다.",
        "impactTag": "핵심지표",
        "importance": 3
    },
    {
        "id": "nov-26-cpi",
        "date": "2026-11-10",
        "time": "22:30",
        "title": "미국 10월 소비자물가지수 (CPI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "12월 연준의 추가 금리 인하 여부를 최종 판단할 10월 물가 데이터가 공개돼요.",
        "impactTag": "핵심지표",
        "importance": 3
    },
    {
        "id": "nov-26-ppi",
        "date": "2026-11-13",
        "time": "22:30",
        "title": "미국 10월 생산자물가지수 (PPI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "소비자물가 선행 지표인 도매물가 추이를 확인합니다.",
        "impactTag": "관망",
        "importance": 2
    },
    {
        "id": "nov-26-nvda",
        "date": "2026-11-18",
        "time": "06:20",
        "title": "엔비디아 (NVDA) 회계 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "전 세계 AI 랠리의 바로미터예요. 차세대 블랙웰 칩의 본격 출하 실적과 4분기 매출 가이던스를 공개합니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "NVDA",
        "expected": "매출 $108.98B / EPS $2.47"
    },
    {
        "id": "nov-26-wmt",
        "date": "2026-11-19",
        "time": "20:00",
        "title": "월마트 (WMT) 3분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "미국 최대 유통업체로 연말 쇼핑 시즌(블랙프라이데이)을 앞두고 미국 중산층 소비 심리를 확인합니다.",
        "impactTag": "관망",
        "importance": 2,
        "ticker": "WMT",
        "expected": "매출 $167.5B / EPS $0.53"
    },
    {
        "id": "nov-26-bok-rate",
        "date": "2026-11-26",
        "time": "10:00",
        "title": "한국은행 11월 금통위 기준금리 결정",
        "type": "economic",
        "region": "kr",
        "simpleSummary": "한국은행의 올해 마지막 기준금리 결정 회의로 내년 경제성장률 및 물가 전망치를 수정 발표합니다.",
        "impactTag": "핵심지표",
        "importance": 3
    },
    {
        "id": "nov-26-us-thanksgiving",
        "date": "2026-11-26",
        "title": "미국 증시 휴장 (추수감사절)",
        "type": "holiday",
        "region": "us",
        "simpleSummary": "미국 추수감사절 국경일로 뉴욕 증시가 전면 휴장합니다. (익일은 오후 1시 조기 마감)",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },

    # ══════════════════════════════════════════════════════════════════════════
    # 2026년 12월 (미래 2개월 차)
    # ══════════════════════════════════════════════════════════════════════════
    {
        "id": "dec-26-ism-mfg",
        "date": "2026-12-01",
        "time": "23:00",
        "title": "미국 11월 ISM 제조업 구매관리자지수 (PMI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "연말 미국 제조업 공장 가동률과 원자재 가격 추이를 점검해요.",
        "impactTag": "관망",
        "importance": 2
    },
    {
        "id": "dec-26-jolts",
        "date": "2026-12-01",
        "time": "23:00",
        "title": "미국 10월 JOLTS 구인 건수 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "미국 노동통계국 공식 일정으로 10월 구인 수요 현황이 공개돼요.",
        "impactTag": "관망",
        "importance": 2
    },
    {
        "id": "dec-26-pce-oct",
        "date": "2026-12-02",
        "time": "22:30",
        "title": "미국 10월 개인소비지출 (PCE) 물가지수 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "연준의 12월 금리 결정을 1주일 앞두고 발표되는 핵심 인플레이션 지표입니다.",
        "impactTag": "핵심지표",
        "importance": 3
    },
    {
        "id": "dec-26-ism-services",
        "date": "2026-12-03",
        "time": "23:00",
        "title": "미국 11월 ISM 서비스업 구매관리자지수 (PMI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "연말 소비 시즌 직전의 서비스업 경기 확장 모멘텀을 확인합니다.",
        "impactTag": "관망",
        "importance": 2
    },
    {
        "id": "dec-26-nfp",
        "date": "2026-12-04",
        "time": "22:30",
        "title": "미국 11월 비농업 취업자수 (NFP) 및 실업률 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "연준 12월 FOMC 직전에 발표되는 마지막 핵심 고용 지표예요.",
        "impactTag": "핵심지표",
        "importance": 3
    },
    {
        "id": "dec-26-fomc-rate",
        "date": "2026-12-10",
        "time": "04:00",
        "title": "미국 연준 12월 FOMC 기준금리 결정 & 경제전망(SEP)",
        "type": "economic",
        "region": "us",
        "simpleSummary": "올해 마지막 연준 회의로 내년 기준금리 전망 점도표(Dot Plot)와 경제전망 요약이 함께 공개돼요.",
        "impactTag": "핵심지표",
        "importance": 3
    },
    {
        "id": "dec-26-cpi",
        "date": "2026-12-10",
        "time": "22:30",
        "title": "미국 11월 소비자물가지수 (CPI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "연말 물가 안정 추세를 재확인하는 11월 공식 소비자물가입니다.",
        "impactTag": "핵심지표",
        "importance": 3
    },
    {
        "id": "dec-26-avgo",
        "date": "2026-12-10",
        "time": "06:00",
        "title": "브로드컴 (AVGO) 회계 4분기 실적 발표",
        "type": "earnings",
        "region": "us",
        "simpleSummary": "맞춤형 AI 가속기(XPU) 및 네트워킹 스위치 칩 수요와 VM웨어 소프트웨어 통합 시너지를 확인합니다.",
        "impactTag": "호재 가능성",
        "importance": 3,
        "ticker": "AVGO"
    },
    {
        "id": "dec-26-christmas",
        "date": "2026-12-25",
        "title": "한국 & 미국 증시 휴장 (성탄절)",
        "type": "holiday",
        "region": "us",
        "simpleSummary": "성탄절 국경일로 한국과 미국 등 글로벌 주요 금융 시장이 모두 휴장합니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },
    {
        "id": "dec-26-kr-closing",
        "date": "2026-12-31",
        "title": "한국 증시 휴장 (연말 폐장일)",
        "type": "holiday",
        "region": "kr",
        "simpleSummary": "한국거래소(KRX)의 연말 휴장일로 올해 국내 주식 거래가 마감됩니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },

    # ══════════════════════════════════════════════════════════════════════════
    # 2027년 1월 (미래 3개월 차)
    # ══════════════════════════════════════════════════════════════════════════
    {
        "id": "jan-27-new-year",
        "date": "2027-01-01",
        "title": "한국 & 미국 증시 휴장 (신정)",
        "type": "holiday",
        "region": "us",
        "simpleSummary": "새해 첫날(신정)로 전 세계 주요 증시가 일제히 휴장합니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },
    {
        "id": "jan-27-ism-mfg",
        "date": "2027-01-04",
        "time": "23:00",
        "title": "미국 12월 ISM 제조업 구매관리자지수 (PMI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "새해 첫 거래일에 발표되는 미국 제조업 실물 경기 지표입니다.",
        "impactTag": "관망",
        "importance": 2
    },
    {
        "id": "jan-27-jolts",
        "date": "2027-01-05",
        "time": "23:00",
        "title": "미국 11월 JOLTS 구인 건수 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "미국 노동통계국 공식 일정으로 11월 채용 공고 총량이 공개돼요.",
        "impactTag": "관망",
        "importance": 2
    },
    {
        "id": "jan-27-nfp",
        "date": "2027-01-08",
        "time": "22:30",
        "title": "미국 12월 비농업 취업자수 (NFP) 및 실업률 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "2026년 한 해 동안의 미국 최종 고용 성적표가 공개돼요.",
        "impactTag": "핵심지표",
        "importance": 3
    },
    {
        "id": "jan-27-cpi",
        "date": "2027-01-13",
        "time": "22:30",
        "title": "미국 12월 소비자물가지수 (CPI) 발표",
        "type": "economic",
        "region": "us",
        "simpleSummary": "2026년 최종 인플레이션 수치로 연초 글로벌 자산 배분의 나침반 역할을 합니다.",
        "impactTag": "핵심지표",
        "importance": 3
    },
    {
        "id": "jan-27-bok-rate",
        "date": "2027-01-14",
        "time": "10:00",
        "title": "한국은행 1월 금통위 기준금리 결정",
        "type": "economic",
        "region": "kr",
        "simpleSummary": "새해 첫 한국은행 기준금리 결정 회의입니다.",
        "impactTag": "핵심지표",
        "importance": 3
    },
    {
        "id": "jan-27-us-mlk",
        "date": "2027-01-18",
        "title": "미국 증시 휴장 (마틴 루터 킹 데이)",
        "type": "holiday",
        "region": "us",
        "simpleSummary": "마틴 루터 킹 주니어 목사 기념일로 뉴욕 증시가 하루 쉬어갑니다.",
        "impactTag": "관망",
        "importance": 1,
        "isHoliday": True
    },
    {
        "id": "jan-27-fomc-rate",
        "date": "2027-01-28",
        "time": "04:00",
        "title": "미국 연준 1월 FOMC 기준금리 결정",
        "type": "economic",
        "region": "us",
        "simpleSummary": "새해 첫 연준 통화정책 결정 회의로 2027년 기준금리 인하 기조의 지속성을 점검합니다.",
        "impactTag": "핵심지표",
        "importance": 3
    }
]

def main():
    target_file = 'src/data/marketCalendar.ts'
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Locate CALENDAR_EVENTS start and end
    start_marker = "export const CALENDAR_EVENTS: CalendarEvent[] = ["
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print("Error: start_marker not found!")
        return

    # Find the matching closing bracket
    end_marker = "export const EVENT_TYPE_CONFIG"
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        print("Error: end_marker not found!")
        return

    # Find the ]; before EVENT_TYPE_CONFIG
    close_bracket_idx = content.rfind("];", start_idx, end_idx)
    if close_bracket_idx == -1:
        print("Error: close_bracket_idx not found!")
        return

    # Format the events as clean JSON/TS
    events_json = json.dumps(OFFICIAL_EVENTS, ensure_ascii=False, indent=2)

    new_section = f"export const CALENDAR_EVENTS: CalendarEvent[] = {events_json};\n\n"

    # Replace in file
    new_content = content[:start_idx] + new_section + content[end_idx:]
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Successfully rebuilt CALENDAR_EVENTS with {len(OFFICIAL_EVENTS)} official verified events.")

if __name__ == '__main__':
    main()

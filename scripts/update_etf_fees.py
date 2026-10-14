#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ETF 수수료 & 시장 데이터 공식 수집 스크립트 (v7 - 전 종목 정밀 선별 및 코스피 200 대폭 확대)
1. 국내 상장 ETF: 금융투자협회(KOFIA DIS) 공식 XML 전문 + 네이버 금융 52주 주봉 시계열 + 순자산(AUM) + 배당률
2. 미국 직투 ETF: 미국 SEC 및 운용사 공식 팩트시트 + 야후 파이낸스 52주 주봉 + AUM + 배당률
결과 파일: src/data/etfFees.json
"""

import json
import os
import subprocess
import urllib.request
import xml.etree.ElementTree as ET
import sys
from datetime import datetime

TARGET_JSON_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src/data/etfFees.json"))

def load_previous_payload():
    """이전 실행 결과(etfFees.json)를 읽어 조회 실패 시 대체값으로 사용."""
    try:
        with open(TARGET_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

# -------------------------------------------------------------
# 1. 대상 종목 정의 (국내 상장 ETF & 미국 직투 ETF)
#    subCategory: 'standard' (기본·환노출), 'hedged' (환헤지), 'covered_call' (커버드콜·인컴), 'leverage' (레버리지·액티브)
# -------------------------------------------------------------

KR_ETF_TARGETS = [
    # ── S&P 500군 (총 25개) ──
    # [기본 · 환노출]
    {"code": "360200", "name": "ACE 미국S&P500", "company": "한국투자신탁운용", "category": "sp500", "subCategory": "standard", "dividendYield": 1.22, "exact_kofia_name": "한국투자ACE미국S&P500증권상장지수투자신탁(주식)"},
    {"code": "360750", "name": "TIGER 미국S&P500", "company": "미래에셋자산운용", "category": "sp500", "subCategory": "standard", "dividendYield": 1.22, "exact_kofia_name": "미래에셋TIGER미국S&P500증권상장지수투자신탁(주식)"},
    {"code": "379780", "name": "RISE 미국S&P500", "company": "KB자산운용", "category": "sp500", "subCategory": "standard", "dividendYield": 1.22, "exact_kofia_name": "KBRISE미국S&P500증권상장지수투자신탁(주식)"},
    {"code": "379800", "name": "KODEX 미국S&P500", "company": "삼성자산운용", "category": "sp500", "subCategory": "standard", "dividendYield": 1.22, "exact_kofia_name": "삼성KODEX미국S&P500증권상장지수투자신탁[주식]"},
    {"code": "433330", "name": "SOL 미국S&P500", "company": "신한자산운용", "category": "sp500", "subCategory": "standard", "dividendYield": 1.22, "exact_kofia_name": "신한SOL미국S&P500증권상장지수투자신탁[주식]"},
    {"code": "444490", "name": "WON 미국S&P500", "company": "우리자산운용", "category": "sp500", "subCategory": "standard", "dividendYield": 1.22, "exact_kofia_name": "우리WON미국S&P500증권상장지수투자신탁(주식)"},
    {"code": "0026S0", "name": "1Q 미국S&P500", "company": "하나자산운용", "category": "sp500", "subCategory": "standard", "dividendYield": 1.22, "exact_kofia_name": "하나1Q미국S&P500증권상장지수투자신탁[주식]"},
    {"code": "429760", "name": "PLUS 미국S&P500", "company": "한화자산운용", "category": "sp500", "subCategory": "standard", "dividendYield": 1.22, "exact_kofia_name": "한화PLUS미국S&P500증권상장지수투자신탁(주식)"},
    {"code": "449770", "name": "KIWOOM 미국S&P500", "company": "키움투자자산운용", "category": "sp500", "subCategory": "standard", "dividendYield": 1.22, "exact_kofia_name": "키움KIWOOM미국S&P500증권상장지수투자신탁[주식]"},
    {"code": "432840", "name": "HANARO 미국S&P500", "company": "NH-Amundi자산운용", "category": "sp500", "subCategory": "standard", "dividendYield": 1.22, "exact_kofia_name": "NH-AmundiHANARO미국S&P500증권상장지수투자신탁(주식)"},
    {"code": "488500", "name": "TIGER 미국S&P500동일가중", "company": "미래에셋자산운용", "category": "sp500", "subCategory": "standard", "dividendYield": 1.40, "exact_kofia_name": "미래에셋TIGER미국S&P500동일가중증권상장지수투자신탁(주식)"},
    # [환헤지 (H)]
    {"code": "449180", "name": "KODEX 미국S&P500(H)", "company": "삼성자산운용", "category": "sp500", "subCategory": "hedged", "dividendYield": 1.22, "exact_kofia_name": "삼성KODEX미국S&P500증권상장지수투자신탁[주식](H)"},
    {"code": "453330", "name": "RISE 미국S&P500(H)", "company": "KB자산운용", "category": "sp500", "subCategory": "hedged", "dividendYield": 1.22, "exact_kofia_name": "KBRISE미국S&P500증권상장지수투자신탁(주식)(H)"},
    {"code": "448290", "name": "TIGER 미국S&P500(H)", "company": "미래에셋자산운용", "category": "sp500", "subCategory": "hedged", "dividendYield": 1.22, "exact_kofia_name": "미래에셋TIGER미국S&P500증권상장지수투자신탁(주식-파생형)(H)"},
    {"code": "449780", "name": "KIWOOM 미국S&P500(H)", "company": "키움투자자산운용", "category": "sp500", "subCategory": "hedged", "dividendYield": 1.22, "exact_kofia_name": "키움KIWOOM미국S&P500증권상장지수투자신탁[주식](H)"},
    {"code": "269540", "name": "PLUS 미국S&P500(H)", "company": "한화자산운용", "category": "sp500", "subCategory": "hedged", "dividendYield": 1.22, "exact_kofia_name": "한화PLUSS&P500증권상장지수투자신탁(주식)(H)"},
    {"code": "0005C0", "name": "RISE 미국S&P500엔화노출(합성 H)", "company": "KB자산운용", "category": "sp500", "subCategory": "hedged", "dividendYield": 1.20, "exact_kofia_name": "KBRISE미국S&P500엔화노출증권상장지수투자신탁(주식-파생형)(합성H)"},
    {"code": "499150", "name": "SOL 미국S&P500엔화노출(H)", "company": "신한자산운용", "category": "sp500", "subCategory": "hedged", "dividendYield": 1.20, "exact_kofia_name": "신한SOL미국S&P500엔화노출증권상장지수투자신탁[주식-파생형](H)"},
    # [커버드콜 · 인컴]
    {"code": "482730", "name": "TIGER 미국S&P500타겟데일리커버드콜", "company": "미래에셋자산운용", "category": "sp500", "subCategory": "covered_call", "dividendYield": 10.04, "exact_kofia_name": "미래에셋TIGER미국S&P500타겟데일리커버드콜증권상장지수투자신탁(주식)"},
    {"code": "0005A0", "name": "KODEX 미국S&P500데일리커버드콜OTM", "company": "삼성자산운용", "category": "sp500", "subCategory": "covered_call", "dividendYield": 12.00, "exact_kofia_name": "삼성KODEX미국S&P500데일리커버드콜OTM증권상장지수투자신탁[주식-파생형]"},
    {"code": "0138T0", "name": "RISE 미국S&P500데일리고정커버드콜", "company": "KB자산운용", "category": "sp500", "subCategory": "covered_call", "dividendYield": 11.50, "exact_kofia_name": "KBRISE미국S&P500데일리고정커버드콜증권상장지수투자신탁(주식)"},
    {"code": "0089C0", "name": "KODEX 미국S&P500변동성확대시커버드콜", "company": "삼성자산운용", "category": "sp500", "subCategory": "covered_call", "dividendYield": 9.80, "exact_kofia_name": "삼성KODEX미국S&P500변동성확대시커버드콜증권상장지수투자신탁[주식-파생형]"},
    # [레버리지]
    {"code": "225040", "name": "TIGER 미국S&P500레버리지(합성 H)", "company": "미래에셋자산운용", "category": "sp500", "subCategory": "leverage", "dividendYield": 0.91, "exact_kofia_name": "미래에셋TIGERS&P500레버리지증권상장지수투자신탁(주식혼합-파생형)(합성 H)"},
    # [액티브]
    {"code": "426020", "name": "TIME 미국S&P500액티브", "company": "타임폴리오자산운용", "category": "sp500", "subCategory": "active", "dividendYield": 0.50, "exact_kofia_name": "타임폴리오TIME미국S&P500액티브증권상장지수투자신탁(주식)"},
    {"code": "0219Z0", "name": "HANARO 미국S&P500액티브", "company": "NH-Amundi자산운용", "category": "sp500", "subCategory": "active", "dividendYield": 1.10, "exact_kofia_name": "NH-AmundiHANARO미국S&P500액티브증권상장지수투자신탁[주식]"},
    {"code": "0041E0", "name": "KODEX 미국S&P500액티브", "company": "삼성자산운용", "category": "sp500", "subCategory": "active", "dividendYield": 0.80, "exact_kofia_name": "삼성KODEX미국S&P500액티브증권상장지수투자신탁[주식]"},

    # ── 나스닥 100군 (총 15개) ──
    # [기본 · 환노출]
    {"code": "368590", "name": "RISE 미국나스닥100", "company": "KB자산운용", "category": "nasdaq100", "subCategory": "standard", "dividendYield": 0.62, "exact_kofia_name": "KBRISE미국나스닥100증권상장지수투자신탁(주식)"},
    {"code": "133690", "name": "TIGER 미국나스닥100", "company": "미래에셋자산운용", "category": "nasdaq100", "subCategory": "standard", "dividendYield": 0.54, "exact_kofia_name": "미래에셋TIGER미국나스닥100증권상장지수투자신탁(주식)"},
    {"code": "367380", "name": "ACE 미국나스닥100", "company": "한국투자신탁운용", "category": "nasdaq100", "subCategory": "standard", "dividendYield": 0.54, "exact_kofia_name": "한국투자ACE미국나스닥100증권상장지수투자신탁(주식)"},
    {"code": "379810", "name": "KODEX 미국나스닥100", "company": "삼성자산운용", "category": "nasdaq100", "subCategory": "standard", "dividendYield": 0.58, "exact_kofia_name": "삼성KODEX미국나스닥100증권상장지수투자신탁[주식]"},
    {"code": "476030", "name": "SOL 미국나스닥100", "company": "신한자산운용", "category": "nasdaq100", "subCategory": "standard", "dividendYield": 0.47, "exact_kofia_name": "신한SOL미국나스닥100증권상장지수투자신탁[주식]"},
    {"code": "0069M0", "name": "1Q 미국나스닥100", "company": "하나자산운용", "category": "nasdaq100", "subCategory": "standard", "dividendYield": 0.45, "exact_kofia_name": "하나1Q미국나스닥100증권상장지수투자신탁[주식]"},
    # [환헤지 (H)]
    {"code": "449190", "name": "KODEX 미국나스닥100(H)", "company": "삼성자산운용", "category": "nasdaq100", "subCategory": "hedged", "dividendYield": 0.57, "exact_kofia_name": "삼성KODEX미국나스닥100증권상장지수투자신탁[주식](H)"},
    {"code": "448300", "name": "TIGER 미국나스닥100(H)", "company": "미래에셋자산운용", "category": "nasdaq100", "subCategory": "hedged", "dividendYield": 0.53, "exact_kofia_name": "미래에셋TIGER미국나스닥100증권상장지수투자신탁(주식-파생형)(H)"},
    {"code": "453080", "name": "KIWOOM 미국나스닥100(H)", "company": "키움투자자산운용", "category": "nasdaq100", "subCategory": "hedged", "dividendYield": 0.52, "exact_kofia_name": "키움KIWOOM미국나스닥100증권상장지수투자신탁[주식](H)"},
    # [커버드콜 · 인컴]
    {"code": "486290", "name": "TIGER 미국나스닥100타겟데일리커버드콜", "company": "미래에셋자산운용", "category": "nasdaq100", "subCategory": "covered_call", "dividendYield": 15.09, "exact_kofia_name": "미래에셋TIGER미국나스닥100타겟데일리커버드콜증권상장지수투자신탁(주식)"},
    {"code": "441680", "name": "TIGER 미국나스닥100커버드콜(합성)", "company": "미래에셋자산운용", "category": "nasdaq100", "subCategory": "covered_call", "dividendYield": 12.12, "exact_kofia_name": "미래에셋TIGER미국나스닥100커버드콜증권상장지수투자신탁(주식-파생형)(합성)"},
    {"code": "494300", "name": "KODEX 미국나스닥100데일리커버드콜OTM", "company": "삼성자산운용", "category": "nasdaq100", "subCategory": "covered_call", "dividendYield": 20.16, "exact_kofia_name": "삼성KODEX미국나스닥100데일리커버드콜OTM증권상장지수투자신탁[주식-파생형]"},
    # [레버리지]
    {"code": "418660", "name": "TIGER 미국나스닥100레버리지(합성)", "company": "미래에셋자산운용", "category": "nasdaq100", "subCategory": "leverage", "dividendYield": 1.11, "exact_kofia_name": "미래에셋TIGER미국나스닥100레버리지증권상장지수투자신탁(주식혼합-파생형)(합성)"},
    {"code": "409820", "name": "KODEX 미국나스닥100레버리지(합성 H)", "company": "삼성자산운용", "category": "nasdaq100", "subCategory": "leverage", "dividendYield": 0.78, "exact_kofia_name": "삼성KODEX 미국나스닥100레버리지증권상장지수투자신탁[주식-파생형](합성H)"},
    # [액티브]
    {"code": "426030", "name": "TIME 미국나스닥100액티브", "company": "타임폴리오자산운용", "category": "nasdaq100", "subCategory": "active", "dividendYield": 0.09, "exact_kofia_name": "타임폴리오TIME미국나스닥100액티브증권상장지수투자신탁(주식)"},

    # ── 미국배당다우존스군 (한국판 SCHD - 총 10개) ──
    # [기본 · 환노출]
    {"code": "458730", "name": "TIGER 미국배당다우존스", "company": "미래에셋자산운용", "category": "schd", "subCategory": "standard", "dividendYield": 3.18, "exact_kofia_name": "미래에셋TIGER미국배당다우존스증권상장지수투자신탁(주식)"},
    {"code": "402970", "name": "ACE 미국배당다우존스", "company": "한국투자신탁운용", "category": "schd", "subCategory": "standard", "dividendYield": 3.20, "exact_kofia_name": "한국투자ACE미국배당다우존스증권상장지수투자신탁(주식)"},
    {"code": "446720", "name": "SOL 미국배당다우존스", "company": "신한자산운용", "category": "schd", "subCategory": "standard", "dividendYield": 3.26, "exact_kofia_name": "신한SOL미국배당다우존스증권상장지수투자신탁[주식]"},
    {"code": "489250", "name": "KODEX 미국배당다우존스", "company": "삼성자산운용", "category": "schd", "subCategory": "standard", "dividendYield": 3.03, "exact_kofia_name": "삼성KODEX미국배당다우존스증권상장지수투자신탁[주식]"},
    {"code": "493420", "name": "SOL 미국배당다우존스2호", "company": "신한자산운용", "category": "schd", "subCategory": "standard", "dividendYield": 3.25, "exact_kofia_name": "신한SOL미국배당다우존스2호증권상장지수투자신탁[주식]"},
    # [환헤지 (H)]
    {"code": "452360", "name": "SOL 미국배당다우존스(H)", "company": "신한자산운용", "category": "schd", "subCategory": "hedged", "dividendYield": 3.22, "exact_kofia_name": "신한SOL미국배당다우존스증권상장지수투자신탁[주식](H)"},
    # [커버드콜 · 인컴]
    {"code": "458760", "name": "TIGER 미국배당다우존스타겟커버드콜2호", "company": "미래에셋자산운용", "category": "schd", "subCategory": "covered_call", "dividendYield": 10.28, "exact_kofia_name": "미래에셋TIGER미국배당다우존스타겟커버드콜2호증권상장지수투자신탁(주식-파생형)"},
    {"code": "458750", "name": "TIGER 미국배당다우존스타겟커버드콜1호", "company": "미래에셋자산운용", "category": "schd", "subCategory": "covered_call", "dividendYield": 6.28, "exact_kofia_name": "미래에셋TIGER 미국배당다우존스타겟커버드콜1호증권상장지수투자신탁(주식-파생형)"},
    {"code": "483290", "name": "KODEX 미국배당다우존스타겟커버드콜", "company": "삼성자산운용", "category": "schd", "subCategory": "covered_call", "dividendYield": 9.50, "exact_kofia_name": "삼성KODEX미국배당다우존스타겟커버드콜증권상장지수투자신탁[주식-파생형]"},
    {"code": "0008S0", "name": "TIGER 미국배당다우존스타겟데일리커버드콜", "company": "미래에셋자산운용", "category": "schd", "subCategory": "covered_call", "dividendYield": 11.20, "exact_kofia_name": "미래에셋TIGER미국배당다우존스타겟데일리커버드콜증권상장지수투자신탁(주식)"},

    # ── 미국 30년 국채군 (총 13개) ──
    # [기본 · 환노출]
    {"code": "476760", "name": "ACE 미국30년국채액티브", "company": "한국투자신탁운용", "category": "bonds", "subCategory": "standard", "dividendYield": 3.96, "exact_kofia_name": "한국투자ACE미국30년국채액티브증권상장지수투자신탁[채권]"},
    {"code": "481340", "name": "RISE 미국30년국채액티브", "company": "KB자산운용", "category": "bonds", "subCategory": "standard", "dividendYield": 4.45, "exact_kofia_name": "KBRISE미국30년국채액티브증권상장지수투자신탁(채권)"},
    # [환헤지 (H)]
    {"code": "484790", "name": "KODEX 미국30년국채액티브(H)", "company": "삼성자산운용", "category": "bonds", "subCategory": "hedged", "dividendYield": 4.92, "exact_kofia_name": "삼성KODEX미국30년국채액티브증권상장지수투자신탁[채권-재간접형](H)"},
    {"code": "461600", "name": "SOL 미국30년국채액티브(H)", "company": "신한자산운용", "category": "bonds", "subCategory": "hedged", "dividendYield": 2.29, "exact_kofia_name": "신한SOL미국30년국채액티브증권상장지수투자신탁[채권](H)"},
    {"code": "453850", "name": "ACE 미국30년국채액티브(H)", "company": "한국투자신탁운용", "category": "bonds", "subCategory": "hedged", "dividendYield": 3.90, "exact_kofia_name": "한국투자ACE미국30년국채액티브증권상장지수투자신탁[채권](H)"},
    {"code": "472870", "name": "RISE 미국30년국채엔화노출(합성 H)", "company": "KB자산운용", "category": "bonds", "subCategory": "hedged", "dividendYield": 3.02, "exact_kofia_name": "KBRISE미국30년국채엔화노출증권상장지수투자신탁(채권-파생형)(합성H)"},
    {"code": "476750", "name": "ACE 미국30년국채엔화노출액티브(H)", "company": "한국투자신탁운용", "category": "bonds", "subCategory": "hedged", "dividendYield": 3.10, "exact_kofia_name": "한국투자ACE미국30년국채엔화노출액티브증권상장지수투자신탁[채권](H)"},
    # [커버드콜 · 인컴]
    {"code": "476550", "name": "TIGER 미국30년국채커버드콜액티브(H)", "company": "미래에셋자산운용", "category": "bonds", "subCategory": "covered_call", "dividendYield": 12.00, "exact_kofia_name": "미래에셋TIGER미국30년국채커버드콜액티브증권상장지수투자신탁(채권-재간접형)(H)"},
    {"code": "481060", "name": "KODEX 미국30년국채타겟커버드콜(합성 H)", "company": "삼성자산운용", "category": "bonds", "subCategory": "covered_call", "dividendYield": 12.00, "exact_kofia_name": "삼성KODEX미국30년국채타겟커버드콜증권상장지수투자신탁[채권-파생형](합성 H)"},
    {"code": "473330", "name": "SOL 미국30년국채커버드콜(합성)", "company": "신한자산운용", "category": "bonds", "subCategory": "covered_call", "dividendYield": 10.50, "exact_kofia_name": "신한SOL미국30년국채커버드콜증권상장지수투자신탁[채권-파생형](합성)"},
    {"code": "472830", "name": "RISE 미국30년국채커버드콜(합성)", "company": "KB자산운용", "category": "bonds", "subCategory": "covered_call", "dividendYield": 10.80, "exact_kofia_name": "KBRISE미국30년국채커버드콜증권상장지수투자신탁(채권-파생형)(합성)"},
    # [레버리지 · 파생]
    {"code": "458250", "name": "TIGER 미국30년국채스트립액티브(합성 H)", "company": "미래에셋자산운용", "category": "bonds", "subCategory": "leverage", "dividendYield": 0.00, "exact_kofia_name": "미래에셋TIGER미국30년국채스트립액티브증권상장지수투자신탁(채권-파생형)(합성H)"},

    # ── 코스피 200군 (총 24개 엄선) ──
    # [기본 일반형]
    {"code": "069500", "name": "KODEX 200", "company": "삼성자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 1.85, "exact_kofia_name": "삼성KODEX200증권상장지수투자신탁[주식]"},
    {"code": "102110", "name": "TIGER 200", "company": "미래에셋자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 1.85, "exact_kofia_name": "미래에셋TIGER200증권상장지수투자신탁(주식)"},
    {"code": "105190", "name": "ACE 200", "company": "한국투자신탁운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 1.85, "exact_kofia_name": "한국투자ACE200증권상장지수투자신탁(주식)"},
    {"code": "148020", "name": "RISE 200", "company": "KB자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 1.85, "exact_kofia_name": "KBRISE200증권상장지수투자신탁(주식)"},
    {"code": "152100", "name": "PLUS 200", "company": "한화자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 1.85, "exact_kofia_name": "한화PLUS200증권상장지수투자신탁(주식)"},
    {"code": "293180", "name": "HANARO 200", "company": "NH-Amundi자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 1.85, "exact_kofia_name": "NH-AmundiHANARO200증권상장지수투자신탁[주식]"},
    {"code": "069660", "name": "KIWOOM 200", "company": "키움투자자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 1.85, "exact_kofia_name": "키움KOOSELF200증권상장지수투자신탁[주식]"},
    # [TR형 (Total Return, 배당재투자 8대 운용사 전수)]
    {"code": "278530", "name": "KODEX 200TR", "company": "삼성자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 0.00, "exact_kofia_name": "삼성KODEX200TotalReturn증권상장지수투자신탁[주식]"},
    {"code": "310960", "name": "TIGER 200TR", "company": "미래에셋자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 0.00, "exact_kofia_name": "미래에셋TIGER200TotalReturn증권상장지수투자신탁(주식)"},
    {"code": "332500", "name": "ACE 200TR", "company": "한국투자신탁운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 0.00, "exact_kofia_name": "한국투자ACE200TotalReturn증권상장지수투자신탁(주식)"},
    {"code": "361580", "name": "RISE 200TR", "company": "KB자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 0.00, "exact_kofia_name": "KBRISE200TotalReturn증권상장지수투자신탁(주식)"},
    {"code": "295040", "name": "SOL 200TR", "company": "신한자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 0.00, "exact_kofia_name": "신한SOL200TotalReturn증권상장지수투자신탁[주식]"},
    {"code": "491220", "name": "PLUS 200TR", "company": "한화자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 0.00, "exact_kofia_name": "한화PLUS200TotalReturn증권상장지수투자신탁(주식)"},
    {"code": "332930", "name": "HANARO 200TR", "company": "NH-Amundi자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 0.00, "exact_kofia_name": "NH-AmundiHANARO200TotalReturn증권상장지수투자신탁[주식]"},
    {"code": "294400", "name": "KIWOOM 200TR", "company": "키움투자자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 0.00, "exact_kofia_name": "키움KIWOOM200TotalReturn증권상장지수투자신탁[주식]"},
    # [동일가중형]
    {"code": "252650", "name": "KODEX 200동일가중", "company": "삼성자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 1.75, "exact_kofia_name": "삼성KODEX200동일가중증권상장지수투자신탁[주식]"},
    {"code": "252000", "name": "TIGER 200동일가중", "company": "미래에셋자산운용", "category": "kospi200", "subCategory": "standard", "dividendYield": 1.75, "exact_kofia_name": "미래에셋TIGER200동일가중증권상장지수투자신탁(주식)"},
    # [커버드콜형]
    {"code": "498400", "name": "KODEX 200타겟위클리커버드콜", "company": "삼성자산운용", "category": "kospi200", "subCategory": "covered_call", "dividendYield": 10.50, "exact_kofia_name": "삼성KODEX200타겟위클리커버드콜증권상장지수투자신탁[주식-파생형]"},
    {"code": "0104N0", "name": "TIGER 200타겟위클리커버드콜", "company": "미래에셋자산운용", "category": "kospi200", "subCategory": "covered_call", "dividendYield": 10.80, "exact_kofia_name": "미래에셋TIGER200타겟위클리커버드콜증권상장지수투자신탁(주식)"},
    {"code": "475720", "name": "RISE 200위클리커버드콜", "company": "KB자산운용", "category": "kospi200", "subCategory": "covered_call", "dividendYield": 11.20, "exact_kofia_name": "KBRISE200위클리커버드콜증권상장지수투자신탁(주식-파생형)"},
    {"code": "0167B0", "name": "SOL 200타겟위클리커버드콜", "company": "신한자산운용", "category": "kospi200", "subCategory": "covered_call", "dividendYield": 10.90, "exact_kofia_name": "신한SOL200타겟위클리커버드콜증권상장지수투자신탁[주식-파생형]"},
    {"code": "0219E0", "name": "KODEX 200커버드콜액티브", "company": "삼성자산운용", "category": "kospi200", "subCategory": "covered_call", "dividendYield": 8.80, "exact_kofia_name": "삼성KODEX200커버드콜액티브증권상장지수투자신탁[주식-파생형]"},
    {"code": "0210E0", "name": "PLUS 200커버드콜액티브", "company": "한화자산운용", "category": "kospi200", "subCategory": "covered_call", "dividendYield": 8.50, "exact_kofia_name": "한화PLUS200커버드콜액티브증권상장지수투자신탁(주식-파생형)"},
    {"code": "289480", "name": "TIGER 200커버드콜", "company": "미래에셋자산운용", "category": "kospi200", "subCategory": "covered_call", "dividendYield": 8.50, "exact_kofia_name": "미래에셋TIGER200커버드콜증권상장지수투자신탁(주식-파생형)"},
    # [액티브]
    {"code": "451060", "name": "1Q 200액티브", "company": "하나자산운용", "category": "kospi200", "subCategory": "active", "dividendYield": 1.20, "exact_kofia_name": "하나1Q200액티브증권상장지수투자신탁[주식]"},
    {"code": "494890", "name": "KODEX 200액티브", "company": "삼성자산운용", "category": "kospi200", "subCategory": "active", "dividendYield": 1.50, "exact_kofia_name": "삼성KODEX200액티브증권상장지수투자신탁[주식-파생형]"},
    # [레버리지 - 순수 현물 2배 3대장]
    {"code": "122630", "name": "KODEX 레버리지", "company": "삼성자산운용", "category": "kospi200", "subCategory": "leverage", "dividendYield": 0.00, "exact_kofia_name": "삼성KODEX레버리지증권상장지수투자신탁[주식-파생형]"},
    {"code": "123320", "name": "TIGER 레버리지", "company": "미래에셋자산운용", "category": "kospi200", "subCategory": "leverage", "dividendYield": 0.00, "exact_kofia_name": "미래에셋TIGER레버리지증권상장지수투자신탁[주식-파생형]"},
    {"code": "152500", "name": "ACE 레버리지", "company": "한국투자신탁운용", "category": "kospi200", "subCategory": "leverage", "dividendYield": 0.00, "exact_kofia_name": "한국투자ACE레버리지증권상장지수투자신탁(주식-파생형)"},
]

US_ETF_TARGETS = [
    # S&P 500 (기본 패시브)
    {"ticker": "SPYM", "displayTicker": "SPYM", "name": "SPDR Portfolio S&P 500 ETF", "company": "State Street", "category": "sp500", "subCategory": "standard", "trackingIndex": "S&P 500", "expenseRatio": 0.02, "dividendSchedule": "분기 (3,6,9,12월)", "dividendYield": 1.22, "aumBillions": 173.6},
    {"ticker": "VOO", "displayTicker": "VOO", "name": "Vanguard S&P 500 ETF", "company": "Vanguard", "category": "sp500", "subCategory": "standard", "trackingIndex": "S&P 500", "expenseRatio": 0.03, "dividendSchedule": "분기 (3,6,9,12월)", "dividendYield": 1.22, "aumBillions": 1729.3},
    {"ticker": "IVV", "displayTicker": "IVV", "name": "iShares Core S&P 500 ETF", "company": "BlackRock", "category": "sp500", "subCategory": "standard", "trackingIndex": "S&P 500", "expenseRatio": 0.03, "dividendSchedule": "분기 (3,6,9,12월)", "dividendYield": 1.22, "aumBillions": 881.3},
    {"ticker": "SPY", "displayTicker": "SPY", "name": "SPDR S&P 500 ETF Trust", "company": "State Street", "category": "sp500", "subCategory": "standard", "trackingIndex": "S&P 500", "expenseRatio": 0.0945, "dividendSchedule": "분기 (3,6,9,12월)", "dividendYield": 1.22, "aumBillions": 809.2},
    # S&P 500 (커버드콜 · 인컴)
    {"ticker": "SPYI", "displayTicker": "SPYI", "name": "NEOS S&P 500 High Income ETF", "company": "NEOS", "category": "sp500", "subCategory": "covered_call", "trackingIndex": "S&P 500 High Income", "expenseRatio": 0.68, "dividendSchedule": "월배당", "dividendYield": 12.15, "aumBillions": 2.1},
    {"ticker": "XYLD", "displayTicker": "XYLD", "name": "Global X S&P 500 Covered Call ETF", "company": "Global X", "category": "sp500", "subCategory": "covered_call", "trackingIndex": "Cboe S&P 500 BuyWrite", "expenseRatio": 0.60, "dividendSchedule": "월배당", "dividendYield": 9.85, "aumBillions": 2.8},
    # S&P 500 (레버리지)
    {"ticker": "SSO", "displayTicker": "SSO", "name": "ProShares Ultra S&P 500 (2X)", "company": "ProShares", "category": "sp500", "subCategory": "leverage", "trackingIndex": "S&P 500 2X", "expenseRatio": 0.89, "dividendSchedule": "분기", "dividendYield": 0.65, "aumBillions": 6.8},
    {"ticker": "UPRO", "displayTicker": "UPRO", "name": "ProShares UltraPro S&P 500 (3X)", "company": "ProShares", "category": "sp500", "subCategory": "leverage", "trackingIndex": "S&P 500 3X", "expenseRatio": 0.91, "dividendSchedule": "분기", "dividendYield": 0.72, "aumBillions": 5.4},

    # 나스닥 100 (기본 패시브)
    {"ticker": "QNDX", "displayTicker": "QNDX", "name": "SPDR Portfolio Nasdaq 100 ETF", "company": "State Street", "category": "nasdaq100", "subCategory": "standard", "trackingIndex": "NASDAQ-100", "expenseRatio": 0.10, "dividendSchedule": "분기 (3,6,9,12월)", "dividendYield": 0.58, "aumBillions": 0.5},
    {"ticker": "IQQ", "displayTicker": "IQQ", "name": "iShares Nasdaq 100 ETF", "company": "BlackRock", "category": "nasdaq100", "subCategory": "standard", "trackingIndex": "NASDAQ-100", "expenseRatio": 0.05, "dividendSchedule": "분기 (3,6,9,12월)", "dividendYield": 0.58, "aumBillions": 0.3},
    {"ticker": "QQQM", "displayTicker": "QQQM", "name": "Invesco NASDAQ 100 ETF", "company": "Invesco", "category": "nasdaq100", "subCategory": "standard", "trackingIndex": "NASDAQ-100", "expenseRatio": 0.15, "dividendSchedule": "분기 (3,6,9,12월)", "dividendYield": 0.58, "aumBillions": 109.8},
    {"ticker": "QQQ", "displayTicker": "QQQ", "name": "Invesco QQQ Trust", "company": "Invesco", "category": "nasdaq100", "subCategory": "standard", "trackingIndex": "NASDAQ-100", "expenseRatio": 0.20, "dividendSchedule": "분기 (3,6,9,12월)", "dividendYield": 0.58, "aumBillions": 498.9},
    # 나스닥 100 (커버드콜 · 인컴)
    {"ticker": "QQQI", "displayTicker": "QQQI", "name": "NEOS Nasdaq-100 High Income ETF", "company": "NEOS", "category": "nasdaq100", "subCategory": "covered_call", "trackingIndex": "Nasdaq-100 High Income", "expenseRatio": 0.68, "dividendSchedule": "월배당", "dividendYield": 14.20, "aumBillions": 1.5},
    {"ticker": "QYLD", "displayTicker": "QYLD", "name": "Global X Nasdaq 100 Covered Call ETF", "company": "Global X", "category": "nasdaq100", "subCategory": "covered_call", "trackingIndex": "Cboe Nasdaq-100 BuyWrite", "expenseRatio": 0.60, "dividendSchedule": "월배당", "dividendYield": 11.45, "aumBillions": 7.9},
    # 나스닥 100 (레버리지)
    {"ticker": "TQQQ", "displayTicker": "TQQQ", "name": "ProShares UltraPro QQQ (3X)", "company": "ProShares", "category": "nasdaq100", "subCategory": "leverage", "trackingIndex": "NASDAQ-100 3X", "expenseRatio": 0.88, "dividendSchedule": "분기", "dividendYield": 1.05, "aumBillions": 28.5},
    {"ticker": "QLD", "displayTicker": "QLD", "name": "ProShares Ultra QQQ (2X)", "company": "ProShares", "category": "nasdaq100", "subCategory": "leverage", "trackingIndex": "NASDAQ-100 2X", "expenseRatio": 0.95, "dividendSchedule": "분기", "dividendYield": 0.40, "aumBillions": 9.2},

    # 배당 성장 (SCHD 등)
    {"ticker": "SCHD", "displayTicker": "SCHD", "name": "Schwab U.S. Dividend Equity ETF", "company": "Charles Schwab", "category": "schd", "subCategory": "standard", "trackingIndex": "Dow Jones US Dividend 100", "expenseRatio": 0.06, "dividendSchedule": "분기 (3,6,9,12월)", "dividendYield": 3.48, "aumBillions": 107.9},
    {"ticker": "DGRO", "displayTicker": "DGRO", "name": "iShares Core Dividend Growth ETF", "company": "BlackRock", "category": "schd", "subCategory": "standard", "trackingIndex": "Morningstar US Div Growth", "expenseRatio": 0.08, "dividendSchedule": "분기 (3,6,9,12월)", "dividendYield": 2.15, "aumBillions": 41.9},
    {"ticker": "VIG", "displayTicker": "VIG", "name": "Vanguard Dividend Appreciation ETF", "company": "Vanguard", "category": "schd", "subCategory": "standard", "trackingIndex": "S&P US Div Growers", "expenseRatio": 0.06, "dividendSchedule": "분기 (3,6,9,12월)", "dividendYield": 1.75, "aumBillions": 127.6},

    # 미국 채권군 (종합채권 / 장기채 / 초단기 / 커버드콜)
    {"ticker": "BND", "displayTicker": "BND", "name": "Vanguard Total Bond Market ETF", "company": "Vanguard", "category": "bonds", "subCategory": "standard", "trackingIndex": "Bloomberg U.S. Aggregate Float", "expenseRatio": 0.03, "dividendSchedule": "월배당", "dividendYield": 4.15, "aumBillions": 340.5},
    {"ticker": "AGG", "displayTicker": "AGG", "name": "iShares Core U.S. Aggregate Bond ETF", "company": "BlackRock", "category": "bonds", "subCategory": "standard", "trackingIndex": "Bloomberg U.S. Aggregate Bond", "expenseRatio": 0.03, "dividendSchedule": "월배당", "dividendYield": 4.10, "aumBillions": 125.2},
    {"ticker": "SGOV", "displayTicker": "SGOV", "name": "iShares 0-3 Month Treasury Bond ETF", "company": "BlackRock", "category": "bonds", "subCategory": "standard", "trackingIndex": "ICE 0-3M US Treasury", "expenseRatio": 0.07, "dividendSchedule": "월배당", "dividendYield": 5.18, "aumBillions": 112.3},
    {"ticker": "SHV", "displayTicker": "SHV", "name": "iShares Short Treasury Bond ETF", "company": "BlackRock", "category": "bonds", "subCategory": "standard", "trackingIndex": "ICE Short US Treasury", "expenseRatio": 0.15, "dividendSchedule": "월배당", "dividendYield": 5.10, "aumBillions": 18.5},
    {"ticker": "BIL", "displayTicker": "BIL", "name": "SPDR Bloomberg 1-3 Month T-Bill ETF", "company": "State Street", "category": "bonds", "subCategory": "standard", "trackingIndex": "Bloomberg 1-3M US Treasury", "expenseRatio": 0.135, "dividendSchedule": "월배당", "dividendYield": 5.15, "aumBillions": 38.2},
    {"ticker": "TLT", "displayTicker": "TLT", "name": "iShares 20+ Year Treasury Bond ETF", "company": "BlackRock", "category": "bonds", "subCategory": "standard", "trackingIndex": "ICE US Treasury 20+ Year", "expenseRatio": 0.15, "dividendSchedule": "월배당", "dividendYield": 4.12, "aumBillions": 46.2},
    {"ticker": "IEF", "displayTicker": "IEF", "name": "iShares 7-10 Year Treasury Bond ETF", "company": "BlackRock", "category": "bonds", "subCategory": "standard", "trackingIndex": "ICE US Treasury 7-10 Year", "expenseRatio": 0.15, "dividendSchedule": "월배당", "dividendYield": 3.78, "aumBillions": 41.6},
    {"ticker": "TLTW", "displayTicker": "TLTW", "name": "iShares 20+ Year Treasury Bond BuyWrite ETF", "company": "BlackRock", "category": "bonds", "subCategory": "covered_call", "trackingIndex": "Cboe TLT BuyWrite", "expenseRatio": 0.35, "dividendSchedule": "월배당", "dividendYield": 15.80, "aumBillions": 1.2},
    # 미국 채권 (레버리지)
    {"ticker": "TMF", "displayTicker": "TMF", "name": "Direxion Daily 20+ Year Treasury Bull 3X Shares", "company": "Direxion", "category": "bonds", "subCategory": "leverage", "trackingIndex": "ICE US Treasury 20+ Year 3X", "expenseRatio": 1.04, "dividendSchedule": "분기", "dividendYield": 3.85, "aumBillions": 4.1},

    # 월배당 / 고배당 인컴
    {"ticker": "JEPI", "displayTicker": "JEPI", "name": "JPMorgan Equity Premium Income ETF", "company": "J.P. Morgan", "category": "income", "subCategory": "covered_call", "trackingIndex": "S&P 500 Covered Call", "expenseRatio": 0.35, "dividendSchedule": "월배당", "dividendYield": 7.82, "aumBillions": 45.3},
    {"ticker": "JEPQ", "displayTicker": "JEPQ", "name": "JPMorgan Nasdaq Equity Premium Income ETF", "company": "J.P. Morgan", "category": "income", "subCategory": "covered_call", "trackingIndex": "Nasdaq-100 Covered Call", "expenseRatio": 0.35, "dividendSchedule": "월배당", "dividendYield": 9.12, "aumBillions": 44.3},
    {"ticker": "DIVO", "displayTicker": "DIVO", "name": "Amplify CWP Enhanced Dividend Income ETF", "company": "Amplify", "category": "income", "subCategory": "covered_call", "trackingIndex": "Enhanced Dividend Income", "expenseRatio": 0.55, "dividendSchedule": "월배당", "dividendYield": 4.85, "aumBillions": 3.4},
]

# -------------------------------------------------------------
# 2. 금융투자협회(KOFIA DIS) 공식 데이터 조회
# -------------------------------------------------------------
def get_kofia_latest_date():
    req_xml = """<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISComCalendarSO</pfmSvcName>
    <pfmFnName>getLastDt</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
  <COMDataDynmDTO>
    <txCd>DIS0001</txCd>
  </COMDataDynmDTO>
</message>"""
    try:
        p = subprocess.Popen(
            ['curl', '-s', '-X', 'POST', 'https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/',
             '-d', req_xml, '-H', 'Content-Type: text/xml'],
            stdout=subprocess.PIPE
        )
        out, _ = p.communicate()
        root = ET.fromstring(out)
        dt_list = [elem.text for elem in root.findall('.//standardDt') if elem.text]
        if dt_list:
            today_str = datetime.now().strftime("%Y%m%d")
            past_dates = [d for d in dt_list if d <= today_str]
            if past_dates:
                return past_dates[-1]
            return dt_list[0]
    except Exception as e:
        print(f"[KOFIA Date Error] {e}")
    prev_date = load_previous_payload().get("kofiaBaseDate", "")
    return prev_date.replace(".", "") if prev_date else datetime.now().strftime("%Y%m%d")

def fetch_kofia_fees(std_date):
    keywords = ["미국S&P500", "미국나스닥100", "미국배당다우존스", "200", "미국30년국채", "레버리지", "KODEX레버리지", "PLUS200", "HANARO200", "TIGERS&P500", "PLUSS&P500", "KODEX 미국나스닥100"]
    fee_map = {}

    for kw in keywords:
        escaped_kw = kw.replace('&', '&amp;')
        req_xml = f"""<?xml version="1.0" encoding="utf-8"?>
<message>
  <proframeHeader>
    <pfmAppName>FS-DIS2</pfmAppName>
    <pfmSvcName>DISFundFeeCmsSO</pfmSvcName>
    <pfmFnName>select</pfmFnName>
  </proframeHeader>
  <systemHeader></systemHeader>
  <DISCondFuncDTO>
    <tmpV30>{std_date}</tmpV30>
    <tmpV12>{escaped_kw}</tmpV12>
  </DISCondFuncDTO>
</message>"""
        try:
            p = subprocess.Popen(
                ['curl', '-s', '--max-time', '10', '-X', 'POST', 'https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/',
                 '-d', req_xml, '-H', 'Content-Type: text/xml'],
                stdout=subprocess.PIPE
            )
            out, _ = p.communicate()
            root = ET.fromstring(out)
            for meta in root.findall('.//selectMeta'):
                company = meta.findtext('tmpV1', '').strip()
                fund_nm = meta.findtext('tmpV2', '').strip()
                total_fee = float(meta.findtext('tmpV9', '0') or 0)
                etc_fee = float(meta.findtext('tmpV11', '0') or 0)
                ter = float(meta.findtext('tmpV12', '0') or 0)
                trade_fee = float(meta.findtext('tmpV16', '0') or 0)
                actual_fee = round(ter + trade_fee, 4)
                code = meta.findtext('tmpV15', '').strip()

                fee_map[fund_nm] = {
                    "company": company,
                    "fund_name": fund_nm,
                    "total_fee": total_fee,
                    "etc_fee": etc_fee,
                    "ter": ter,
                    "trade_fee": trade_fee,
                    "actual_fee": actual_fee,
                    "standard_code": code,
                }
        except Exception as e:
            print(f"[KOFIA Fetch Error - {kw}] {e}")

    return fee_map

# -------------------------------------------------------------
# 3. 네이버 공식 ETF 전체 리스트 API (가격, 순자산총액)
# -------------------------------------------------------------
def fetch_all_naver_etf_map():
    url = "https://finance.naver.com/api/sise/etfItemList.nhn"
    res_map = {}
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        raw = urllib.request.urlopen(req, timeout=5).read().decode('cp949', errors='ignore')
        data = json.loads(raw)
        for item in data.get('result', {}).get('etfItemList', []):
            code = item.get('itemcode')
            rate_val = item.get('threeMonthEarnRate')
            r3m = 0.0
            if rate_val is not None:
                try:
                    r3m = round(float(rate_val), 2)
                except (ValueError, TypeError):
                    r3m = 0.0
            res_map[code] = {
                "name": item.get('itemname'),
                "price": item.get('nowVal', 0),
                "marketCap": item.get('marketSum', 0), # 억원 단위
                "return3m": r3m,
            }
    except Exception as e:
        print(f"[Naver ETF List Error] {e}")
    return res_map

def fetch_naver_weekly_prices(code, count=52):
    url = f"https://fchart.stock.naver.com/siseJson.nhn?symbol={code}&requestType=0&count=60&timeframe=week"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        raw = urllib.request.urlopen(req, timeout=5).read().decode('cp949', errors='ignore')
        lines = [line.strip() for line in raw.strip().split('\n') if line.strip()]
        prices = []
        for line in lines:
            line = line.strip('[], \r\n')
            if not line:
                continue
            parts = [p.strip(' "\'') for p in line.split(',')]
            if len(parts) >= 5:
                dt_str = parts[0].strip()
                try:
                    close_val = float(parts[4].strip())
                    prices.append({"date": dt_str, "close": close_val})
                except ValueError:
                    continue
        return prices[-count:] if len(prices) > count else prices
    except Exception as e:
        print(f"[Naver Chart Error {code}] {e}")
        return []

# -------------------------------------------------------------
# 4. 야후 파이낸스 미국 직투 ETF 52주 주봉 및 시세
# -------------------------------------------------------------
def fetch_yahoo_stock_data(ticker):
    result = {
        "price": 0.0,
        "return1m": 0.0,
        "return3m": 0.0,
        "return1y": 0.0,
        "weeklyPrices": [],
    }
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1wk&range=1y"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        raw = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
        data = json.loads(raw)
        chart = data.get("chart", {}).get("result", [{}])[0]
        meta = chart.get("meta", {})
        result["price"] = round(float(meta.get("regularMarketPrice", 0)), 2)

        timestamps = chart.get("timestamp", [])
        quotes = chart.get("indicators", {}).get("quote", [{}])[0].get("close", [])

        weekly = []
        for ts, q in zip(timestamps, quotes):
            if q is not None:
                dt_str = datetime.fromtimestamp(ts).strftime("%Y%m%d")
                weekly.append({"date": dt_str, "close": round(float(q), 2)})
        result["weeklyPrices"] = weekly

        if weekly:
            curr = weekly[-1]["close"]
            if len(weekly) >= 4 and weekly[-4]["close"]:
                result["return1m"] = round(((curr / weekly[-4]["close"]) - 1) * 100, 2)
            if len(weekly) >= 13 and weekly[-13]["close"]:
                result["return3m"] = round(((curr / weekly[-13]["close"]) - 1) * 100, 2)
            if len(weekly) >= 45 and weekly[0]["close"]:
                result["return1y"] = round(((curr / weekly[0]["close"]) - 1) * 100, 2)
    except Exception as e:
        print(f"[Yahoo Error {ticker}] {e}")

    return result

# -------------------------------------------------------------
# 4-1. yfinance 기반 배당률 / 순자산(AUM) / 운용보수 수집 (실패 시 None → 이전값 유지)
# -------------------------------------------------------------
def fetch_trailing_dividend_yield(symbol):
    """최근 12개월 분배금 합계 ÷ 현재 가격 × 100. 조회 실패·이상치면 None."""
    try:
        import yfinance as yf
        import pandas as pd
        tk = yf.Ticker(symbol)
        hist = tk.history(period="5d")
        if hist is None or hist.empty:
            return None
        price = float(hist["Close"].dropna().iloc[-1])
        divs = tk.dividends
        if price <= 0 or divs is None or len(divs) == 0:
            return None
        cutoff = pd.Timestamp.now(tz=divs.index.tz) - pd.Timedelta(days=365)
        total = float(divs[divs.index >= cutoff].sum())
        if total <= 0:
            return None
        value = round(total / price * 100, 2)
        return value if 0 < value <= 40 else None
    except Exception as e:
        print(f"[yfinance Dividend Error {symbol}] {e}")
        return None

def fetch_us_fund_profile(ticker):
    """미국 ETF 순자산(십억 달러)과 운용보수(%). 항목별로 실패 시 None."""
    profile = {"aumBillions": None, "expenseRatio": None}
    try:
        import yfinance as yf
        info = yf.Ticker(ticker).info or {}
        assets = info.get("totalAssets")
        if assets and float(assets) > 0:
            profile["aumBillions"] = round(float(assets) / 1e9, 1)
        net = info.get("netExpenseRatio")
        annual = info.get("annualReportExpenseRatio")
        if net is not None and 0 < float(net) < 3:
            profile["expenseRatio"] = round(float(net), 4)
        elif annual is not None and 0 < float(annual) < 0.03:
            profile["expenseRatio"] = round(float(annual) * 100, 4)
    except Exception as e:
        print(f"[yfinance Profile Error {ticker}] {e}")
    return profile

def write_github_output(summary):
    """GitHub Actions 단계 출력(텔레그램 알림용)."""
    path = os.environ.get("GITHUB_OUTPUT")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write(f"summary={summary}\n")

# -------------------------------------------------------------
# 5. 메인 함수
# -------------------------------------------------------------
def main():
    prev = load_previous_payload()
    prev_kr = {e["code"]: e for e in prev.get("krEtfs", [])}
    prev_us = {e["ticker"]: e for e in prev.get("usEtfs", [])}
    stats = {"fee_kofia": 0, "fee_prev": 0, "fee_default": 0, "div_live": 0, "div_kept": 0,
             "us_aum_live": 0, "us_aum_kept": 0, "us_fee_live": 0, "us_fee_kept": 0}
    fee_fallback_names = []

    print("▶ [1/4] KOFIA 최신 공시 기준일자 확인 중...")
    std_date = get_kofia_latest_date()
    formatted_date = f"{std_date[:4]}.{std_date[4:6]}.{std_date[6:8]}"
    print(f"   공식 공시 기준일: {formatted_date}")

    print("▶ [2/4] 금융투자협회(KOFIA DIS) 공식 수수료 데이터 수집 중...")
    kofia_fees = fetch_kofia_fees(std_date)
    print(f"   KOFIA 수집 완료: {len(kofia_fees)}개 펀드 레코드 확보")

    print("▶ [3/4] 국내 ETF 시세, 수수료, 52주 주봉 시계열 정밀 매핑 중...")
    naver_etf_map = fetch_all_naver_etf_map()

    kr_etfs = []
    for item in KR_ETF_TARGETS:
        code = item["code"]
        name = item["name"]
        exact_name = item.get("exact_kofia_name")

        matched_fee = None
        if exact_name and exact_name in kofia_fees:
            matched_fee = kofia_fees[exact_name]
        else:
            for k_name, f_data in kofia_fees.items():
                if name.replace(" ", "") in k_name.replace(" ", "") and item["company"] in f_data["company"]:
                    matched_fee = f_data
                    break

        prev_item = prev_kr.get(code, {})
        market_info = naver_etf_map.get(code)
        if not market_info:
            market_info = {
                "price": prev_item.get("price", 0),
                "marketCap": prev_item.get("marketCap", 0),
                "return3m": prev_item.get("return3m", 0.0),
            }
        weekly_prices = fetch_naver_weekly_prices(code)

        # 1년 수익률 계산 (52주 기준)
        return1y = 0.0
        if weekly_prices and len(weekly_prices) >= 20 and weekly_prices[0]["close"] > 0:
            return1y = round(((weekly_prices[-1]["close"] / weekly_prices[0]["close"]) - 1) * 100, 2)
        else:
            return1y = prev_item.get("return1y", 0.0)
            weekly_prices = prev_item.get("weeklyPrices", weekly_prices)

        # 수수료: KOFIA 공시 → 실패 시 이전 공시값 유지 → 이전값도 없을 때만 기본값
        if matched_fee:
            total_fee, etc_fee = matched_fee["total_fee"], matched_fee["etc_fee"]
            ter, trade_fee = matched_fee["ter"], matched_fee["trade_fee"]
            actual_fee = matched_fee["actual_fee"]
            stats["fee_kofia"] += 1
        elif "actualFee" in prev_item:
            total_fee, etc_fee = prev_item["totalFee"], prev_item["etcFee"]
            ter, trade_fee = prev_item["ter"], prev_item["tradeFee"]
            actual_fee = prev_item["actualFee"]
            stats["fee_prev"] += 1
            fee_fallback_names.append(name)
        else:
            total_fee, etc_fee, trade_fee = 0.007, 0.06, 0.03
            ter = total_fee + etc_fee
            actual_fee = round(ter + trade_fee, 4)
            stats["fee_default"] += 1
            fee_fallback_names.append(name)

        # 배당률: TR(토탈리턴)·레버리지 등 무배당 확정 상품은 0.0% 정상 처리, 그 외는 yfinance 최근 12개월 분배금 기준
        is_zero_div_product = "TR" in name or item.get("subCategory") == "leverage" or item.get("dividendYield") == 0.0
        if is_zero_div_product:
            dividend_yield = 0.0
            stats["div_live"] += 1
        else:
            live_div = fetch_trailing_dividend_yield(f"{code}.KS")
            if live_div is not None:
                dividend_yield = live_div
                stats["div_live"] += 1
            else:
                dividend_yield = prev_item.get("dividendYield", item.get("dividendYield", 1.2))
                stats["div_kept"] += 1
        item = {**item, "dividendYield": dividend_yield}

        kr_etfs.append({
            "id": f"kr-{code}",
            "code": code,
            "name": name,
            "company": item["company"],
            "category": item["category"],
            "subCategory": item.get("subCategory", "standard"),
            "trackingIndex": item.get("trackingIndex", "기초지수"),
            "dividendYield": item.get("dividendYield", 1.2),
            "totalFee": round(total_fee, 4),
            "etcFee": round(etc_fee, 4),
            "ter": round(ter, 4),
            "tradeFee": round(trade_fee, 4),
            "actualFee": round(actual_fee, 4),
            "price": market_info["price"],
            "marketCap": market_info["marketCap"],
            "return3m": market_info["return3m"],
            "return1y": return1y,
            "weeklyPrices": weekly_prices,
            "isDomestic": True,
        })
        print(f"   ✓ [{item.get('subCategory', 'std'):12}] {name:32} ({code}): 실부담 {actual_fee:.4f}% | 1년수익률 {return1y:+.2f}% | 배당률 {item.get('dividendYield')}% | 순자산 {market_info['marketCap']:,}억")

    kr_etfs.sort(key=lambda x: (x["category"], x["actualFee"]))

    print("\n▶ [4/4] 미국 직투 ETF 시세 및 운용보수, 52주 주봉 매핑 중...")
    us_etfs = []
    for item in US_ETF_TARGETS:
        ticker = item["ticker"]
        y_data = fetch_yahoo_stock_data(ticker)
        prev_item = prev_us.get(ticker, {})
        if not y_data["price"] and prev_item:
            y_data = {k: prev_item.get(k, v) for k, v in y_data.items()}

        profile = fetch_us_fund_profile(ticker)
        if profile["aumBillions"] is not None:
            aum = profile["aumBillions"]
            stats["us_aum_live"] += 1
        else:
            aum = prev_item.get("aumBillions", item.get("aumBillions", 0.0))
            stats["us_aum_kept"] += 1
        if profile["expenseRatio"] is not None:
            expense = profile["expenseRatio"]
            stats["us_fee_live"] += 1
        else:
            expense = prev_item.get("expenseRatio", item["expenseRatio"])
            stats["us_fee_kept"] += 1

        live_div = fetch_trailing_dividend_yield(ticker)
        if live_div is not None:
            dividend_yield = live_div
            stats["div_live"] += 1
        else:
            dividend_yield = prev_item.get("dividendYield", item.get("dividendYield", 1.2))
            stats["div_kept"] += 1

        us_etfs.append({
            "id": f"us-{ticker.lower()}",
            "ticker": ticker,
            "displayTicker": item.get("displayTicker", ticker),
            "name": item["name"],
            "company": item["company"],
            "category": item["category"],
            "subCategory": item.get("subCategory", "standard"),
            "trackingIndex": item.get("trackingIndex", "기초지수"),
            "dividendYield": dividend_yield,
            "expenseRatio": expense,
            "dividendSchedule": item["dividendSchedule"],
            "price": y_data["price"],
            "aumBillions": aum,
            "return1m": y_data["return1m"],
            "return3m": y_data["return3m"],
            "return1y": y_data["return1y"],
            "weeklyPrices": y_data["weeklyPrices"],
            "isDomestic": False,
        })
        print(f"   ✓ [{item.get('subCategory', 'std'):12}] {ticker:6}: 보수 {expense}% | 현재가 ${y_data['price']} | 1년수익률 {y_data['return1y']}% | 배당률 {dividend_yield}% | AUM ${aum}B")

    us_etfs.sort(key=lambda x: (x["category"], x["expenseRatio"]))

    output_payload = {
        "updatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "kofiaBaseDate": formatted_date,
        "categories": [
            {"id": "all", "label": "전체"},
            {"id": "sp500", "label": "S&P 500"},
            {"id": "nasdaq100", "label": "나스닥 100"},
            {"id": "schd", "label": "미국배당다우존스"},
            {"id": "bonds", "label": "미국 30년 국채"},
            {"id": "kospi200", "label": "코스피 200"},
            {"id": "income", "label": "월배당/인컴"},
        ],
        "subCategories": [
            {"id": "all", "label": "전체"},
            {"id": "standard", "label": "기본"},
            {"id": "hedged", "label": "환헤지 (H)"},
            {"id": "covered_call", "label": "커버드콜"},
            {"id": "active", "label": "액티브"},
            {"id": "leverage", "label": "레버리지"},
        ],
        "krEtfs": kr_etfs,
        "usEtfs": us_etfs,
    }

    target_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src/data/etfFees.json"))
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, ensure_ascii=False, indent=2)

    print(f"\n✨ 완료! 총 국내 {len(kr_etfs)}개 + 미국 {len(us_etfs)}개 ETF 데이터가 {target_path} 에 성공적으로 저장되었습니다.")

    total = len(kr_etfs) + len(us_etfs)
    summary = (
        f"총 {total}개 ETF(국내 {len(kr_etfs)}·미국 {len(us_etfs)}) 동기화 완료. "
        f"KOFIA 공시 기준일 {formatted_date}, 공시 수수료 반영 {stats['fee_kofia']}/{len(kr_etfs)}개, "
        f"배당률 실시간 {stats['div_live']}/{total}개, 미국 순자산 {stats['us_aum_live']}/{len(us_etfs)}개, "
        f"미국 운용보수 {stats['us_fee_live']}/{len(us_etfs)}개 최신화."
    )
    if fee_fallback_names:
        summary += f" ⚠ 공시 미매칭으로 이전 값 유지 {len(fee_fallback_names)}개: " + ", ".join(fee_fallback_names[:5])
    print(summary)
    write_github_output(summary)

    if stats["fee_kofia"] == 0:
        print("❌ KOFIA 공시 수수료를 한 건도 가져오지 못했습니다.")
        sys.exit(1)

if __name__ == "__main__":
    main()

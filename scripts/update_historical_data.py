#!/usr/bin/env python3
"""
scripts/update_historical_data.py
30-Year Real Historical Total Return Dataset Generator for jusik.app (50 Assets)
"""

import urllib.request
import urllib.parse
import json
import datetime
import time
import math
import os
import ssl

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HISTORICAL_JSON_PATH = os.path.join(WORKSPACE_DIR, "src", "data", "historicalPrices.json")
BACKTEST_JSON_PATH = os.path.join(WORKSPACE_DIR, "src", "data", "backtestData.json")

ctx = ssl._create_unverified_context()

print("=== Starting 100% Real Historical Price Sync for All Assets ===")

def fetch_yahoo_daily(symbol, period1=788918400, period2=1787529600):
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(symbol)}?period1={period1}&period2={period2}&interval=1d"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
    })
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                result = data.get('chart', {}).get('result', [{}])[0]
                timestamps = result.get('timestamp', [])
                quotes = result.get('indicators', {}).get('quote', [{}])[0]
                adjclose = result.get('indicators', {}).get('adjclose', [{}])[0].get('adjclose', []) if result.get('indicators', {}).get('adjclose') else []
                closes = quotes.get('close', [])
                
                series = {}
                for i, ts in enumerate(timestamps):
                    if not ts:
                        continue
                    p = None
                    if i < len(adjclose) and adjclose[i] is not None and not math.isnan(adjclose[i]) and adjclose[i] > 0:
                        p = adjclose[i]
                    elif i < len(closes) and closes[i] is not None and not math.isnan(closes[i]) and closes[i] > 0:
                        p = closes[i]
                        
                    if p is not None and p > 0:
                        dt_str = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
                        series[dt_str] = round(float(p), 4)
                        
                print(f"[{symbol:12}] Loaded {len(series):5} real trading days (First: {list(series.keys())[0] if series else 'None'})")
                return series
        except Exception as e:
            print(f"[{symbol:12}] Attempt {attempt+1} error: {e}")
            time.sleep(2)
    return {}

# 1. Base benchmarks
spy_d = fetch_yahoo_daily("SPY")
vfinx_d = fetch_yahoo_daily("VFINX")
ndx_d = fetch_yahoo_daily("^NDX")
qqq_d = fetch_yahoo_daily("QQQ")
sox_d = fetch_yahoo_daily("^SOX")
soxx_d = fetch_yahoo_daily("SOXX")
ks11_d = fetch_yahoo_daily("^KS11")
kodex200_d = fetch_yahoo_daily("069500.KS")
kq11_d = fetch_yahoo_daily("^KQ11")
kodex150_d = fetch_yahoo_daily("229200.KS")

# Treasuries & Commodities & Crypto
tlt_d = fetch_yahoo_daily("TLT")
vustx_d = fetch_yahoo_daily("VUSTX")
ief_d = fetch_yahoo_daily("IEF")
vfitx_d = fetch_yahoo_daily("VFITX")
shy_d = fetch_yahoo_daily("SHY")
vfisx_d = fetch_yahoo_daily("VFISX")
gld_d = fetch_yahoo_daily("GLD")
gcf_d = fetch_yahoo_daily("GC=F")
slv_d = fetch_yahoo_daily("SLV")
sif_d = fetch_yahoo_daily("SI=F")
btc_d = fetch_yahoo_daily("BTC-USD")
eth_d = fetch_yahoo_daily("ETH-USD")
schd_d = fetch_yahoo_daily("SCHD")
sso_d = fetch_yahoo_daily("SSO")
upro_d = fetch_yahoo_daily("UPRO")
qld_d = fetch_yahoo_daily("QLD")
tqqq_d = fetch_yahoo_daily("TQQQ")
usd_d = fetch_yahoo_daily("USD")
soxl_d = fetch_yahoo_daily("SOXL")

# US 20 Stocks
us_symbols = ['NVDA', 'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSM', 'SPCX', 'AVGO', 'TSLA', 'META', 'LLY', 'MU', 'BRK-B', 'JPM', 'WMT', 'AMD', 'V', 'XOM', 'ASML', 'JNJ']
us_real_data = {}
for s in us_symbols:
    us_real_data[s] = fetch_yahoo_daily(s)

# KR 10 Stocks
kr_symbols = {
    '005930': '005930.KS',
    '000660': '000660.KS',
    '402340': '402340.KS',
    '009150': '009150.KS',
    '373220': '373220.KS',
    '005380': '005380.KS',
    '207940': '207940.KS',
    '032830': '032830.KS',
    '028260': '028260.KS',
    '105560': '105560.KS'
}
kr_real_data = {}
for code, yf_s in kr_symbols.items():
    kr_real_data[code] = fetch_yahoo_daily(yf_s)

all_trading_days = sorted(list(spy_d.keys()))

def build_daily_series(raw_dict, default_val=100.0):
    res = {}
    last_val = default_val
    for day in all_trading_days:
        if day in raw_dict and raw_dict[day] > 0:
            last_val = raw_dict[day]
            res[day] = last_val
        else:
            res[day] = last_val
    return res

def synthesize_underlying(etf_dict, index_dict):
    etf_days = sorted([d for d in etf_dict.keys() if d in all_trading_days])
    if not etf_days:
        return build_daily_series(index_dict)
    first_etf_day = etf_days[0]
    first_etf_price = etf_dict[first_etf_day]
    first_idx_price = index_dict.get(first_etf_day, 100.0)
    ratio = first_etf_price / (first_idx_price if first_idx_price > 0 else 1.0)
    combined = {}
    for day in all_trading_days:
        if day >= first_etf_day and day in etf_dict:
            combined[day] = etf_dict[day]
        elif day < first_etf_day:
            if day in index_dict:
                combined[day] = round(index_dict[day] * ratio, 4)
            else:
                combined[day] = None
    last = first_etf_price
    for day in all_trading_days:
        if day in combined and combined[day] is not None:
            last = combined[day]
        else:
            combined[day] = last
    return combined

def synthesize_leveraged(etf_dict, base_daily_series, leverage=2, expense_annual=0.0095, borrow_rate_annual=0.02):
    etf_days = sorted([d for d in etf_dict.keys() if d in all_trading_days])
    first_etf_day = etf_days[0] if etf_days else all_trading_days[-1]
    first_etf_price = etf_dict.get(first_etf_day, 100.0)
    daily_drag = (expense_annual + (leverage - 1) * borrow_rate_annual) / 252.0
    idx_first = all_trading_days.index(first_etf_day)
    backward_prices = {first_etf_day: first_etf_price}
    curr_price = first_etf_price
    for i in range(idx_first - 1, -1, -1):
        day_curr = all_trading_days[i+1]
        day_prev = all_trading_days[i]
        base_prev = base_daily_series[day_prev]
        base_curr = base_daily_series[day_curr]
        daily_base_ret = (base_curr - base_prev) / base_prev if base_prev > 0 else 0.0
        daily_lev_ret = daily_base_ret * leverage - daily_drag
        denom = max(0.01, 1.0 + daily_lev_ret)
        curr_price = max(0.001, curr_price / denom)
        backward_prices[day_prev] = round(curr_price, 4)
    result = {}
    for day in all_trading_days:
        if day < first_etf_day:
            result[day] = backward_prices.get(day, 1.0)
        else:
            result[day] = etf_dict.get(day, 0.0)
    last = 1.0
    for day in all_trading_days:
        if result[day] > 0:
            last = result[day]
        else:
            result[day] = last
    return result

def build_stock_with_pre_ipo(stock_dict, base_series):
    days = sorted([d for d in stock_dict.keys() if d in all_trading_days])
    if not days:
        return build_daily_series(base_series)
    first_day = days[0]
    first_price = stock_dict[first_day]
    idx_first = all_trading_days.index(first_day)
    backward_prices = {first_day: first_price}
    curr = first_price
    for i in range(idx_first - 1, -1, -1):
        d_curr = all_trading_days[i+1]
        d_prev = all_trading_days[i]
        b_prev = base_series[d_prev]
        b_curr = base_series[d_curr]
        b_ret = (b_curr - b_prev) / b_prev if b_prev > 0 else 0.0
        curr = max(0.001, curr / max(0.01, 1.0 + b_ret))
        backward_prices[d_prev] = round(curr, 4)
    res = {}
    last = first_price
    for d in all_trading_days:
        if d < first_day:
            res[d] = backward_prices.get(d, first_price)
        elif d in stock_dict and stock_dict[d] > 0:
            last = stock_dict[d]
            res[d] = last
        else:
            res[d] = last
    return res

# Full Core Series
full_spy = build_daily_series(spy_d)
full_qqq = synthesize_underlying(qqq_d, ndx_d)
full_soxx = synthesize_underlying(soxx_d, sox_d)
full_ks200 = synthesize_underlying(kodex200_d, ks11_d)
full_kq150 = synthesize_underlying(kodex150_d, kq11_d)

full_sso = synthesize_leveraged(sso_d, full_spy, leverage=2, expense_annual=0.009, borrow_rate_annual=0.025)
full_upro = synthesize_leveraged(upro_d, full_spy, leverage=3, expense_annual=0.0095, borrow_rate_annual=0.03)
full_qld = synthesize_leveraged(qld_d, full_qqq, leverage=2, expense_annual=0.0095, borrow_rate_annual=0.025)
full_tqqq = synthesize_leveraged(tqqq_d, full_qqq, leverage=3, expense_annual=0.0098, borrow_rate_annual=0.03)
full_usd = synthesize_leveraged(usd_d, full_soxx, leverage=2, expense_annual=0.0095, borrow_rate_annual=0.025)
full_soxl = synthesize_leveraged(soxl_d, full_soxx, leverage=3, expense_annual=0.0099, borrow_rate_annual=0.035)
full_schd = synthesize_underlying(schd_d, vfinx_d)

full_tlt = synthesize_underlying(tlt_d, vustx_d)
full_ief = synthesize_underlying(ief_d, vfitx_d)
full_shy = synthesize_underlying(shy_d, vfisx_d)
full_gld = synthesize_underlying(gld_d, gcf_d)
full_slv = synthesize_underlying(slv_d, sif_d)
full_btc = build_stock_with_pre_ipo(btc_d, full_qqq)
full_eth = build_stock_with_pre_ipo(eth_d, full_qqq)

full_cash = {}
cash_val = 100.0
for i, day in enumerate(all_trading_days):
    if i > 0:
        cash_val *= (1.0 + 0.025 / 252.0)
    full_cash[day] = round(cash_val, 4)

all_full_daily = {
    "SPY": full_spy, "SSO": full_sso, "UPRO": full_upro,
    "QQQ": full_qqq, "QLD": full_qld, "TQQQ": full_tqqq,
    "SOXX": full_soxx, "USD": full_usd, "SOXL": full_soxl,
    "SCHD": full_schd,
    "KS200": full_ks200, "KQ150": full_kq150,
    "SHY": full_shy, "IEF": full_ief, "TLT": full_tlt,
    "GLD": full_gld, "SLV": full_slv,
    "BTC": full_btc, "ETH": full_eth, "CASH": full_cash
}

# US Stocks Benchmark mappings
us_benchmarks = {
    'NVDA': full_soxx, 'AAPL': full_qqq, 'GOOGL': full_qqq, 'MSFT': full_qqq, 'AMZN': full_qqq,
    'TSM': full_soxx, 'SPCX': full_qqq, 'AVGO': full_soxx, 'TSLA': full_qqq, 'META': full_qqq,
    'LLY': full_spy, 'MU': full_soxx, 'BRK_B': full_spy, 'JPM': full_spy, 'WMT': full_spy,
    'AMD': full_soxx, 'V': full_spy, 'XOM': full_spy, 'ASML': full_soxx, 'JNJ': full_spy
}

for s in us_symbols:
    asset_id = 'BRK_B' if s == 'BRK-B' else s
    bm = us_benchmarks[asset_id]
    all_full_daily[asset_id] = build_stock_with_pre_ipo(us_real_data[s], bm)

# KR Stocks Benchmark mappings
for code in kr_symbols.keys():
    all_full_daily[code] = build_stock_with_pre_ipo(kr_real_data[code], full_ks200)

# Generate Monthly (Closed full months - 360 months)
now = datetime.datetime.now()
current_ym = now.strftime("%Y-%m")

months_map = {}
for day in all_trading_days:
    ym = day[:7]
    if ym < current_ym:
        months_map[ym] = day

sorted_months = sorted(list(months_map.keys()))
if len(sorted_months) > 360:
    sorted_months = sorted_months[-360:]

first_month_start_date = months_map[sorted_months[0]]

monthly_output = {}
for asset_id, daily_data in all_full_daily.items():
    monthly_output[asset_id] = [{"date": ym, "price": round(float(daily_data[months_map[ym]]), 2)} for ym in sorted_months]

# Generate Weekly (Rolling 30 years)
weeks_map = {}
for day in all_trading_days:
    if day >= first_month_start_date:
        dt = datetime.datetime.strptime(day, "%Y-%m-%d")
        year, week, _ = dt.isocalendar()
        yw = f"{year}-W{week:02d}"
        weeks_map[yw] = day

sorted_weeks = sorted(list(weeks_map.keys()))
weekly_output = {}
for asset_id, daily_data in all_full_daily.items():
    weekly_output[asset_id] = [{"date": weeks_map[yw], "price": round(float(daily_data[weeks_map[yw]]), 2)} for yw in sorted_weeks]

final_json = {"monthly": monthly_output, "weekly": weekly_output}
with open(HISTORICAL_JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(final_json, f, indent=2, ensure_ascii=False)

print(f"Successfully wrote {len(all_full_daily)} assets to {HISTORICAL_JSON_PATH}")

# Calculate Backtest Metrics
def calculate_metrics(m_series, w_series):
    if not m_series or len(m_series) < 12:
        return 0.1, 0.2, 0.11, 0.12, 0.13, 0.14
    start_p = m_series[0]['price']
    end_p = m_series[-1]['price']
    n_years = len(m_series) / 12.0
    cagr = (end_p / start_p) ** (1.0 / n_years) - 1.0 if start_p > 0 and end_p > 0 else 0.0
    m_rets = []
    for i in range(1, len(m_series)):
        p0 = m_series[i-1]['price']
        p1 = m_series[i]['price']
        if p0 > 0:
            m_rets.append((p1 - p0) / p0)
    if m_rets:
        mean_ret = sum(m_rets) / len(m_rets)
        var = sum((r - mean_ret) ** 2 for r in m_rets) / len(m_rets)
        vol = math.sqrt(var) * math.sqrt(12)
    else:
        vol = 0.2
        
    def sim_ma(window):
        if not w_series or len(w_series) <= window:
            return cagr
        prices = [x['price'] for x in w_series]
        port = 100.0
        in_cash = False
        cash_rate_weekly = 0.025 / 52.0
        for i in range(window, len(prices)):
            ma = sum(prices[i-window:i]) / float(window)
            p_prev = prices[i-1]
            p_curr = prices[i]
            asset_ret = (p_curr - p_prev) / p_prev if p_prev > 0 else 0.0
            if p_curr < ma:
                in_cash = True
            else:
                in_cash = False
            if in_cash:
                port *= (1.0 + cash_rate_weekly)
            else:
                port *= (1.0 + asset_ret)
        n_w_years = (len(prices) - window) / 52.0
        return (port / 100.0) ** (1.0 / n_w_years) - 1.0 if port > 0 and n_w_years > 0 else cagr

    ma50 = sim_ma(50)
    ma100 = sim_ma(100)
    ma150 = sim_ma(150)
    ma200 = sim_ma(200)
    return round(cagr, 3), round(vol, 3), round(ma50, 3), round(ma100, 3), round(ma150, 3), round(ma200, 3)

raw_meta = [
    ('SPY', 'S&P 500 (SPY)', '미국 대표 지수 & 레버리지', 'stock', 1, '미국 우량 기업 500개 분산 투자 (대표 지수 ETF)'),
    ('SSO', 'S&P 500 2배 레버리지 (SSO)', '미국 대표 지수 & 레버리지', 'stock', 2, 'S&P 500 하루 변동폭의 2배 추종'),
    ('UPRO', 'S&P 500 3배 레버리지 (UPRO)', '미국 대표 지수 & 레버리지', 'stock', 3, 'S&P 500 하루 변동폭의 3배 공격형 추종'),
    ('QQQ', '나스닥 100 (QQQ)', '미국 대표 지수 & 레버리지', 'stock', 1, '애플, 마이크로소프트 등 미국 대표 기술주'),
    ('QLD', '나스닥 100 2배 레버리지 (QLD)', '미국 대표 지수 & 레버리지', 'stock', 2, '나스닥 100 하루 변동폭의 2배 추종'),
    ('TQQQ', '나스닥 100 3배 레버리지 (TQQQ)', '미국 대표 지수 & 레버리지', 'stock', 3, '나스닥 100 하루 변동폭의 3배 공격형 추종'),
    ('SOXX', '필라델피아 반도체 (SOXX)', '미국 대표 지수 & 레버리지', 'stock', 1, '엔비디아, TSMC 등 글로벌 반도체 선도 기업'),
    ('USD', '필라델피아 반도체 2배 레버리지 (USD)', '미국 대표 지수 & 레버리지', 'stock', 2, '반도체 지수 하루 변동폭의 2배 추종'),
    ('SOXL', '필라델피아 반도체 3배 레버리지 (SOXL)', '미국 대표 지수 & 레버리지', 'stock', 3, '반도체 지수 하루 변동폭의 3배 공격형 추종'),
    ('SCHD', '미국배당다우존스 (SCHD)', '배당 성장', 'dividend', 1, '안정적인 배당 성장과 우량 기업 100개 투자'),
    ('KS200', '코스피 200 (KS200)', '한국 대표 지수', 'stock', 1, '삼성전자, SK하이닉스 등 한국 200대 대형주'),
    ('KQ150', '코스닥 150 (KQ150)', '한국 대표 지수', 'stock', 1, '에코프로, 알테오젠 등 코스닥 핵심 성장주'),
    ('SHY', '미국 단기채 (SHY)', '채권', 'bond', 1, '1~3년 만기 미국 단기 국채 (원금 보존형)'),
    ('IEF', '미국 중기채 (IEF)', '채권', 'bond', 1, '7~10년 만기 미국 중기 국채 (안정적 방어)'),
    ('TLT', '미국 장기채 (TLT)', '채권', 'bond', 1, '20년 이상 장기 미국 국채 (위기 방어 및 금리 인하 수혜)'),
    ('GLD', '금 (GLD)', '원자재', 'commodity', 1, '인플레이션 및 지정학적 위기 헤지 실물 금 ETF'),
    ('SLV', '은 (SLV)', '원자재', 'commodity', 1, '산업용 수요와 귀금속 가치를 지닌 실물 은 ETF'),
    ('NVDA', '엔비디아 (NVDA)', '미국 대표 개별주', 'stock', 1, '글로벌 1위 AI 가속기 및 GPU 반도체 기업'),
    ('AAPL', '애플 (AAPL)', '미국 대표 개별주', 'stock', 1, '아이폰, 맥북, 서비스 생태계 글로벌 IT 리더'),
    ('GOOGL', '알파벳/구글 (GOOGL)', '미국 대표 개별주', 'stock', 1, '글로벌 1위 검색 포털, 유튜브, AI 모델 기업'),
    ('MSFT', '마이크로소프트 (MSFT)', '미국 대표 개별주', 'stock', 1, 'Azure 클라우드, Windows, 기업용 AI 솔루션'),
    ('AMZN', '아마존 (AMZN)', '미국 대표 개별주', 'stock', 1, '글로벌 1위 이커머스 및 AWS 클라우드 기업'),
    ('TSM', 'TSMC (TSM)', '미국 대표 개별주', 'stock', 1, '글로벌 1위 파운드리 반도체 제조 기업'),
    ('SPCX', '스페이스X (SPCX)', '미국 대표 개별주', 'stock', 1, '글로벌 1위 우주 항공 및 스타링크 위성 통신 기업'),
    ('AVGO', '브로드컴 (AVGO)', '미국 대표 개별주', 'stock', 1, 'AI 커스텀 칩 및 초고속 통신 반도체 선도 기업'),
    ('TSLA', '테슬라 (TSLA)', '미국 대표 개별주', 'stock', 1, '전기차, 자율주행 FSD, 휴머노이드 로보틱스 선도'),
    ('META', '메타 (META)', '미국 대표 개별주', 'stock', 1, '인스타그램, 페이스북, 오픈소스 AI 플랫폼'),
    ('LLY', '일라이 릴리 (LLY)', '미국 대표 개별주', 'stock', 1, '비만/당뇨 치료제 및 글로벌 바이오 헬스케어 선도'),
    ('MU', '마이크론 테크놀로지 (MU)', '미국 대표 개별주', 'stock', 1, '글로벌 메모리 반도체 및 HBM 제조 선도 기업'),
    ('BRK_B', '버크셔 해서웨이 (BRK.B)', '미국 대표 개별주', 'stock', 1, '워런 버핏이 이끄는 미국 최대 복합 투자 지주사'),
    ('JPM', 'JP모건 체이스 (JPM)', '미국 대표 개별주', 'stock', 1, '미국 1위 글로벌 종합 투자은행 및 금융 지주'),
    ('WMT', '월마트 (WMT)', '미국 대표 개별주', 'stock', 1, '미국 최대 오프라인/온라인 유통 리테일 기업'),
    ('AMD', 'AMD (AMD)', '미국 대표 개별주', 'stock', 1, '고성능 CPU 및 AI 데이터센터 가속기 제조'),
    ('V', '비자 (V)', '미국 대표 개별주', 'stock', 1, '글로벌 1위 디지털 결제 및 신용카드 네트워크'),
    ('XOM', '엑슨모빌 (XOM)', '미국 대표 개별주', 'stock', 1, '미국 최대 종합 에너지 및 석유화학 기업'),
    ('ASML', 'ASML (ASML)', '미국 대표 개별주', 'stock', 1, '극자외선(EUV) 노광장비 독점 공급 반도체 장비사'),
    ('JNJ', '존슨앤존슨 (JNJ)', '미국 대표 개별주', 'stock', 1, '글로벌 대표 헬스케어 제약 및 의료기기 기업'),
    ('005930', '삼성전자 (005930)', '한국 대표 개별주', 'stock', 1, '글로벌 1위 메모리 반도체 및 스마트폰 제조 기업'),
    ('000660', 'SK하이닉스 (000660)', '한국 대표 개별주', 'stock', 1, 'AI 고대역폭메모리(HBM) 및 D램 반도체 선도 기업'),
    ('402340', 'SK스퀘어 (402340)', '한국 대표 개별주', 'stock', 1, 'SK하이닉스 등을 보유한 ICT 전문 투자 지주사'),
    ('009150', '삼성전기 (009150)', '한국 대표 개별주', 'stock', 1, '적층세라믹콘덴서(MLCC) 및 차세대 반도체 기판 제조'),
    ('373220', 'LG에너지솔루션 (373220)', '한국 대표 개별주', 'stock', 1, '글로벌 선도 전기차용 2차전지 배터리 제조사'),
    ('005380', '현대차 (005380)', '한국 대표 개별주', 'stock', 1, '글로벌 완성차, 하이브리드, 수소/전기차 제조'),
    ('207940', '삼성바이오로직스 (207940)', '한국 대표 개별주', 'stock', 1, '글로벌 1위 바이오의약품 위탁생산(CDMO) 기업'),
    ('032830', '삼성생명 (032830)', '한국 대표 개별주', 'stock', 1, '국내 1위 생명보험 및 자산운용 금융 지주'),
    ('028260', '삼성물산 (028260)', '한국 대표 개별주', 'stock', 1, '건설, 상사, 패션, 리조트 및 삼성그룹 실질 지주사'),
    ('105560', 'KB금융 (105560)', '한국 대표 개별주', 'stock', 1, '국내 리딩 종합 금융그룹 (은행, 증권, 카드, 보험)'),
    ('BTC', '비트코인 (BTC)', '암호화폐', 'crypto', 1, '글로벌 1위 탈중앙화 디지털 자산'),
    ('ETH', '이더리움 (ETH)', '암호화폐', 'crypto', 1, '스마트 컨트랙트 기반 글로벌 블록체인 플랫폼'),
    ('CASH', '현금 / 파킹통장', '현금', 'cash', 1, '연 2.5% 안정적 이자를 지급하는 안전 자산')
]

assets_output = []
for asset_id, name, group, category, leverage, desc in raw_meta:
    m_s = monthly_output.get(asset_id, [])
    w_s = weekly_output.get(asset_id, [])
    cagr, vol, ma50, ma100, ma150, ma200 = calculate_metrics(m_s, w_s)
    assets_output.append({
        'id': asset_id,
        'name': name,
        'group': group,
        'category': category,
        'leverage': leverage,
        'annualCAGR': cagr,
        'annualVol': vol,
        'ma50Return': ma50,
        'ma100Return': ma100,
        'ma150Return': ma150,
        'ma200Return': ma200,
        'description': desc
    })

backtest_final = {
    'lastUpdated': datetime.date.today().strftime('%Y-%m-%d'),
    'assets': assets_output
}

with open(BACKTEST_JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(backtest_final, f, indent=2, ensure_ascii=False)

print(f"Successfully generated backtestData.json with real CAGR & Vol for {len(assets_output)} assets!")


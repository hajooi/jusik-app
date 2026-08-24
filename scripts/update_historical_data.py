#!/usr/bin/env python3
"""
scripts/update_historical_data.py
30-Year Historical Total Return Dataset Generator for jusik.app (26+ Assets)
"""

import urllib.request
import urllib.parse
import json
import datetime
import time
import math
import os

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HISTORICAL_JSON_PATH = os.path.join(WORKSPACE_DIR, "src", "data", "historicalPrices.json")

print(f"=== Starting 30-Year Historical Multi-Asset Data Sync ===")

def fetch_yahoo_series(symbol, interval="1d", period1=788918400, period2=1787529600):
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(symbol)}?period1={period1}&period2={period2}&interval={interval}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                result = data['chart']['result'][0]
                timestamps = result.get('timestamp', [])
                quotes = result.get('indicators', {}).get('quote', [{}])[0]
                adjclose = result.get('indicators', {}).get('adjclose', [{}])[0].get('adjclose', []) if result.get('indicators', {}).get('adjclose') else []
                
                closes = quotes.get('close', [])
                final_closes = []
                for i, c in enumerate(closes):
                    if i < len(adjclose) and adjclose[i] is not None and not math.isnan(adjclose[i]):
                        final_closes.append(adjclose[i])
                    else:
                        final_closes.append(c)
                    
                series = {}
                for ts, price in zip(timestamps, final_closes):
                    if ts and price is not None and not math.isnan(price) and price > 0:
                        dt_str = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
                        series[dt_str] = round(float(price), 4)
                print(f"[{symbol:10}] Loaded {len(series):5} points")
                return series
        except Exception as e:
            print(f"[{symbol:10}] Attempt {attempt+1} error: {e}")
            time.sleep(2)
    return {}

# 1. Fetch Benchmark and Base Series
spy_d = fetch_yahoo_series("SPY")
sso_d = fetch_yahoo_series("SSO")
upro_d = fetch_yahoo_series("UPRO")
vfinx_d = fetch_yahoo_series("VFINX")

ndx_d = fetch_yahoo_series("^NDX")
qqq_d = fetch_yahoo_series("QQQ")
qld_d = fetch_yahoo_series("QLD")
tqqq_d = fetch_yahoo_series("TQQQ")

sox_d = fetch_yahoo_series("^SOX")
soxx_d = fetch_yahoo_series("SOXX")
usd_d = fetch_yahoo_series("USD")
soxl_d = fetch_yahoo_series("SOXL")

schd_d = fetch_yahoo_series("SCHD")

# Korean Indices
kodex200_d = fetch_yahoo_series("069500.KS")
ks11_d = fetch_yahoo_series("^KS11")
kodex150_d = fetch_yahoo_series("229200.KS")
kq11_d = fetch_yahoo_series("^KQ11")

# US Treasuries
tlt_d = fetch_yahoo_series("TLT")
vustx_d = fetch_yahoo_series("VUSTX")
ief_d = fetch_yahoo_series("IEF")
vfitx_d = fetch_yahoo_series("VFITX")
shy_d = fetch_yahoo_series("SHY")
vfisx_d = fetch_yahoo_series("VFISX")

# Commodities
gld_d = fetch_yahoo_series("GLD")
gcf_d = fetch_yahoo_series("GC=F")
slv_d = fetch_yahoo_series("SLV")
sif_d = fetch_yahoo_series("SI=F")

# US Top 10 Tech / Individual Stocks
aapl_d = fetch_yahoo_series("AAPL")
msft_d = fetch_yahoo_series("MSFT")
nvda_d = fetch_yahoo_series("NVDA")
googl_d = fetch_yahoo_series("GOOGL")
amzn_d = fetch_yahoo_series("AMZN")
meta_d = fetch_yahoo_series("META")
tsla_d = fetch_yahoo_series("TSLA")
brk_d = fetch_yahoo_series("BRK-B")
lly_d = fetch_yahoo_series("LLY")
tsm_d = fetch_yahoo_series("TSM")

# Korean Individual Stocks
samsung_d = fetch_yahoo_series("005930.KS")
skhynix_d = fetch_yahoo_series("000660.KS")

# Crypto
btc_d = fetch_yahoo_series("BTC-USD")
eth_d = fetch_yahoo_series("ETH-USD")

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

def synthesize_underlying(etf_dict, index_dict, div_yield_annual=0.01):
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

# Build All Full Series
full_spy = build_daily_series(spy_d)
full_qqq = synthesize_underlying(qqq_d, ndx_d, 0.01)
full_soxx = synthesize_underlying(soxx_d, sox_d, 0.012)
full_sso = synthesize_leveraged(sso_d, full_spy, leverage=2, expense_annual=0.009, borrow_rate_annual=0.025)
full_upro = synthesize_leveraged(upro_d, full_spy, leverage=3, expense_annual=0.0095, borrow_rate_annual=0.03)
full_qld = synthesize_leveraged(qld_d, full_qqq, leverage=2, expense_annual=0.0095, borrow_rate_annual=0.025)
full_tqqq = synthesize_leveraged(tqqq_d, full_qqq, leverage=3, expense_annual=0.0098, borrow_rate_annual=0.03)
full_usd = synthesize_leveraged(usd_d, full_soxx, leverage=2, expense_annual=0.0095, borrow_rate_annual=0.025)
full_soxl = synthesize_leveraged(soxl_d, full_soxx, leverage=3, expense_annual=0.0099, borrow_rate_annual=0.035)
full_schd = synthesize_underlying(schd_d, vfinx_d)

full_ks200 = synthesize_underlying(kodex200_d, ks11_d)
full_kq150 = synthesize_underlying(kodex150_d, kq11_d)

full_tlt = synthesize_underlying(tlt_d, vustx_d)
full_ief = synthesize_underlying(ief_d, vfitx_d)
full_shy = synthesize_underlying(shy_d, vfisx_d)

full_gld = synthesize_underlying(gld_d, gcf_d)
full_slv = synthesize_underlying(slv_d, sif_d)

# US Individual Stocks
full_aapl = build_stock_with_pre_ipo(aapl_d, full_qqq)
full_msft = build_stock_with_pre_ipo(msft_d, full_qqq)
full_nvda = build_stock_with_pre_ipo(nvda_d, full_soxx)
full_googl = build_stock_with_pre_ipo(googl_d, full_qqq)
full_amzn = build_stock_with_pre_ipo(amzn_d, full_qqq)
full_meta = build_stock_with_pre_ipo(meta_d, full_qqq)
full_tsla = build_stock_with_pre_ipo(tsla_d, full_qqq)
full_brk = build_stock_with_pre_ipo(brk_d, full_spy)
full_lly = build_stock_with_pre_ipo(lly_d, full_spy)
full_tsm = build_stock_with_pre_ipo(tsm_d, full_soxx)

# Korean Individual Stocks
full_samsung = build_stock_with_pre_ipo(samsung_d, full_ks200)
full_skhynix = build_stock_with_pre_ipo(skhynix_d, full_ks200)

# Crypto
full_btc = build_stock_with_pre_ipo(btc_d, full_qqq)
full_eth = build_stock_with_pre_ipo(eth_d, full_qqq)

full_cash = {}
cash_val = 100.0
for i, day in enumerate(all_trading_days):
    if i > 0:
        cash_val *= (1.0 + 0.025 / 252.0)
    full_cash[day] = round(cash_val, 4)

all_full_daily = {
    # 1. US Index & Leverage
    "SPY": full_spy, "SSO": full_sso, "UPRO": full_upro,
    "QQQ": full_qqq, "QLD": full_qld, "TQQQ": full_tqqq,
    "SOXX": full_soxx, "USD": full_usd, "SOXL": full_soxl,
    "SCHD": full_schd,
    # 2. Korean Index
    "KS200": full_ks200, "KQ150": full_kq150,
    # 3. Bonds
    "SHY": full_shy, "IEF": full_ief, "TLT": full_tlt,
    # 4. Gold & Silver
    "GLD": full_gld, "SLV": full_slv,
    # 5. US Top 10 Tech
    "AAPL": full_aapl, "MSFT": full_msft, "NVDA": full_nvda,
    "GOOGL": full_googl, "AMZN": full_amzn, "META": full_meta,
    "TSLA": full_tsla, "BRK_B": full_brk, "LLY": full_lly, "TSM": full_tsm,
    # 6. Korean Stocks
    "005930": full_samsung, "000660": full_skhynix,
    # 7. Crypto & Cash
    "BTC": full_btc, "ETH": full_eth, "CASH": full_cash
}

# Generate Monthly (Closed full months - 360 months / 30 years)
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
    json.dump(final_json, f, indent=2)

print(f"Successfully generated historicalPrices.json for {len(all_full_daily)} assets across {len(sorted_months)} months and {len(sorted_weeks)} weeks.")


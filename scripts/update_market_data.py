import json
import math
import datetime
import os
import sys
import re
import urllib.request
import yfinance as yf
import pandas as pd

SYMBOLS = {
    # 1. 미국 대표 지수 & 레버리지
    'SPY': 'SPY',
    'SSO': 'SSO',
    'UPRO': 'UPRO',
    'QQQ': 'QQQ',
    'QLD': 'QLD',
    'TQQQ': 'TQQQ',
    'SOXX': 'SOXX',
    'USD': 'USD',
    'SOXL': 'SOXL',
    'SCHD': 'SCHD',
    # 2. 한국 대표 지수
    'KS200': '^KS200',
    'KQ150': '^KQ11',
    # 3. 채권
    'SHY': 'SHY',
    'IEF': 'IEF',
    'TLT': 'TLT',
    # 4. 원자재
    'GLD': 'GLD',
    'SLV': 'SLV',
    # 5. 암호화폐
    'BTC': 'BTC-USD',
    'ETH': 'ETH-USD',
    # 6. 미국 대표 개별주 (시총 Top 20)
    'NVDA': 'NVDA',
    'AAPL': 'AAPL',
    'GOOGL': 'GOOGL',
    'MSFT': 'MSFT',
    'AMZN': 'AMZN',
    'TSM': 'TSM',
    'SPCX': 'SPCX',
    'AVGO': 'AVGO',
    'TSLA': 'TSLA',
    'META': 'META',
    'LLY': 'LLY',
    'MU': 'MU',
    'BRK_B': 'BRK-B',
    'JPM': 'JPM',
    'WMT': 'WMT',
    'AMD': 'AMD',
    'V': 'V',
    'XOM': 'XOM',
    'ASML': 'ASML',
    'JNJ': 'JNJ',
    # 7. 한국 대표 개별주 (시총 Top 10)
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

HISTORICAL_PRICES_PATH = 'src/data/historicalPrices.json'
BACKTEST_DATA_PATH = 'src/data/backtestData.json'
CALENDAR_PATH = 'src/data/marketCalendar.ts'

TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '7836688476:AAGJOs8nHrvRD-T1XPSIfY1wDSXKADQQS2Q')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID', '7954599592')

def send_telegram_error(subject: str, message: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    text = f"🚨 <b>[jusik.app 월간 자동화 오류]</b>\n<b>{subject}</b>\n\n{message}"
    payload = json.dumps({
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML"
    }).encode('utf-8')
    try:
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            pass
    except Exception as e:
        print(f"Failed to send telegram error: {e}")

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

def update_historical_prices():
    try:
        with open(HISTORICAL_PRICES_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading {HISTORICAL_PRICES_PATH}: {e}")
        send_telegram_error("시계열 데이터 파일 읽기 실패", str(e))
        sys.exit(1)

    monthly = data.get('monthly', {})
    weekly = data.get('weekly', {})

    now = datetime.datetime.now()
    current_ym = now.strftime('%Y-%m')
    start_date = (now - datetime.timedelta(days=90)).strftime('%Y-%m-%d')

    print(f"Fetching market data from {start_date} (Current Month: {current_ym})...")
    failed_symbols = []

    for asset_id, yf_symbol in SYMBOLS.items():
        try:
            ticker = yf.Ticker(yf_symbol)
            df = ticker.history(period='3mo')
            if df is None or df.empty:
                print(f"[{asset_id}] No data retrieved for symbol {yf_symbol}")
                failed_symbols.append(asset_id)
                continue

            df.index = pd.to_datetime(df.index)

            # --- Update Monthly Data ---
            df_m = df.copy()
            df_m['YM'] = df_m.index.strftime('%Y-%m')
            monthly_last = df_m.groupby('YM').last()

            if asset_id not in monthly:
                monthly[asset_id] = []

            m_series = monthly[asset_id]
            m_index_map = {item['date']: i for i, item in enumerate(m_series)}

            for ym, row in monthly_last.iterrows():
                if ym >= current_ym:
                    continue
                close_val = row['Close']
                if pd.isna(close_val) or math.isnan(close_val):
                    continue
                price = round(float(close_val), 2)
                if ym in m_index_map:
                    m_series[m_index_map[ym]]['price'] = price
                else:
                    m_series.append({'date': str(ym), 'price': price})

            m_series.sort(key=lambda x: x['date'])
            monthly[asset_id] = m_series

            # --- Update Weekly Data ---
            df_w = df.copy()
            weekly_resampled = df_w['Close'].resample('W-FRI').last().dropna()

            if asset_id not in weekly:
                weekly[asset_id] = []

            w_series = weekly[asset_id]
            w_index_map = {item['date']: i for i, item in enumerate(w_series)}

            today_str = now.strftime('%Y-%m-%d')
            for dt_val, price_val in weekly_resampled.items():
                w_date = dt_val.strftime('%Y-%m-%d')
                if w_date >= today_str:
                    continue
                if pd.isna(price_val) or math.isnan(price_val):
                    continue
                price = round(float(price_val), 2)
                if w_date in w_index_map:
                    w_series[w_index_map[w_date]]['price'] = price
                else:
                    w_series.append({'date': w_date, 'price': price})

            w_series.sort(key=lambda x: x['date'])
            weekly[asset_id] = w_series

            print(f"[{asset_id}] Successfully updated monthly ({len(m_series)}) & weekly ({len(w_series)})")
        except Exception as err:
            print(f"[{asset_id}] Error processing: {err}")
            failed_symbols.append(asset_id)

    if failed_symbols:
        err_msg = f"다음 {len(failed_symbols)}개 심볼 데이터 수집 실패: {', '.join(failed_symbols)}"
        print(f"ERROR: {err_msg}")
        send_telegram_error("월간 주가 데이터 수집 누락", err_msg)
        sys.exit(1)

    data['monthly'] = monthly
    data['weekly'] = weekly

    with open(HISTORICAL_PRICES_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Successfully saved updated data to {HISTORICAL_PRICES_PATH}")

def update_backtest_data():
    try:
        with open(HISTORICAL_PRICES_PATH, 'r', encoding='utf-8') as f:
            hist = json.load(f)
        with open(BACKTEST_DATA_PATH, 'r', encoding='utf-8') as f:
            backtest = json.load(f)
            
        monthly = hist.get('monthly', {})
        weekly = hist.get('weekly', {})
        
        today_str = datetime.date.today().strftime('%Y-%m-%d')
        backtest['lastUpdated'] = today_str
        
        for asset in backtest.get('assets', []):
            asset_id = asset['id']
            m_s = monthly.get(asset_id, [])
            w_s = weekly.get(asset_id, [])
            cagr, vol, ma50, ma100, ma150, ma200 = calculate_metrics(m_s, w_s)
            asset['annualCAGR'] = cagr
            asset['annualVol'] = vol
            asset['ma50Return'] = ma50
            asset['ma100Return'] = ma100
            asset['ma150Return'] = ma150
            asset['ma200Return'] = ma200
            
        with open(BACKTEST_DATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(backtest, f, indent=2, ensure_ascii=False)
        print(f"Successfully recalculated all asset metrics in {BACKTEST_DATA_PATH} (lastUpdated: {today_str})")
    except Exception as e:
        print(f"Error updating {BACKTEST_DATA_PATH}: {e}")
        send_telegram_error("백테스트 데이터 계산 실패", str(e))
        sys.exit(1)

def update_earnings_calendar():
    """
    backtestData.json의 최신 개별주 30개(미국 20 + 한국 10)를 기준으로
    marketCalendar.ts의 실적 발표 이벤트를 완전 자동 동기화합니다.
    """
    try:
        with open(BACKTEST_DATA_PATH, 'r', encoding='utf-8') as f:
            bt = json.load(f)
        with open(CALENDAR_PATH, 'r', encoding='utf-8') as f:
            calendar_code = f.read()

        match = re.search(r"export const CALENDAR_EVENTS: CalendarEvent\[\] = (\[.*?\]);", calendar_code, re.DOTALL)
        if not match:
            print("Could not match CALENDAR_EVENTS in marketCalendar.ts")
            return

        events = json.loads(match.group(1))
        stocks = [a for a in bt.get('assets', []) if a.get('group') in ['미국 대표 개별주', '한국 대표 개별주']]
        stock_ids = {s['id'] for s in stocks}

        print(f"Syncing earnings calendar for {len(stocks)} simulator stocks...")

        # 1. 시뮬레이터에서 제거된 종목의 미래 실적 이벤트 정리
        today_str = datetime.date.today().strftime('%Y-%m-%d')
        filtered_events = []
        for ev in events:
            if ev.get('type') == 'earnings' and ev.get('ticker'):
                # 시뮬레이터에 없고 미래 발표 일정인 경우 제외
                if ev['ticker'] not in stock_ids and ev.get('date', '') >= today_str:
                    continue
            filtered_events.append(ev)

        # 2. 30개 종목의 차기 실적발표일 및 컨센서스 수집
        updated_count = 0
        for s in stocks:
            sym_id = s['id']
            is_kr = s.get('group') == '한국 대표 개별주'
            yf_sym = f"{sym_id}.KS" if is_kr else ('BRK-B' if sym_id == 'BRK_B' else sym_id)
            
            try:
                t = yf.Ticker(yf_sym)
                cal = t.calendar
                if not isinstance(cal, dict) or 'Earnings Date' not in cal or not cal['Earnings Date']:
                    continue

                earnings_date = str(cal['Earnings Date'][0])
                if earnings_date < today_str:
                    continue

                eps_avg = cal.get('Earnings Average')
                rev_avg = cal.get('Revenue Average')

                expected_parts = []
                if rev_avg and not math.isnan(rev_avg):
                    rev_str = f"{rev_avg/1e12:.1f}조 원" if is_kr else f"${rev_avg/1e9:.2f}B"
                    expected_parts.append(f"매출 {rev_str}")
                if eps_avg and not math.isnan(eps_avg):
                    eps_str = f"{eps_avg:,.0f}원" if is_kr else f"${eps_avg:.2f}"
                    expected_parts.append(f"EPS {eps_str}")
                expected_str = " / ".join(expected_parts)

                # 기존 캘린더에서 해당 티커의 미래 실적 이벤트 검색
                existing_ev = next((e for e in filtered_events if e.get('type') == 'earnings' and e.get('ticker') == sym_id and e.get('date', '') >= today_str), None)

                if existing_ev:
                    # 날짜나 예상치가 변경되었으면 갱신
                    if existing_ev.get('date') != earnings_date or (expected_str and existing_ev.get('expected') != expected_str):
                        existing_ev['date'] = earnings_date
                        if expected_str:
                            existing_ev['expected'] = expected_str
                        updated_count += 1
                else:
                    # 신규 미래 실적 이벤트 추가
                    m_prefix = earnings_date.split('-')[1]
                    m_names = {'01':'jan','02':'feb','03':'mar','04':'apr','05':'may','06':'jun','07':'jul','08':'aug','09':'sep','10':'oct','11':'nov','12':'dec'}
                    prefix = m_names.get(m_prefix, 'q')
                    new_id = f"{prefix}-{sym_id.lower()}-next"
                    
                    clean_name = s['name'].split('(')[0].strip()
                    new_ev = {
                        "id": new_id,
                        "date": earnings_date,
                        "time": "08:30" if is_kr else "05:30",
                        "title": f"{clean_name} ({sym_id}) 실적 발표",
                        "type": "earnings",
                        "region": "kr" if is_kr else "us",
                        "simpleSummary": f"{clean_name}의 분기 경영 실적과 미래 사업 가이던스가 공개돼요.",
                        "impactTag": "호재 가능성",
                        "importance": 3 if sym_id in ['NVDA', 'AAPL', '005930', '000660'] else 2,
                        "ticker": sym_id,
                    }
                    if expected_str:
                        new_ev["expected"] = expected_str
                    filtered_events.append(new_ev)
                    updated_count += 1
            except Exception as stock_err:
                print(f"[{sym_id}] Earnings fetch skipped: {stock_err}")

        # 날짜순 재정렬
        filtered_events.sort(key=lambda x: x.get('date', ''))

        # marketCalendar.ts 코드 덮어쓰기
        new_json_str = json.dumps(filtered_events, indent=2, ensure_ascii=False)
        updated_code = calendar_code[:match.start(1)] + new_json_str + calendar_code[match.end(1):]

        with open(CALENDAR_PATH, 'w', encoding='utf-8') as f:
            f.write(updated_code)

        print(f"Successfully updated earnings calendar in {CALENDAR_PATH} ({updated_count} events updated/added)")
    except Exception as e:
        print(f"Error updating earnings calendar: {e}")
        send_telegram_error("증시 캘린더 실적 이벤트 동기화 실패", str(e))
        sys.exit(1)

if __name__ == '__main__':
    update_historical_prices()
    update_backtest_data()
    update_earnings_calendar()


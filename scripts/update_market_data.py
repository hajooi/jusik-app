import json
import math
import datetime
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
        return

    monthly = data.get('monthly', {})
    weekly = data.get('weekly', {})

    now = datetime.datetime.now()
    current_ym = now.strftime('%Y-%m')
    start_date = (now - datetime.timedelta(days=90)).strftime('%Y-%m-%d')

    print(f"Fetching market data from {start_date} (Current Month: {current_ym})...")

    for asset_id, yf_symbol in SYMBOLS.items():
        try:
            ticker = yf.Ticker(yf_symbol)
            df = ticker.history(period='3mo')
            if df is None or df.empty:
                print(f"[{asset_id}] No data retrieved for symbol {yf_symbol}")
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

if __name__ == '__main__':
    update_historical_prices()
    update_backtest_data()

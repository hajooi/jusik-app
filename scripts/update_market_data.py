import json
import math
import datetime
import yfinance as yf
import pandas as pd

SYMBOLS = {
    'SPY': 'SPY',
    'QQQ': 'QQQ',
    'SOXX': 'SOXX',
    'GLD': 'GLD',
    'TLT': 'TLT',
    'IEF': 'IEF',
    'SHY': 'SHY',
    'SCHD': 'SCHD',
    'BTC': 'BTC-USD',
    'ETH': 'ETH-USD',
    'QLD': 'QLD',
    'TQQQ': 'TQQQ',
    'SSO': 'SSO',
    'UPRO': 'UPRO',
    'USD': 'USD',
    'SOXL': 'SOXL',
    'KOSPI200': '^KS200'
}

HISTORICAL_PRICES_PATH = 'src/data/historicalPrices.json'
BACKTEST_DATA_PATH = 'src/data/backtestData.json'

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
            df = ticker.history(start=start_date)
            if df.empty:
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
                # Filter out current ongoing month (e.g. if today is 2026-08-04, 2026-08 is incomplete)
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

def update_backtest_date():
    try:
        with open(BACKTEST_DATA_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        today_str = datetime.date.today().strftime('%Y-%m-%d')
        data['lastUpdated'] = today_str

        with open(BACKTEST_DATA_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated backtestData.json lastUpdated date to {today_str}")
    except Exception as e:
        print(f"Error updating {BACKTEST_DATA_PATH}: {e}")

if __name__ == '__main__':
    update_historical_prices()
    update_backtest_date()

#!/usr/bin/env python3
"""Tencent five-unit rule replay: core inventory plus active swing units.

This is a normalized mechanical sensitivity test, not the user's account.
"""
from __future__ import annotations
import csv, calendar
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PRICE = ROOT / '腾讯历史行情-2023-04-25至2025-07-15.csv'
DIVIDENDS = ROOT / '腾讯历史分红-2023-04-25至2025-07-15.csv'
OUT = ROOT / '腾讯五份仓位回测'
SEED_DATE = date(2023, 4, 25)
SEED_PRICE = 333.0
X = 0.04
REBUY_DROP = 2 * X

@dataclass(frozen=True)
class Bar:
    day: date
    open: float
    high: float
    low: float
    close: float

@dataclass
class SellLot:
    unit: int
    entry_date: date
    entry_price: float
    limit: float

@dataclass
class BuyTicket:
    unit: int
    sale_date: date
    sale_price: float
    limit: float
    reanchors: int = 0


def load():
    with PRICE.open(encoding='utf-8-sig', newline='') as f:
        bars = [Bar(date.fromisoformat(r['date']), float(r['open_hkd']), float(r['high_hkd']),
                    float(r['low_hkd']), float(r['close_hkd'])) for r in csv.DictReader(f)]
    with DIVIDENDS.open(encoding='utf-8-sig', newline='') as f:
        dividends = {date.fromisoformat(r['ex_date']): float(r['cash_dividend_hkd_per_share'])
                     for r in csv.DictReader(f)}
    return bars, dividends


def add_month(d):
    m = d.month % 12 + 1
    y = d.year + (d.month == 12)
    return d.replace(year=y, month=m, day=min(d.day, calendar.monthrange(y, m)[1]))


def drawdown(values):
    peak = values[0]
    worst = 0.0
    max_underwater = run = 0
    for value in values:
        peak = max(peak, value)
        dd = value / peak - 1
        worst = min(worst, dd)
        if dd < -1e-12:
            run += 1
            max_underwater = max(max_underwater, run)
        else:
            run = 0
    return worst, max_underwater


def replay(core_units: int, swing_units: int, reanchor: bool):
    bars, dividends = load()
    seed = next(i for i, b in enumerate(bars) if b.day == SEED_DATE)
    # The seed portfolio is five normalized units bought at the supplied HK$333.
    core = core_units
    holdings = [SellLot(unit=i + 1, entry_date=SEED_DATE, entry_price=SEED_PRICE,
                        limit=SEED_PRICE * (1 + X)) for i in range(core_units, 5)]
    buy_queue: list[BuyTicket] = []
    cash = 0.0
    dividend_total = 0.0
    fills = []
    navs = [5 * SEED_PRICE]
    active_both_days = 0
    both_filled_days = 0
    buy_only_days = sell_only_days = 0
    reanchor_count = 0
    cash_days = []
    share_days = []
    daily_rows = []

    for i in range(seed + 1, len(bars)):
        b = bars[i]
        # Ex-date holder count is the position carried from the previous close.
        div = (core + len(holdings)) * dividends.get(b.day, 0.0)
        cash += div
        dividend_total += div

        active_buy = buy_queue[0] if buy_queue else None
        if active_buy and reanchor and b.day > add_month(active_buy.sale_date):
            prior_highs = [p.high for p in bars[:i] if b.day - timedelta(days=7) <= p.day < b.day]
            if prior_highs:
                active_buy.limit = max(prior_highs) * (1 - REBUY_DROP)
                active_buy.reanchors += 1
                reanchor_count += 1
        active_sell = holdings[0] if holdings else None
        if active_buy and active_sell:
            active_both_days += 1

        # Only orders active before today's open are eligible. A newly created
        # order after either fill becomes live on the next trading session.
        buy_hit = bool(active_buy and b.low <= active_buy.limit)
        sell_hit = bool(active_sell and b.high >= active_sell.limit)
        buy_fill = None
        sell_fill = None
        if buy_hit:
            candidate = b.open if b.open <= active_buy.limit else active_buy.limit
            # Do not use same-day sale proceeds to fund a pre-existing buy order.
            if cash + 1e-9 >= candidate:
                buy_fill = candidate
        if sell_hit:
            sell_fill = b.open if b.open >= active_sell.limit else active_sell.limit

        if buy_fill is not None:
            ticket = buy_queue.pop(0)
            cash -= buy_fill
            new_lot = SellLot(ticket.unit, b.day, buy_fill, buy_fill * (1 + X))
            holdings.append(new_lot)
            fills.append({'date': b.day.isoformat(), 'side': 'BUY', 'unit': ticket.unit,
                          'price_hkd': buy_fill, 'limit_hkd': ticket.limit,
                          'note': '回撤买回' if ticket.reanchors == 0 else '超月后按近7日高点重锚买回'})
            buy_only_days += 1

        if sell_fill is not None:
            # The pre-existing active sell lot is still in the queue; new buy
            # lots append behind it and therefore cannot be sold today.
            lot = next((x for x in holdings if x is active_sell), None)
            if lot is not None:
                holdings.remove(lot)
                cash += sell_fill
                buy_queue.append(BuyTicket(lot.unit, b.day, sell_fill,
                                           sell_fill * (1 - REBUY_DROP)))
                fills.append({'date': b.day.isoformat(), 'side': 'SELL', 'unit': lot.unit,
                              'price_hkd': sell_fill, 'limit_hkd': lot.limit,
                              'note': '上涨4%挂单卖出，卖后回撤8%挂单买回'})
                sell_only_days += 1
        if buy_fill is not None and sell_fill is not None:
            both_filled_days += 1
            buy_only_days -= 1
            sell_only_days -= 1

        shares = core + len(holdings)
        nav = cash + shares * b.close
        navs.append(nav)
        cash_days.append(cash)
        share_days.append(shares)
        daily_rows.append({'date': b.day.isoformat(), 'close_hkd': b.close,
                           'cash_hkd': cash, 'shares': shares, 'nav_hkd': nav,
                           'active_buy': int(bool(buy_queue)), 'active_sell': int(bool(holdings))})

    last = bars[-1]
    final_shares = core + len(holdings)
    final_nav = cash + final_shares * last.close
    mdd, underwater = drawdown(navs)
    start_nav = 5 * SEED_PRICE
    sells = sum(x['side'] == 'SELL' for x in fills)
    buys = sum(x['side'] == 'BUY' for x in fills)
    summary = {
        'name': f'{core_units}core_{swing_units}swing_' + ('reanchor' if reanchor else 'fixed8'),
        'core_units': core_units, 'swing_units': swing_units, 'reanchor': reanchor,
        'start_nav_hkd': start_nav, 'final_nav_hkd': final_nav,
        'total_return': final_nav / start_nav - 1,
        'max_drawdown': mdd, 'longest_underwater_sessions': underwater,
        'ending_cash_hkd': cash, 'ending_shares': final_shares,
        'dividends_received_hkd': dividend_total,
        'average_cash_hkd': sum(cash_days) / len(cash_days),
        'average_cash_pct_nav': sum(c / n for c, n in zip(cash_days, navs[1:])) / len(cash_days),
        'average_shares': sum(share_days) / len(share_days),
        'average_share_pct': sum(s / 5 for s in share_days) / len(share_days),
        'sell_fills': sells, 'buy_fills': buys,
        'days_with_buy_and_sell_orders': active_both_days,
        'days_both_orders_filled': both_filled_days,
        'reanchor_updates': reanchor_count,
        'buyback_units_waiting_at_end': len(buy_queue),
        'swing_units_held_at_end': len(holdings),
        'active_buy_order_at_end': int(bool(buy_queue)),
        'active_sell_order_at_end': int(bool(holdings)),
        'fills': fills, 'daily_rows': daily_rows,
    }
    return summary


def passive():
    bars, dividends = load()
    seed = next(i for i, b in enumerate(bars) if b.day == SEED_DATE)
    divs = 0.0
    vals = [5 * SEED_PRICE]
    cash_path = []
    for b in bars[seed + 1:]:
        divs += 5 * dividends.get(b.day, 0)
        nav = 5 * b.close + divs
        vals.append(nav)
        cash_path.append((divs, nav))
    mdd, underwater = drawdown(vals)
    last = bars[-1]
    return {'name': '5hold', 'start_nav_hkd': vals[0], 'final_nav_hkd': vals[-1],
            'total_return': vals[-1] / vals[0] - 1, 'max_drawdown': mdd,
            'longest_underwater_sessions': underwater, 'ending_cash_hkd': divs,
            'ending_shares': 5, 'dividends_received_hkd': divs,
            'average_cash_hkd': sum(c for c, _ in cash_path) / len(cash_path),
            'average_cash_pct_nav': sum(c / n for c, n in cash_path) / len(cash_path),
            'average_shares': 5, 'average_share_pct': 1,
            'sell_fills': 0, 'buy_fills': 0, 'days_with_buy_and_sell_orders': 0,
            'days_both_orders_filled': 0, 'reanchor_updates': 0,
            'buyback_units_waiting_at_end': 0, 'swing_units_held_at_end': 0,
            'active_buy_order_at_end': 0, 'active_sell_order_at_end': 0,
            'fills': [], 'daily_rows': []}


def pct(x): return f'{x * 100:.2f}%'


def main():
    results = [passive()]
    for core, swing in ((4, 1), (3, 2)):
        for reanchor in (False, True):
            results.append(replay(core, swing, reanchor))
    OUT.mkdir(exist_ok=True)
    for result in results[1:]:
        with (OUT.parent / f"{OUT.name}-{result['name']}-逐笔成交.csv").open('w', encoding='utf-8-sig', newline='') as f:
            w = csv.DictWriter(f, fieldnames=['date','side','unit','price_hkd','limit_hkd','note'])
            w.writeheader(); w.writerows(result['fills'])
        with (OUT.parent / f"{OUT.name}-{result['name']}-每日净值.csv").open('w', encoding='utf-8-sig', newline='') as f:
            fields = ['date','close_hkd','cash_hkd','shares','nav_hkd','active_buy','active_sell']
            w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(result['daily_rows'])
    print('period=2023-04-25..2025-07-15 seed=HKD333 normalized_units=5')
    for r in results:
        print(f"{r['name']}: return={pct(r['total_return'])} maxDD={pct(r['max_drawdown'])} "
              f"endingCash={r['ending_cash_hkd']:.2f} endingShares={r['ending_shares']} "
              f"dividends={r['dividends_received_hkd']:.2f} avgCash={pct(r['average_cash_pct_nav'])} "
              f"avgShares={r['average_shares']:.2f} fills=S{r['sell_fills']}/B{r['buy_fills']} "
              f"bothOrdersDays={r['days_with_buy_and_sell_orders']} bothFillDays={r['days_both_orders_filled']} "
              f"reanchors={r['reanchor_updates']} underwater={r['longest_underwater_sessions']} "
              f"waitingBuybackUnits={r['buyback_units_waiting_at_end']} "
              f"swingUnitsHeld={r['swing_units_held_at_end']} "
              f"activeBuy={r['active_buy_order_at_end']} activeSell={r['active_sell_order_at_end']}")
    # Persist exact metrics so the report can be regenerated from the same run.
    with (ROOT / '腾讯五份仓位回测结果.csv').open('w', encoding='utf-8-sig', newline='') as f:
        keys = ['name','core_units','swing_units','reanchor','start_nav_hkd','final_nav_hkd','total_return',
                'max_drawdown','longest_underwater_sessions','ending_cash_hkd','ending_shares',
                'dividends_received_hkd','average_cash_hkd','average_cash_pct_nav','average_shares',
                'average_share_pct','sell_fills','buy_fills','days_with_buy_and_sell_orders',
                'days_both_orders_filled','reanchor_updates','buyback_units_waiting_at_end',
                'swing_units_held_at_end','active_buy_order_at_end','active_sell_order_at_end']
        w=csv.DictWriter(f,fieldnames=keys); w.writeheader(); w.writerows([{k:r.get(k) for k in keys} for r in results])

if __name__ == '__main__': main()

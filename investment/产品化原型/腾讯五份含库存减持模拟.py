#!/usr/bin/env python3
"""Sensitivity test adding the user's 21-session-low inventory sell ladder."""
from __future__ import annotations
import csv, sys
from datetime import timedelta
from pathlib import Path

ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT))
import 腾讯五份仓位回测 as base

X=base.X
REBUY_DROP=base.REBUY_DROP
OUT=ROOT/'腾讯五份含库存减持模拟'


def replay(core_count:int,swing_count:int,reanchor:bool):
    bars,dividends=base.load()
    seed=next(i for i,b in enumerate(bars) if b.day==base.SEED_DATE)
    core_ids=list(range(1,core_count+1))
    holdings=[base.SellLot(unit=i+1,entry_date=base.SEED_DATE,entry_price=base.SEED_PRICE,
                           limit=base.SEED_PRICE*(1+X)) for i in range(core_count,5)]
    buys:list[base.BuyTicket]=[]
    cash=div_total=0.0
    fills=[]; navs=[5*base.SEED_PRICE]; daily=[]
    both_orders_days=both_filled_days=0
    wave_sell_days=core_sell_days=0
    anchor_resets=inventory_sales=0
    anchor_low=None; tranches_sold=0; prev_window_low=None
    cash_ratios=[]; share_counts=[]

    for i in range(seed+1,len(bars)):
        bar=bars[i]
        shares_before=len(core_ids)+len(holdings)
        dividend=shares_before*dividends.get(bar.day,0.0)
        cash+=dividend; div_total+=dividend

        # Use the 21 completed sessions before today to avoid same-bar low/high
        # ordering look-ahead. A fresh lower rolling 21-session low starts a
        # new tranche ladder; a rising window low alone does not reset it.
        window_low=None
        if i-seed>=21:
            window_low=min(x.low for x in bars[i-21:i])
            if prev_window_low is None:
                anchor_low=window_low
                tranches_sold=0
            elif window_low < prev_window_low-1e-9:
                anchor_low=window_low
                tranches_sold=0
                anchor_resets+=1
            else:
                anchor_low=window_low
            prev_window_low=window_low

        active_buy=buys[0] if buys else None
        if active_buy and reanchor and bar.day>base.add_month(active_buy.sale_date):
            recent_highs=[p.high for p in bars[:i]
                          if bar.day-timedelta(days=7)<=p.day<bar.day]
            if recent_highs:
                active_buy.limit=max(recent_highs)*(1-REBUY_DROP)
                active_buy.reanchors+=1

        active_wave=holdings[0] if holdings else None
        active_core_unit=None
        core_sell_limit=None
        if active_wave is None and core_ids and anchor_low is not None:
            active_core_unit=core_ids[0]
            trigger_pct=X*(4+2*tranches_sold) # 4x, then 6x, 8x ...
            core_sell_limit=anchor_low*(1+trigger_pct)
        active_sell=bool(active_wave or active_core_unit is not None)
        if active_buy and active_sell:
            both_orders_days+=1

        buy_hit=bool(active_buy and bar.low<=active_buy.limit)
        if active_wave:
            sell_hit=bar.high>=active_wave.limit
            sale_limit=active_wave.limit
        else:
            sell_hit=bool(active_core_unit is not None and bar.high>=core_sell_limit)
            sale_limit=core_sell_limit
        buy_fill=None; sell_fill=None
        if buy_hit:
            candidate=bar.open if bar.open<=active_buy.limit else active_buy.limit
            # A same-day sell cannot fund a pre-existing buy order.
            if cash+1e-9>=candidate:
                buy_fill=candidate
        if sell_hit:
            sell_fill=bar.open if bar.open>=sale_limit else sale_limit

        if buy_fill is not None:
            ticket=buys.pop(0); cash-=buy_fill
            holdings.append(base.SellLot(ticket.unit,bar.day,buy_fill,buy_fill*(1+X)))
            fills.append({'date':bar.day.isoformat(),'side':'BUY','unit':ticket.unit,
                          'price_hkd':buy_fill,'limit_hkd':ticket.limit,
                          'type':'回撤买回','note':('超月重锚' if ticket.reanchors else '卖后回撤8%')})
        if sell_fill is not None:
            cash+=sell_fill
            if active_wave is not None:
                lot=next((x for x in holdings if x is active_wave),None)
                if lot is not None:
                    holdings.remove(lot); wave_sell_days+=1
                    unit=lot.unit; reason='波段仓上涨4%'
            else:
                unit=active_core_unit
                core_ids.remove(active_core_unit)
                tranches_sold+=1; inventory_sales+=1; core_sell_days+=1
                reason=f'21交易日低点分档{4+2*(tranches_sold-1)}x'
            buys.append(base.BuyTicket(unit,bar.day,sell_fill,sell_fill*(1-REBUY_DROP)))
            fills.append({'date':bar.day.isoformat(),'side':'SELL','unit':unit,
                          'price_hkd':sell_fill,'limit_hkd':sale_limit,
                          'type':reason,'note':'卖后回撤8%挂买回单'})
        if buy_fill is not None and sell_fill is not None:
            both_filled_days+=1

        shares=len(core_ids)+len(holdings)
        nav=cash+shares*bar.close
        navs.append(nav); share_counts.append(shares); cash_ratios.append(cash/nav if nav else 0)
        # State for the next session: a wave sell order has priority; if none,
        # a core inventory sell limit is available once a full 21-day window exists.
        next_active_sell=bool(holdings or (core_ids and window_low is not None))
        daily.append({'date':bar.day.isoformat(),'close_hkd':bar.close,'cash_hkd':cash,
                      'shares':shares,'core_units':len(core_ids),'wave_units':len(holdings),
                      'nav_hkd':nav,'active_buy_next_session':int(bool(buys)),
                      'active_sell_next_session':int(next_active_sell),
                      'rolling_21_session_low_hkd':window_low or '',
                      'next_core_sell_limit_hkd':(anchor_low*(1+X*(4+2*tranches_sold))
                                                  if core_ids and anchor_low is not None else '')})
    final=bars[-1]; final_shares=len(core_ids)+len(holdings)
    final_nav=cash+final_shares*final.close
    mdd,underwater=base.drawdown(navs)
    return {
        'name':f'{core_count}core_{swing_count}swing_'+('reanchor' if reanchor else 'fixed8')+'_inventory',
        'core_units_start':core_count,'swing_units_start':swing_count,'reanchor':reanchor,
        'start_nav_hkd':5*base.SEED_PRICE,'final_nav_hkd':final_nav,
        'total_return':final_nav/(5*base.SEED_PRICE)-1,'max_drawdown':mdd,
        'longest_underwater_sessions':underwater,'ending_cash_hkd':cash,
        'ending_shares':final_shares,'ending_core_units':len(core_ids),
        'ending_wave_units':len(holdings),'dividends_received_hkd':div_total,
        'average_cash_pct_nav':sum(cash_ratios)/len(cash_ratios),
        'average_shares':sum(share_counts)/len(share_counts),
        'sell_fills':sum(x['side']=='SELL' for x in fills),
        'buy_fills':sum(x['side']=='BUY' for x in fills),
        'inventory_sales':inventory_sales,'wave_sell_days':wave_sell_days,
        'core_sell_days':core_sell_days,'days_with_both_orders':both_orders_days,
        'days_both_filled':both_filled_days,'anchor_resets':anchor_resets,
        'buyback_units_waiting':len(buys),'active_buy_end':int(bool(buys)),
        'active_sell_end':int(bool(holdings or (core_ids and len(bars)-1-seed>=21))),
        'fills':fills,'daily':daily,
    }


def pct(x): return f'{x*100:.2f}%'


def main():
    results=[base.passive()]
    for core,swing in ((4,1),(3,2)):
        for reanchor in (False,True):
            results.append(replay(core,swing,reanchor))
    for r in results[1:]:
        with (ROOT/f"{OUT.name}-{r['name']}-逐笔.csv").open('w',encoding='utf-8-sig',newline='') as f:
            w=csv.DictWriter(f,fieldnames=['date','side','unit','price_hkd','limit_hkd','type','note'])
            w.writeheader(); w.writerows(r['fills'])
        with (ROOT/f"{OUT.name}-{r['name']}-每日.csv").open('w',encoding='utf-8-sig',newline='') as f:
            fields=['date','close_hkd','cash_hkd','shares','core_units','wave_units','nav_hkd',
                    'active_buy_next_session','active_sell_next_session',
                    'rolling_21_session_low_hkd','next_core_sell_limit_hkd']
            w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(r['daily'])
    print('period=2023-04-25..2025-07-15 seed=HKD333; 21-session low ladder enabled')
    for r in results:
        if r['name']=='5hold':
            print(f"5hold return={pct(r['total_return'])} maxDD={pct(r['max_drawdown'])}")
            continue
        print(f"{r['name']}: return={pct(r['total_return'])} maxDD={pct(r['max_drawdown'])} "
              f"avgCash={pct(r['average_cash_pct_nav'])} avgShares={r['average_shares']:.2f} "
              f"sells={r['sell_fills']} buys={r['buy_fills']} inventorySells={r['inventory_sales']} "
              f"bothOrderDays={r['days_with_both_orders']} bothFillDays={r['days_both_filled']} "
              f"coreEnd={r['ending_core_units']} waveEnd={r['ending_wave_units']} "
              f"cashEnd={r['ending_cash_hkd']:.2f} activeBuyEnd={r['active_buy_end']} "
              f"activeSellEnd={r['active_sell_end']} resets={r['anchor_resets']}")
    fields=['name','core_units_start','swing_units_start','reanchor','start_nav_hkd','final_nav_hkd',
            'total_return','max_drawdown','longest_underwater_sessions','ending_cash_hkd',
            'ending_shares','ending_core_units','ending_wave_units','dividends_received_hkd',
            'average_cash_pct_nav','average_shares','sell_fills','buy_fills','inventory_sales',
            'wave_sell_days','core_sell_days','days_with_both_orders','days_both_filled',
            'anchor_resets','buyback_units_waiting','active_buy_end','active_sell_end']
    with (ROOT/'腾讯五份含库存减持模拟结果.csv').open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields); w.writeheader()
        w.writerows([{k:r.get(k) for k in fields} for r in results])

if __name__=='__main__': main()

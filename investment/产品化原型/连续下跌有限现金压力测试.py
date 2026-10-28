#!/usr/bin/env python3
"""Isolated synthetic stress test for cash runway and fresh-entry gating."""
from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent
X = 0.04
REBUY = 0.08
SEED = 100.0
MAX_UNITS = 5
START_CORE = 3
START_CASH = 2 * SEED


@dataclass
class Ticket:
    unit: int
    limit: float
    kind: str
    created: int
    sale_price: float = 0.0
    reanchors: int = 0


@dataclass
class Lot:
    unit: int
    entry: float


def path() -> list[dict]:
    """Synthetic decline / rebound / deeper decline / rebound path."""
    closes = [SEED]
    for end, days in ((75.0, 25), (102.0, 12), (55.0, 25), (72.0, 10)):
        start = closes[-1]
        for step in range(1, days + 1):
            closes.append(start * (end / start) ** (step / days))
    bars = []
    for i, close in enumerate(closes):
        prev = closes[i - 1] if i else close
        op = prev
        bars.append({"day": i, "open": op, "high": max(op, close) * 1.003,
                     "low": min(op, close) * 0.997, "close": close})
    return bars


def dd(values: list[float]) -> float:
    peak = values[0]
    worst = 0.0
    for value in values:
        peak = max(peak, value)
        worst = min(worst, value / peak - 1)
    return worst


def run(gate_always_passes: bool) -> tuple[dict, list[dict], list[dict]]:
    bars = path()
    core = START_CORE
    waves: list[Lot] = []
    queue: list[Ticket] = []
    cash = START_CASH
    next_unit = START_CORE + 1
    fills: list[dict] = []
    daily: list[dict] = []
    navs = [START_CORE * SEED + START_CASH]
    reanchors = 0
    cash_below_close_days = 0
    peak_holdings = core

    for i in range(1, len(bars)):
        bar = bars[i]
        # One buy order is active at a time. Tickets follow FIFO; a later sell
        # adds a rebuy plan to the queue. This path has no fresh-order conflict.
        if not queue and gate_always_passes and core + len(waves) < MAX_UNITS and cash > 0 and i >= 7:
            prior_high = max(b["high"] for b in bars[max(0, i - 7):i])
            queue.append(Ticket(next_unit, prior_high * (1 - 2 * X), "估值通过后新建仓", i))

        active_buy = queue[0] if queue else None
        if active_buy and i - active_buy.created >= 21:
            recent_high = max(b["high"] for b in bars[max(0, i - 7):i])
            new_limit = recent_high * (1 - 2 * X)
            if abs(new_limit - active_buy.limit) > 1e-9:
                active_buy.limit = new_limit
                active_buy.reanchors += 1
                reanchors += 1

        active_sell = waves[0] if waves else None
        sell_limit = active_sell.entry * (1 + X) if active_sell else None
        buy_hit = bool(active_buy and bar["low"] <= active_buy.limit)
        sell_hit = bool(active_sell and bar["high"] >= sell_limit)
        buy_price = None
        if buy_hit:
            buy_price = bar["open"] if bar["open"] <= active_buy.limit else active_buy.limit
            # Do not borrow or spend same-session sale proceeds before they exist.
            if cash + 1e-9 < buy_price:
                buy_price = None
        sell_price = None
        if sell_hit:
            sell_price = bar["open"] if bar["open"] >= sell_limit else sell_limit

        if buy_price is not None:
            ticket = queue.pop(0)
            cash -= buy_price
            unit = ticket.unit
            if ticket.kind == "估值通过后新建仓":
                next_unit += 1
            waves.append(Lot(unit, buy_price))
            fills.append({"day": i, "side": "BUY", "unit": unit, "price": buy_price,
                          "type": ticket.kind, "limit": ticket.limit})

        if sell_price is not None:
            waves.remove(active_sell)
            cash += sell_price
            queue.append(Ticket(active_sell.unit, sell_price * (1 - REBUY), "卖后回撤8%买回",
                                i, sale_price=sell_price))
            fills.append({"day": i, "side": "SELL", "unit": active_sell.unit,
                          "price": sell_price, "type": "买入价上涨4%卖出",
                          "limit": sell_limit})

        shares = core + len(waves)
        peak_holdings = max(peak_holdings, shares)
        nav = cash + shares * bar["close"]
        navs.append(nav)
        active_buy = queue[0] if queue else None
        if cash + 1e-9 < bar["close"]:
            cash_below_close_days += 1
        daily.append({"day": f"D{i:02d}", "close": bar["close"], "cash": cash,
                      "core_shares": core, "swing_shares": len(waves), "shares": shares,
                      "nav": nav, "active_buy": int(bool(active_buy)),
                      "buy_queue": len(queue), "active_sell": int(bool(waves)),
                      "cash_cannot_buy_one_unit": int(cash + 1e-9 < bar["close"])})

    summary = {
        "scenario": "估值门控持续通过（最大买入压力）" if gate_always_passes else "估值门控始终不通过（现金保留边界）",
        "synthetic_days": len(bars) - 1,
        "start_nav": START_CORE * SEED + START_CASH,
        "final_close": bars[-1]["close"],
        "final_cash": cash,
        "final_shares": core + len(waves),
        "final_nav": cash + (core + len(waves)) * bars[-1]["close"],
        "return": (cash + (core + len(waves)) * bars[-1]["close"]) / (START_CORE * SEED + START_CASH) - 1,
        "max_drawdown": dd(navs),
        "peak_shares": peak_holdings,
        "buys": sum(x["side"] == "BUY" for x in fills),
        "sells": sum(x["side"] == "SELL" for x in fills),
        "reanchors": reanchors,
        "cash_below_close_days": cash_below_close_days,
        "cash_end_can_buy_one_unit": int(cash + 1e-9 >= bars[-1]["close"]),
    }
    return summary, fills, daily


def main() -> None:
    summaries = []
    for gate in (True, False):
        summary, fills, daily = run(gate)
        summaries.append(summary)
        stem = "连续下跌压力测试-" + ("估值通过" if gate else "估值未通过")
        with (ROOT / f"{stem}-逐笔.csv").open("w", encoding="utf-8-sig", newline="") as f:
            w = csv.DictWriter(f, fieldnames=["day", "side", "unit", "price", "type", "limit"])
            w.writeheader(); w.writerows(fills)
        with (ROOT / f"{stem}-每日.csv").open("w", encoding="utf-8-sig", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(daily[0]))
            w.writeheader(); w.writerows(daily)
    with (ROOT / "连续下跌有限现金压力测试结果.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(summaries[0]))
        w.writeheader(); w.writerows(summaries)
    for s in summaries:
        print(s)


if __name__ == "__main__":
    main()

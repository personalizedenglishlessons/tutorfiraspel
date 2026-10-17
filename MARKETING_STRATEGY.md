# Marketing Strategy: Pricing Positioning (2026-10-17)

Decision of the session: prices stay exactly as they are. The strategy is in the framing,
not the numbers. This document records the positioning logic so future sessions keep it
consistent.

## Why the prices work as they are

Both tracks escalate live classes with duration, so the total price rises with commitment
even when the per-month equivalent does not. The old UI sold the per-month number, which
made the 3-month plan look worse than 2 months (433 vs 400, and 783 vs 775). That number
was the wrong metric to display.

The right metrics, which always move in the buyer's favor:

| Tier | Price | Savings vs monthly | Classes | Price per class |
|---|---|---|---|---|
| SF0 1m | 650 | - | 0 | - |
| SF0 2m | 800 | 500 | 8 | 100 |
| SF0 3m | 1300 | 650 | 24 | 54 |
| EP 1m | 1000 | - | 4 | 250 |
| EP 2m | 1550 | 450 | 16 | 97 |
| EP 3m | 2350 | 650 | 36 | 65 |

Per-class cost falls as commitment grows (SF0: 100 to 54, EP: 250 to 65). Savings rise.
The 3-month "افضل قيمه" badge is now literally true on the metrics shown.

## Framing rules (apply to any new pricing copy)

1. Never display the per-month equivalent for multi-month plans. It rises from 2m to 3m
   and undermines the offer. Per-month is allowed on the 1-month plan only.
2. Every multi-month price line leads with the savings: "توفير X ريال عن الدفع الشهري".
3. Every plan with classes shows the per-class cost: "الحصه تعادل X ريال". This is the
   strongest commitment argument; keep it adjacent to the classes box.
4. Longer plans are framed as "الباقه الكامله" (the complete plan), never as a discount.
5. Copy style: local dialect Arabic, no hamzas, no emojis, no em dashes, and never name
   the target market in user-facing copy (the audience recognizes itself in the dialect).

## Where the framing renders (all updated this session)

- `index.html` renderPricing: savings line replaces the per-month line on multi-month
  cards; per-class cost appended inside the classes box. Recomputed from DB rows.
- `lib/pel-assessment.js` cardHtml: same two changes, same formulas.
- `login.html` lp card rows: each multi-month row now carries a sub-line
  "توفير X ريال · N حصص مباشره".
- `app.html` gate cards: gold savings line under the price for multi-month plans.
- `lib/pel-plans.js`: 3-month perMonth strings replaced with savings + classes text.
- `index.html` FAQ answer: includes savings in parentheses per duration.

Formulas (all client-side, all recomputed if the admin changes prices in Admin > Billing):
- savings = (1-month price of same tier) x months - price
- classes = weekly_live_classes x months x 4
- per-class = round(price / classes)

Static copies that need manual updates if prices change: the FAQ answer in index.html
and the 3-month perMonth strings in lib/pel-plans.js.

## Promotion plays (not yet implemented, ranked)

1. Level-test funnel: the free assessment already exists; its results page should end
   with the value-framed cards (it now does) plus a time-boxed line like
   "سعرك يثبت لمدة 24 ساعه" (price locks for 24h). Cheap urgency, honest if honored.
2. WhatsApp-first close: the payment flow already runs on WhatsApp. Add to the tutor's
   reply template the savings and per-class numbers for the tier the student asked
   about, so the pitch matches the site exactly.
3. Referral: existing students get 1 extra live class for each friend who subscribes
   to a 2m or 3m plan. Costs one class hour, prices never touch the ladder.
4. Seasonal windows (school terms, exam seasons): keep prices fixed; offer bonus
   classes (e.g., 3m plans get 2 extra classes during exam season) so the ladder
   stays coherent year-round.
5. Never discount the 1-month tier; it is the anchor that makes savings legible.

## Benchmarks collected this session (for future reference)

- Cambly (same market, 1 lesson/week): 200 SAR/month; commitment curve about 10 percent
  off at 3 months, 25 to 35 percent off at 12 months.
- Wall Street English (same market): bundles framed as free months (12+2, 18+2).
- Local institutes: course-based pricing from about 2500 SAR per course.
- The app's 2m/3m tiers undercut all of these on per-class cost once classes are
  included, which is the number to lead with in any comparison marketing.

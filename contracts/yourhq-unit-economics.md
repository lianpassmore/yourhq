# YourHQ Unit Economics

*Last updated: 2026-05-03*
*Status: Internal planning document — review against actuals every 6 months.*

---

## At a glance

| Metric | Self-sourced | Nic-sourced |
|---|---|---|
| Build gross profit | $1,191 | $891 |
| Build gross margin | 66% | 49% |
| Monthly contribution per active client | $62 | $48.72 |
| Lifetime value (36 months) | ~$3,607 | ~$2,829 |
| Customer acquisition cost (CAC) | ~$0 | $300 |
| LTV : CAC ratio | n/a | 9.4× |
| Payback period | Month 1 | Month 1 |

All figures NZD, excluding GST.

---

## 1. Per-build unit economics

| Line | Amount | Notes |
|---|---|---|
| Build revenue | $1,800 | Setup fee, excl. GST |
| − Lian's build labour | −$525 | 3 hrs × $175/hr (paid to Lian as builder) |
| − Stripe processing | −$54 | ~3% of $1,800 |
| − Domain registration (year 1) | −$30 | Pass-through cost |
| **Gross profit per build** | **$1,191** | **66% gross margin** |
| − Nic commission (if Nic-sourced) | −$300 | Flat fee per Schedule A |
| **Net profit per build (Nic-sourced)** | **$891** | **49% net margin** |
| **Net profit per build (self-sourced)** | **$1,191** | **66% net margin** |

**Lian's personal income per build:** $525 builder pay + 100% of net profit (as owner) = **$1,716 self-sourced** / **$1,416 Nic-sourced**.

---

## 2. Per-client recurring economics (monthly)

Using blended tier mix (40% Sorted / 50% Connected / 10% Building = $166/mo blended).

| Line | Amount/month | Notes |
|---|---|---|
| Caretaker subscription revenue | $166 | Blended across tiers |
| − Caretaker labour | −$73 | ~25 min/mo blended × $175/hr |
| − Annual refresh amortised | −$25 | ~10 hrs/yr × $175 ÷ 12 |
| − Hosting + tech allocated per client | −$6 | Vercel + Supabase + ElevenLabs spread across base |
| **Contribution margin (self-sourced)** | **$62/mo** | **37% margin** |
| − Nic recurring tail (8%) | −$13.28 | If Nic-sourced |
| **Contribution margin (Nic-sourced)** | **$48.72/mo** | **29% margin** |

The caretaker labour and annual refresh lines flow to Lian as her ongoing operating pay. They are cost-of-service when modelling whether YourHQ could hire someone else; they are income to Lian when she does it herself.

---

## 3. Lifetime value (36-month assumption)

| | Self-sourced | Nic-sourced |
|---|---|---|
| Build revenue + typical Power-Ups | $1,840 | $1,840 |
| Recurring revenue (36 × $166) | $5,976 | $5,976 |
| **Total LTV revenue** | **$7,816** | **$7,816** |
| − Variable costs over 36 months | −$4,209 | −$4,209 |
| − Nic upfront + 36-month tail | $0 | −$778 |
| **Net LTV** | **$3,607** | **$2,829** |

The 36-month assumption is a placeholder. There aren't enough cohorts yet to measure actual retention. If average lifetime is 60 months — likely for a sticky service with annual refreshes built in — LTV roughly doubles.

---

## 4. LTV : CAC and payback

### Self-sourced clients
- CAC ≈ $0 (organic only, no paid acquisition)
- LTV ≈ $3,607
- Payback: instant — Build profit ($1,191) is positive cashflow on day one

### Nic-sourced clients
- CAC = $300 (Nic's flat upfront)
- LTV = $2,829
- LTV : CAC = **9.4×** (industry benchmark for healthy SaaS is 3×)
- Payback: instant — Build profit net of Nic ($891) is positive on day one

**The structural advantage:** YourHQ never goes into debt to acquire a customer. Every build pays for itself before the recurring kicks in. This is rare for subscription businesses and is why YourHQ can be profitable without external capital.

---

## 5. Fixed cost coverage

Monthly fixed cost floor: ~$1,000 NZD (see [running costs](#)).

| Coverage path | Clients / builds needed |
|---|---|
| Cover fixed costs from recurring alone (self-sourced) | ~17 active clients |
| Cover fixed costs from recurring alone (Nic-sourced) | ~21 active clients |
| Cover fixed costs from one month's build profit | ~1 self-sourced build / ~2 Nic-sourced builds |

As soon as ~20 active clients are on the books, **or** ~2 builds/mo are coming in, the business covers itself before any of Lian's owner draw.

---

## 6. The 275 and 650 milestones in unit-economics terms

| Milestone | Active clients | Monthly recurring revenue | Recurring contribution to YourHQ (assumes ~50% Nic-sourced) | Annual contribution from recurring |
|---|---|---|---|---|
| Replace $110k salary | ~70 | ~$11,620 | ~$3,800/mo | $46k/yr |
| Husband can stop (275) | 275 | ~$45,650 | ~$15,100/mo | $181k/yr |
| North Star (650) | 650 | ~$107,900 | ~$35,800/mo | $429k/yr |

**On top of recurring,** build revenue keeps coming in. At 5 builds/mo sustained, that's ~$5,000/mo in build profit added to recurring contribution at any milestone.

**At 275 active clients,** Lian's all-in income (build labour + build profit + recurring contribution + owner draw) lands ~$25k–30k/mo.
**At 650,** ~$50k–60k/mo.

---

## 7. Where the unit economics strain

The margins are healthy. What breaks first as the business scales is **labour capacity**, not unit economics.

1. **Caretaker labour ceiling.** At 25 min/mo per client × 275 clients = 115 hrs/mo of caretaker work. Fits inside Lian's 32hrs/wk capacity with overflow into builds. At 650 clients = 270 hrs/mo. Does not fit. **Need a caretaker contractor by ~400 active clients.**

2. **Build delivery ceiling.** At 3 hrs per build × 40 builds/mo = 120 hrs/mo. Solo capacity. Sustainable up to 40 builds/mo before needing a build contractor.

3. **Sales bottleneck (the real one).** With Nic on sales-only, a future build contractor on delivery, and Lian on caretaker — the binding constraint is "can the sales engine source 5+ builds/wk?" Likely needs a second sales partner before 650.

4. **GST cashflow.** Already GST-registered. Every line above is excl. GST — which is correct — but the 15% pass-through becomes a meaningful cashflow management item at scale.

---

## 8. Assumptions table

The model rests on these inputs. The two most worth verifying against real data over the next 6 months are caretaker time per client and average client lifetime — both move LTV significantly.

| Assumption | Value | Confidence |
|---|---|---|
| Tier mix | 40% Sorted / 50% Connected / 10% Building | Locked planning anchor |
| Blended monthly fee | $166/mo | Derived from tier mix |
| Build labour | 3 hrs × $175 = $525 | Locked |
| Caretaker labour blended | 25 min/mo × $175 = $73/mo | Estimate — verify against actuals |
| Annual refresh time | 10 hrs/yr × $175 = $1,750/yr | Estimate — could be higher |
| Tech costs per client | $6/mo | Allocated from $300 fixed floor |
| Stripe fees | 3% | NZ domestic; international slightly higher |
| Domain (year 1) | $30 | Pass-through |
| Average client lifetime | 36 months | **Placeholder — no real data yet** |
| Power-Up adoption | ~$40/build typical | Estimate based on 5-Power-Up menu |
| Fixed monthly running costs | ~$1,000 | Mid-point of $820–$1,210 range |

---

## Source documents

- [Nic contractor agreement](nic-contractor-agreement-v2.md) — partnership commission terms
- Memory: `project_yourhq_running_costs.md` — fixed cost floor breakdown
- Memory: `project_yourhq_targets.md` — $110k income, 275 / 650 subscriber milestones
- Memory: `project_nic_partnership.md` — partnership terms and Nic's personal context

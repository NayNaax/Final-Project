# FirstFund — Frontend Remaining Work

> Status: QA and polish only
> Date: 2026-03-31

## Resolved

- Chart trend color now follows selected range trend in [frontend/src/pages/StockDetailPage.jsx](frontend/src/pages/StockDetailPage.jsx).
- Frontend symbol map now matches backend supported symbols in [frontend/src/lib/stockInfo.js](frontend/src/lib/stockInfo.js).

## Remaining Frontend Tasks

### P1

- [ ] Run full manual UX verification after backend restart.
  - Stocks page loads with no blank table state.
  - Stock detail loads with chart and no incorrect error flicker.
  - Watchlists batch pricing fills correctly on first load.

- [ ] Validate cold-start experience with real backend timing.
  - Open app immediately after backend boot.
  - Confirm loaders/skeletons degrade gracefully until cache is warm.

### P2

- [ ] Optional polish backlog (do not block production).
  - Global top-nav stock search UX pass.
  - Mobile layout audit at 768px.
  - Theme persistence regression pass.

## New Bug Added

### High

- [ ] Agent skill file schema error appears in Problems panel and should be fixed for clean dev workflow.
  - File: [.agents/skills/subagent-driven-development/SKILL.md](.agents/skills/subagent-driven-development/SKILL.md)

# FirstFund — Remaining Work

> Status: Final verification and cleanup
> Date: 2026-03-31

## Completed Since Last Plan

- Chart trend color now uses selected range trend from filtered history in [frontend/src/pages/StockDetailPage.jsx](frontend/src/pages/StockDetailPage.jsx).
- Batch cold-start path now warms cache on full miss in [backend/src/controllers/stocks.controller.ts](backend/src/controllers/stocks.controller.ts).
- Startup pre-warm is already immediate + every 3 minutes in [backend/src/services/cron.service.ts](backend/src/services/cron.service.ts).
- Frontend/backend symbol alignment is now correct in [frontend/src/lib/stockInfo.js](frontend/src/lib/stockInfo.js) and [backend/src/lib/apiQueue.ts](backend/src/lib/apiQueue.ts).

## Remaining Bugs and Tasks

### P0

- [ ] Fix invalid skill frontmatter keys in [.agents/skills/subagent-driven-development/SKILL.md](.agents/skills/subagent-driven-development/SKILL.md): remove unsupported `risk`, `source`, `date_added`.

### P1

- [ ] Verify pre-warmer call accounting against real runtime logs.
  - Code currently records 1 call in [backend/src/lib/apiQueue.ts](backend/src/lib/apiQueue.ts).
  - Implementation currently performs one grouped request in [backend/src/services/massive.service.ts](backend/src/services/massive.service.ts).
  - Confirm with running server logs for 2-3 warm cycles.

- [ ] Verify cold-start behavior end-to-end after fresh backend restart.
  - Call `/api/stocks/batch?symbols=AAPL,MSFT` immediately.
  - Confirm response is not empty after warm-on-miss path.

### P2

- [ ] Confirm env defaults for first run are safe.
  - `MASSIVE_PREWARM_ENABLED` can disable startup warm if unset in non-production.
  - `MASSIVE_COLD_START_GROUPED_ENABLED` defaults false in code path.
  - Decide required defaults and document in root README.

## Validation Checklist

- [ ] Backend boots without errors.
- [ ] No extension/skill schema errors in Problems panel.
- [ ] `/api/health` shows expected limiter/cache fields.
- [ ] Stocks, stock detail, watchlists, dashboard load without blank-data regressions.

## Exit Criteria

All checkboxes above complete, then this file can be archived.

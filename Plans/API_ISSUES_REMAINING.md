# FirstFund — API Issues Remaining

> Status: Verification + hardening
> Date: 2026-03-31

## Resolved

- Period-trend color mismatch no longer tracked as API issue.
- Batch endpoint now performs warm-on-miss in [backend/src/controllers/stocks.controller.ts](backend/src/controllers/stocks.controller.ts).
- Symbol alignment already fixed between [backend/src/lib/apiQueue.ts](backend/src/lib/apiQueue.ts) and [frontend/src/lib/stockInfo.js](frontend/src/lib/stockInfo.js).

## Open API Bugs

### High

- [ ] Runtime verify pre-warmer accounting is accurate.
  - Check logs for each warm cycle.
  - Confirm limiter decrement count matches actual upstream grouped call count.

- [ ] Runtime verify cold-start batch behavior.
  - Restart backend.
  - Call `/api/stocks/batch?symbols=AAPL,MSFT` immediately.
  - Confirm non-empty response after warm-on-miss.

### Medium

- [ ] Decide and lock env defaults for startup behavior.
  - `MASSIVE_PREWARM_ENABLED`
  - `MASSIVE_COLD_START_GROUPED_ENABLED`

## New Bug Added

### High

- [ ] Skill schema validation error blocks clean tooling state.
  - File: [.agents/skills/subagent-driven-development/SKILL.md](.agents/skills/subagent-driven-development/SKILL.md)
  - Invalid keys: `risk`, `source`, `date_added`
  - Fix by removing unsupported keys or moving data into `metadata`.

## Verification Commands

```powershell
# backend startup and warm logs
npm run backend:dev

# immediate cold-start check
curl "http://localhost:3001/api/stocks/batch?symbols=AAPL,MSFT" -H "Authorization: Bearer <token>"

# health snapshot
curl "http://localhost:3001/api/health"
```

# FirstFund — Master API Plan (Active Delta)

> Status: API implementation complete, runtime verification pending
> Date: 2026-03-31

## Completed

- Cache-first stock API path implemented.
- Batch endpoint supports warm-on-miss.
- Health endpoint exposes limiter/cache/circuit state.
- Symbol set aligned with frontend metadata.

## Remaining API Work

### High

- [ ] Verify pre-warmer accounting in live runtime.
  - Ensure limiter decrement equals actual grouped upstream requests.

- [ ] Verify cold-start response path.
  - Restart backend and immediately hit `/api/stocks/batch?symbols=AAPL,MSFT`.
  - Confirm response contains quote objects after warm-on-miss.

### Medium

- [ ] Finalize and document env default behavior.
  - `MASSIVE_PREWARM_ENABLED`
  - `MASSIVE_COLD_START_GROUPED_ENABLED`

## Added Bug

- [ ] Fix skill file schema failure in [.agents/skills/subagent-driven-development/SKILL.md](.agents/skills/subagent-driven-development/SKILL.md) by removing unsupported frontmatter keys.

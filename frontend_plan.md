# FirstFund — Frontend Feature Plan

> **Status:** Draft — awaiting review
> **Date:** 2026-03-16
> **Scope:** Frontend feature expansion (8 placeholder pages → full implementations)
> **Skills Applied:** @brainstorming, @senior-architect, @concise-planning

---

## Current State Summary

### ✅ Already Built

| Component             | Status     | Notes                                                                |
| --------------------- | ---------- | -------------------------------------------------------------------- |
| `apiClient.js`        | ✅ Working | Authenticated fetch, auto-401 logout                                 |
| `AuthContext.jsx`     | ✅ Working | JWT login/register/logout, session restore                           |
| `ProtectedRoute.jsx`  | ✅ Working | Redirects unauthenticated users                                      |
| `DashboardLayout.jsx` | ✅ Working | Sidebar nav + top bar (bell icon, user email)                        |
| `LoginPage.jsx`       | ✅ Working | Email/password form → JWT                                            |
| `RegisterPage.jsx`    | ✅ Working | Email/password/confirm form → JWT                                    |
| `DashboardPage.jsx`   | ✅ Working | Live portfolio value, chart, recent trades                           |
| `StocksPage.jsx`      | ✅ Working | Live stock table with prices                                         |
| `StockDetailPage`     | ✅ Working | Price chart, company info, trade panel                               |
| `PortfolioPage`       | ✅ Working | Positions table, P&L, allocation donut chart                         |
| `TradePage`           | ✅ Working | Stock search, share input, preview, modal                            |
| `WatchlistsPage`      | ✅ Working | CRUD watchlists, live prices                                         |
| `AlertsPage`          | ✅ Working | Create alert form, active alerts list                                |
| `index.css`           | ✅ Working | Light/dark theme vars, glassmorphism, responsive breakpoints started |

### ❌ Stub Pages (in `PlaceholderPage.jsx`)

`BudgetPage`, `LeaderboardPage`, `SettingsPage` — all render a single placeholder card.

### Backend API Available

All endpoints from `ARCH_PLAN.md` §3 are fully built: auth, stocks, portfolio (buy/sell/trades/history), watchlists CRUD, alerts CRUD, settings, leaderboard.

---

## Design Principles

- **Glassmorphism-first** — every card/panel uses the existing `glass` CSS utility and the `--bg-secondary`, `--glass-border`, `--glass-shadow` vars.
- **CSS Module per page** — each page gets its own `.module.css` file; shared patterns go in `index.css`.
- **Recharts for all charts** — already installed. Use `AreaChart`, `PieChart`, `BarChart`, `LineChart` as needed.
- **Lucide icons** — already installed. Use for all iconography.
- **API calls via `api.get()` / `api.post()`** — no direct `fetch()`. Let the `apiClient` handle auth headers.
- **Polling at 30s intervals** — match the existing `DashboardPage` pattern for live data.
- **Mobile-first responsive** — use `@media (max-width: 768px)` breakpoints consistently.

---

## Feature Specifications

---

### 🟡 REMAINING MEDIUM PRIORITY

#### F6. Dashboard Enhancements (`/`)

**Brainstorm — What's missing from the current dashboard:**
The current dashboard has portfolio value, a chart, and recent trades. It needs a holdings snapshot and market movers to be truly useful without navigating away.

**Technical Spec:**

| Detail   | Value                                                                                     |
| -------- | ----------------------------------------------------------------------------------------- |
| **File** | `src/pages/DashboardPage.jsx` (modify existing)                                           |
| **API**  | Existing: `GET /api/portfolio`, `GET /api/portfolio/history`, `GET /api/portfolio/trades` |
| **API**  | Add: `GET /api/stocks` → for top movers calculation                                       |

**New Sections to Add:**

1. **Holdings mini-table** — Below the metric cards, a compact 5-row table showing top positions by market value: Symbol, Shares, Value, P&L%. Clickable rows → `/stocks/:symbol`. "View All" link → `/portfolio`.
2. **Top movers** — Card showing the 3 biggest gainers and 3 biggest losers from the stock data (sorted by `changePercent`). Each row: Symbol, Price, Change % with green/red color.
3. **Chart date range filters** — Add buttons above the portfolio chart: 1W, 1M, 3M, ALL. Filter `history` array client-side by date range.

**Key Decisions:**

- Top movers are derived from the `GET /api/stocks` response — sort by `changePercent` descending, take top 3 and bottom 3
- Date range filter is a simple state toggle that slices the history array
- Monthly return (currently hardcoded as `$0.00`) should be calculated from trade history: sum of `(sellPrice - buyPrice) * shares` for trades this month

---

### 🟢 NICE TO HAVE — Polish Features

---

#### F7. Global Stock Search (Top Nav)

**Technical Spec:**

| Detail        | Value                                        |
| ------------- | -------------------------------------------- |
| **File**      | Modify `src/components/DashboardLayout.jsx`  |
| **Component** | Reuse `StockSearch` component in the top bar |
| **Behavior**  | On select → `navigate('/stocks/' + symbol)`  |

**Implementation:**

- Add the `StockSearch` component into the `<header>` section of `DashboardLayout.jsx`, between the page title and the bell icon
- Style it as a search bar with a magnifying glass icon (`Search` from lucide)
- On mobile, collapse to just the icon; tap to expand

---

#### F8. Leaderboard Page (`/leaderboard`)

**Technical Spec:**

| Detail    | Value                                                          |
| --------- | -------------------------------------------------------------- |
| **File**  | `src/pages/LeaderboardPage.jsx` + `LeaderboardPage.module.css` |
| **Route** | `/leaderboard`                                                 |
| **API**   | `GET /api/settings/leaderboard` → ranked user list             |

**UI Sections:**

1. **Ranked table** — Columns: Rank (#), Avatar (gradient circle with initials), Username/Email, Total Return %, Total Equity. Top 3 get gold/silver/bronze badges (🥇🥈🥉).
2. **"Your rank" highlight** — If the current user appears in the list, highlight their row with a distinct background color and a "You" badge.
3. **Empty state** — "Leaderboard will populate as more users trade."

**Key Decisions:**

- Avatars are generated from email initials (first letter) with gradient backgrounds — no image upload needed
- Rank badges are emoji medals for simplicity (no image assets needed)

---

#### F9. Settings Page (`/settings`)

**Technical Spec:**

| Detail    | Value                                                    |
| --------- | -------------------------------------------------------- |
| **File**  | `src/pages/SettingsPage.jsx` + `SettingsPage.module.css` |
| **Route** | `/settings`                                              |
| **API**   | `GET /api/settings` → user preferences                   |
| **API**   | `PATCH /api/settings` → `{ theme?, currency? }`          |

**UI Sections:**

1. **Appearance** — Theme toggle switch (Light/Dark). On change: update `document.documentElement.setAttribute('data-theme', ...)` AND `PATCH /api/settings { theme }` to persist.
2. **Currency preference** — Dropdown (`USD`, `EUR`, `GBP`, `CAD`). Saved to backend. Displayed context-wide (stretch goal).
3. **Account info** — Read-only section showing email, account created date, and a logout button.
4. **Danger zone** — Placeholder for future account deletion (just a disabled "Delete Account" button for now).

**Key Decisions:**

- Theme toggle applies immediately (optimistic UI) and saves to backend in the background
- The CSS variables already support `[data-theme="dark"]` — just toggle the attribute
- Currency is stored but formatting is a stretch goal — initially just display the preference

---

#### F10. Notifications Panel

**Technical Spec:**

| Detail             | Value                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| **File**           | `src/components/NotificationDropdown.jsx` + `NotificationDropdown.module.css` |
| **Triggered from** | Bell icon in `DashboardLayout.jsx`                                            |
| **API**            | `GET /api/alerts` → filter for `triggered === true`                           |

**Implementation:**

- Click the bell icon → toggle a dropdown panel (absolute positioned below the icon)
- Shows triggered alerts as notification cards: "🔔 AAPL crossed above $185.00" with timestamp
- Badge on the bell icon showing count of unread/triggered alerts
- "Mark all read" button at the bottom
- Empty state: "No new notifications"

**Key Decisions:**

- "Read" state is tracked in local state only (no backend persistence needed for MVP)
- Poll alerts every 30s (already polling other data at this interval)

---

#### F11. Mobile-Responsive Sidebar

**Technical Spec:**

| Detail         | Value                                                                      |
| -------------- | -------------------------------------------------------------------------- |
| **File**       | Modify `src/components/DashboardLayout.jsx` + `DashboardLayout.module.css` |
| **Breakpoint** | `@media (max-width: 768px)`                                                |

**Implementation:**

- Below 768px: sidebar collapses to hidden by default
- Add a hamburger menu button (☰) in the top bar (visible only on mobile)
- Click hamburger → slide sidebar in from the left as an overlay with a semi-transparent backdrop
- Click backdrop or any nav item → close sidebar
- Add `useState(isSidebarOpen)` to `DashboardLayout`

**Key Decisions:**

- Use CSS `transform: translateX(-100%)` for the slide animation (GPU-accelerated)
- Sidebar z-index must be above content but below any modals
- The `index.css` already has a `@media (max-width: 1024px)` breakpoint — extend with a `768px` one

---

## Shared Components Summary

| Component              | File                                      | Purpose                          | Used By                             |
| ---------------------- | ----------------------------------------- | -------------------------------- | ----------------------------------- |
| `Modal`                | `src/components/Modal.jsx`                | Generic overlay modal            | TradePage, WatchlistsPage (Built)   |
| `StockSearch`          | `src/components/StockSearch.jsx`          | Autocomplete stock symbol search | Trade, Watchlists, Alerts (Built)   |
| `EmptyState`           | `src/components/EmptyState.jsx`           | Friendly "no data" placeholder   | All pages with empty states (Built) |
| `StockPriceBadge`      | `src/components/StockPriceBadge.jsx`      | Inline symbol + price + change%  | WatchlistsPage (Built)              |
| `NotificationDropdown` | `src/components/NotificationDropdown.jsx` | Triggered alerts panel           | DashboardLayout (Unbuilt)           |

---

## New Shared Data

| File                   | Purpose                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `src/lib/stockInfo.js` | Hardcoded `STOCK_INFO` map: symbol → `{ name, sector }` for all 15 stocks |

---

## Implementation Order & Task List

### Phase 1 — Remaining Medium Priority

```
[ ] Enhance DashboardPage — holdings mini-table, top movers, chart date filters
```

### Phase 2 — Nice To Have

```
[ ] Add global stock search to DashboardLayout top bar
[ ] Build LeaderboardPage — ranked table, avatars, "your rank" highlight
[ ] Build SettingsPage — theme toggle, currency preference, account info
[ ] Build NotificationDropdown — triggered alerts from bell icon
[ ] Add mobile-responsive sidebar — hamburger menu + slide-in overlay
```

### Phase 5 — Validation

```
[ ] Test each page manually: load, interact, verify API data renders
[ ] Test trade flow end-to-end: search stock → enter shares → confirm modal → verify portfolio updates
[ ] Test watchlist CRUD: create → rename → add symbols → remove → delete
[ ] Test alert lifecycle: create → verify appears as PENDING → delete
[ ] Test theme toggle persistence: switch → refresh → verify saved
[ ] Test mobile responsive: resize browser to 768px → verify hamburger menu works
```

---

## Verification Plan

Since these are frontend UI pages, verification is **manual browser testing** by running the dev server.

### How to run

```bash
cd "c:\Users\Nayem\Documents\Final Project"
npm run dev
# Opens frontend on http://localhost:5173, backend on http://localhost:3001
```

### Test Checklist

| Feature           | Steps                                  | Expected Result                                                                                           |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Dashboard**     | Navigate to `/`                        | Holdings mini-table shows top positions. Top movers shows gainers/losers. Chart date filter buttons work. |
| **Search**        | Click search bar in top nav, type "MS" | MSFT appears in dropdown. Select → navigates to `/stocks/MSFT`.                                           |
| **Leaderboard**   | Navigate to `/leaderboard`             | Ranked table with top users. Current user row highlighted.                                                |
| **Settings**      | Navigate to `/settings`, toggle theme  | Theme switches immediately. Refresh → theme persists.                                                     |
| **Notifications** | Click bell icon                        | Dropdown shows triggered alerts (or empty state).                                                         |
| **Mobile**        | Resize browser to < 768px              | Sidebar hidden. Hamburger icon visible. Click → sidebar slides in.                                        |

---

## Decision Log

| #   | Decision                              | Alternatives Considered                  | Why Chosen                                                                   |
| --- | ------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | Hardcoded `STOCK_INFO` constant       | API endpoint for company data            | Only 15 stocks; avoids new backend work. Can migrate to DB later.            |
| 2   | Client-side chart date filtering      | Backend date range query params          | Data set is small (~252 trading days/year). Avoiding API complexity.         |
| 3   | Shared `StockSearch` component        | Per-page search implementations          | Used in 4+ places (Trade, Watchlists, Alerts, Nav). DRY principle.           |
| 4   | Shared `Modal` component              | Alert/confirm dialogs                    | Consistent look. Reusable for trade confirmation, delete confirmation.       |
| 5   | Optimistic UI for watchlist mutations | Wait for API response before updating UI | Feels faster. Revert on error, which is rare.                                |
| 6   | CSS Modules per page                  | Styled-components, Tailwind              | Already the established pattern in the codebase (DashboardPage, StocksPage). |
| 7   | Sector allocation from hardcoded map  | Backend sector API                       | 15 stocks × 8 sectors. Trivial to hardcode. No backend change needed.        |
| 8   | Local "read" state for notifications  | Backend read tracking                    | MVP — users won't need cross-device notification state.                      |

---

## Open Questions

1. **Portfolio history depth:** How many days of portfolio snapshots does `GET /api/portfolio/history` return? This affects the date range filter options.
   whatever sounds most logical

2. **Alert polling:** Should the notification badge count update on every 30s poll, or only when the user navigates between pages?
   whatever is most logical

3. **Trade from stock detail:** Should the stock detail's "Buy/Sell" form be a simplified inline form or redirect to the full `/trade` page with the symbol pre-filled?
   whatever is most logical

---

> [!TIP]
> **For the implementing model:** Start with Phase 1 (shared components) since every page depends on them. Then build Phase 2 pages in order: StockDetail → Portfolio → Trade. Each page is self-contained and testable in isolation.

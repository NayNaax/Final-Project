# Backend Improvement — Architecture Plan

> **Status:** Draft — awaiting review
> **Author:** Opus Architect
> **Date:** 2026-03-14

---

## 1. Overview

Transform the current Express + Prisma backend from an empty scaffold (routes/controllers/services dirs exist but are empty) into a fully functional finance-app API.
The plan covers **8 modules** in dependency order so each layer can be implemented and tested independently.

---

## 2. New Dependencies

| Package              | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `bcrypt`             | Password hashing                              |
| `jsonwebtoken`       | JWT auth tokens                               |
| `zod`                | Request body / query validation               |
| `express-rate-limit` | Brute-force & API throttle protection         |
| `morgan`             | HTTP request logging                          |
| `node-cron`          | Scheduled portfolio snapshots                 |
| `node-cache`         | In-memory cache for Massive.com API responses |

---

## 3. Prisma Schema (single source of truth)

Replace the current `prisma/schema.prisma` entirely. All table creation moves here — remove the raw `CREATE TABLE` from `seed.ts`.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ──────────────────── Auth ────────────────────
model User {
  id            Int            @id @default(autoincrement())
  email         String         @unique
  passwordHash  String
  createdAt     DateTime       @default(now())

  watchlists    Watchlist[]
  portfolio     Portfolio?
  trades        Trade[]
  priceAlerts   PriceAlert[]
  settings      UserSettings?
  snapshots     PortfolioSnapshot[]
}

// ──────────────────── Stocks ────────────────────
model Stock {
  id        Int      @id @default(autoincrement())
  symbol    String               // e.g. "AAPL", "MSFT", "GOOG"
  date      DateTime
  close     Float
  open      Float
  high      Float
  low       Float
  volume    BigInt
}

// ──────────────────── Watchlists ────────────────────
model Watchlist {
  id        Int      @id @default(autoincrement())
  name      String
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  symbols   String[]             // Postgres array of ticker strings

  @@unique([userId, name])
}

// ──────────────────── Portfolio & Positions ────────────────────
model Portfolio {
  id        Int        @id @default(autoincrement())
  userId    Int        @unique
  user      User       @relation(fields: [userId], references: [id])
  cash      Float      @default(10000)
  positions Position[]
}

model Position {
  id          Int       @id @default(autoincrement())
  portfolioId Int
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id])
  symbol      String
  shares      Float
  avgCost     Float

  @@unique([portfolioId, symbol])
}

// ──────────────────── Trade Ledger ────────────────────
model Trade {
  id         Int      @id @default(autoincrement())
  userId     Int
  user       User     @relation(fields: [userId], references: [id])
  symbol     String
  side       String               // "BUY" | "SELL"
  shares     Float
  price      Float
  total      Float
  realizedPL Float?               // only on SELL
  createdAt  DateTime @default(now())
}

// ──────────────────── Price Alerts ────────────────────
model PriceAlert {
  id          Int      @id @default(autoincrement())
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  symbol      String
  targetPrice Float
  direction   String               // "ABOVE" | "BELOW"
  triggered   Boolean  @default(false)
  createdAt   DateTime @default(now())
}

// ──────────────────── User Settings ────────────────────
model UserSettings {
  id        Int    @id @default(autoincrement())
  userId    Int    @unique
  user      User   @relation(fields: [userId], references: [id])
  theme     String @default("dark")
  currency  String @default("USD")
}

// ──────────────────── Portfolio Snapshots ────────────────────
model PortfolioSnapshot {
  id             Int      @id @default(autoincrement())
  userId         Int
  user           User     @relation(fields: [userId], references: [id])
  totalValue     Float
  snapshotDate   DateTime @default(now())
}
```

> **Migration command:** `npx prisma migrate dev --name init`

---

## 4. Module Breakdown

### Module A — Infrastructure Layer (implement first)

| File                                     | Purpose                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `backend/src/server.ts`                  | Express app bootstrap, mount routes, start listening on `PORT`                 |
| `backend/src/middleware/errorHandler.ts` | Global `(err, req, res, next)` handler — logs + returns `{ error, code }`      |
| `backend/src/middleware/validate.ts`     | Generic `validate(zodSchema)` middleware factory                               |
| `backend/src/middleware/rateLimiter.ts`  | `express-rate-limit` config: 100 req/15 min general, 10 req/15 min for `/auth` |
| `backend/src/lib/prisma.ts`              | Singleton Prisma client export                                                 |
| `backend/src/lib/cache.ts`               | `node-cache` wrapper: `get(key)`, `set(key, val, ttlSeconds)`, `flush(key)`    |
| `.env.example`                           | Template with all required env vars (no real values)                           |

#### `.env.example` contents:

```env
DATABASE_URL=
JWT_SECRET=
MASSIVE_API_KEY=
PORT=3001
```

---

### Module B — Auth System

| File                             | Endpoint                  | Details                                                                |
| -------------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| `routes/auth.ts`                 | `POST /api/auth/register` | Validate → hash password → create User + Portfolio ($10k) → return JWT |
|                                  | `POST /api/auth/login`    | Validate → compare hash → return JWT                                   |
|                                  | `GET  /api/auth/me`       | `requireAuth` → return user object (no password)                       |
| `middleware/requireAuth.ts`      | —                         | Verify JWT, attach `req.user = { id, email }`                          |
| `services/auth.service.ts`       | —                         | `register()`, `login()`, `getMe()` business logic                      |
| `controllers/auth.controller.ts` | —                         | Thin layer calling service, returning responses                        |

**JWT payload:** `{ userId: number, email: string }`, 7-day expiry.
**Validation (Zod):**

- Register: `{ email: z.string().email(), password: z.string().min(8) }`
- Login: same shape

---

### Module C — Massive.com API Integration + Caching

| File                             | Purpose                                                |
| -------------------------------- | ------------------------------------------------------ |
| `services/massive.service.ts`    | Wrapper around the Massive.com REST API                |
| `services/stockCache.service.ts` | Cache layer that sits in front of `massive.service.ts` |

**Caching strategy (critical for 5 calls/min limit):**

```
Request flow:
  Client → GET /api/stocks/:symbol
    → stockCache.get(symbol)
      → HIT? return cached data
      → MISS? → massive.service.fetchQuote(symbol)
               → store in node-cache (TTL = 60 seconds)
               → return data
```

- **TTL:** 60 seconds per symbol (adjustable via env `CACHE_TTL_SECONDS`)
- **Rate-limit guard:** Before calling Massive.com, check a rolling counter. If 5 calls have been made in the current minute window, queue or reject with `429 Too Many Requests`.
- **Bulk fetch:** On server startup or via cron (every 5 minutes), pre-warm the cache for all symbols in users' watchlists. Spread calls across the minute to stay under the 5/min limit.
- **Fallback:** If cache is warm but the Massive.com call fails, return stale cached data with a `X-Data-Stale: true` header.

---

### Module D — Stock Data API

| Endpoint                    | Description                                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `GET /api/stocks`           | Returns latest cached price snapshot for the user's watchlist symbols (or a default set)                       |
| `GET /api/stocks/:symbol`   | Full historical data from DB + live quote from cache. Response includes `change%`, `high`, `low`, `dataPoints` |
| `GET /api/stocks/search?q=` | Search for symbols available on Massive.com (proxy the search endpoint, cache results for 10 min)              |

**Data flow (hybrid):**

- Historical data → stored in the `Stock` table (seeded from CSV initially, later backfilled from API)
- Live/current price → fetched via Massive.com API, served from cache

---

### Module E — Watchlists (CRUD)

| Endpoint                                     | Description                           |
| -------------------------------------------- | ------------------------------------- |
| `GET    /api/watchlists`                     | All watchlists for the logged-in user |
| `POST   /api/watchlists`                     | Create a new watchlist `{ name }`     |
| `PATCH  /api/watchlists/:id`                 | Rename a watchlist                    |
| `DELETE /api/watchlists/:id`                 | Delete a watchlist                    |
| `POST   /api/watchlists/:id/symbols`         | Add a symbol `{ symbol }` to the list |
| `DELETE /api/watchlists/:id/symbols/:symbol` | Remove a symbol from the list         |

All routes are protected by `requireAuth`. Ownership validation: confirm `watchlist.userId === req.user.id`.

---

### Module F — Paper Trading Portfolio

| Endpoint                      | Description                                                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `GET  /api/portfolio`         | Cash balance + positions enriched with live price, unrealized P&L, P&L %                                        |
| `POST /api/portfolio/buy`     | Body: `{ symbol, shares }`. Deducts cash, creates/merges position (weighted avg cost). Logs a `Trade`.          |
| `POST /api/portfolio/sell`    | Body: `{ symbol, shares }`. Adds cash, calculates realized P&L, deletes position if fully sold. Logs a `Trade`. |
| `GET  /api/trades`            | Trade history with optional query filters: `?symbol=&side=&from=&to=`                                           |
| `GET  /api/portfolio/history` | Daily portfolio value snapshots for charting                                                                    |

**Buy logic (weighted average):**

```
newAvgCost = ((existingShares * existingAvgCost) + (newShares * currentPrice)) / (existingShares + newShares)
```

**Sell validation:** Cannot sell more shares than owned. Returns `400` if insufficient.

---

### Module G — Price Alerts

| Endpoint                 | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `GET    /api/alerts`     | All alerts for the logged-in user                 |
| `POST   /api/alerts`     | Create alert `{ symbol, targetPrice, direction }` |
| `DELETE /api/alerts/:id` | Remove an alert                                   |

**Alert checking:** Every time a stock price is fetched/cached, run a check against un-triggered alerts for that symbol. If `direction === "ABOVE" && currentPrice >= targetPrice` (or the inverse for BELOW), mark `triggered = true`.
_No email/push for now — just flag it. Frontend can poll `GET /api/alerts?triggered=true`._

---

### Module H — User Settings + Supporting Endpoints

| Endpoint                 | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `GET   /api/settings`    | Current user's settings                              |
| `PATCH /api/settings`    | Update settings `{ theme?, currency? }`              |
| `GET   /api/health`      | Public – returns `{ status, db, uptime, cacheSize }` |
| `GET   /api/leaderboard` | Top 20 portfolios by total return %                  |

---

## 5. Folder Structure (final)

```
backend/src/
├── server.ts                    # Express bootstrap
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   └── cache.ts                 # node-cache wrapper
├── middleware/
│   ├── requireAuth.ts           # JWT verification
│   ├── validate.ts              # Zod validation factory
│   ├── errorHandler.ts          # Global error handler
│   └── rateLimiter.ts           # express-rate-limit configs
├── routes/
│   ├── auth.ts
│   ├── stocks.ts
│   ├── watchlists.ts
│   ├── portfolio.ts
│   ├── alerts.ts
│   ├── settings.ts
│   └── health.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── stocks.controller.ts
│   ├── watchlists.controller.ts
│   ├── portfolio.controller.ts
│   ├── alerts.controller.ts
│   └── settings.controller.ts
└── services/
    ├── auth.service.ts
    ├── massive.service.ts       # Massive.com API client
    ├── stockCache.service.ts    # Cache-first wrapper
    ├── stocks.service.ts        # DB queries + cache reads
    ├── watchlists.service.ts
    ├── portfolio.service.ts
    ├── alerts.service.ts
    └── settings.service.ts
```

---

## 6. Implementation Order

| Phase | Modules                           | Why this order                                                                |
| ----- | --------------------------------- | ----------------------------------------------------------------------------- |
| **1** | A (Infrastructure)                | Everything depends on the Express app, Prisma, error handling, and validation |
| **2** | B (Auth)                          | All other routes need `requireAuth`                                           |
| **3** | C (Massive.com + Cache)           | Stock data is needed by portfolio, watchlists, and alerts                     |
| **4** | D (Stock API)                     | Exposes the cached + historical data to the frontend                          |
| **5** | E (Watchlists)                    | Standalone CRUD, depends only on auth                                         |
| **6** | F (Portfolio + Trades)            | Depends on auth + live stock prices from cache                                |
| **7** | G (Price Alerts)                  | Depends on auth + stock price cache                                           |
| **8** | H (Settings, Health, Leaderboard) | Low dependency, can be done anytime after Phase 1                             |

---

## 7. Seed Script Changes

- Add a `symbol` column to every `Stock` row (derived from the CSV filename: `stock1.csv → "STOCK1"` or mapped to real tickers once Massive.com symbols are known)
- Remove raw `CREATE TABLE` SQL — Prisma migrations handle schema
- Keep CSV seeding as a fallback/dev mode; add a `--source=api` flag to optionally backfill from Massive.com

---

## 8. Verification Plan

Since the routes/controllers/services folders are currently empty (no existing tests), verification will be manual until a test framework is added.

### Manual Verification (per phase)

| Phase              | Steps                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 – Infra**      | 1. Run `npx prisma migrate dev --name init` — confirm all tables created without errors. 2. Run `npm run dev` — confirm Express starts on the configured port, `morgan` logs appear. 3. Hit `GET http://localhost:3001/api/health` — confirm `{ status: "ok" }`. 4. Hit a non-existent route — confirm the global error handler returns JSON, not an HTML stack trace.                            |
| **2 – Auth**       | 1. `POST /api/auth/register` with valid body — confirm 201 + JWT returned. 2. Same email again — confirm 409 conflict. 3. `POST /api/auth/login` with correct creds — confirm JWT. 4. `POST /api/auth/login` with wrong password — confirm 401. 5. `GET /api/auth/me` with valid JWT in `Authorization: Bearer <token>` — confirm user object. 6. `GET /api/auth/me` with no token — confirm 401. |
| **3 – Cache**      | 1. Call `GET /api/stocks/AAPL` — confirm data returned and `X-Cache: MISS` header. 2. Call same endpoint within 60s — confirm `X-Cache: HIT`. 3. Make 6 calls in under 1 minute to different symbols — confirm the 6th returns 429.                                                                                                                                                               |
| **4 – Stocks**     | 1. `GET /api/stocks` — confirm array of latest prices. 2. `GET /api/stocks/AAPL` — confirm historical array + summary stats.                                                                                                                                                                                                                                                                      |
| **5 – Watchlists** | 1. Create watchlist, add symbols, remove one, rename, delete — confirm each CRUD operation. 2. Try to access another user's watchlist — confirm 403/404.                                                                                                                                                                                                                                          |
| **6 – Portfolio**  | 1. After registration, `GET /api/portfolio` — confirm $10,000 cash, empty positions. 2. Buy 10 shares of a symbol — confirm cash deducted, position created, trade logged. 3. Buy 5 more of same symbol — confirm weighted avg cost updated. 4. Sell 15 shares — confirm cash added, realized P&L calculated, position deleted. 5. Try selling more than owned — confirm 400.                     |
| **7 – Alerts**     | 1. Create an alert — confirm it appears in `GET /api/alerts`. 2. Trigger condition (manually set target to a price below current) — confirm `triggered` flips to `true`.                                                                                                                                                                                                                          |
| **8 – Settings**   | 1. `GET /api/settings` — confirm defaults. 2. `PATCH /api/settings` with `{ theme: "light" }` — confirm update persists. 3. `GET /api/leaderboard` — confirm ranked list.                                                                                                                                                                                                                         |

> [!TIP]
> All manual tests can be run with **curl**, **Postman**, or the **VS Code REST Client** extension. Once the API stabilizes, consider adding Jest + Supertest for automated integration tests.

---

## 9. Open Questions for the User

1. **Massive.com symbols:** What stock symbols do you want to support? A fixed list, or should users be able to search/add any symbol available on Massive.com?
   Users should be able to search a fixed amount for now. lets say 15 stocks for now. you can choose them.

2. **Leaderboard privacy:** Should the leaderboard show real usernames or anonymized handles?
   real usernames

3. **Portfolio snapshot frequency:** Daily snapshots (via `node-cron` at midnight) or on every login?
   whatever is most logical

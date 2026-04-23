# Learning Hub — Design & Implementation Plan

> **Status:** PLANNING ONLY — No code written  
> **Platform:** FirstFund Paper-Trading Sandbox (Electron + React + Express + Prisma/PostgreSQL)  
> **Skills applied:** brainstorming · senior-architect · concise-planning

---

## 1. Understanding Summary

- **What:** A progressive, interactive Learning Hub that teaches stock market fundamentals directly inside the FirstFund sandbox app.
- **Why:** Novice users need guided education to use the trading sandbox effectively; learning-by-doing converts passive readers into confident (paper) traders.
- **Who:** First-time investors with zero stock-market experience.
- **Key constraints:** Must integrate with the existing React/Express/Prisma stack and the Massive.com API (5 req/min rate limit). No real money involved — sandbox only.
- **Non-goals:** Paid courses, live instructor support, social/comment features, mobile-native app (Electron desktop only for now).

---

## 2. Curriculum Architecture (What to Teach)

Content is split into **4 progressive modules**. Each module contains **3–5 lessons**. A lesson is the atomic unit of content (article + optional visual + quiz).

### Module 1 — Stock Market 101 (The Absolute Basics)

| # | Lesson | Key Concepts |
|---|--------|-------------|
| 1.1 | What Is a Stock? | Shares, ownership, IPOs, why companies go public |
| 1.2 | The Stock Market Explained | NYSE / NASDAQ, how buyers & sellers meet, market hours |
| 1.3 | Understanding the Quote | Ticker symbols, Bid vs Ask, Volume, Spread |
| 1.4 | Order Types ⭐ | Market Order · Limit Order · Stop-Loss — *critical for sandbox usage* |

### Module 2 — Evaluating a Company (Fundamental Analysis)

| # | Lesson | Key Concepts |
|---|--------|-------------|
| 2.1 | Market Capitalization | Small-cap vs Mid-cap vs Large-cap, risk profiles |
| 2.2 | Key Ratios Made Simple | P/E Ratio, EPS, Dividend Yield |
| 2.3 | Earnings Reports | What they are, why prices spike or crash around them |
| 2.4 | ETFs vs Individual Stocks | Diversification benefit, S&P 500 trackers as safer starting point |

### Module 3 — Reading the Charts (Technical Analysis)

| # | Lesson | Key Concepts |
|---|--------|-------------|
| 3.1 | Candlestick Charts | Open, High, Low, Close — green vs red candles |
| 3.2 | Trends & Support/Resistance | Uptrend, downtrend, floor (support), ceiling (resistance) |
| 3.3 | Moving Averages | SMA vs EMA, golden cross / death cross (simplified) |
| 3.4 | RSI (Relative Strength Index) | Overbought (> 70) vs Oversold (< 30) |

### Module 4 — Risk Management & Psychology ⭐ (Most Important)

| # | Lesson | Key Concepts |
|---|--------|-------------|
| 4.1 | Diversification | "Don't put all eggs in one basket" — ties to portfolio metrics |
| 4.2 | Position Sizing | Never risk > 1–2% of total account on one trade |
| 4.3 | Managing Emotions | FOMO, panic selling, confirmation bias |
| 4.4 | Creating a Trading Plan | Entry / exit rules, profit targets, stop-loss discipline |

> **Progression rule:** Modules unlock linearly. Module 2 requires passing Module 1's quizzes, etc. This prevents information overload.

---

## 3. Interactive Features (How to Teach)

### Feature 1 — "Learn & Earn" Quizzes

| Aspect | Detail |
|--------|--------|
| **Trigger** | After reading a lesson |
| **Format** | 3 multiple-choice questions per lesson |
| **Pass threshold** | ≥ 2/3 correct |
| **Reward** | +$500 virtual sandbox cash on first pass (injected into `Portfolio.cash`) |
| **Retry** | Unlimited, but reward only on first completion |
| **Backend tie-in** | `POST /api/learn/quiz/:lessonId/submit` → validates answers → if first pass, bumps `Portfolio.cash` |

### Feature 2 — Sandbox Missions (Guided Tours)

Hands-on tasks that teach by making the user *do* the action inside the existing app:

| Mission | Action | Ties to |
|---------|--------|---------|
| Mission 1 | "Add 3 technology stocks to your Watchlist" | `POST /api/watchlists` |
| Mission 2 | "Set a price alert for AAPL" | `POST /api/alerts` |
| Mission 3 | "Buy $100 of an ETF using a Market Order" | `POST /api/portfolio/trade` |
| Mission 4 | "Set a Stop-Loss for one of your current positions" | `POST /api/alerts` (direction: BELOW) |

Each completed mission marks a `UserMission` record as complete. Progress shown on the Learn dashboard.

### Feature 3 — In-App Glossary Tooltips

- Wrap jargon words (`Market Cap`, `P/E Ratio`, `Volume`, `EPS`, `RSI`, etc.) with a `<GlossaryTerm>` component.
- On **hover/tap** → small tooltip with a 1-sentence definition.
- Applied across `StockDetailPage`, `TradePage`, `PortfolioPage`, and the Learning Hub itself.
- Data source: a static JSON/TS map of ~40–60 terms. No API needed.

### Feature 4 — Post-Trade Journal

- When a user **sells** a position, show a modal: *"Why did you sell?"*
- Options: `Hit profit target` · `Hit stop-loss` · `Panicked` · `Found better opportunity` · `Other`
- Stored on the `Trade` record (new `sellReason` field).
- In the Learning Hub, a **Journal** tab lets users review past sells and see if "Panic" sells cost them or saved them money — teaching trading psychology through their *own* data.

### Feature 5 — "Why Is This Moving?" Contextual Insights

- If a portfolio stock drops ≥ 5% in a day, show an **educational alert** on the Dashboard:
  > "Volatility is normal! Stocks move based on news, earnings, or broader market trends. [Learn about market volatility →]"
- Links directly to the relevant lesson (Module 4.3 — Managing Emotions).
- Light implementation: compare previous close to current price during the portfolio data fetch; conditionally render an `<EducationalAlert>` component.

---

## 4. Architectural Design

### 4.1 Data Model (Prisma Schema Additions)

```
┌──────────────┐       ┌───────────────────┐
│    User       │──1:N──│  UserLessonProgress│
│  (existing)   │       │  userId, lessonId  │
└──────────────┘       │  completed, passed │
       │               │  quizScore, reward │
       │               │  completedAt       │
       │               └───────────────────┘
       │
       ├──1:N──┌───────────────────┐
       │       │   UserMission      │
       │       │   userId, missionId│
       │       │   completed        │
       │       │   completedAt      │
       │       └───────────────────┘
       │
       └──1:N──┌───────────────────┐
               │   Trade (modified) │
               │   + sellReason?    │
               └───────────────────┘
```

**New models:**

```prisma
model UserLessonProgress {
  id          Int       @id @default(autoincrement())
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonId    String    // e.g. "1.1", "2.3", "4.4"
  completed   Boolean   @default(false)
  passed      Boolean   @default(false)  // quiz passed
  quizScore   Int?      // e.g. 2 out of 3
  rewardGiven Boolean   @default(false)  // prevent double-reward
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @default(now()) @updatedAt

  @@unique([userId, lessonId])
  @@index([userId])
}

model UserMission {
  id          Int       @id @default(autoincrement())
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  missionId   String    // e.g. "mission_watchlist_3", "mission_alert_aapl"
  completed   Boolean   @default(false)
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @default(now()) @updatedAt

  @@unique([userId, missionId])
  @@index([userId])
}
```

**Modified model — `Trade`:**

```prisma
model Trade {
  // ... existing fields ...
  sellReason  String?   // "profit_target", "stop_loss", "panic", "better_opportunity", "other"
}
```

### 4.2 Backend API Routes

New route file: `backend/src/routes/learn.ts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/learn/progress` | Get all lesson progress + mission status for current user |
| `POST` | `/api/learn/lesson/:lessonId/complete` | Mark lesson as read |
| `POST` | `/api/learn/quiz/:lessonId/submit` | Submit quiz answers → grade → reward |
| `GET` | `/api/learn/missions` | Get mission status for current user |
| `POST` | `/api/learn/mission/:missionId/complete` | Mark mission done (called by frontend after verifying action) |
| `GET` | `/api/learn/journal` | Get trade journal (sells with reasons + P&L) |

New controller: `backend/src/controllers/learnController.ts`  
New service: `backend/src/services/learnService.ts`

### 4.3 Frontend Components & Pages

**New route:** `/learn` (added to `App.jsx`)

**New pages:**

| File | Purpose |
|------|---------|
| `LearnPage.jsx` | Main hub — module grid with lock/unlock icons, progress ring, mission tracker |
| `LessonPage.jsx` | Individual lesson view — article content, embedded visuals, quiz at bottom |
| `JournalPage.jsx` | Trade journal — table of past sells with reason tags + P&L analysis |

**New components:**

| Component | Purpose |
|-----------|---------|
| `ModuleCard.jsx` | Card showing module title, progress %, lock/unlock state |
| `LessonContent.jsx` | Markdown-rendered lesson body with `<GlossaryTerm>` wrappers |
| `QuizSection.jsx` | 3-question quiz with submit, score display, reward animation |
| `MissionTracker.jsx` | Checklist widget — check marks for completed missions |
| `GlossaryTerm.jsx` | Inline term with hover tooltip |
| `EducationalAlert.jsx` | Contextual insight banner for volatility alerts |
| `SellReasonModal.jsx` | Post-sell modal asking "why did you sell?" |
| `ProgressRing.jsx` | Circular progress indicator for module completion |

### 4.4 Content Storage Strategy

**Decision:** Store lesson content as **static JSON/MDX files** bundled in the frontend, **not** in the database.

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **A. Static JSON in frontend** | Fast, no API call, easy to edit, works offline | Can't update without redeploy | ✅ **Chosen** |
| B. Database-stored content | Dynamic updates | Over-engineering for ~16 lessons, adds backend complexity | ❌ |
| C. CMS (headless) | Non-dev editable | Massive overkill for a university project | ❌ |

Lesson data lives in `frontend/src/data/lessons/` as structured JSON:
```
frontend/src/data/
├── lessons/
│   ├── module1.json    // { id, title, lessons: [{ id, title, content (markdown), quiz }] }
│   ├── module2.json
│   ├── module3.json
│   └── module4.json
├── missions.json       // [{ id, title, description, verifyAction }]
└── glossary.json       // { "Market Cap": "The total...", "P/E Ratio": "..." }
```

### 4.5 Architecture Diagram

```
                        ┌─────────────────────────────────────┐
                        │         Frontend (React)             │
                        │                                     │
                        │  /learn ─── LearnPage               │
                        │  /learn/:id ─ LessonPage            │
                        │  /learn/journal ─ JournalPage       │
                        │                                     │
                        │  Components:                        │
                        │  GlossaryTerm │ SellReasonModal     │
                        │  EducationalAlert │ MissionTracker  │
                        │  ModuleCard │ QuizSection           │
                        │  ProgressRing │ LessonContent       │
                        │                                     │
                        │  Static Data:                       │
                        │  /data/lessons/*.json               │
                        │  /data/glossary.json                │
                        │  /data/missions.json                │
                        └──────────────┬──────────────────────┘
                                       │ HTTP (api client)
                        ┌──────────────▼──────────────────────┐
                        │       Backend (Express)              │
                        │                                     │
                        │  routes/learn.ts                    │
                        │  controllers/learnController.ts     │
                        │  services/learnService.ts           │
                        └──────────────┬──────────────────────┘
                                       │ Prisma ORM
                        ┌──────────────▼──────────────────────┐
                        │       PostgreSQL                     │
                        │                                     │
                        │  UserLessonProgress (NEW)           │
                        │  UserMission (NEW)                  │
                        │  Trade (+ sellReason field)         │
                        │  Portfolio (cash injection target)  │
                        └─────────────────────────────────────┘
```

---

## 5. Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|----------|------------------------|-----------|
| D1 | Static JSON for lesson content | DB-stored, headless CMS | Only ~16 lessons; no need for runtime content management. Keeps complexity low. |
| D2 | Linear module unlock progression | All-open, prerequisite graph | Simplest UX for beginners; prevents information overload. |
| D3 | $500 virtual reward per quiz pass | No reward, XP points, badges | Directly ties to the sandbox's core mechanic (trading cash). Most tangible incentive. |
| D4 | Quiz: 3 MCQ, pass ≥ 2/3 | Free-text, graded scale | MCQ is easiest to auto-grade; 2/3 threshold is forgiving but meaningful. |
| D5 | Glossary as static JSON map | DB table, API-fetched | ~40–60 terms is tiny; no need for a database round-trip. |
| D6 | `sellReason` on existing Trade model | Separate Journal model | One nullable field is simpler than an entire new table. |
| D7 | Separate `/learn` route family | Embed in Dashboard | Learning Hub is a major feature deserving its own navigation entry and URL space. |

---

## 6. Assumptions

1. The user's current `Portfolio.cash` field can be incremented server-side (no separate "virtual currency" table needed).
2. There are no existing `/api/learn` routes — this is a greenfield addition.
3. The frontend uses React Router v6 with the existing `DashboardLayout` shell.
4. CSS Modules (`.module.css`) pattern continues — no Tailwind.
5. Lessons are English-only for now — no i18n requirement.
6. Mission verification is done client-side (e.g., count watchlist items) and submitted to the backend; full server-side verification is a stretch goal.

---

## 7. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Content writing takes significant time (~16 articles) | Medium | Start with concise bullet-point lessons; flesh out later. Use an LLM to draft initial content. |
| Quiz answer data visible in client-side JSON | Low | Acceptable for a sandbox/educational context — not a real exam. |
| Mission verification is gameable (client-side) | Low | Acceptable for MVP. Server-side verification can be added later. |
| Glossary tooltips create visual clutter | Low | Use dotted underline (subtle). Only apply to first occurrence per page. |

---

## 8. Implementation Checklist (Concise Plan)

### Approach
Build a Learning Hub as a new `/learn` route family with static lesson content, quiz grading, virtual cash rewards, guided missions, and a trade journal — all integrated into the existing React + Express + Prisma stack.

### Scope

- **In:**
  - Prisma schema (2 new models, 1 field addition)
  - Backend API routes, controller, service for learn/quiz/mission/journal
  - Frontend: LearnPage, LessonPage, JournalPage + 8 new components
  - Static lesson/quiz/glossary JSON data files
  - Navigation sidebar entry for "Learn"
  - SellReasonModal on trade sell flow
  - EducationalAlert on Dashboard

- **Out:**
  - Actual lesson copywriting (placeholder content for now)
  - Video content or embedded media
  - i18n / multi-language
  - Server-side mission verification
  - Gamification beyond cash rewards (no badges, leaderboards for learning)

### Action Items

- [ ] Add `UserLessonProgress` and `UserMission` models to `schema.prisma`; add `sellReason` to `Trade`
- [ ] Run `prisma migrate dev` to generate migration
- [ ] Create `backend/src/routes/learn.ts` with 6 endpoints
- [ ] Create `backend/src/controllers/learnController.ts` and `backend/src/services/learnService.ts`
- [ ] Create `frontend/src/data/lessons/` JSON structure with placeholder content for all 4 modules (16 lessons)
- [ ] Create `frontend/src/data/glossary.json` and `frontend/src/data/missions.json`
- [ ] Build `LearnPage.jsx` — module grid with progress rings, lock/unlock, mission tracker sidebar
- [ ] Build `LessonPage.jsx` — lesson content renderer + quiz section with reward animation
- [ ] Build `JournalPage.jsx` — filterable trade journal with sell-reason tags
- [ ] Build shared components: `GlossaryTerm`, `ModuleCard`, `QuizSection`, `MissionTracker`, `ProgressRing`, `EducationalAlert`, `SellReasonModal`
- [ ] Add `/learn`, `/learn/:lessonId`, `/learn/journal` routes to `App.jsx`
- [ ] Add "Learn" entry to `DashboardLayout.jsx` sidebar navigation
- [ ] Integrate `SellReasonModal` into `TradePage.jsx` sell flow
- [ ] Integrate `EducationalAlert` into `DashboardPage.jsx`
- [ ] Apply `GlossaryTerm` wrappers to `StockDetailPage`, `TradePage`, and `PortfolioPage`
- [ ] Create `LearnPage.module.css`, `LessonPage.module.css`, `JournalPage.module.css` + component CSS modules
- [ ] Verify: manual end-to-end test — complete a lesson → pass quiz → confirm cash reward → complete a mission → sell a stock with reason → view journal

### Validation
- [ ] Verify all 6 API endpoints return correct data via browser dev tools or Postman
- [ ] Verify quiz pass triggers +$500 cash boost (check Portfolio value before/after)
- [ ] Verify module locking: Module 2 is locked until Module 1 quizzes pass
- [ ] Verify glossary tooltips render correctly on `StockDetailPage`
- [ ] Verify sell reason modal appears after a sell trade and data persists

---

## 9. Open Questions — ✅ RESOLVED

| # | Question | Decision |
|---|----------|----------|
| Q1 | Reward scaling? | **Flat $500 per lesson** across all modules |
| Q2 | Navigation placement? | **Sidebar nav** — sits alongside Dashboard, Stocks, Portfolio, etc. as a first-class section |
| Q3 | Content approach? | **Draft actual educational text** for all 16 lessons (see `learn_content.md`) |

# Developer Documentation

This document tracks key functions, scripts, and configurations that define the **First Fund** architecture.

## Architecture Overview

First Fund follows a **Dual-Service Monorepo** architecture:

- **Frontend**: Electron-wrapped React client with centralized page routing.
- **Backend**: Express.js REST API with Prisma ORM and JWT security.

---

## Backend Services (`/backend`)

### Server Entry (`src/server.ts`)

- **Middlewares**: `cors`, `morgan` (logging), `express.json`, and `generalLimiter` (rate limiting).
- **Graceful Shutdown**: Handles `SIGINT`/`SIGTERM` to disconnect Prisma and close the server cleanly.
- **Cron Jobs**: Automated background services (e.g., portfolio snapshots, alert checking) initialized at startup.

### Core Routers

- **Auth (`/api/auth`)**: Handles `User` registration and login using **JWT** for session management.
- **Portfolio (`/api/portfolio`)**: Manages `Position` CRUD, cash balances, and trade history.
- **Learn (`/api/learn`)**: Tracks `UserLessonProgress` and handles "Learn & Earn" reward logic.
- **Stocks (`/api/stocks`)**: Fetches stock data, historical prices, and search results.
- **Watchlists (`/api/watchlists`)**: User-specific symbol collections.
- **Budget (`/api/budget`)**: Goal-based `Allocation` management and visualization data.
- **Alerts (`/api/alerts`)**: Price-trigger logic for stock notifications.

### Data Layer (`/prisma/schema.prisma`)

The PostgreSQL schema is the single source of truth for the data model:

- **`User` / `UserSettings`**: Core identity and aesthetic preferences (theme, chart style).
- **`Portfolio` / `Position` / `Trade`**: Trading engine models supporting fractional shares.
- **`UserLessonProgress` / `UserMission`**: Gamification and educational tracking.
- **`PortfolioSnapshot`**: Daily value tracking for historical performance charts.
- **`Budget` / `Allocation`**: Categorized financial planning data.

---

## Frontend Architecture (`/frontend`)

### Structured Pages (`src/pages/`)

Instead of a single-file monster, First Fund uses a modular page system:

- `DashboardPage`: Unified view of total portfolio, active watchlists, and market news.
- `PortfolioPage`: Deep dive into `Positions` with performance analytics.
- `LearnPage` & `LessonPage`: The educational engine with interactive quizzes.
- `TradePage`: Real-time search and paper trading interface.
- `BudgetPage`: Category-based allocation tracking with donut charts.

### Theming System

- **Implementation**: Premium Glassmorphism UI powered by Vanilla CSS and CSS Variables.
- **Variables**: Defined in `:root` (Light) and `[data-theme='dark']` (Dark/Premium).
- **Glassmorphism**: `.glass` utility class applying `backdrop-filter: blur(12px)` and semi-transparent backgrounds.
- **Visuals**: Uses `Outfit` (Headings) and `Inter` (Body) via Google Fonts.

### State & Context (`src/context/`)

- Handles global state such as the current active user, theme selection, and real-time alerts.

---

## Development Scripts

### `npm run dev` (Root)

- uses `concurrently` to start the **Vite** dev server and the **Electron** main process.
- uses `wait-on` to ensure Electron only launches after the Vite server is ready on `tcp:5173`.

### `npm run db:seed`

- Refactored to import historical stock data from `/Data` CSVs into the `Stock` table for reference.

---

## Environment Variables

- `DATABASE_URL`: Connection string for the PostgreSQL instance.
- `JWT_SECRET`: Used for signing and verifying authentication tokens.
- `ELECTRON_START_URL`: (Dev) `http://localhost:5173`.
- `PORT`: Backend server port (defaults to `3001`).

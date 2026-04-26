# Beginner Guide

## Beginner Quick Start

If you are new to this project, follow only these steps:

1. Install Node.js (LTS) and PostgreSQL.
2. Open terminal in the project root.
3. Run:

```bash
npm install
npx prisma migrate dev
npm run dev
```

What this does:

- installs project packages
- prepares the database tables
- starts backend, frontend, and desktop app together

If the app does not start, check [Documentation/IssueLog.md](./Documentation/IssueLog.md) first.

## Backend

Think of backend as the "engine" of the app.

It handles:

- login and user accounts
- saving and reading database data
- portfolio, alerts, learning, and budget logic

Quick way to run backend from project root:

```bash
npm run backend:dev
```

Most common setup issues:

- missing `DATABASE_URL` in `backend/.env`
- database server not running
- migrations not applied (`npx prisma migrate dev`)

## Frontend

Think of frontend as the "screen" part of the app.

It is where users:

- view dashboard and portfolio
- search stocks and place practice trades
- use watchlists, alerts, budget, and learning pages

Run only frontend (from `frontend/` folder):

```bash
npm install
npm run dev
```

If data does not load, backend may not be running yet.

## Simple Summary (For Non-Technical Readers)

This project has 3 parts:

1. Frontend: what you see and click
2. Backend: server logic and API
3. Database: where app data is stored

Normal startup flow:

1. Frontend asks backend for data.
2. Backend reads or writes data in PostgreSQL.
3. Backend returns the result to frontend.
4. Frontend updates the screen.

Main API groups in plain words:

- auth: login and register
- portfolio: positions, trades, and account value
- stocks: prices, details, and charts
- watchlists: saved stock lists
- alerts: price triggers
- learn: lessons, quizzes, missions
- budget: category targets and allocation status
- settings: user preferences and leaderboard

## Quick Troubleshooting Checklist

If something is not working, check these in order:

1. Is PostgreSQL running?
2. Does `backend/.env` contain `DATABASE_URL` and `JWT_SECRET`?
3. Did you run migrations?

```bash
npx prisma migrate dev
```

4. Are both services running?

```bash
npm run backend:dev
npm run frontend:dev
```

5. Is Vite port blocked (`5173`)?

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

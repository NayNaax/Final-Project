# First Fund

A modern, cross-platform financial portfolio tracker and educational platform built with **Electron**, **React**, and **Node.js**.

## Overview

First Fund is a desktop application designed to empower users with financial literacy and investment tracking tools. It combines a professional portfolio management suite with a "Learn & Earn" education system, featuring a sleek, responsive UI with advanced theming.

### Key Features

- **Advanced Dashboard**: Real-time overview of portfolio performance, market indices, and personalized watchlists.
- **Portfolio Tracker**: Comprehensive tracking of assets with detailed performance metrics and visual analytics.
- **Stock Explorer & Trade Sandbox**: Search stocks, view detailed charts, and simulate trades in a risk-free environment.
- **Learning Hub**: Interactive educational modules covering financial fundamentals with quiz-based progression.
- **Financial Journal & News**: Stay updated with integrated market news and document your investment rationale in a built-in journal.
- **Budgeting & Alerts**: Manage personal finances with budget tracking and set custom price alerts.
- **Gamified Experience**: Earn rewards through the Learning Hub and compete on the global leaderboard.
- **Premium Theming**: Supports multiple themes including "Premium Dark" and "Very Light Blue" for personalized aesthetics.

## Project Structure

- `frontend/`: React application with Vite, Electron, and CSS Modules.
- `backend/`: Node.js & Express server with Prisma ORM and TypeScript.
- `prisma/`: Database schema and migration files.
- `Documentation/`: Detailed technical documentation and issue logs.

## Tech Stack

- **Runtime**: Electron (v40+)
- **Frontend**: React (v19) + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Prisma ORM
- **Styles**: Vanilla CSS + CSS Modules
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm (v10+)
- PostgreSQL database

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/NayNaax/Final-Project.git
    cd Final-Project
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration

Ensure you have a `.env` file in the root and in the `backend/` directory with the necessary environment variables (see `.env.example`).

### Running the App

Start the development environment:

```bash
npm run dev
```

## Documentation

- [Functions](./Documentation/Functions.md) - Technical implementation details.
- [Issue Log](./Documentation/IssueLog.md) - Record of addressed bugs and fixes.

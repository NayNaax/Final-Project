# First Fund

A modern, cross-platform financial portfolio tracker built with **Electron**, **React**, and **Node.js**.

## Overview

First Fund is a desktop application designed to help users track their investments, test strategies in a sandbox environment, and learn financial concepts. It features a modern, responsive UI with light/dark mode support.

### Key Features

- **Dashboard**: Overview of portfolio value, active trades, and watchlist.
- **Tracker**: Comprehensive asset tracking (Coming Soon).
- **Sandbox**: Risk-free strategy testing (Coming Soon).
- **Learning Hub**: Educational resources (Coming Soon).
- **Customizable Theme**: Includes "Premium Dark" and "Very Light Blue" themes with a toggle.

## Tech Stack

- **Runtime**: Electron (v40+)
- **Frontend**: React (v19) + Vite
- **Language**: JavaScript (ES6+)
- **Styles**: Vanilla CSS with CSS Variables (Theming)

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm (v10+)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/NayNaax/Final-Project.git
    cd Final-Project
    ```
2.  Install dependencies:
    ```bash
    npm install
    # Wait for both root and frontend dependencies to install
    ```

### Running the App

Start the development server (runs React + Electron concurrently):

```bash
npm run dev
```

### Database Setup

The project uses **Prisma** for database management and a custom script for seeding historical stock data.

1.  **Configure Environment**: Ensure your `.env` file has a valid `DATABASE_URL`.
2.  **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```
3.  **Seed Data**:
    Historical CSV data from the `Data/` folder can be imported using:
    ```bash
    npm run db:seed
    ```

## Documentation

- [Functions](./Documentation/Functions.md) - Technical implementation details and functions.
- [Issue Log](./Documentation/IssueLog.md) - Record of bugs and fixes.

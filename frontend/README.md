# First Fund - Frontend

This is the frontend component of the First Fund application, built with **React**, **Vite**, and **Electron**.

## Architecture & Tech Stack

- **Framework**: React 19
- **Bundler**: Vite
- **Styling**: Vanilla CSS with **CSS Modules** for component-scoping.
- **Icons**: Lucide React
- **State Management**: React Context & Hooks
- **Desktop Runtime**: Electron

## Features

- **Responsive Navigation**: Sidebar-based navigation with dynamic active states.
- **Dynamic Theming**: Integrated support for "Premium Dark" and "Very Light Blue" themes using CSS variables.
- **Interactive Charts**: Visualizations for portfolio performance and stock trends.
- **Modular Components**: Reusable UI components including Modals, Tabs, Cards, and Tables.

## Key Pages

- `DashboardPage`: High-level overview of account status.
- `PortfolioPage`: Detailed asset breakdown and analytics.
- `LearnPage` & `LessonPage`: The educational core of the app.
- `TradePage`: Real-time stock search and simulation.
- `BudgetPage`: Personal finance management.
- `WatchlistsPage`: Personalized stock tracking.

## Getting Started

### Development

The frontend is typically started from the root directory during main development:

```bash
# From root
npm run dev
```

To run only the Vite development server (browser-only):

```bash
# From /frontend
npm run dev
```

### Build

To package the frontend for production:

```bash
npm run build
```

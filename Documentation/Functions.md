# Developer Documentation

This document tracks key functions, scripts, and configurations created during the development of First Fund.

## Important Functions

### Electron Main Process (`main.js`)

#### `createWindow()`

- **Purpose**: Creates the main application window for the Electron app.
- **Details**:
    - Initializes a `BrowserWindow` with dimensions 800x600.
    - Configures `webPreferences` to enable node integration (temporarily for dev).
    - **Environment Handling**: Checks `process.env.ELECTRON_START_URL`.
        - If present (Dev mode), loads the URL (e.g., `http://localhost:5173`).
        - If absent (Prod mode), loads the local `index.html` file.

## Scripts & Configuration

### `npm run dev`

- **Purpose**: Launches the full development environment.
- **Tools**: Uses `concurrently` to run the frontend and backend processes in parallel.
- **Workflow**:
    1.  Starts the React Frontend (Vite) on port `5173`.
    2.  Uses `wait-on` to pause the Electron launch until `tcp:5173` is active.
    3.  Starts Electron once the port is ready.

## Frontend Architecture

### Structure

- **Frontend**: React (v19) + Vite
- **Dependencies**: `lucide-react` (icons), `recharts` (financial charting)
- **Entry Point**: `frontend/src/main.jsx`
- **Main Component**: `App.jsx` handling routing (tab switching), layout, and the main dashboard cards/charts.
- **Styling**: `frontend/src/index.css` using CSS Variables for theming and Glassmorphism effects.

### Component Logic (`App.jsx`)

- **State Management**:
    - `activeTab` (String): Controls which view component is currently rendered (Overview, Tracker, Sandbox, Learning). Using conditional rendering via a `switch` statement.
    - `theme` (String): Tracks specifically 'light' or 'dark'. Defaults to 'dark' for a premium feel.
- **Key Modules Rendered**:
    - **Overview Tab**: Includes a Dashboard Grid for key metrics (Portfolio Value, Return), a `ResponsiveContainer` wrapping a `recharts` `AreaChart` for 7-day performance, and a Recent Activity transaction list.
    - **Sidebar Navigation**: Utilizes `lucide-react` icons mapped to tabs.
- **Effects**:
    - `useEffect` monitors the `theme` state and updates the `data-theme` attribute on `document.documentElement`, triggering the CSS variable switch.

### Theming System

- **Implementation**: Premium Glassmorphism UI with CSS Variables defined in `:root` (Light) and `[data-theme='dark']` (Dark).
- **Styling Features**:
    - **Glassmorphism**: `.glass` utility class applying `backdrop-filter: blur(12px)` and semi-transparent backgrounds to sidebar and cards.
    - **Animations**: Keyframes for `fadeIn` and `slideUp` for smooth page loading, and hover transition scales (`transform: translateY`).
- **Variables**:
    - `--bg-primary`, `--bg-secondary`, `--bg-tertiary` for background depths.
    - `--text-primary`, `--text-secondary` for typography (Using `Outfit` for headings, `Inter` for body).
    - `--accent-primary` and glowing shadows for brand color highlighting.
- **Toggle Logic**: `App.jsx` manages `theme` state and updates `document.documentElement` attribute.

### Vite Configuration (`frontend/vite.config.js`)

- **Strict Port**: Configured with `server.strictPort: true` and `port: 5173`. This prevents Vite from silently switching ports if 5173 is occupied, which would break the Electron connection.

## Environment Variables

### `ELECTRON_START_URL`

- **Usage**: Used in `main.js` to determine the URL to load in the main window.
- **Default**: `http://localhost:5173` if not specified.
- **Production**: In production builds, this variable usually won't be set, causing the app to fall back to loading the local `index.html`.

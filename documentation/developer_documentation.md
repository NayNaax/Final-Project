# Developer Documentation

This document tracks key functions, scripts, and configurations created during the development of First Fund Finance.

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

### Vite Configuration (`frontend/vite.config.js`)

- **Strict Port**: Configured with `server.strictPort: true` and `port: 5173`. This prevents Vite from silently switching ports if 5173 is occupied, which would break the Electron connection.

## Environment Variables

### `ELECTRON_START_URL`

- **Usage**: Used in `main.js` to determine the URL to load in the main window.
- **Default**: `http://localhost:5173` if not specified.
- **Production**: In production builds, this variable usually won't be set, causing the app to fall back to loading the local `index.html`.

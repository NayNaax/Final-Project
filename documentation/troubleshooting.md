# Troubleshooting Log

This document records issues encountered during development and how they were resolved.

## Issue 1: Invalid Git Branch Name

- **Problem**: Tried to create a branch named `"Frontend UI"`. Git errored because branch names cannot contain spaces.
- **Fix**: Created a branch named `frontend-ui` instead.

## Issue 2: Port 5173 In Use

- **Problem**: `npm run dev` (Vite) failed to start because port 5173 was already in use by a previous orphaned process.
- **Fix**:
    1.  Used `netstat -ano | findstr :5173` to find the Process ID (PID).
    2.  Used `taskkill /PID <PID> /F` to force-kill the process.
    3.  Updated `vite.config.js` to use `strictPort: true` to avoid silent port switching, ensuring Electron always connects to the correct port.
    4.  Observed persistent `CLOSE_WAIT` states (e.g., PID 28788) requiring multiple `taskkill` commands.

## Issue 3: Electron & React Coordination

- **Problem**: Electron would launch before the React dev server was ready, or load the wrong URL.
- **Fix**:
    1.  Installed `concurrently` to run both commands.
    2.  Installed `wait-on` to make Electron wait until `tcp:5173` is available.
    3.  Configured `main.js` to load `http://localhost:5173` when in development mode (checked via `process.env`).

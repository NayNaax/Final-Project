# Troubleshooting Log

This document records issues encountered during development and how they were resolved.

## Issue 1: Invalid Git Branch Name

- **Problem**: Tried to create a branch named `"Frontend UI"`. Git errored because branch names cannot contain spaces.
- **Fix**: Created a branch named `frontend-ui` instead.

## Issue 2: Port 5173 In Use (Ghost Processes)

- **Problem**: `npm run dev` (Vite) failed to start because port 5173 was already in use by a previous orphaned process.
- **Fix**:
    1.  Used `netstat -ano | findstr :5173` to find the Process ID (PID).
    2.  Used `taskkill /PID <PID> /F` to force-kill the process.
    3.  **Prevention**: Updated `vite.config.js` to use `strictPort: true`. This prevents Vite from silently switching to port 5174, which would leave Electron connecting to the wrong port (or a blank screen).

## Issue 3: Electron & React Coordination (Race Condition)

- **Problem**: Electron would launch before the React dev server was ready, resulting in a white screen or connection refused error.
- **Fix**:
    1.  Installed `concurrently` to run both commands.
    2.  Installed `wait-on` to make Electron wait until `tcp:5173` is available.

## Issue 4: Hardcoded Development URL

- **Problem**: `main.js` had `http://localhost:5173` hardcoded, making it fragile for production or custom environments.
- **Fix**: Updated `main.js` to look for `process.env.ELECTRON_START_URL` first, allowing flexibility in how the start URL is defined.

# Project Issues

This file tracks active development issues to be resolved.

## Issue #1: Startup Race Condition

**Status**: Closed
**Resolution**: Fixed by adding `wait-on tcp:5173` to `package.json` scripts.
**Description**: When running `npm run dev`, Electron often launches before the React server is ready. This results in a blank white screen or a "Connection Refused" error.
**Reproduction**: Run `npm run dev` and observe the window opening immediately.

## Issue #2: Port Conflict Handling

**Status**: Closed
**Resolution**: Fixed by enforcing `strictPort: true` in `vite.config.js`.
**Description**: The frontend fails to connect if port 5173 is already in use. Vite switches to a random port (e.g., 5174), but Electron is hardcoded to look for 5173, causing it to load nothing.
**Reproduction**: Start a process on port 5173, then run `npm run dev`.

## Issue #3: Hardcoded Development URL

**Status**: Closed
**Resolution**: Fixed by enforcing `strictPort: true` in `vite.config.js`.
**Reproduction**: Inspect `main.js`.

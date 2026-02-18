# Project Issues

This file tracks active development issues to be resolved.

## Issue #1: Startup Race Condition

**Status**: Open
**Description**: When running `npm run dev`, Electron often launches before the React server is ready. This results in a blank white screen or a "Connection Refused" error.
**Reproduction**: Run `npm run dev` and observe the window opening immediately.

## Issue #2: Port Conflict Handling

**Status**: Open
**Description**: The frontend fails to connect if port 5173 is already in use. Vite switches to a random port (e.g., 5174), but Electron is hardcoded to look for 5173, causing it to load nothing.
**Reproduction**: Start a process on port 5173, then run `npm run dev`.

## Issue #3: Hardcoded Development URL

**Status**: Open
**Description**: `main.js` hardcodes `http://localhost:5173`. This is fragile and doesn't account for production builds or environment configuration.
**Reproduction**: Inspect `main.js`.

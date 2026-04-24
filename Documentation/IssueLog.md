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

## Issue 5: Missing Theme Toggle Button

- **Problem**: The theme toggle button defined in CSS was not appearing in the UI.
- **Cause**: The compiled code or HMR update didn't properly reflect the new JSX structure in `App.jsx`.
- **Fix**: Manually updated `App.jsx` to correctly include the `<button>` element and the associated `toggleTheme` logic.

## Issue 6: Blank Portfolio Page (Runtime Error)

- **Problem**: The Portfolio page failed to render, showing a blank screen.
- **Cause**: A missing import for `PieChart` from `lucide-react`. The component was trying to use `PieChart` icons without them being defined.
- **Fix**: Imported `PieChart` as `PieChartIcon` from `lucide-react` in `PortfolioPage.jsx`.

## Issue 7: Schema Out of Sync & Missing Routes

- **Problem**: Learning Hub features (UserMission, UserLessonProgress) were causing database errors.
- **Cause**: The `schema.prisma` was missing several fields/models, and the `learnRouter` was not mounted in `server.ts`.
- **Fix**:
    1.  Updated `schema.prisma` with comprehensive `UserLessonProgress`, `UserMission`, and `Budget` models.
    2.  Ran `npx prisma migrate dev` to sync the database.
    3.  Mounted `learnRouter`, `budgetRouter`, and others in the main `server.ts`.

## Issue 8: Learning Hub Quiz Validation

- **Problem**: Quizzes were sometimes passing even with incorrect answers, or navigation was breaking after completion.
- **Fix**:
    1.  Refined the quiz validation logic in `LessonPage.jsx` to strictly compare selected options.
    2.  Integrated "Next Lesson" navigation logic to ensure smooth progression through the curriculum.

## Issue 9: White Scroll Bars in Dark Mode

- **Problem**: The default browser scroll bars were white, clashing with the "Premium Dark" theme.
- **Fix**: Added global scroll bar styling in `index.css` using `::-webkit-scrollbar` pseudo-elements to match the project's background and accent colors.

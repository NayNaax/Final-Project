import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Always start in dark mode regardless of previously saved preference
const THEME_STORAGE_KEY = "theme";
window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

document.documentElement.setAttribute("data-theme", "dark");
// Sync Electron title bar on startup
window.electronAPI?.onThemeChanged("dark");

const app = <App />;

createRoot(document.getElementById("root")).render(import.meta.env.DEV ? app : <StrictMode>{app}</StrictMode>);

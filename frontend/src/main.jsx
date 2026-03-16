import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const THEME_STORAGE_KEY = "theme";
const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";

document.documentElement.setAttribute("data-theme", initialTheme);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>,
);

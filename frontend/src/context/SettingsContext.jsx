import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/apiClient";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        theme: "dark",
        currency: "USD",
        chartStyle: "line",
        leaderboardOptIn: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.get("/settings");
            if (data) {
                setSettings({
                    theme: data.theme || "dark",
                    currency: data.currency || "USD",
                    chartStyle: data.chartStyle || "line",
                    leaderboardOptIn: !!data.leaderboardOptIn,
                });
            }
        } catch (err) {
            console.error("Failed to load settings:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key, value) => {
        const prevSettings = { ...settings };
        setSettings((prev) => ({ ...prev, [key]: value }));

        if (key === "theme") {
            document.documentElement.setAttribute("data-theme", value);
            window.electronAPI?.onThemeChanged(value);
        }

        try {
            await api.patch("/settings", { [key]: value });
        } catch (err) {
            console.error(`Failed to update ${key}:`, err);
            setError(`Failed to update ${key}. Reverting change.`);
            setSettings(prevSettings);

            if (key === "theme") {
                document.documentElement.setAttribute("data-theme", prevSettings.theme);
            }

            setTimeout(() => setError(null), 3000);
            throw err;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, error, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within SettingsProvider");
    }
    return context;
}

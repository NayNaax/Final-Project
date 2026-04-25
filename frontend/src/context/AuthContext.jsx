/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/apiClient";

/**
 * AuthContext
 *
 * Provides authentication state and methods:
 * - user: Current authenticated user
 * - token: JWT token
 * - loading: Auth state check in progress
 * - login(email, password)
 * - register(email, password)
 * - logout()
 * - isAuthenticated: boolean
 */

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // On app start, try to restore previous login from local storage.
    useEffect(() => {
        const restoreSession = async () => {
            const storedToken = localStorage.getItem("authToken");
            if (storedToken) {
                api.setToken(storedToken);
                setToken(storedToken);

                // Always verify token with backend before trusting it.
                try {
                    const userData = await api.get("/auth/me");
                    setUser(userData);
                } catch {
                    // If verification fails, clear local auth state and force fresh login.
                    api.setToken(null);
                    setToken(null);
                    setUser(null);
                }
            }
            // Mark bootstrapping done so route guards can render correctly.
            setLoading(false);
        };

        restoreSession();
    }, []);

    const login = async (email, password) => {
        try {
            // Step 1: get token from credentials.
            const response = await api.post("/auth/login", { email, password });
            const newToken = response.token;

            // Step 2: persist token in both API client and React state.
            api.setToken(newToken);
            setToken(newToken);

            // Step 3: fetch profile for UI (name, settings, etc.).
            const userData = await api.get("/auth/me");
            setUser(userData);

            return userData;
        } catch {
            throw new Error("Login failed");
        }
    };

    const register = async (email, password, username) => {
        // Register returns token, so new users can continue without a separate login step.
        const response = await api.post("/auth/register", { email, password, username });
        const newToken = response.token;

        api.setToken(newToken);
        setToken(newToken);

        // Load fresh user profile right away for consistent app state.
        const userData = await api.get("/auth/me");
        setUser(userData);

        return userData;
    };

    const logout = () => {
        // Clear auth from all layers so protected routes lock immediately.
        api.setToken(null);
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

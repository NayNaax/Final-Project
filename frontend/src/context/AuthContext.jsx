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

    // Restore session from stored token on mount
    useEffect(() => {
        const restoreSession = async () => {
            const storedToken = localStorage.getItem("authToken");
            if (storedToken) {
                api.setToken(storedToken);
                setToken(storedToken);

                // Verify token is still valid by calling /auth/me
                try {
                    const userData = await api.get("/auth/me");
                    setUser(userData);
                } catch (err) {
                    // Token is invalid, clear it
                    api.setToken(null);
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        restoreSession();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post("/auth/login", { email, password });
            const newToken = response.token;

            api.setToken(newToken);
            setToken(newToken);

            // Fetch user data
            const userData = await api.get("/auth/me");
            setUser(userData);

            return userData;
        } catch (err) {
            throw err;
        }
    };

    const register = async (email, password) => {
        try {
            const response = await api.post("/auth/register", { email, password });
            const newToken = response.token;

            api.setToken(newToken);
            setToken(newToken);

            // Fetch user data
            const userData = await api.get("/auth/me");
            setUser(userData);

            return userData;
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
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

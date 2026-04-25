/**
 * API Client
 *
 * Authenticated fetch wrapper that:
 * - Auto-attaches JWT from localStorage
 * - Handles 401 responses → logout and redirect
 * - Parses JSON and throws on HTTP errors
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class ApiClient {
    // Turn backend error payloads into one simple message for UI banners.
    formatErrorMessage(error) {
        if (!error || typeof error !== "object") {
            return null;
        }

        if (Array.isArray(error.details) && error.details.length > 0) {
            const firstIssue = error.details[0];
            if (firstIssue?.message) {
                return firstIssue.message;
            }
        }

        return error.error || null;
    }

    /**
     * Get the stored JWT token
     */
    getToken() {
        return localStorage.getItem("authToken");
    }

    /**
     * Store JWT token
     */
    setToken(token) {
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    }

    /**
     * Clear token and redirect to login
     */
    logout() {
        // Keep logout behavior in one place so every auth failure acts the same.
        this.setToken(null);
        window.location.href = "/login";
    }

    /**
     * Make an authenticated request
     * @param {string} method - HTTP method (GET, POST, PATCH, DELETE, etc.)
     * @param {string} endpoint - API endpoint (e.g., "/portfolio")
     * @param {object} body - Request body (optional)
     * @returns {Promise<any>} Parsed JSON response
     */
    async request(method, endpoint, body = null) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
        };

        // Add token automatically so callers do not repeat auth headers everywhere.
        const token = this.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const options = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);

            // If token is expired/invalid, force a clean logout.
            if (response.status === 401) {
                this.logout();
                throw new Error("Session expired. Please log in again.");
            }

            // For other errors, read backend payload and throw a clean message.
            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    error: response.statusText,
                }));
                throw new Error(this.formatErrorMessage(error) || `HTTP ${response.status}`);
            }

            // Some endpoints return success without content.
            if (response.status === 204 || response.status === 205) {
                return null;
            }

            // Parse JSON only when server says payload is JSON.
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                return await response.json();
            }

            // Fallback for plain text endpoints.
            const text = await response.text();
            return text ? text : null;
        } catch (error) {
            // Browser throws TypeError on network failure or blocked request.
            if (error instanceof TypeError) {
                throw new Error(
                    "Cannot reach the backend API. Make sure the server is running on http://localhost:3001.",
                );
            }

            throw error;
        }
    }

    // Convenience methods
    async get(endpoint) {
        return this.request("GET", endpoint);
    }

    async post(endpoint, body) {
        return this.request("POST", endpoint, body);
    }

    async patch(endpoint, body) {
        return this.request("PATCH", endpoint, body);
    }

    async put(endpoint, body) {
        return this.request("PUT", endpoint, body);
    }

    async delete(endpoint) {
        return this.request("DELETE", endpoint);
    }
}

export const api = new ApiClient();

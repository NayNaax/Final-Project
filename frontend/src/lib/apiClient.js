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

        // Attach JWT if available
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

            // Handle 401 Unauthorized → logout and redirect to login
            if (response.status === 401) {
                this.logout();
                throw new Error("Session expired. Please log in again.");
            }

            // Handle other HTTP errors
            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    error: response.statusText,
                }));
                throw new Error(this.formatErrorMessage(error) || `HTTP ${response.status}`);
            }

            // 204/205 responses intentionally have no body.
            if (response.status === 204 || response.status === 205) {
                return null;
            }

            // Only parse JSON when a JSON content type is provided.
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                return await response.json();
            }

            // Some successful endpoints may return an empty body.
            const text = await response.text();
            return text ? text : null;
        } catch (error) {
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

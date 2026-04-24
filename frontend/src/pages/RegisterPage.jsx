import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner } from "../components/ErrorBanner";
import styles from "./AuthPages.module.css";

/**
 * RegisterPage
 *
 * Email + password + confirm form for registering.
 * Posts to /api/auth/register and stores JWT.
 */

export function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [usernameError, setUsernameError] = useState("");
    const [checkingUsername, setCheckingUsername] = useState(false);

    const validateUsername = async (value) => {
        setUsernameError("");

        if (!value) {
            setUsernameError("Username is required");
            return false;
        }

        if (value.length < 3) {
            setUsernameError("Username must be at least 3 characters");
            return false;
        }

        if (value.length > 20) {
            setUsernameError("Username must be at most 20 characters");
            return false;
        }

        if (!/^[a-z0-9_-]+$/.test(value)) {
            setUsernameError("Username can only contain lowercase letters, numbers, underscores, and hyphens");
            return false;
        }

        // Check availability
        setCheckingUsername(true);
        try {
            const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(value)}`);
            const data = await response.json();
            if (!data.available) {
                setUsernameError("Username is already taken");
                setCheckingUsername(false);
                return false;
            }
        } catch (err) {
            console.error("Error checking username:", err);
        }
        setCheckingUsername(false);
        return true;
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value.toLowerCase();
        setUsername(value);
    };

    const validateForm = async () => {
        if (!username || !email || !password || !confirmPassword) {
            setError("All fields are required");
            return false;
        }

        const usernameValid = await validateUsername(username);
        if (!usernameValid) {
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return false;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return false;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!(await validateForm())) return;

        setLoading(true);
        try {
            await register(email, password, username);
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>FirstFund</h1>
                <p className={styles.subtitle}>Create Your Account</p>

                {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username" className={styles.label}>
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            className={styles.input}
                            placeholder="yourname"
                            value={username}
                            onChange={handleUsernameChange}
                            disabled={loading}
                        />
                        {usernameError && <span className={styles.error}>{usernameError}</span>}
                        {checkingUsername && <span className={styles.checking}>Checking availability...</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className={styles.input}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Password (min 8 characters)
                        </label>
                        <input
                            id="password"
                            type="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className={styles.footer}>
                    Already have an account?{" "}
                    <Link to="/login" className={styles.link}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}

import { useState } from "react";
import { Mail, Lock, User, LineChart, ArrowRight } from "lucide-react";

const Register = ({ onRegister, onToggleView }) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const validateUsername = (value) => {
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
        setUsernameError("");
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock authentication - just check passwords match
        if (username && email && password && password === confirmPassword && validateUsername(username)) {
            onRegister();
        } else if (password !== confirmPassword) {
            alert("Passwords do not match");
        }
    };

    return (
        <div className="auth-container glass">
            <div className="auth-header">
                <div className="auth-logo">
                    <LineChart size={24} strokeWidth={2.5} color="var(--bg-primary)" />
                </div>
                <h2>Create Account</h2>
                <p className="auth-subtitle">Join FirstFund and start tracking your wealth</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                    <label>Username</label>
                    <div className="input-with-icon">
                        <User size={18} className="input-icon" />
                        <input
                            type="text"
                            placeholder="yourname"
                            value={username}
                            onChange={(e) => {
                                const lower = e.target.value.toLowerCase();
                                setUsername(lower);
                                validateUsername(lower);
                            }}
                            required
                        />
                    </div>
                    {usernameError && (
                        <span style={{ color: "var(--danger-color)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                            {usernameError}
                        </span>
                    )}
                </div>

                <div className="input-group">
                    <label>Email Address</label>
                    <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label>Password</label>
                    <div className="input-with-icon">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label>Confirm Password</label>
                    <div className="input-with-icon">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn auth-submit-btn">
                    Create Account <ArrowRight size={18} />
                </button>
            </form>

            <div className="auth-footer">
                <p>
                    Already have an account?{" "}
                    <a
                        onClick={onToggleView}
                        style={{ cursor: "pointer", color: "var(--accent-primary)", fontWeight: "600" }}
                    >
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;

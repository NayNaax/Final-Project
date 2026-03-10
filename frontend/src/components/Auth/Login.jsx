import { useState } from "react";
import { Mail, Lock, LineChart, ArrowRight } from "lucide-react";

const Login = ({ onLogin, onToggleView }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock authentication for now
        if (email && password) {
            onLogin();
        }
    };

    return (
        <div className="auth-container glass">
            <div className="auth-header">
                <div className="auth-logo">
                    <LineChart size={24} strokeWidth={2.5} color="var(--bg-primary)" />
                </div>
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Sign in to FirstFund to manage your portfolio</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
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
                        />
                    </div>
                    <div className="forgot-password">
                        <a href="#">Forgot password?</a>
                    </div>
                </div>

                <button type="submit" className="btn auth-submit-btn">
                    Sign In <ArrowRight size={18} />
                </button>
            </form>

            <div className="auth-footer">
                <p>
                    Don't have an account?{" "}
                    <a
                        onClick={onToggleView}
                        style={{ cursor: "pointer", color: "var(--accent-primary)", fontWeight: "600" }}
                    >
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;

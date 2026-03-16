import { useState } from "react";
import { Mail, Lock, User, LineChart, ArrowRight } from "lucide-react";

const Register = ({ onRegister, onToggleView }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock authentication - just check passwords match
        if (name && email && password && password === confirmPassword) {
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
                    <label>Full Name</label>
                    <div className="input-with-icon">
                        <User size={18} className="input-icon" />
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
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

import { useState, useEffect } from "react";
import "./index.css";
import {
    LayoutDashboard,
    LineChart,
    BookOpen,
    Box,
    Bell,
    Wallet,
    Briefcase,
    Activity,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    LogOut,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

// Mock data for the chart
const data = [
    { name: "Mon", value: 118000 },
    { name: "Tue", value: 119500 },
    { name: "Wed", value: 118200 },
    { name: "Thu", value: 121000 },
    { name: "Fri", value: 123400 },
    { name: "Sat", value: 123800 },
    { name: "Sun", value: 124592 },
];

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authView, setAuthView] = useState("login"); // 'login' or 'register'
    const [activeTab, setActiveTab] = useState("overview");
    const [theme, setTheme] = useState("dark"); // Defaulting to premium dark mode

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        if (window.electronAPI && window.electronAPI.onThemeChanged) {
            window.electronAPI.onThemeChanged(theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return (
                    <div className="overview-tab">
                        {/* Top Metric Cards */}
                        <div className="dashboard-grid">
                            <div className="card glass">
                                <div className="card-header">
                                    <h3>Portfolio Value</h3>
                                    <div className="card-icon">
                                        <Wallet size={20} />
                                    </div>
                                </div>
                                <p className="metric-value">$124,592.00</p>
                                <span className="badge success">
                                    <ArrowUpRight size={14} /> 2.4% today
                                </span>
                            </div>

                            <div className="card glass">
                                <div className="card-header">
                                    <h3>Active Trades</h3>
                                    <div className="card-icon">
                                        <Briefcase size={20} />
                                    </div>
                                </div>
                                <p className="metric-value">8</p>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                                    3 Pending execution
                                </p>
                            </div>

                            <div className="card glass">
                                <div className="card-header">
                                    <h3>Monthly Return</h3>
                                    <div className="card-icon">
                                        <Activity size={20} />
                                    </div>
                                </div>
                                <p className="metric-value">$3,490.50</p>
                                <span className="badge success">
                                    <TrendingUp size={14} /> 1.8% vs last
                                </span>
                            </div>

                            <div
                                className="card glass"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    textAlign: "center",
                                }}
                            >
                                <div
                                    className="card-icon"
                                    style={{
                                        marginBottom: "1rem",
                                        width: "48px",
                                        height: "48px",
                                        background: "var(--bg-tertiary)",
                                    }}
                                >
                                    <CreditCard size={24} />
                                </div>
                                <h3>Quick Actions</h3>
                                <button className="btn" style={{ marginTop: "0.5rem", width: "100%" }}>
                                    Deposit Funds
                                </button>
                            </div>
                        </div>

                        {/* Chart and Transactions */}
                        <div className="dashboard-layout">
                            <div className="card glass" style={{ display: "flex", flexDirection: "column" }}>
                                <div className="card-header">
                                    <h3>Performance (7D)</h3>
                                </div>
                                <div className="chart-container" style={{ flex: 1, minHeight: "300px" }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop
                                                        offset="5%"
                                                        stopColor="var(--accent-primary)"
                                                        stopOpacity={0.8}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="var(--accent-primary)"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="var(--bg-tertiary)"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "var(--text-muted)" }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "var(--text-muted)" }}
                                                tickFormatter={(value) => `$${value / 1000}k`}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "var(--bg-secondary)",
                                                    border: "1px solid var(--glass-border)",
                                                    borderRadius: "8px",
                                                }}
                                                itemStyle={{ color: "var(--text-primary)" }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="var(--accent-primary)"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorValue)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card glass">
                                <div className="card-header">
                                    <h3>Recent Activity</h3>
                                </div>
                                <div className="transaction-list">
                                    <div className="transaction-item">
                                        <div className="tx-info">
                                            <div
                                                className="tx-icon"
                                                style={{ background: "var(--success-bg)", color: "var(--success)" }}
                                            >
                                                <ArrowDownRight size={18} />
                                            </div>
                                            <div>
                                                <p className="tx-title">Deposit</p>
                                                <p className="tx-date">Today, 10:24 AM</p>
                                            </div>
                                        </div>
                                        <span className="tx-amount positive">+$5,000.00</span>
                                    </div>
                                    <div className="transaction-item">
                                        <div className="tx-info">
                                            <div
                                                className="tx-icon"
                                                style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
                                            >
                                                <ArrowUpRight size={18} />
                                            </div>
                                            <div>
                                                <p className="tx-title">Bought AAPL</p>
                                                <p className="tx-date">Yesterday, 2:15 PM</p>
                                            </div>
                                        </div>
                                        <span className="tx-amount negative">-$1,240.50</span>
                                    </div>
                                    <div className="transaction-item">
                                        <div className="tx-info">
                                            <div
                                                className="tx-icon"
                                                style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
                                            >
                                                <ArrowUpRight size={18} />
                                            </div>
                                            <div>
                                                <p className="tx-title">Bought NVDA</p>
                                                <p className="tx-date">Oct 24, 9:30 AM</p>
                                            </div>
                                        </div>
                                        <span className="tx-amount negative">-$3,450.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "tracker":
                return (
                    <div className="card glass">
                        <h3>Portfolio Tracker</h3>
                        <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
                            Detailed asset breakdown will go here.
                        </p>
                    </div>
                );
            case "sandbox":
                return (
                    <div className="card glass">
                        <h3>Sandbox Environment</h3>
                        <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
                            Test your strategies here without risk.
                        </p>
                    </div>
                );
            case "learning":
                return (
                    <div className="card glass">
                        <h3>Learning Hub</h3>
                        <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
                            Educational resources and tutorials.
                        </p>
                    </div>
                );
            default:
                return <div>Select a tab</div>;
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="auth-layout">
                {authView === "login" ? (
                    <Login onLogin={() => setIsAuthenticated(true)} onToggleView={() => setAuthView("register")} />
                ) : (
                    <Register onRegister={() => setIsAuthenticated(true)} onToggleView={() => setAuthView("login")} />
                )}
            </div>
        );
    }

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <aside className="sidebar glass">
                <div className="logo-area">
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            background: "linear-gradient(135deg, var(--accent-primary), #8b5cf6)",
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            boxShadow: "0 4px 10px rgba(59, 130, 246, 0.4)",
                        }}
                    >
                        <LineChart size={20} strokeWidth={2.5} />
                    </div>
                    <span className="logo-text">FirstFund</span>
                </div>

                <nav className="nav-links">
                    <a
                        className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        <LayoutDashboard size={20} />
                        Overview
                    </a>
                    <a
                        className={`nav-item ${activeTab === "tracker" ? "active" : ""}`}
                        onClick={() => setActiveTab("tracker")}
                    >
                        <LineChart size={20} />
                        Tracker
                    </a>
                    <a
                        className={`nav-item ${activeTab === "sandbox" ? "active" : ""}`}
                        onClick={() => setActiveTab("sandbox")}
                    >
                        <Box size={20} />
                        Sandbox
                    </a>
                    <a
                        className={`nav-item ${activeTab === "learning" ? "active" : ""}`}
                        onClick={() => setActiveTab("learning")}
                    >
                        <BookOpen size={20} />
                        Learning
                    </a>
                </nav>

                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <button
                        className="nav-item"
                        onClick={toggleTheme}
                        style={{
                            background: "none",
                            border: "none",
                            width: "100%",
                            textAlign: "left",
                            cursor: "pointer",
                        }}
                    >
                        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
                    </button>
                    <a
                        className="nav-item"
                        style={{ color: "var(--danger)" }}
                        onClick={() => setIsAuthenticated(false)}
                    >
                        <LogOut size={20} />
                        Logout
                    </a>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <header className="top-bar">
                    <div>
                        <h1 className="page-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p className="page-subtitle">Welcome back, here's your financial overview.</p>
                    </div>
                    <div className="user-actions">
                        <button className="icon-btn">
                            <Bell size={20} />
                        </button>
                        <div className="avatar"></div>
                    </div>
                </header>

                {renderContent()}
            </main>
        </div>
    );
}

export default App;

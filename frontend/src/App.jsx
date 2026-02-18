import { useState, useEffect } from "react";
import "./index.css";

function App() {
    const [activeTab, setActiveTab] = useState("overview");
    // Default to light, or check system preference
    const [theme, setTheme] = useState("light");

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return (
                    <div className="card-grid">
                        <div className="card">
                            <h3>Portfolio Value</h3>
                            <p className="page-title">$124,592.00</p>
                            <p style={{ color: "var(--success)" }}>+2.4% today</p>
                        </div>
                        <div className="card">
                            <h3>Active Trades</h3>
                            <p className="page-title">8</p>
                            <p className="text-muted">3 Pending</p>
                        </div>
                        <div className="card">
                            <h3>Watchlist</h3>
                            <p>AAPL, TSLA, NVDA</p>
                        </div>
                        <div className="card">
                            <h3>Quick Actions</h3>
                            <button className="btn">New Trade</button>
                        </div>
                    </div>
                );
            case "tracker":
                return (
                    <div className="card">
                        <h3>Portfolio Tracker</h3>
                        <p>List of assets will go here.</p>
                    </div>
                );
            case "sandbox":
                return (
                    <div className="card">
                        <h3>Sandbox Environment</h3>
                        <p>Test your strategies here without risk.</p>
                    </div>
                );
            case "learning":
                return (
                    <div className="card">
                        <h3>Learning Hub</h3>
                        <p>Educational resources and tutorials.</p>
                    </div>
                );
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "3rem",
                    }}
                >
                    <div className="logo-area" style={{ marginBottom: 0 }}>
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
                                borderRadius: 8,
                            }}
                        ></div>
                        <span className="logo-text">FirstFund</span>
                    </div>
                </div>

                <nav className="nav-links">
                    <a
                        className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        Overview
                    </a>
                    <a
                        className={`nav-item ${activeTab === "tracker" ? "active" : ""}`}
                        onClick={() => setActiveTab("tracker")}
                    >
                        Tracker
                    </a>
                    <a
                        className={`nav-item ${activeTab === "sandbox" ? "active" : ""}`}
                        onClick={() => setActiveTab("sandbox")}
                    >
                        Sandbox
                    </a>
                    <a
                        className={`nav-item ${activeTab === "learning" ? "active" : ""}`}
                        onClick={() => setActiveTab("learning")}
                    >
                        Learning Hub
                    </a>
                </nav>

                <div style={{ marginTop: "auto" }}>
                    <button className="theme-toggle" onClick={toggleTheme} style={{ width: "100%" }}>
                        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h1 className="page-title">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p className="page-subtitle">Welcome back to your financial command center.</p>
                    </div>
                </header>

                {renderContent()}
            </main>
        </div>
    );
}

export default App;

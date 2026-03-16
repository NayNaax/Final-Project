import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LineChart,
    LayoutDashboard,
    TrendingUp,
    ShoppingCart,
    AlertCircle,
    DollarSign,
    Users,
    Settings,
    LogOut,
    Bell,
} from "lucide-react";
import styles from "./DashboardLayout.module.css";

/**
 * DashboardLayout
 *
 * Main layout for authenticated app pages.
 * Includes sidebar navigation and top bar with user info.
 */

export function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const navigationItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/" },
        { label: "Stocks", icon: TrendingUp, path: "/stocks" },
        { label: "Portfolio", icon: ShoppingCart, path: "/portfolio" },
        { label: "Watchlists", icon: LineChart, path: "/watchlists" },
        { label: "Alerts", icon: AlertCircle, path: "/alerts" },
        { label: "Budget", icon: DollarSign, path: "/budget" },
        { label: "Leaderboard", icon: Users, path: "/leaderboard" },
        { label: "Settings", icon: Settings, path: "/settings" },
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <LineChart size={24} />
                    <span>FirstFund</span>
                </div>

                <nav className={styles.nav}>
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                className={styles.navItem}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className={styles.footer}>
                    <button className={styles.navItem} onClick={handleLogout} style={{ color: "#ef4444" }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={styles.main}>
                {/* Top Bar */}
                <header className={styles.topBar}>
                    <h1 className={styles.pageTitle}>FirstFund Trading Platform</h1>
                    <div className={styles.headerActions}>
                        <button className={styles.iconBtn}>
                            <Bell size={20} />
                        </button>
                        <div className={styles.userInfo}>
                            <p>{user?.email}</p>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}

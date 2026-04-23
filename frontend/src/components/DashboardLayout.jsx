import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationDropdown } from "./NotificationDropdown";
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
    Search,
    X,
    Menu,
    BookOpen,
    Newspaper
} from "lucide-react";
import { StockSearch } from "./StockSearch";
import styles from "./DashboardLayout.module.css";

/**
 * DashboardLayout
 *
 * Main layout for authenticated app pages.
 * Includes sidebar navigation and top bar with user info.
 */

export function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const { logout, user, token } = useAuth();
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const fetchAlerts = async () => {
            try {
                const res = await fetch("/api/alerts?triggered=true", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!res.ok) {
                    const relativeRes = await fetch("/api/alerts?triggered=true", {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (relativeRes.ok) {
                        const data = await relativeRes.json();
                        const triggered = data.filter((a) => a.triggered === true).sort((a,b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));
                        if(isMounted) {
                            setNotifications(triggered);
                            setUnreadCount(triggered.length);
                        }
                    }
                    return;
                }
                const data = await res.json();
                const triggered = data.filter((a) => a.triggered === true).sort((a,b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));
                if(isMounted) {
                    setNotifications(triggered);
                    // Just a basic sync for unread count
                    setUnreadCount(triggered.length);
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };

        fetchAlerts();
        const intervalId = setInterval(fetchAlerts, 30000);
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        }
    }, [token]);

    const handleMarkAllRead = () => {
        setUnreadCount(0);
    };

    const navigationItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/" },
        { label: "Stocks", icon: TrendingUp, path: "/stocks" },
        { label: "Portfolio", icon: ShoppingCart, path: "/portfolio" },
        { label: "Watchlists", icon: LineChart, path: "/watchlists" },
        { label: "Alerts", icon: AlertCircle, path: "/alerts" },
        { label: "Budget", icon: DollarSign, path: "/budget" },
        { label: "Leaderboard", icon: Users, path: "/leaderboard" },
        { label: "Learn", icon: BookOpen, path: "/learn" },
        { label: "News", icon: Newspaper, path: "/news" },
        { label: "Settings", icon: Settings, path: "/settings" },
    ];

    const handleNavigation = (path) => {
        setIsSidebarOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        setIsSidebarOpen(false);
        logout();
        navigate("/login", { replace: true });
    };
const handleStockSelect = (symbol) => {
        setIsSearchExpanded(false);
        navigate(`/stocks/${symbol}`);
    };


    return (
        <div className={styles.layout}>
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className={styles.backdrop}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}>
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
            <div className={styles.main}>
                {/* Top Bar */}
                <header className={styles.topBar}>
                    <button
                        className={styles.mobileMenuBtn}
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Toggle menu"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className={`${styles.pageTitle} ${isSearchExpanded ? styles.hideOnMobile : ''}`}>
                        FirstFund Trading Platform
                    </h1>

                    <div className={`${styles.searchContainer} ${isSearchExpanded ? styles.expanded : ''}`}>
                        <button
                            className={`${styles.iconBtn} ${styles.mobileSearchToggle} ${isSearchExpanded ? styles.hideOnMobile : ''}`}
                            onClick={() => setIsSearchExpanded(true)}
                        >
                            <Search size={20} />
                        </button>

                        <div className={`${styles.searchWrapper} ${isSearchExpanded ? styles.showOnMobile : ''}`}>
                            <StockSearch
                                placeholder="Search stocks..."
                                onSelect={handleStockSelect}
                                className={styles.globalSearch}
                            />
                            {isSearchExpanded && (
                                <button className={styles.closeSearchBtn} onClick={() => setIsSearchExpanded(false)}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={`${styles.headerActions} ${isSearchExpanded ? styles.hideOnMobile : ''}`}>
                        <div style={{ position: "relative" }}>
                            <button className={styles.iconBtn} onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className={styles.badge} style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        background: "red",
                                        color: "white",
                                        fontSize: "10px",
                                        borderRadius: "50%",
                                        padding: "2px 5px",
                                        transform: "translate(25%, -25%)"
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {isNotificationOpen && (
                                <NotificationDropdown
                                    notifications={notifications}
                                    onClose={() => setIsNotificationOpen(false)}
                                    onMarkAllRead={handleMarkAllRead}
                                />
                            )}
                        </div>
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

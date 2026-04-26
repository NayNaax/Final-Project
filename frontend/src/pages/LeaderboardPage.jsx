import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/apiClient";
import { Trophy, TrendingUp } from "lucide-react";
import { useCurrency } from "../hooks/useCurrency";
import styles from "./LeaderboardPage.module.css";

const LeaderboardPage = () => {
    const { user } = useAuth();
    const { formatCurrency } = useCurrency();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get("/settings/leaderboard");
                setLeaderboard(Array.isArray(response) ? response : []);
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
                setError("Failed to load leaderboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankBadge = (rank) => {
        switch (rank) {
            case 1:
                return (
                    <span className={styles.rankBadge} title="1st Place">
                        🥇
                    </span>
                );
            case 2:
                return (
                    <span className={styles.rankBadge} title="2nd Place">
                        🥈
                    </span>
                );
            case 3:
                return (
                    <span className={styles.rankBadge} title="3rd Place">
                        🥉
                    </span>
                );
            default:
                return <span>#{rank}</span>;
        }
    };

    const getDisplayName = (displayName, email) => {
        return displayName || email?.split("@")[0] || "Anonymous";
    };

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : "?";
    };

    const formatPercent = (value) => {
        return new Intl.NumberFormat("en-US", {
            style: "percent",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value / 100);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>
                    <TrendingUp className="animate-spin" size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Leaderboard</h1>
                <p className={styles.subtitle}>See how your portfolio stacks up against other traders.</p>
            </div>

            <div className={`glass ${styles.leaderboardCard}`}>
                {error ? (
                    <div className={styles.emptyState}>{error}</div>
                ) : leaderboard.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Trophy size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                        <p>Leaderboard will populate as more users trade.</p>
                    </div>
                ) : (
                    <>
                        {leaderboard.length >= 3 && (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "flex-end",
                                    gap: "16px",
                                    margin: "32px 0 48px",
                                    minHeight: "200px",
                                }}
                            >
                                {leaderboard[1] && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            width: "120px",
                                            zIndex: 2,
                                        }}
                                    >
                                        <div
                                            className={styles.avatar}
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                marginBottom: "8px",
                                                background: "var(--bg-tertiary)",
                                            }}
                                        >
                                            {getInitials(getDisplayName(leaderboard[1].displayName))}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.85rem",
                                                fontWeight: "bold",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: "100%",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            {getDisplayName(leaderboard[1].displayName)}
                                        </div>
                                        <div
                                            style={{
                                                color:
                                                    leaderboard[1].returnPercent >= 0
                                                        ? "var(--accent-green)"
                                                        : "var(--accent-red)",
                                                fontSize: "0.85rem",
                                                fontWeight: "bold",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            {leaderboard[1].returnPercent >= 0 ? "+" : ""}
                                            {formatPercent(leaderboard[1].returnPercent || 0)}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.8rem",
                                                color: "var(--text-secondary)",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            {formatCurrency(leaderboard[1].totalValue ?? 0)}
                                        </div>
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "80px",
                                                background:
                                                    "linear-gradient(to top, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))",
                                                borderTopLeftRadius: "8px",
                                                borderTopRightRadius: "8px",
                                                borderTop: "2px solid #C0C0C0",
                                                display: "flex",
                                                justifyContent: "center",
                                                paddingTop: "16px",
                                                fontSize: "1.5rem",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            2
                                        </div>
                                    </div>
                                )}
                                {leaderboard[0] && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            width: "130px",
                                            zIndex: 3,
                                        }}
                                    >
                                        <Trophy size={24} style={{ color: "#FFD700", marginBottom: "8px" }} />
                                        <div
                                            className={styles.avatar}
                                            style={{
                                                width: "64px",
                                                height: "64px",
                                                marginBottom: "8px",
                                                background: "var(--bg-tertiary)",
                                                border: "2px solid #FFD700",
                                            }}
                                        >
                                            {getInitials(getDisplayName(leaderboard[0].displayName))}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.95rem",
                                                fontWeight: "bold",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: "100%",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            {getDisplayName(leaderboard[0].displayName)}
                                        </div>
                                        <div
                                            style={{
                                                color:
                                                    leaderboard[0].returnPercent >= 0
                                                        ? "var(--accent-green)"
                                                        : "var(--accent-red)",
                                                fontSize: "0.95rem",
                                                fontWeight: "bold",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            {leaderboard[0].returnPercent >= 0 ? "+" : ""}
                                            {formatPercent(leaderboard[0].returnPercent || 0)}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.9rem",
                                                color: "var(--text-secondary)",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            {formatCurrency(leaderboard[0].totalValue ?? 0)}
                                        </div>
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "120px",
                                                background:
                                                    "linear-gradient(to top, rgba(255, 215, 0, 0.05), rgba(255, 215, 0, 0.2))",
                                                borderTopLeftRadius: "8px",
                                                borderTopRightRadius: "8px",
                                                borderTop: "2px solid #FFD700",
                                                display: "flex",
                                                justifyContent: "center",
                                                paddingTop: "16px",
                                                fontSize: "2rem",
                                                fontWeight: "bold",
                                                color: "#FFD700",
                                            }}
                                        >
                                            1
                                        </div>
                                    </div>
                                )}
                                {leaderboard[2] && (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            width: "110px",
                                            zIndex: 1,
                                        }}
                                    >
                                        <div
                                            className={styles.avatar}
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                marginBottom: "8px",
                                                background: "var(--bg-tertiary)",
                                            }}
                                        >
                                            {getInitials(getDisplayName(leaderboard[2].displayName))}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.8rem",
                                                fontWeight: "bold",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: "100%",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            {getDisplayName(leaderboard[2].displayName)}
                                        </div>
                                        <div
                                            style={{
                                                color:
                                                    leaderboard[2].returnPercent >= 0
                                                        ? "var(--accent-green)"
                                                        : "var(--accent-red)",
                                                fontSize: "0.8rem",
                                                fontWeight: "bold",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            {leaderboard[2].returnPercent >= 0 ? "+" : ""}
                                            {formatPercent(leaderboard[2].returnPercent || 0)}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "var(--text-secondary)",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            {formatCurrency(leaderboard[2].totalValue ?? 0)}
                                        </div>
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "60px",
                                                background:
                                                    "linear-gradient(to top, rgba(205, 127, 50, 0.05), rgba(205, 127, 50, 0.15))",
                                                borderTopLeftRadius: "8px",
                                                borderTopRightRadius: "8px",
                                                borderTop: "2px solid #CD7F32",
                                                display: "flex",
                                                justifyContent: "center",
                                                paddingTop: "12px",
                                                fontSize: "1.2rem",
                                                fontWeight: "bold",
                                                color: "#CD7F32",
                                            }}
                                        >
                                            3
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div style={{ overflowX: "auto" }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Trader</th>
                                        <th>Total Return</th>
                                        <th>Total Equity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.slice(3).map((trader, index) => {
                                        const rank = trader.rank || index + 4;
                                        const isCurrentUser = user && trader.userId === user.id;

                                        const returnPercent = trader.returnPercent ?? 0;
                                        const equity = trader.totalValue ?? 0;
                                        const nameStr = getDisplayName(trader.displayName);

                                        return (
                                            <tr
                                                key={trader.userId || index}
                                                className={isCurrentUser ? styles.currentUser : ""}
                                            >
                                                <td>{getRankBadge(rank)}</td>
                                                <td>
                                                    <div className={styles.userCell}>
                                                        <div className={styles.avatar}>{getInitials(nameStr)}</div>
                                                        <div className={styles.userInfo}>
                                                            <span className={styles.userName}>
                                                                {nameStr}{" "}
                                                                {isCurrentUser && (
                                                                    <span className={styles.youBadge}>You</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    className={
                                                        returnPercent >= 0
                                                            ? styles.positiveReturn
                                                            : styles.negativeReturn
                                                    }
                                                >
                                                    {returnPercent >= 0 ? "+" : ""}
                                                    {formatPercent(returnPercent)}
                                                </td>
                                                <td>{formatCurrency(equity)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export { LeaderboardPage };
export default LeaderboardPage;

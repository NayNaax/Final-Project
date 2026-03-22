import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/apiClient";
import { Trophy, TrendingUp } from "lucide-react";
import styles from "./LeaderboardPage.module.css";

const LeaderboardPage = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get("/settings/leaderboard");
                const data = response.data || [];
                setLeaderboard(Array.isArray(data) ? data : []);
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

    const getInitials = (email) => {
        return email ? email.charAt(0).toUpperCase() : "?";
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(value);
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
                                {leaderboard.map((trader, index) => {
                                    const rank = index + 1;
                                    const isCurrentUser = user && trader.id === user.id;

                                    // Use robust defaults to try to catch whatever properties the API might send
                                    const returnPercent =
                                        trader.totalReturnPercent ??
                                        trader.returnPercentage ??
                                        trader.return_percent ??
                                        0;
                                    const equity =
                                        trader.totalEquity ?? trader.portfolioValue ?? trader.total_equity ?? 0;
                                    const nameStr = trader.username || trader.email || "Anonymous Trader";

                                    return (
                                        <tr
                                            key={trader.id || index}
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
                                                    returnPercent >= 0 ? styles.positiveReturn : styles.negativeReturn
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
                )}
            </div>
        </div>
    );
};

export { LeaderboardPage };
export default LeaderboardPage;

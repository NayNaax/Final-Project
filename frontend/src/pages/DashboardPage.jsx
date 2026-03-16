import React, { useState, useEffect } from "react";
import { Wallet, Briefcase, Activity, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../lib/apiClient";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
    const [portfolio, setPortfolio] = useState(null);
    const [history, setHistory] = useState([]);
    const [recentTrades, setRecentTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setError("");
                const [portfolioData, historyData, tradesData] = await Promise.all([
                    api.get("/portfolio"),
                    api.get("/portfolio/history"),
                    api.get("/portfolio/trades"),
                ]);

                setPortfolio(portfolioData);

                // Format history data for chart
                const chartData = historyData.map((snapshot) => ({
                    date: new Date(snapshot.snapshotDate).toLocaleDateString(),
                    value: snapshot.totalValue,
                }));
                setHistory(chartData);

                // Get last 5 trades
                setRecentTrades(tradesData.slice(0, 5));
            } catch (err) {
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();

        // Refresh every 30 seconds
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!portfolio) {
        return (
            <div className={styles.container}>
                <ErrorBanner message={error || "Portfolio data unavailable"} />
            </div>
        );
    }

    const totalEquity = portfolio.totalEquity || 0;
    const cash = portfolio.cash || 0;
    const activePositions = portfolio.positions?.length || 0;

    // Calculate monthly return (placeholder - would need historical data)
    const monthlyReturn = 0; // TODO: calculate from trades

    return (
        <div className={styles.container}>
            {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

            {/* Metric Cards */}
            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Portfolio Value</h3>
                        <Wallet size={20} />
                    </div>
                    <p className={styles.metricValue}>
                        ${totalEquity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={styles.subtitle}>
                        Total including $
                        {cash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cash
                    </p>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Active Positions</h3>
                        <Briefcase size={20} />
                    </div>
                    <p className={styles.metricValue}>{activePositions}</p>
                    <p className={styles.subtitle}>Open stock positions</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Monthly Return</h3>
                        <TrendingUp size={20} />
                    </div>
                    <p className={styles.metricValue}>${monthlyReturn.toFixed(2)}</p>
                    <p className={styles.subtitle}>Realized P&L this month</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Available Cash</h3>
                        <Activity size={20} />
                    </div>
                    <p className={styles.metricValue}>
                        ${cash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={styles.subtitle}>Ready to invest</p>
                </div>
            </div>

            {/* Chart and Activity */}
            <div className={styles.layout}>
                {/* Portfolio Value Chart */}
                <div className={styles.card} style={{ gridColumn: "1 / -1" }}>
                    <div className={styles.cardHeader}>
                        <h3>Portfolio Value Over Time</h3>
                    </div>
                    {history.length > 0 ? (
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={history}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="var(--glass-border)"
                                    />
                                    <XAxis dataKey="date" stroke="var(--text-muted)" />
                                    <YAxis stroke="var(--text-muted)" tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--bg-secondary)",
                                            border: "1px solid var(--glass-border)",
                                            borderRadius: "8px",
                                        }}
                                        formatter={(value) =>
                                            `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        }
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className={styles.subtitle} style={{ padding: "2rem" }}>
                            No historical data available yet
                        </p>
                    )}
                </div>

                {/* Recent Activity */}
                <div className={styles.card} style={{ gridColumn: "1 / -1" }}>
                    <div className={styles.cardHeader}>
                        <h3>Recent Activity</h3>
                    </div>
                    {recentTrades.length > 0 ? (
                        <div className={styles.transactionList}>
                            {recentTrades.map((trade) => (
                                <div key={trade.id} className={styles.transactionItem}>
                                    <div className={styles.txInfo}>
                                        <div
                                            className={styles.txIcon}
                                            style={{
                                                background:
                                                    trade.side === "BUY"
                                                        ? "rgba(239, 68, 68, 0.1)"
                                                        : "rgba(34, 197, 94, 0.1)",
                                                color: trade.side === "BUY" ? "#ef4444" : "#22c55e",
                                            }}
                                        >
                                            {trade.side === "BUY" ? "↓" : "↑"}
                                        </div>
                                        <div>
                                            <p className={styles.txTitle}>
                                                {trade.side === "BUY" ? "Bought" : "Sold"} {trade.symbol}
                                            </p>
                                            <p className={styles.txDate}>
                                                {new Date(trade.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={styles.txAmount}
                                        style={{
                                            color: trade.side === "BUY" ? "#ef4444" : "#22c55e",
                                        }}
                                    >
                                        {trade.side === "BUY" ? "-" : "+"}$
                                        {trade.total.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.subtitle} style={{ padding: "2rem" }}>
                            No trades yet. Start building your portfolio!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

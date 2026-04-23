import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, Briefcase, Activity, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../lib/apiClient";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
    const navigate = useNavigate();
    const [portfolio, setPortfolio] = useState(null);
    const [history, setHistory] = useState([]);
    const [rawHistory, setRawHistory] = useState([]);
    const [recentTrades, setRecentTrades] = useState([]);
    const [topGainers, setTopGainers] = useState([]);
    const [topLosers, setTopLosers] = useState([]);
    const [chartRange, setChartRange] = useState("ALL");
    const [monthlyReturn, setMonthlyReturn] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setError("");
                const [portfolioData, historyData, tradesData, stocksData] = await Promise.all([
                    api.get("/portfolio"),
                    api.get("/portfolio/history"),
                    api.get("/portfolio/trades"),
                    api.get("/stocks"),
                ]);

                setPortfolio(portfolioData);

                // Format history data for chart
                const chartData = historyData.map((snapshot) => ({
                    date: new Date(snapshot.snapshotDate).toLocaleDateString(),
                    timestamp: new Date(snapshot.snapshotDate).getTime(),
                    value: snapshot.totalValue,
                }));
                setRawHistory(chartData);

                // Get last 5 trades
                setRecentTrades(tradesData.slice(0, 5));

                // Calculate Monthly Return
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const monthTrades = tradesData.filter((trade) => {
                    const d = new Date(trade.createdAt);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && trade.side === "SELL";
                });
                const calculatedMonthlyReturn = monthTrades.reduce((sum, trade) => sum + (trade.realizedPL || 0), 0);
                setMonthlyReturn(calculatedMonthlyReturn);

                // Top Movers
                if (Array.isArray(stocksData) && stocksData.length > 0) {
                    const normalizedStocks = stocksData.map((stock) => ({
                        ...stock,
                        currentPrice: Number(stock.currentPrice ?? stock.c ?? stock.price ?? 0),
                        changePercent: Number(stock.changePercent ?? stock.dp ?? 0),
                    }));

                    const sortedStocks = normalizedStocks.sort((a, b) => b.changePercent - a.changePercent);
                    setTopGainers(sortedStocks.slice(0, 3));
                    setTopLosers(sortedStocks.slice(-3).reverse());
                }
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

    // Filter chart data when range changes
    useEffect(() => {
        if (!rawHistory.length) return;

        let filtered = rawHistory;
        const now = Date.now();

        if (chartRange === "1W") {
            const oneWeek = now - 7 * 24 * 60 * 60 * 1000;
            filtered = rawHistory.filter((d) => d.timestamp >= oneWeek);
        } else if (chartRange === "1M") {
            const oneMonth = now - 30 * 24 * 60 * 60 * 1000;
            filtered = rawHistory.filter((d) => d.timestamp >= oneMonth);
        } else if (chartRange === "3M") {
            const threeMonths = now - 90 * 24 * 60 * 60 * 1000;
            filtered = rawHistory.filter((d) => d.timestamp >= threeMonths);
        }

        setHistory(filtered);
    }, [chartRange, rawHistory]);

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

    const topHoldings = portfolio.positions
        ? [...portfolio.positions].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0)).slice(0, 5)
        : [];

    return (
        <div className={styles.container}>
            {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

            {/* Metric Cards */}
            <div className={styles.grid}>
                <div className={`${styles.card} ${styles.cardMetric}`}>
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

                <div className={`${styles.card} ${styles.cardMetric}`}>
                    <div className={styles.cardHeader}>
                        <h3>Active Positions</h3>
                        <Briefcase size={20} />
                    </div>
                    <p className={styles.metricValue}>{activePositions}</p>
                    <p className={styles.subtitle}>Open stock positions</p>
                </div>

                <div className={`${styles.card} ${styles.cardMetric}`}>
                    <div className={styles.cardHeader}>
                        <h3>Monthly Return</h3>
                        {monthlyReturn >= 0 ? (
                            <TrendingUp size={20} color="#22c55e" />
                        ) : (
                            <TrendingDown size={20} color="#ef4444" />
                        )}
                    </div>
                    <p className={styles.metricValue} style={{ color: monthlyReturn >= 0 ? "#22c55e" : "#ef4444" }}>
                        {monthlyReturn >= 0 ? "+" : "-"}${Math.abs(monthlyReturn).toFixed(2)}
                    </p>
                    <p className={styles.subtitle}>Realized P&L this month</p>
                </div>

                <div className={`${styles.card} ${styles.cardMetric}`}>
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

            <div className={styles.grid}>
                {/* Portfolio Value Chart */}
                <div className={`${styles.card} ${styles.cardLarge}`}>
                    <div className={styles.chartHeader}>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Portfolio Value Over Time
                        </h3>
                        <div className={styles.filterGroup}>
                            {["1W", "1M", "3M", "ALL"].map((range) => (
                                <button
                                    key={range}
                                    className={`${styles.filterBtn} ${chartRange === range ? styles.filterBtnActive : ""}`}
                                    onClick={() => setChartRange(range)}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
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
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--text-muted)"
                                        tick={{ fill: "var(--text-muted)" }}
                                    />
                                    <YAxis
                                        stroke="var(--text-muted)"
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                        tick={{ fill: "var(--text-muted)" }}
                                        domain={["auto", "auto"]}
                                    />
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
                            No historical data available for this range
                        </p>
                    )}
                </div>

                {/* Top Holdings Mini-Table */}
                {topHoldings.length > 0 && (
                    <div className={`${styles.card} ${styles.cardMedium}`}>
                        <div className={styles.cardHeader}>
                            <h3>Top Holdings</h3>
                        </div>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Symbol</th>
                                        <th className={styles.textRight}>Shares</th>
                                        <th className={styles.textRight}>Value</th>
                                        <th className={styles.textRight}>P&L%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topHoldings.map((pos) => {
                                        const profitLoss = pos.unrealizedPLPercent || 0;
                                        const isPositive = profitLoss >= 0;
                                        return (
                                            <tr
                                                key={pos.symbol}
                                                className={styles.clickableRow}
                                                onClick={() => navigate(`/stocks/${pos.symbol}`)}
                                            >
                                                <td style={{ fontWeight: 600 }}>{pos.symbol}</td>
                                                <td className={styles.textRight}>
                                                    {typeof pos.shares === "number"
                                                        ? pos.shares.toLocaleString("en-US", {
                                                              minimumFractionDigits: 0,
                                                              maximumFractionDigits: 4,
                                                          })
                                                        : pos.shares}
                                                </td>
                                                <td className={styles.textRight}>
                                                    $
                                                    {(pos.marketValue || 0).toLocaleString("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </td>
                                                <td
                                                    className={styles.textRight}
                                                    style={{
                                                        color: isPositive ? "#22c55e" : "#ef4444",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {isPositive ? "+" : ""}
                                                    {profitLoss.toFixed(2)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Link to="/portfolio" className={styles.viewAllLink}>
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                )}

                {/* Top Movers */}
                {(topGainers.length > 0 || topLosers.length > 0) && (
                    <div className={`${styles.card} ${styles.cardMedium}`}>
                        <div className={styles.cardHeader}>
                            <h3>Today's Top Movers</h3>
                        </div>
                        <div className={styles.moversGrid}>
                            <div className={styles.moverSection}>
                                <h4>Gainers</h4>
                                {topGainers.map((stock) => (
                                    <div
                                        key={stock.symbol}
                                        className={styles.moverItem}
                                        onClick={() => navigate(`/stocks/${stock.symbol}`)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div>
                                            <div className={styles.moverSymbol}>{stock.symbol}</div>
                                            <div className={styles.moverPrice}>
                                                ${Number(stock.currentPrice ?? 0).toFixed(2)}
                                            </div>
                                        </div>
                                        <div className={styles.moverChange} style={{ color: "#22c55e" }}>
                                            +{Number(stock.changePercent ?? 0).toFixed(2)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.moverSection}>
                                <h4>Losers</h4>
                                {topLosers.map((stock) => (
                                    <div
                                        key={stock.symbol}
                                        className={styles.moverItem}
                                        onClick={() => navigate(`/stocks/${stock.symbol}`)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div>
                                            <div className={styles.moverSymbol}>{stock.symbol}</div>
                                            <div className={styles.moverPrice}>
                                                ${Number(stock.currentPrice ?? 0).toFixed(2)}
                                            </div>
                                        </div>
                                        <div className={styles.moverChange} style={{ color: "#ef4444" }}>
                                            {Number(stock.changePercent ?? 0).toFixed(2)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div className={`${styles.card} ${styles.cardLarge}`}>
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
                                        style={{ color: trade.side === "BUY" ? "#ef4444" : "#22c55e" }}
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

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer } from "recharts";
import { Briefcase, DollarSign, TrendingUp, TrendingDown, History, ChevronDown, ChevronRight } from "lucide-react";
import { api } from "../lib/apiClient";
import { STOCK_INFO } from "../lib/stockInfo";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import { useCurrency } from "../hooks/useCurrency";
import styles from "./PortfolioPage.module.css";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316", "#6366f1"];

export function PortfolioPage() {
    const navigate = useNavigate();
    const { formatCurrency, formatSignedCurrency, convertCurrency } = useCurrency();
    const [portfolio, setPortfolio] = useState(null);
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");
                const [portData, tradesData] = await Promise.all([api.get("/portfolio"), api.get("/portfolio/trades")]);
                setPortfolio(portData);
                setTrades(tradesData);
            } catch (err) {
                setError(err.message || "Failed to load portfolio data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading && !portfolio) return <LoadingSpinner />;
    if (error && !portfolio)
        return (
            <div className={styles.container}>
                <ErrorBanner message={error} />
            </div>
        );
    if (!portfolio)
        return (
            <div className={styles.container}>
                <ErrorBanner message="Portfolio not available" />
            </div>
        );

    const { cash, totalEquity, positions } = portfolio;
    const displayTotalEquity = convertCurrency(totalEquity);

    // Calculate total Unrealized P&L
    const totalUnrealizedPL = positions.reduce((sum, pos) => {
        return sum + (pos.currentPrice - (pos.avgCost || 0)) * pos.shares;
    }, 0);

    const isPLPositive = totalUnrealizedPL >= 0;

    // Prepare Allocation Donut Chart Data
    const allocationMap = { Cash: cash };
    positions.forEach((pos) => {
        const sector = STOCK_INFO[pos.symbol]?.sector || "Other";
        const marketValue = pos.currentPrice * pos.shares;
        allocationMap[sector] = (allocationMap[sector] || 0) + marketValue;
    });

    const pieData = Object.entries(allocationMap)
        .filter(([key, value]) => value > 0)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    const displayPieData = pieData.map((entry) => ({
        ...entry,
        value: convertCurrency(entry.value),
    }));

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Portfolio</h1>
                <p className={styles.pageSubtitle}>Manage your holdings and track performance</p>
            </header>

            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                <div className={`${styles.summaryCard} glass`}>
                    <div className={styles.cardIcon}>
                        <Briefcase size={20} />
                    </div>
                    <div className={styles.cardInfo}>
                        <span className={styles.cardLabel}>Total Equity</span>
                        <span className={styles.cardValue}>{formatCurrency(totalEquity)}</span>
                    </div>
                </div>
                <div className={`${styles.summaryCard} glass`}>
                    <div className={styles.cardIcon}>
                        <DollarSign size={20} />
                    </div>
                    <div className={styles.cardInfo}>
                        <span className={styles.cardLabel}>Cash Balance</span>
                        <span className={styles.cardValue}>{formatCurrency(cash)}</span>
                    </div>
                </div>
                <div className={`${styles.summaryCard} glass`}>
                    <div className={`${styles.cardIcon} ${isPLPositive ? styles.iconPositive : styles.iconNegative}`}>
                        {isPLPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div className={styles.cardInfo}>
                        <span className={styles.cardLabel}>Unrealized P&L</span>
                        <span
                            className={`${styles.cardValue} ${isPLPositive ? styles.textPositive : styles.textNegative}`}
                        >
                            {formatSignedCurrency(totalUnrealizedPL)}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.mainContent}>
                {/* Positions Table */}
                <div className={styles.positionsSection}>
                    <div className={`${styles.card} glass`}>
                        <h2 className={styles.cardTitle}>Current Positions</h2>

                        {positions.length > 0 ? (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Symbol</th>
                                            <th>Shares</th>
                                            <th>Avg Cost</th>
                                            <th>Price</th>
                                            <th>Market Value</th>
                                            <th className={styles.rightAlign}>Total Return</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {positions.map((pos) => {
                                            const mktValue = pos.currentPrice * pos.shares;
                                            const unrlPL = mktValue - (pos.avgCost || 0) * pos.shares;
                                            const unrlPLPct =
                                                (pos.avgCost || 0) > 0
                                                    ? (unrlPL / (pos.avgCost * pos.shares)) * 100
                                                    : 0;
                                            const isPosPL = unrlPL >= 0;

                                            return (
                                                <tr
                                                    key={pos.symbol}
                                                    onClick={() => navigate(`/stocks/${pos.symbol}`)}
                                                    className={styles.clickableRow}
                                                >
                                                    <td>
                                                        <div className={styles.symbolCell}>
                                                            <span className={styles.symbolText}>{pos.symbol}</span>
                                                            <span className={styles.companyText}>
                                                                {STOCK_INFO[pos.symbol]?.name || pos.symbol}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {typeof pos.shares === "number"
                                                            ? pos.shares.toLocaleString("en-US", {
                                                                  minimumFractionDigits: 0,
                                                                  maximumFractionDigits: 4,
                                                              })
                                                            : pos.shares}
                                                    </td>
                                                    <td>{formatCurrency(pos.avgCost || 0)}</td>
                                                    <td>{formatCurrency(pos.currentPrice)}</td>
                                                    <td>{formatCurrency(mktValue)}</td>
                                                    <td className={styles.rightAlign}>
                                                        <div
                                                            className={`${styles.plCell} ${isPosPL ? styles.textPositive : styles.textNegative}`}
                                                        >
                                                            <span>{formatSignedCurrency(unrlPL)}</span>
                                                            <span className={styles.plPercent}>
                                                                ({Math.abs(unrlPLPct).toFixed(2)}%)
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <p>No open positions. Start building your portfolio!</p>
                                <button className={styles.primaryBtn} onClick={() => navigate("/trade")}>
                                    Trade Stocks
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Trade History Toggle */}
                    <div className={`${styles.card} glass`}>
                        <button className={styles.historyToggle} onClick={() => setShowHistory(!showHistory)}>
                            <div className={styles.historyTitle}>
                                <History size={20} />
                                <h2>Trade History</h2>
                            </div>
                            {showHistory ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>

                        {showHistory && (
                            <div className={styles.historyContent}>
                                {trades.length > 0 ? (
                                    <div className={styles.tableWrapper}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Symbol</th>
                                                    <th>Action</th>
                                                    <th>Shares</th>
                                                    <th>Price</th>
                                                    <th className={styles.rightAlign}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {trades.map((trade) => (
                                                    <tr key={trade.id}>
                                                        <td>{new Date(trade.createdAt).toLocaleString()}</td>
                                                        <td className={styles.symbolText}>{trade.symbol}</td>
                                                        <td>
                                                            <span
                                                                className={`${styles.badge} ${trade.side === "BUY" ? styles.bgNegative : styles.bgPositive}`}
                                                            >
                                                                {trade.side}
                                                            </span>
                                                        </td>
                                                        <td>{trade.shares}</td>
                                                        <td>{formatCurrency(trade.price)}</td>
                                                        <td
                                                            className={`${styles.rightAlign} ${trade.side === "BUY" ? styles.textNegative : styles.textPositive}`}
                                                        >
                                                            {trade.side === "BUY" ? "-" : "+"}
                                                            {formatCurrency(trade.total)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className={styles.emptyState}>
                                        <p>No trade history available.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Allocation Donut Chart */}
                <div className={styles.sideSection}>
                    <div className={`${styles.card} glass`}>
                        <h2 className={styles.cardTitle}>Asset Allocation</h2>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={displayPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    entry.name === "Cash"
                                                        ? "var(--success)"
                                                        : COLORS[index % COLORS.length]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <PieTooltip
                                        formatter={(val) => formatCurrency(val)}
                                        contentStyle={{
                                            backgroundColor: "var(--bg-secondary)",
                                            border: "1px solid var(--glass-border)",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={styles.legend}>
                            {displayPieData.map((entry, index) => {
                                const percent =
                                    displayTotalEquity > 0
                                        ? ((entry.value / displayTotalEquity) * 100).toFixed(1)
                                        : "0.0";
                                return (
                                    <div key={entry.name} className={styles.legendItem}>
                                        <div className={styles.legendLabel}>
                                            <div
                                                className={styles.legendColor}
                                                style={{
                                                    backgroundColor:
                                                        entry.name === "Cash"
                                                            ? "var(--success)"
                                                            : COLORS[index % COLORS.length],
                                                }}
                                            />
                                            <span>{entry.name}</span>
                                        </div>
                                        <span className={styles.legendValue}>{percent}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

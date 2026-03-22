import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../lib/apiClient";
import { STOCK_INFO } from "../lib/stockInfo";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import styles from "./StockDetailPage.module.css";

export function StockDetailPage() {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [stockData, setStockData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dateRange, setDateRange] = useState("1M");
    const [tradeShares, setTradeShares] = useState("1");
    const [tradeSide, setTradeSide] = useState("BUY");
    const [isTrading, setIsTrading] = useState(false);
    const [tradeError, setTradeError] = useState("");

    const info = STOCK_INFO[symbol] || { name: symbol, sector: "Unknown" };

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await api.get(`/stocks/${symbol}`);
                setStockData(data.current);

                const sortedHistory = [...data.history].sort((a, b) => new Date(a.date) - new Date(b.date));
                setHistory(sortedHistory);
            } catch (err) {
                setError(err.message || "Failed to load stock data");
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();

        const interval = setInterval(fetchStockData, 30000);
        return () => clearInterval(interval);
    }, [symbol]);

    const handleTradeSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsTrading(true);
            setTradeError("");

            const numShares = parseInt(tradeShares, 10);
            if (isNaN(numShares) || numShares < 1) {
                throw new Error("Invalid number of shares");
            }

            const endpoint = tradeSide === "BUY" ? "/portfolio/buy" : "/portfolio/sell";
            await api.post(endpoint, {
                symbol,
                shares: numShares,
            });
            // Success, navigate to portfolio
            navigate("/portfolio");
        } catch (err) {
            setTradeError(err.message || "Trade failed");
        } finally {
            setIsTrading(false);
        }
    };

    if (loading && !stockData) return <LoadingSpinner />;
    if (error && !stockData)
        return (
            <div className={styles.container}>
                <ErrorBanner message={error} />
            </div>
        );
    if (!stockData)
        return (
            <div className={styles.container}>
                <ErrorBanner message="Stock not found" />
            </div>
        );

    const currentPrice = stockData.price;
    const change = currentPrice - stockData.previousClose;
    const changePercent = (change / stockData.previousClose) * 100;
    const isPositive = change >= 0;

    const getFilteredHistory = () => {
        if (!history.length) return [];
        if (dateRange === "ALL") return history;

        const now = new Date();
        const cutoff = new Date();
        if (dateRange === "1W") cutoff.setDate(now.getDate() - 7);
        if (dateRange === "1M") cutoff.setMonth(now.getMonth() - 1);
        if (dateRange === "3M") cutoff.setMonth(now.getMonth() - 3);
        if (dateRange === "6M") cutoff.setMonth(now.getMonth() - 6);
        if (dateRange === "1Y") cutoff.setFullYear(now.getFullYear() - 1);

        return history.filter((h) => new Date(h.date) >= cutoff);
    };

    const filteredHistory = getFilteredHistory();
    const chartData = filteredHistory.map((h) => ({
        date: new Date(h.date).toLocaleDateString(),
        price: h.close,
    }));

    const allPrices = history.map((h) => h.close);
    const high52 = allPrices.length ? Math.max(...allPrices) : currentPrice;
    const low52 = allPrices.length ? Math.min(...allPrices) : currentPrice;

    const parsedShares = parseInt(tradeShares, 10);
    const safeShares = isNaN(parsedShares) ? 0 : parsedShares;

    return (
        <div className={styles.container}>
            <Link to="/stocks" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Stocks
            </Link>

            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        {symbol} <span className={styles.companyName}>{info.name}</span>
                    </h1>
                    <div className={styles.priceContainer}>
                        <span className={styles.price}>${currentPrice.toFixed(2)}</span>
                        <span className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                            {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}$
                            {Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)
                        </span>
                    </div>
                </div>
            </header>

            <div className={styles.grid}>
                {/* Main Column - Chart */}
                <div className={styles.mainCol}>
                    <div className={`${styles.card} glass`}>
                        <div className={styles.chartHeader}>
                            <h3>Performance</h3>
                            <div className={styles.dateFilters}>
                                {["1W", "1M", "3M", "6M", "1Y", "ALL"].map((range) => (
                                    <button
                                        key={range}
                                        className={`${styles.filterBtn} ${dateRange === range ? styles.activeFilter : ""}`}
                                        onClick={() => setDateRange(range)}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor={isPositive ? "#10b981" : "#ef4444"}
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor={isPositive ? "#10b981" : "#ef4444"}
                                                stopOpacity={0}
                                            />
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
                                        dy={10}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        stroke="var(--text-muted)"
                                        tick={{ fill: "var(--text-muted)" }}
                                        domain={["auto", "auto"]}
                                        tickFormatter={(val) => `$${val}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--bg-secondary)",
                                            border: "1px solid var(--glass-border)",
                                            borderRadius: "8px",
                                        }}
                                        formatter={(val) => [`$${val.toFixed(2)}`, "Price"]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke={isPositive ? "#10b981" : "#ef4444"}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorPrice)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={`${styles.statCard} glass`}>
                            <span className={styles.statLabel}>Sector</span>
                            <span className={styles.statValue}>{info.sector}</span>
                        </div>
                        <div className={`${styles.statCard} glass`}>
                            <span className={styles.statLabel}>Volume</span>
                            <span className={styles.statValue}>{stockData.volume.toLocaleString()}</span>
                        </div>
                        <div className={`${styles.statCard} glass`}>
                            <span className={styles.statLabel}>52W High</span>
                            <span className={styles.statValue}>${high52.toFixed(2)}</span>
                        </div>
                        <div className={`${styles.statCard} glass`}>
                            <span className={styles.statLabel}>52W Low</span>
                            <span className={styles.statValue}>${low52.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column - Trade Form */}
                <div className={styles.sideCol}>
                    <div className={`${styles.tradeCard} glass`}>
                        <h3>Trade {symbol}</h3>

                        {tradeError && <ErrorBanner message={tradeError} onDismiss={() => setTradeError("")} />}

                        <form className={styles.tradeForm} onSubmit={handleTradeSubmit}>
                            <div className={styles.sideToggle}>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${tradeSide === "BUY" ? styles.activeBuy : ""}`}
                                    onClick={() => setTradeSide("BUY")}
                                >
                                    Buy
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${tradeSide === "SELL" ? styles.activeSell : ""}`}
                                    onClick={() => setTradeSide("SELL")}
                                >
                                    Sell
                                </button>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Shares</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={tradeShares}
                                    onChange={(e) => setTradeShares(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.orderSummary}>
                                <div className={styles.summaryRow}>
                                    <span>Current Price</span>
                                    <span>${currentPrice.toFixed(2)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Estimated Total</span>
                                    <span className={styles.estimatedTotal}>
                                        $
                                        {(currentPrice * safeShares).toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`${styles.submitBtn} ${tradeSide === "BUY" ? styles.btnBuy : styles.btnSell}`}
                                disabled={isTrading || !tradeShares || safeShares < 1}
                            >
                                {isTrading ? <LoadingSpinner /> : `${tradeSide === "BUY" ? "Buy" : "Sell"} ${symbol}`}
                            </button>
                        </form>
                    </div>

                    <div className={`${styles.infoCard} glass`}>
                        <div className={styles.infoHeader}>
                            <Activity size={18} />
                            <h3>Market Hours</h3>
                        </div>
                        <p className={styles.infoText}>
                            Prices are currently delayed. Market opens Mon-Fri 9:30 AM - 4:00 PM EST.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

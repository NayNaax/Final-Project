import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { api } from "../lib/apiClient";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import { useCurrency } from "../hooks/useCurrency";
import styles from "./StocksPage.module.css";

// Company names for display
const COMPANY_NAMES = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOG: "Alphabet Inc.",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
    NVDA: "NVIDIA Corporation",
    META: "Meta Platforms Inc.",
    TSLA: "Tesla Inc.",
    "BRK.B": "Berkshire Hathaway Inc.",
    V: "Visa Inc.",
    JNJ: "Johnson & Johnson",
    WMT: "Walmart Inc.",
    JPM: "JPMorgan Chase & Co.",
    PG: "Procter & Gamble Co.",
    MA: "Mastercard Incorporated",
};

export function StocksPage() {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();
    const [stocks, setStocks] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadStocks = async () => {
            try {
                setError("");
                const data = await api.get("/stocks");
                setStocks(data);
                setFilteredStocks(data);

                const failed = data.filter((stock) => stock?.error);
                if (failed.length === data.length && failed.length > 0) {
                    setError(failed[0].error || "Live quote providers are currently unavailable.");
                } else if (failed.length > 0) {
                    setError(`Live data is unavailable for ${failed.length} of ${data.length} symbols.`);
                }
            } catch (err) {
                setError(err.message || "Failed to load stocks");
            } finally {
                setLoading(false);
            }
        };

        loadStocks();

        // Refresh every 30 seconds
        const interval = setInterval(loadStocks, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Filter stocks based on search term
        const filtered = stocks.filter((stock) => {
            const symbol = stock.symbol.toUpperCase();
            const company = (COMPANY_NAMES[symbol] || "").toUpperCase();
            const search = searchTerm.toUpperCase();
            return symbol.includes(search) || company.includes(search);
        });
        setFilteredStocks(filtered);
    }, [searchTerm, stocks]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className={styles.container}>
            {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

            {/* Search Bar */}
            <div className={styles.searchBar}>
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Search by symbol or company name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* Stocks Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Company</th>
                            <th>Price</th>
                            <th>Change</th>
                            <th>Change %</th>
                            <th>Volume</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStocks.map((stock) => {
                            const price = stock.c ?? stock.price ?? "N/A";
                            const change = stock.d ?? stock.change ?? 0;
                            const changePercent = stock.dp ?? stock.changePercent ?? 0;
                            const volume = stock.v ?? stock.volume ?? 0;
                            const companyName = COMPANY_NAMES[stock.symbol] || stock.symbol;
                            const isPositive = change >= 0;

                            return (
                                <tr
                                    key={stock.symbol}
                                    className={styles.tableRow}
                                    onClick={() => navigate(`/stocks/${stock.symbol}`)}
                                >
                                    <td className={styles.symbol}>{stock.symbol}</td>
                                    <td className={styles.company}>{companyName}</td>
                                    <td className={styles.price}>
                                        {typeof price === "number" ? formatCurrency(price) : price}
                                    </td>
                                    <td className={styles.change}>
                                        <span className={isPositive ? styles.positive : styles.negative}>
                                            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            {change >= 0 ? "+" : ""}
                                            {formatCurrency(change)}
                                        </span>
                                    </td>
                                    <td className={styles.changePercent}>
                                        <span className={isPositive ? styles.positive : styles.negative}>
                                            {isPositive ? "+" : ""}
                                            {changePercent.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className={styles.volume}>
                                        {volume > 0 ? (volume / 1000000).toFixed(2) + "M" : "0.00M"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredStocks.length === 0 && (
                <div className={styles.emptyState}>
                    <p>No stocks found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
}

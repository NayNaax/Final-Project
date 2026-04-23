import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ExternalLink, Newspaper } from "lucide-react";
import { api } from "../lib/apiClient";
import { STOCK_INFO } from "../lib/stockInfo";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import styles from "./NewsPage.module.css";

const DAY_MS = 24 * 60 * 60 * 1000;

const toDateInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getDefaultDateRange = () => {
    const toDate = new Date();
    const fromDate = new Date(Date.now() - 7 * DAY_MS);

    return {
        from: toDateInputValue(fromDate),
        to: toDateInputValue(toDate),
    };
};

const toReadableDate = (unixSeconds) => {
    if (!Number.isFinite(unixSeconds)) {
        return "Unknown time";
    }

    return new Date(unixSeconds * 1000).toLocaleString();
};

export function NewsPage() {
    const symbols = useMemo(() => Object.keys(STOCK_INFO).sort(), []);
    const defaults = useMemo(() => getDefaultDateRange(), []);
    const [symbol, setSymbol] = useState("ALL");
    const [from, setFrom] = useState(defaults.from);
    const [to, setTo] = useState(defaults.to);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadNewsData = async (selectedSymbol, selectedFrom, selectedTo) => {
        if (!selectedSymbol || !selectedFrom || !selectedTo) {
            setError("Symbol, from date, and to date are required.");
            return;
        }

        if (selectedFrom > selectedTo) {
            setError("From date must be before or equal to To date.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            if (selectedSymbol === "ALL") {
                const requests = symbols.map((stockSymbol) => {
                    const endpoint = `/stocks/company-news?symbol=${encodeURIComponent(stockSymbol)}&from=${encodeURIComponent(selectedFrom)}&to=${encodeURIComponent(selectedTo)}`;
                    return api.get(endpoint, { cacheMs: 120000, force: true }).then((response) => ({
                        symbol: stockSymbol,
                        items: Array.isArray(response?.items) ? response.items : [],
                    }));
                });

                const settled = await Promise.allSettled(requests);
                const merged = settled
                    .filter((entry) => entry.status === "fulfilled")
                    .flatMap((entry) =>
                        entry.value.items.map((article) => ({
                            ...article,
                            symbol: entry.value.symbol,
                        })),
                    )
                    .sort((a, b) => Number(b.datetime || 0) - Number(a.datetime || 0));

                const uniqueById = [];
                const seen = new Set();
                for (const article of merged) {
                    const key = String(article.id || "");
                    if (!key || seen.has(key)) {
                        continue;
                    }
                    seen.add(key);
                    uniqueById.push(article);
                }

                setItems(uniqueById.slice(0, 120));
                return;
            }

            const endpoint = `/stocks/company-news?symbol=${encodeURIComponent(selectedSymbol)}&from=${encodeURIComponent(selectedFrom)}&to=${encodeURIComponent(selectedTo)}`;
            const response = await api.get(endpoint, { cacheMs: 120000, force: true });
            const newsItems = Array.isArray(response?.items) ? response.items : [];
            setItems(newsItems.map((article) => ({ ...article, symbol: selectedSymbol })));
        } catch (err) {
            setError(err.message || "Failed to load company news");
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const loadNews = async (event) => {
        event.preventDefault();
        await loadNewsData(symbol, from, to);
    };

    useEffect(() => {
        void loadNewsData("ALL", defaults.from, defaults.to);
    }, [defaults.from, defaults.to]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Company News</h1>
                <p className={styles.pageSubtitle}>Latest headlines for stocks currently displayed in FirstFund</p>
            </header>

            <form className={`${styles.filters} glass`} onSubmit={loadNews}>
                <label className={styles.field}>
                    <span>Symbol</span>
                    <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                        <option value="ALL">All displayed stocks</option>
                        {symbols.map((stockSymbol) => (
                            <option key={stockSymbol} value={stockSymbol}>
                                {stockSymbol} - {STOCK_INFO[stockSymbol]?.name || stockSymbol}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.field}>
                    <span>From</span>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </label>

                <label className={styles.field}>
                    <span>To</span>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </label>

                <button className={styles.loadButton} type="submit" disabled={loading}>
                    {loading ? "Loading..." : "Load News"}
                </button>
            </form>

            {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

            {loading ? (
                <LoadingSpinner />
            ) : items.length === 0 ? (
                <div className={`${styles.emptyState} glass`}>
                    <Newspaper size={20} />
                    <p>No articles found for this symbol and date range.</p>
                </div>
            ) : (
                <div className={styles.newsList}>
                    {items.map((article) => (
                        <article key={article.id} className={`${styles.newsCard} glass`}>
                            <div className={styles.newsTopRow}>
                                <span className={styles.category}>
                                    {STOCK_INFO[article.symbol]?.name
                                        ? `${STOCK_INFO[article.symbol].name} - ${article.symbol}`
                                        : article.symbol || article.category || "general"}
                                </span>
                                <div className={styles.topRightInfo}>
                                    <span className={styles.symbolTag}>{article.symbol || "N/A"}</span>
                                    <span className={styles.source}>{article.source || "Unknown source"}</span>
                                </div>
                            </div>

                            <h2 className={styles.headline}>{article.headline || "Untitled"}</h2>
                            <p className={styles.summary}>{article.summary || "No summary available."}</p>

                            <div className={styles.metaRow}>
                                <span className={styles.timeStamp}>
                                    <CalendarDays size={14} />
                                    {toReadableDate(Number(article.datetime))}
                                </span>
                                {article.related ? <span className={styles.related}>{article.related}</span> : null}
                            </div>

                            <a className={styles.link} href={article.url} target="_blank" rel="noopener noreferrer">
                                Read original article
                                <ExternalLink size={14} />
                            </a>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

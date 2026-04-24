import React, { useState, useEffect } from "react";
import { api } from "../lib/apiClient";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorBanner } from "./ErrorBanner";
import { Newspaper } from "lucide-react";

export function WatchlistNewsFeed({ symbols }) {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        const fetchNews = async () => {
            if (!symbols || symbols.length === 0) {
                setNews([]);
                return;
            }
            setLoading(true);
            setError("");
            try {
                // Fetch news for the first 3 symbols to avoid rate limits
                const symbolsToFetch = symbols.slice(0, 3);
                
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const fromDate = thirtyDaysAgo.toISOString().split("T")[0];
                const toDate = new Date().toISOString().split("T")[0];

                const promises = symbolsToFetch.map(s => 
                    api.get(`/stocks/company-news?symbol=${s}&from=${fromDate}&to=${toDate}`)
                );
                
                const results = await Promise.all(promises);
                let allNews = [];
                results.forEach((res, i) => {
                    if (res && res.items) {
                        const items = res.items.slice(0, 3).map(item => ({ ...item, symbol: symbolsToFetch[i] }));
                        allNews = [...allNews, ...items];
                    }
                });

                allNews.sort((a, b) => b.datetime - a.datetime);
                if (mounted) setNews(allNews);
            } catch (err) {
                if (mounted) setError(err.message || "Failed to load news");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchNews();
        return () => { mounted = false; };
    }, [symbols]);

    if (!symbols || symbols.length === 0) return null;
    if (loading && news.length === 0) return <LoadingSpinner />;
    if (error && news.length === 0) return <ErrorBanner message={error} />;

    return (
        <div style={{ marginTop: "24px", background: "var(--bg-secondary)", borderRadius: "12px", padding: "16px", border: "1px solid var(--glass-border)" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Newspaper size={18} /> Watchlist News
            </h3>
            {news.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No recent news.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {news.map(n => (
                        <a 
                            key={n.id} 
                            href={n.url} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ display: "flex", gap: "12px", textDecoration: "none", color: "inherit", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "8px" }}
                        >
                            <img src={n.image || "https://placehold.co/100x100?text=News"} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }} />
                            <div>
                                <div style={{ fontSize: "0.8rem", color: "var(--accent-blue)", fontWeight: "bold", marginBottom: "4px" }}>
                                    {n.symbol} &bull; {new Date(n.datetime * 1000).toLocaleDateString()}
                                </div>
                                <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem" }}>{n.headline}</h4>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                    {n.summary}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

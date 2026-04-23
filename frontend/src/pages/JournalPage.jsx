import React, { useState, useEffect } from "react";
import { BookMarked, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/apiClient";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import styles from "./JournalPage.module.css";

export function JournalPage() {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL"); // ALL, Take Profit, Stop Loss Hit, etc.

    useEffect(() => {
        const fetchJournal = async () => {
            try {
                const res = await api.get('/learn/journal');
                setTrades(res);
            } catch (err) {
                setError("Failed to load journal");
            } finally {
                setLoading(false);
            }
        };
        fetchJournal();
    }, []);

    if (loading) return <div className={styles.centered}><LoadingSpinner /></div>;
    if (error) return <div className={styles.container}><ErrorBanner message={error} /></div>;

    const filteredTrades = filter === "ALL" 
        ? trades 
        : trades.filter(t => t.sellReason && t.sellReason.includes(filter));

    return (
        <div className={styles.container}>
            <div className={styles.topbar}>
                <Link to="/portfolio" className={styles.backLink}>
                    <ArrowLeft size={18} /> Back to Portfolio
                </Link>
            </div>
            
            <div className={styles.header}>
                <BookMarked size={28} color="#3b82f6" />
                <h1>Trade Journal</h1>
            </div>
            <p className={styles.subtitle}>
                Review your past trades and the reasons behind your decisions to refine your strategy.
            </p>

            <div className={styles.filters}>
                {["ALL", "Take Profit", "Stop Loss Hit", "Found Better Opportunity", "Panic", "Other"].map(f => (
                    <button 
                        key={f}
                        className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className={styles.journalList}>
                {filteredTrades.length === 0 ? (
                    <div className={styles.emptyState}>No trades found for this filter.</div>
                ) : (
                    filteredTrades.map(trade => (
                        <div key={trade.id} className={styles.tradeCard}>
                            <div className={styles.tradeHeader}>
                                <h3>{trade.symbol}</h3>
                                <span className={trade.realizedPL >= 0 ? styles.positive : styles.negative}>
                                    {trade.realizedPL >= 0 ? "+" : ""}${trade.realizedPL?.toFixed(2)}
                                </span>
                            </div>
                            <div className={styles.tradeDetails}>
                                <p><strong>Date:</strong> {new Date(trade.createdAt).toLocaleDateString()}</p>
                                <p><strong>Shares:</strong> {trade.shares}</p>
                                <p><strong>Price:</strong> ${trade.price.toFixed(2)}</p>
                            </div>
                            <div className={styles.reasonBox}>
                                <strong>Reason for Selling:</strong>
                                <p>{trade.sellReason || "No reason logged."}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

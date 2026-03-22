import React, { useState, useEffect } from "react";
import { Bell, Trash2, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { api } from "../lib/apiClient";
import { StockSearch } from "../components/StockSearch";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import { EmptyState } from "../components/EmptyState";
import styles from "./AlertsPage.module.css";

export function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Form state
    const [symbol, setSymbol] = useState("");
    const [targetPrice, setTargetPrice] = useState("");
    const [operator, setOperator] = useState("ABOVE");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadAlerts();

        // Also poll status every 30s to see if any triggered
        const interval = setInterval(loadAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadAlerts = async () => {
        try {
            const data = await api.get("/alerts");
            setAlerts(data);
        } catch (err) {
            setError("Failed to load alerts: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!symbol || !targetPrice) return;

        try {
            setIsCreating(true);
            setError("");
            const price = parseFloat(targetPrice);
            const newAlert = await api.post("/alerts", { symbol, targetPrice: price, operator });
            setAlerts([newAlert, ...alerts]);

            // Reset form
            setSymbol("");
            setTargetPrice("");
            setOperator("ABOVE");
        } catch (err) {
            setError(err.message || "Failed to create alert");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/alerts/${id}`);
            setAlerts(alerts.filter((a) => a.id !== id));
        } catch (err) {
            setError(err.message || "Failed to delete alert");
        }
    };

    if (loading && alerts.length === 0) return <LoadingSpinner />;

    return (
        <div className={styles.container}>
            {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Price Alerts</h1>
                <p className={styles.pageSubtitle}>Get notified when stocks hit your target prices</p>
            </header>

            <div className={styles.layout}>
                {/* Create Alert Form */}
                <div className={styles.formSection}>
                    <div className={`${styles.card} glass`}>
                        <h2>Create Alert</h2>
                        <form onSubmit={handleCreate} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Symbol</label>
                                <StockSearch
                                    placeholder="Search symbols"
                                    value={symbol}
                                    onChange={(s) => setSymbol(s)}
                                    onSelect={(s) => setSymbol(s)}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Condition</label>
                                    <div className={styles.operatorToggle}>
                                        <button
                                            type="button"
                                            className={`${styles.opBtn} ${operator === "ABOVE" ? styles.opActive : ""}`}
                                            onClick={() => setOperator("ABOVE")}
                                        >
                                            <TrendingUp size={16} /> Above
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.opBtn} ${operator === "BELOW" ? styles.opActive : ""}`}
                                            onClick={() => setOperator("BELOW")}
                                        >
                                            <TrendingDown size={16} /> Below
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Target Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={targetPrice}
                                        onChange={(e) => setTargetPrice(e.target.value)}
                                        className={styles.input}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={!symbol || !targetPrice || isCreating}
                            >
                                {isCreating ? <LoadingSpinner /> : "Set Alert"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Active Alerts List */}
                <div className={styles.listSection}>
                    <div className={`${styles.card} glass`}>
                        <div className={styles.listHeader}>
                            <h2>Your Alerts ({alerts.length})</h2>
                        </div>

                        <div className={styles.alertsList}>
                            {alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <div key={alert.id} className={styles.alertItem}>
                                        <div className={styles.alertInfo}>
                                            <div className={styles.alertMain}>
                                                <span className={styles.symbol}>{alert.symbol}</span>
                                                <ArrowRight size={14} className={styles.arrowIcon} />
                                                <span className={styles.condition}>
                                                    {alert.operator === "ABOVE" ? "≥" : "≤"} $
                                                    {alert.targetPrice.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className={styles.alertMeta}>
                                                <span>Created {new Date(alert.createdAt).toLocaleDateString()}</span>
                                                <span
                                                    className={`${styles.statusBadge} ${alert.status === "TRIGGERED" ? styles.statusTriggered : styles.statusPending}`}
                                                >
                                                    {alert.status}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(alert.id)}
                                            title="Delete Alert"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <EmptyState
                                    icon={Bell}
                                    title="No alerts set"
                                    description="Create your first price alert to get notified when stocks reach your target prices."
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/apiClient";
import { StockSearch } from "../components/StockSearch";
import { Modal } from "../components/Modal";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import { useCurrency } from "../hooks/useCurrency";
import styles from "./TradePage.module.css";

export function TradePage() {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [currentPrice, setCurrentPrice] = useState(null);
    const [portfolio, setPortfolio] = useState(null);
    const [shares, setShares] = useState("1");
    const [side, setSide] = useState("BUY");
    const [loading, setLoading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isTrading, setIsTrading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const data = await api.get("/portfolio");
                setPortfolio(data);
            } catch (err) {
                console.error("Failed to load portfolio", err);
            }
        };
        fetchPortfolio();
    }, []);

    useEffect(() => {
        if (!selectedSymbol) {
            setCurrentPrice(null);
            return;
        }

        const fetchPrice = async () => {
            try {
                setLoading(true);
                const data = await api.get(`/stocks/${selectedSymbol}`);
                setCurrentPrice(data.current.price);
                setLoading(false);
            } catch (err) {
                setError(err.message || "Failed to fetch top price");
                setLoading(false);
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 30000);
        return () => clearInterval(interval);
    }, [selectedSymbol]);

    const handlePreSubmit = (e) => {
        e.preventDefault();
        const parsedShares = parseFloat(shares);
        if (!selectedSymbol || !currentPrice || isNaN(parsedShares) || parsedShares <= 0) return;
        setIsConfirming(true);
    };

    const executeTrade = async () => {
        try {
            setIsTrading(true);
            setError("");
            const endpoint = side === "BUY" ? "/portfolio/buy" : "/portfolio/sell";
            await api.post(endpoint, {
                symbol: selectedSymbol,
                shares: parseFloat(shares),
            });
            setIsConfirming(false);
            navigate("/portfolio");
        } catch (err) {
            setError(err.message || "Trade failed");
            setIsConfirming(false);
        } finally {
            setIsTrading(false);
        }
    };

    // Calculate maximum tradeable based on side
    const maxAffordable = portfolio && currentPrice ? portfolio.cash / currentPrice : 0;
    const ownedPos = portfolio?.positions.find((p) => p.symbol === selectedSymbol);
    const maxSellable = ownedPos ? ownedPos.shares : 0;

    const parsedShares = parseFloat(shares);
    const safeShares = isNaN(parsedShares) ? 0 : parsedShares;
    const estimatedTotal = currentPrice ? currentPrice * safeShares : 0;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Trade Stocks</h1>
            </header>

            <div className={styles.content}>
                <div className={`${styles.card} glass`}>
                    {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

                    <form onSubmit={handlePreSubmit} className={styles.tradeForm}>
                        <div className={styles.searchSection}>
                            <label>Select Stock</label>
                            <StockSearch
                                placeholder="Search symbols (e.g., AAPL)"
                                onSelect={(s) => setSelectedSymbol(s)}
                                autoFocus={true}
                            />
                        </div>

                        {selectedSymbol && currentPrice && (
                            <div className={styles.priceDisplay}>
                                <span className={styles.symbolBadge}>{selectedSymbol}</span>
                                <span className={styles.currentPrice}>{formatCurrency(currentPrice)}</span>
                            </div>
                        )}

                        <div className={styles.sideToggle}>
                            <button
                                type="button"
                                className={`${styles.toggleBtn} ${side === "BUY" ? styles.activeBuy : ""}`}
                                onClick={() => setSide("BUY")}
                            >
                                Buy
                            </button>
                            <button
                                type="button"
                                className={`${styles.toggleBtn} ${side === "SELL" ? styles.activeSell : ""}`}
                                onClick={() => setSide("SELL")}
                            >
                                Sell
                            </button>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Shares</label>
                            <input
                                type="number"
                                min="0.0001"
                                step="any"
                                value={shares}
                                onChange={(e) => setShares(e.target.value)}
                                className={styles.input}
                                required
                            />
                            <div className={styles.helperText}>
                                {side === "BUY"
                                    ? `Buying Power: ${formatCurrency(portfolio?.cash || 0)}`
                                    : `Available to sell: ${maxSellable} shares`}
                                {side === "BUY" && maxAffordable > 0 && (
                                    <span className={styles.maxBtn} onClick={() => setShares(maxAffordable.toString())}>
                                        Max: {maxAffordable}
                                    </span>
                                )}
                                {side === "SELL" && maxSellable > 0 && (
                                    <span className={styles.maxBtn} onClick={() => setShares(maxSellable.toString())}>
                                        Max: {maxSellable}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={styles.orderSummary}>
                            <div className={styles.summaryRow}>
                                <span>Estimated Total</span>
                                <span className={styles.estimatedTotal}>{formatCurrency(estimatedTotal)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`${styles.submitBtn} ${side === "BUY" ? styles.btnBuy : styles.btnSell}`}
                            disabled={!selectedSymbol || loading || !shares || safeShares < 0.0001}
                        >
                            {loading ? <LoadingSpinner /> : `Review Order`}
                        </button>
                    </form>
                </div>
            </div>

            <Modal
                isOpen={isConfirming}
                onClose={() => setIsConfirming(false)}
                title="Confirm Trade"
                footer={
                    <>
                        <button className={styles.cancelBtn} onClick={() => setIsConfirming(false)}>
                            Cancel
                        </button>
                        <button
                            className={`${styles.confirmBtn} ${side === "BUY" ? styles.btnBuy : styles.btnSell}`}
                            onClick={executeTrade}
                            disabled={isTrading}
                        >
                            {isTrading ? <LoadingSpinner /> : `Confirm ${side}`}
                        </button>
                    </>
                }
            >
                <div className={styles.confirmationContent}>
                    <p>
                        You are about to <strong>{side}</strong>:
                    </p>
                    <div className={styles.confirmDetails}>
                        <div className={styles.confirmItem}>
                            <span>Shares</span>
                            <span className={styles.confirmHighlight}>{safeShares}</span>
                        </div>
                        <div className={styles.confirmItem}>
                            <span>Symbol</span>
                            <span className={styles.confirmHighlight}>{selectedSymbol}</span>
                        </div>
                        <div className={styles.confirmItem}>
                            <span>Current Price</span>
                            <span>{formatCurrency(currentPrice || 0)}</span>
                        </div>
                    </div>
                    <div className={styles.confirmTotal}>
                        <span>Estimated Total</span>
                        <span>{formatCurrency(estimatedTotal)}</span>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

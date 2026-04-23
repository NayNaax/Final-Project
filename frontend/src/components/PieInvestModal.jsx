import React, { useState, useEffect } from "react";
import { X, DollarSign, PieChart as PieChartIcon, Loader } from "lucide-react";
import { api } from "../lib/apiClient";
import styles from "./PieInvestModal.module.css";

export function PieInvestModal({ portfolio, onClose, onSuccess }) {
    const [amount, setAmount] = useState("");
    const [allocations, setAllocations] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Initialize allocations evenly
    useEffect(() => {
        if (!portfolio || !portfolio.positions || portfolio.positions.length === 0) return;

        const count = portfolio.positions.length;
        const avg = Math.floor(100 / count);
        const remainder = 100 - avg * count;

        const initialAllocs = {};
        portfolio.positions.forEach((pos, idx) => {
            initialAllocs[pos.symbol] = idx === 0 ? avg + remainder : avg;
        });

        setAllocations(initialAllocs);
    }, [portfolio]);

    if (!portfolio) return null;

    const availableCash = portfolio.cash;
    const numAmount = parseFloat(amount);
    const totalPct = Object.values(allocations).reduce((sum, val) => sum + val, 0);

    const handleAllocationChange = (symbol, value) => {
        let numericValue = parseInt(value, 10);
        if (isNaN(numericValue)) numericValue = 0;
        if (numericValue < 0) numericValue = 0;
        if (numericValue > 100) numericValue = 100;

        setAllocations((prev) => ({
            ...prev,
            [symbol]: numericValue,
        }));
        setError("");
    };

    const handleSubmit = async () => {
        setError("");
        
        if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
            setError("Please enter a valid investment amount.");
            return;
        }

        if (numAmount > availableCash) {
            setError("Investment amount exceeds available cash.");
            return;
        }

        if (totalPct !== 100) {
            setError(`Allocations must sum to exactly 100%. Current sum is ${totalPct}%.`);
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("/portfolio/pie-invest", {
                amount: numAmount,
                allocations,
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || "Failed to execute pie investment.");
            setIsSubmitting(false);
        }
    };

    const isSumValid = totalPct === 100;
    const isReady = isSumValid && numAmount > 0 && numAmount <= availableCash && !isSubmitting;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <PieChartIcon className={styles.titleIcon} size={24} />
                        Pie Invest
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.inputGroup}>
                        <div className={styles.label}>
                            <span>Total Investment Amount</span>
                            <span className={styles.cashBalance}>
                                Available: ${availableCash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className={styles.inputWrapper}>
                            <DollarSign className={styles.inputIcon} size={18} />
                            <input
                                type="number"
                                className={styles.amountInput}
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setError("");
                                }}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className={styles.allocationsSection}>
                        <div className={styles.allocationHeader}>
                            <span>Set Allocations</span>
                            <span className={`${styles.totalPercent} ${!isSumValid ? styles.error : ""}`}>
                                Total: {totalPct}% {totalPct !== 100 && "(Must be 100%)"}
                            </span>
                        </div>

                        {portfolio.positions.map((pos) => {
                            const pct = allocations[pos.symbol] || 0;
                            const projected = (numAmount > 0 && !isNaN(numAmount)) ? (numAmount * (pct / 100)) : 0;
                            
                            return (
                                <div key={pos.symbol} className={styles.stockRow}>
                                    <div className={styles.stockInfo}>
                                        <span className={styles.stockSymbol}>{pos.symbol}</span>
                                        <span className={styles.projectedAmount}>
                                            ${projected.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className={styles.sliderContainer}>
                                        <input
                                            type="range"
                                            className={styles.slider}
                                            min="0"
                                            max="100"
                                            value={pct}
                                            onChange={(e) => handleAllocationChange(pos.symbol, e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.pctInputWrapper}>
                                        <input
                                            type="number"
                                            className={styles.pctInput}
                                            value={pct}
                                            onChange={(e) => handleAllocationChange(pos.symbol, e.target.value)}
                                            min="0"
                                            max="100"
                                        />
                                        <span className={styles.pctSymbol}>%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.footer}>
                    {error && <div className={styles.errorBanner}>{error}</div>}
                    
                    <button
                        className={styles.submitBtn}
                        disabled={!isReady}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? (
                            <Loader size={20} className="animate-spin" />
                        ) : (
                            "Invest in Pie"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

import React from "react";
import styles from "./StockPriceBadge.module.css";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "../hooks/useCurrency";

export function StockPriceBadge({ symbol, price, changePercent, className = "" }) {
    const { formatCurrency } = useCurrency();
    const isPositive = changePercent >= 0;

    return (
        <div className={`${styles.badge} ${className}`}>
            <span className={styles.symbol}>{symbol}</span>
            {price !== undefined && price !== null && <span className={styles.price}>{formatCurrency(price)}</span>}
            {changePercent !== undefined && changePercent !== null && (
                <span className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(changePercent).toFixed(2)}%
                </span>
            )}
        </div>
    );
}

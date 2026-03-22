import React from "react";
import styles from "./StockPriceBadge.module.css";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StockPriceBadge({ symbol, price, changePercent, className = "" }) {
    const isPositive = changePercent >= 0;

    return (
        <div className={`${styles.badge} ${className}`}>
            <span className={styles.symbol}>{symbol}</span>
            {price !== undefined && price !== null && (
                <span className={styles.price}>
                    ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            )}
            {changePercent !== undefined && changePercent !== null && (
                <span className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(changePercent).toFixed(2)}%
                </span>
            )}
        </div>
    );
}

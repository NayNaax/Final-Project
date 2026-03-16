import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./ErrorBanner.module.css";

/**
 * ErrorBanner
 *
 * Displays a dismissable error message banner.
 * Auto-closes after 6 seconds unless dismissed manually.
 */

export function ErrorBanner({ message, onDismiss, autoClose = true }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!autoClose) return;

        const timer = setTimeout(() => {
            setIsVisible(false);
            onDismiss?.();
        }, 6000);

        return () => clearTimeout(timer);
    }, [autoClose, onDismiss]);

    if (!isVisible || !message) return null;

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    return (
        <div className={styles.errorBanner}>
            <div className={styles.content}>
                <span className={styles.icon}>⚠</span>
                <p className={styles.message}>{message}</p>
            </div>
            <button className={styles.closeBtn} onClick={handleDismiss}>
                <X size={18} />
            </button>
        </div>
    );
}

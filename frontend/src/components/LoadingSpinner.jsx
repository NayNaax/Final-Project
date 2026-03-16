import React from "react";
import styles from "./LoadingSpinner.module.css";

/**
 * LoadingSpinner
 *
 * Displays a full-page loading indicator with spinner animation.
 * Can be inline or full-screen depending on display context.
 */

export function LoadingSpinner({ inline = false }) {
    if (inline) {
        return (
            <div className={styles.inlineSpinner}>
                <div className={styles.spinner} />
            </div>
        );
    }

    return (
        <div className={styles.fullPageSpinner}>
            <div className={styles.spinner} />
        </div>
    );
}

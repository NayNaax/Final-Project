import React from "react";
import styles from "./PlaceholderPage.module.css";

/**
 * Placeholder pages for features to be implemented
 */

export function PlaceholderPage({ title, description }) {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
        </div>
    );
}
export function TradePage() {
    return <PlaceholderPage title="Trade" description="Phase 4: Trading interface coming soon" />;
}

export function BudgetPage() {
    return <PlaceholderPage title="Budget" description="Phase 7: Budget tracking coming soon" />;
}

export function LeaderboardPage() {
    return <PlaceholderPage title="Leaderboard" description="Phase 8: Leaderboard coming soon" />;
}

export function SettingsPage() {
    return <PlaceholderPage title="Settings" description="Phase 8: Settings and preferences coming soon" />;
}

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

export function PortfolioPage() {
    return <PlaceholderPage title="Portfolio" description="Phase 4: Portfolio management coming soon" />;
}

export function TradePage() {
    return <PlaceholderPage title="Trade" description="Phase 4: Trading interface coming soon" />;
}

export function WatchlistsPage() {
    return <PlaceholderPage title="Watchlists" description="Phase 5: Watchlist management coming soon" />;
}

export function AlertsPage() {
    return <PlaceholderPage title="Alerts" description="Phase 6: Price alerts coming soon" />;
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

export function StockDetailPage() {
    return <PlaceholderPage title="Stock Detail" description="Phase 3: Stock detail page coming soon" />;
}

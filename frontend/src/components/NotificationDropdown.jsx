import React from "react";
import styles from "./NotificationDropdown.module.css";

export function NotificationDropdown({ notifications, onClose, onMarkAllRead }) {
    return (
        <div className={styles.dropdown}>
            <div className={styles.header}>
                <h3>Notifications</h3>
                <button onClick={onClose} className={styles.closeBtn}>
                    ×
                </button>
            </div>

            <div className={styles.content}>
                {notifications.length === 0 ? (
                    <div className={styles.emptyState}>No new notifications</div>
                ) : (
                    <ul className={styles.list}>
                        {notifications.map((notif) => (
                            <li key={notif.id} className={styles.item}>
                                <div className={styles.icon}>🔔</div>
                                <div className={styles.info}>
                                    <p className={styles.message}>
                                        {notif.symbol} crossed {notif.type === "ABOVE" ? "above" : "below"} $
                                        {notif.price}
                                    </p>
                                    <span className={styles.timestamp}>
                                        {new Date(notif.triggeredAt).toLocaleString()}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {notifications.length > 0 && (
                <div className={styles.footer}>
                    <button className={styles.markReadBtn} onClick={onMarkAllRead}>
                        Mark all read
                    </button>
                    <button className={styles.viewAllBtn} onClick={() => (window.location.href = "/alerts")}>
                        View all
                    </button>
                </div>
            )}
        </div>
    );
}

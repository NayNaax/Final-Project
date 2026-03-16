import React from "react";
import styles from "./EmptyState.module.css";

export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className={`${styles.container} glass`}>
            {Icon && (
                <div className={styles.iconWrapper}>
                    <Icon size={48} />
                </div>
            )}
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            {action && <div className={styles.actionWrapper}>{action}</div>}
        </div>
    );
}

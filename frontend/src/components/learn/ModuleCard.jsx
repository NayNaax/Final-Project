import React from "react";
import { Lock, Unlock, CheckCircle } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import styles from "./ModuleCard.module.css";

export function ModuleCard({ module, isLocked, progressPercent, onClick }) {
    return (
        <div className={`${styles.card} ${isLocked ? styles.locked : ""}`} onClick={isLocked ? undefined : onClick}>
            <div className={styles.header}>
                <div className={styles.iconContainer}>
                    {isLocked ? (
                        <Lock size={20} color="var(--text-muted)" />
                    ) : progressPercent === 100 ? (
                        <CheckCircle size={20} color="#10b981" />
                    ) : (
                        <Unlock size={20} color="#3b82f6" />
                    )}
                </div>
                {isLocked && <span className={styles.lockedText}>LOCKED</span>}
            </div>

            <h3 className={styles.title}>{module.title}</h3>

            <div className={styles.footer}>
                <div className={styles.progressContainer}>
                    <ProgressRing
                        radius={20}
                        stroke={4}
                        progress={progressPercent || 0}
                        color={progressPercent === 100 ? "#10b981" : "#3b82f6"}
                    />
                    <span className={styles.progressText}>{Math.round(progressPercent || 0)}%</span>
                </div>
                <p className={styles.lessonCount}>{module.lessons.length} Lessons</p>
            </div>
        </div>
    );
}

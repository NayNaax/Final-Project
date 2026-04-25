import React, { useState, useEffect } from "react";
import { Target, CheckCircle } from "lucide-react";
import { api } from "../../lib/apiClient";
import missionsData from "../../data/missions.json";
import styles from "./MissionTracker.module.css";

export function MissionTracker() {
    const [userMissions, setUserMissions] = useState(null);

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const res = await api.get("/learn/missions");
                setUserMissions(res);
            } catch (err) {
                console.error("Failed to load missions:", err);
            }
        };
        fetchMissions();
    }, []);

    if (!userMissions) return null; // Loading gracefully

    // Map JSON missions with DB progress
    const activeMissions = missionsData.map((mission) => {
        const dbContext = userMissions.find((m) => m.missionId === mission.id);
        return {
            ...mission,
            completed: dbContext ? dbContext.completed : false,
        };
    });

    const completionCount = activeMissions.filter((m) => m.completed).length;

    return (
        <div className={styles.trackerCard}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <Target size={20} color="#3b82f6" />
                    <h3>Sandbox Missions</h3>
                </div>
                <span className={styles.progressText}>
                    {completionCount}/{activeMissions.length}
                </span>
            </div>

            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${(completionCount / activeMissions.length) * 100}%` }}
                ></div>
            </div>

            <div className={styles.missionList}>
                {activeMissions.map((mission) => (
                    <div
                        key={mission.id}
                        className={`${styles.missionItem} ${mission.completed ? styles.completed : ""}`}
                    >
                        {mission.completed ? (
                            <CheckCircle size={18} color="#10b981" className={styles.icon} />
                        ) : (
                            <div className={styles.pendingCircle}></div>
                        )}
                        <div className={styles.missionDetails}>
                            <h4>{mission.title}</h4>
                            <p>{mission.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

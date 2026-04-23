import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, PlayCircle, CheckCircle } from "lucide-react";
import { api } from "../lib/apiClient";
import { ModuleCard } from "../components/learn/ModuleCard";
import { MissionTracker } from "../components/learn/MissionTracker";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import module1 from "../data/lessons/module1.json";
import module2 from "../data/lessons/module2.json";
import module3 from "../data/lessons/module3.json";
import module4 from "../data/lessons/module4.json";
import styles from "./LearnPage.module.css";

const MODULES = [module1, module2, module3, module4];

export function LearnPage() {
    const navigate = useNavigate();
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedModule, setSelectedModule] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get("/learn/progress");
                setProgressData(res.lessons || []);
            } catch (err) {
                setError("Failed to load progress.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading)
        return (
            <div className={styles.centered}>
                <LoadingSpinner />
            </div>
        );
    if (error)
        return (
            <div className={styles.container}>
                <ErrorBanner message={error} />
            </div>
        );

    const getModuleProgress = (mod) => {
        const lessonIds = mod.lessons.map((l) => l.id);
        const completedCount = lessonIds.filter((id) =>
            progressData.find((p) => p.lessonId === id && p.completed),
        ).length;

        return {
            count: completedCount,
            total: lessonIds.length,
            percent: (completedCount / lessonIds.length) * 100,
        };
    };

    const isLessonCompleted = (id) => {
        return !!progressData.find((p) => p.lessonId === id && p.completed);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <BookOpen size={28} color="#3b82f6" />
                <h1>Learning Hub</h1>
            </div>

            <p className={styles.subtitle}>
                Master the markets step by step. Complete lessons to unlock new modules and earn virtual cash for your
                sandbox portfolio!
            </p>

            <div className={styles.layout}>
                <div className={styles.mainContent}>
                    {selectedModule ? (
                        <div className={styles.lessonListContainer}>
                            <button className={styles.backBtn} onClick={() => setSelectedModule(null)}>
                                <ArrowLeft size={18} /> Back to Modules
                            </button>
                            <h2>{selectedModule.title}</h2>

                            <div className={styles.lessonList}>
                                {selectedModule.lessons.map((lesson, idx) => {
                                    const completed = isLessonCompleted(lesson.id);
                                    // Lock if previous isn't completed (except first lesson)
                                    let locked = false;
                                    if (idx > 0 && !isLessonCompleted(selectedModule.lessons[idx - 1].id)) {
                                        locked = true;
                                    }

                                    return (
                                        <div
                                            key={lesson.id}
                                            className={`${styles.lessonRow} ${locked ? styles.lockedRow : ""}`}
                                            onClick={() => {
                                                if (!locked) navigate(`/learn/${lesson.id}`);
                                            }}
                                        >
                                            <div className={styles.lessonInfo}>
                                                <span className={styles.lessonNum}>{idx + 1}</span>
                                                <span className={styles.lessonTitle}>{lesson.title}</span>
                                            </div>
                                            <div className={styles.lessonStatus}>
                                                {completed ? (
                                                    <CheckCircle color="#10b981" />
                                                ) : locked ? (
                                                    <span className={styles.lockText}>LOCKED</span>
                                                ) : (
                                                    <PlayCircle color="#3b82f6" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.moduleGrid}>
                            {MODULES.map((mod, index) => {
                                const modProgress = getModuleProgress(mod);
                                let isLocked = false;
                                // Unlock module 1 by default. Unlock next if previous is >= 80% completed
                                if (index > 0) {
                                    const prevModProgress = getModuleProgress(MODULES[index - 1]);
                                    if (prevModProgress.percent < 80) isLocked = true;
                                }

                                return (
                                    <ModuleCard
                                        key={mod.id}
                                        module={mod}
                                        isLocked={isLocked}
                                        progressPercent={modProgress.percent}
                                        onClick={() => setSelectedModule(mod)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={styles.sidebarContent}>
                    <MissionTracker />
                </div>
            </div>
        </div>
    );
}

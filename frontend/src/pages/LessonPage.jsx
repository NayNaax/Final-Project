import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { api } from "../lib/apiClient";
import { QuizSection } from "../components/learn/QuizSection";
import { GlossaryTerm } from "../components/learn/GlossaryTerm";
import glossaryData from "../data/glossary.json";
import module1 from "../data/lessons/module1.json";
import module2 from "../data/lessons/module2.json";
import module3 from "../data/lessons/module3.json";
import module4 from "../data/lessons/module4.json";
import styles from "./LessonPage.module.css";

const ALL_MODULES = [module1, module2, module3, module4];

class LessonQuizBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error("Quiz section render error:", error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.quizFallback} role="alert">
                    <h3>Quiz Temporarily Unavailable</h3>
                    <p>
                        This lesson content is still available, but the quiz failed to load. Please return to the
                        Learning Hub and reopen the lesson.
                    </p>
                    <button className={styles.fallbackButton} onClick={this.props.onBackToHub}>
                        Back to Learning Hub
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

class LessonContentBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error("Lesson content render error:", error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.lessonFallback} role="alert">
                    <h3>Lesson Unavailable</h3>
                    <p>
                        We hit a rendering issue while opening this lesson. Please return to the Learning Hub and reopen
                        it.
                    </p>
                    <button className={styles.fallbackButton} onClick={this.props.onBackToHub}>
                        Back to Learning Hub
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export function LessonPage() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [progressData, setProgressData] = useState([]);

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const res = await api.get("/learn/progress");
                setProgressData(res.lessons || []);
            } catch (err) {
                console.error(err);
            }
        };
        loadProgress();
    }, []);

    const lessonInfo = useMemo(() => {
        for (const mod of ALL_MODULES) {
            const less = mod.lessons.find((l) => l.id === lessonId);
            if (less) return { module: mod, lesson: less };
        }
        return null;
    }, [lessonId]);

    if (!lessonInfo) return <div className={styles.centered}>Lesson not found</div>;

    const { lesson, module } = lessonInfo;
    const lessonProgress = progressData.find((p) => p.lessonId === lesson.id) || null;
    const isCompleted = Boolean(lessonProgress?.completed);
    const completedScore = Number.isFinite(lessonProgress?.quizScore) ? lessonProgress.quizScore : null;

    const renderMarkdown = (text) => {
        const blocks = text.split("\n\n");

        const replaceGlossary = (str) => {
            let result = [str];
            Object.keys(glossaryData).forEach((term) => {
                const regex = new RegExp(`\\b(${term})\\b`, "gi");
                result = result.flatMap((part) => {
                    if (typeof part !== "string") return part;
                    const splits = part.split(regex);
                    return splits.map((s, i) => {
                        if (s.toLowerCase() === term.toLowerCase()) {
                            return (
                                <GlossaryTerm key={`${term}-${i}`} term={term}>
                                    {s}
                                </GlossaryTerm>
                            );
                        }
                        return s;
                    });
                });
            });
            return result;
        };

        return blocks.map((block, idx) => {
            if (block.startsWith("###")) {
                return <h3 key={idx}>{block.replace("###", "").trim()}</h3>;
            }
            if (block.startsWith("##")) {
                return <h2 key={idx}>{block.replace("##", "").trim()}</h2>;
            }
            if (block.startsWith("- ")) {
                const items = block.split("\n").map((l) => l.replace("- ", "").trim());
                return (
                    <ul key={idx} className={styles.list}>
                        {items.map((item, i) => (
                            <li key={i}>{replaceGlossary(item)}</li>
                        ))}
                    </ul>
                );
            }

            // Handle bold text formatting
            const boldParsed = block.split(/(\*\*.*?\*\*)/g).map((chunk, i) => {
                if (chunk.startsWith("**") && chunk.endsWith("**")) {
                    return <strong key={i}>{replaceGlossary(chunk.slice(2, -2))}</strong>;
                }
                return replaceGlossary(chunk);
            });

            return <p key={idx}>{boldParsed}</p>;
        });
    };

    const nextLessonId = useMemo(() => {
        if (!lessonInfo) return null;
        const { module, lesson } = lessonInfo;
        const currentIdx = module.lessons.findIndex((l) => l.id === lesson.id);

        if (currentIdx < module.lessons.length - 1) {
            return module.lessons[currentIdx + 1].id;
        }

        // Try next module
        const modIdx = ALL_MODULES.findIndex((m) => m.id === module.id);
        if (modIdx < ALL_MODULES.length - 1) {
            return ALL_MODULES[modIdx + 1].lessons[0].id;
        }

        return null;
    }, [lessonInfo]);

    return (
        <div className={styles.container}>
            <div className={styles.topbar}>
                <Link to="/learn" className={styles.backLink}>
                    <ArrowLeft size={18} /> Lesson List
                </Link>
                <div className={styles.moduleBadge}>{module.title}</div>
            </div>

            <div className={styles.contentWrapper}>
                <LessonContentBoundary key={lesson.id} onBackToHub={() => navigate("/learn")}>
                    <div className={styles.lessonHeader}>
                        <BookOpen size={32} color="#3b82f6" />
                        <h1>{lesson.title}</h1>
                    </div>

                    <div className={styles.lessonBody}>{renderMarkdown(lesson.content)}</div>

                    <LessonQuizBoundary onBackToHub={() => navigate("/learn")}>
                        <QuizSection
                            lessonId={lesson.id}
                            quiz={lesson.quiz}
                            isCompleted={isCompleted}
                            completedScore={completedScore}
                            nextLessonId={nextLessonId}
                            onCompleted={() => {
                                api.get("/learn/progress").then((res) => setProgressData(res.lessons || []));
                            }}
                        />
                    </LessonQuizBoundary>
                </LessonContentBoundary>
            </div>
        </div>
    );
}

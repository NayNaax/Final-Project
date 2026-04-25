import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle, ChevronRight, Award, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/apiClient";
import styles from "./QuizSection.module.css";

function shuffleArray(array) {
    const next = [...array];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
}

function shuffleQuestionOptions(question) {
    const indexedOptions = question.options.map((option, index) => ({ option, index }));
    let shuffled = shuffleArray(indexedOptions);

    // Ensure options do not stay in their original positions.
    if (shuffled.length > 1 && shuffled.every((item, idx) => item.index === idx)) {
        const offset = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
        shuffled = shuffled.map((_, idx) => indexedOptions[(idx + offset) % indexedOptions.length]);
    }

    const remappedCorrectIndex = shuffled.findIndex((item) => item.index === question.correctIndex);

    return {
        ...question,
        options: shuffled.map((item) => item.option),
        correctIndex: remappedCorrectIndex,
    };
}

export function QuizSection({ lessonId, quiz, isCompleted, completedScore, onCompleted, nextLessonId }) {
    const navigate = useNavigate();
    const totalQuestions = Array.isArray(quiz) ? quiz.length : 0;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [earnedCash, setEarnedCash] = useState(0);
    const [score, setScore] = useState(0);
    const [hasPassed, setHasPassed] = useState(false);
    const [attemptVersion, setAttemptVersion] = useState(0);

    const clampScore = (value) => {
        if (!Number.isFinite(value)) return 0;
        const normalized = Math.max(0, Math.floor(value));
        if (totalQuestions <= 0) return normalized;
        return Math.min(totalQuestions, normalized);
    };

    const shuffledQuiz = useMemo(() => {
        if (!quiz || quiz.length === 0) return [];
        return quiz.map(shuffleQuestionOptions);
    }, [quiz, lessonId, attemptVersion]);

    useEffect(() => {
        // Reset state when navigating between lessons so stale question indexes
        // cannot reference an undefined question and crash the page.
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsChecking(false);
        setIsCorrect(null);
        setShowExplanation(false);
        setSubmitting(false);
        setEarnedCash(0);
        setScore(clampScore(completedScore));
        setQuizFinished(Boolean(isCompleted));
        setHasPassed(Boolean(isCompleted));
    }, [lessonId, completedScore, isCompleted]);

    useEffect(() => {
        // Keep completion UI in sync without resetting in-progress score state.
        if (isCompleted) {
            setQuizFinished(true);
            setHasPassed(true);
            if (Number.isFinite(completedScore)) {
                setScore(clampScore(completedScore));
            }
        }
    }, [isCompleted, completedScore]);

    // If quiz is empty, skip rendering it
    if (!shuffledQuiz || shuffledQuiz.length === 0) return null;

    const question = shuffledQuiz[currentQuestionIndex] ?? shuffledQuiz[0];

    const handleOptionSelect = (index) => {
        if (isChecking || showExplanation) return;
        setSelectedOption(index);
    };

    const handleCheck = () => {
        if (selectedOption === null) return;
        setIsChecking(true);
        const correct = selectedOption === question.correctIndex;
        setIsCorrect(correct);
        setShowExplanation(true);
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsChecking(false);
        setIsCorrect(null);
        setShowExplanation(false);
        setQuizFinished(false);
        setScore(0);
        setHasPassed(false);
        setAttemptVersion((prev) => prev + 1);
    };

    const handleNext = async () => {
        const updatedScore = clampScore(score + (isCorrect ? 1 : 0));

        if (currentQuestionIndex < shuffledQuiz.length - 1) {
            setScore(updatedScore);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsChecking(false);
            setIsCorrect(null);
            setShowExplanation(false);
        } else {
            setQuizFinished(true);
            const finalScore = updatedScore;
            setScore(finalScore);
            // E.g. Require 60% to pass
            const passedCheck = finalScore / shuffledQuiz.length >= 0.6;
            setHasPassed(passedCheck);

            if (!isCompleted && passedCheck) {
                setSubmitting(true);
                try {
                    const res = await api.post(`/learn/quiz/${lessonId}/submit`, {
                        passed: true,
                        score: finalScore,
                    });
                    if (res.rewardGiven) {
                        setEarnedCash(500); // hardcoding what we grant
                    }
                    if (onCompleted) onCompleted();
                } catch (error) {
                    console.error("Failed to submit quiz progress:", error);
                } finally {
                    setSubmitting(false);
                }
            } else if (passedCheck) {
                if (onCompleted) onCompleted();
            }
        }
    };

    if (quizFinished) {
        const displayScore = clampScore(score);

        if (hasPassed) {
            return (
                <div className={styles.quizCompleted}>
                    <div className={styles.awardIcon}>
                        <Award size={48} color="#10b981" />
                    </div>
                    <h3>Quiz Completed!</h3>
                    <p>
                        You have successfully passed this lesson's knowledge check with {displayScore}/
                        {shuffledQuiz.length} correct.
                    </p>
                    {earnedCash > 0 && (
                        <div className={styles.rewardBox}>
                            <span className={styles.rewardText}>+${earnedCash} virtual cash earned!</span>
                        </div>
                    )}

                    <div className={styles.completionActions}>
                        <button className={styles.backToHubBtn} onClick={() => navigate("/learn")}>
                            Back to Learning Hub
                        </button>
                        {nextLessonId && (
                            <button className={styles.nextLessonBtn} onClick={() => navigate(`/learn/${nextLessonId}`)}>
                                Next Lesson <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            );
        } else {
            return (
                <div className={styles.quizCompleted}>
                    <div className={styles.awardIcon}>
                        <XCircle size={48} color="#ef4444" />
                    </div>
                    <h3>Keep Learning!</h3>
                    <p>
                        You got {displayScore}/{shuffledQuiz.length} correct. Review the lesson and try again to pass.
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                        <button className={styles.checkButton} onClick={resetQuiz}>
                            Retry Quiz
                        </button>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className={styles.quizWrapper}>
            <div className={styles.header}>
                <span className={styles.badge}>Knowledge Check</span>
                <span className={styles.progress}>
                    Question {currentQuestionIndex + 1} of {shuffledQuiz.length}
                </span>
            </div>

            <h3 className={styles.questionText}>{question.question}</h3>

            <div className={styles.optionsList}>
                {question.options.map((option, idx) => {
                    let optionClass = styles.option;
                    if (selectedOption === idx) optionClass += ` ${styles.selected}`;
                    if (showExplanation) {
                        if (idx === question.correctIndex) optionClass += ` ${styles.correct}`;
                        else if (selectedOption === idx && !isCorrect) optionClass += ` ${styles.incorrect}`;
                        if (idx !== selectedOption && idx !== question.correctIndex) {
                            optionClass += ` ${styles.disabled}`;
                        }
                    }

                    return (
                        <div key={idx} className={optionClass} onClick={() => handleOptionSelect(idx)}>
                            <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                            <span className={styles.optionText}>{option}</span>
                            {showExplanation && idx === question.correctIndex && (
                                <CheckCircle className={styles.statusIcon} color="#10b981" size={20} />
                            )}
                            {showExplanation && selectedOption === idx && !isCorrect && (
                                <XCircle className={styles.statusIcon} color="#ef4444" size={20} />
                            )}
                        </div>
                    );
                })}
            </div>

            {showExplanation && (
                <div
                    className={`${styles.explanation} ${isCorrect ? styles.explanationCorrect : styles.explanationIncorrect}`}
                >
                    <strong>{isCorrect ? "Correct!" : "Not quite."}</strong>{" "}
                    {question.explanation || (isCorrect ? "Great job!" : "That's not the right answer.")}
                </div>
            )}

            <div className={styles.actions}>
                {!showExplanation ? (
                    <button className={styles.checkButton} disabled={selectedOption === null} onClick={handleCheck}>
                        Check Answer
                    </button>
                ) : (
                    <button className={styles.nextButton} onClick={handleNext} disabled={submitting}>
                        {submitting
                            ? "Submitting..."
                            : currentQuestionIndex < shuffledQuiz.length - 1
                              ? "Next Question"
                              : "Finish Quiz"}
                        {!submitting && <ChevronRight size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
}

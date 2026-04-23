import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, ChevronRight, Award, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/apiClient";
import styles from "./QuizSection.module.css";

export function QuizSection({ lessonId, quiz, isCompleted, onCompleted, nextLessonId }) {
    const navigate = useNavigate();
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
        setScore(0);
        setQuizFinished(Boolean(isCompleted));
        setHasPassed(Boolean(isCompleted));
    }, [lessonId, isCompleted]);

    // If quiz is empty, skip rendering it
    if (!quiz || quiz.length === 0) return null;

    const question = quiz[currentQuestionIndex] ?? quiz[0];

    const handleOptionSelect = (index) => {
        if (isChecking || showExplanation) return;
        setSelectedOption(index);
    };

    const handleCheck = () => {
        if (selectedOption === null) return;
        setIsChecking(true);
        const correct = selectedOption === question.correctIndex;
        setIsCorrect(correct);
        if (correct) setScore((prev) => prev + 1);
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
    };

    const handleNext = async () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsChecking(false);
            setIsCorrect(null);
            setShowExplanation(false);
        } else {
            setQuizFinished(true);
            const finalScore = isCorrect ? score + 1 : score;
            // E.g. Require 60% to pass
            const passedCheck = finalScore / quiz.length >= 0.6;
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
        if (hasPassed) {
            return (
                <div className={styles.quizCompleted}>
                    <div className={styles.awardIcon}>
                        <Award size={48} color="#10b981" />
                    </div>
                    <h3>Quiz Completed!</h3>
                    <p>
                        You have successfully passed this lesson's knowledge check with {score}/{quiz.length} correct.
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
                        You got {score}/{quiz.length} correct. Review the lesson and try again to pass.
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
                    Question {currentQuestionIndex + 1} of {quiz.length}
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
                            : currentQuestionIndex < quiz.length - 1
                              ? "Next Question"
                              : "Finish Quiz"}
                        {!submitting && <ChevronRight size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
}

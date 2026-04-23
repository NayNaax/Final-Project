import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { api } from "../../lib/apiClient";
import styles from "./SellReasonModal.module.css";

const REASONS = [
    { id: "TAKE_PROFIT", label: "Take Profit", emoji: "💰" },
    { id: "STOP_LOSS", label: "Stop Loss Hit", emoji: "🛡️" },
    { id: "BETTER_OPPORTUNITY", label: "Found Better Opportunity", emoji: "🔍" },
    { id: "FUNDAMENTAL_CHANGE", label: "Company Fundamentals Changed", emoji: "📉" },
    { id: "TECHNICAL_BREAKDOWN", label: "Technical Breakdown", emoji: "📊" },
    { id: "PANIC", label: "Panic / Emotional Sell", emoji: "😰" },
    { id: "OTHER", label: "Other", emoji: "🗒️" },
];

export function SellReasonModal({ tradeId, symbol, onClose, onSuccess }) {
    const [selectedReason, setSelectedReason] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReason) {
            setError("Please select a reason.");
            return;
        }

        setSubmitting(true);
        setError("");
        try {
            const reasonString = notes.trim().length > 0 ? `${selectedReason}: ${notes}` : selectedReason;

            await api.post(`/learn/journal/reason`, {
                tradeId,
                sellReason: reasonString,
            });
            onSuccess();
        } catch (err) {
            setError(err.message || "Failed to save journal entry.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.header}>
                    <h2>Trade Journal: {symbol}</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <p className={styles.description}>
                    Congratulations on closing your position! Part of becoming a better investor is understanding{" "}
                    <strong>why</strong> you make decisions. Log your reason below:
                </p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.reasonsGrid}>
                        {REASONS.map((reason) => (
                            <div
                                key={reason.id}
                                className={`${styles.reasonCard} ${selectedReason === reason.label ? styles.selected : ""}`}
                                onClick={() => setSelectedReason(reason.label)}
                            >
                                <span className={styles.emoji}>{reason.emoji}</span>
                                <span className={styles.label}>{reason.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.notesGroup}>
                        <label>Additional Notes (Optional)</label>
                        <textarea
                            placeholder="e.g. I meant to hold longer but RSI was over 80..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={styles.skipBtn}>
                            Skip for now
                        </button>
                        <button type="submit" disabled={submitting} className={styles.saveBtn}>
                            {submitting ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save size={18} /> Save Entry
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

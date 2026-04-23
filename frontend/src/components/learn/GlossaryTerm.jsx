import React, { useState } from "react";
import glossary from "../../data/glossary.json";
import styles from "./GlossaryTerm.module.css";

export function GlossaryTerm({ term, children }) {
    const defaultDefinition = glossary[term];
    const [showTooltip, setShowTooltip] = useState(false);

    // Provide a fallback if the term is not in the glossary JSON
    const definition = defaultDefinition || "Definition not found.";

    return (
        <span
            className={styles.termWrapper}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <span className={styles.term}>{children || term}</span>
            {showTooltip && (
                <div className={styles.tooltip}>
                    <strong>{term}</strong>: {definition}
                </div>
            )}
        </span>
    );
}

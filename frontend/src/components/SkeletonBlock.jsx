import React from "react";
import styles from "./SkeletonBlock.module.css";

export function SkeletonBlock({ width, height, borderRadius = "4px", className = "" }) {
    return <div className={`${styles.skeleton} ${className}`} style={{ width, height, borderRadius }} />;
}

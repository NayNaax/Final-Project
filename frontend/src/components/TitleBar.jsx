import React from "react";
import styles from "./TitleBar.module.css";

export function TitleBar() {
    return (
        <div className={styles.titleBar}>
            <div className={styles.dragRegion}>
                <span className={styles.titleText}>FirstFund Finance</span>
            </div>
            {/*
        Windows Control Overlay (WCO) buttons will be placed here by Electron.
        We leave this area empty in our layout.
      */}
            <div className={styles.windowControlsSpace}></div>
        </div>
    );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import styles from './EducationalAlert.module.css';

export function EducationalAlert({ message, linkTo, linkText }) {
    return (
        <div className={styles.alertContainer}>
            <AlertCircle size={20} className={styles.icon} />
            <div className={styles.content}>
                <p className={styles.message}>{message}</p>
                {linkTo && (
                    <Link to={linkTo} className={styles.link}>
                        {linkText} <ArrowRight size={14} />
                    </Link>
                )}
            </div>
        </div>
    );
}

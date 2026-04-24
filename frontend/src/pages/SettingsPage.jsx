import React from "react";
import { Settings, User, Moon, Trash2, LogOut, DollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
    const { user, logout } = useAuth();
    const { settings, loading, error, updateSetting } = useSettings();

    const getDisplayName = (email, username) => {
        return username || email?.split("@")[0] || "N/A";
    };

    const handleThemeToggle = (e) => {
        const isDark = e.target.checked;
        updateSetting("theme", isDark ? "dark" : "light");
    };

    const handleCurrencyChange = (e) => {
        updateSetting("currency", e.target.value);
    };

    if (loading) {
        return <div className={styles.loading}>Loading settings...</div>;
    }

    // Formatting date nicely
    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "Recently";

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Settings</h1>
                <p>Manage your account preferences and application settings.</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {/* Appearance Section */}
            <section className={`glass ${styles.section}`}>
                <h2 className={styles.sectionTitle}>
                    <Moon size={20} />
                    Appearance
                </h2>

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <p className={styles.settingName}>Dark Mode</p>
                        <p className={styles.settingDesc}>Use dark theme for the application interface.</p>
                    </div>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={settings.theme === "dark"} onChange={handleThemeToggle} />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </section>

            {/* Preferences Section */}
            <section className={`glass ${styles.section}`}>
                <h2 className={styles.sectionTitle}>
                    <DollarSign size={20} />
                    Preferences
                </h2>

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <p className={styles.settingName}>Base Currency</p>
                        <p className={styles.settingDesc}>Choose your default currency for portfolio values.</p>
                    </div>
                    <select className={styles.select} value={settings.currency} onChange={handleCurrencyChange}>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                    </select>
                </div>

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <p className={styles.settingName}>Leaderboard Participation</p>
                        <p className={styles.settingDesc}>
                            Allow your username to be visible on the public leaderboard. If disabled, you will appear
                            anonymously.
                        </p>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={settings.leaderboardOptIn}
                            onChange={(e) => updateSetting("leaderboardOptIn", e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </section>

            {/* Account Section */}
            <section className={`glass ${styles.section}`}>
                <h2 className={styles.sectionTitle}>
                    <User size={20} />
                    Account Information
                </h2>

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <p className={styles.settingName}>Username</p>
                        <p className={styles.settingDesc}>{getDisplayName(user?.email, user?.username)}</p>
                    </div>
                </div>

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <p className={styles.settingName}>Member Since</p>
                        <p className={styles.settingDesc}>{joinDate}</p>
                    </div>
                </div>

                <div className={styles.settingRow} style={{ marginTop: "1rem" }}>
                    <button type="button" className={`${styles.button} ${styles.logoutBtn}`} onClick={logout}>
                        <LogOut size={16} />
                        Log Out
                    </button>
                </div>
            </section>

            {/* Danger Zone Section */}
            <section className={`glass ${styles.section}`} style={{ border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                <h2
                    className={styles.sectionTitle}
                    style={{ color: "var(--danger-color)", borderBottomColor: "rgba(239, 68, 68, 0.2)" }}
                >
                    <Settings size={20} />
                    Danger Zone
                </h2>

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <p className={styles.settingName}>Delete Account</p>
                        <p className={styles.settingDesc}>
                            Permanently delete your account and all data. This action cannot be undone.
                        </p>
                    </div>
                    <button
                        type="button"
                        className={`${styles.button} ${styles.dangerBtn}`}
                        disabled
                        title="Feature coming soon"
                    >
                        <Trash2 size={16} />
                        Delete Account
                    </button>
                </div>
            </section>
        </div>
    );
}

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Save, RefreshCw } from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts";
import { api } from "../lib/apiClient";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import styles from "./BudgetPage.module.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

export const BudgetPage = () => {
    const [allocations, setAllocations] = useState([]);
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const [budgetRes, statusRes] = await Promise.all([api.get("/budget"), api.get("/budget/status")]);

            // Format existing allocations or provide empty array
            if (budgetRes && budgetRes.length > 0) {
                setAllocations(budgetRes);
            } else {
                setAllocations([]);
            }

            setStatusData(statusRes);
        } catch (err) {
            setError(err.message || "Failed to load budget data.");
        } finally {
            setLoading(false);
        }
    };

    const handleAllocationChange = (index, field, value) => {
        const newAllocations = [...allocations];
        if (field === "targetPercentage") {
            newAllocations[index][field] = parseFloat(value) || 0;
        } else {
            newAllocations[index][field] = value;
        }
        setAllocations(newAllocations);
    };

    const handleAddCategory = () => {
        const newColor = COLORS[allocations.length % COLORS.length];
        setAllocations([...allocations, { category: "", targetPercentage: 0, color: newColor }]);
        setIsEditing(true);
    };

    const handleRemoveCategory = (index) => {
        const newAllocations = [...allocations];
        newAllocations.splice(index, 1);
        setAllocations(newAllocations);
        setIsEditing(true);
    };

    const handleSave = async () => {
        setError("");

        // Validation
        const total = allocations.reduce((sum, item) => sum + item.targetPercentage, 0);
        if (Math.abs(total - 100) > 0.01 && allocations.length > 0) {
            setError(`Total allocation must equal 100%. Current total: ${total.toFixed(2)}%`);
            return;
        }

        const validCategories = allocations.every((a) => a.category.trim() !== "");
        if (!validCategories) {
            setError("All categories must have a name.");
            return;
        }

        setSaving(true);
        try {
            await api.put("/budget", { allocations });
            setIsEditing(false);
            // Refresh status to reflect new targets
            const statusRes = await api.get("/budget/status");
            setStatusData(statusRes);
        } catch (err) {
            setError(err.message || "Failed to save allocations.");
        } finally {
            setSaving(false);
        }
    };

    const totalPercentage = useMemo(() => {
        return allocations.reduce((sum, item) => sum + item.targetPercentage, 0);
    }, [allocations]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Budget & Allocations</h1>
                <p className={styles.subtitle}>Manage your portfolio target allocations and check for drift.</p>
            </header>

            {error && <ErrorBanner message={error} onClose={() => setError("")} />}

            <div className={styles.grid}>
                {/* Allocation Editor */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Target Allocation</h2>
                        {!isEditing && allocations.length > 0 ? (
                            <button className={styles.actionBtn} onClick={() => setIsEditing(true)}>
                                Edit
                            </button>
                        ) : (
                            <button className={styles.actionBtnPrimary} onClick={handleSave} disabled={saving}>
                                {saving ? <RefreshCw className={styles.spinIcon} size={16} /> : <Save size={16} />}
                                Save
                            </button>
                        )}
                    </div>

                    <div className={styles.donutchartContainer}>
                        {allocations.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={allocations}
                                        dataKey="targetPercentage"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                    >
                                        {allocations.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color || COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={styles.emptyChart}>No targets set yet.</div>
                        )}
                    </div>

                    <div className={styles.allocationList}>
                        <div className={styles.listHeader}>
                            <span>Category</span>
                            <span>Target (%)</span>
                            <span>Color</span>
                            {isEditing && <span></span>}
                        </div>
                        {allocations.map((item, index) => (
                            <div key={index} className={styles.allocationRow}>
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={item.category}
                                            onChange={(e) => handleAllocationChange(index, "category", e.target.value)}
                                            placeholder="e.g. Technology"
                                        />
                                        <input
                                            type="number"
                                            className={styles.input}
                                            value={item.targetPercentage}
                                            onChange={(e) =>
                                                handleAllocationChange(index, "targetPercentage", e.target.value)
                                            }
                                            min="0"
                                            max="100"
                                            step="0.1"
                                        />
                                        <input
                                            type="color"
                                            className={styles.colorPicker}
                                            value={item.color || "#000000"}
                                            onChange={(e) => handleAllocationChange(index, "color", e.target.value)}
                                        />
                                        <button className={styles.iconBtn} onClick={() => handleRemoveCategory(index)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className={styles.cellStatic}>{item.category}</span>
                                        <span className={styles.cellStatic}>{item.targetPercentage.toFixed(1)}%</span>
                                        <div className={styles.colorDot} style={{ backgroundColor: item.color }}></div>
                                    </>
                                )}
                            </div>
                        ))}

                        {isEditing && (
                            <div className={styles.editFooter}>
                                <button className={styles.addBtn} onClick={handleAddCategory}>
                                    <Plus size={16} /> Add Category
                                </button>
                                <div
                                    className={`${styles.total} ${Math.abs(totalPercentage - 100) > 0.01 ? styles.errorTotal : ""}`}
                                >
                                    Total: {totalPercentage.toFixed(1)}%
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Allocation vs Reality & Suggestions */}
                <section className={styles.sidebar}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Actual vs Target</h2>
                        </div>

                        {statusData && statusData.status && statusData.status.length > 0 ? (
                            <div className={styles.barChartContainer}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={statusData.status}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" unit="%" />
                                        <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)}%`} />
                                        <Legend />
                                        <Bar dataKey="actualPercentage" name="Actual %" fill="#8884d8" />
                                        <Bar dataKey="targetPercentage" name="Target %" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No portfolio or target data available.</div>
                        )}
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Rebalancing Suggestions</h2>
                        </div>
                        <div className={styles.suggestionsList}>
                            {statusData && statusData.suggestions && statusData.suggestions.length > 0 ? (
                                statusData.suggestions.map((suggestion, idx) => (
                                    <div key={idx} className={styles.suggestionItem}>
                                        <div className={styles.suggestionText}>{suggestion}</div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    {statusData?.status?.length > 0
                                        ? "Your portfolio is well balanced according to your targets!"
                                        : "Set targets and buy assets to see suggestions."}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

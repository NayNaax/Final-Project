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
import { CategoryMapper } from "../components/CategoryMapper";
import { Link } from "react-router-dom";
import styles from "./BudgetPage.module.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

const createRowId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const BudgetPage = () => {
    const [allocations, setAllocations] = useState([]);
    const [symbolCategoryMap, setSymbolCategoryMap] = useState({});
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
            if (budgetRes && budgetRes.allocations) {
                setAllocations(
                    budgetRes.allocations.map((allocation) => ({
                        ...allocation,
                        _rowId: allocation._rowId || createRowId(),
                    })),
                );
                setSymbolCategoryMap(budgetRes.symbolCategoryMap || {});
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
        setAllocations((prev) =>
            prev.map((allocation, i) => {
                if (i !== index) return allocation;

                return {
                    ...allocation,
                    [field]: field === "targetPct" ? parseFloat(value) || 0 : value,
                };
            }),
        );
    };

    const handleAddCategory = () => {
        setAllocations((prev) => {
            const newColor = COLORS[prev.length % COLORS.length];
            return [...prev, { _rowId: createRowId(), category: "", targetPct: 0, color: newColor }];
        });
        setIsEditing(true);
    };

    const handleRemoveCategory = (index) => {
        setAllocations((prev) => prev.filter((_, i) => i !== index));
        setIsEditing(true);
    };

    const handleSave = async () => {
        setError("");

        // Validation
        const total = allocations.reduce((sum, item) => sum + (item.targetPct || 0), 0);
        if (Math.abs(total - 100) > 0.01 && allocations.length > 0) {
            setError(`Total allocation must equal 100%. Current total: ${total.toFixed(2)}%`);
            return;
        }

        const validCategories = allocations.every((a) => a.category && a.category.trim() !== "");
        if (!validCategories) {
            setError("All categories must have a name.");
            return;
        }

        setSaving(true);
        try {
            const payloadAllocations = allocations.map(({ _rowId, ...allocation }) => allocation);
            await api.put("/budget", { allocations: payloadAllocations, symbolCategoryMap });
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

    const applyTemplate = (type) => {
        let newAllocs = [];
        if (type === "Conservative") {
            newAllocs = [
                { _rowId: createRowId(), category: "Bonds/Cash", targetPct: 60, color: "#6b7280" },
                { _rowId: createRowId(), category: "ETF", targetPct: 30, color: "#8b5cf6" },
                { _rowId: createRowId(), category: "Equities", targetPct: 10, color: "#3b82f6" },
            ];
        } else if (type === "Balanced") {
            newAllocs = [
                { _rowId: createRowId(), category: "Bonds/Cash", targetPct: 30, color: "#6b7280" },
                { _rowId: createRowId(), category: "ETF", targetPct: 40, color: "#8b5cf6" },
                { _rowId: createRowId(), category: "Equities", targetPct: 30, color: "#3b82f6" },
            ];
        } else if (type === "Aggressive") {
            newAllocs = [
                { _rowId: createRowId(), category: "Tech", targetPct: 40, color: "#3b82f6" },
                { _rowId: createRowId(), category: "Healthcare", targetPct: 20, color: "#ef4444" },
                { _rowId: createRowId(), category: "ETF", targetPct: 20, color: "#8b5cf6" },
                { _rowId: createRowId(), category: "Other", targetPct: 20, color: "#f59e0b" },
            ];
        }
        setAllocations(newAllocs);
        setIsEditing(true);
    };

    const totalPercentage = useMemo(() => {
        return allocations.reduce((sum, item) => sum + (item.targetPct || 0), 0);
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
                <section className={`${styles.card} glass`}>
                    <div className={styles.cardHeader}>
                        <h2>Target Allocation</h2>
                        {!isEditing && allocations.length > 0 ? (
                            <button type="button" className={styles.actionBtn} onClick={() => setIsEditing(true)}>
                                Edit
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={styles.actionBtnPrimary}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? <RefreshCw className={styles.spinIcon} size={16} /> : <Save size={16} />}
                                Save
                            </button>
                        )}
                    </div>

                    <div className={styles.donutchartContainer} style={{ position: "relative" }}>
                        {allocations.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={allocations}
                                            dataKey="targetPct"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={2}
                                        >
                                            {allocations.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color || COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)}%`} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "43%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        textAlign: "center",
                                        pointerEvents: "none",
                                    }}
                                >
                                    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>100%</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Target</div>
                                </div>
                            </>
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
                            <div key={item._rowId || `${item.category}-${index}`} className={styles.allocationRow}>
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
                                            value={item.targetPct || 0}
                                            onChange={(e) => handleAllocationChange(index, "targetPct", e.target.value)}
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
                                        <button
                                            type="button"
                                            className={styles.iconBtn}
                                            onClick={() => handleRemoveCategory(index)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className={styles.cellStatic}>{item.category}</span>
                                        <span className={styles.cellStatic}>{(item.targetPct || 0).toFixed(1)}%</span>
                                        <div className={styles.colorDot} style={{ backgroundColor: item.color }}></div>
                                    </>
                                )}
                            </div>
                        ))}

                        {isEditing && (
                            <div className={styles.editFooter}>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                                    <button
                                        type="button"
                                        className={styles.templateBtn}
                                        onClick={() => applyTemplate("Conservative")}
                                    >
                                        Conservative
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.templateBtn}
                                        onClick={() => applyTemplate("Balanced")}
                                    >
                                        Balanced
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.templateBtn}
                                        onClick={() => applyTemplate("Aggressive")}
                                    >
                                        Aggressive
                                    </button>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        alignItems: "center",
                                    }}
                                >
                                    <button type="button" className={styles.addBtn} onClick={handleAddCategory}>
                                        <Plus size={16} /> Add Category
                                    </button>
                                    <div
                                        className={`${styles.total} ${Math.abs(totalPercentage - 100) > 0.01 ? styles.errorTotal : ""}`}
                                    >
                                        Total: {totalPercentage.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Allocation vs Reality & Suggestions */}
                <section className={styles.sidebar}>
                    <div className={`${styles.card} glass`}>
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
                                        <Bar dataKey="actualPct" name="Actual %" fill="#8884d8" />
                                        <Bar dataKey="targetPct" name="Target %" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No portfolio or target data available.</div>
                        )}

                        <CategoryMapper
                            mapping={symbolCategoryMap}
                            onMappingChange={setSymbolCategoryMap}
                            allocations={allocations}
                        />
                    </div>

                    <div className={`${styles.card} glass`}>
                        <div className={styles.cardHeader}>
                            <h2>Rebalancing Suggestions</h2>
                        </div>
                        <div className={styles.suggestionsList}>
                            {statusData && statusData.suggestions && statusData.suggestions.length > 0 ? (
                                statusData.suggestions.map((suggestion, idx) => {
                                    // Extract symbol/category or something? The string already has text. Let's just render the text and a "Trade" link to generic /trade (or /stocks)
                                    return (
                                        <div key={idx} className={styles.suggestionItem}>
                                            <div className={styles.suggestionText}>{suggestion}</div>
                                            <Link to="/portfolio" className={styles.tradeLink}>
                                                Trade
                                            </Link>
                                        </div>
                                    );
                                })
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

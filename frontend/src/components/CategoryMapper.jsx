import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import styles from "./CategoryMapper.module.css";

export const CategoryMapper = ({ mapping, onMappingChange, allocations }) => {
    const [symbol, setSymbol] = useState("");
    const [category, setCategory] = useState(allocations[0]?.category || "");

    const handleAdd = () => {
        if (!symbol.trim() || !category) return;
        onMappingChange({ ...mapping, [symbol.toUpperCase()]: category });
        setSymbol("");
    };

    const handleRemove = (sym) => {
        const newMapping = { ...mapping };
        delete newMapping[sym];
        onMappingChange(newMapping);
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Map Symbols to Categories</h3>
            <p className={styles.subtitle}>Override default sectors by assigning specific stock symbols to your budget categories.</p>
            
            <div className={styles.formGroup}>
                <input 
                    type="text" 
                    placeholder="Symbol (e.g. TSLA)" 
                    value={symbol} 
                    onChange={e => setSymbol(e.target.value.toUpperCase())}
                    className={styles.input}
                />
                <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className={styles.select}
                >
                    {allocations.filter(a => a.category).map(a => (
                        <option key={a.category} value={a.category}>{a.category}</option>
                    ))}
                </select>
                <button type="button" onClick={handleAdd} className={styles.addBtn} disabled={!symbol.trim() || !category}><Plus size={16}/></button>
            </div>

            <div className={styles.list}>
                {Object.entries(mapping || {}).length === 0 && (
                    <div className={styles.empty}>No custom mappings yet.</div>
                )}
                {Object.entries(mapping || {}).map(([sym, cat]) => (
                    <div key={sym} className={styles.mappingItem}>
                        <span className={styles.symbolBadge}>{sym}</span>
                        <span className={styles.arrow}>→</span>
                        <span className={styles.categoryBadge}>{cat}</span>
                        <button type="button" onClick={() => handleRemove(sym)} className={styles.removeBtn}><X size={14}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

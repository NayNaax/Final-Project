import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { STOCK_INFO } from "../lib/stockInfo";
import styles from "./StockSearch.module.css";

export function StockSearch({
    placeholder = "Search stocks...",
    onSelect,
    excludeSymbols = [],
    autoFocus = false,
    value = "",
    onChange,
    className = "",
}) {
    const [query, setQuery] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Update internal state if value prop changes
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setIsOpen(true);
        if (onChange) onChange(val);
    };

    const clearSearch = () => {
        setQuery("");
        if (onChange) onChange("");
        setIsOpen(false);
    };

    const handleSelect = (symbol) => {
        setQuery(symbol);
        if (onChange) onChange(symbol);
        setIsOpen(false);
        if (onSelect) onSelect(symbol);
    };

    // Filter stocks
    const allSymbols = Object.keys(STOCK_INFO);
    const filteredSymbols = allSymbols.filter((symbol) => {
        if (excludeSymbols.includes(symbol)) return false;
        const q = query.toLowerCase();
        return symbol.toLowerCase().includes(q) || STOCK_INFO[symbol].name.toLowerCase().includes(q);
    });

    return (
        <div className={`${styles.wrapper} ${className}`} ref={wrapperRef}>
            <div className={styles.inputWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    className={styles.input}
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    autoFocus={autoFocus}
                />
                {query && (
                    <button className={styles.clearBtn} onClick={clearSearch}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {isOpen && query && (
                <div className={`${styles.dropdown} glass`}>
                    {filteredSymbols.length > 0 ? (
                        <ul className={styles.list}>
                            {filteredSymbols.map((symbol) => (
                                <li key={symbol} className={styles.listItem} onClick={() => handleSelect(symbol)}>
                                    <div className={styles.itemSymbol}>{symbol}</div>
                                    <div className={styles.itemName}>{STOCK_INFO[symbol].name}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={styles.noResults}>No stocks found matching "{query}"</div>
                    )}
                </div>
            )}
        </div>
    );
}

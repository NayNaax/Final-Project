import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, X, Eye, ShoppingCart, AlertCircle, ArrowUpDown } from "lucide-react";
import { api } from "../lib/apiClient";
import { StockSearch } from "../components/StockSearch";
import { Modal } from "../components/Modal";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBanner } from "../components/ErrorBanner";
import { StockPriceBadge } from "../components/StockPriceBadge";
import { EmptyState } from "../components/EmptyState";
import { SparklineChart } from "../components/SparklineChart";
import { WatchlistNewsFeed } from "../components/WatchlistNewsFeed";
import styles from "./WatchlistsPage.module.css";

export function WatchlistsPage() {
    const navigate = useNavigate();
    const [watchlists, setWatchlists] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [prices, setPrices] = useState({});

    // Modals state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [actionName, setActionName] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: "symbol", direction: "asc" });

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        loadWatchlists();
    }, []);

    const loadWatchlists = async () => {
        try {
            setLoading(true);
            const data = await api.get("/watchlists");
            setWatchlists(data);
            if (data.length > 0 && !selectedId) {
                setSelectedId(data[0].id);
            }
        } catch (err) {
            setError("Failed to load watchlists: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectedList = watchlists.find((w) => w.id === selectedId);

    // Fetch prices for selected watchlist
    useEffect(() => {
        if (!selectedList || selectedList.symbols.length === 0) return;

        const fetchPrices = async () => {
            if (typeof document !== "undefined" && document.visibilityState === "hidden") {
                return;
            }

            try {
                const pricePromises = selectedList.symbols.map(async (symbol) => {
                    try {
                        const data = await api.get(`/stocks/${symbol}`, { cacheMs: 15000 });
                        return { symbol, data: data.current };
                    } catch (e) {
                        return { symbol, data: null };
                    }
                });

                const results = await Promise.all(pricePromises);
                const newPrices = {};
                results.forEach((res) => {
                    if (res.data) {
                        newPrices[res.symbol] = {
                            price: res.data.price,
                            changePercent: ((res.data.price - res.data.previousClose) / res.data.previousClose) * 100,
                        };
                    }
                });
                setPrices(newPrices);
            } catch (err) {
                console.error("Error fetching prices", err);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, [selectedList]);

    const handleCreate = async () => {
        if (!actionName.trim()) return;
        try {
            setActionLoading(true);
            const newList = await api.post("/watchlists", { name: actionName });
            setWatchlists([...watchlists, newList]);
            setSelectedId(newList.id);
            setIsCreateOpen(false);
            setActionName("");
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRename = async () => {
        if (!actionName.trim() || !selectedId) return;
        try {
            setActionLoading(true);
            await api.put(`/watchlists/${selectedId}`, { name: actionName });
            setWatchlists(watchlists.map((w) => (w.id === selectedId ? { ...w, name: actionName } : w)));
            setIsRenameOpen(false);
            setActionName("");
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedId) return;
        try {
            setActionLoading(true);
            await api.delete(`/watchlists/${selectedId}`);
            const remaining = watchlists.filter((w) => w.id !== selectedId);
            setWatchlists(remaining);
            setSelectedId(remaining.length > 0 ? remaining[0].id : null);
            setIsDeleteOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddSymbol = async (symbol) => {
        if (!selectedId || !symbol) return;
        if (selectedList?.symbols.includes(symbol)) return;

        try {
            await api.post(`/watchlists/${selectedId}/symbols`, { symbol });
            setWatchlists(watchlists.map((w) => (w.id === selectedId ? { ...w, symbols: [...w.symbols, symbol] } : w)));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoveSymbol = async (symbol) => {
        if (!selectedId) return;
        try {
            await api.delete(`/watchlists/${selectedId}/symbols/${symbol}`);
            setWatchlists(
                watchlists.map((w) =>
                    w.id === selectedId ? { ...w, symbols: w.symbols.filter((s) => s !== symbol) } : w,
                ),
            );

            // clear price from state
            const newPrices = { ...prices };
            delete newPrices[symbol];
            setPrices(newPrices);
        } catch (err) {
            setError(err.message);
        }
    };

    const openRename = () => {
        setActionName(selectedList?.name || "");
        setIsRenameOpen(true);
    };

    const sortedSymbols = selectedList
        ? [...selectedList.symbols].sort((a, b) => {
              const pA = prices[a];
              const pB = prices[b];
              let valA, valB;
              if (sortConfig.key === "price") {
                  valA = pA ? pA.price : 0;
                  valB = pB ? pB.price : 0;
              } else {
                  valA = a;
                  valB = b;
              }

              if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
              if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
              return 0;
          })
        : [];

    if (loading && watchlists.length === 0) return <LoadingSpinner />;

    return (
        <div className={styles.container}>
            {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <h1 className={styles.pageTitle}>Watchlists</h1>
                    <p className={styles.pageSubtitle}>Monitor your favorite stocks</p>
                </div>
                <button
                    className={styles.headerActionBtn}
                    onClick={() => {
                        setActionName("");
                        setIsCreateOpen(true);
                    }}
                >
                    <Plus size={18} /> New Watchlist
                </button>
            </header>

            <div className={styles.layout}>
                {/* Sidebar - Watchlists List */}
                <div className={styles.sidebar}>
                    <div className={`${styles.listContainer} glass`}>
                        {watchlists.length > 0 ? (
                            <ul className={styles.navLists}>
                                {watchlists.map((list) => (
                                    <li key={list.id}>
                                        <button
                                            className={`${styles.navItem} ${selectedId === list.id ? styles.navActive : ""}`}
                                            onClick={() => setSelectedId(list.id)}
                                        >
                                            <span className={styles.navText}>{list.name}</span>
                                            <span className={styles.navCount}>{list.symbols.length}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className={styles.navEmpty}>
                                <p>No watchlists yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content - Selected Watchlist */}
                <div className={styles.main}>
                    {selectedList ? (
                        <div className={`${styles.contentCard} glass`}>
                            <div className={styles.contentHeader}>
                                <h2>{selectedList.name}</h2>
                                <div className={styles.headerActions}>
                                    <button className={styles.iconBtn} onClick={openRename} title="Rename">
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        className={styles.iconBtnDanger}
                                        onClick={() => setIsDeleteOpen(true)}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.searchSection}>
                                <StockSearch
                                    placeholder="Add symbols to watchlist..."
                                    onSelect={handleAddSymbol}
                                    excludeSymbols={selectedList.symbols}
                                />
                            </div>

                            <div className={styles.symbolsList}>
                                {selectedList.symbols.length > 0 ? (
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th
                                                    onClick={() => handleSort("symbol")}
                                                    style={{ cursor: "pointer", userSelect: "none" }}
                                                >
                                                    Symbol{" "}
                                                    <ArrowUpDown size={12} style={{ opacity: 0.5, marginLeft: 4 }} />
                                                </th>
                                                <th>Trend (30d)</th>
                                                <th
                                                    onClick={() => handleSort("price")}
                                                    style={{ cursor: "pointer", userSelect: "none" }}
                                                >
                                                    Price{" "}
                                                    <ArrowUpDown size={12} style={{ opacity: 0.5, marginLeft: 4 }} />
                                                </th>
                                                <th style={{ textAlign: "right" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedSymbols.map((symbol) => {
                                                const pData = prices[symbol];
                                                return (
                                                    <tr key={symbol}>
                                                        <td
                                                            className={styles.symbolCell}
                                                            onClick={() => navigate(`/stocks/${symbol}`)}
                                                        >
                                                            <div className={styles.symbolInfo}>
                                                                <span className={styles.symbolText}>{symbol}</span>
                                                                <Eye size={14} className={styles.viewIcon} />
                                                            </div>
                                                        </td>
                                                        <td style={{ width: "120px", padding: "4px 16px" }}>
                                                            <SparklineChart
                                                                symbol={symbol}
                                                                color={
                                                                    pData && pData.changePercent >= 0
                                                                        ? "#10b981"
                                                                        : "#ef4444"
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            {pData ? (
                                                                <StockPriceBadge
                                                                    symbol={""}
                                                                    price={pData.price}
                                                                    changePercent={pData.changePercent}
                                                                />
                                                            ) : (
                                                                <span className={styles.loadingPrice}>Loading...</span>
                                                            )}
                                                        </td>
                                                        <td
                                                            className={styles.actionCell}
                                                            style={{ textAlign: "right" }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    gap: "8px",
                                                                    justifyContent: "flex-end",
                                                                }}
                                                            >
                                                                <button
                                                                    className={styles.iconBtn}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/stocks/${symbol}`);
                                                                    }}
                                                                    title="Trade"
                                                                    style={{ padding: "4px" }}
                                                                >
                                                                    <ShoppingCart size={16} />
                                                                </button>
                                                                <button
                                                                    className={styles.iconBtn}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/alerts`);
                                                                    }}
                                                                    title="Set Alert"
                                                                    style={{ padding: "4px" }}
                                                                >
                                                                    <AlertCircle size={16} />
                                                                </button>
                                                                <button
                                                                    className={styles.removeBtn}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveSymbol(symbol);
                                                                    }}
                                                                    title="Remove from Watchlist"
                                                                    style={{ padding: "4px" }}
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <EmptyState
                                        icon={Eye}
                                        title="Empty Watchlist"
                                        description="Search above to add symbols to this watchlist."
                                    />
                                )}
                            </div>

                            {selectedList.symbols.length > 0 && <WatchlistNewsFeed symbols={sortedSymbols} />}
                        </div>
                    ) : (
                        <div className={`${styles.contentCard} ${styles.centerCard} glass`}>
                            <EmptyState
                                icon={Eye}
                                title="No Watchlist Selected"
                                description="Select a watchlist from the sidebar or click 'New Watchlist' to create one."
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Watchlist Modal */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create New Watchlist"
                footer={
                    <>
                        <button className={styles.btnSecondary} onClick={() => setIsCreateOpen(false)}>
                            Cancel
                        </button>
                        <button
                            className={styles.btnPrimary}
                            onClick={handleCreate}
                            disabled={!actionName.trim() || actionLoading}
                        >
                            {actionLoading ? <LoadingSpinner /> : "Create"}
                        </button>
                    </>
                }
            >
                <div className={styles.modalContent}>
                    <label>Watchlist Name</label>
                    <input
                        type="text"
                        value={actionName}
                        onChange={(e) => setActionName(e.target.value)}
                        placeholder="e.g., Tech Stocks, Dividends"
                        className={styles.input}
                        autoFocus
                    />
                </div>
            </Modal>

            {/* Rename Watchlist Modal */}
            <Modal
                isOpen={isRenameOpen}
                onClose={() => setIsRenameOpen(false)}
                title="Rename Watchlist"
                footer={
                    <>
                        <button className={styles.btnSecondary} onClick={() => setIsRenameOpen(false)}>
                            Cancel
                        </button>
                        <button
                            className={styles.btnPrimary}
                            onClick={handleRename}
                            disabled={!actionName.trim() || actionLoading}
                        >
                            {actionLoading ? <LoadingSpinner /> : "Save"}
                        </button>
                    </>
                }
            >
                <div className={styles.modalContent}>
                    <label>Watchlist Name</label>
                    <input
                        type="text"
                        value={actionName}
                        onChange={(e) => setActionName(e.target.value)}
                        placeholder="Name"
                        className={styles.input}
                        autoFocus
                    />
                </div>
            </Modal>

            {/* Delete Watchlist Modal */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Delete Watchlist"
                footer={
                    <>
                        <button className={styles.btnSecondary} onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </button>
                        <button
                            className={`${styles.btnPrimary} ${styles.btnDanger}`}
                            onClick={handleDelete}
                            disabled={actionLoading}
                        >
                            {actionLoading ? <LoadingSpinner /> : "Delete"}
                        </button>
                    </>
                }
            >
                <p>
                    Are you sure you want to delete the watchlist <strong>"{selectedList?.name}"</strong>? This action
                    cannot be undone.
                </p>
            </Modal>
        </div>
    );
}

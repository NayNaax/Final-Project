import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StocksPage } from "./pages/StocksPage";
import { StockDetailPage } from "./pages/StockDetailPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { TradePage } from "./pages/TradePage";
import { WatchlistsPage } from "./pages/WatchlistsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { BudgetPage } from "./pages/BudgetPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import "./index.css";

// Dashboard layout placeholder - will be implemented in phases 3-8
const DashboardShell = ({ children }) => <DashboardLayout>{children}</DashboardLayout>;

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardShell>
                                    <DashboardPage />
                                </DashboardShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/stocks"
                        element={
                            <ProtectedRoute>
                                <DashboardShell>
                                    <StocksPage />
                                </DashboardShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/stocks/:symbol"
                        element={
                            <ProtectedRoute>
                                <DashboardShell>
                                    <StockDetailPage />
                                </DashboardShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/portfolio"
                        element={
                            <ProtectedRoute>
                                <DashboardShell>
                                    <PortfolioPage />
                                </DashboardShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/trade"
                        element={
                            <ProtectedRoute>
                                <DashboardShell>
                                    <TradePage />
                                </DashboardShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/watchlists"
                        element={
                            <ProtectedRoute>
                                <DashboardShell>
                                    <WatchlistsPage />
                                </DashboardShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/alerts"
                        element={
                            <ProtectedRoute>
                                <DashboardShell>
                                    <AlertsPage />
                                </DashboardShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/budget"
                        element={
                            <ProtectedRoute>
                                <DashboardShell>
                                    <BudgetPage />
                                </DashboardShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/leaderboard"
                        element={
                            <ProtectedRoute>
                                <DashboardShell>
                                    <LeaderboardPage />
                                </DashboardShell>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <DashboardShell>
                                    <SettingsPage />
                                </DashboardShell>
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch-all redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import { TitleBar } from "./components/TitleBar";
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
import { LearnPage } from "./pages/LearnPage";
import { LessonPage } from "./pages/LessonPage";
import { JournalPage } from "./pages/JournalPage";
import { NewsPage } from "./pages/NewsPage";
import "./index.css";

const DashboardShell = () => (
    <SettingsProvider>
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    </SettingsProvider>
);

function App() {
    return (
        <Router>
            <AuthProvider>
                <TitleBar />
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardShell />}>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/stocks" element={<StocksPage />} />
                            <Route path="/stocks/:symbol" element={<StockDetailPage />} />
                            <Route path="/portfolio" element={<PortfolioPage />} />
                            <Route path="/trade" element={<TradePage />} />
                            <Route path="/watchlists" element={<WatchlistsPage />} />
                            <Route path="/alerts" element={<AlertsPage />} />
                            <Route path="/budget" element={<BudgetPage />} />
                            <Route path="/leaderboard" element={<LeaderboardPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/learn" element={<LearnPage />} />
                            <Route path="/learn/:lessonId" element={<LessonPage />} />
                            <Route path="/learn/journal" element={<JournalPage />} />
                            <Route path="/news" element={<NewsPage />} />
                        </Route>
                    </Route>

                    {/* Catch-all redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;

import { Request, Response, NextFunction } from "express";
import { PortfolioService } from "../services/portfolio.service";

export const getPortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const portfolio = await PortfolioService.getPortfolio(req.user!.id);
        res.json(portfolio);
    } catch (error) {
        next(error);
    }
};

export const buy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { symbol, shares } = req.body;
        const trade = await PortfolioService.buy(req.user!.id, symbol, shares);
        res.status(201).json(trade);
    } catch (error: any) {
        if (
            error.message.includes("not found") ||
            error.message.includes("Insufficient") ||
            error.message.includes("unavailable")
        ) {
            res.status(400).json({ error: error.message, code: 400 });
        } else {
            next(error);
        }
    }
};

export const sell = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { symbol, shares } = req.body;
        const trade = await PortfolioService.sell(req.user!.id, symbol, shares);
        res.status(201).json(trade);
    } catch (error: any) {
        if (
            error.message.includes("not found") ||
            error.message.includes("Insufficient") ||
            error.message.includes("unavailable")
        ) {
            res.status(400).json({ error: error.message, code: 400 });
        } else {
            next(error);
        }
    }
};

export const getTradeHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trades = await PortfolioService.getTradeHistory(req.user!.id);
        res.json(trades);
    } catch (error) {
        next(error);
    }
};

export const getPortfolioHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const snapshots = await PortfolioService.getPortfolioHistory(req.user!.id);
        res.json(snapshots);
    } catch (error) {
        next(error);
    }
};

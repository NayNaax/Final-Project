import { Request, Response, NextFunction } from "express";
import { StocksService } from "../services/stocks.service";

export const getLatestPrices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // For now returning the 15 standard symbols
        const prices = await StocksService.getLatestPrices();
        res.json(prices);
    } catch (error) {
        next(error);
    }
};

export const getRawStocks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { prisma } = await import("../lib/prisma");
        const stocks = await prisma.stock.findMany();
        res.json(stocks);
    } catch (error) {
        next(error);
    }
};

export const getStockData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { symbol } = req.params;
        const data = await StocksService.getStockData(symbol as string);
        res.json(data);
    } catch (error: any) {
        if (error.message.includes("not currently supported")) {
            res.status(404).json({ error: error.message, code: 404 });
        } else {
            next(error);
        }
    }
};

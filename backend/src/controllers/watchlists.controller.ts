import { Request, Response, NextFunction } from "express";
import { WatchlistsService } from "../services/watchlists.service";

export const getAllForUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const watchlists = await WatchlistsService.getAllForUser(req.user!.id);
        res.json(watchlists);
    } catch (error) {
        next(error);
    }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        const watchlist = await WatchlistsService.create(req.user!.id, name);
        res.status(201).json(watchlist);
    } catch (error: any) {
        if (error.message.includes("already exists") || error.message.includes("required")) {
            res.status(400).json({ error: error.message, code: 400 });
        } else {
            next(error);
        }
    }
};

export const rename = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const watchlist = await WatchlistsService.rename(req.user!.id, parseInt(id as string, 10), name);
        res.json(watchlist);
    } catch (error: any) {
        if (error.message.includes("not found")) res.status(404).json({ error: error.message, code: 404 });
        else if (error.message.includes("already exists") || error.message.includes("required"))
            res.status(400).json({ error: error.message, code: 400 });
        else next(error);
    }
};

export const deleteWatchlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await WatchlistsService.delete(req.user!.id, parseInt(id as string, 10));
        res.status(204).send();
    } catch (error: any) {
        if (error.message.includes("not found")) res.status(404).json({ error: error.message, code: 404 });
        else next(error);
    }
};

export const addSymbol = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { symbol } = req.body;
        const watchlist = await WatchlistsService.addSymbol(req.user!.id, parseInt(id as string, 10), symbol);
        res.json(watchlist);
    } catch (error: any) {
        if (error.message.includes("not found")) res.status(404).json({ error: error.message, code: 404 });
        else if (error.message.includes("required")) res.status(400).json({ error: error.message, code: 400 });
        else next(error);
    }
};

export const removeSymbol = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, symbol } = req.params;
        const watchlist = await WatchlistsService.removeSymbol(
            req.user!.id,
            parseInt(id as string, 10),
            symbol as string,
        );
        res.json(watchlist);
    } catch (error: any) {
        if (error.message.includes("not found")) res.status(404).json({ error: error.message, code: 404 });
        else next(error);
    }
};

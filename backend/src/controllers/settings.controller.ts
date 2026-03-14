import { Request, Response, NextFunction } from "express";
import { SettingsService } from "../services/settings.service";

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await SettingsService.getSettings(req.user!.id);
        res.json(settings);
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await SettingsService.updateSettings(req.user!.id, req.body);
        res.json(settings);
    } catch (error: any) {
        if (error.message.includes("Invalid")) {
            res.status(400).json({ error: error.message, code: 400 });
        } else {
            next(error);
        }
    }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const leaderboard = await SettingsService.getLeaderboard();
        res.json(leaderboard);
    } catch (error) {
        next(error);
    }
};

import { Request, Response, NextFunction } from "express";
import { AlertsService } from "../services/alerts.service";

export const getAllForUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const alerts = await AlertsService.getAllForUser(req.user!.id);
        res.json(alerts);
    } catch (error) {
        next(error);
    }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { symbol, targetPrice, direction } = req.body;
        const alert = await AlertsService.create(req.user!.id, symbol, targetPrice, direction);
        res.status(201).json(alert);
    } catch (error: any) {
        if (error.message.includes("required") || error.message.includes("Direction must be")) {
            res.status(400).json({ error: error.message, code: 400 });
        } else {
            next(error);
        }
    }
};

export const deleteAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await AlertsService.delete(req.user!.id, parseInt(id as string, 10));
        res.status(204).send();
    } catch (error: any) {
        if (error.message.includes("not found")) res.status(404).json({ error: error.message, code: 404 });
        else next(error);
    }
};

export const rearm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const alert = await AlertsService.rearm(req.user!.id, parseInt(id as string, 10));
        res.json(alert);
    } catch (error: any) {
        if (error.message.includes("not found") || error.message.includes("unauthorized")) {
            res.status(404).json({ error: error.message, code: 404 });
        } else {
            next(error);
        }
    }
};

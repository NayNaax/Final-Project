import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = await AuthService.register(req.body);
        res.status(201).json({ token });
    } catch (error: any) {
        if (error.message === "Email already in use") {
            res.status(409).json({ error: error.message, code: 409 });
        } else {
            next(error);
        }
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = await AuthService.login(req.body);
        res.json({ token });
    } catch (error: any) {
        if (error.message === "Invalid credentials") {
            res.status(401).json({ error: error.message, code: 401 });
        } else {
            next(error);
        }
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new Error("No user in request");
        }
        const user = await AuthService.getMe(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

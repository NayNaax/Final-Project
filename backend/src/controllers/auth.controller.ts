import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Create account and return a signed token so frontend can log in immediately.
        const token = await AuthService.register(req.body);
        res.status(201).json({ token });
    } catch (error: any) {
        // Convert known business errors into user-friendly HTTP responses.
        if (error.message === "Email already in use") {
            res.status(409).json({ error: error.message, code: 409 });
        } else if (error.message === "Username already taken") {
            res.status(409).json({ error: error.message, code: 409 });
        } else {
            // Unknown errors go to global error middleware.
            next(error);
        }
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate credentials in service and return token if successful.
        const token = await AuthService.login(req.body);
        res.json({ token });
    } catch (error: any) {
        // Keep auth failure message simple and consistent.
        if (error.message === "Invalid credentials") {
            res.status(401).json({ error: error.message, code: 401 });
        } else {
            next(error);
        }
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // requireAuth middleware should attach user; guard anyway for safety.
        if (!req.user) {
            throw new Error("No user in request");
        }
        // Return the latest profile data from DB, not cached request payload.
        const user = await AuthService.getMe(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const checkUsernameAvailable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.query;
        // Basic input check to avoid useless DB work and clearer client errors.
        if (!username || typeof username !== "string") {
            return res.status(400).json({ error: "Username is required" });
        }
        const available = await AuthService.checkUsernameAvailable(username);
        res.json({ available });
    } catch (error) {
        next(error);
    }
};

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../lib/jwtSecret";

// Augment Express Request type to include user payload
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
            };
        }
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Unauthorized - No token provided",
            code: 401,
        });
    }

    const token = authHeader.split(" ")[1];

    const secret = getJwtSecret();
    if (!secret) {
        return res.status(500).json({
            error: "Internal Server Error - Security configuration missing",
            code: 500,
        });
    }

    try {
        const payload = jwt.verify(token, secret) as {
            userId: number;
            email: string;
        };

        req.user = {
            id: payload.userId,
            email: payload.email,
        };
        next();
    } catch (error) {
        return res.status(401).json({
            error: "Unauthorized - Invalid or expired token",
            code: 401,
        });
    }
};

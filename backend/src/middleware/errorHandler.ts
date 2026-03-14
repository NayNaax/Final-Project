import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err);

    res.status(500).json({
        error: err.message || "Internal Server Error",
        code: 500,
    });
};

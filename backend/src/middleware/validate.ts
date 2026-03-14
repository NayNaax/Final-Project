import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: error.issues,
                    code: 400,
                });
            }
            next(error);
        }
    };
};

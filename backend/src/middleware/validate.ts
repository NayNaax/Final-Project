import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const requestData = {
            body: req.body,
            query: req.query,
            params: req.params,
        };

        try {
            const directResult = await schema.safeParseAsync(req.body);

            if (directResult.success) {
                req.body = directResult.data;
                return next();
            }

            const requestResult = await schema.safeParseAsync(requestData);

            if (requestResult.success) {
                if (requestResult.data && typeof requestResult.data === "object") {
                    const parsedRequest = requestResult.data as {
                        body?: Request["body"];
                        query?: Request["query"];
                        params?: Request["params"];
                    };

                    if (parsedRequest.body !== undefined) {
                        req.body = parsedRequest.body;
                    }

                    if (parsedRequest.query !== undefined) {
                        req.query = parsedRequest.query;
                    }

                    if (parsedRequest.params !== undefined) {
                        req.params = parsedRequest.params;
                    }
                }

                return next();
            }

            throw directResult.error;
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

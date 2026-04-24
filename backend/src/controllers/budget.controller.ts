import { Request, Response, NextFunction } from "express";
import { BudgetService } from "../services/budget.service";
import { z } from "zod";

const allocationSchema = z.object({
    category: z.string().min(1),
    targetPct: z.number().min(0).max(100),
    color: z.string().optional(),
});

const budgetSchema = z.object({
    allocations: z.array(allocationSchema).refine(
        (val) => {
            const sum = val.reduce((acc, curr) => acc + curr.targetPct, 0);
            return Math.abs(sum - 100) < 0.01;
        },
        { message: "Total allocations must equal 100%" },
    ),
    symbolCategoryMap: z.record(z.string()).optional(),
});

export const getBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const budget = await BudgetService.getBudget(req.user!.id);
        res.json(budget);
    } catch (error) {
        next(error);
    }
};

export const updateBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { allocations, symbolCategoryMap } = budgetSchema.parse(req.body);
        const budget = await BudgetService.updateBudget(req.user!.id, allocations, symbolCategoryMap);
        res.json(budget);
    } catch (error) {
        next(error);
    }
};

export const getBudgetStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = await BudgetService.getBudgetStatus(req.user!.id);
        res.json(status);
    } catch (error) {
        next(error);
    }
};

import { Request, Response } from "express";
import * as learnService from "../services/learn.service";

export const getProgress = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const progress = await learnService.getProgress(userId);
        res.json(progress);
    } catch (error) {
        console.error("getProgress Error:", error);
        res.status(500).json({ error: "Failed to fetch progress" });
    }
};

export const completeLesson = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { lessonId } = req.params;
        await learnService.completeLesson(userId, lessonId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to complete lesson" });
    }
};

export const submitQuiz = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { lessonId } = req.params;
        const { passed, score } = req.body;
        const result = await learnService.submitQuiz(userId, lessonId, passed, score);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to submit quiz" });
    }
};

export const getMissions = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const progress = await learnService.getProgress(userId);
        res.json(progress.missions);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch missions" });
    }
};

export const completeMission = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { missionId } = req.params;
        await learnService.completeMission(userId, missionId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to complete mission" });
    }
};

export const getJournal = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const trades = await learnService.getJournal(userId);
        res.json(trades);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch journal" });
    }
};

export const addJournalReason = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { tradeId, sellReason } = req.body;
        const updatedTrade = await learnService.addJournalReason(userId, Number(tradeId), sellReason);
        res.json(updatedTrade);
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to save journal reason" });
    }
};

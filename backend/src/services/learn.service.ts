import { prisma } from "../lib/prisma";

export const getProgress = async (userId: number) => {
    const lessons = await prisma.userLessonProgress.findMany({ where: { userId } });
    const missions = await prisma.userMission.findMany({ where: { userId } });
    return { lessons, missions };
};

export const completeLesson = async (userId: number, lessonId: string) => {
    return prisma.userLessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { completed: true, completedAt: new Date() },
        create: { userId, lessonId, completed: true, completedAt: new Date() },
    });
};

export const submitQuiz = async (userId: number, lessonId: string, passed: boolean, score: number) => {
    // Find or create the existing progress
    let record = await prisma.userLessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
    });

    if (!record) {
        record = await prisma.userLessonProgress.create({
            data: { userId, lessonId, passed, quizScore: score, completed: true, completedAt: new Date() },
        });
    } else {
        record = await prisma.userLessonProgress.update({
            where: { id: record.id },
            data: { passed: record.passed || passed, quizScore: Math.max(record.quizScore || 0, score) },
        });
    }

    let rewardGiven = false;
    if (passed && !record.rewardGiven) {
        // give reward
        await prisma.portfolio.update({
            where: { userId },
            data: { cash: { increment: 500 } },
        });
        await prisma.userLessonProgress.update({
            where: { id: record.id },
            data: { rewardGiven: true },
        });
        rewardGiven = true;
    }

    return { success: true, rewardGiven };
};

export const completeMission = async (userId: number, missionId: string) => {
    return prisma.userMission.upsert({
        where: { userId_missionId: { userId, missionId } },
        update: { completed: true, completedAt: new Date() },
        create: { userId, missionId, completed: true, completedAt: new Date() },
    });
};

export const getJournal = async (userId: number) => {
    return prisma.trade.findMany({
        where: { userId, side: "SELL" },
        orderBy: { createdAt: "desc" },
    });
};

export const addJournalReason = async (userId: number, tradeId: number, sellReason: string) => {
    // Make sure trade belongs to user
    const trade = await prisma.trade.findFirst({
        where: { id: tradeId, userId },
    });
    if (!trade) throw new Error("Trade not found or unauthorized.");

    return prisma.trade.update({
        where: { id: tradeId },
        data: { sellReason },
    });
};

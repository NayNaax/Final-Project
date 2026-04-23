import { prisma } from "./backend/src/lib/prisma";

async function main() {
    try {
        const lessons = await prisma.userLessonProgress.findMany();
        console.log("Lessons length:", lessons.length);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}
main();

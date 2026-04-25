import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const historyCount = await prisma.portfolioHistory.count();
    console.log("Total Portfolio History Records:", historyCount);

    if (historyCount > 0) {
        const history = await prisma.portfolioHistory.findMany({
            take: 5,
            include: { portfolio: { include: { user: true } } },
        });
        console.log("Sample History:", history);
    } else {
        console.log("NO HISTORY DATA FOUND IN DATABASE.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

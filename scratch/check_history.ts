import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const history = await prisma.portfolioHistory.findMany({
        orderBy: { snapshotDate: "desc" },
        take: 10,
    });
    console.log("Portfolio History:", history);

    const portfolios = await prisma.portfolio.findMany();
    console.log("Portfolios:", portfolios);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

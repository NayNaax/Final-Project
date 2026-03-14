import { prisma } from "./lib/prisma";

async function test() {
    const user = await prisma.user.create({
        data: {
            email: "hello@example.com",
            passwordHash: "hashed_password_here",
            watchlists: {
                create: {
                    name: "My Tech Stocks",
                    symbols: ["AAPL", "TSLA", "NVDA"],
                },
            },
        },
    });
    console.log("Created user with watchlist:", user);
}

test();

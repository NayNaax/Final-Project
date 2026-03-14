import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx seed.ts",
    },
    datasource: {
        url: "postgres://522f3b343cbf9debf5a320d09deb7486dedd9c85622ec4d20d72a54bffcc056a:sk_fnm7yZOaox5H2Cuw-C-bB@db.prisma.io:5432/postgres?sslmode=require",
    },
});

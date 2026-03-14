import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx seed.ts",
    },
    datasource: {
        url: "REPLACED_DATABASE_URL",
    },
});

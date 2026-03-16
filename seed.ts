import "dotenv/config";
import { Client } from "pg";
import fs from "node:fs";
import path from "node:path";
import csv from "csv-parser";

type CsvRow = {
    Date: string;
    "Close/Last": string;
    Volume: string;
    Open: string;
    High: string;
    Low: string;
};

type StockRow = {
    Date: string;
    CloseLast: string;
    Volume: string;
    Open: string;
    High: string;
    Low: string;
};

const REQUIRED_HEADERS = ["Date", "Close/Last", "Volume", "Open", "High", "Low"] as const;
const INSERT_BATCH_SIZE = 250;
type PgClient = InstanceType<typeof Client>;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable.");
}

if (!/^postgres(ql)?:\/\//i.test(connectionString)) {
    throw new Error(
        "Invalid DATABASE_URL for seed script. Use a PostgreSQL URL starting with postgres:// or postgresql://.",
    );
}

const dataDir = path.join(process.cwd(), "Data");
const files = ["stock1.csv", "stock2.csv", "stock3.csv"];

function normalizeHeader(header: string): string {
    return header.replace(/^\uFEFF/, "").trim();
}

function mapCsvRowToStock(row: CsvRow): StockRow {
    return {
        Date: row.Date?.trim() ?? "",
        CloseLast: row["Close/Last"]?.trim() ?? "",
        Volume: row.Volume?.trim() ?? "",
        Open: row.Open?.trim() ?? "",
        High: row.High?.trim() ?? "",
        Low: row.Low?.trim() ?? "",
    };
}

async function parseCsv(filePath: string): Promise<StockRow[]> {
    const rows: StockRow[] = [];

    await new Promise<void>((resolve, reject) => {
        let settled = false;

        const fail = (err: Error, stream?: fs.ReadStream) => {
            if (settled) return;
            settled = true;
            if (stream) stream.destroy();
            reject(err);
        };

        const stream = fs.createReadStream(filePath);

        stream
            .pipe(
                csv({
                    mapHeaders: ({ header }) => normalizeHeader(header),
                }),
            )
            .on("headers", (headers: string[]) => {
                const normalized = headers.map(normalizeHeader);
                const missing = REQUIRED_HEADERS.filter((h) => !normalized.includes(h));
                if (missing.length > 0) {
                    fail(new Error(`Invalid CSV headers in ${filePath}. Missing: ${missing.join(", ")}`), stream);
                }
            })
            .on("data", (row: CsvRow) => {
                if (settled) return;
                rows.push(mapCsvRowToStock(row));
            })
            .on("end", () => {
                if (settled) return;
                settled = true;
                resolve();
            })
            .on("error", (error: Error) => fail(error, stream));
    });

    return rows;
}

async function insertBatch(client: PgClient, rows: StockRow[]): Promise<void> {
    if (rows.length === 0) return;

    const values: string[] = [];
    const params: string[] = [];

    rows.forEach((row, index) => {
        const base = index * 6;
        values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`);
        params.push(row.Date, row.CloseLast, row.Volume, row.Open, row.High, row.Low);
    });

    const query = `
    INSERT INTO "Stock" ("Date", "CloseLast", "Volume", "Open", "High", "Low")
    VALUES ${values.join(", ")}
  `;

    await client.query(query, params);
}

async function main(): Promise<void> {
    const allStocks: StockRow[] = [];
    const perFileCount: Record<string, number> = {};

    for (const file of files) {
        const filePath = path.join(dataDir, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`CSV file not found: ${filePath}`);
        }

        const mappedRows = await parseCsv(filePath);
        allStocks.push(...mappedRows);
        perFileCount[file] = mappedRows.length;
    }

    if (allStocks.length === 0) {
        throw new Error("No rows found in provided CSV files.");
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
      CREATE TABLE IF NOT EXISTS "Stock" (
        id SERIAL PRIMARY KEY,
        "Date" TEXT NOT NULL,
        "CloseLast" TEXT NOT NULL,
        "Volume" TEXT NOT NULL,
        "Open" TEXT NOT NULL,
        "High" TEXT NOT NULL,
        "Low" TEXT NOT NULL
      )
    `);

        await client.query('TRUNCATE TABLE "Stock" RESTART IDENTITY');

        for (let i = 0; i < allStocks.length; i += INSERT_BATCH_SIZE) {
            await insertBatch(client, allStocks.slice(i, i + INSERT_BATCH_SIZE));
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        await client.end();
    }

    console.log(`Seeded ${allStocks.length} stock rows from ${files.length} CSV files.`);
    console.table(perFileCount);

    const verificationClient = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    await verificationClient.connect();
    try {
        const summary = await verificationClient.query(`
      SELECT
        COUNT(*)::int AS total,
        TO_CHAR(MIN(TO_DATE("Date", 'MM/DD/YYYY')), 'YYYY-MM-DD') AS min_date,
        TO_CHAR(MAX(TO_DATE("Date", 'MM/DD/YYYY')), 'YYYY-MM-DD') AS max_date
      FROM "Stock"
    `);

        console.log("Stock summary:", summary.rows[0]);
    } finally {
        await verificationClient.end();
    }
}

main().catch((error: unknown) => {
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "ECONNREFUSED"
    ) {
        console.error("Database connection refused. Check DATABASE_URL and DB server/network status.");
    }
    console.error(error);
    process.exit(1);
});

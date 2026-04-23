require("dotenv").config({ path: ".env" });
const { Client } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set. Please check your .env file.");
}

const client = new Client({
    connectionString,
});
client
    .connect()
    .then(() =>
        client.query(
            'SELECT p.id, p."userId", p.cash, pos.symbol, pos.shares, pos."avgCost" FROM "Portfolio" p JOIN "Position" pos ON p.id = pos."portfolioId"',
        ),
    )
    .then((res) => {
        console.log(res.rows);
        client.end();
    })
    .catch(console.error);

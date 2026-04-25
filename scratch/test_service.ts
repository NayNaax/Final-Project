import { StocksService } from "../backend/src/services/stocks.service";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function test() {
    try {
        const prices = await StocksService.getLatestPrices();
        console.log("Prices:", JSON.stringify(prices[0], null, 2));
    } catch (e) {
        console.error(e.message);
    }
}
test();

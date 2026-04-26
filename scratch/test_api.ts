import axios from "axios";

async function test() {
    try {
        const response = await axios.get("http://localhost:3001/api/stocks/raw");
        console.log("Raw Stocks:", JSON.stringify(response.data[0], null, 2));

        // Wait, /api/stocks is the one used by the frontend
        // But it requires auth. Maybe I can bypass or use /api/stocks/raw to see what's in DB
        // Actually StocksPage uses /api/stocks
    } catch (e) {
        console.error(e.message);
    }
}
test();

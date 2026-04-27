import axios from "axios";

async function test() {
    try {
        const response = await axios.get("http://localhost:3001/api/stocks/raw");
        console.log("Raw Stocks:", JSON.stringify(response.data[0], null, 2));

    } catch (e) {
        console.error(e.message);
    }
}
test();

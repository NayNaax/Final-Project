import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const port = 3001;
const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set. Please check your .env file.");
}

async function testNews() {
    const token = jwt.sign({ userId: 7, email: "nom@gmail.com" }, secret);
    try {
        const res = await axios.get(
            `http://localhost:${port}/api/stocks/company-news?symbol=AAPL&from=2024-01-01&to=2024-04-23`,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        console.log("News count:", res.data.items?.length);
        if (res.data.items && res.data.items.length > 0) {
            console.log("First item:", res.data.items[0].headline);
        }
    } catch (err: any) {
        console.error(err.response?.data || err.message);
    }
}
testNews();

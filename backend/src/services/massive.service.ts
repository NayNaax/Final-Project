import axios from "axios";

// Massive.com API integration service
export class MassiveService {
    private static API_URL = "https://massive.com/api"; // Example placeholder

    static async fetchQuote(symbol: string) {
        const apiKey = process.env.MASSIVE_API_KEY;
        if (!apiKey) {
            throw new Error("Missing MASSIVE_API_KEY");
        }

        try {
            // Assuming a GET /quote endpoint - adjust to Massive's actual API
            const response = await axios.get(`${this.API_URL}/quote`, {
                params: { symbol },
                headers: { Authorization: `Bearer ${apiKey}` },
            });
            return response.data;
        } catch (error: any) {
            console.error(`Failed to fetch quote for ${symbol} from Massive:`, error.message);
            throw new Error("Upstream API Error");
        }
    }
}

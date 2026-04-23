const axios = require('axios');

const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'SPY', 'QQQ', 'XOM', 'UNH', 'DIS', 'META', 'BRK.B', 'WMT', 'JPM', 'MA'];
const myPositions = {
    'AMZN': 1,
    'GOOGL': 13,
    'AAPL': 1.8
};
const API_KEY = "d75rphpr01qk56kdsis0d75rphpr01qk56kdsisg";

async function fetchDivInfo() {
    const results = [];
    for (const sym of symbols) {
        try {
            // Fetch basic financials to get the dividend yield or rate
            const res = await axios.get(`https://finnhub.io/api/v1/stock/metric?symbol=${sym}&metric=all&token=${API_KEY}`);
            const metrics = res.data.metric;
            
            // The format from finnhub might have 'dividendYieldIndicatedAnnual' and 'dividendPerShareAnnual' etc.
            const divRate = metrics?.dividendPerShareAnnual || metrics?.dividendYieldIndicatedAnnual || 0;
            
            // Finnhub also has a dividends endpoint to get recent dates
            const divRes = await axios.get(`https://finnhub.io/api/v1/stock/dividend?symbol=${sym}&from=2023-01-01&to=2025-12-31&token=${API_KEY}`);
            const divs = divRes.data;
            let exDate = "No Dividend";
            let payDate = "No Dividend";
            let actualDivRate = divRate;
            
            if (divs && divs.length > 0) {
                // sort by date descending
                divs.sort((a,b) => new Date(b.date) - new Date(a.date));
                const latest = divs[0];
                exDate = latest.date;
                payDate = latest.payDate;
                actualDivRate = latest.amount * 4; // roughly annualizing assuming quarterly, but will use metric if available
                if (divRate > 0) {
                    actualDivRate = divRate;
                }
            } else {
                actualDivRate = 0;
            }
            
            const sharesOwned = myPositions[sym] || 0;
            const myAnnualDiv = (sharesOwned * actualDivRate).toFixed(2);
            
            results.push({
                Symbol: sym,
                'Ex-Div Date': exDate,
                'Pay Date': payDate,
                'Div Rate (Annual)': parseFloat(actualDivRate).toFixed(2),
                'Shares': sharesOwned,
                'Annual $': parseFloat(myAnnualDiv) || 0
            });
        } catch(e) {
            console.error('Error fetching', sym, e.message);
        }
    }
    console.table(results);
}

fetchDivInfo();

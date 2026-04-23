# Learning Hub — Full Lesson Content

> **Companion to:** `learn_plan.md`  
> **Purpose:** Complete educational text, quiz questions, glossary, and mission definitions ready for implementation.

---

# MODULE 1: Stock Market 101 — The Absolute Basics

---

## Lesson 1.1 — What Is a Stock?

### Content

When you buy a **stock**, you're buying a tiny piece of ownership in a real company. Each piece is called a **share**. If a company has 1,000,000 shares and you own 100 of them, you own 0.01% of that company.

**Why do companies sell shares?**

Companies need money to grow — to build new products, hire employees, or expand into new markets. Instead of borrowing from a bank, they can **go public** through an **IPO (Initial Public Offering)**, which means they sell shares to everyday investors like you for the first time.

**What do you get as a shareholder?**

- **Potential profit:** If the company does well, the value of your shares goes up. You can sell them later for more than you paid — that's called a **capital gain**.
- **Dividends:** Some companies share their profits directly with shareholders through regular cash payments called **dividends**.
- **Voting rights:** On major company decisions (like electing board members), each share usually gives you one vote.

**Key takeaway:** A stock is not a lottery ticket. It represents real ownership in a real business. When you buy shares of Apple, you literally own a fraction of Apple Inc.

### Quiz

```json
[
  {
    "question": "What does owning a stock represent?",
    "options": [
      "A loan you gave to a company",
      "A small piece of ownership in a company",
      "A promise that the company will pay you back",
      "A contract to work for the company"
    ],
    "correctIndex": 1
  },
  {
    "question": "What is an IPO?",
    "options": [
      "A type of stock order",
      "When a company buys back its own shares",
      "When a company sells shares to the public for the first time",
      "A government regulation on stocks"
    ],
    "correctIndex": 2
  },
  {
    "question": "What is a 'capital gain'?",
    "options": [
      "The initial price you pay for a stock",
      "A regular payment from a company to shareholders",
      "The profit you make when you sell a stock for more than you paid",
      "A fee charged by the stock exchange"
    ],
    "correctIndex": 2
  }
]
```

---

## Lesson 1.2 — The Stock Market Explained

### Content

The **stock market** is where buyers and sellers come together to trade shares of public companies. Think of it like a massive, digital marketplace — except instead of buying vegetables, you're buying pieces of businesses.

**The major exchanges:**

- **NYSE (New York Stock Exchange):** The largest stock exchange in the world. Companies like Coca-Cola, Disney, and Goldman Sachs trade here.
- **NASDAQ:** Known for technology companies. Apple, Microsoft, Google (Alphabet), Amazon, and Tesla all trade on NASDAQ.

**How does a trade happen?**

When you want to buy a stock, your order gets matched with someone who wants to sell that same stock at a price you both agree on. This matching happens electronically in milliseconds.

**Market hours:**

The US stock market is open **Monday through Friday, 9:30 AM to 4:00 PM Eastern Time**. It's closed on weekends and major holidays. Some brokers offer **pre-market** (before 9:30 AM) and **after-hours** (after 4:00 PM) trading, but with less activity and wider price spreads.

**Why do prices change?**

Stock prices move based on **supply and demand**. If more people want to buy a stock than sell it, the price goes up. If more people want to sell than buy, the price goes down. News, earnings reports, economic data, and even social media can all influence how many people want to buy or sell.

**Key takeaway:** The stock market is simply a meeting place for buyers and sellers. Prices change every second based on how many people want to buy versus sell.

### Quiz

```json
[
  {
    "question": "What is NASDAQ best known for?",
    "options": [
      "Government bonds",
      "Technology companies",
      "Real estate stocks only",
      "International currencies"
    ],
    "correctIndex": 1
  },
  {
    "question": "What are the regular US stock market trading hours (Eastern Time)?",
    "options": [
      "8:00 AM to 5:00 PM",
      "9:30 AM to 4:00 PM",
      "10:00 AM to 3:00 PM",
      "24 hours a day, 7 days a week"
    ],
    "correctIndex": 1
  },
  {
    "question": "What primarily causes stock prices to go up?",
    "options": [
      "The CEO decides to raise prices",
      "The government increases the stock's value",
      "More people want to buy the stock than sell it",
      "The stock has been listed for a long time"
    ],
    "correctIndex": 2
  }
]
```

---

## Lesson 1.3 — Understanding the Quote

### Content

When you look at a stock on any trading platform (including this sandbox!), you'll see several important numbers. Let's break them down.

**Ticker symbol:** Every publicly traded company has a short code called a **ticker symbol**. For example:
- **AAPL** = Apple
- **MSFT** = Microsoft
- **TSLA** = Tesla
- **GOOGL** = Alphabet (Google)

**The current price** is the price of the last trade that happened. It changes constantly during market hours.

**Bid vs. Ask:**

- **Bid price:** The highest price a buyer is currently willing to pay.
- **Ask price:** The lowest price a seller is currently willing to accept.
- **Spread:** The difference between the bid and ask. A smaller spread usually means the stock is more frequently traded (more **liquid**).

Example: If Apple's bid is $175.50 and ask is $175.55, the spread is $0.05. That's a very tight spread — lots of buyers and sellers.

**Volume:** The total number of shares traded during the current day. **High volume** means lots of activity — many people are trading this stock. **Low volume** can mean wider spreads and harder-to-execute orders.

**Day's Range:** Shows the lowest and highest price the stock has traded at during the current day. This tells you how volatile the stock has been today.

**Key takeaway:** The bid is what buyers will pay, the ask is what sellers want, and volume tells you how active the stock is. Always check these before placing a trade.

### Quiz

```json
[
  {
    "question": "What is a ticker symbol?",
    "options": [
      "A stock's daily trading volume",
      "A short code that identifies a publicly traded company",
      "The price at which a stock was first listed",
      "A type of stock order"
    ],
    "correctIndex": 1
  },
  {
    "question": "If a stock's bid is $50.00 and ask is $50.20, what is the spread?",
    "options": [
      "$50.10",
      "$100.20",
      "$0.20",
      "$0.10"
    ],
    "correctIndex": 2
  },
  {
    "question": "What does high trading volume typically indicate?",
    "options": [
      "The stock price is going up",
      "The stock is very expensive",
      "Many people are actively trading the stock",
      "The stock is about to be delisted"
    ],
    "correctIndex": 2
  }
]
```

---

## Lesson 1.4 — Order Types

### Content

Before you can buy or sell a stock in this sandbox, you need to understand the different types of orders. This is one of the most practical lessons — you'll use this knowledge every time you trade.

**1. Market Order** — "Buy/sell right now at whatever the current price is."

- **Pros:** Executes immediately. Guaranteed to fill (if the market is open).
- **Cons:** You might pay slightly more (or sell for slightly less) than expected, especially with volatile stocks.
- **Best for:** When you want to get into or out of a position quickly and price precision doesn't matter much.

**2. Limit Order** — "Buy/sell only at this specific price or better."

- **Buy limit:** "I'll only buy if the price drops to $150 or lower."
- **Sell limit:** "I'll only sell if the price rises to $200 or higher."
- **Pros:** You control the exact price. No surprises.
- **Cons:** Your order might never fill if the price doesn't reach your limit.
- **Best for:** When you have a target price in mind and you're willing to wait.

**3. Stop-Loss Order** — "Automatically sell if the price drops to this level."

- Example: You bought a stock at $100. You set a stop-loss at $90. If the price falls to $90, your shares are automatically sold to prevent further losses.
- **Pros:** Protects you from big losses without you needing to watch the screen all day.
- **Cons:** The stock might dip to $90, trigger your stop-loss, then bounce back up to $120 — and you'd have missed that recovery.
- **Best for:** Risk management. Setting a "maximum loss" you're willing to accept on a trade.

**Key takeaway:** Market orders are fast, limit orders are precise, and stop-losses protect you. Most experienced traders use a combination of all three.

### Quiz

```json
[
  {
    "question": "Which order type guarantees your trade executes immediately?",
    "options": [
      "Limit Order",
      "Stop-Loss Order",
      "Market Order",
      "All of the above"
    ],
    "correctIndex": 2
  },
  {
    "question": "You set a buy limit order at $50. The stock is currently at $55. When will your order fill?",
    "options": [
      "Immediately at $55",
      "Only if the price drops to $50 or below",
      "At the end of the trading day",
      "It will never fill"
    ],
    "correctIndex": 1
  },
  {
    "question": "What is the main purpose of a stop-loss order?",
    "options": [
      "To buy more shares automatically",
      "To guarantee a profit on your trade",
      "To limit your losses by automatically selling if the price drops",
      "To place an order after market hours"
    ],
    "correctIndex": 2
  }
]
```

---

# MODULE 2: Evaluating a Company — Fundamental Analysis

---

## Lesson 2.1 — Market Capitalization

### Content

**Market capitalisation** (market cap) tells you the total value of a company on the stock market. It's calculated by multiplying the current share price by the total number of outstanding shares.

**Formula:** `Market Cap = Share Price × Total Shares Outstanding`

Example: If a company has 1 billion shares and each share costs $150, its market cap is $150 billion.

**Size categories:**

| Category | Market Cap | Examples | Risk Level |
|----------|-----------|----------|------------|
| **Large-cap** | Over $10 billion | Apple, Microsoft, Amazon | Lower risk, slower growth |
| **Mid-cap** | $2–10 billion | Etsy, Zillow | Moderate risk, moderate growth |
| **Small-cap** | Under $2 billion | Newer or niche companies | Higher risk, potentially higher growth |

**Why does this matter to you?**

- **Large-cap stocks** are like ocean liners — big, stable, and unlikely to sink overnight. They're good for building a solid foundation in your portfolio.
- **Small-cap stocks** are like speedboats — they can move fast in either direction. Higher potential reward, but also higher risk of significant losses.
- **Mid-cap stocks** sit in between, offering a balance of growth potential and stability.

**A common beginner mistake** is looking at the *share price* to judge if a company is "big" or "small." A $10 stock isn't necessarily a small company — it might just have billions of shares outstanding. Always look at market cap, not just the price per share.

**Key takeaway:** Market cap tells you the size of a company. Bigger companies are generally safer but grow slower. Smaller companies are riskier but can grow faster.

### Quiz

```json
[
  {
    "question": "How is market capitalisation calculated?",
    "options": [
      "Revenue minus expenses",
      "Share price multiplied by total shares outstanding",
      "Total assets minus total liabilities",
      "Annual profit divided by number of employees"
    ],
    "correctIndex": 1
  },
  {
    "question": "A large-cap company typically has a market cap of:",
    "options": [
      "Under $500 million",
      "$500 million to $2 billion",
      "$2 billion to $10 billion",
      "Over $10 billion"
    ],
    "correctIndex": 3
  },
  {
    "question": "Which statement about small-cap stocks is most accurate?",
    "options": [
      "They are always bad investments",
      "They have lower risk than large-cap stocks",
      "They can potentially grow faster but carry higher risk",
      "They always pay higher dividends"
    ],
    "correctIndex": 2
  }
]
```

---

## Lesson 2.2 — Key Ratios Made Simple

### Content

Numbers on their own don't mean much. Is a stock priced at $200 expensive? Is one at $15 cheap? You can't tell just from the price. **Financial ratios** help you compare apples to apples (no pun intended).

**1. P/E Ratio (Price-to-Earnings)**

The most commonly used ratio. It tells you how much investors are willing to pay for each dollar of a company's earnings.

`P/E Ratio = Share Price ÷ Earnings Per Share (EPS)`

- A P/E of 20 means investors pay $20 for every $1 the company earns annually.
- **High P/E (30+):** Investors expect fast future growth (e.g., tech companies). But it could also mean the stock is overvalued.
- **Low P/E (under 15):** Could be a bargain, or the company might be struggling. Always dig deeper.

**2. EPS (Earnings Per Share)**

How much profit a company makes per share.

`EPS = Net Profit ÷ Total Shares Outstanding`

- A rising EPS over several quarters is a healthy sign — the company is becoming more profitable.
- A declining EPS could signal trouble.

**3. Dividend Yield**

If a company pays dividends, this tells you the annual return you get from dividends alone.

`Dividend Yield = Annual Dividend Per Share ÷ Share Price × 100`

- Example: A stock costs $100 and pays $3 per year in dividends. Dividend yield = 3%.
- **High yield (4%+)** can be attractive for income, but be cautious — sometimes a high yield means the stock price has dropped significantly.

**Key takeaway:** P/E tells you how "expensive" a stock is relative to its earnings. EPS tells you profitability per share. Dividend yield tells you what income you'll receive. No single ratio tells the whole story — use them together.

### Quiz

```json
[
  {
    "question": "A stock has a P/E ratio of 25. What does this mean?",
    "options": [
      "The stock price is $25",
      "Investors pay $25 for every $1 of the company's annual earnings",
      "The company has 25 employees",
      "The stock has gone up 25% this year"
    ],
    "correctIndex": 1
  },
  {
    "question": "If a company's EPS has been rising for 4 consecutive quarters, this generally indicates:",
    "options": [
      "The company is losing money",
      "The stock price is too high",
      "The company is becoming more profitable",
      "The company is about to go bankrupt"
    ],
    "correctIndex": 2
  },
  {
    "question": "A stock priced at $80 pays $2.40 in annual dividends. What is the dividend yield?",
    "options": [
      "2.4%",
      "3%",
      "0.3%",
      "30%"
    ],
    "correctIndex": 1
  }
]
```

---

## Lesson 2.3 — Earnings Reports

### Content

Four times a year, every public company must report its financial results. These are called **quarterly earnings reports**, and they are one of the most important events for any stock.

**What's in an earnings report?**

- **Revenue:** Total money the company brought in (sales).
- **Net income:** Profit after all expenses, taxes, and costs.
- **EPS:** Earnings per share (we covered this in Lesson 2.2).
- **Guidance:** The company's outlook for the next quarter or year — this often moves the stock price more than the actual numbers.

**Why do stock prices go crazy around earnings?**

Before earnings day, Wall Street analysts publish their **estimates** — predictions of what they think the company's revenue and EPS will be. When the actual numbers come out:

- **Beat expectations:** Stock often jumps up — the company did better than predicted.
- **Miss expectations:** Stock often drops — even if the company was profitable, it wasn't as profitable as people expected.
- **Meet expectations:** Stock might barely move — no surprise.

**Earnings surprises can be dramatic.** A stock might drop 10% even after reporting a profit, simply because analysts expected *more* profit. This is why the market often feels irrational around earnings — it's not about absolute numbers, it's about expectations vs. reality.

**A practical tip for this sandbox:**

Be cautious about buying a stock right before its earnings report. The uncertainty means big price swings in either direction. Many experienced traders wait until *after* earnings to make their move.

**Key takeaway:** Earnings reports happen quarterly and reveal a company's financial health. Stock prices react based on whether results beat, meet, or miss analyst expectations — not just whether the company made money.

### Quiz

```json
[
  {
    "question": "How often do public companies release earnings reports?",
    "options": [
      "Once a year",
      "Twice a year",
      "Four times a year (quarterly)",
      "Every month"
    ],
    "correctIndex": 2
  },
  {
    "question": "A company reports $2.50 EPS, but analysts expected $3.00 EPS. What likely happens to the stock?",
    "options": [
      "The price goes up because the company made money",
      "The price likely drops because it missed expectations",
      "Nothing happens",
      "The stock gets delisted"
    ],
    "correctIndex": 1
  },
  {
    "question": "What is 'guidance' in an earnings report?",
    "options": [
      "The company's stock price target",
      "The company's outlook and predictions for the next quarter",
      "A list of the company's products",
      "Instructions for how to buy the company's stock"
    ],
    "correctIndex": 1
  }
]
```

---

## Lesson 2.4 — ETFs vs. Individual Stocks

### Content

So far we've been talking about buying individual company stocks. But there's another option that many experts recommend, especially for beginners: **ETFs**.

**What is an ETF?**

An **Exchange-Traded Fund** is a basket of multiple stocks bundled into a single investment that trades on the stock exchange just like a regular stock. When you buy one share of an ETF, you're effectively buying a tiny piece of every company inside that basket.

**Popular examples:**

| ETF | What it tracks | What you're buying |
|-----|---------------|-------------------|
| **SPY** | S&P 500 | The 500 largest US companies |
| **QQQ** | NASDAQ-100 | Top 100 tech-heavy companies |
| **VTI** | Total US Market | Nearly every US public company |
| **DIA** | Dow Jones | 30 major US industrial companies |

**ETFs vs Individual stocks:**

| | Individual Stocks | ETFs |
|---|---|---|
| **Diversification** | You own one company | You own dozens or hundreds |
| **Risk** | Higher — one bad earnings report can tank it | Lower — bad news for one company is offset by others |
| **Potential reward** | Higher — if you pick the right stock | Moderate — you get the market average |
| **Research needed** | A lot — you must analyse each company | Less — you're betting on the overall market |
| **Best for** | Experienced investors with strong convictions | Beginners building a solid foundation |

**The "boring but effective" strategy:**

Many billionaire investors (including Warren Buffett) recommend that most people simply buy a low-cost S&P 500 ETF and hold it for decades. Historically, the S&P 500 has returned about **10% per year** on average over the long term.

**Key takeaway:** ETFs let you invest in many companies at once, reducing risk through diversification. They're an excellent starting point for beginners while you learn to evaluate individual stocks.

### Quiz

```json
[
  {
    "question": "What is an ETF?",
    "options": [
      "A single company's stock that trades after hours",
      "A basket of multiple stocks bundled into one tradable investment",
      "A type of government bond",
      "A savings account offered by stock exchanges"
    ],
    "correctIndex": 1
  },
  {
    "question": "If you buy one share of SPY, what are you investing in?",
    "options": [
      "Only technology companies",
      "A single large company",
      "The 500 largest US companies",
      "International markets only"
    ],
    "correctIndex": 2
  },
  {
    "question": "What is the main advantage of ETFs over individual stocks for beginners?",
    "options": [
      "ETFs always go up in value",
      "ETFs are free to trade",
      "ETFs provide instant diversification, reducing risk",
      "ETFs pay higher dividends than any individual stock"
    ],
    "correctIndex": 2
  }
]
```

---

# MODULE 3: Reading the Charts — Technical Analysis

---

## Lesson 3.1 — Candlestick Charts

### Content

Charts are the language of the stock market. Learning to read them gives you a visual understanding of how a stock has been moving — which is far more intuitive than staring at raw numbers.

The most popular chart type among traders is the **candlestick chart**. Each "candle" represents a single time period (one day, one hour, etc.) and shows four key pieces of information:

**Anatomy of a candlestick:**

- **Open:** The price when the period started.
- **Close:** The price when the period ended.
- **High:** The highest price reached during the period.
- **Low:** The lowest price reached during the period.

**Colours:**

- 🟩 **Green (bullish):** The price went UP. The close is higher than the open.
- 🟥 **Red (bearish):** The price went DOWN. The close is lower than the open.

**The body** (thick part) shows the range between open and close. **The wicks** (thin lines above and below) show the high and low.

**Reading the candles:**

- **Long green body:** Strong buying pressure — buyers dominated.
- **Long red body:** Strong selling pressure — sellers dominated.
- **Short body with long wicks:** Indecision — the price moved a lot but ended up close to where it started.
- **No body (just a line):** Called a **doji** — perfect indecision. Open and close are the same.

**Pro tip:** You can switch between line charts and candlestick charts right here in this sandbox! Go to Settings and change your chart style to see the difference.

**Key takeaway:** Each candlestick shows how a stock's price moved during a time period. Green means the price went up, red means it went down. The size of the body and wicks tells you how strong the move was.

### Quiz

```json
[
  {
    "question": "A green candlestick means:",
    "options": [
      "The stock paid a dividend",
      "The closing price was higher than the opening price",
      "The stock hit its all-time high",
      "Trading volume was above average"
    ],
    "correctIndex": 1
  },
  {
    "question": "What do the thin lines (wicks) above and below a candlestick represent?",
    "options": [
      "The opening and closing prices",
      "The trading volume",
      "The highest and lowest prices during that period",
      "The previous day's prices"
    ],
    "correctIndex": 2
  },
  {
    "question": "A candle with a very small body and long wicks on both sides suggests:",
    "options": [
      "Strong buying pressure",
      "Strong selling pressure",
      "Market indecision — the price moved a lot but ended near where it started",
      "The stock is about to be delisted"
    ],
    "correctIndex": 2
  }
]
```

---

## Lesson 3.2 — Trends, Support & Resistance

### Content

Stocks don't move randomly. Over time, they tend to move in **trends** — and recognising these trends is one of the most valuable skills in trading.

**Types of trends:**

- **Uptrend:** The price is making higher highs and higher lows. Like climbing stairs — each step up is higher than the last.
- **Downtrend:** The price is making lower highs and lower lows. Like walking downstairs.
- **Sideways (ranging):** The price bounces between two levels without a clear direction.

**Support — the floor:**

**Support** is a price level where a stock tends to stop falling and bounce back up. It's like a floor. Why? Because at that price, enough buyers step in to buy, creating demand that stops the price from falling further.

If you notice a stock bouncing off $140 three times, that $140 level is a support level. Traders watch these levels to plan their buys.

**Resistance — the ceiling:**

**Resistance** is a price level where a stock tends to stop rising and pull back down. It's like a ceiling. At that price, enough sellers step in to take profits, creating supply that stops the price from rising further.

If a stock keeps failing to break above $180, that $180 level is a resistance level.

**What happens at a breakout?**

When a stock breaks through resistance, it often signals the beginning of a new uptrend. When it breaks below support, it could signal further declines. These moments are called **breakouts** (upward) and **breakdowns** (downward).

**Practical tip:** Draw imaginary horizontal lines at the levels where a stock repeatedly bounces off. These are your support and resistance levels. They're not exact — think of them as zones rather than precise prices.

**Key takeaway:** Uptrends make higher highs, downtrends make lower lows. Support is where the price tends to bounce up, resistance is where it gets pushed back down. Watch for breakouts through these levels.

### Quiz

```json
[
  {
    "question": "An uptrend is characterised by:",
    "options": [
      "Lower highs and lower lows",
      "Higher highs and higher lows",
      "The price staying flat",
      "Alternating big gains and big losses"
    ],
    "correctIndex": 1
  },
  {
    "question": "A support level is best described as:",
    "options": [
      "The highest price a stock has ever reached",
      "A price level where the stock tends to stop falling and bounce up",
      "The average price over the last year",
      "The price at which the company's CEO sells their shares"
    ],
    "correctIndex": 1
  },
  {
    "question": "A stock has been unable to rise above $200 three times. This $200 level is called:",
    "options": [
      "A support level",
      "A market cap",
      "A resistance level",
      "A dividend yield"
    ],
    "correctIndex": 2
  }
]
```

---

## Lesson 3.3 — Moving Averages (SMA & EMA)

### Content

Looking at raw price data can be noisy — stocks bounce up and down daily, making it hard to see the bigger picture. **Moving averages** smooth out this noise by calculating the average price over a set number of days.

**Simple Moving Average (SMA):**

The SMA takes the average closing price over a specific period.

- **50-day SMA:** Average closing price of the last 50 trading days.
- **200-day SMA:** Average closing price of the last 200 trading days.

This creates a smooth line on the chart that shows the general direction of the trend.

**Exponential Moving Average (EMA):**

The EMA works similarly but gives **more weight to recent prices**, making it react faster to price changes. This is useful for short-term traders who want quicker signals.

**How do traders use moving averages?**

1. **Trend direction:** If the price is above the 200-day SMA, the stock is generally in an uptrend. Below it = downtrend.

2. **Golden Cross 🟡:** When the 50-day SMA crosses *above* the 200-day SMA, it's seen as a bullish signal — suggesting the start of an uptrend.

3. **Death Cross 💀:** When the 50-day SMA crosses *below* the 200-day SMA, it's seen as a bearish signal — suggesting the start of a downtrend.

These signals aren't foolproof — no indicator is. But they're widely watched by traders, which makes them somewhat self-fulfilling.

**A practical example:**

Imagine Apple's stock price is at $175. The 50-day SMA is at $170 (below the price) and the 200-day SMA is at $165 (even lower). This tells you:
- The stock is trading above both averages → **bullish position**.
- The short-term trend (50-day) is above the long-term trend (200-day) → **no death cross warning**.

**Key takeaway:** Moving averages smooth out daily noise so you can see the real trend. The 200-day SMA is the most watched — prices above it suggest an uptrend, below it suggest a downtrend.

### Quiz

```json
[
  {
    "question": "What does a Simple Moving Average (SMA) do?",
    "options": [
      "Predicts the exact future stock price",
      "Calculates the average closing price over a set period to smooth out noise",
      "Shows the total trading volume",
      "Measures the company's revenue growth"
    ],
    "correctIndex": 1
  },
  {
    "question": "What is a 'Golden Cross'?",
    "options": [
      "When a stock hits its all-time high",
      "When the 50-day SMA crosses above the 200-day SMA",
      "When a stock's price doubles",
      "When the market opens on a holiday"
    ],
    "correctIndex": 1
  },
  {
    "question": "If a stock is trading BELOW its 200-day SMA, what does this generally suggest?",
    "options": [
      "The stock is a great buy opportunity",
      "The stock is overvalued",
      "The stock is in a general downtrend",
      "Trading volume is too low"
    ],
    "correctIndex": 2
  }
]
```

---

## Lesson 3.4 — RSI (Relative Strength Index)

### Content

The **RSI** is a momentum indicator that tells you whether a stock has been bought too aggressively (overbought) or sold too aggressively (oversold). It's a number from 0 to 100.

**The key levels:**

- **RSI above 70:** The stock is considered **overbought**. It's been going up a lot and might be due for a pullback.
- **RSI below 30:** The stock is considered **oversold**. It's been going down a lot and might be due for a bounce back.
- **RSI between 30 and 70:** Neutral territory — no extreme signal.

**How is RSI calculated?**

Don't worry about the formula — your trading platform calculates it for you. What matters is understanding what the number means:

- An RSI of 80 doesn't mean "sell immediately." It means "be cautious — the stock may have risen too fast."
- An RSI of 20 doesn't mean "buy immediately." It means "the stock might be undervalued — worth investigating."

**Common mistakes with RSI:**

1. **Treating it as a crystal ball:** RSI tells you about *momentum*, not the future. A stock can stay overbought (RSI > 70) for weeks during a strong rally.
2. **Using it alone:** RSI works best when combined with other tools (like support/resistance levels from Lesson 3.2 and moving averages from Lesson 3.3).

**A practical example:**

A stock drops from $100 to $60 in two weeks. Its RSI falls to 22 (oversold). This doesn't mean it will immediately bounce back — but it tells you the selling has been extreme. If the stock is also sitting at a strong support level, that's two signals lining up → a stronger case for a potential bounce.

**Key takeaway:** RSI measures momentum. Above 70 = overbought (caution with buying), below 30 = oversold (potential opportunity). Never use RSI alone — always combine it with other indicators and context.

### Quiz

```json
[
  {
    "question": "An RSI of 75 suggests the stock is:",
    "options": [
      "Oversold — it might bounce up",
      "Overbought — it might pull back",
      "At its fair value",
      "About to pay a dividend"
    ],
    "correctIndex": 1
  },
  {
    "question": "What is the RSI range?",
    "options": [
      "-100 to +100",
      "0 to 100",
      "0 to 1000",
      "There is no range limit"
    ],
    "correctIndex": 1
  },
  {
    "question": "Why is it dangerous to use RSI as a sole indicator?",
    "options": [
      "RSI is always wrong",
      "RSI only works for tech stocks",
      "A stock can stay overbought or oversold for extended periods during strong trends",
      "RSI is too complicated to calculate"
    ],
    "correctIndex": 2
  }
]
```

---

# MODULE 4: Risk Management & Psychology — The Most Important Module

---

## Lesson 4.1 — Diversification

### Content

**"Don't put all your eggs in one basket."** This is possibly the single most important rule in investing.

**Diversification** means spreading your money across multiple different investments so that if one goes bad, it doesn't wipe out your entire portfolio.

**Why diversification matters:**

Imagine you put 100% of your $10,000 sandbox cash into a single stock. If that stock drops 50%, you've lost $5,000. But if you spread your money across 10 different stocks and one drops 50%, you've only lost about $500 — the other 9 stocks cushion the blow.

**Types of diversification:**

1. **Across sectors:** Don't put all your money in tech stocks. Spread across technology, healthcare, energy, consumer goods, and finance.
2. **Across company sizes:** Mix large-cap blue chips (stable) with some mid-cap or small-cap stocks (growth potential).
3. **Across asset types:** In a real portfolio, you'd also include bonds, real estate, and international stocks. In this sandbox, focus on mixing individual stocks with ETFs.

**The "right" number of stocks:**

Research suggests that holding **15–20 different stocks** across different sectors gives you most of the benefits of diversification. Beyond that, you get diminishing returns and it becomes harder to track.

**Common diversification mistakes:**

- **Fake diversification:** Owning Apple, Microsoft, Google, Amazon, and Meta — that's 5 stocks but they're ALL big tech. If the tech sector crashes, they'll all drop together.
- **Over-diversification:** Owning 50+ stocks means each one barely impacts your returns. At that point, just buy an ETF.

**Check your portfolio:** Look at your portfolio page in this sandbox. What percentage of your money is in a single stock or sector? If any single position is more than 20% of your total portfolio, you might be too concentrated.

**Key takeaway:** Spread your investments across different stocks, sectors, and asset types. If any single position is more than 10–20% of your portfolio, consider rebalancing.

### Quiz

```json
[
  {
    "question": "What is diversification?",
    "options": [
      "Buying the most expensive stocks you can find",
      "Spreading your investments across different assets to reduce risk",
      "Focusing all your money on one stock for maximum returns",
      "Only investing in ETFs"
    ],
    "correctIndex": 1
  },
  {
    "question": "Why is owning 5 different tech stocks NOT true diversification?",
    "options": [
      "5 stocks is too few",
      "They are all in the same sector and would likely all drop together during a tech downturn",
      "Tech stocks never go down",
      "You should only own 3 stocks maximum"
    ],
    "correctIndex": 1
  },
  {
    "question": "Research suggests that holding how many stocks provides most diversification benefits?",
    "options": [
      "2-3 stocks",
      "5-10 stocks",
      "15-20 stocks across different sectors",
      "100+ stocks"
    ],
    "correctIndex": 2
  }
]
```

---

## Lesson 4.2 — Position Sizing

### Content

Even with a diversified portfolio, you can still blow up your account if you put too much money into any single trade. **Position sizing** is the discipline of deciding *how much* of your total capital to risk on each trade.

**The 1-2% rule:**

The most widely recommended guideline is: **never risk more than 1-2% of your total account on any single trade.**

Here's what that looks like with a $10,000 sandbox account:

| Risk Per Trade | Max Loss Allowed | What it means |
|---|---|---|
| 1% | $100 | If the trade goes wrong, you lose at most $100 |
| 2% | $200 | If the trade goes wrong, you lose at most $200 |

**Wait — that doesn't mean you can only buy $100 worth of stock.**

The 1-2% rule is about how much you're *willing to lose*, not how much you invest. Here's the difference:

**Example:** You have $10,000. You want to buy a stock at $50.
- You set a stop-loss at $45 (you'll sell if it drops $5 per share).
- Max risk = 1% of $10,000 = $100
- $100 ÷ $5 risk per share = **20 shares** ($1,000 invested)

So you'd buy $1,000 worth, knowing that if your stop-loss hits, you only lose $100 (1% of your account).

**Why is this important?**

Without position sizing, a few bad trades can destroy your account. With it, you can survive a long streak of losses and still have capital to trade with.

**The math of losses:**

| Loss | Gain needed to recover |
|------|----------------------|
| 10% | 11% gain to break even |
| 25% | 33% gain to break even |
| 50% | 100% gain to break even |
| 90% | 900% gain to break even |

The bigger the hole, the harder it is to climb out. Position sizing keeps the holes small.

**Key takeaway:** Never risk more than 1-2% of your total account on a single trade. Calculate your position size based on where you'll set your stop-loss, not just how much cash you have.

### Quiz

```json
[
  {
    "question": "The 1-2% rule in position sizing means:",
    "options": [
      "Only invest 1-2% of your money in stocks",
      "Never risk more than 1-2% of your total account on a single trade",
      "Only buy stocks that cost $1-$2 per share",
      "Sell any stock that drops by 1-2%"
    ],
    "correctIndex": 1
  },
  {
    "question": "If you lose 50% of your portfolio, how much gain do you need to break even?",
    "options": [
      "50% gain",
      "75% gain",
      "100% gain",
      "200% gain"
    ],
    "correctIndex": 2
  },
  {
    "question": "With a $10,000 account and 2% risk, what is the maximum you should lose on any single trade?",
    "options": [
      "$20",
      "$100",
      "$200",
      "$2,000"
    ],
    "correctIndex": 2
  }
]
```

---

## Lesson 4.3 — Managing Emotions

### Content

Ask any experienced trader what the hardest part of trading is, and they'll almost never say "picking stocks." They'll say **"managing my emotions."**

Your brain isn't wired for trading. It evolved to survive in the wild, not to make rational financial decisions. Here are the biggest emotional traps:

**1. FOMO (Fear Of Missing Out)**

You see a stock up 30% this week, everyone's talking about it, and you think: *"I need to get in NOW before it goes higher!"*

This is FOMO. It makes you buy at the worst possible time — after the move has already happened. The reality? By the time everyone is excited, the easy gains are usually gone.

**Antidote:** Ask yourself, "Would I buy this stock if it were not in the news right now?" If no, walk away.

**2. Panic Selling**

Your stock drops 10% in a day and you immediately sell to "save what's left." Then next week, it recovers and goes higher.

Panic selling locks in losses that were only temporary. Stocks move up and down — that's normal volatility, not a reason to sell.

**Antidote:** Before you buy, decide your exit strategy. If you planned to hold unless it drops 20%, stick to that plan when it drops 10%. Don't react in the moment.

**3. Confirmation Bias**

You love a stock, so you only read positive news about it and ignore warning signs. You convince yourself it's going to the moon, ignoring the falling revenue, rising debt, and insider selling.

**Antidote:** For every bullish argument, actively search for one bearish argument. Try to prove yourself wrong.

**4. Revenge Trading**

You lose money on a trade, and immediately you make another aggressive trade to "win it back." This almost always leads to bigger losses.

**Antidote:** After a losing trade, take a break. Walk away from the screen. Come back with a clear head.

**The Trading Journal advantage:**

This is why we built the post-trade journal in this sandbox. When you sell a stock, you record *why*. Later, you can review: "Was my 'Panic' sell actually justified, or did I leave money on the table?" Learning from your own emotions is the fastest way to improve.

**Key takeaway:** Emotions are the #1 enemy of traders. Set your plan *before* you trade. Don't buy because of FOMO, don't sell because of panic, and always be willing to prove yourself wrong.

### Quiz

```json
[
  {
    "question": "What is FOMO in trading?",
    "options": [
      "A type of stock order",
      "Fear Of Missing Out — buying impulsively because a stock is rising",
      "A technical indicator like RSI",
      "A government regulation"
    ],
    "correctIndex": 1
  },
  {
    "question": "What is the best antidote to panic selling?",
    "options": [
      "Never invest in stocks",
      "Set your exit strategy BEFORE you buy, and stick to it",
      "Check your portfolio every 5 minutes",
      "Only buy stocks that never go down"
    ],
    "correctIndex": 1
  },
  {
    "question": "What is 'confirmation bias' in investing?",
    "options": [
      "Confirming your order before it executes",
      "Only paying attention to information that supports your existing belief about a stock",
      "Having a broker confirm your trades",
      "Waiting for a stock to confirm a trend before buying"
    ],
    "correctIndex": 1
  }
]
```

---

## Lesson 4.4 — Creating a Trading Plan

### Content

A **trading plan** is a written set of rules you follow for every trade. It removes emotion from the process and turns trading into a disciplined, repeatable system.

**Why do you need a plan?**

Without a plan, you're guessing. And guessing in the stock market is just gambling. A plan forces you to:
- Think before you act
- Define your risk before you enter a trade
- Stick to a strategy when emotions kick in

**The 5 questions to answer before every trade:**

1. **Why am I buying this?**
   - "Because it's going up" is NOT a valid answer.
   - Valid: "The company has beaten earnings 3 quarters in a row, trades below its historical P/E, and the RSI is at 35 (oversold)."

2. **How much am I investing?**
   - Use position sizing (Lesson 4.2). No more than 1-2% risk.

3. **What is my entry point?**
   - The specific price at which you'll buy. Use a limit order if you want precision.

4. **What is my stop-loss?**
   - The price at which you'll cut your losses. Set this BEFORE you buy. Don't change it later because of emotion.

5. **What is my profit target?**
   - The price at which you'll sell to lock in gains. Be realistic.

**Calculate your Risk/Reward ratio:**

Before entering a trade, calculate: how much can you lose (risk) vs. how much can you gain (reward)?

- **Entry:** $100
- **Stop-loss:** $95 (risk = $5)
- **Target:** $115 (reward = $15)
- **Risk/Reward = 1:3** (risking $5 to potentially make $15)

Most traders look for at least a **1:2 risk/reward ratio**. If your potential reward isn't at least twice your potential risk, the trade might not be worth taking.

**Write it down:**

Seriously — write your plan in a notebook, a note on your phone, or use the trade journal in this sandbox. The act of writing forces clarity and commitment.

**Key takeaway:** A trading plan is your edge. Answer the 5 questions before every trade. Set your stop-loss and target BEFORE you buy. Aim for at least a 1:2 risk/reward ratio. Write it down and stick to it.

### Quiz

```json
[
  {
    "question": "Which of these is a valid reason to buy a stock?",
    "options": [
      "It went up 20% yesterday",
      "Everyone on social media is talking about it",
      "The company beat earnings, trades below historical P/E, and RSI is oversold",
      "The stock has a cool ticker symbol"
    ],
    "correctIndex": 2
  },
  {
    "question": "What is a Risk/Reward ratio of 1:3?",
    "options": [
      "You risk $3 to potentially make $1",
      "You risk $1 to potentially make $3",
      "You buy 1 stock and sell 3",
      "You invest for 1 year and review after 3 years"
    ],
    "correctIndex": 1
  },
  {
    "question": "When should you set your stop-loss?",
    "options": [
      "After the stock starts dropping",
      "Only when you're losing more than 50%",
      "Before you buy — as part of your trading plan",
      "Stop-losses are for beginners only"
    ],
    "correctIndex": 2
  }
]
```

---

# GLOSSARY (40+ Terms)

```json
{
  "Stock": "A share of ownership in a company. When you buy a stock, you own a small piece of that business.",
  "Share": "A single unit of ownership in a company. Stocks are made up of shares.",
  "IPO": "Initial Public Offering — when a company first sells its shares to the public on a stock exchange.",
  "Ticker Symbol": "A short code (like AAPL or TSLA) used to identify a publicly traded company on an exchange.",
  "NYSE": "New York Stock Exchange — the largest stock exchange in the world.",
  "NASDAQ": "A major US stock exchange known for listing technology companies.",
  "Bid Price": "The highest price a buyer is currently willing to pay for a stock.",
  "Ask Price": "The lowest price a seller is currently willing to accept for a stock.",
  "Spread": "The difference between the bid and ask price. Smaller spread = more liquid stock.",
  "Volume": "The total number of shares traded during a given period. High volume = lots of trading activity.",
  "Market Order": "An order to buy or sell immediately at the current market price.",
  "Limit Order": "An order to buy or sell only at a specific price or better.",
  "Stop-Loss": "An order that automatically sells your shares if the price drops to a certain level, limiting your loss.",
  "Market Cap": "Market Capitalisation — the total value of a company's shares. Calculated as share price × total shares.",
  "Large-Cap": "A company with a market cap over $10 billion. Generally more stable and lower risk.",
  "Mid-Cap": "A company with a market cap between $2 billion and $10 billion.",
  "Small-Cap": "A company with a market cap under $2 billion. Higher risk but potentially higher growth.",
  "P/E Ratio": "Price-to-Earnings ratio — how much investors pay for each dollar of a company's earnings. Lower may indicate value.",
  "EPS": "Earnings Per Share — the company's profit divided by the number of shares outstanding.",
  "Dividend": "A portion of a company's profits paid out to shareholders, usually quarterly.",
  "Dividend Yield": "Annual dividend per share divided by the stock price, expressed as a percentage.",
  "Earnings Report": "A quarterly financial report showing a company's revenue, profit, and outlook.",
  "Revenue": "The total amount of money a company brings in from sales before expenses.",
  "Guidance": "A company's forward-looking estimate of future revenue or earnings, shared during earnings reports.",
  "ETF": "Exchange-Traded Fund — a basket of multiple stocks bundled into one tradable investment.",
  "S&P 500": "An index tracking the 500 largest US public companies. Often used as a benchmark for market performance.",
  "Diversification": "Spreading investments across different assets to reduce risk.",
  "Candlestick": "A type of price chart showing open, high, low, and close for a specific time period.",
  "Bullish": "A positive outlook — expecting the price to go up.",
  "Bearish": "A negative outlook — expecting the price to go down.",
  "Support": "A price level where a stock tends to stop falling and bounce upward.",
  "Resistance": "A price level where a stock tends to stop rising and pull back down.",
  "Breakout": "When a stock's price moves above a resistance level, potentially signaling a new uptrend.",
  "SMA": "Simple Moving Average — the average closing price over a set number of days.",
  "EMA": "Exponential Moving Average — like SMA but gives more weight to recent prices.",
  "Golden Cross": "When the 50-day SMA crosses above the 200-day SMA — seen as a bullish signal.",
  "Death Cross": "When the 50-day SMA crosses below the 200-day SMA — seen as a bearish signal.",
  "RSI": "Relative Strength Index — a momentum indicator from 0-100. Above 70 = overbought, below 30 = oversold.",
  "Overbought": "When a stock's price has risen too quickly and may be due for a pullback (RSI above 70).",
  "Oversold": "When a stock's price has fallen too quickly and may be due for a bounce (RSI below 30).",
  "Position Sizing": "Deciding how much of your total capital to risk on a single trade (1-2% rule).",
  "FOMO": "Fear Of Missing Out — a common emotional trap where you buy impulsively because a stock is rising.",
  "Panic Selling": "Selling a stock out of fear during a short-term drop, often locking in unnecessary losses.",
  "Confirmation Bias": "Only paying attention to information that confirms what you already believe about a stock.",
  "Risk/Reward Ratio": "The potential loss vs. potential gain of a trade. A 1:3 ratio means risking $1 to potentially make $3.",
  "Capital Gain": "The profit earned when you sell a stock for more than you paid for it.",
  "Portfolio": "Your collection of all the investments you own.",
  "Volatility": "How much and how quickly a stock's price changes. High volatility = big swings in price."
}
```

---

# MISSIONS

```json
[
  {
    "id": "mission_watchlist_tech",
    "title": "Build Your First Watchlist",
    "description": "Add 3 technology stocks (like AAPL, MSFT, GOOGL) to a watchlist. This helps you track stocks you're interested in without committing money yet.",
    "module": 1,
    "verifyAction": "Check if the user has a watchlist with at least 3 symbols",
    "reward": "Unlocks Mission 2"
  },
  {
    "id": "mission_alert_aapl",
    "title": "Set Your First Price Alert",
    "description": "Set a price alert for any stock. For example, set an alert for Apple (AAPL) when it drops below a certain price. This teaches you to watch the market without constantly checking.",
    "module": 2,
    "verifyAction": "Check if the user has at least 1 price alert set",
    "reward": "Unlocks Mission 3"
  },
  {
    "id": "mission_buy_etf",
    "title": "Make Your First Trade",
    "description": "Buy $100 worth of any stock or ETF using a Market Order. This is your first real trade in the sandbox — remember, it's virtual money so don't be afraid!",
    "module": 3,
    "verifyAction": "Check if the user has at least 1 completed BUY trade",
    "reward": "Unlocks Mission 4"
  },
  {
    "id": "mission_stop_loss",
    "title": "Protect Your Investment",
    "description": "Set a Stop-Loss alert for one of your current positions. Choose a price below your purchase price — if the stock drops to that level, you'll know to sell and protect your capital.",
    "module": 4,
    "verifyAction": "Check if the user has at least 1 price alert with direction BELOW",
    "reward": "All missions complete! You've mastered the basics."
  }
]
```

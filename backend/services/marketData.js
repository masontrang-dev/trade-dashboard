const axios = require("axios");

// Using Yahoo Finance API
const BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const RATE_LIMIT = 10; // 5 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

class MarketDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 60000; // Cache prices for 1 minute
    this.requestQueue = [];
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.isProcessingQueue = false;
  }

  async processRequestQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const now = Date.now();

    // Reset counter if we're in a new rate limit window
    if (now - this.lastRequestTime > RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    // Process requests if we're under the rate limit
    while (this.requestCount < RATE_LIMIT && this.requestQueue.length > 0) {
      this.requestCount++;
      const { symbol, resolve, reject } = this.requestQueue.shift();

      try {
        const price = await this._fetchStockPrice(symbol);
        resolve(price);
      } catch (error) {
        reject(error);
      }
    }

    // If we've hit the rate limit, schedule the next batch
    if (this.requestCount >= RATE_LIMIT) {
      const timeSinceFirstRequest = now - this.lastRequestTime;
      const delay = Math.max(
        0,
        RATE_LIMIT_WINDOW - timeSinceFirstRequest + 1000
      ); // Add 1s buffer

      setTimeout(() => {
        this.requestCount = 0;
        this.lastRequestTime = Date.now();
        this.isProcessingQueue = false;
        this.processRequestQueue();
      }, delay);
    } else {
      this.isProcessingQueue = false;
    }
  }

  async _fetchStockPrice(symbol) {
    const now = Date.now();
    const cached = this.cache.get(symbol);

    // Return cached price if it's still valid
    if (cached && now - cached.timestamp < this.cacheTTL) {
      return cached.price;
    }

    // If we have an expired cache, use it as a fallback
    const fallbackPrice = cached ? cached.price : null;

    try {
      // Use Yahoo Finance API
      const response = await axios.get(`${BASE_URL}/${symbol}`, {
        params: {
          range: "1d",
          interval: "1d",
          includePrePost: false,
        },
        timeout: 5000,
      });

      const result = response.data;
      if (!result?.chart?.result?.[0]?.meta?.regularMarketPrice) {
        throw new Error("Invalid Yahoo Finance API response format");
      }

      const price = result.chart.result[0].meta.regularMarketPrice;

      // Update cache
      this.cache.set(symbol, {
        price,
        timestamp: now,
      });

      return price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error.message);
      // Return cached price even if expired if available
      if (fallbackPrice !== null) {
        console.log(`Using cached price for ${symbol} due to error`);
        return fallbackPrice;
      }
      throw error;
    }
  }

  async getStockPrice(symbol) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ symbol, resolve, reject });
      this.processRequestQueue();
    });
  }

  async calculatePnL(trade) {
    try {
      const currentPrice = await this.getStockPrice(trade.symbol).catch(
        () => null
      );

      // If we couldn't get the current price, return null
      if (currentPrice === null) {
        return null;
      }

      const entryPrice = parseFloat(trade.entry_price);
      const quantity = parseFloat(trade.quantity);

      if (isNaN(entryPrice) || isNaN(quantity)) {
        throw new Error("Invalid entry price or quantity");
      }

      if (trade.type.toUpperCase() === "LONG") {
        return (currentPrice - entryPrice) * quantity;
      } else {
        return (entryPrice - currentPrice) * quantity;
      }
    } catch (error) {
      console.error("Error calculating P&L:", error);
      return null;
    }
  }
}

module.exports = new MarketDataService();

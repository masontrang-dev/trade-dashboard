const axios = require("axios");
const { calculateProfitLoss } = require("../../shared/tradeCalculations");

// Using Yahoo Finance API
const BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const RATE_LIMIT = 10; // 5 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

class MarketDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 60000; // Cache prices for 1 minute during market hours
    this.afterHoursCacheTTL = 3600000; // Cache for 1 hour outside market hours
    this.requestQueue = [];
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.isProcessingQueue = false;
  }

  isMarketOpen() {
    const now = new Date();
    const et = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    const day = et.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = et.getHours();
    const minutes = et.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // Market closed on weekends
    if (day === 0 || day === 6) {
      return false;
    }

    // Market hours: 9:30 AM - 4:00 PM ET (570 minutes - 960 minutes)
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM

    return totalMinutes >= marketOpen && totalMinutes < marketClose;
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
    const marketOpen = this.isMarketOpen();
    const cacheTTL = marketOpen ? this.cacheTTL : this.afterHoursCacheTTL;

    // Return cached price if it's still valid
    if (cached && now - cached.timestamp < cacheTTL) {
      return cached.price;
    }

    // If market is closed and we have any cached price, use it
    if (!marketOpen && cached) {
      console.log(`Market closed - using cached price for ${symbol}`);
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
    // Check if market is open
    if (!this.isMarketOpen()) {
      // Try to return cached price
      const cached = this.cache.get(symbol);
      if (cached) {
        console.log(`Market closed - returning cached price for ${symbol}`);
        return cached.price;
      }
      // If no cache, still fetch but with extended cache
      console.log(
        `Market closed - fetching price for ${symbol} (will cache for 1 hour)`
      );
    }

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

      const entryPrice = parseFloat(trade.entryPrice || trade.entry_price);
      const quantity = parseFloat(trade.quantity);

      if (isNaN(entryPrice) || isNaN(quantity)) {
        throw new Error("Invalid entry price or quantity");
      }

      return calculateProfitLoss(
        trade.type,
        entryPrice,
        currentPrice,
        quantity
      );
    } catch (error) {
      console.error("Error calculating P&L:", error);
      return null;
    }
  }
}

module.exports = new MarketDataService();

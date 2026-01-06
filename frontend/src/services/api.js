const API_BASE_URL = "http://localhost:3001/api";

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          error.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Risk Management Settings
  async getRiskSettings() {
    return this.request("/risk-management");
  }

  async updateRiskSettings(settings) {
    return this.request("/risk-management", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  // Trades
  async getAllTrades() {
    return this.request("/trades");
  }

  async getOpenTrades() {
    return this.request("/trades/open");
  }

  async getTrade(id) {
    return this.request(`/trades/${id}`);
  }

  async createTrade(tradeData) {
    return this.request("/trades", {
      method: "POST",
      body: JSON.stringify(tradeData),
    });
  }

  async updateTrade(id, tradeData) {
    return this.request(`/trades/${id}`, {
      method: "PUT",
      body: JSON.stringify(tradeData),
    });
  }

  async deleteTrade(id) {
    return this.request(`/trades/${id}`, {
      method: "DELETE",
    });
  }

  // Health check
  async healthCheck() {
    return this.request("/health");
  }
}

export default new ApiService();

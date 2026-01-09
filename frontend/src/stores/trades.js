import { defineStore } from "pinia";
import api from "../services/api";

export const useTradesStore = defineStore("trades", {
  state: () => ({
    openTrades: [],
    closedTrades: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalOpenRisk: (state) => {
      return state.openTrades.reduce((sum, t) => sum + (t.riskAmount || 0), 0);
    },

    openTradeCount: (state) => state.openTrades.length,

    closedTradeCount: (state) => state.closedTrades.length,

    totalOpenPositions: (state) => state.openTrades.length,

    getTradeById: (state) => (id) => {
      return (
        state.openTrades.find((t) => t.id === id) ||
        state.closedTrades.find((t) => t.id === id)
      );
    },
  },

  actions: {
    transformTrade(trade) {
      // Calculate riskAmount if not provided
      const riskAmount =
        trade.riskAmount ||
        (trade.entryPrice && trade.stopLoss && trade.quantity
          ? Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity
          : 0);

      return {
        ...trade,
        ticker: trade.symbol,
        target1: trade.targetPrice1,
        target2: trade.targetPrice2,
        quantity: trade.quantity || 0,
        riskAmount: riskAmount,
        currentPrice:
          trade.currentPrice !== undefined && trade.currentPrice !== null
            ? trade.currentPrice
            : trade.entryPrice || 0,
      };
    },

    async fetchOpenTrades() {
      this.loading = true;
      this.error = null;
      try {
        const trades = await api.getOpenTrades();
        this.openTrades = trades.map((trade) => this.transformTrade(trade));
      } catch (error) {
        this.error = error.message;
        console.error("Failed to fetch open trades:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchClosedTrades() {
      this.loading = true;
      this.error = null;
      try {
        const trades = await api.getClosedTrades();
        this.closedTrades = trades.map((trade) => ({
          ...trade,
          ticker: trade.symbol,
          target1: trade.targetPrice1,
          target2: trade.targetPrice2,
          closeDate: trade.exitTime,
          entryDate: trade.entryTime,
        }));
      } catch (error) {
        this.error = error.message;
        console.error("Failed to fetch closed trades:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAllTrades() {
      this.loading = true;
      this.error = null;
      try {
        await Promise.all([this.fetchOpenTrades(), this.fetchClosedTrades()]);
      } catch (error) {
        this.error = error.message;
        console.error("Failed to fetch all trades:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addTrade(tradeData) {
      this.loading = true;
      this.error = null;
      try {
        const newTrade = await api.createTrade(tradeData);
        this.openTrades.push(this.transformTrade(newTrade));
        return newTrade;
      } catch (error) {
        this.error = error.message;
        console.error("Failed to add trade:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTrade(tradeId, updates) {
      this.loading = true;
      this.error = null;
      try {
        const updatedTrade = await api.updateTrade(tradeId, updates);

        const openIndex = this.openTrades.findIndex((t) => t.id === tradeId);
        if (openIndex !== -1) {
          this.openTrades[openIndex] = updatedTrade;
        }

        const closedIndex = this.closedTrades.findIndex(
          (t) => t.id === tradeId
        );
        if (closedIndex !== -1) {
          this.closedTrades[closedIndex] = updatedTrade;
        }

        return updatedTrade;
      } catch (error) {
        this.error = error.message;
        console.error("Failed to update trade:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async closeTrade(tradeId, exitPrice, additionalData = {}) {
      this.loading = true;
      this.error = null;
      try {
        const closedTrade = await api.closeTrade(
          tradeId,
          exitPrice,
          additionalData
        );

        this.openTrades = this.openTrades.filter((t) => t.id !== tradeId);
        this.closedTrades.unshift(closedTrade);

        return closedTrade;
      } catch (error) {
        this.error = error.message;
        console.error("Failed to close trade:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTrade(tradeId) {
      this.loading = true;
      this.error = null;
      try {
        await api.deleteTrade(tradeId);

        this.openTrades = this.openTrades.filter((t) => t.id !== tradeId);
        this.closedTrades = this.closedTrades.filter((t) => t.id !== tradeId);

        return true;
      } catch (error) {
        this.error = error.message;
        console.error("Failed to delete trade:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});

import { defineStore } from "pinia";
import { useTradesStore } from "./trades";
import {
  calculateRMultiple,
  calculateProfitLoss,
  determineWinLoss,
} from "../../../shared/tradeCalculations";

export const useAnalyticsStore = defineStore("analytics", {
  state: () => ({
    timeRange: "30d",
    loading: false,
    error: null,
  }),

  getters: {
    closedTrades: () => {
      const tradesStore = useTradesStore();
      return tradesStore.closedTrades;
    },

    winRate: (state) => {
      const tradesStore = useTradesStore();
      const trades = tradesStore.closedTrades;
      if (trades.length === 0) return 0;

      const wins = trades.filter(
        (t) => determineWinLoss(t.profitLoss || 0) === "WIN"
      ).length;
      return Math.round((wins / trades.length) * 100 * 100) / 100;
    },

    profitFactor: (state) => {
      const tradesStore = useTradesStore();
      const trades = tradesStore.closedTrades;
      if (trades.length === 0) return 0;

      const grossProfit = trades
        .filter((t) => determineWinLoss(t.profitLoss || 0) === "WIN")
        .reduce((sum, t) => sum + (t.profitLoss || 0), 0);

      const grossLoss = Math.abs(
        trades
          .filter((t) => determineWinLoss(t.profitLoss || 0) === "LOSS")
          .reduce((sum, t) => sum + (t.profitLoss || 0), 0)
      );

      if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
      return Math.round((grossProfit / grossLoss) * 100) / 100;
    },

    expectancy: (state) => {
      const tradesStore = useTradesStore();
      const trades = tradesStore.closedTrades;
      if (trades.length === 0) return 0;

      const winningTrades = trades.filter(
        (t) => determineWinLoss(t.profitLoss || 0) === "WIN"
      );
      const losingTrades = trades.filter(
        (t) => determineWinLoss(t.profitLoss || 0) === "LOSS"
      );

      if (winningTrades.length === 0 && losingTrades.length === 0) return 0;

      const avgWin =
        winningTrades.length > 0
          ? winningTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) /
            winningTrades.length
          : 0;

      const avgLoss =
        losingTrades.length > 0
          ? Math.abs(
              losingTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) /
                losingTrades.length
            )
          : 0;

      const winRate = winningTrades.length / trades.length;
      const lossRate = 1 - winRate;

      return Math.round((winRate * avgWin - lossRate * avgLoss) * 100) / 100;
    },

    totalPnL: (state) => {
      const tradesStore = useTradesStore();
      const trades = tradesStore.closedTrades;
      return (
        Math.round(
          trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) * 100
        ) / 100
      );
    },

    totalNetPnL: (state) => {
      const tradesStore = useTradesStore();
      const trades = tradesStore.closedTrades;
      return (
        Math.round(
          trades.reduce(
            (sum, t) => sum + (t.netProfit || t.profitLoss || 0),
            0
          ) * 100
        ) / 100
      );
    },

    averageRMultiple: (state) => {
      const tradesStore = useTradesStore();
      const trades = tradesStore.closedTrades;
      if (trades.length === 0) return 0;

      const totalR = trades.reduce((sum, t) => {
        if (t.riskAmount && t.profitLoss) {
          return sum + calculateRMultiple(t.profitLoss, t.riskAmount);
        }
        return sum;
      }, 0);

      return Math.round((totalR / trades.length) * 100) / 100;
    },

    winningTrades: (state) => {
      const tradesStore = useTradesStore();
      return tradesStore.closedTrades.filter(
        (t) => determineWinLoss(t.profitLoss || 0) === "WIN"
      );
    },

    losingTrades: (state) => {
      const tradesStore = useTradesStore();
      return tradesStore.closedTrades.filter(
        (t) => determineWinLoss(t.profitLoss || 0) === "LOSS"
      );
    },

    breakEvenTrades: (state) => {
      const tradesStore = useTradesStore();
      return tradesStore.closedTrades.filter(
        (t) => determineWinLoss(t.profitLoss || 0) === "BREAKEVEN"
      );
    },

    largestWin: (state) => {
      const tradesStore = useTradesStore();
      const trades = tradesStore.closedTrades;
      if (trades.length === 0) return 0;

      return Math.max(...trades.map((t) => t.profitLoss || 0));
    },

    largestLoss: (state) => {
      const tradesStore = useTradesStore();
      const trades = tradesStore.closedTrades;
      if (trades.length === 0) return 0;

      return Math.min(...trades.map((t) => t.profitLoss || 0));
    },

    averageWin: (state) => {
      const tradesStore = useTradesStore();
      const winningTrades = tradesStore.closedTrades.filter(
        (t) => determineWinLoss(t.profitLoss || 0) === "WIN"
      );
      if (winningTrades.length === 0) return 0;

      const total = winningTrades.reduce(
        (sum, t) => sum + (t.profitLoss || 0),
        0
      );
      return Math.round((total / winningTrades.length) * 100) / 100;
    },

    averageLoss: (state) => {
      const tradesStore = useTradesStore();
      const losingTrades = tradesStore.closedTrades.filter(
        (t) => determineWinLoss(t.profitLoss || 0) === "LOSS"
      );
      if (losingTrades.length === 0) return 0;

      const total = losingTrades.reduce(
        (sum, t) => sum + (t.profitLoss || 0),
        0
      );
      return Math.round((total / losingTrades.length) * 100) / 100;
    },

    tradesBySymbol: (state) => {
      const tradesStore = useTradesStore();
      const trades = tradesStore.closedTrades;

      const grouped = trades.reduce((acc, trade) => {
        const symbol = trade.symbol;
        if (!acc[symbol]) {
          acc[symbol] = {
            symbol,
            count: 0,
            totalPnL: 0,
            wins: 0,
            losses: 0,
          };
        }

        acc[symbol].count++;
        acc[symbol].totalPnL += trade.profitLoss || 0;

        const status = determineWinLoss(trade.profitLoss || 0);
        if (status === "WIN") {
          acc[symbol].wins++;
        } else if (status === "LOSS") {
          acc[symbol].losses++;
        }

        return acc;
      }, {});

      return Object.values(grouped).sort((a, b) => b.totalPnL - a.totalPnL);
    },
  },

  actions: {
    setTimeRange(range) {
      this.timeRange = range;
    },

    clearError() {
      this.error = null;
    },
  },
});

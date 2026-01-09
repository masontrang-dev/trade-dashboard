import { defineStore } from "pinia";
import api from "../services/api";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    riskSettings: {
      maxDailyLoss: 2500,
      maxOpenRisk: 5000,
      maxOpenPositions: 5,
      defaultRSize: 2500,
      stateTaxRate: 9.2,
      federalTaxRate: 24,
      marginInterestRate: 8,
      enableAlerts: true,
    },
    tradingMode: "SWING",
    devMode: false,
    loading: false,
    error: null,
  }),

  getters: {
    combinedTaxRate: (state) => {
      return (
        state.riskSettings.stateTaxRate + state.riskSettings.federalTaxRate
      );
    },

    isDayTrading: (state) => state.tradingMode === "DAY",

    isSwingTrading: (state) => state.tradingMode === "SWING",

    isDevModeEnabled: (state) => state.devMode,
  },

  actions: {
    async loadSettings() {
      this.loading = true;
      this.error = null;
      try {
        const riskSettings = await api.getRiskSettings();
        this.riskSettings = { ...this.riskSettings, ...riskSettings };
        // tradingMode and devMode are persisted via Pinia persistence plugin
        // They don't need to be loaded from the API
      } catch (error) {
        this.error = error.message;
        console.error("Failed to load settings:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateRiskSettings(newSettings) {
      this.loading = true;
      this.error = null;
      try {
        const updatedSettings = await api.updateRiskSettings(newSettings);
        this.riskSettings = { ...this.riskSettings, ...updatedSettings };
        return updatedSettings;
      } catch (error) {
        this.error = error.message;
        console.error("Failed to update risk settings:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async setTradingMode(mode) {
      this.loading = true;
      this.error = null;
      try {
        await api.switchTradingMode(mode, this.devMode);
        this.tradingMode = mode;
      } catch (error) {
        this.error = error.message;
        console.error("Failed to set trading mode:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async toggleDevMode() {
      this.loading = true;
      this.error = null;
      try {
        const newDevMode = !this.devMode;
        await api.switchDevMode(newDevMode);
        this.devMode = newDevMode;
      } catch (error) {
        this.error = error.message;
        console.error("Failed to toggle dev mode:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async setDevMode(enabled) {
      this.loading = true;
      this.error = null;
      try {
        await api.switchDevMode(enabled);
        this.devMode = enabled;
      } catch (error) {
        this.error = error.message;
        console.error("Failed to set dev mode:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },

  persist: {
    key: "trade-dashboard-settings",
    storage: localStorage,
    paths: ["tradingMode", "devMode"],
  },
});

<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-container">
        <div class="header-left">
          <div class="brand">
            <div class="brand-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                <path
                  d="M8 16L14 10L18 14L24 8"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M8 22L14 16L18 20L24 14"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  opacity="0.5"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stop-color="#667eea" />
                    <stop offset="100%" stop-color="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="brand-text">
              <h1>Trading Dashboard</h1>
              <span class="mode-badge">{{
                tradingMode === "DAY" ? "Day Trading" : "Swing Trading"
              }}</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <button @click="openSettings" class="settings-btn">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
              ></path>
            </svg>
            Settings
          </button>
        </div>
      </div>
      <div class="risk-cards">
        <div class="risk-card">
          <div class="risk-card-header">
            <div class="risk-card-icon daily">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path
                  d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                ></path>
              </svg>
            </div>
            <div class="risk-card-title">
              <h3>Daily Risk Used</h3>
              <span class="risk-card-subtitle"
                >{{ dailyRiskPercentage.toFixed(1) }}% of limit</span
              >
            </div>
          </div>
          <div class="risk-card-body">
            <div class="risk-amount-container">
              <div class="risk-display">
                <span class="risk-label">R Value</span>
                <div
                  class="risk-amount"
                  :class="{ 'risk-warning': dailyRiskPercentage > 80 }"
                >
                  <span class="amount-primary"
                    >{{ dailyRiskUsedR.toFixed(2) }}R</span
                  >
                  <span class="amount-secondary"
                    >/ {{ maxDailyLossR.toFixed(2) }}R</span
                  >
                </div>
              </div>
              <div class="dollars-display">
                <span class="risk-label">Dollar Value</span>
                <div class="dollars-amount">
                  <span class="dollars-text"
                    >${{ dailyRiskUsed.toFixed(0) }} / ${{
                      maxDailyLoss.toFixed(0)
                    }}</span
                  >
                </div>
              </div>
            </div>
            <div class="progress-bar-modern">
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :style="{ width: Math.min(dailyRiskPercentage, 100) + '%' }"
                  :class="{
                    'progress-warning': dailyRiskPercentage > 80,
                    'progress-danger': dailyRiskPercentage > 100,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="risk-card">
          <div class="risk-card-header">
            <div class="risk-card-icon open">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div class="risk-card-title">
              <h3>Open Risk</h3>
              <span class="risk-card-subtitle"
                >{{ openRiskPercentage.toFixed(1) }}% of limit</span
              >
            </div>
          </div>
          <div class="risk-card-body">
            <div class="risk-amount-container">
              <div class="risk-display">
                <span class="risk-label">R Value</span>
                <div
                  class="risk-amount"
                  :class="{ 'risk-warning': openRiskPercentage > 80 }"
                >
                  <span class="amount-primary"
                    >{{ totalOpenRiskR.toFixed(2) }}R</span
                  >
                  <span class="amount-secondary"
                    >/ {{ maxOpenRiskR.toFixed(2) }}R</span
                  >
                </div>
              </div>
              <div class="dollars-display">
                <span class="risk-label">Dollar Value</span>
                <div class="dollars-amount">
                  <span class="dollars-text"
                    >${{ totalOpenRisk.toFixed(0) }} / ${{
                      maxOpenRisk.toFixed(0)
                    }}</span
                  >
                </div>
              </div>
            </div>
            <div class="progress-bar-modern">
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :style="{ width: Math.min(openRiskPercentage, 100) + '%' }"
                  :class="{
                    'progress-warning': openRiskPercentage > 80,
                    'progress-danger': openRiskPercentage > 100,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="left-panel">
        <TradeForm
          @trade-added="handleTradeAdded"
          :show-r-values="showRValues"
          :default-r-size="defaultRSize"
          :state-tax-rate="stateTaxRate"
          :federal-tax-rate="federalTaxRate"
          :margin-interest-rate="marginInterestRate"
          :max-daily-loss="maxDailyLoss"
          :daily-risk-used="dailyRiskUsed"
          :trading-mode="tradingMode"
        />
      </div>

      <div class="right-panel">
        <ActiveTrades
          :trades="activeTrades"
          :show-r-values="showRValues"
          :default-r-size="defaultRSize"
          @trade-closed="handleTradeClosed"
          @trade-updated="handleTradeUpdated"
        />
        <TradeHistory
          :history="tradeHistory"
          :show-r-values="showRValues"
          :default-r-size="defaultRSize"
        />
      </div>
    </main>

    <SettingsModal
      :is-open="isSettingsOpen"
      :trading-mode="tradingMode"
      :dev-mode="devMode"
      :max-daily-loss="maxDailyLoss"
      :max-open-risk="maxOpenRisk"
      :default-r-size="defaultRSize"
      :max-positions="maxPositions"
      :state-tax-rate="stateTaxRate"
      :federal-tax-rate="federalTaxRate"
      :margin-interest-rate="marginInterestRate"
      :enable-alerts="enableAlerts"
      :show-r-values="showRValues"
      :open-trades-count="activeTrades.length"
      @close="closeSettings"
      @save="handleSettingsSave"
      @trading-mode-changed="handleTradingModeChange"
      @dev-mode-changed="handleDevModeChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import TradeForm from "./TradeForm.vue";
import ActiveTrades from "./ActiveTrades.vue";
import TradeHistory from "./TradeHistory.vue";
import SettingsModal from "./SettingsModal.vue";
import api from "../services/api";

const maxDailyLoss = ref(500);
const maxOpenRisk = ref(2000);
const activeTrades = ref([]);
const tradeHistory = ref([]);
const tradingMode = ref("SWING");
const devMode = ref(false);
const isSettingsOpen = ref(false);
const maxPositions = ref(5);
const enableAlerts = ref(true);

// Load closed trades from API
const loadClosedTrades = async () => {
  try {
    const closedTrades = await api.getClosedTrades();
    tradeHistory.value = closedTrades.map((trade) => ({
      id: trade.id,
      ticker: trade.symbol,
      type: trade.type.toLowerCase(),
      strategy: trade.strategy,
      entryPrice: trade.entry_price,
      exitPrice: trade.exit_price,
      quantity: trade.quantity,
      shares: trade.quantity,
      profitLoss: trade.profit_loss,
      entryDate: trade.entry_time,
      closeDate: trade.exit_time,
      notes: trade.notes,
      riskAmount: trade.risk_amount,
      rSize: trade.r_size,
      taxAmount: trade.tax_amount,
      marginInterest: trade.margin_interest,
      positionSize: trade.position_size || trade.entry_price * trade.quantity,
      tradingMode: trade.trading_mode,
    }));
    console.log("Loaded closed trades:", tradeHistory.value);
  } catch (error) {
    console.error("Error loading closed trades:", error);
  }
};
const showRValues = ref(false);
const defaultRSize = ref(2500);

// Load active trades from API
const loadActiveTrades = async () => {
  try {
    console.log("Fetching active trades from API...");
    const trades = await api.getOpenTrades();
    console.log("Received trades from API:", trades);

    if (!Array.isArray(trades)) {
      console.error("Invalid trades data received:", trades);
      throw new Error("Invalid trades data received from server");
    }

    activeTrades.value = trades.map((trade) => {
      // Log each trade being processed
      console.log("Processing trade:", {
        id: trade.id,
        symbol: trade.symbol,
        hasPrice: trade.current_price !== undefined,
        hasPnl: trade.pnl !== undefined,
      });

      // Calculate risk amount if not provided
      const riskAmount =
        trade.risk_amount ||
        (trade.entry_price && trade.stop_loss && trade.quantity
          ? Math.abs(trade.entry_price - trade.stop_loss) * trade.quantity
          : 0);

      // Calculate P&L percentage if not provided
      const pnl = trade.pnl || 0;
      const pnlPercent =
        trade.pnl_percent !== undefined && trade.pnl_percent !== null
          ? trade.pnl_percent
          : trade.entry_price && trade.quantity && pnl !== 0
          ? (pnl / (trade.entry_price * trade.quantity)) * 100
          : 0;

      return {
        id: trade.id,
        ticker: trade.symbol,
        strategy: trade.strategy,
        type: trade.type,
        shares: trade.quantity || 0,
        entryPrice: trade.entry_price || 0,
        stopLoss: trade.stop_loss || 0,
        target1: trade.take_profit,
        target2: trade.target_price,
        position_size: trade.position_size,
        notes: trade.notes || "",
        riskAmount: riskAmount,
        rSize: trade.r_size || defaultRSize.value,
        entry_time: trade.entry_time || new Date().toISOString(),
        exit_time: trade.exit_time,
        status: trade.status || "OPEN",
        current_price:
          trade.current_price !== undefined && trade.current_price !== null
            ? trade.current_price
            : trade.entry_price || 0,
        pnl: pnl,
        pnl_percent: pnlPercent,
        tradingMode: trade.trading_mode,
      };
    });

    console.log(
      `Successfully processed ${activeTrades.value.length} trades in UI`
    );
  } catch (error) {
    console.error("Failed to load active trades:", error);
    // You might want to show an error message to the user here
    // errorMessage.value = "Failed to load active trades. Please try again.";
  }
};

const stateTaxRate = ref(0);
const federalTaxRate = ref(0);
const marginInterestRate = ref(0);

const loadRiskSettings = async () => {
  try {
    const settings = await api.getRiskSettings();
    if (settings) {
      if (settings.maxDailyLoss !== undefined) {
        maxDailyLoss.value = settings.maxDailyLoss;
      }
      if (settings.maxOpenRisk !== undefined) {
        maxOpenRisk.value = settings.maxOpenRisk;
      }
      if (settings.defaultRSize !== undefined) {
        defaultRSize.value = settings.defaultRSize;
      }
      if (settings.maxPositions !== undefined) {
        maxPositions.value = settings.maxPositions;
      }
      if (settings.stateTaxRate !== undefined) {
        stateTaxRate.value = settings.stateTaxRate;
      }
      if (settings.federalTaxRate !== undefined) {
        federalTaxRate.value = settings.federalTaxRate;
      }
      if (settings.marginInterestRate !== undefined) {
        marginInterestRate.value = settings.marginInterestRate;
      }
      if (settings.enableAlerts !== undefined) {
        enableAlerts.value = settings.enableAlerts;
      }
    }
  } catch (error) {
    console.error("Failed to load risk settings:", error);
    // Fallback to localStorage if API fails
    const saved = localStorage.getItem("riskSettings");
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      if (parsedSettings.maxDailyLoss)
        maxDailyLoss.value = parsedSettings.maxDailyLoss;
      if (parsedSettings.maxOpenRisk)
        maxOpenRisk.value = parsedSettings.maxOpenRisk;
      if (parsedSettings.defaultRSize)
        defaultRSize.value = parsedSettings.defaultRSize;
    }
  }

  // Load trading mode and dev mode from backend
  try {
    const modeSettings = await api.getModeSettings();
    if (modeSettings) {
      if (modeSettings.tradingMode) {
        tradingMode.value = modeSettings.tradingMode;
        localStorage.setItem("tradingMode", modeSettings.tradingMode);
      }
      if (modeSettings.devMode !== undefined) {
        devMode.value = modeSettings.devMode;
        localStorage.setItem("devMode", JSON.stringify(modeSettings.devMode));
      }
    }
  } catch (error) {
    console.error("Failed to load mode settings from backend:", error);
    // Fallback to localStorage
    const savedTradingMode = localStorage.getItem("tradingMode");
    if (savedTradingMode && ["DAY", "SWING"].includes(savedTradingMode)) {
      tradingMode.value = savedTradingMode;
    }

    const savedDevMode = localStorage.getItem("devMode");
    if (savedDevMode) {
      devMode.value = JSON.parse(savedDevMode);
    }
  }
};

// Load data when component mounts
onMounted(async () => {
  await loadRiskSettings();
  await Promise.all([loadActiveTrades(), loadClosedTrades()]);
});

const dailyRiskUsed = computed(() => {
  if (tradingMode.value !== "DAY") {
    return 0; // SWING mode doesn't use daily risk tracking
  }

  const today = new Date().toDateString();

  // Calculate realized losses from DAY trades closed today
  const realizedDayLosses = tradeHistory.value
    .filter((trade) => {
      if (!trade.closeDate) return false;
      // Include trades with null/undefined trading_mode (legacy trades)
      const tradeMode = trade.tradingMode || tradingMode.value;
      if (tradeMode !== "DAY") return false;
      return new Date(trade.closeDate).toDateString() === today;
    })
    .reduce((total, trade) => {
      // Only count losses, not profits
      const loss = trade.profitLoss < 0 ? Math.abs(trade.profitLoss) : 0;
      return total + loss;
    }, 0);

  // Calculate current open risk from DAY trades
  const openDayRisk = activeTrades.value
    .filter((trade) => {
      // Include trades with null/undefined trading_mode (legacy trades)
      const tradeMode = trade.tradingMode || tradingMode.value;
      return tradeMode === "DAY";
    })
    .reduce((total, trade) => {
      // Calculate remaining downside to stop
      const currentPrice = trade.current_price || trade.entryPrice;
      const remainingRisk =
        Math.abs(currentPrice - trade.stopLoss) * trade.shares;
      // Risk can only decrease (when stop is moved), never increase from favorable price movement
      const originalRisk = trade.riskAmount || remainingRisk;
      return total + Math.min(originalRisk, remainingRisk);
    }, 0);

  return realizedDayLosses + openDayRisk;
});

const dailyRiskUsedR = computed(() => {
  return dailyRiskUsed.value / defaultRSize.value;
});

const totalOpenRiskR = computed(() => {
  return totalOpenRisk.value / defaultRSize.value;
});

const maxDailyLossR = computed(() => {
  return maxDailyLoss.value / defaultRSize.value;
});

const maxOpenRiskR = computed(() => {
  return maxOpenRisk.value / defaultRSize.value;
});

const totalOpenRisk = computed(() => {
  if (tradingMode.value === "DAY") {
    // For DAY mode: only count remaining downside to stop for DAY trades
    return activeTrades.value
      .filter((trade) => {
        // Include trades with null/undefined trading_mode (legacy trades)
        const tradeMode = trade.tradingMode || tradingMode.value;
        return tradeMode === "DAY";
      })
      .reduce((total, trade) => {
        const currentPrice = trade.current_price || trade.entryPrice;
        const remainingRisk =
          Math.abs(currentPrice - trade.stopLoss) * trade.shares;
        // Risk can only decrease (when stop is moved), never increase from favorable price movement
        const originalRisk = trade.riskAmount || remainingRisk;
        return total + Math.min(originalRisk, remainingRisk);
      }, 0);
  } else {
    // For SWING mode: count all open SWING trade risk
    return activeTrades.value
      .filter((trade) => {
        // Include trades with null/undefined trading_mode (legacy trades)
        const tradeMode = trade.tradingMode || tradingMode.value;
        return tradeMode === "SWING";
      })
      .reduce((total, trade) => total + trade.riskAmount, 0);
  }
});

const dailyRiskPercentage = computed(() => {
  return (dailyRiskUsed.value / maxDailyLoss.value) * 100;
});

const openRiskPercentage = computed(() => {
  return (totalOpenRisk.value / maxOpenRisk.value) * 100;
});

const remainingDailyRisk = computed(() => {
  return Math.max(0, maxDailyLoss.value - dailyRiskUsed.value);
});

const remainingDailyRiskR = computed(() => {
  return remainingDailyRisk.value / defaultRSize.value;
});

const remainingRiskPercentage = computed(() => {
  return (remainingDailyRisk.value / maxDailyLoss.value) * 100;
});

const handleTradeAdded = async (trade) => {
  try {
    // Calculate risk amount
    const riskAmount =
      Math.abs(trade.entryPrice - trade.stopLoss) *
      (trade.calculatedShares || trade.shares);

    // Prepare the trade data for the API
    const tradeData = {
      symbol: trade.ticker,
      strategy: trade.strategy || null,
      type: trade.type.toUpperCase(),
      quantity: trade.calculatedShares || trade.shares,
      entry_price: parseFloat(trade.entryPrice),
      stop_loss: parseFloat(trade.stopLoss),
      take_profit: trade.target1 ? parseFloat(trade.target1) : null,
      target_price: trade.target1 ? parseFloat(trade.target1) : null,
      position_size:
        parseFloat(trade.entryPrice) * (trade.calculatedShares || trade.shares),
      notes: trade.notes,
      risk_amount: riskAmount,
      r_size: defaultRSize.value,
      state_tax_rate: trade.stateTaxRate || 0,
      federal_tax_rate: trade.federalTaxRate || 0,
      margin_interest_rate: trade.marginInterestRate || 0,
      trading_mode: tradingMode.value,
    };

    // Make the API call
    const savedTrade = await api.createTrade(tradeData);

    // Add the saved trade to the local state with proper formatting
    const newTrade = {
      id: savedTrade.id,
      ticker: trade.ticker,
      type: trade.type.toUpperCase(),
      shares: trade.calculatedShares || trade.shares,
      entryPrice: parseFloat(trade.entryPrice),
      stopLoss: parseFloat(trade.stopLoss),
      target1: trade.target1 ? parseFloat(trade.target1) : null,
      notes: trade.notes,
      riskAmount: riskAmount,
      rSize: defaultRSize.value,
      entry_time: new Date().toISOString(),
      status: "OPEN",
    };

    // Add to the beginning of the array
    activeTrades.value = [newTrade, ...activeTrades.value];
  } catch (error) {
    console.error("Error saving trade:", error);
    alert("Failed to save trade. Please try again.");
  }
};

const handleTradeClosed = async () => {
  // Refresh both active and closed trades
  await Promise.all([loadActiveTrades(), loadClosedTrades()]);

  // Update risk metrics
  await loadRiskSettings();
};

const handleTradeUpdated = async (updatedTrade) => {
  // Refetch all active trades to ensure we have current_price and all fields
  await loadActiveTrades();
};

const handleRiskSettingsUpdated = (settings) => {
  if (settings.maxDailyLoss !== undefined) {
    maxDailyLoss.value = settings.maxDailyLoss;
  }
  if (settings.maxOpenRisk !== undefined) {
    maxOpenRisk.value = settings.maxOpenRisk;
  }
  if (settings.defaultRSize !== undefined) {
    defaultRSize.value = settings.defaultRSize;
  }
  if (settings.stateTaxRate !== undefined) {
    stateTaxRate.value = settings.stateTaxRate;
  }
  if (settings.federalTaxRate !== undefined) {
    federalTaxRate.value = settings.federalTaxRate;
  }
  if (settings.marginInterestRate !== undefined) {
    marginInterestRate.value = settings.marginInterestRate;
  }

  // Update local storage as a fallback
  const currentSettings = {
    maxDailyLoss: maxDailyLoss.value,
    maxOpenRisk: maxOpenRisk.value,
    defaultRSize: defaultRSize.value,
  };
  localStorage.setItem("riskSettings", JSON.stringify(currentSettings));
};

const handleTradingModeChange = async (newMode) => {
  try {
    // Call API to switch mode and re-evaluate trades
    await api.switchTradingMode(newMode, devMode.value);

    tradingMode.value = newMode;
    localStorage.setItem("tradingMode", newMode);

    // Reload trades after mode change
    await Promise.all([loadActiveTrades(), loadClosedTrades()]);
  } catch (error) {
    console.error("Error switching trading mode:", error);
    alert("Failed to switch trading mode. Please try again.");
  }
};

const handleDevModeChange = async (isDevMode) => {
  try {
    // Call API to switch dev mode
    await api.switchDevMode(isDevMode);

    devMode.value = isDevMode;
    localStorage.setItem("devMode", JSON.stringify(isDevMode));

    // Reload trades from the appropriate database
    await Promise.all([loadActiveTrades(), loadClosedTrades()]);
  } catch (error) {
    console.error("Error switching dev mode:", error);
    alert("Failed to switch dev mode. Please try again.");
  }
};

const openSettings = () => {
  isSettingsOpen.value = true;
};

const closeSettings = () => {
  isSettingsOpen.value = false;
};

const handleSettingsSave = async (settings) => {
  try {
    const settingsToSave = {
      maxDailyLoss: settings.maxDailyLoss,
      maxOpenRisk: settings.maxOpenRisk,
      maxPositions: settings.maxPositions,
      defaultRSize: settings.defaultRSize,
      enableAlerts: settings.enableAlerts,
      stateTaxRate: settings.stateTaxRate,
      federalTaxRate: settings.federalTaxRate,
      marginInterestRate: settings.marginInterestRate,
    };

    await api.updateRiskSettings(settingsToSave);

    // Update local state
    if (settings.maxDailyLoss !== undefined) {
      maxDailyLoss.value = settings.maxDailyLoss;
    }
    if (settings.maxOpenRisk !== undefined) {
      maxOpenRisk.value = settings.maxOpenRisk;
    }
    if (settings.defaultRSize !== undefined) {
      defaultRSize.value = settings.defaultRSize;
    }
    if (settings.maxPositions !== undefined) {
      maxPositions.value = settings.maxPositions;
    }
    if (settings.stateTaxRate !== undefined) {
      stateTaxRate.value = settings.stateTaxRate;
    }
    if (settings.federalTaxRate !== undefined) {
      federalTaxRate.value = settings.federalTaxRate;
    }
    if (settings.marginInterestRate !== undefined) {
      marginInterestRate.value = settings.marginInterestRate;
    }
    if (settings.enableAlerts !== undefined) {
      enableAlerts.value = settings.enableAlerts;
    }

    // Update local storage as a fallback
    const currentSettings = {
      maxDailyLoss: maxDailyLoss.value,
      maxOpenRisk: maxOpenRisk.value,
      defaultRSize: defaultRSize.value,
    };
    localStorage.setItem("riskSettings", JSON.stringify(currentSettings));

    console.log("Settings saved successfully");
  } catch (error) {
    console.error("Failed to save settings:", error);
    alert("Failed to save settings. Please try again.");
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  padding: 32px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

.dashboard-header {
  max-width: 1400px;
  margin: 0 auto 32px;
}

/* Header Container */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 28px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.mode-badge {
  display: inline-block;
  margin-top: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-btn:hover {
  background: white;
  border-color: #cbd5e0;
  color: #2d3748;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.settings-btn svg {
  transition: transform 0.3s ease;
}

.settings-btn:hover svg {
  transform: rotate(90deg);
}

/* Metrics Bar */
.metrics-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  background: white;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  flex-shrink: 0;
}

.metric-mode .metric-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;
  letter-spacing: -0.025em;
}

.metric-value.value-warning {
  color: #e53e3e;
}

.metric-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #e2e8f0, transparent);
  margin: 0 8px;
}

/* Risk Cards */
.risk-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.risk-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.risk-card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.risk-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.risk-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.risk-card-icon.daily {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.risk-card-icon.open {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.risk-card-title h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a202c;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.risk-card-subtitle {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #718096;
}

.risk-card-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.risk-amount-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 4px;
}

.risk-display,
.dollars-display {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.risk-display {
  flex: 1;
}

.risk-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.risk-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.amount-primary {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  letter-spacing: -0.025em;
}

.amount-secondary {
  font-size: 1.125rem;
  font-weight: 600;
  color: #a0aec0;
}

.risk-amount.risk-warning .amount-primary {
  color: #e53e3e;
}

.risk-amount.risk-warning .amount-secondary {
  color: #fc8181;
}

.dollars-amount {
  display: flex;
  align-items: baseline;
}

.dollars-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #718096;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

/* Modern Progress Bar */
.progress-bar-modern {
  width: 100%;
}

.progress-track {
  width: 100%;
  height: 10px;
  background: #edf2f7;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-fill.progress-warning {
  background: linear-gradient(90deg, #f6ad55 0%, #ed8936 100%);
}

.progress-fill.progress-danger {
  background: linear-gradient(90deg, #fc8181 0%, #e53e3e 100%);
}

/* Main Content */
.dashboard-main {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .risk-cards {
    grid-template-columns: 1fr;
  }

  .risk-amount-container {
    gap: 24px;
  }
}

@media (max-width: 1024px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }

  .metrics-bar {
    flex-wrap: wrap;
    gap: 16px;
  }

  .metric-divider {
    display: none;
  }

  .metric-item {
    min-width: calc(50% - 8px);
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .header-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .brand-text h1 {
    font-size: 1.25rem;
  }

  .metrics-bar {
    padding: 16px;
  }

  .metric-item {
    min-width: 100%;
  }

  .metric-icon {
    width: 36px;
    height: 36px;
  }

  .metric-value {
    font-size: 1.125rem;
  }

  .risk-cards {
    grid-template-columns: 1fr;
  }

  .risk-card {
    padding: 20px;
  }

  .risk-amount-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .amount-primary {
    font-size: 1.5rem;
  }

  .amount-secondary {
    font-size: 1rem;
  }

  .amount-dollars {
    align-self: flex-start;
  }

  .dollars-text {
    font-size: 1rem;
  }
}
</style>

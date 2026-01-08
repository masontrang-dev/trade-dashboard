<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-top">
        <h1>{{ tradingMode === "DAY" ? "Day" : "Swing" }} Trading Dashboard</h1>
        <div class="header-controls">
          <button @click="openSettings" class="settings-btn" title="Settings">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
              ></path>
            </svg>
            Settings
          </button>
          <RToggle @toggle-changed="handleRToggle" />
        </div>
      </div>
      <div class="risk-summary">
        <div class="risk-card">
          <h3>Daily Risk Used</h3>
          <span
            class="risk-value"
            :class="{ 'risk-warning': dailyRiskPercentage > 80 }"
          >
            <template v-if="showRValues">
              {{ dailyRiskUsedR.toFixed(2) }}R / {{ maxDailyLossR.toFixed(2) }}R
              <small
                >(${{ dailyRiskUsed.toFixed(2) }} / ${{
                  maxDailyLoss.toFixed(2)
                }})</small
              >
            </template>
            <template v-else>
              ${{ dailyRiskUsed.toFixed(2) }} / ${{ maxDailyLoss.toFixed(2) }}
            </template>
          </span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: dailyRiskPercentage + '%' }"
              :class="{ 'risk-warning': dailyRiskPercentage > 80 }"
            ></div>
          </div>
        </div>
        <div class="risk-card">
          <h3>Open Risk</h3>
          <span
            class="risk-value"
            :class="{ 'risk-warning': openRiskPercentage > 80 }"
          >
            <template v-if="showRValues">
              {{ totalOpenRiskR.toFixed(2) }}R / {{ maxOpenRiskR.toFixed(2) }}R
              <small
                >(${{ totalOpenRisk.toFixed(2) }} / ${{
                  maxOpenRisk.toFixed(2)
                }})</small
              >
            </template>
            <template v-else>
              ${{ totalOpenRisk.toFixed(2) }} / ${{ maxOpenRisk.toFixed(2) }}
            </template>
          </span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: openRiskPercentage + '%' }"
              :class="{ 'risk-warning': openRiskPercentage > 80 }"
            ></div>
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
import RToggle from "./RToggle.vue";
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

  // Load R toggle state
  const savedToggle = localStorage.getItem("rToggleState");
  if (savedToggle) {
    showRValues.value = JSON.parse(savedToggle);
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
  const today = new Date().toDateString();
  return tradeHistory.value
    .filter((trade) => new Date(trade.date).toDateString() === today)
    .reduce((total, trade) => total + (trade.realizedLoss || 0), 0);
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
  return activeTrades.value.reduce(
    (total, trade) => total + trade.riskAmount,
    0
  );
});

const dailyRiskPercentage = computed(() => {
  return (dailyRiskUsed.value / maxDailyLoss.value) * 100;
});

const openRiskPercentage = computed(() => {
  return (totalOpenRisk.value / maxOpenRisk.value) * 100;
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

const handleTradeUpdated = (updatedTrade) => {
  const index = activeTrades.value.findIndex((t) => t.id === updatedTrade.id);
  if (index !== -1) {
    activeTrades.value[index] = { ...updatedTrade };
  }
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

const handleRToggle = (showR) => {
  showRValues.value = showR;
  // Save toggle state to localStorage
  localStorage.setItem("rToggleState", JSON.stringify(showR));
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
.dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 30px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.settings-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  color: #5a6c7d;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-btn:hover {
  background: #f8f9fa;
  border-color: #3498db;
  color: #3498db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.settings-btn svg {
  transition: transform 0.3s ease;
}

.settings-btn:hover svg {
  transform: rotate(90deg);
}

.dashboard-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin: 0;
}

.risk-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.risk-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.risk-card h3 {
  margin: 0 0 10px 0;
  color: #5a6c7d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.risk-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
}

.risk-value small {
  display: block;
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 4px;
}

.risk-value.risk-warning {
  color: #e74c3c;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3498db;
  transition: width 0.3s ease;
}

.progress-fill.risk-warning {
  background-color: #e74c3c;
}

.dashboard-main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 1024px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }

  .risk-summary {
    grid-template-columns: 1fr;
  }
}
</style>

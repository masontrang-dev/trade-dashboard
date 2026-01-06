<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-top">
        <h1>Swing Trading Dashboard</h1>
        <RToggle @toggle-changed="handleRToggle" />
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
        />
        <RiskSettings
          :max-daily-loss="maxDailyLoss"
          :max-open-risk="maxOpenRisk"
          :default-r-size="defaultRSize"
          :show-r-values="showRValues"
          @settings-updated="handleRiskSettingsUpdated"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import TradeForm from "./TradeForm.vue";
import RiskSettings from "./RiskSettings.vue";
import ActiveTrades from "./ActiveTrades.vue";
import TradeHistory from "./TradeHistory.vue";
import RToggle from "./RToggle.vue";
import api from "../services/api";

const maxDailyLoss = ref(500);
const maxOpenRisk = ref(2000);
const activeTrades = ref([]);
const tradeHistory = ref([]);
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
        type: trade.type,
        shares: trade.quantity || 0,
        entryPrice: trade.entry_price || 0,
        stopLoss: trade.stop_loss || 0,
        target1: trade.take_profit,
        notes: trade.notes || "",
        riskAmount: riskAmount,
        rSize: trade.r_size || defaultRSize.value,
        entry_time: trade.entry_time || new Date().toISOString(),
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
};

// Load data when component mounts
onMounted(async () => {
  await loadRiskSettings();
  await loadActiveTrades();
});

// Load settings when component is mounted
onMounted(() => {
  loadRiskSettings();
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
      type: trade.type.toUpperCase(),
      quantity: trade.calculatedShares || trade.shares,
      entry_price: parseFloat(trade.entryPrice),
      stop_loss: parseFloat(trade.stopLoss),
      take_profit: trade.target1 ? parseFloat(trade.target1) : null,
      notes: trade.notes,
      risk_amount: riskAmount,
      r_size: defaultRSize.value,
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

const handleTradeClosed = (tradeId, profitLoss) => {
  const tradeIndex = activeTrades.value.findIndex((t) => t.id === tradeId);
  if (tradeIndex !== -1) {
    const closedTrade = activeTrades.value.splice(tradeIndex, 1)[0];
    closedTrade.status = "closed";
    closedTrade.closeDate = new Date().toISOString();
    closedTrade.profitLoss = profitLoss;
    closedTrade.realizedLoss = profitLoss < 0 ? Math.abs(profitLoss) : 0;
    tradeHistory.value.push(closedTrade);
  }
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

<template>
  <div class="trade-history">
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirmation"
      class="modal-overlay"
      @click="cancelDelete"
    >
      <div class="confirmation-modal" @click.stop>
        <div class="modal-header">
          <h3>⚠️ Confirm Deletion</h3>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete
            <strong>{{ selectedTrades.size }}</strong> trade{{
              selectedTrades.size > 1 ? "s" : ""
            }}?
          </p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="cancelDelete" class="modal-cancel-btn">Cancel</button>
          <button @click="executeDelete" class="modal-delete-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
    <div class="header-row">
      <h2>Trade History</h2>
      <div class="header-actions" v-if="tradesStore.closedTrades.length > 0">
        <button v-if="!editMode" @click="enterEditMode" class="edit-mode-btn">
          Edit
        </button>
        <template v-else>
          <button @click="saveAllChanges" class="save-all-btn">
            ✓ Save All
          </button>
          <button @click="cancelEditMode" class="cancel-all-btn">
            ✕ Cancel
          </button>
          <button
            v-if="selectedTrades.size > 0"
            @click="confirmDeleteSelected"
            class="delete-selected-btn"
          >
            🗑 Delete Selected ({{ selectedTrades.size }})
          </button>
        </template>
      </div>
    </div>

    <div v-if="tradesStore.closedTrades.length === 0" class="no-history">
      <p>No completed trades yet. Your trading history will appear here.</p>
    </div>

    <div v-else>
      <!-- Statistics Summary -->
      <div class="stats-summary">
        <div class="stat-card">
          <h3>Total Trades</h3>
          <span class="stat-value">{{ totalTrades }}</span>
        </div>
        <div class="stat-card">
          <h3>Win Rate</h3>
          <span
            class="stat-value"
            :class="{ positive: winRate > 50, negative: winRate < 50 }"
          >
            {{ winRate.toFixed(1) }}%
          </span>
        </div>
        <div class="stat-card">
          <h3>Total P&L</h3>
          <span
            class="stat-value"
            :class="{ positive: totalPnL > 0, negative: totalPnL < 0 }"
          >
            <template v-if="uiStore.showRInDollars">
              {{ totalPnLR > 0 ? "+" : "" }}{{ totalPnLR.toFixed(2) }}R
              <small
                >({{ totalPnL > 0 ? "+" : "" }}${{
                  totalPnL.toFixed(2)
                }})</small
              >
            </template>
            <template v-else>
              {{ totalPnL > 0 ? "+" : "" }}${{ totalPnL.toFixed(2) }}
            </template>
          </span>
        </div>
        <div class="stat-card">
          <h3>Avg R Multiple</h3>
          <span
            class="stat-value"
            :class="{ positive: avgRMultiple > 0, negative: avgRMultiple < 0 }"
          >
            {{ avgRMultiple > 0 ? "+" : "" }}{{ avgRMultiple.toFixed(2) }}R
          </span>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="filter-controls" :class="{ 'edit-mode-active': editMode }">
        <select v-model="filterPeriod" @change="filterTrades">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        <select v-model="filterType" @change="filterTrades">
          <option value="all">All Types</option>
          <option value="long">Long Only</option>
          <option value="short">Short Only</option>
        </select>
      </div>

      <!-- History Table -->
      <div class="history-table">
        <table>
          <thead>
            <tr>
              <th v-if="editMode" class="checkbox-col">
                <div
                  class="custom-checkbox select-all"
                  @click="toggleSelectAll"
                  :class="{
                    checked:
                      selectedTrades.size === filteredHistory.length &&
                      filteredHistory.length > 0,
                  }"
                  title="Select All"
                >
                  <svg
                    v-if="
                      selectedTrades.size === filteredHistory.length &&
                      filteredHistory.length > 0
                    "
                    class="check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <path d="M6 12l4 4L18 8" />
                  </svg>
                </div>
              </th>
              <th>Entry Date</th>
              <th>Exit Date</th>
              <th>Ticker</th>
              <th>Strategy</th>
              <th>Type</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Shares</th>
              <th>P&L ($)</th>
              <th>P&L (%)</th>
              <th>R-Multiple</th>
              <th>Win/Loss</th>
              <th>Tax</th>
              <th>Int</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="trade in filteredHistory"
              :key="trade.id"
              :class="{
                profitable: trade.profitLoss > 0,
                losing: trade.profitLoss < 0,
                'edit-mode-row': editMode,
              }"
              :title="trade.notes || ''"
            >
              <td v-if="editMode" class="checkbox-col">
                <div
                  class="custom-checkbox delete-checkbox"
                  @click="toggleTradeSelection(trade.id)"
                  :class="{ checked: selectedTrades.has(trade.id) }"
                >
                  <svg
                    v-if="selectedTrades.has(trade.id)"
                    class="x-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </div>
              </td>
              <td>
                <span v-if="!editMode">{{ formatDate(trade.entryDate) }}</span>
                <input
                  v-else
                  v-model="editedTrades[trade.id].entryDate"
                  type="datetime-local"
                  class="table-edit-input"
                />
              </td>
              <td>
                <span v-if="!editMode">{{ formatDate(trade.closeDate) }}</span>
                <input
                  v-else
                  v-model="editedTrades[trade.id].closeDate"
                  type="datetime-local"
                  class="table-edit-input"
                />
              </td>
              <td class="ticker">
                <span v-if="!editMode">{{ trade.ticker }}</span>
                <input
                  v-else
                  v-model="editedTrades[trade.id].ticker"
                  type="text"
                  class="table-edit-input ticker-input"
                />
              </td>
              <td>
                <span v-if="!editMode">{{ trade.strategy || "-" }}</span>
                <input
                  v-else
                  v-model="editedTrades[trade.id].strategy"
                  type="text"
                  class="table-edit-input"
                  placeholder="Strategy"
                />
              </td>
              <td>
                <span class="trade-type" :class="trade.type">
                  {{ trade.type.toUpperCase() }}
                </span>
              </td>
              <td>
                <span v-if="!editMode">${{ trade.entryPrice.toFixed(2) }}</span>
                <input
                  v-else
                  v-model.number="editedTrades[trade.id].entryPrice"
                  type="number"
                  step="0.01"
                  class="table-edit-input price-input"
                />
              </td>
              <td>
                <span v-if="!editMode"
                  >${{ trade.exitPrice?.toFixed(2) || "-" }}</span
                >
                <input
                  v-else
                  v-model.number="editedTrades[trade.id].exitPrice"
                  type="number"
                  step="0.01"
                  class="table-edit-input price-input"
                />
              </td>
              <td>
                <span v-if="!editMode">{{ trade.quantity || 0 }}</span>
                <input
                  v-else
                  v-model.number="editedTrades[trade.id].quantity"
                  type="number"
                  step="1"
                  class="table-edit-input shares-input"
                />
              </td>
              <td
                class="pnl"
                :class="{
                  positive: trade.profitLoss > 0,
                  negative: trade.profitLoss < 0,
                }"
              >
                {{ trade.profitLoss > 0 ? "+" : "" }}${{
                  trade.profitLoss.toFixed(2)
                }}
              </td>
              <td
                class="pnl-percent"
                :class="{
                  positive: calculatePnLPercent(trade) > 0,
                  negative: calculatePnLPercent(trade) < 0,
                }"
              >
                {{ calculatePnLPercent(trade) > 0 ? "+" : ""
                }}{{ calculatePnLPercent(trade).toFixed(2) }}%
              </td>
              <td
                class="r-multiple"
                :class="{
                  positive: tradeRMultiple(trade) > 0,
                  negative: tradeRMultiple(trade) < 0,
                }"
              >
                {{ tradeRMultiple(trade) > 0 ? "+" : ""
                }}{{ tradeRMultiple(trade).toFixed(2) }}R
              </td>
              <td>
                <span
                  class="win-loss-badge"
                  :class="{
                    win: trade.profitLoss > 0,
                    loss: trade.profitLoss < 0,
                    breakeven: trade.profitLoss === 0,
                  }"
                >
                  {{
                    trade.profitLoss > 0
                      ? "WIN"
                      : trade.profitLoss < 0
                      ? "LOSS"
                      : "BE"
                  }}
                </span>
              </td>
              <td class="tax">${{ calculateTax(trade).toFixed(2) }}</td>
              <td class="margin-interest">
                ${{ (trade.marginInterest || 0).toFixed(2) }}
              </td>
              <td
                class="net-profit"
                :class="{
                  positive: calculateNetProfit(trade) > 0,
                  negative: calculateNetProfit(trade) < 0,
                }"
              >
                {{ calculateNetProfit(trade) > 0 ? "+" : "" }}${{
                  calculateNetProfit(trade).toFixed(2)
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Monthly Performance Chart -->
      <div class="performance-chart" v-if="monthlyData.length > 0">
        <h3>Monthly Performance</h3>
        <div class="chart-container">
          <div
            v-for="month in monthlyData"
            :key="month.label"
            class="chart-bar"
          >
            <div
              class="bar-fill"
              :style="{
                height: Math.abs((month.pnl / maxMonthlyPnL) * 100) + '%',
                backgroundColor: month.pnl >= 0 ? '#27ae60' : '#e74c3c',
              }"
            ></div>
            <div class="bar-label">{{ month.label }}</div>
            <div class="bar-value">
              {{ month.pnl > 0 ? "+" : "" }}${{ month.pnl.toFixed(0) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Toast from "./Toast.vue";
import api from "../services/api";
import { useTradesStore } from "../stores/trades";
import { useUIStore } from "../stores/ui";
import { useSettingsStore } from "../stores/settings";
import {
  calculateProfitLoss,
  calculateTaxAmount,
  calculateMarginInterest,
  calculateDaysHeld,
} from "../../../shared/tradeCalculations";

const tradesStore = useTradesStore();
const uiStore = useUIStore();
const settingsStore = useSettingsStore();

const filterPeriod = ref("all");
const filterType = ref("all");
const filteredHistory = ref([]);
const editMode = ref(false);
const editedTrades = ref({});
const selectedTrades = ref(new Set());
const showDeleteConfirmation = ref(false);

const toast = ref({
  show: false,
  message: "",
  type: "success",
});

const showToast = (message, type = "success") => {
  toast.value = {
    show: true,
    message,
    type,
  };
};

// Statistics
const totalTrades = computed(() => tradesStore.closedTrades.length);

const winningTrades = computed(() =>
  tradesStore.closedTrades.filter((trade) => trade.profitLoss > 0)
);

const winRate = computed(() => {
  if (totalTrades.value === 0) return 0;
  return (winningTrades.value.length / totalTrades.value) * 100;
});

const totalPnL = computed(() =>
  tradesStore.closedTrades.reduce((total, trade) => total + trade.profitLoss, 0)
);

const totalPnLR = computed(() => {
  return totalPnL.value / settingsStore.riskSettings.defaultRSize;
});

const avgRMultiple = computed(() => {
  if (totalTrades.value === 0) return 0;
  const totalR = tradesStore.closedTrades.reduce((total, trade) => {
    const rMultiple =
      trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : 0;
    return total + rMultiple;
  }, 0);
  return totalR / totalTrades.value;
});

// Monthly performance data
const monthlyData = computed(() => {
  const monthlyMap = new Map();

  tradesStore.closedTrades.forEach((trade) => {
    const date = new Date(trade.closeDate);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthLabel = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { label: monthLabel, pnl: 0 });
    }

    monthlyMap.get(monthKey).pnl += trade.profitLoss;
  });

  return Array.from(monthlyMap.values()).slice(-6); // Last 6 months
});

const maxMonthlyPnL = computed(() => {
  if (monthlyData.value.length === 0) return 1;
  return Math.max(...monthlyData.value.map((m) => Math.abs(m.pnl)));
});

// Filter functions
const filterTrades = () => {
  let filtered = [...tradesStore.closedTrades];

  // Filter by period
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filterPeriod.value) {
    case "today":
      filtered = filtered.filter((trade) => new Date(trade.closeDate) >= today);
      break;
    case "week":
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(
        (trade) => new Date(trade.closeDate) >= weekAgo
      );
      break;
    case "month":
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(
        (trade) => new Date(trade.closeDate) >= monthAgo
      );
      break;
  }

  // Filter by type
  if (filterType.value !== "all") {
    filtered = filtered.filter((trade) => trade.type === filterType.value);
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.closeDate) - new Date(a.closeDate));

  filteredHistory.value = filtered;
};

// Utility functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const tradeRMultiple = (trade) => {
  return trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : 0;
};

const calculatePnLPercent = (trade) => {
  const entryValue = trade.entryPrice * (trade.quantity || 0);
  return entryValue > 0 ? (trade.profitLoss / entryValue) * 100 : 0;
};

const calculateTax = (trade) => {
  if (trade.taxAmount !== undefined && trade.taxAmount !== null) {
    return trade.taxAmount;
  }
  return trade.profitLoss > 0 ? trade.profitLoss * 0.25 : 0;
};

const calculateNetProfit = (trade) => {
  const tax = calculateTax(trade);
  const marginInterest = trade.marginInterest || 0;
  return trade.profitLoss - tax - marginInterest;
};

const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Same day";
  if (diffDays === 1) return "1 day";
  return `${diffDays} days`;
};

const formatDateTimeForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const enterEditMode = () => {
  editMode.value = true;
  // Create a copy of all trades for editing
  editedTrades.value = {};
  filteredHistory.value.forEach((trade) => {
    editedTrades.value[trade.id] = {
      ticker: trade.ticker,
      strategy: trade.strategy || "",
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity,
      entryDate: formatDateTimeForInput(trade.entryDate),
      closeDate: formatDateTimeForInput(trade.closeDate),
    };
  });
};

const cancelEditMode = () => {
  editMode.value = false;
  editedTrades.value = {};
  selectedTrades.value = new Set();
};

const toggleTradeSelection = (tradeId) => {
  if (selectedTrades.value.has(tradeId)) {
    selectedTrades.value.delete(tradeId);
  } else {
    selectedTrades.value.add(tradeId);
  }
  // Force reactivity update
  selectedTrades.value = new Set(selectedTrades.value);
};

const toggleSelectAll = () => {
  if (selectedTrades.value.size === filteredHistory.value.length) {
    selectedTrades.value = new Set();
  } else {
    selectedTrades.value = new Set(filteredHistory.value.map((t) => t.id));
  }
};

const confirmDeleteSelected = () => {
  showDeleteConfirmation.value = true;
};

const cancelDelete = () => {
  showDeleteConfirmation.value = false;
};

const executeDelete = async () => {
  const count = selectedTrades.value.size;
  showDeleteConfirmation.value = false;

  try {
    const deletePromises = Array.from(selectedTrades.value).map((tradeId) =>
      api.deleteTrade(tradeId)
    );

    await Promise.all(deletePromises);

    // Refresh the history
    window.location.reload();

    editMode.value = false;
    editedTrades.value = {};
    selectedTrades.value = new Set();
    showToast(
      `Successfully deleted ${count} trade${count > 1 ? "s" : ""}`,
      "success"
    );
  } catch (error) {
    console.error("Error deleting trades:", error);
    showToast(`Error deleting trades: ${error.message}`, "error");
  }
};

const saveAllChanges = async () => {
  try {
    const updates = Object.keys(editedTrades.value).map(async (tradeId) => {
      const edited = editedTrades.value[tradeId];
      const originalTrade = tradesStore.closedTrades.find(
        (t) => t.id === parseInt(tradeId)
      );

      if (!originalTrade) return null;

      // Recalculate P&L based on edited values
      const entryPrice = parseFloat(edited.entryPrice);
      const exitPrice = parseFloat(edited.exitPrice);
      const quantity = parseFloat(edited.quantity);

      const profitLoss = calculateProfitLoss(
        originalTrade.type,
        entryPrice,
        exitPrice,
        quantity
      );

      // Calculate tax (using original tax rates if available)
      const taxAmount = calculateTaxAmount(
        profitLoss,
        originalTrade.stateTaxRate || 0,
        originalTrade.federalTaxRate || 0
      );

      // Calculate margin interest
      const positionSize = originalTrade.positionSize || entryPrice * quantity;
      const daysHeld = calculateDaysHeld(edited.entryDate, edited.closeDate);
      const marginInterest = calculateMarginInterest(
        positionSize,
        originalTrade.marginInterestRate || 0,
        daysHeld
      );

      const updateData = {
        symbol: edited.ticker,
        strategy: edited.strategy,
        entryPrice: entryPrice,
        exitPrice: exitPrice,
        quantity: quantity,
        entryTime: edited.entryDate,
        exitTime: edited.closeDate,
        profitLoss: profitLoss,
        taxAmount: taxAmount,
        marginInterest: marginInterest,
        positionSize: entryPrice * quantity,
      };

      return api.updateTrade(tradeId, updateData);
    });

    await Promise.all(updates.filter((u) => u !== null));

    // Refresh the history
    window.location.reload();

    editMode.value = false;
    editedTrades.value = {};
    showToast(`Successfully updated ${updates.length} trade(s)`, "success");
  } catch (error) {
    console.error("Error updating trades:", error);
    showToast(`Error updating trades: ${error.message}`, "error");
  }
};

// Initialize filtered history
filterTrades();

// Watch for history changes
watch(
  () => tradesStore.closedTrades,
  () => {
    filterTrades();
  },
  { deep: true }
);
</script>

<style scoped>
.trade-history {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.trade-history h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.edit-mode-btn,
.save-all-btn,
.cancel-all-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-mode-btn {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.edit-mode-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.save-all-btn {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
}

.save-all-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
}

.cancel-all-btn {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(149, 165, 166, 0.3);
}

.cancel-all-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(149, 165, 166, 0.4);
}

.delete-selected-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.delete-selected-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

.checkbox-col {
  width: 40px;
  text-align: center;
  padding: 8px 4px !important;
}

.custom-checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.custom-checkbox:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.custom-checkbox.select-all {
  border-color: #3b82f6;
}

.custom-checkbox.select-all:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.custom-checkbox.select-all.checked {
  background: #3b82f6;
  border-color: #3b82f6;
}

.custom-checkbox.delete-checkbox.checked {
  background: #ef4444;
  border-color: #ef4444;
}

.custom-checkbox.delete-checkbox:hover {
  border-color: #f87171;
}

.custom-checkbox .check-icon,
.custom-checkbox .x-icon {
  width: 14px;
  height: 14px;
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.confirmation-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 450px;
  width: 90%;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 12px 0;
  color: #4b5563;
  font-size: 1rem;
  line-height: 1.5;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.warning-text {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.9rem;
}

.modal-actions {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-cancel-btn,
.modal-delete-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.modal-cancel-btn:hover {
  background: #e5e7eb;
}

.modal-delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.modal-delete-btn:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.no-history {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  border: 1px solid #e1e8ed;
}

.stat-card h3 {
  margin: 0 0 8px 0;
  color: #5a6c7d;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value small {
  display: block;
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 4px;
}

.stat-value.positive {
  color: #27ae60;
}

.stat-value.negative {
  color: #e74c3c;
}

.filter-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  transition: opacity 0.2s ease;
}

.filter-controls.edit-mode-active {
  opacity: 0.5;
  pointer-events: none;
}

.filter-controls select {
  padding: 8px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
}

.history-table {
  overflow-x: auto;
  margin-bottom: 30px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

th {
  background: #f8f9fa;
  padding: 10px 6px;
  text-align: left;
  font-weight: 600;
  color: #5a6c7d;
  border-bottom: 2px solid #e1e8ed;
  white-space: nowrap;
}

td {
  padding: 8px 6px;
  border-bottom: 1px solid #e1e8ed;
}

/* Entry/Exit dates - compact */
th:nth-child(1),
th:nth-child(2),
td:nth-child(1),
td:nth-child(2) {
  padding: 8px 3px;
  font-size: 0.8rem;
  white-space: nowrap;
}

/* Make date inputs more compact */
td:nth-child(1) .table-edit-input,
td:nth-child(2) .table-edit-input {
  font-size: 0.7rem;
  max-width: 115px;
}

/* Ticker - compact */
th:nth-child(3),
td:nth-child(3) {
  padding: 8px 4px;
}

/* Type - compact */
th:nth-child(5),
td:nth-child(5) {
  padding: 8px 4px;
}

/* Win/Loss - compact */
th:nth-child(12),
td:nth-child(12) {
  padding: 8px 4px;
}

/* Tax and Margin Interest - compact */
th:nth-child(13),
th:nth-child(14),
td:nth-child(13),
td:nth-child(14) {
  padding: 8px 4px;
  font-size: 0.8rem;
}

tr.profitable {
  background: rgba(39, 174, 96, 0.05);
}

tr.losing {
  background: rgba(231, 76, 60, 0.05);
}

tr.edit-mode-row {
  background: linear-gradient(
    to right,
    rgba(52, 152, 219, 0.03) 0%,
    rgba(52, 152, 219, 0.01) 100%
  );
  border-left: 3px solid #3498db;
}

tr.edit-mode-row:hover {
  background: linear-gradient(
    to right,
    rgba(52, 152, 219, 0.05) 0%,
    rgba(52, 152, 219, 0.02) 100%
  );
}

.table-edit-input {
  width: 100%;
  padding: 4px 6px;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  font-size: inherit;
  font-weight: inherit;
  color: #2c3e50;
  background: transparent;
  box-sizing: border-box;
  transition: all 0.2s ease;
  font-family: inherit;
}

.table-edit-input:hover {
  border-bottom-color: rgba(52, 152, 219, 0.3);
  background: rgba(52, 152, 219, 0.05);
}

.table-edit-input:focus {
  outline: none;
  border-bottom-color: #3498db;
  background: rgba(52, 152, 219, 0.08);
}

.ticker-input {
  font-weight: 600;
  max-width: 80px;
}

.price-input,
.shares-input {
  text-align: right;
  max-width: 100px;
}

.ticker {
  font-weight: 600;
  color: #2c3e50;
}

.trade-type {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.trade-type.long {
  background: #d5f4e6;
  color: #27ae60;
}

.trade-type.short {
  background: #fadbd8;
  color: #e74c3c;
}

.pnl,
.r-multiple {
  font-weight: 600;
}

.pnl small {
  display: block;
  font-size: 0.75rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 2px;
}

.pnl.positive,
.r-multiple.positive {
  color: #27ae60;
}

.pnl.negative,
.r-multiple.negative,
.pnl-percent.negative,
.net-profit.negative {
  color: #e74c3c;
}

.pnl-percent.positive,
.net-profit.positive {
  color: #27ae60;
}

.win-loss-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.win-loss-badge.win {
  background: #d5f4e6;
  color: #27ae60;
}

.win-loss-badge.loss {
  background: #fadbd8;
  color: #e74c3c;
}

.win-loss-badge.breakeven {
  background: #e8e8e8;
  color: #7f8c8d;
}

.tax,
.margin-interest {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.performance-chart {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.performance-chart h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.chart-container {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 200px;
  padding: 20px 0;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  background: #fafbfc;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;
  position: relative;
}

.bar-fill {
  width: 30px;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
}

.bar-label {
  margin-top: 8px;
  font-size: 0.75rem;
  color: #5a6c7d;
  text-align: center;
}

.bar-value {
  position: absolute;
  top: -20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-controls {
    flex-direction: column;
  }

  .history-table {
    font-size: 0.8rem;
  }

  th,
  td {
    padding: 8px 4px;
  }

  .chart-container {
    height: 150px;
  }

  .chart-bar {
    max-width: 40px;
  }

  .bar-fill {
    width: 20px;
  }
}
</style>

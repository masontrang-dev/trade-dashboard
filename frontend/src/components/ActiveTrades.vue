<template>
  <div class="active-trades">
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
    <h2>Active Trades ({{ trades.length }})</h2>

    <div v-if="trades.length === 0" class="no-trades">
      <p>No active trades. Add your first trade to get started!</p>
    </div>

    <div v-else class="trades-list">
      <div
        v-for="trade in trades"
        :key="trade.id"
        class="trade-card"
        :class="{
          profitable: currentPnL(trade) > 0,
          losing: currentPnL(trade) < 0,
          closing: closingTradeId === trade.id,
          editing: editingTradeId === trade.id,
        }"
      >
        <div class="trade-header">
          <div class="ticker-info">
            <h3 v-if="editingTradeId !== trade.id">{{ trade.ticker }}</h3>
            <input
              v-else
              v-model="editForm.ticker"
              type="text"
              class="inline-edit-input ticker-input"
              placeholder="Ticker"
            />
            <span class="trade-type" :class="trade.type">{{
              trade.type ? trade.type.toUpperCase() : ""
            }}</span>
            <span class="strategy-badge" v-if="trade.strategy">{{
              trade.strategy
            }}</span>
            <span class="entry-date">{{ formatDate(trade.entry_time) }}</span>
          </div>
          <div class="trade-actions">
            <button
              @click="toggleDetails(trade.id)"
              class="details-btn"
              title="Toggle Details"
            >
              {{ expandedTradeId === trade.id ? "▼" : "▶" }}
            </button>
            <button
              v-if="editingTradeId !== trade.id"
              @click="startEditTrade(trade)"
              class="edit-btn"
            >
              Edit
            </button>
            <button v-else @click="cancelEdit" class="cancel-edit-btn">
              Cancel
            </button>
            <button
              v-if="editingTradeId === trade.id"
              @click="saveTradeEdit"
              class="save-edit-btn"
            >
              Save
            </button>
            <button
              @click="toggleCloseTrade(trade)"
              class="close-btn"
              :class="{ active: closingTradeId === trade.id }"
            >
              {{ closingTradeId === trade.id ? "Cancel" : "Close" }}
            </button>
          </div>
        </div>

        <div class="trade-details">
          <!-- Essential Info - Always Visible -->
          <div class="detail-row">
            <div class="detail-item">
              <span class="label">Entry:</span>
              <span v-if="editingTradeId !== trade.id" class="value">
                ${{ trade.entryPrice ? trade.entryPrice.toFixed(2) : "0.00" }}
              </span>
              <input
                v-else
                v-model.number="editForm.entryPrice"
                type="number"
                step="0.01"
                min="0.01"
                class="inline-edit-input"
                placeholder="Entry Price"
              />
            </div>
            <div class="detail-item">
              <span class="label">Current:</span>
              <span
                class="value"
                :class="{
                  'text-green-500': trade.current_price > trade.entryPrice,
                  'text-red-500': trade.current_price < trade.entryPrice,
                }"
              >
                ${{
                  trade.current_price ? trade.current_price.toFixed(2) : "--.--"
                }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">Stop:</span>
              <span v-if="editingTradeId !== trade.id" class="value">
                ${{ trade.stopLoss ? trade.stopLoss.toFixed(2) : "0.00" }}
              </span>
              <input
                v-else
                v-model.number="editForm.stopLoss"
                type="number"
                step="0.01"
                min="0.01"
                class="inline-edit-input"
                placeholder="Stop Loss"
              />
            </div>
          </div>

          <!-- Collapsible Details Section (Auto-expanded in edit mode) -->
          <transition name="expand">
            <div
              v-if="expandedTradeId === trade.id || editingTradeId === trade.id"
              class="expanded-details"
            >
              <div class="detail-row">
                <div class="detail-item">
                  <span class="label">Shares:</span>
                  <span v-if="editingTradeId !== trade.id" class="value">{{
                    trade.shares
                  }}</span>
                  <input
                    v-else
                    v-model.number="editForm.shares"
                    type="number"
                    step="1"
                    min="1"
                    class="inline-edit-input"
                    placeholder="Shares"
                  />
                </div>
                <div class="detail-item">
                  <span class="label">Position Size:</span>
                  <span v-if="editingTradeId !== trade.id" class="value">
                    ${{ (trade.entryPrice * trade.shares).toFixed(2) }}
                  </span>
                  <input
                    v-else
                    v-model.number="editForm.position_size"
                    type="number"
                    step="0.01"
                    min="0.01"
                    class="inline-edit-input readonly-input"
                    placeholder="Position Size"
                    readonly
                  />
                </div>
                <div class="detail-item">
                  <span class="label">Risk:</span>
                  <span v-if="editingTradeId !== trade.id" class="value">
                    <template v-if="showRValues">
                      {{
                        (trade.riskAmount ? riskAmountR(trade) : 0).toFixed(2)
                      }}R
                      <small
                        >({{
                          trade.riskAmount
                            ? `$${trade.riskAmount.toFixed(2)}`
                            : "$0.00"
                        }})</small
                      >
                    </template>
                    <template v-else>
                      ${{
                        trade.riskAmount ? trade.riskAmount.toFixed(2) : "0.00"
                      }}
                    </template>
                  </span>
                  <input
                    v-else
                    v-model.number="editForm.riskAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    class="inline-edit-input"
                    placeholder="Risk Amount"
                  />
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-item">
                  <span class="label">Target 1:</span>
                  <span v-if="editingTradeId !== trade.id" class="value"
                    >${{ trade.target1?.toFixed(2) || "-" }}</span
                  >
                  <input
                    v-else
                    v-model.number="editForm.target1"
                    type="number"
                    step="0.01"
                    min="0.01"
                    class="inline-edit-input"
                    placeholder="Target 1"
                  />
                </div>
                <div class="detail-item">
                  <span class="label">Target 2:</span>
                  <span v-if="editingTradeId !== trade.id" class="value"
                    >${{ trade.target2?.toFixed(2) || "-" }}</span
                  >
                  <input
                    v-else
                    v-model.number="editForm.target2"
                    type="number"
                    step="0.01"
                    min="0.01"
                    class="inline-edit-input"
                    placeholder="Target 2"
                  />
                </div>
              </div>

              <!-- Edit mode: Additional fields -->
              <div v-if="editingTradeId === trade.id" class="detail-row">
                <div class="detail-item">
                  <span class="label">Strategy:</span>
                  <input
                    v-model="editForm.strategy"
                    type="text"
                    class="inline-edit-input"
                    placeholder="Strategy name"
                  />
                </div>
                <div class="detail-item">
                  <span class="label">Entry Date:</span>
                  <input
                    v-model="editForm.entry_time"
                    type="datetime-local"
                    class="inline-edit-input"
                  />
                </div>
                <div class="detail-item">
                  <span class="label">Exit Date:</span>
                  <input
                    v-model="editForm.exit_time"
                    type="datetime-local"
                    class="inline-edit-input"
                  />
                </div>
              </div>

              <div
                v-if="trade.notes || editingTradeId === trade.id"
                class="trade-notes"
              >
                <span class="label">Notes:</span>
                <p v-if="editingTradeId !== trade.id">{{ trade.notes }}</p>
                <textarea
                  v-else
                  v-model="editForm.notes"
                  rows="3"
                  class="inline-edit-textarea"
                  placeholder="Add trade notes..."
                ></textarea>
              </div>
            </div>
          </transition>

          <div class="current-status">
            <div class="pnl-info">
              <span class="label">Current P&L:</span>
              <span
                class="pnl-value"
                :class="{
                  profit: currentPnL(trade) > 0,
                  loss: currentPnL(trade) < 0,
                }"
              >
                <template v-if="showRValues">
                  {{ currentRMultiple(trade) > 0 ? "+" : ""
                  }}{{ currentRMultiple(trade).toFixed(2) }}R
                  <small
                    >({{ currentPnL(trade) > 0 ? "+" : "" }}${{
                      currentPnL(trade).toFixed(2)
                    }})</small
                  >
                </template>
                <template v-else>
                  {{ currentPnL(trade) > 0 ? "+" : "" }}${{
                    currentPnL(trade).toFixed(2)
                  }}
                  <small v-if="currentPnLPercent(trade) !== null">
                    ({{ currentPnLPercent(trade) > 0 ? "+" : ""
                    }}{{ currentPnLPercent(trade).toFixed(1) }}%)
                  </small>
                </template>
              </span>
            </div>
            <div class="r-multiple" v-if="!showRValues">
              <span class="label">R Multiple:</span>
              <span
                class="r-value"
                :class="{
                  profit: currentRMultiple(trade) > 0,
                  loss: currentRMultiple(trade) < 0,
                }"
              >
                {{ currentRMultiple(trade) > 0 ? "+" : ""
                }}{{ currentRMultiple(trade).toFixed(2) }}R
              </span>
            </div>
          </div>

          <div class="r-progress-section">
            <div class="r-progress-label">R Progress</div>
            <div class="r-progress-bar">
              <div class="r-progress-track">
                <!-- Markers -->
                <div class="r-marker stop" title="Stop Loss: -1R">
                  <span class="marker-label">Stop</span>
                </div>
                <div class="r-marker entry" title="Entry: 0R">
                  <span class="marker-label">Entry</span>
                </div>
                <div
                  class="r-marker target1"
                  title="Target 1: +1R"
                  v-if="trade.target1"
                >
                  <span class="marker-label">T1</span>
                </div>
                <div
                  class="r-marker target2"
                  title="Target 2: +2R"
                  v-if="trade.target2"
                >
                  <span class="marker-label">T2</span>
                </div>
                <!-- Progress indicator -->
                <div
                  class="r-progress-indicator"
                  :class="{
                    positive: currentRMultiple(trade) > 0,
                    negative: currentRMultiple(trade) < 0,
                  }"
                  :style="{ left: calculateRProgressPosition(trade) + '%' }"
                  :title="currentRMultiple(trade).toFixed(2) + 'R'"
                >
                  <span class="indicator-value"
                    >{{ currentRMultiple(trade).toFixed(2) }}R</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Close Trade Fields - Animated inline -->
          <transition name="slide-fade">
            <div
              v-if="closingTradeId === trade.id"
              class="close-fields-section"
            >
              <div class="detail-row">
                <div class="detail-item close-field">
                  <span class="label">Exit Price *</span>
                  <input
                    v-model.number="closeForm.exitPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    class="close-input"
                    placeholder="Enter exit price"
                  />
                </div>
                <div class="detail-item close-field">
                  <span class="label">Close Date *</span>
                  <input
                    v-model="closeForm.closeDate"
                    type="datetime-local"
                    class="close-input"
                  />
                </div>
                <div class="detail-item">
                  <span class="label">Days Held:</span>
                  <span class="value">{{ calculateDaysHeld(trade) }}</span>
                </div>
              </div>

              <!-- Projected P&L Row -->
              <div v-if="closeForm.exitPrice" class="detail-row projected-row">
                <div class="detail-item">
                  <span class="label">Projected P&L:</span>
                  <span
                    class="value"
                    :class="{
                      'text-green': calculateClosePnL(trade) > 0,
                      'text-red': calculateClosePnL(trade) < 0,
                    }"
                  >
                    {{ calculateClosePnL(trade) > 0 ? "+" : "" }}${{
                      calculateClosePnL(trade).toFixed(2)
                    }}
                    <small
                      >({{ calculateClosePnLPercent(trade) > 0 ? "+" : ""
                      }}{{
                        calculateClosePnLPercent(trade).toFixed(2)
                      }}%)</small
                    >
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Projected R:</span>
                  <span
                    class="value"
                    :class="{
                      'text-green': calculateCloseRMultiple(trade) > 0,
                      'text-red': calculateCloseRMultiple(trade) < 0,
                    }"
                  >
                    {{ calculateCloseRMultiple(trade) > 0 ? "+" : ""
                    }}{{ calculateCloseRMultiple(trade).toFixed(2) }}R
                  </span>
                </div>
                <div class="detail-item">
                  <button
                    @click="confirmCloseTrade(trade)"
                    class="confirm-close-btn"
                    :disabled="!closeForm.exitPrice || !closeForm.closeDate"
                  >
                    Confirm Close
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import apiService from "../services/api";
import Toast from "./Toast.vue";

const props = defineProps({
  trades: {
    type: Array,
    default: () => [],
  },
  showRValues: {
    type: Boolean,
    default: false,
  },
  defaultRSize: {
    type: Number,
    default: 100,
  },
});

const emit = defineEmits(["trade-closed", "trade-updated"]);

const editingTradeId = ref(null);
const editForm = ref({});
const closingTradeId = ref(null);
const expandedTradeId = ref(null);
const closeForm = ref({
  exitPrice: null,
  closeDate: null,
});

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

const currentPnL = computed(() => (trade) => {
  if (!trade?.current_price) return 0;
  const priceDiff =
    trade.type.toLowerCase() === "long"
      ? trade.current_price - trade.entryPrice
      : trade.entryPrice - trade.current_price;
  return priceDiff * trade.shares;
});

const currentPnLPercent = computed(() => (trade) => {
  if (!trade?.current_price || !trade?.entryPrice || !trade?.shares)
    return null;
  const positionSize = trade.entryPrice * trade.shares;
  if (positionSize === 0) return null;
  return (currentPnL.value(trade) / positionSize) * 100;
});

const currentRMultiple = computed(() => (trade) => {
  if (!trade?.riskAmount || trade.riskAmount === 0) return 0;
  return currentPnL.value(trade) / trade.riskAmount;
});

const riskAmountR = computed(() => (trade) => {
  if (!trade.riskAmount || props.defaultRSize <= 0) return 0;
  return trade.riskAmount / props.defaultRSize;
});

const progressToTarget = computed(() => (trade, target) => {
  if (!trade.currentPrice) return 0;

  const totalRange =
    trade.type === "long"
      ? target - trade.entryPrice
      : trade.entryPrice - target;

  const currentProgress =
    trade.type === "long"
      ? trade.currentPrice - trade.entryPrice
      : trade.entryPrice - trade.currentPrice;

  if (totalRange === 0) return 0;
  return Math.min(100, Math.max(0, (currentProgress / totalRange) * 100));
});

const calculateRProgressPosition = (trade) => {
  const rMultiple = currentRMultiple.value(trade);
  // Scale: -1R to +2R (total range of 3R)
  // -1R = 0%, 0R = 33.33%, +1R = 66.67%, +2R = 100%
  const minR = -1;
  const maxR = 2;
  const rangeR = maxR - minR; // 3R total

  // Clamp the value between -1R and +2R
  const clampedR = Math.max(minR, Math.min(maxR, rMultiple));

  // Calculate percentage position
  const position = ((clampedR - minR) / rangeR) * 100;
  return position;
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

const startEditTrade = (trade) => {
  editingTradeId.value = trade.id;
  editForm.value = {
    ticker: trade.ticker,
    strategy: trade.strategy || "",
    entryPrice: trade.entryPrice,
    stopLoss: trade.stopLoss,
    target1: trade.target1,
    target2: trade.target2,
    shares: trade.shares,
    position_size: trade.position_size || trade.entryPrice * trade.shares,
    riskAmount: trade.riskAmount,
    notes: trade.notes || "",
    entry_time: formatDateTimeForInput(trade.entry_time),
    exit_time: formatDateTimeForInput(trade.exit_time),
  };
  // Auto-expand the details section when editing
  if (expandedTradeId.value !== trade.id) {
    expandedTradeId.value = trade.id;
  }
};

// Watch for changes to shares or entryPrice and recalculate position_size
watch(
  () => [editForm.value.shares, editForm.value.entryPrice],
  ([shares, entryPrice]) => {
    if (shares && entryPrice && editingTradeId.value !== null) {
      editForm.value.position_size = shares * entryPrice;
    }
  }
);

const cancelEdit = () => {
  editingTradeId.value = null;
  editForm.value = {};
};

const saveTradeEdit = async () => {
  try {
    const updateData = {
      symbol: editForm.value.ticker,
      strategy: editForm.value.strategy,
      entry_price: editForm.value.entryPrice,
      stop_loss: editForm.value.stopLoss,
      take_profit: editForm.value.target1,
      quantity: editForm.value.shares,
      position_size: editForm.value.position_size,
      risk_amount: editForm.value.riskAmount,
      notes: editForm.value.notes,
      entry_time: editForm.value.entry_time,
      exit_time: editForm.value.exit_time,
    };

    await apiService.updateTrade(editingTradeId.value, updateData);

    // Update the local trade object
    const updatedTrade = {
      id: editingTradeId.value,
      ticker: editForm.value.ticker,
      strategy: editForm.value.strategy,
      entryPrice: editForm.value.entryPrice,
      stopLoss: editForm.value.stopLoss,
      target1: editForm.value.target1,
      target2: editForm.value.target2,
      shares: editForm.value.shares,
      position_size: editForm.value.position_size,
      riskAmount: editForm.value.riskAmount,
      notes: editForm.value.notes,
      entry_time: editForm.value.entry_time,
      exit_time: editForm.value.exit_time,
    };

    emit("trade-updated", updatedTrade);
    cancelEdit();
    showToast("Trade updated successfully!", "success");
  } catch (error) {
    console.error("Error updating trade:", error);
    showToast(`Error updating trade: ${error.message}`, "error");
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toggleDetails = (tradeId) => {
  expandedTradeId.value = expandedTradeId.value === tradeId ? null : tradeId;
};

const toggleCloseTrade = (trade) => {
  if (closingTradeId.value === trade.id) {
    // Cancel closing
    closingTradeId.value = null;
    closeForm.value = {
      exitPrice: null,
      closeDate: null,
    };
  } else {
    // Start closing
    closingTradeId.value = trade.id;
    // Pre-populate with current price and current date/time
    closeForm.value = {
      exitPrice: trade.current_price || trade.entryPrice,
      closeDate: formatDateTimeLocal(new Date()),
    };
  }
};

const calculateDaysHeld = (trade) => {
  if (!trade.entry_time) return 0;
  const entryDate = new Date(trade.entry_time);
  const closeDate = closeForm.value.closeDate
    ? new Date(closeForm.value.closeDate)
    : new Date();
  const diffTime = Math.abs(closeDate - entryDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const calculateClosePnL = (trade) => {
  if (!closeForm.value.exitPrice) return 0;
  const priceDiff =
    trade.type.toLowerCase() === "long"
      ? closeForm.value.exitPrice - trade.entryPrice
      : trade.entryPrice - closeForm.value.exitPrice;
  return priceDiff * trade.shares;
};

const calculateClosePnLPercent = (trade) => {
  if (!closeForm.value.exitPrice) return 0;
  const positionSize = trade.entryPrice * trade.shares;
  if (positionSize === 0) return 0;
  return (calculateClosePnL(trade) / positionSize) * 100;
};

const calculateCloseRMultiple = (trade) => {
  if (!trade.riskAmount || trade.riskAmount === 0) return 0;
  return calculateClosePnL(trade) / trade.riskAmount;
};

const formatDateTimeLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const confirmCloseTrade = async (trade) => {
  if (!closeForm.value.exitPrice || !closeForm.value.closeDate) {
    alert("Please enter both exit price and close date");
    return;
  }

  try {
    await apiService.closeTrade(trade.id, closeForm.value.exitPrice, {
      closeDate: closeForm.value.closeDate,
    });

    // Reset form
    closingTradeId.value = null;
    closeForm.value = {
      exitPrice: null,
      closeDate: null,
    };

    emit("trade-closed");
    showToast("Trade closed successfully!", "success");
  } catch (error) {
    console.error("Error closing trade:", error);
    showToast(`Error closing trade: ${error.message}`, "error");
  }
};
</script>

<style scoped>
.active-trades {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.active-trades h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.no-trades {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.trades-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.trade-card {
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.2s ease;
}

.trade-card:hover {
  border-color: #3498db;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
}

.trade-card.profitable {
  border-color: #27ae60;
}

.trade-card.losing {
  border-color: #e74c3c;
}

.trade-card.closing {
  border-color: #f39c12;
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.2);
}

.trade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.ticker-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ticker-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.strategy-badge {
  padding: 3px 8px;
  background: #ecf0f1;
  color: #5a6c7d;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.entry-date {
  padding: 3px 8px;
  background: #e8f4f8;
  color: #3498db;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.trade-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
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

.trade-actions {
  display: flex;
  gap: 8px;
}

.details-btn {
  padding: 6px 10px;
  border: 2px solid #e1e8ed;
  background: white;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #5a6c7d;
  font-weight: bold;
}

.details-btn:hover {
  background: #f8f9fa;
  border-color: #3498db;
  color: #3498db;
}

.edit-btn,
.close-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.edit-btn {
  background: #3498db;
  color: white;
}

.edit-btn:hover {
  background: #2980b9;
}

.close-btn {
  background: #e74c3c;
  color: white;
}

.close-btn:hover {
  background: #c0392b;
}

.close-btn.active {
  background: #f39c12;
}

.close-btn.active:hover {
  background: #e67e22;
}

.trade-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item .label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 2px;
}

.detail-item .value {
  font-weight: 600;
  color: #2c3e50;
}

.detail-item .value small {
  display: block;
  font-size: 0.75rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 2px;
}

.current-status {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.pnl-info,
.r-multiple {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pnl-info .label,
.r-multiple .label {
  font-size: 0.9rem;
  color: #5a6c7d;
}

.pnl-value,
.r-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.pnl-value small {
  display: block;
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 2px;
}

.pnl-value.profit,
.r-value.profit {
  color: #27ae60;
}

.pnl-value.loss,
.r-value.loss {
  color: #e74c3c;
}

/* R-based Progress Bar Styles */
.r-progress-section {
  margin-top: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.r-progress-label {
  font-size: 0.85rem;
  font-weight: 600;
  padding-bottom: 16px;
  color: #5a6c7d;
  margin-bottom: 16px;
}

.r-progress-bar {
  width: 100%;
  height: 40px;
  position: relative;
}

.r-progress-track {
  position: relative;
  width: 100%;
  height: 8px;
  background: linear-gradient(
    to right,
    #e74c3c 0%,
    #e74c3c 33.33%,
    #ecf0f1 33.33%,
    #ecf0f1 66.67%,
    #27ae60 66.67%,
    #27ae60 100%
  );
  border-radius: 4px;
  margin-top: 12px;
}

.r-marker {
  position: absolute;
  top: -4px;
  width: 2px;
  height: 16px;
  background: #2c3e50;
  transform: translateX(-50%);
}

.r-marker.stop {
  left: 0%;
  background: #c0392b;
}

.r-marker.entry {
  left: 33.33%;
  background: #34495e;
  height: 20px;
  top: -6px;
  width: 3px;
}

.r-marker.target1 {
  left: 66.67%;
  background: #27ae60;
}

.r-marker.target2 {
  left: 100%;
  background: #229954;
}

.marker-label {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  font-weight: 600;
  color: #5a6c7d;
  white-space: nowrap;
}

.r-marker.stop .marker-label {
  color: #c0392b;
}

.r-marker.entry .marker-label {
  color: #34495e;
  font-weight: 700;
}

.r-marker.target1 .marker-label,
.r-marker.target2 .marker-label {
  color: #27ae60;
}

.r-progress-indicator {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 10;
  transition: left 0.3s ease;
}

.r-progress-indicator.positive {
  background: #27ae60;
}

.r-progress-indicator.negative {
  background: #e74c3c;
}

.indicator-value {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  color: #2c3e50;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.r-progress-indicator.positive .indicator-value {
  color: #27ae60;
}

.r-progress-indicator.negative .indicator-value {
  color: #e74c3c;
}

.expanded-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #e1e8ed;
}

.trade-notes {
  margin-top: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #3498db;
}

.trade-notes .label {
  font-size: 0.8rem;
  color: #5a6c7d;
  font-weight: 600;
  display: block;
  margin-bottom: 5px;
}

.trade-notes p {
  margin: 0;
  color: #5a6c7d;
  font-size: 0.9rem;
  font-style: italic;
}

/* Expand Animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* Modern Inline Edit Styles */
.inline-edit-input,
.inline-edit-textarea {
  width: 100%;
  padding: 0;
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

.inline-edit-input:hover {
  border-bottom-color: rgba(52, 152, 219, 0.3);
  background: rgba(52, 152, 219, 0.03);
}

.inline-edit-input:focus,
.inline-edit-textarea:focus {
  outline: none;
  border-bottom-color: #3498db;
  background: rgba(52, 152, 219, 0.05);
}

.ticker-input {
  font-size: 1.3rem;
  font-weight: bold;
  max-width: 150px;
  padding: 2px 4px;
}

.inline-edit-textarea {
  resize: vertical;
  min-height: 60px;
  padding: 8px;
  border: 1px solid rgba(52, 152, 219, 0.2);
  border-radius: 6px;
  background: rgba(52, 152, 219, 0.03);
}

.inline-edit-textarea:hover {
  border-color: rgba(52, 152, 219, 0.4);
  background: rgba(52, 152, 219, 0.05);
}

.inline-edit-textarea:focus {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.08);
}

.readonly-input {
  cursor: not-allowed;
  background: #f8f9fa !important;
  color: #7f8c8d !important;
}

.readonly-input:hover {
  border-bottom-color: transparent !important;
  background: #f8f9fa !important;
}

.detail-item .inline-edit-input {
  font-weight: 600;
  padding: 4px 6px;
  border-radius: 4px;
}

.full-width {
  grid-column: 1 / -1;
}

.cancel-edit-btn,
.save-edit-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-edit-btn {
  background: #95a5a6;
  color: white;
}

.cancel-edit-btn:hover {
  background: #7f8c8d;
}

.save-edit-btn {
  background: #27ae60;
  color: white;
}

.save-edit-btn:hover {
  background: #229954;
}

.trade-card.editing {
  border-color: #3498db;
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.2);
  background: linear-gradient(
    to bottom,
    rgba(52, 152, 219, 0.02) 0%,
    transparent 100%
  );
}

/* Close Trade Inline Fields */
.close-fields-section {
  margin-top: 15px;
  padding: 15px;
  background: linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%);
  border: 2px solid #f39c12;
  border-radius: 8px;
}

.close-field {
  display: flex;
  flex-direction: column;
}

.close-input {
  padding: 8px 10px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  transition: border-color 0.2s ease;
  background: white;
}

.close-input:focus {
  outline: none;
  border-color: #f39c12;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.1);
}

.projected-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid rgba(243, 156, 18, 0.3);
}

.projected-row .value small {
  display: inline-block;
  font-size: 0.8rem;
  margin-left: 4px;
}

.text-green {
  color: #27ae60 !important;
}

.text-red {
  color: #e74c3c !important;
}

.confirm-close-btn {
  padding: 8px 20px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 4px;
}

.confirm-close-btn:hover:not(:disabled) {
  background: #229954;
}

.confirm-close-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Slide Fade Animation */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

@media (max-width: 768px) {
  .detail-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .current-status {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .progress-item {
    grid-template-columns: 50px 1fr 35px;
  }

  .close-fields-section .detail-row {
    grid-template-columns: 1fr;
  }

  .projected-row .detail-item:last-child {
    grid-column: 1;
  }
}
</style>

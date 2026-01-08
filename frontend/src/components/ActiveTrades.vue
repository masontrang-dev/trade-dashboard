<template>
  <div class="active-trades">
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
        }"
      >
        <div class="trade-header">
          <div class="ticker-info">
            <h3>{{ trade.ticker }}</h3>
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
            <button @click="editTrade(trade)" class="edit-btn">Edit</button>
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
              <span class="value">
                ${{ trade.entryPrice ? trade.entryPrice.toFixed(2) : "0.00" }}
              </span>
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
              <span class="value">
                ${{ trade.stopLoss ? trade.stopLoss.toFixed(2) : "0.00" }}
              </span>
            </div>
          </div>

          <!-- Collapsible Details Section -->
          <transition name="expand">
            <div v-if="expandedTradeId === trade.id" class="expanded-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="label">Shares:</span>
                  <span class="value">{{ trade.shares }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Position Size:</span>
                  <span class="value">
                    ${{ (trade.entryPrice * trade.shares).toFixed(2) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Risk:</span>
                  <span class="value">
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
                </div>
              </div>

              <div class="detail-row">
                <div class="detail-item">
                  <span class="label">Target 1:</span>
                  <span class="value"
                    >${{ trade.target1?.toFixed(2) || "-" }}</span
                  >
                </div>
                <div class="detail-item">
                  <span class="label">Target 2:</span>
                  <span class="value"
                    >${{ trade.target2?.toFixed(2) || "-" }}</span
                  >
                </div>
              </div>

              <div v-if="trade.notes" class="trade-notes">
                <span class="label">Notes:</span>
                <p>{{ trade.notes }}</p>
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

          <div class="progress-bars">
            <div class="progress-item" v-if="trade.target1">
              <span class="progress-label">To T1:</span>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{
                    width: progressToTarget(trade, trade.target1) + '%',
                  }"
                  :class="
                    progressToTarget(trade, trade.target1) >= 100
                      ? 'completed'
                      : ''
                  "
                ></div>
              </div>
              <span class="progress-text"
                >{{ progressToTarget(trade, trade.target1).toFixed(0) }}%</span
              >
            </div>

            <div class="progress-item" v-if="trade.target2">
              <span class="progress-label">To T2:</span>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{
                    width: progressToTarget(trade, trade.target2) + '%',
                  }"
                  :class="
                    progressToTarget(trade, trade.target2) >= 100
                      ? 'completed'
                      : ''
                  "
                ></div>
              </div>
              <span class="progress-text"
                >{{ progressToTarget(trade, trade.target2).toFixed(0) }}%</span
              >
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

    <!-- Edit Trade Modal -->
    <div v-if="editingTrade" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h3>Edit Trade - {{ editingTrade.ticker }}</h3>
        <form @submit.prevent="saveTradeEdit">
          <div class="form-row">
            <div class="form-group">
              <label>Ticker</label>
              <input
                v-model="editingTrade.ticker"
                type="text"
                placeholder="Ticker symbol"
              />
            </div>
            <div class="form-group">
              <label>Strategy</label>
              <input
                v-model="editingTrade.strategy"
                type="text"
                placeholder="Strategy name"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Entry Date</label>
              <input v-model="editingTrade.entry_time" type="datetime-local" />
            </div>
            <div class="form-group">
              <label>Exit Date</label>
              <input v-model="editingTrade.exit_time" type="datetime-local" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Entry Price</label>
              <input
                v-model.number="editingTrade.entryPrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Entry price"
              />
            </div>
            <div class="form-group">
              <label>Stop Price</label>
              <input
                v-model.number="editingTrade.stopLoss"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Stop loss"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Target 1</label>
              <input
                v-model.number="editingTrade.target1"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Target 1"
              />
            </div>
            <div class="form-group">
              <label>Target 2</label>
              <input
                v-model.number="editingTrade.target2"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Target 2"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Exit Price</label>
            <input
              v-model.number="editingTrade.exit_price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Exit price"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Shares</label>
              <input
                v-model.number="editingTrade.shares"
                type="number"
                step="1"
                min="1"
                placeholder="Number of shares"
              />
            </div>
            <div class="form-group">
              <label>Position Size ($)</label>
              <input
                v-model.number="editingTrade.position_size"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Position size"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Total Risk ($R)</label>
            <input
              v-model.number="editingTrade.riskAmount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Total risk amount"
            />
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea
              v-model="editingTrade.notes"
              rows="3"
              placeholder="Update trade notes..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="save-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import apiService from "../services/api";

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

const editingTrade = ref(null);
const closingTradeId = ref(null);
const expandedTradeId = ref(null);
const closeForm = ref({
  exitPrice: null,
  closeDate: null,
});

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

const editTrade = (trade) => {
  editingTrade.value = { ...trade };
};

const closeEditModal = () => {
  editingTrade.value = null;
};

const saveTradeEdit = async () => {
  try {
    const updateData = {
      symbol: editingTrade.value.ticker,
      strategy: editingTrade.value.strategy,
      entry_price: editingTrade.value.entryPrice,
      stop_loss: editingTrade.value.stopLoss,
      take_profit: editingTrade.value.target1,
      exit_price: editingTrade.value.exit_price,
      quantity: editingTrade.value.shares,
      position_size: editingTrade.value.position_size,
      risk_amount: editingTrade.value.riskAmount,
      notes: editingTrade.value.notes,
      entry_time: editingTrade.value.entry_time,
      exit_time: editingTrade.value.exit_time,
    };

    await apiService.updateTrade(editingTrade.value.id, updateData);
    emit("trade-updated", editingTrade.value);
    closeEditModal();
  } catch (error) {
    console.error("Error updating trade:", error);
    alert(`Error updating trade: ${error.message}`);
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
    alert(`Trade closed successfully!`);
  } catch (error) {
    console.error("Error closing trade:", error);
    alert(`Error closing trade: ${error.message}`);
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
  justify-content: space-between;
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

.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-item {
  display: grid;
  grid-template-columns: 60px 1fr 40px;
  align-items: center;
  gap: 10px;
}

.progress-label {
  font-size: 0.85rem;
  color: #5a6c7d;
}

.progress-bar {
  height: 6px;
  background: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

.progress-fill.completed {
  background: #27ae60;
}

.progress-text {
  font-size: 0.85rem;
  color: #5a6c7d;
  text-align: right;
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 25px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #5a6c7d;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn,
.save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.save-btn {
  background: #27ae60;
  color: white;
}

.save-btn:hover {
  background: #229954;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
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
  .form-row {
    grid-template-columns: 1fr;
  }
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

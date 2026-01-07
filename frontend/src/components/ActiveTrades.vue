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
        }"
      >
        <div class="trade-header">
          <div class="ticker-info">
            <h3>{{ trade.ticker }}</h3>
            <span class="trade-type" :class="trade.type">{{
              trade.type ? trade.type.toUpperCase() : ""
            }}</span>
          </div>
          <div class="trade-actions">
            <button @click="editTrade(trade)" class="edit-btn">Edit</button>
            <button @click="closeTrade(trade)" class="close-btn">Close</button>
          </div>
        </div>

        <div class="trade-details">
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

          <div class="detail-row">
            <div class="detail-item">
              <span class="label">P&L:</span>
              <span
                class="value"
                :class="{
                  'text-green-500': trade.pnl > 0,
                  'text-red-500': trade.pnl < 0,
                }"
              >
                ${{ trade.pnl !== null ? trade.pnl.toFixed(2) : "--.--" }}
                <span v-if="trade.pnl_percent !== null" class="text-xs">
                  ({{ trade.pnl_percent > 0 ? "+" : ""
                  }}{{ trade.pnl_percent.toFixed(1) }}%)
                </span>
              </span>
            </div>
            <div class="detail-item">
              <span class="label">Shares:</span>
              <span class="value">{{ trade.shares }}</span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item">
              <span class="label">Risk:</span>
              <span class="value">
                <template v-if="showRValues">
                  {{ (trade.riskAmount ? riskAmountR(trade) : 0).toFixed(2) }}R
                  <small
                    >({{
                      trade.riskAmount
                        ? `$${trade.riskAmount.toFixed(2)}`
                        : "$0.00"
                    }})</small
                  >
                </template>
                <template v-else>
                  ${{ trade.riskAmount ? trade.riskAmount.toFixed(2) : "0.00" }}
                </template>
              </span>
            </div>
            <div class="detail-item">
              <span class="label">T1:</span>
              <span class="value">${{ trade.target1?.toFixed(2) || "-" }}</span>
            </div>
            <div class="detail-item">
              <span class="label">T2:</span>
              <span class="value">${{ trade.target2?.toFixed(2) || "-" }}</span>
            </div>
          </div>

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

          <div v-if="trade.notes" class="trade-notes">
            <p>{{ trade.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Trade Modal -->
    <div v-if="editingTrade" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h3>Edit Trade - {{ editingTrade.ticker }}</h3>
        <form @submit.prevent="saveTradeEdit">
          <div class="form-group">
            <label>Current Price</label>
            <input
              v-model.number="editingTrade.currentPrice"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter current price"
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

const currentPnL = computed(() => (trade) => {
  if (!trade?.current_price) return 0;
  const priceDiff =
    trade.type === "long"
      ? trade.entryPrice - trade.current_price
      : trade.current_price - trade.entryPrice;
  return priceDiff * trade.shares;
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

const saveTradeEdit = () => {
  emit("trade-updated", editingTrade.value);
  closeEditModal();
};

const closeTrade = async (trade) => {
  const exitPrice = parseFloat(
    prompt(
      `Enter exit price for ${trade.symbol}:`,
      trade.current_price || trade.entry_price
    )
  );

  if (!exitPrice || isNaN(exitPrice)) {
    return; // User cancelled or entered invalid price
  }
  try {
    await apiService.closeTrade(trade.id, exitPrice);
    emit("trade-closed"); // Notify parent to refresh the trades list
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
}

.ticker-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
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

.trade-notes {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #3498db;
}

.trade-notes p {
  margin: 0;
  color: #5a6c7d;
  font-size: 0.9rem;
  font-style: italic;
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
}
</style>

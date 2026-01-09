<template>
  <div class="trade-grid-container">
    <div class="trade-grid">
      <div class="grid-header">
        <div class="header-cell trade-num">#</div>
        <div class="header-cell ticker">Ticker</div>
        <div class="header-cell entry-date">Entry Date</div>
        <div class="header-cell exit-date">Exit Date</div>
        <div class="header-cell strategy">Strategy</div>
        <div class="header-cell stop">Stop</div>
        <div class="header-cell entry">Entry</div>
        <div class="header-cell exit">Exit</div>
        <div class="header-cell target">Target</div>
        <div class="header-cell shares">Shares</div>
        <div class="header-cell position">Position</div>
        <div class="header-cell risk">Risk (R)</div>
        <div class="header-cell pnl-pct">P&L %</div>
        <div class="header-cell pnl-dollar">P&L $</div>
        <div class="header-cell r-multiple">P&L R</div>
        <div class="header-cell win-loss">W/L</div>
        <div class="header-cell tax">Tax</div>
        <div class="header-cell margin">Margin</div>
        <div class="header-cell net-pnl">Net P&L</div>
        <div class="header-cell notes">Notes</div>
        <div class="header-cell actions">Actions</div>
      </div>

      <div class="grid-body">
        <slot name="quick-add"></slot>

        <div
          v-for="(trade, index) in trades"
          :key="trade.id"
          class="grid-row"
          :class="{
            'row-profit': currentPnL(trade) > 0,
            'row-loss': currentPnL(trade) < 0,
          }"
        >
          <div class="cell trade-num">
            <span class="cell-value">{{ index + 1 }}</span>
          </div>

          <div class="cell ticker">
            <input
              v-model="trade.ticker"
              @blur="updateTrade(trade)"
              @keyup.enter="$event.target.blur()"
              class="cell-input"
              type="text"
            />
          </div>

          <div class="cell entry-date">
            <input
              v-model="trade.entryTime"
              @blur="updateTrade(trade)"
              @keyup.enter="$event.target.blur()"
              class="cell-input"
              type="datetime-local"
            />
          </div>

          <div class="cell exit-date">
            <span class="cell-value">{{ formatDateTime(trade.exitTime) }}</span>
          </div>

          <div class="cell strategy">
            <input
              v-model="trade.strategy"
              @blur="updateTrade(trade)"
              @keyup.enter="$event.target.blur()"
              class="cell-input"
              type="text"
              placeholder="-"
            />
          </div>

          <div class="cell stop">
            <input
              v-model.number="trade.stopLoss"
              @blur="updateTrade(trade)"
              @keyup.enter="$event.target.blur()"
              class="cell-input number"
              type="number"
              step="0.01"
            />
          </div>

          <div class="cell entry">
            <input
              v-model.number="trade.entryPrice"
              @blur="updateTrade(trade)"
              @keyup.enter="$event.target.blur()"
              class="cell-input number"
              type="number"
              step="0.01"
            />
          </div>

          <div class="cell exit">
            <input
              :value="trade.exitPrice || ''"
              @input="trade.exitPrice = parseFloat($event.target.value) || null"
              class="cell-input number"
              type="number"
              step="0.01"
              placeholder="-"
            />
          </div>

          <div class="cell target">
            <input
              v-model.number="trade.target1"
              @blur="updateTrade(trade)"
              @keyup.enter="$event.target.blur()"
              class="cell-input number"
              type="number"
              step="0.01"
            />
          </div>

          <div class="cell shares">
            <input
              v-model.number="trade.quantity"
              @blur="updateTrade(trade)"
              @keyup.enter="$event.target.blur()"
              class="cell-input number"
              type="number"
              step="1"
            />
          </div>

          <div class="cell position">
            <span class="cell-value">
              ${{ positionSize(trade).toFixed(2) }}
            </span>
          </div>

          <div class="cell risk">
            <span class="cell-value"> {{ riskInR(trade).toFixed(2) }}R </span>
          </div>

          <div class="cell pnl-pct">
            <span
              class="cell-value"
              :class="{
                'text-green': currentPnLPercent(trade) > 0,
                'text-red': currentPnLPercent(trade) < 0,
              }"
            >
              {{ currentPnLPercent(trade) > 0 ? "+" : ""
              }}{{ currentPnLPercent(trade).toFixed(2) }}%
            </span>
          </div>

          <div class="cell pnl-dollar">
            <span
              class="cell-value font-semibold"
              :class="{
                'text-green': currentPnL(trade) > 0,
                'text-red': currentPnL(trade) < 0,
              }"
            >
              {{ currentPnL(trade) > 0 ? "+" : "" }}${{
                currentPnL(trade).toFixed(2)
              }}
            </span>
          </div>

          <div class="cell r-multiple">
            <span
              class="cell-value font-semibold"
              :class="{
                'text-green': currentRMultiple(trade) > 0,
                'text-red': currentRMultiple(trade) < 0,
              }"
            >
              {{ currentRMultiple(trade) > 0 ? "+" : ""
              }}{{ currentRMultiple(trade).toFixed(2) }}R
            </span>
          </div>

          <div class="cell win-loss">
            <span
              class="cell-value"
              :class="{
                'text-green': winLoss(trade) === 'Win',
                'text-red': winLoss(trade) === 'Loss',
              }"
            >
              {{ winLoss(trade) }}
            </span>
          </div>

          <div class="cell tax">
            <span class="cell-value"> ${{ taxAmount(trade).toFixed(2) }} </span>
          </div>

          <div class="cell margin">
            <span class="cell-value">
              ${{ marginInterest(trade).toFixed(2) }}
            </span>
          </div>

          <div class="cell net-pnl">
            <span
              class="cell-value font-semibold"
              :class="{
                'text-green': netPnL(trade) > 0,
                'text-red': netPnL(trade) < 0,
              }"
            >
              {{ netPnL(trade) > 0 ? "+" : "" }}${{ netPnL(trade).toFixed(2) }}
            </span>
          </div>

          <div class="cell notes">
            <input
              v-model="trade.notes"
              @blur="updateTrade(trade)"
              @keyup.enter="$event.target.blur()"
              class="cell-input"
              type="text"
              placeholder="Add notes..."
            />
          </div>

          <div class="cell actions">
            <div class="action-buttons">
              <button
                v-if="!trade.exitTime"
                @click="handleCloseTrade(trade)"
                class="action-btn close-text"
                type="button"
              >
                Close
              </button>
              <button
                @click="confirmDelete(trade)"
                class="action-btn delete"
                title="Delete Trade"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
            Are you sure you want to delete this trade for
            <strong>{{ tradeToDelete?.ticker }}</strong
            >?
          </p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn-cancel">Cancel</button>
          <button @click="executeDelete" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useUIStore } from "../stores/ui";
import { useSettingsStore } from "../stores/settings";
import apiService from "../services/api";
import {
  calculateProfitLoss,
  calculateProfitLossPercent,
  calculateRMultiple,
  calculateTaxAmount,
  calculateMarginInterest,
  calculateNetProfit,
  calculateDaysHeld,
  dollarsToR,
  determineWinLoss,
} from "../../../shared/tradeCalculations";

const props = defineProps({
  trades: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits([
  "trade-updated",
  "trade-deleted",
  "expand-trade",
  "close-trade",
]);

const uiStore = useUIStore();
const settingsStore = useSettingsStore();
const showDeleteConfirmation = ref(false);
const tradeToDelete = ref(null);

const currentPnL = computed(() => (trade) => {
  const priceToUse = trade.exitPrice || trade.currentPrice;
  if (!priceToUse) return 0;
  return calculateProfitLoss(
    trade.type,
    trade.entryPrice,
    priceToUse,
    trade.quantity
  );
});

const currentRMultiple = computed(() => (trade) => {
  return calculateRMultiple(currentPnL.value(trade), trade.riskAmount);
});

const currentPnLPercent = computed(() => (trade) => {
  if (!trade?.currentPrice || !trade?.entryPrice || !trade?.quantity) return 0;
  return calculateProfitLossPercent(
    currentPnL.value(trade),
    trade.entryPrice,
    trade.quantity
  );
});

const positionSize = computed(() => (trade) => {
  return (trade.entryPrice || 0) * (trade.quantity || 0);
});

const riskInR = computed(() => (trade) => {
  return dollarsToR(
    trade.riskAmount || 0,
    settingsStore.riskSettings.defaultRSize
  );
});

const winLoss = computed(() => (trade) => {
  const pnl = currentPnL.value(trade);
  if (!trade.exitPrice && pnl === 0) return "-";
  return determineWinLoss(pnl);
});

const taxAmount = computed(() => (trade) => {
  if (!trade.exitPrice) return 0;
  const pnl = currentPnL.value(trade);
  return calculateTaxAmount(
    pnl,
    trade.stateTaxRate || settingsStore.riskSettings.stateTaxRate || 0,
    trade.federalTaxRate || settingsStore.riskSettings.federalTaxRate || 0
  );
});

const marginInterest = computed(() => (trade) => {
  if (!trade.exitPrice) return 0;
  const daysHeld = calculateDaysHeld(
    trade.entryTime,
    trade.exitTime || new Date()
  );
  return calculateMarginInterest(
    positionSize.value(trade),
    trade.marginInterestRate ||
      settingsStore.riskSettings.marginInterestRate ||
      0,
    daysHeld
  );
});

const netPnL = computed(() => (trade) => {
  if (!trade.exitPrice) return currentPnL.value(trade);
  return calculateNetProfit(
    currentPnL.value(trade),
    taxAmount.value(trade),
    marginInterest.value(trade)
  );
});

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const updateTrade = async (trade) => {
  try {
    const updateData = {
      symbol: trade.ticker,
      strategy: trade.strategy,
      entryPrice: trade.entryPrice,
      stopLoss: trade.stopLoss,
      targetPrice1: trade.target1,
      quantity: trade.quantity,
      notes: trade.notes,
      entryTime: trade.entryTime,
    };

    await apiService.updateTrade(trade.id, updateData);
    emit("trade-updated", trade);
    uiStore.showSuccessToast("Trade updated");
  } catch (error) {
    console.error("Error updating trade:", error);
    uiStore.showErrorToast("Failed to update trade");
  }
};

const handleCloseTrade = async (trade) => {
  console.log("Close button clicked!", trade);
  console.log("Exit price:", trade.exitPrice);
  console.log("Trade ID:", trade.id);

  if (!trade.exitPrice) {
    console.log("No exit price - showing error");
    uiStore.showErrorToast(
      "Please enter an exit price before closing the trade"
    );
    return;
  }

  try {
    console.log("Attempting to close trade...");
    const closeDate = new Date().toISOString();
    console.log("Close date:", closeDate);

    const result = await apiService.closeTrade(trade.id, trade.exitPrice, {
      closeDate: closeDate,
    });

    console.log("Close trade result:", result);

    // Emit trade-updated to trigger refresh in parent component
    emit("trade-updated", trade);
    uiStore.showSuccessToast("Trade closed successfully");

    // Force a page reload to see the updated trade list
    window.location.reload();
  } catch (error) {
    console.error("Error closing trade:", error);
    console.error("Error details:", error.response?.data);
    uiStore.showErrorToast("Failed to close trade");
  }
};

const confirmDelete = (trade) => {
  tradeToDelete.value = trade;
  showDeleteConfirmation.value = true;
};

const cancelDelete = () => {
  showDeleteConfirmation.value = false;
  tradeToDelete.value = null;
};

const executeDelete = async () => {
  if (!tradeToDelete.value) return;

  const trade = tradeToDelete.value;
  showDeleteConfirmation.value = false;
  tradeToDelete.value = null;

  try {
    await apiService.deleteTrade(trade.id);
    emit("trade-deleted", trade.id);
    uiStore.showSuccessToast("Trade deleted successfully");
  } catch (error) {
    console.error("Error deleting trade:", error);
    uiStore.showErrorToast("Failed to delete trade");
  }
};
</script>

<style scoped>
.trade-grid-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  overflow: hidden;
}

.trade-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
}

.grid-header {
  display: grid;
  grid-template-columns: 50px 90px 140px 140px 110px 90px 90px 90px 90px 80px 100px 90px 90px 100px 90px 70px 80px 80px 100px 150px 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 10;
  min-width: fit-content;
}

.header-cell {
  padding: 12px 8px;
  display: flex;
  align-items: center;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.header-cell:last-child {
  border-right: none;
}

.grid-body {
  display: flex;
  flex-direction: column;
  min-width: fit-content;
}

.grid-row {
  display: grid;
  grid-template-columns: 50px 90px 140px 140px 110px 90px 90px 90px 90px 80px 100px 90px 90px 100px 90px 70px 80px 80px 100px 150px 100px;
  border-bottom: 1px solid #e1e8ed;
  transition: background-color 0.15s ease;
  min-width: fit-content;
}

.grid-row:hover {
  background-color: #f8f9fa;
}

.grid-row.row-profit {
  border-left: 3px solid #27ae60;
}

.grid-row.row-loss {
  border-left: 3px solid #e74c3c;
}

.cell {
  padding: 8px;
  display: flex;
  align-items: center;
  border-right: 1px solid #f0f0f0;
  min-height: 44px;
}

.cell:last-child {
  border-right: none;
}

.cell-input,
.cell-select {
  width: 100%;
  border: 1px solid transparent;
  background: transparent;
  padding: 4px 6px;
  font-size: 0.875rem;
  border-radius: 4px;
  transition: all 0.15s ease;
  font-family: inherit;
}

.cell-input:hover,
.cell-select:hover {
  background: #f8f9fa;
  border-color: #e1e8ed;
}

.cell-input:focus,
.cell-select:focus {
  outline: none;
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.cell-input.number {
  text-align: right;
}

.cell-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2c3e50;
}

.font-semibold {
  font-weight: 600;
}

.text-green {
  color: #27ae60;
}

.text-red {
  color: #e74c3c;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 6px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #5a6c7d;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f0f0f0;
  color: #2c3e50;
}

.action-btn.close:hover {
  background: #d5f4e6;
  color: #27ae60;
}

.action-btn.delete:hover {
  background: #fadbd8;
  color: #e74c3c;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

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
  backdrop-filter: blur(4px);
}

.confirmation-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header h3 {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.modal-body p {
  margin: 0 0 12px 0;
  color: #5a6c7d;
  line-height: 1.5;
}

.warning-text {
  color: #e74c3c;
  font-weight: 600;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-delete {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel {
  background: #f0f0f0;
  color: #5a6c7d;
}

.btn-cancel:hover {
  background: #e1e8ed;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}

@media (max-width: 1600px) {
  .grid-header,
  .grid-row {
    grid-template-columns: 45px 85px 130px 130px 100px 85px 85px 85px 85px 75px 95px 85px 85px 95px 85px 65px 75px 75px 95px 140px 95px;
  }
}
</style>

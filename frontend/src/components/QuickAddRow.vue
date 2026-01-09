<template>
  <div class="quick-add-row" :class="{ 'is-active': isActive }">
    <div class="cell trade-num">
      <span class="cell-value placeholder">+</span>
    </div>

    <div class="cell ticker">
      <input
        ref="tickerInput"
        v-model="newTrade.ticker"
        @focus="isActive = true"
        @keyup.enter="moveToNext('strategy')"
        @keyup.esc="cancelAdd"
        class="cell-input"
        type="text"
        placeholder="Ticker..."
      />
    </div>

    <div class="cell entry-date">
      <span class="cell-value placeholder">Auto</span>
    </div>

    <div class="cell exit-date">
      <span class="cell-value placeholder">-</span>
    </div>

    <div class="cell strategy">
      <input
        ref="strategyInput"
        v-model="newTrade.strategy"
        @keyup.enter="moveToNext('stopLoss')"
        @keyup.esc="cancelAdd"
        class="cell-input"
        type="text"
        placeholder="Strategy..."
      />
    </div>

    <div class="cell stop">
      <input
        ref="stopLossInput"
        v-model.number="newTrade.stopLoss"
        @keyup.enter="moveToNext('entryPrice')"
        @keyup.esc="cancelAdd"
        class="cell-input number"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
    </div>

    <div class="cell entry">
      <input
        ref="entryPriceInput"
        v-model.number="newTrade.entryPrice"
        @keyup.enter="moveToNext('target')"
        @keyup.esc="cancelAdd"
        class="cell-input number"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
    </div>

    <div class="cell exit">
      <span class="cell-value placeholder">-</span>
    </div>

    <div class="cell target">
      <input
        ref="targetInput"
        v-model.number="newTrade.target"
        @keyup.enter="moveToNext('shares')"
        @keyup.esc="cancelAdd"
        class="cell-input number"
        type="number"
        step="0.01"
        :placeholder="calculatedTarget.toFixed(2)"
      />
    </div>

    <div class="cell shares">
      <input
        ref="sharesInput"
        v-model.number="newTrade.shares"
        @keyup.enter="moveToNext('notes')"
        @keyup.esc="cancelAdd"
        class="cell-input number"
        type="number"
        step="1"
        :placeholder="calculatedShares || '0'"
      />
    </div>

    <div class="cell position">
      <span class="cell-value">
        {{ isActive ? `$${positionValue.toFixed(2)}` : "-" }}
      </span>
    </div>

    <div class="cell risk">
      <span class="cell-value">
        {{ isActive ? `${totalRiskR.toFixed(2)}R` : "-" }}
      </span>
    </div>

    <div class="cell pnl-pct">
      <span class="cell-value placeholder">-</span>
    </div>

    <div class="cell pnl-dollar">
      <span class="cell-value placeholder">-</span>
    </div>

    <div class="cell r-multiple">
      <span class="cell-value placeholder">-</span>
    </div>

    <div class="cell win-loss">
      <span class="cell-value placeholder">-</span>
    </div>

    <div class="cell tax">
      <span class="cell-value placeholder">-</span>
    </div>

    <div class="cell margin">
      <span class="cell-value placeholder">-</span>
    </div>

    <div class="cell net-pnl">
      <span class="cell-value placeholder">-</span>
    </div>

    <div class="cell notes">
      <input
        ref="notesInput"
        v-model="newTrade.notes"
        @keyup.enter="submitTrade"
        @keyup.esc="cancelAdd"
        class="cell-input"
        type="text"
        placeholder="Notes..."
      />
    </div>

    <div class="cell actions">
      <div class="action-buttons">
        <button
          v-if="isActive"
          @click="submitTrade"
          class="action-btn add"
          title="Add Trade (Enter)"
          :disabled="!canSubmit"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
        <button
          v-if="isActive"
          @click="cancelAdd"
          class="action-btn cancel"
          title="Cancel (Esc)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <span v-if="!isActive" class="add-hint">Click to add trade...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useSettingsStore } from "../stores/settings";
import { useUIStore } from "../stores/ui";
import { useTradesStore } from "../stores/trades";
import {
  calculateRiskPerShare,
  calculatePositionSize,
  calculateTotalRisk,
} from "../../../shared/tradeCalculations";

const emit = defineEmits(["trade-added"]);

const settingsStore = useSettingsStore();
const uiStore = useUIStore();
const tradesStore = useTradesStore();

const isActive = ref(false);
const tickerInput = ref(null);
const strategyInput = ref(null);
const stopLossInput = ref(null);
const entryPriceInput = ref(null);
const targetInput = ref(null);
const sharesInput = ref(null);
const notesInput = ref(null);

const newTrade = ref({
  ticker: "",
  type: "long",
  strategy: "",
  entryPrice: null,
  stopLoss: null,
  target: null,
  shares: null,
  notes: "",
  rSize: settingsStore.riskSettings.defaultRSize,
});

const riskPerShare = computed(() => {
  if (!newTrade.value.entryPrice || !newTrade.value.stopLoss) return 0;
  return calculateRiskPerShare(
    newTrade.value.entryPrice,
    newTrade.value.stopLoss
  );
});

const calculatedShares = computed(() => {
  if (riskPerShare.value === 0) return 0;
  const rDollars =
    newTrade.value.rSize || settingsStore.riskSettings.defaultRSize;
  return calculatePositionSize(rDollars, riskPerShare.value);
});

const totalRisk = computed(() => {
  const shares = newTrade.value.shares || calculatedShares.value;
  return calculateTotalRisk(riskPerShare.value, shares);
});

const totalRiskR = computed(() => {
  const rSize = newTrade.value.rSize || settingsStore.riskSettings.defaultRSize;
  return totalRisk.value / rSize;
});

const positionValue = computed(() => {
  const shares = newTrade.value.shares || calculatedShares.value;
  return (newTrade.value.entryPrice || 0) * shares;
});

const calculatedTarget = computed(() => {
  if (!newTrade.value.entryPrice || !riskPerShare.value) return 0;
  if (newTrade.value.type === "long") {
    return newTrade.value.entryPrice + riskPerShare.value;
  } else {
    return newTrade.value.entryPrice - riskPerShare.value;
  }
});

const canSubmit = computed(() => {
  return (
    newTrade.value.ticker &&
    newTrade.value.entryPrice > 0 &&
    newTrade.value.stopLoss > 0 &&
    (newTrade.value.shares > 0 || calculatedShares.value > 0)
  );
});

watch(calculatedShares, (newVal) => {
  if (newVal > 0 && !newTrade.value.shares) {
    newTrade.value.shares = newVal;
  }
});

watch(calculatedTarget, (newVal) => {
  if (newVal > 0 && !newTrade.value.target) {
    newTrade.value.target = newVal;
  }
});

const moveToNext = (nextField) => {
  const refs = {
    strategy: strategyInput,
    stopLoss: stopLossInput,
    entryPrice: entryPriceInput,
    target: targetInput,
    shares: sharesInput,
    notes: notesInput,
  };

  if (refs[nextField]?.value) {
    refs[nextField].value.focus();
  }
};

const validateTrade = () => {
  if (newTrade.value.type === "long") {
    if (newTrade.value.stopLoss >= newTrade.value.entryPrice) {
      uiStore.showErrorToast("For long trades, stop loss must be below entry");
      return false;
    }
  } else {
    if (newTrade.value.stopLoss <= newTrade.value.entryPrice) {
      uiStore.showErrorToast("For short trades, stop loss must be above entry");
      return false;
    }
  }
  return true;
};

const submitTrade = async () => {
  if (!canSubmit.value) return;
  if (!validateTrade()) return;

  try {
    const shares = newTrade.value.shares || calculatedShares.value;
    const riskAmount =
      Math.abs(newTrade.value.entryPrice - newTrade.value.stopLoss) * shares;

    const tradeData = {
      symbol: newTrade.value.ticker.toUpperCase(),
      strategy: newTrade.value.strategy || null,
      type: newTrade.value.type.toUpperCase(),
      quantity: shares,
      entryPrice: parseFloat(newTrade.value.entryPrice),
      stopLoss: parseFloat(newTrade.value.stopLoss),
      targetPrice1: newTrade.value.target || null,
      positionSize: parseFloat(newTrade.value.entryPrice) * shares,
      notes: newTrade.value.notes || null,
      riskAmount: riskAmount,
      rSize: settingsStore.riskSettings.defaultRSize,
      tradingMode: settingsStore.tradingMode,
    };

    await tradesStore.addTrade(tradeData);
    await tradesStore.fetchOpenTrades();

    emit("trade-added");
    uiStore.showSuccessToast("Trade added successfully");

    resetForm();
  } catch (error) {
    console.error("Error adding trade:", error);
    uiStore.showErrorToast("Failed to add trade");
  }
};

const cancelAdd = () => {
  resetForm();
  isActive.value = false;
};

const resetForm = () => {
  newTrade.value = {
    ticker: "",
    type: "long",
    strategy: "",
    entryPrice: null,
    stopLoss: null,
    target: null,
    shares: null,
    notes: "",
    rSize: settingsStore.riskSettings.defaultRSize,
  };
};
</script>

<style scoped>
.quick-add-row {
  display: grid;
  grid-template-columns: 50px 90px 140px 140px 110px 90px 90px 90px 90px 80px 100px 90px 90px 100px 90px 70px 80px 80px 100px 150px 100px;
  border-bottom: 2px dashed #e1e8ed;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.quick-add-row.is-active {
  background: #fff9e6;
  border-bottom: 2px solid #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
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
  background: white;
  padding: 4px 6px;
  font-size: 0.875rem;
  border-radius: 4px;
  transition: all 0.15s ease;
  font-family: inherit;
}

.cell-input::placeholder {
  color: #a0aec0;
  font-style: italic;
}

.cell-input:hover,
.cell-select:hover {
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

.cell-value.placeholder {
  color: #a0aec0;
}

.action-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
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

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn:not(:disabled):hover {
  background: #f0f0f0;
  color: #2c3e50;
}

.action-btn.add:not(:disabled):hover {
  background: #d5f4e6;
  color: #27ae60;
}

.action-btn.cancel:hover {
  background: #fadbd8;
  color: #e74c3c;
}

.add-hint {
  font-size: 0.75rem;
  color: #a0aec0;
  font-style: italic;
  white-space: nowrap;
}

@media (max-width: 1600px) {
  .quick-add-row {
    grid-template-columns: 45px 85px 130px 130px 100px 85px 85px 85px 85px 75px 95px 85px 85px 95px 85px 65px 75px 75px 95px 140px 95px;
  }
}
</style>

<template>
  <div class="trade-form">
    <h2>Trade Entry</h2>
    <form @submit.prevent="submitTrade">
      <div class="form-row">
        <div class="form-group">
          <label for="rSize">R Size ($)</label>
          <input
            id="rSize"
            v-model.number="trade.rSize"
            type="number"
            step="1"
            min="1"
            placeholder="Enter R size"
            required
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="ticker">Ticker Symbol</label>
          <input
            id="ticker"
            v-model="trade.ticker"
            type="text"
            placeholder="AAPL"
            required
            @input="trade.ticker = trade.ticker.toUpperCase()"
          />
        </div>
        <div class="form-group">
          <label for="strategy">Strategy</label>
          <div
            class="custom-select"
            @click="toggleStrategyDropdown"
            v-click-outside="closeStrategyDropdown"
          >
            <div class="select-trigger">
              <span :class="{ placeholder: !trade.strategy }">
                {{ trade.strategy || "" }}
              </span>
              <svg
                class="dropdown-arrow"
                :class="{ open: strategyDropdownOpen }"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 4L6 8L10 4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="select-options" v-if="strategyDropdownOpen">
              <div
                class="select-option"
                :class="{ selected: trade.strategy === null }"
                @click="selectStrategy(null)"
              >
                <span class="option-text placeholder"
                  >Select a strategy...</span
                >
              </div>
              <div
                v-for="strategy in strategyOptions"
                :key="strategy"
                class="select-option"
                :class="{ selected: trade.strategy === strategy }"
                @click="selectStrategy(strategy)"
              >
                <span class="option-text">{{ strategy }}</span>
                <svg
                  v-if="trade.strategy === strategy"
                  class="check-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8L6 11L13 4"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="entryPrice">Entry Price ($)</label>
        <input
          id="entryPrice"
          v-model.number="trade.entryPrice"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="150.00"
          required
        />
      </div>

      <div class="form-group">
        <label for="stopLoss">Stop Loss ($)</label>
        <input
          id="stopLoss"
          v-model.number="trade.stopLoss"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="145.00"
          required
        />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="shares">Position Size (Shares)</label>
          <div class="calculated-shares">
            <input
              id="shares"
              v-model.number="trade.shares"
              type="number"
              step="1"
              min="1"
              placeholder="Auto-calculated"
              readonly
            />
            <small class="calculation-info">
              {{ sharesCalculationInfo }}
            </small>
            <small class="position-value">
              Position Value: ${{ positionValue.toFixed(2) }}
            </small>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label for="target1">Target 1 (+1R)</label>
        <input
          id="target1"
          v-model.number="trade.target1"
          type="number"
          step="0.01"
          min="0.01"
          :placeholder="calculatedTarget1.toFixed(2)"
          readonly
        />
      </div>

      <div class="form-group">
        <label for="target2">Target 2 (+2R)</label>
        <input
          id="target2"
          v-model.number="trade.target2"
          type="number"
          step="0.01"
          min="0.01"
          :placeholder="calculatedTarget2.toFixed(2)"
          readonly
        />
      </div>

      <div class="form-group">
        <label for="target3">Target 3</label>
        <input
          id="target3"
          v-model.number="trade.target3"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Enter custom target"
        />
      </div>

      <div class="form-group">
        <label for="tradeType">Trade Type</label>
        <select id="tradeType" v-model="trade.type" required>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
      </div>

      <div class="section-divider"></div>

      <div class="form-group">
        <label for="notes">Notes</label>
        <textarea
          id="notes"
          v-model="trade.notes"
          rows="3"
          placeholder="Trade setup reasoning..."
        ></textarea>
      </div>

      <div class="section-divider"></div>

      <div class="form-row">
        <div class="form-group">
          <label for="stateTaxRate">State Tax Rate (%)</label>
          <input
            id="stateTaxRate"
            v-model.number="trade.stateTaxRate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="0"
            disabled
            readonly
          />
        </div>
        <div class="form-group">
          <label for="federalTaxRate">Federal Tax Rate (%)</label>
          <input
            id="federalTaxRate"
            v-model.number="trade.federalTaxRate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="0"
            disabled
            readonly
          />
        </div>
      </div>

      <div class="form-group">
        <label for="marginInterestRate">Margin Interest Rate (% APR)</label>
        <input
          id="marginInterestRate"
          v-model.number="trade.marginInterestRate"
          type="number"
          step="0.01"
          min="0"
          max="100"
          placeholder="0"
          disabled
          readonly
        />
      </div>

      <div
        class="section-divider"
        v-if="trade.entryPrice && trade.stopLoss"
      ></div>

      <div class="trade-summary" v-if="trade.entryPrice && trade.stopLoss">
        <h3>Trade Risk</h3>
        <div class="risk-list">
          <div class="risk-item">
            <span class="bullet">•</span>
            <span class="risk-text">
              <strong>Risk per Share:</strong> ${{ riskPerShare.toFixed(2) }}
            </span>
          </div>
          <div class="risk-item">
            <span class="bullet">•</span>
            <span class="risk-text">
              <strong>Total Risk:</strong> ${{ totalRisk.toFixed(0) }}
              <span class="risk-warning" v-if="dailyRiskPercentage > 0">
                ({{ dailyRiskWarningIcon }}
                {{ dailyRiskPercentage.toFixed(0) }}% of daily limit)
              </span>
            </span>
          </div>
          <div class="risk-item">
            <span class="bullet">•</span>
            <span class="risk-text">
              <strong>Remaining Daily Risk After Trade:</strong> ${{
                remainingDailyRiskAfterTrade.toFixed(0)
              }}
            </span>
          </div>
        </div>
      </div>

      <div class="section-divider submit-divider"></div>

      <button type="submit" class="submit-btn">Add Trade</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const emit = defineEmits(["trade-added"]);

const strategyDropdownOpen = ref(false);

const toggleStrategyDropdown = () => {
  strategyDropdownOpen.value = !strategyDropdownOpen.value;
};

const closeStrategyDropdown = () => {
  strategyDropdownOpen.value = false;
};

const selectStrategy = (strategy) => {
  trade.value.strategy = strategy;
  strategyDropdownOpen.value = false;
};

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

const props = defineProps({
  showRValues: {
    type: Boolean,
    default: false,
  },
  defaultRSize: {
    type: Number,
    default: 2500,
  },
  stateTaxRate: {
    type: Number,
    default: 0,
  },
  federalTaxRate: {
    type: Number,
    default: 0,
  },
  marginInterestRate: {
    type: Number,
    default: 0,
  },
  tradingMode: {
    type: String,
    default: "SWING",
  },
  maxDailyLoss: {
    type: Number,
    default: 500,
  },
  dailyRiskUsed: {
    type: Number,
    default: 0,
  },
});

const trade = ref({
  ticker: "",
  strategy: null,
  shares: 0,
  entryPrice: "",
  stopLoss: "",
  target1: "",
  target2: "",
  target3: "",
  type: "long",
  notes: "",
  stateTaxRate: props.stateTaxRate,
  federalTaxRate: props.federalTaxRate,
  marginInterestRate: props.marginInterestRate,
  rSize: props.defaultRSize,
});

const strategyOptions = computed(() => {
  if (props.tradingMode === "DAY") {
    return [
      "Breakout",
      "Pullback",
      "Reversal",
      "Gap & Go",
      "VWAP Bounce",
      "Opening Range Breakout",
      "Momentum",
      "Scalp",
      "Failed Breakout",
      "Support/Resistance",
    ];
  } else {
    // SWING mode
    return [
      "Breakout",
      "Pullback",
      "Trend Following",
      "Reversal",
      "Support/Resistance",
      "Moving Average Bounce",
      "Chart Pattern",
      "Earnings Play",
      "News Catalyst",
      "Sector Rotation",
    ];
  }
});

const rValueDollars = computed(() => {
  return trade.value.rSize || props.defaultRSize; // Use trade's rSize with fallback to default
});

const riskPerShare = computed(() => {
  if (!trade.value.entryPrice || !trade.value.stopLoss) return 0;
  return Math.abs(trade.value.entryPrice - trade.value.stopLoss);
});

const calculatedShares = computed(() => {
  if (riskPerShare.value === 0) return 0;
  const rDollars = trade.value.rSize || props.defaultRSize;
  return Math.floor(rDollars / riskPerShare.value);
});

const sharesCalculationInfo = computed(() => {
  if (riskPerShare.value === 0) {
    return "";
  }
  const rDollars = trade.value.rSize || props.defaultRSize;
  return `${rDollars.toFixed(2)} ÷ ${riskPerShare.value.toFixed(2)} = ${
    calculatedShares.value
  } shares`;
});

const totalRisk = computed(() => {
  return riskPerShare.value * calculatedShares.value;
});

const totalRiskR = computed(() => {
  const rSize = trade.value.rSize || props.defaultRSize;
  return totalRisk.value / rSize;
});

const positionValue = computed(() => {
  if (!trade.value.entryPrice || calculatedShares.value === 0) return 0;
  return calculatedShares.value * trade.value.entryPrice;
});

const calculatedTarget1 = computed(() => {
  if (!trade.value.entryPrice || riskPerShare.value === 0) return 0;
  const target = trade.value.entryPrice + riskPerShare.value;
  return Math.round(target * 100) / 100; // Round to nearest cent
});

const calculatedTarget2 = computed(() => {
  if (!trade.value.entryPrice || riskPerShare.value === 0) return 0;
  const target = trade.value.entryPrice + 2 * riskPerShare.value;
  return Math.round(target * 100) / 100; // Round to nearest cent
});

const rMultipleTarget1 = computed(() => {
  if (!trade.value.entryPrice || !trade.value.target1 || !riskPerShare.value)
    return 0;
  const profit = Math.abs(trade.value.target1 - trade.value.entryPrice);
  return profit / riskPerShare.value;
});

const rMultipleTarget2 = computed(() => {
  if (!trade.value.entryPrice || !trade.value.target2 || !riskPerShare.value)
    return 0;
  const profit = Math.abs(trade.value.target2 - trade.value.entryPrice);
  return profit / riskPerShare.value;
});

const dailyRiskPercentage = computed(() => {
  if (!props.maxDailyLoss || props.maxDailyLoss === 0) return 0;
  return (totalRisk.value / props.maxDailyLoss) * 100;
});

const dailyRiskWarningIcon = computed(() => {
  const percentage = dailyRiskPercentage.value;
  if (percentage >= 80) return "🔴";
  if (percentage >= 50) return "⚠️";
  return "✅";
});

const remainingDailyRiskAfterTrade = computed(() => {
  const remaining =
    props.maxDailyLoss - (props.dailyRiskUsed + totalRisk.value);
  return Math.max(0, remaining);
});

// Auto-update targets when calculation changes
watch([calculatedTarget1], () => {
  if (calculatedTarget1.value > 0) {
    trade.value.target1 = calculatedTarget1.value;
  }
});

watch([calculatedTarget2], () => {
  if (calculatedTarget2.value > 0) {
    trade.value.target2 = calculatedTarget2.value;
  }
});

// Auto-update shares when calculation changes
watch([calculatedShares], () => {
  if (calculatedShares.value > 0) {
    trade.value.shares = calculatedShares.value;
  }
});

// Watch for changes in defaultRSize prop and update rSize if it hasn't been modified by user
const userModifiedRSize = ref(false);

watch(
  () => props.defaultRSize,
  (newVal) => {
    if (!userModifiedRSize.value) {
      trade.value.rSize = newVal;
    }
  }
);

// Track if user modifies the rSize
watch(
  () => trade.value.rSize,
  (newVal, oldVal) => {
    if (oldVal !== undefined && newVal !== oldVal) {
      userModifiedRSize.value = true;
    }
  }
);

// Watch for changes in tax and margin rates from props
watch(
  () => props.stateTaxRate,
  (newVal) => {
    trade.value.stateTaxRate = newVal;
  }
);

watch(
  () => props.federalTaxRate,
  (newVal) => {
    trade.value.federalTaxRate = newVal;
  }
);

watch(
  () => props.marginInterestRate,
  (newVal) => {
    trade.value.marginInterestRate = newVal;
  }
);

const validateTrade = () => {
  if (trade.value.type === "long") {
    if (trade.value.stopLoss >= trade.value.entryPrice) {
      alert("For long trades, stop loss must be below entry price");
      return false;
    }
    if (trade.value.target1 && trade.value.target1 <= trade.value.entryPrice) {
      alert("For long trades, targets must be above entry price");
      return false;
    }
  } else {
    if (trade.value.stopLoss <= trade.value.entryPrice) {
      alert("For short trades, stop loss must be above entry price");
      return false;
    }
    if (trade.value.target1 && trade.value.target1 >= trade.value.entryPrice) {
      alert("For short trades, targets must be below entry price");
      return false;
    }
  }
  return true;
};

const submitTrade = () => {
  if (!validateTrade()) return;

  const newTrade = {
    ...trade.value,
    riskAmount: totalRisk.value,
    riskPerShare: riskPerShare.value,
    rMultipleTarget1: rMultipleTarget1.value,
    rMultipleTarget2: rMultipleTarget2.value,
    calculatedShares: calculatedShares.value,
  };

  emit("trade-added", newTrade);

  // Reset form
  trade.value = {
    ticker: "",
    strategy: null,
    shares: 0,
    entryPrice: "",
    stopLoss: "",
    target1: "",
    target2: "",
    target3: "",
    type: "long",
    notes: "",
    stateTaxRate: props.stateTaxRate,
    federalTaxRate: props.federalTaxRate,
    marginInterestRate: props.marginInterestRate,
    rSize: props.defaultRSize,
  };
};
</script>

<style scoped>
.trade-form {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  backdrop-filter: blur(10px);
}

.trade-form h2 {
  margin: 0 0 24px 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.trade-form h2::before {
  content: "📈";
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 18px;
}

.section-divider {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(226, 232, 240, 0.8) 20%,
    rgba(226, 232, 240, 0.8) 80%,
    transparent
  );
  margin: 24px 0;
  position: relative;
}

.section-divider::after {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(148, 163, 184, 0.2),
    transparent
  );
}

.submit-divider {
  margin: 28px 0 20px 0;
  background: linear-gradient(
    to right,
    transparent,
    rgba(59, 130, 246, 0.15) 20%,
    rgba(59, 130, 246, 0.15) 80%,
    transparent
  );
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 6px;
  color: #475569;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

input[type="number"],
input[type="text"] {
  width: 100%;
  padding: 11px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: #ffffff;
  color: #1e293b;
}

input[type="number"]:focus,
input[type="text"]:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

input[type="number"]:hover,
input[type="text"]:hover {
  border-color: #cbd5e1;
}

input[readonly] {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-color: #e2e8f0;
  color: #64748b;
  cursor: not-allowed;
}

input[readonly]:hover {
  border-color: #e2e8f0;
  transform: none;
}

input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

select {
  width: 100%;
  padding: 11px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  background: #ffffff;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
}

select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Custom Select Dropdown */
.custom-select {
  position: relative;
  width: 100%;
}

.select-trigger {
  width: 100%;
  padding: 11px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  background: #ffffff;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-sizing: border-box;
}

.select-trigger:hover {
  border-color: #cbd5e1;
}

.select-trigger .placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.dropdown-arrow {
  color: #64748b;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.select-options {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 100%;
  width: max-content;
  background: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  max-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.select-option {
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.select-option:hover {
  background: #f8fafc;
}

.select-option.selected {
  background: #eff6ff;
  color: #3b82f6;
}

.select-option.selected:hover {
  background: #dbeafe;
}

.option-text {
  font-size: 0.9rem;
  font-weight: 500;
  flex: 1;
}

.option-text.placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.check-icon {
  color: #3b82f6;
  flex-shrink: 0;
}

/* Scrollbar styling for dropdown */
.select-options::-webkit-scrollbar {
  width: 6px;
}

.select-options::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 8px;
}

.select-options::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 8px;
}

.select-options::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

textarea {
  width: 100%;
  padding: 11px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 70px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: #ffffff;
  color: #1e293b;
}

textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.calculated-shares {
  display: flex;
  flex-direction: column;
}

.calculation-info {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.3;
}

.position-value {
  margin-top: 3px;
  color: #3b82f6;
  font-size: 0.75rem;
  font-weight: 600;
}

.input-with-r {
  display: flex;
  flex-direction: column;
}

.r-equivalent {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.8rem;
  margin-top: 3px;
}

.auto-calc {
  color: #10b981;
  font-size: 0.7rem;
  font-weight: 500;
  margin-top: 3px;
}

small {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 3px;
  display: block;
}

.trade-summary {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 18px;
  margin: 0 0 20px 0;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.trade-summary h3 {
  margin: 0 0 14px 0;
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.risk-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.5;
}

.bullet {
  color: #3b82f6;
  font-size: 1.2rem;
  line-height: 1.3;
  flex-shrink: 0;
}

.risk-text {
  color: #475569;
  font-size: 0.875rem;
  flex: 1;
}

.risk-text strong {
  color: #1e293b;
  font-weight: 600;
}

.risk-warning {
  color: #64748b;
  font-size: 0.8rem;
  margin-left: 4px;
}

.targets-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.targets-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
  transition: all 0.2s ease;
}

.targets-header:hover {
  opacity: 0.7;
}

.targets-header h4 {
  margin: 0;
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toggle-icon {
  color: #64748b;
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.targets-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.target-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.5;
}

.target-text {
  color: #475569;
  font-size: 0.875rem;
  flex: 1;
}

.target-text strong {
  color: #1e293b;
  font-weight: 600;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.025em;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn::before {
  content: "➕";
  font-size: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .form-row .form-group {
    margin-bottom: 16px;
  }

  .trade-form {
    padding: 16px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

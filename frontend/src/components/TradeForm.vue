<template>
  <div class="trade-form">
    <h2>New Trade Setup</h2>
    <form @submit.prevent="submitTrade">
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
        <label for="target3">Target 3 (Optional)</label>
        <input
          id="target3"
          v-model.number="trade.target3"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Enter custom target"
        />
        <small>Optional custom target level</small>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="taxRate">Tax Rate (%)</label>
          <input
            id="taxRate"
            v-model.number="trade.taxRate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="25"
          />
          <small>Estimated tax rate for post-tax calculations</small>
        </div>
      </div>

      <div class="form-group">
        <label for="tradeType">Trade Type</label>
        <select id="tradeType" v-model="trade.type" required>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
      </div>

      <div class="form-group">
        <label for="notes">Notes</label>
        <textarea
          id="notes"
          v-model="trade.notes"
          rows="3"
          placeholder="Trade setup reasoning..."
        ></textarea>
      </div>

      <div class="trade-summary" v-if="trade.entryPrice && trade.stopLoss">
        <h3>Trade Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">Risk per Share:</span>
            <span class="value">${{ riskPerShare.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span class="label"
              >{{ showRValues ? "Total Risk" : "Total Risk" }}:</span
            >
            <span class="value">
              <template v-if="showRValues">
                {{ totalRiskR.toFixed(2) }}R
                <small>(${{ totalRisk.toFixed(2) }})</small>
              </template>
              <template v-else> ${{ totalRisk.toFixed(2) }} </template>
            </span>
          </div>
          <div class="summary-item">
            <span class="label">Target 1 (+1R):</span>
            <span class="value">${{ calculatedTarget1.toFixed(2) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Target 2 (+2R):</span>
            <span class="value">${{ calculatedTarget2.toFixed(2) }}</span>
          </div>
          <div class="summary-item" v-if="postTaxGain2R.afterTax > 0">
            <span class="label">Post-Tax Gain @ +2R:</span>
            <span class="value">
              {{
                showRValues
                  ? postTaxGain2R.afterTaxR.toFixed(2) + "R"
                  : "$" + postTaxGain2R.afterTax.toFixed(2)
              }}
              <small>(Tax: ${{ postTaxGain2R.tax.toFixed(2) }})</small>
            </span>
          </div>
        </div>
      </div>

      <button type="submit" class="submit-btn">Add Trade</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const emit = defineEmits(["trade-added"]);

const props = defineProps({
  showRValues: {
    type: Boolean,
    default: false,
  },
  defaultRSize: {
    type: Number,
    default: 2500,
  },
});

const trade = ref({
  ticker: "",
  shares: 0,
  entryPrice: "",
  stopLoss: "",
  target1: "",
  target2: "",
  target3: "",
  type: "long",
  notes: "",
  taxRate: 25,
});

const rValueDollars = computed(() => {
  return props.defaultRSize; // Always 1R in dollars
});

const riskPerShare = computed(() => {
  if (!trade.value.entryPrice || !trade.value.stopLoss) return 0;
  return Math.abs(trade.value.entryPrice - trade.value.stopLoss);
});

const calculatedShares = computed(() => {
  if (riskPerShare.value === 0) return 0;
  const rDollars = props.defaultRSize; // Always use 1R
  return Math.floor(rDollars / riskPerShare.value);
});

const sharesCalculationInfo = computed(() => {
  if (riskPerShare.value === 0) {
    return "Enter entry and stop prices";
  }
  const rDollars = props.defaultRSize; // Always use 1R
  return `${rDollars.toFixed(2)} ÷ ${riskPerShare.value.toFixed(2)} = ${
    calculatedShares.value
  } shares`;
});

const totalRisk = computed(() => {
  return riskPerShare.value * calculatedShares.value;
});

const totalRiskR = computed(() => {
  return totalRisk.value / props.defaultRSize;
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

const postTaxGain2R = computed(() => {
  if (
    !trade.value.entryPrice ||
    !calculatedTarget2.value ||
    riskPerShare.value === 0
  )
    return 0;

  const profitPerShare = Math.abs(
    calculatedTarget2.value - trade.value.entryPrice
  );
  const totalProfit = profitPerShare * calculatedShares.value;
  const taxRate = (trade.value.taxRate || 25) / 100;
  const afterTax = totalProfit * (1 - taxRate);

  return {
    preTax: totalProfit,
    tax: totalProfit * taxRate,
    afterTax: afterTax,
    afterTaxR: afterTax / props.defaultRSize,
  };
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
    shares: 0,
    entryPrice: "",
    stopLoss: "",
    target1: "",
    target2: "",
    target3: "",
    type: "long",
    notes: "",
    taxRate: 25,
  };
};
</script>

<style scoped>
.trade-form {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  backdrop-filter: blur(10px);
}

.trade-form h2 {
  margin: 0 0 20px 0;
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
  margin-bottom: 16px;
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
  padding: 10px 12px;
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
  padding: 10px 12px;
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

textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
  transition: all 0.2s ease;
  box-sizing: border-box;
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
  padding: 16px;
  margin: 20px 0;
  border: 1px solid #e2e8f0;
}

.trade-summary h3 {
  margin: 0 0 12px 0;
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.trade-summary h3::before {
  content: "📊";
  font-size: 0.875rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item .label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
  margin: 0;
}

.summary-item .value {
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.summary-item .value small {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  margin: 0;
}

.summary-item .value.positive {
  color: #10b981;
}

.summary-item .value.negative {
  color: #ef4444;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

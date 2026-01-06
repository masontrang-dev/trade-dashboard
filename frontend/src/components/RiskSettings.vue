<template>
  <div class="risk-settings">
    <h2>Risk Management Settings</h2>
    <form @submit.prevent="updateSettings">
      <div class="form-group">
        <label for="maxDailyLoss">
          {{ showRValues ? "Max Daily Loss" : "Max Daily Loss ($)" }}
        </label>
        <div class="input-with-r">
          <input
            id="maxDailyLoss"
            v-model.number="settings.maxDailyLoss"
            type="number"
            step="10"
            min="0"
            required
          />
          <span v-if="showRValues" class="r-equivalent">
            ({{ maxDailyLossR.toFixed(2) }}R)
          </span>
        </div>
        <small>Maximum amount you're willing to lose in a single day</small>
      </div>

      <div class="form-group">
        <label for="maxOpenRisk">
          {{ showRValues ? "Max Open Risk" : "Max Open Risk ($)" }}
        </label>
        <div class="input-with-r">
          <input
            id="maxOpenRisk"
            v-model.number="settings.maxOpenRisk"
            type="number"
            step="50"
            min="0"
            required
          />
          <span v-if="showRValues" class="r-equivalent">
            ({{ maxOpenRiskR.toFixed(2) }}R)
          </span>
        </div>
        <small>Total risk across all open positions</small>
      </div>

      <div class="form-group">
        <label for="maxPositions">Max Open Positions</label>
        <input
          id="maxPositions"
          v-model.number="settings.maxPositions"
          type="number"
          step="1"
          min="1"
          max="20"
          required
        />
        <small>Maximum number of trades to have open simultaneously</small>
      </div>

      <div class="form-group">
        <label for="defaultRSize">
          {{ showRValues ? "Default R Size ($)" : "Default R Size ($)" }}
        </label>
        <input
          id="defaultRSize"
          v-model.number="settings.defaultRSize"
          type="number"
          step="10"
          min="10"
          required
        />
        <small
          >Default risk amount for new trades (1R = ${{
            settings.defaultRSize
          }})</small
        >
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="settings.enableAlerts" />
          Enable Risk Alerts
        </label>
        <small>Show warnings when approaching risk limits</small>
      </div>

      <button type="submit" class="save-btn">Save Settings</button>
    </form>

    <div class="risk-tips" v-if="settings.enableAlerts">
      <h3>Risk Management Tips</h3>
      <ul>
        <li>
          Never risk more than 1-2% of your trading account on a single trade
        </li>
        <li>Keep total open risk under 20% of your account</li>
        <li>Set stop losses before entering trades</li>
        <li>Take partial profits at predetermined levels</li>
        <li>Review your trades regularly to identify patterns</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  maxDailyLoss: {
    type: Number,
    default: 500,
  },
  maxOpenRisk: {
    type: Number,
    default: 2000,
  },
  defaultRSize: {
    type: Number,
    default: 2500,
  },
  showRValues: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["settings-updated"]);

const settings = ref({
  maxDailyLoss: props.maxDailyLoss,
  maxOpenRisk: props.maxOpenRisk,
  maxPositions: 5,
  defaultRSize: props.defaultRSize,
  enableAlerts: true,
});

// Watch for prop changes
watch(
  () => props.maxDailyLoss,
  (newValue) => {
    settings.value.maxDailyLoss = newValue;
  }
);

watch(
  () => props.maxOpenRisk,
  (newValue) => {
    settings.value.maxOpenRisk = newValue;
  }
);

watch(
  () => props.defaultRSize,
  (newValue) => {
    settings.value.defaultRSize = newValue;
  }
);

const updateSettings = () => {
  // Save to localStorage for persistence
  localStorage.setItem("riskSettings", JSON.stringify(settings.value));

  emit("settings-updated", {
    maxDailyLoss: settings.value.maxDailyLoss,
    maxOpenRisk: settings.value.maxOpenRisk,
    defaultRSize: settings.value.defaultRSize,
  });
};

// Computed properties for R value display
const maxDailyLossR = computed(() => {
  return settings.value.maxDailyLoss / settings.value.defaultRSize;
});

const maxOpenRiskR = computed(() => {
  return settings.value.maxOpenRisk / settings.value.defaultRSize;
});

// Load settings from localStorage on mount
const loadSettings = () => {
  const saved = localStorage.getItem("riskSettings");
  if (saved) {
    const parsedSettings = JSON.parse(saved);
    settings.value = { ...settings.value, ...parsedSettings };
  }
};

loadSettings();
</script>

<style scoped>
.risk-settings {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.risk-settings h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #5a6c7d;
  font-weight: 500;
  font-size: 0.9rem;
}

input[type="number"] {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

input[type="number"]:focus {
  outline: none;
  border-color: #3498db;
}

.input-with-r {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-with-r input {
  flex: 1;
}

.r-equivalent {
  color: #3498db;
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 50px;
}

input[type="checkbox"] {
  margin-right: 8px;
  transform: scale(1.2);
}

small {
  display: block;
  margin-top: 5px;
  color: #7f8c8d;
  font-size: 0.85rem;
  line-height: 1.4;
}

.save-btn {
  width: 100%;
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.save-btn:hover {
  background: #229954;
}

.risk-tips {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.risk-tips h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.risk-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #5a6c7d;
  font-size: 0.9rem;
  line-height: 1.6;
}

.risk-tips li {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .risk-settings {
    padding: 20px;
  }
}
</style>

<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Settings</h2>
            <button class="close-btn" @click="handleClose" aria-label="Close">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="settings-section">
              <h3 class="section-title">Trading Mode</h3>
              <div class="mode-selector-group">
                <div class="mode-option">
                  <label class="mode-label-text">Trading Mode</label>
                  <div class="mode-toggle">
                    <button
                      :class="{ active: localSettings.tradingMode === 'DAY' }"
                      @click="handleTradingModeChange('DAY')"
                      class="mode-btn day-btn"
                    >
                      DAY
                    </button>
                    <button
                      :class="{ active: localSettings.tradingMode === 'SWING' }"
                      @click="handleTradingModeChange('SWING')"
                      class="mode-btn swing-btn"
                    >
                      SWING
                    </button>
                  </div>
                </div>

                <div class="mode-option">
                  <label class="mode-label-text">Development Mode</label>
                  <div class="mode-toggle">
                    <button
                      :class="{ active: !localSettings.devMode }"
                      @click="handleDevModeToggle(false)"
                      class="mode-btn prod-btn"
                    >
                      OFF
                    </button>
                    <button
                      :class="{ active: localSettings.devMode }"
                      @click="handleDevModeToggle(true)"
                      class="mode-btn dev-btn"
                    >
                      ON
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-divider"></div>

            <div class="settings-section">
              <h3 class="section-title">Risk Management</h3>
              <form @submit.prevent="handleSave">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="defaultRSize">Default R Size ($)</label>
                    <input
                      id="defaultRSize"
                      v-model.number="localSettings.defaultRSize"
                      type="number"
                      step="1"
                      min="1"
                      required
                    />
                    <small>1R = ${{ localSettings.defaultRSize }}</small>
                  </div>

                  <div class="form-group">
                    <label for="maxDailyLoss">Max Daily Loss ($)</label>
                    <div class="input-with-badge">
                      <input
                        id="maxDailyLoss"
                        v-model.number="localSettings.maxDailyLoss"
                        type="number"
                        step="1"
                        min="0"
                        required
                      />
                      <span v-if="showRValues" class="badge">
                        {{ maxDailyLossR.toFixed(2) }}R
                      </span>
                    </div>
                    <small>Maximum loss per day</small>
                  </div>

                  <div class="form-group">
                    <label for="maxOpenRisk">Max Open Risk ($)</label>
                    <div class="input-with-badge">
                      <input
                        id="maxOpenRisk"
                        v-model.number="localSettings.maxOpenRisk"
                        type="number"
                        step="1"
                        min="0"
                        required
                      />
                      <span v-if="showRValues" class="badge">
                        {{ maxOpenRiskR.toFixed(2) }}R
                      </span>
                    </div>
                    <small>Total risk across open positions</small>
                  </div>

                  <div class="form-group">
                    <label for="maxPositions">Max Open Positions</label>
                    <input
                      id="maxPositions"
                      v-model.number="localSettings.maxPositions"
                      type="number"
                      step="1"
                      min="1"
                      max="20"
                      required
                    />
                    <small>Maximum concurrent trades</small>
                  </div>

                  <div class="form-group">
                    <label for="stateTaxRate">State Tax Rate (%)</label>
                    <input
                      id="stateTaxRate"
                      v-model.number="localSettings.stateTaxRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <small>State tax on profits</small>
                  </div>

                  <div class="form-group">
                    <label for="federalTaxRate">Federal Tax Rate (%)</label>
                    <input
                      id="federalTaxRate"
                      v-model.number="localSettings.federalTaxRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <small>Federal tax on profits</small>
                  </div>

                  <div class="form-group">
                    <label for="marginInterestRate"
                      >Margin Interest Rate (% APR)</label
                    >
                    <input
                      id="marginInterestRate"
                      v-model.number="localSettings.marginInterestRate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                    <small>Annual margin interest</small>
                  </div>

                  <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        v-model="localSettings.enableAlerts"
                      />
                      <span>Enable Risk Alerts</span>
                    </label>
                    <small>Show warnings at risk limits</small>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="handleClose" class="btn btn-secondary">
              Cancel
            </button>
            <button @click="handleSave" class="btn btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div
        v-if="showModeConfirmation"
        class="modal-overlay"
        @click="cancelModeChange"
      >
        <div class="confirmation-modal" @click.stop>
          <div class="confirmation-header">
            <h3>Confirm Mode Change</h3>
          </div>
          <div class="confirmation-body">
            <p>
              You are about to switch from <strong>{{ currentMode }}</strong> to
              <strong>{{ pendingMode }}</strong> mode.
            </p>
            <p class="warning-text">
              This will re-evaluate all open trades against the new mode rules.
            </p>
            <div v-if="openTradesCount > 0" class="trade-warning">
              <strong>{{ openTradesCount }}</strong> open trade{{
                openTradesCount > 1 ? "s" : ""
              }}
              will be affected.
            </div>
          </div>
          <div class="confirmation-footer">
            <button @click="cancelModeChange" class="btn btn-secondary">
              Cancel
            </button>
            <button @click="confirmModeChange" class="btn btn-primary">
              Confirm Change
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import api from "../services/api";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  tradingMode: {
    type: String,
    default: "SWING",
  },
  devMode: {
    type: Boolean,
    default: false,
  },
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
  maxPositions: {
    type: Number,
    default: 5,
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
  enableAlerts: {
    type: Boolean,
    default: true,
  },
  showRValues: {
    type: Boolean,
    default: false,
  },
  openTradesCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  "close",
  "save",
  "trading-mode-changed",
  "dev-mode-changed",
]);

const localSettings = ref({
  tradingMode: props.tradingMode,
  devMode: props.devMode,
  maxDailyLoss: props.maxDailyLoss,
  maxOpenRisk: props.maxOpenRisk,
  defaultRSize: props.defaultRSize,
  maxPositions: props.maxPositions,
  stateTaxRate: props.stateTaxRate,
  federalTaxRate: props.federalTaxRate,
  marginInterestRate: props.marginInterestRate,
  enableAlerts: props.enableAlerts,
});

const loadSettingsFromAPI = async () => {
  try {
    const settings = await api.getRiskSettings();
    if (settings) {
      // Update local settings with values from API
      if (settings.maxDailyLoss !== undefined) {
        localSettings.value.maxDailyLoss = settings.maxDailyLoss;
      }
      if (settings.maxOpenRisk !== undefined) {
        localSettings.value.maxOpenRisk = settings.maxOpenRisk;
      }
      if (settings.defaultRSize !== undefined) {
        localSettings.value.defaultRSize = settings.defaultRSize;
      }
      if (settings.maxPositions !== undefined) {
        localSettings.value.maxPositions = settings.maxPositions;
      }
      if (settings.stateTaxRate !== undefined) {
        localSettings.value.stateTaxRate = settings.stateTaxRate;
      }
      if (settings.federalTaxRate !== undefined) {
        localSettings.value.federalTaxRate = settings.federalTaxRate;
      }
      if (settings.marginInterestRate !== undefined) {
        localSettings.value.marginInterestRate = settings.marginInterestRate;
      }
      if (settings.enableAlerts !== undefined) {
        localSettings.value.enableAlerts = settings.enableAlerts;
      }
    }
  } catch (error) {
    console.error("Failed to load settings from API:", error);
  }
};

const showModeConfirmation = ref(false);
const pendingMode = ref(null);
const currentMode = ref(props.tradingMode);

watch(
  () => props.isOpen,
  async (newValue) => {
    if (newValue) {
      // First set from props
      localSettings.value = {
        tradingMode: props.tradingMode,
        devMode: props.devMode,
        maxDailyLoss: props.maxDailyLoss,
        maxOpenRisk: props.maxOpenRisk,
        defaultRSize: props.defaultRSize,
        maxPositions: props.maxPositions,
        stateTaxRate: props.stateTaxRate,
        federalTaxRate: props.federalTaxRate,
        marginInterestRate: props.marginInterestRate,
        enableAlerts: props.enableAlerts,
      };
      // Then load from API to get latest values
      await loadSettingsFromAPI();
    }
  }
);

// Load settings on mount
onMounted(() => {
  loadSettingsFromAPI();
});

const maxDailyLossR = computed(() => {
  return localSettings.value.maxDailyLoss / localSettings.value.defaultRSize;
});

const maxOpenRiskR = computed(() => {
  return localSettings.value.maxOpenRisk / localSettings.value.defaultRSize;
});

const handleClose = () => {
  emit("close");
};

const handleSave = () => {
  emit("save", localSettings.value);
  emit("close");
};

const handleTradingModeChange = (newMode) => {
  if (newMode === localSettings.value.tradingMode) return;

  currentMode.value = localSettings.value.tradingMode;
  pendingMode.value = newMode;
  showModeConfirmation.value = true;
};

const confirmModeChange = () => {
  localSettings.value.tradingMode = pendingMode.value;
  emit("trading-mode-changed", pendingMode.value);
  showModeConfirmation.value = false;
  pendingMode.value = null;
};

const cancelModeChange = () => {
  showModeConfirmation.value = false;
  pendingMode.value = null;
};

const handleDevModeToggle = (newDevMode) => {
  if (newDevMode === localSettings.value.devMode) return;
  localSettings.value.devMode = newDevMode;
  emit("dev-mode-changed", newDevMode);
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #5a6c7d;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #2c3e50;
}

.modal-body {
  padding: 28px;
  overflow-y: auto;
  flex: 1;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-divider {
  height: 1px;
  background: #e1e8ed;
  margin: 32px 0;
}

.mode-selector-group {
  display: grid;
  gap: 20px;
}

.mode-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e1e8ed;
}

.mode-label-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #5a6c7d;
  margin: 0;
}

.mode-toggle {
  display: flex;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e1e8ed;
  background: white;
}

.mode-btn {
  padding: 10px 24px;
  border: none;
  background: white;
  color: #5a6c7d;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border-right: 1px solid #e1e8ed;
}

.mode-btn:last-child {
  border-right: none;
}

.mode-btn:hover {
  background: #f8f9fa;
}

.mode-btn.active {
  color: white;
}

.day-btn.active {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.swing-btn.active {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.prod-btn.active {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
}

.dev-btn.active {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #5a6c7d;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-group input[type="number"] {
  padding: 12px 14px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-group input[type="number"]:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.input-with-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-with-badge input {
  flex: 1;
}

.badge {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 0;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #3498db;
}

.checkbox-label span {
  font-size: 0.95rem;
  color: #2c3e50;
}

small {
  margin-top: 6px;
  color: #7f8c8d;
  font-size: 0.8rem;
  line-height: 1.4;
}

.modal-footer {
  padding: 20px 28px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background: white;
  color: #5a6c7d;
  border: 2px solid #e1e8ed;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #cbd5e0;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
}

.confirmation-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s ease;
}

.confirmation-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8ed;
}

.confirmation-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.confirmation-body {
  padding: 24px;
}

.confirmation-body p {
  margin: 0 0 16px 0;
  color: #5a6c7d;
  line-height: 1.6;
}

.warning-text {
  color: #e67e22;
  font-weight: 600;
}

.trade-warning {
  padding: 12px;
  background: #fff3cd;
  border-left: 4px solid #f39c12;
  border-radius: 4px;
  color: #856404;
  margin-top: 16px;
}

.confirmation-footer {
  padding: 16px 24px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 12px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .mode-option {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .mode-toggle {
    width: 100%;
  }

  .mode-btn {
    flex: 1;
  }
}
</style>

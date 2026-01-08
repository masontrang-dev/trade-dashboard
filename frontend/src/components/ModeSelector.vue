<template>
  <div class="mode-selector">
    <div class="mode-section">
      <div class="mode-label">Trading Mode:</div>
      <div class="mode-toggle">
        <button
          :class="{ active: tradingMode === 'DAY' }"
          @click="handleTradingModeChange('DAY')"
          class="mode-btn day-btn"
        >
          DAY
        </button>
        <button
          :class="{ active: tradingMode === 'SWING' }"
          @click="handleTradingModeChange('SWING')"
          class="mode-btn swing-btn"
        >
          SWING
        </button>
      </div>
    </div>

    <div class="mode-section">
      <div class="mode-label">Dev Mode:</div>
      <div class="mode-toggle">
        <button
          :class="{ active: !devMode }"
          @click="handleDevModeToggle(false)"
          class="mode-btn prod-btn"
        >
          OFF
        </button>
        <button
          :class="{ active: devMode }"
          @click="handleDevModeToggle(true)"
          class="mode-btn dev-btn"
        >
          ON
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <teleport to="body">
      <div
        v-if="showConfirmation"
        class="modal-overlay"
        @click="cancelModeChange"
      >
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Confirm Mode Change</h3>
          </div>
          <div class="modal-body">
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
          <div class="modal-footer">
            <button @click="cancelModeChange" class="cancel-btn">Cancel</button>
            <button @click="confirmModeChange" class="confirm-btn">
              Confirm Change
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  tradingMode: {
    type: String,
    default: "SWING",
    validator: (value) => ["DAY", "SWING"].includes(value),
  },
  devMode: {
    type: Boolean,
    default: false,
  },
  openTradesCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["trading-mode-changed", "dev-mode-changed"]);

const showConfirmation = ref(false);
const pendingMode = ref(null);
const currentMode = ref(props.tradingMode);

const handleTradingModeChange = (newMode) => {
  if (newMode === props.tradingMode) return;

  currentMode.value = props.tradingMode;
  pendingMode.value = newMode;
  showConfirmation.value = true;
};

const confirmModeChange = () => {
  emit("trading-mode-changed", pendingMode.value);
  showConfirmation.value = false;
  pendingMode.value = null;
};

const cancelModeChange = () => {
  showConfirmation.value = false;
  pendingMode.value = null;
};

const handleDevModeToggle = (newDevMode) => {
  if (newDevMode === props.devMode) return;
  emit("dev-mode-changed", newDevMode);
};
</script>

<style scoped>
.mode-selector {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 12px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.mode-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #5a6c7d;
}

.mode-toggle {
  display: flex;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e1e8ed;
}

.mode-btn {
  padding: 8px 20px;
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

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
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

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
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
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
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

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #ecf0f1;
  color: #5a6c7d;
}

.cancel-btn:hover {
  background: #d5dbdb;
}

.confirm-btn {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

@media (max-width: 768px) {
  .mode-selector {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .mode-section {
    justify-content: space-between;
  }
}
</style>

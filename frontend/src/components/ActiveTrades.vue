<template>
  <div class="active-trades">
    <div class="header-section">
      <h2>Active Trades ({{ tradesStore.openTrades.length }})</h2>
    </div>

    <TradeGrid
      :trades="tradesStore.openTrades"
      @trade-updated="handleTradeUpdated"
      @trade-deleted="handleTradeDeleted"
      @expand-trade="handleExpandTrade"
      @close-trade="handleCloseTrade"
    >
      <template #quick-add>
        <QuickAddRow @trade-added="handleTradeAdded" />
      </template>
    </TradeGrid>

    <div v-if="expandedTrade" class="modal-overlay" @click="closeExpandedTrade">
      <div class="details-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ expandedTrade.ticker }} - Trade Details</h3>
          <button @click="closeExpandedTrade" class="close-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Entry Time:</span>
              <span class="value">{{
                formatDateTime(expandedTrade.entryTime)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Position Size:</span>
              <span class="value">
                ${{
                  (expandedTrade.entryPrice * expandedTrade.quantity).toFixed(2)
                }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">Target 1:</span>
              <span class="value">
                ${{ expandedTrade.target1?.toFixed(2) || "-" }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">Target 2:</span>
              <span class="value">
                ${{ expandedTrade.target2?.toFixed(2) || "-" }}
              </span>
            </div>
            <div class="detail-item full-width" v-if="expandedTrade.notes">
              <span class="label">Notes:</span>
              <p class="notes-text">{{ expandedTrade.notes }}</p>
            </div>
          </div>

          <div class="r-progress-section">
            <div class="r-progress-label">R Progress</div>
            <div class="r-progress-bar">
              <div class="r-progress-track">
                <div class="r-marker stop" title="Stop Loss: -1R">
                  <span class="marker-label">Stop</span>
                </div>
                <div class="r-marker entry" title="Entry: 0R">
                  <span class="marker-label">Entry</span>
                </div>
                <div
                  class="r-marker target1"
                  title="Target 1: +1R"
                  v-if="expandedTrade.target1"
                >
                  <span class="marker-label">T1</span>
                </div>
                <div
                  class="r-marker target2"
                  title="Target 2: +2R"
                  v-if="expandedTrade.target2"
                >
                  <span class="marker-label">T2</span>
                </div>
                <div
                  class="r-progress-indicator"
                  :class="{
                    positive: currentRMultiple(expandedTrade) > 0,
                    negative: currentRMultiple(expandedTrade) < 0,
                  }"
                  :style="{
                    left: calculateRProgressPosition(expandedTrade) + '%',
                  }"
                  :title="currentRMultiple(expandedTrade).toFixed(2) + 'R'"
                >
                  <span class="indicator-value"
                    >{{ currentRMultiple(expandedTrade).toFixed(2) }}R</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import TradeGrid from "./TradeGrid.vue";
import QuickAddRow from "./QuickAddRow.vue";
import apiService from "../services/api";
import { useTradesStore } from "../stores/trades";
import { useUIStore } from "../stores/ui";
import {
  calculateProfitLoss,
  calculateRMultiple,
} from "../../../shared/tradeCalculations";

const tradesStore = useTradesStore();
const uiStore = useUIStore();

const emit = defineEmits(["trade-closed", "trade-updated"]);

const expandedTrade = ref(null);

const currentPnL = computed(() => (trade) => {
  if (!trade?.currentPrice) return 0;
  return calculateProfitLoss(
    trade.type,
    trade.entryPrice,
    trade.currentPrice,
    trade.quantity
  );
});

const currentRMultiple = computed(() => (trade) => {
  return calculateRMultiple(currentPnL.value(trade), trade.riskAmount);
});

const calculateRProgressPosition = (trade) => {
  const rMultiple = currentRMultiple.value(trade);
  const minR = -1;
  const maxR = 2;
  const rangeR = maxR - minR;
  const clampedR = Math.max(minR, Math.min(maxR, rMultiple));
  const position = ((clampedR - minR) / rangeR) * 100;
  return position;
};

const handleTradeAdded = async () => {
  await tradesStore.fetchOpenTrades();
};

const handleTradeUpdated = async () => {
  await tradesStore.fetchOpenTrades();
  emit("trade-updated");
};

const handleTradeDeleted = async () => {
  await tradesStore.fetchOpenTrades();
  emit("trade-closed");
};

const handleExpandTrade = (trade) => {
  expandedTrade.value = trade;
};

const closeExpandedTrade = () => {
  expandedTrade.value = null;
};

const handleCloseTrade = (trade) => {
  // Close trade is now handled inline in the grid via exit price
  // This handler is kept for compatibility but does nothing
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.active-trades {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.header-section {
  margin-bottom: 20px;
}

.header-section h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
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

.close-modal,
.details-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
}

.details-modal {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
  font-weight: 600;
}

.close-btn {
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #5a6c7d;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #2c3e50;
}

.modal-body {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.15s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.projected-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.projected-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.projected-row:last-child {
  margin-bottom: 0;
}

.projected-row .label {
  font-size: 0.875rem;
  color: #5a6c7d;
  font-weight: 500;
}

.projected-row .value {
  font-size: 1rem;
  font-weight: 600;
}

.text-green {
  color: #27ae60;
}

.text-red {
  color: #e74c3c;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
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

.btn-confirm {
  background: #667eea;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #5568d3;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item .label {
  font-size: 0.75rem;
  color: #7f8c8d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item .value {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.notes-text {
  margin: 8px 0 0 0;
  font-size: 0.875rem;
  color: #5a6c7d;
  line-height: 1.5;
}

.r-progress-section {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.r-progress-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.r-progress-bar {
  width: 100%;
}

.r-progress-track {
  position: relative;
  width: 100%;
  height: 40px;
  background: #e1e8ed;
  border-radius: 20px;
}

.r-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.r-marker.stop {
  left: 0%;
}

.r-marker.entry {
  left: 33.33%;
}

.r-marker.target1 {
  left: 66.67%;
}

.r-marker.target2 {
  left: 100%;
}

.marker-label {
  font-size: 0.625rem;
  font-weight: 600;
  color: #5a6c7d;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.r-progress-indicator {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #667eea;
  z-index: 2;
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
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>

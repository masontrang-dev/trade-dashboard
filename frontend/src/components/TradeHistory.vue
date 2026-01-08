<template>
  <div class="trade-history">
    <h2>Trade History</h2>

    <div v-if="history.length === 0" class="no-history">
      <p>No completed trades yet. Your trading history will appear here.</p>
    </div>

    <div v-else>
      <!-- Statistics Summary -->
      <div class="stats-summary">
        <div class="stat-card">
          <h3>Total Trades</h3>
          <span class="stat-value">{{ totalTrades }}</span>
        </div>
        <div class="stat-card">
          <h3>Win Rate</h3>
          <span
            class="stat-value"
            :class="{ positive: winRate > 50, negative: winRate < 50 }"
          >
            {{ winRate.toFixed(1) }}%
          </span>
        </div>
        <div class="stat-card">
          <h3>Total P&L</h3>
          <span
            class="stat-value"
            :class="{ positive: totalPnL > 0, negative: totalPnL < 0 }"
          >
            <template v-if="showRValues">
              {{ totalPnLR > 0 ? "+" : "" }}{{ totalPnLR.toFixed(2) }}R
              <small
                >({{ totalPnL > 0 ? "+" : "" }}${{
                  totalPnL.toFixed(2)
                }})</small
              >
            </template>
            <template v-else>
              {{ totalPnL > 0 ? "+" : "" }}${{ totalPnL.toFixed(2) }}
            </template>
          </span>
        </div>
        <div class="stat-card">
          <h3>Avg R Multiple</h3>
          <span
            class="stat-value"
            :class="{ positive: avgRMultiple > 0, negative: avgRMultiple < 0 }"
          >
            {{ avgRMultiple > 0 ? "+" : "" }}{{ avgRMultiple.toFixed(2) }}R
          </span>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="filter-controls">
        <select v-model="filterPeriod" @change="filterTrades">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        <select v-model="filterType" @change="filterTrades">
          <option value="all">All Types</option>
          <option value="long">Long Only</option>
          <option value="short">Short Only</option>
        </select>
      </div>

      <!-- History Table -->
      <div class="history-table">
        <table>
          <thead>
            <tr>
              <th>Entry Date</th>
              <th>Exit Date</th>
              <th>Ticker</th>
              <th>Strategy</th>
              <th>Type</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Shares</th>
              <th>P&L ($)</th>
              <th>P&L (%)</th>
              <th>R-Multiple</th>
              <th>Win/Loss</th>
              <th>Tax</th>
              <th>Margin Int.</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="trade in filteredHistory"
              :key="trade.id"
              :class="{
                profitable: trade.profitLoss > 0,
                losing: trade.profitLoss < 0,
              }"
              :title="trade.notes || ''"
            >
              <td>{{ formatDate(trade.entryDate) }}</td>
              <td>{{ formatDate(trade.closeDate) }}</td>
              <td class="ticker">{{ trade.ticker }}</td>
              <td>{{ trade.strategy || "-" }}</td>
              <td>
                <span class="trade-type" :class="trade.type">
                  {{ trade.type.toUpperCase() }}
                </span>
              </td>
              <td>${{ trade.entryPrice.toFixed(2) }}</td>
              <td>${{ trade.exitPrice?.toFixed(2) || "-" }}</td>
              <td>{{ trade.quantity || trade.shares || 0 }}</td>
              <td
                class="pnl"
                :class="{
                  positive: trade.profitLoss > 0,
                  negative: trade.profitLoss < 0,
                }"
              >
                {{ trade.profitLoss > 0 ? "+" : "" }}${{
                  trade.profitLoss.toFixed(2)
                }}
              </td>
              <td
                class="pnl-percent"
                :class="{
                  positive: calculatePnLPercent(trade) > 0,
                  negative: calculatePnLPercent(trade) < 0,
                }"
              >
                {{ calculatePnLPercent(trade) > 0 ? "+" : ""
                }}{{ calculatePnLPercent(trade).toFixed(2) }}%
              </td>
              <td
                class="r-multiple"
                :class="{
                  positive: tradeRMultiple(trade) > 0,
                  negative: tradeRMultiple(trade) < 0,
                }"
              >
                {{ tradeRMultiple(trade) > 0 ? "+" : ""
                }}{{ tradeRMultiple(trade).toFixed(2) }}R
              </td>
              <td>
                <span
                  class="win-loss-badge"
                  :class="{
                    win: trade.profitLoss > 0,
                    loss: trade.profitLoss < 0,
                    breakeven: trade.profitLoss === 0,
                  }"
                >
                  {{
                    trade.profitLoss > 0
                      ? "WIN"
                      : trade.profitLoss < 0
                      ? "LOSS"
                      : "BE"
                  }}
                </span>
              </td>
              <td class="tax">${{ calculateTax(trade).toFixed(2) }}</td>
              <td class="margin-interest">
                ${{ (trade.marginInterest || 0).toFixed(2) }}
              </td>
              <td
                class="net-profit"
                :class="{
                  positive: calculateNetProfit(trade) > 0,
                  negative: calculateNetProfit(trade) < 0,
                }"
              >
                {{ calculateNetProfit(trade) > 0 ? "+" : "" }}${{
                  calculateNetProfit(trade).toFixed(2)
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Monthly Performance Chart -->
      <div class="performance-chart" v-if="monthlyData.length > 0">
        <h3>Monthly Performance</h3>
        <div class="chart-container">
          <div
            v-for="month in monthlyData"
            :key="month.label"
            class="chart-bar"
          >
            <div
              class="bar-fill"
              :style="{
                height: Math.abs((month.pnl / maxMonthlyPnL) * 100) + '%',
                backgroundColor: month.pnl >= 0 ? '#27ae60' : '#e74c3c',
              }"
            ></div>
            <div class="bar-label">{{ month.label }}</div>
            <div class="bar-value">
              {{ month.pnl > 0 ? "+" : "" }}${{ month.pnl.toFixed(0) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  history: {
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

const filterPeriod = ref("all");
const filterType = ref("all");
const filteredHistory = ref([]);

// Statistics
const totalTrades = computed(() => props.history.length);

const winningTrades = computed(() =>
  props.history.filter((trade) => trade.profitLoss > 0)
);

const winRate = computed(() => {
  if (totalTrades.value === 0) return 0;
  return (winningTrades.value.length / totalTrades.value) * 100;
});

const totalPnL = computed(() =>
  props.history.reduce((total, trade) => total + trade.profitLoss, 0)
);

const totalPnLR = computed(() => {
  return totalPnL.value / props.defaultRSize;
});

const avgRMultiple = computed(() => {
  if (totalTrades.value === 0) return 0;
  const totalR = props.history.reduce((total, trade) => {
    const rMultiple =
      trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : 0;
    return total + rMultiple;
  }, 0);
  return totalR / totalTrades.value;
});

// Monthly performance data
const monthlyData = computed(() => {
  const monthlyMap = new Map();

  props.history.forEach((trade) => {
    const date = new Date(trade.closeDate);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthLabel = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { label: monthLabel, pnl: 0 });
    }

    monthlyMap.get(monthKey).pnl += trade.profitLoss;
  });

  return Array.from(monthlyMap.values()).slice(-6); // Last 6 months
});

const maxMonthlyPnL = computed(() => {
  if (monthlyData.value.length === 0) return 1;
  return Math.max(...monthlyData.value.map((m) => Math.abs(m.pnl)));
});

// Filter functions
const filterTrades = () => {
  let filtered = [...props.history];

  // Filter by period
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filterPeriod.value) {
    case "today":
      filtered = filtered.filter((trade) => new Date(trade.closeDate) >= today);
      break;
    case "week":
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(
        (trade) => new Date(trade.closeDate) >= weekAgo
      );
      break;
    case "month":
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(
        (trade) => new Date(trade.closeDate) >= monthAgo
      );
      break;
  }

  // Filter by type
  if (filterType.value !== "all") {
    filtered = filtered.filter((trade) => trade.type === filterType.value);
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.closeDate) - new Date(a.closeDate));

  filteredHistory.value = filtered;
};

// Utility functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const tradeRMultiple = (trade) => {
  return trade.riskAmount > 0 ? trade.profitLoss / trade.riskAmount : 0;
};

const calculatePnLPercent = (trade) => {
  const entryValue = trade.entryPrice * (trade.quantity || trade.shares || 0);
  return entryValue > 0 ? (trade.profitLoss / entryValue) * 100 : 0;
};

const calculateTax = (trade) => {
  if (trade.taxAmount !== undefined && trade.taxAmount !== null) {
    return trade.taxAmount;
  }
  return trade.profitLoss > 0 ? trade.profitLoss * 0.25 : 0;
};

const calculateNetProfit = (trade) => {
  const tax = calculateTax(trade);
  const marginInterest = trade.marginInterest || 0;
  return trade.profitLoss - tax - marginInterest;
};

const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Same day";
  if (diffDays === 1) return "1 day";
  return `${diffDays} days`;
};

// Initialize filtered history
filterTrades();

// Watch for history changes
watch(
  () => props.history,
  () => {
    filterTrades();
  },
  { deep: true }
);
</script>

<style scoped>
.trade-history {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.trade-history h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.no-history {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  border: 1px solid #e1e8ed;
}

.stat-card h3 {
  margin: 0 0 8px 0;
  color: #5a6c7d;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value small {
  display: block;
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 4px;
}

.stat-value.positive {
  color: #27ae60;
}

.stat-value.negative {
  color: #e74c3c;
}

.filter-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-controls select {
  padding: 8px 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
}

.history-table {
  overflow-x: auto;
  margin-bottom: 30px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th {
  background: #f8f9fa;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #5a6c7d;
  border-bottom: 2px solid #e1e8ed;
}

td {
  padding: 10px 8px;
  border-bottom: 1px solid #e1e8ed;
}

tr.profitable {
  background: rgba(39, 174, 96, 0.05);
}

tr.losing {
  background: rgba(231, 76, 60, 0.05);
}

.ticker {
  font-weight: 600;
  color: #2c3e50;
}

.trade-type {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
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

.pnl,
.r-multiple {
  font-weight: 600;
}

.pnl small {
  display: block;
  font-size: 0.75rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 2px;
}

.pnl.positive,
.r-multiple.positive {
  color: #27ae60;
}

.pnl.negative,
.r-multiple.negative,
.pnl-percent.negative,
.net-profit.negative {
  color: #e74c3c;
}

.pnl-percent.positive,
.net-profit.positive {
  color: #27ae60;
}

.win-loss-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.win-loss-badge.win {
  background: #d5f4e6;
  color: #27ae60;
}

.win-loss-badge.loss {
  background: #fadbd8;
  color: #e74c3c;
}

.win-loss-badge.breakeven {
  background: #e8e8e8;
  color: #7f8c8d;
}

.tax,
.margin-interest {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.performance-chart {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.performance-chart h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.chart-container {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 200px;
  padding: 20px 0;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  background: #fafbfc;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;
  position: relative;
}

.bar-fill {
  width: 30px;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
}

.bar-label {
  margin-top: 8px;
  font-size: 0.75rem;
  color: #5a6c7d;
  text-align: center;
}

.bar-value {
  position: absolute;
  top: -20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-controls {
    flex-direction: column;
  }

  .history-table {
    font-size: 0.8rem;
  }

  th,
  td {
    padding: 8px 4px;
  }

  .chart-container {
    height: 150px;
  }

  .chart-bar {
    max-width: 40px;
  }

  .bar-fill {
    width: 20px;
  }
}
</style>

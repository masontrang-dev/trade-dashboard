<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <span>📈</span>
        <span>Trade Entry</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="submitTrade" class="space-y-4">
        <!-- R Size -->
        <div class="space-y-2">
          <label for="rSize" class="text-sm font-medium">R Size ($)</label>
          <Input
            id="rSize"
            v-model.number="trade.rSize"
            type="number"
            step="1"
            min="1"
            placeholder="Enter R size"
            required
          />
        </div>

        <!-- Ticker and Strategy Row -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="ticker" class="text-sm font-medium"
              >Ticker Symbol</label
            >
            <Input
              id="ticker"
              v-model="trade.ticker"
              type="text"
              placeholder="AAPL"
              required
              @input="trade.ticker = trade.ticker.toUpperCase()"
            />
          </div>
          <div class="space-y-2">
            <label for="strategy" class="text-sm font-medium">Strategy</label>
            <Select v-model="trade.strategy">
              <SelectTrigger>
                <SelectValue
                  :placeholder="trade.strategy || 'Select a strategy...'"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">
                  <span class="text-muted-foreground"
                    >Select a strategy...</span
                  >
                </SelectItem>
                <SelectItem
                  v-for="strategy in strategyOptions"
                  :key="strategy"
                  :value="strategy"
                >
                  {{ strategy }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Entry Price -->
        <div class="space-y-2">
          <label for="entryPrice" class="text-sm font-medium"
            >Entry Price ($)</label
          >
          <Input
            id="entryPrice"
            v-model.number="trade.entryPrice"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="150.00"
            required
          />
        </div>

        <!-- Stop Loss -->
        <div class="space-y-2">
          <label for="stopLoss" class="text-sm font-medium"
            >Stop Loss ($)</label
          >
          <Input
            id="stopLoss"
            v-model.number="trade.stopLoss"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="145.00"
            required
          />
        </div>

        <!-- Position Size -->
        <div class="space-y-2">
          <label for="shares" class="text-sm font-medium"
            >Position Size (Shares)</label
          >
          <Input
            id="shares"
            v-model.number="trade.shares"
            type="number"
            step="1"
            min="1"
            placeholder="Auto-calculated"
          />
          <p v-if="sharesCalculationInfo" class="text-xs text-muted-foreground">
            {{ sharesCalculationInfo }}
          </p>
          <p class="text-xs font-semibold text-primary">
            Position Value: ${{ positionValue.toFixed(2) }}
          </p>
        </div>

        <!-- Target 1 -->
        <div class="space-y-2">
          <label for="target1" class="text-sm font-medium"
            >Target 1 (+1R)</label
          >
          <Input
            id="target1"
            v-model.number="trade.target1"
            type="number"
            step="0.01"
            min="0.01"
            :placeholder="calculatedTarget1.toFixed(2)"
            readonly
          />
        </div>

        <!-- Target 2 -->
        <div class="space-y-2">
          <label for="target2" class="text-sm font-medium"
            >Target 2 (+2R)</label
          >
          <Input
            id="target2"
            v-model.number="trade.target2"
            type="number"
            step="0.01"
            min="0.01"
            :placeholder="calculatedTarget2.toFixed(2)"
            readonly
          />
        </div>

        <!-- Target 3 -->
        <div class="space-y-2">
          <label for="target3" class="text-sm font-medium">Target 3</label>
          <Input
            id="target3"
            v-model.number="trade.target3"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter custom target"
          />
        </div>

        <!-- Trade Type -->
        <div class="space-y-2">
          <label for="tradeType" class="text-sm font-medium">Trade Type</label>
          <Select v-model="trade.type">
            <SelectTrigger>
              <SelectValue
                :placeholder="trade.type === 'long' ? 'Long' : 'Short'"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="border-t pt-4" />

        <!-- Notes -->
        <div class="space-y-2">
          <label for="notes" class="text-sm font-medium">Notes</label>
          <textarea
            id="notes"
            v-model="trade.notes"
            rows="3"
            placeholder="Trade setup reasoning..."
            class="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          ></textarea>
        </div>

        <div class="border-t pt-4" />

        <!-- Tax and Margin Rates -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="stateTaxRate" class="text-sm font-medium"
              >State Tax Rate (%)</label
            >
            <Input
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
          <div class="space-y-2">
            <label for="federalTaxRate" class="text-sm font-medium"
              >Federal Tax Rate (%)</label
            >
            <Input
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

        <div class="space-y-2">
          <label for="marginInterestRate" class="text-sm font-medium"
            >Margin Interest Rate (% APR)</label
          >
          <Input
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

        <!-- Trade Risk Summary -->
        <Alert v-if="trade.entryPrice && trade.stopLoss" class="mt-4">
          <AlertTitle>Trade Risk</AlertTitle>
          <AlertDescription>
            <div class="space-y-2 mt-2">
              <div class="flex items-start gap-2">
                <span class="text-primary">•</span>
                <span class="text-sm">
                  <strong>Risk per Share:</strong> ${{
                    riskPerShare.toFixed(2)
                  }}
                </span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-primary">•</span>
                <span class="text-sm">
                  <strong>Total Risk:</strong> ${{ totalRisk.toFixed(0) }}
                  <span
                    v-if="dailyRiskPercentage > 0"
                    class="text-muted-foreground"
                  >
                    ({{ dailyRiskWarningIcon }}
                    {{ dailyRiskPercentage.toFixed(0) }}% of daily limit)
                  </span>
                </span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-primary">•</span>
                <span class="text-sm">
                  <strong>Remaining Daily Risk After Trade:</strong> ${{
                    remainingDailyRiskAfterTrade.toFixed(0)
                  }}
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div class="border-t pt-4" />

        <Button type="submit" class="w-full">
          <span>➕</span>
          <span>Add Trade</span>
        </Button>
      </form>
    </CardContent>
  </Card>
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
  calculatePositionValue,
  calculateTargetPrice,
  calculateRiskPercentage,
  calculateRemainingRisk,
  dollarsToR,
  getRiskWarningLevel,
} from "../../../shared/tradeCalculations";
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  AlertTitle,
  AlertDescription,
} from "./ui";
import { SelectValue } from "radix-vue";

const emit = defineEmits(["trade-added"]);

const settingsStore = useSettingsStore();
const uiStore = useUIStore();
const tradesStore = useTradesStore();

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
  stateTaxRate: settingsStore.riskSettings.stateTaxRate,
  federalTaxRate: settingsStore.riskSettings.federalTaxRate,
  marginInterestRate: settingsStore.riskSettings.marginInterestRate,
  rSize: settingsStore.riskSettings.defaultRSize,
});

const strategyOptions = computed(() => {
  if (settingsStore.tradingMode === "DAY") {
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
  return trade.value.rSize || settingsStore.riskSettings.defaultRSize;
});

const riskPerShare = computed(() => {
  return calculateRiskPerShare(trade.value.entryPrice, trade.value.stopLoss);
});

const calculatedShares = computed(() => {
  const rDollars = trade.value.rSize || settingsStore.riskSettings.defaultRSize;
  return calculatePositionSize(rDollars, riskPerShare.value);
});

const sharesCalculationInfo = computed(() => {
  if (riskPerShare.value === 0) {
    return "";
  }
  const rDollars = trade.value.rSize || settingsStore.riskSettings.defaultRSize;
  return `${rDollars.toFixed(2)} ÷ ${riskPerShare.value.toFixed(2)} = ${
    calculatedShares.value
  } shares`;
});

const totalRisk = computed(() => {
  return calculateTotalRisk(riskPerShare.value, calculatedShares.value);
});

const totalRiskR = computed(() => {
  const rSize = trade.value.rSize || settingsStore.riskSettings.defaultRSize;
  return dollarsToR(totalRisk.value, rSize);
});

const positionValue = computed(() => {
  return calculatePositionValue(trade.value.entryPrice, calculatedShares.value);
});

const calculatedTarget1 = computed(() => {
  return calculateTargetPrice(
    trade.value.type || "LONG",
    trade.value.entryPrice,
    riskPerShare.value,
    1
  );
});

const calculatedTarget2 = computed(() => {
  return calculateTargetPrice(
    trade.value.type || "LONG",
    trade.value.entryPrice,
    riskPerShare.value,
    2
  );
});

const rMultipleTarget1 = computed(() => {
  if (!trade.value.entryPrice || !trade.value.target1 || !riskPerShare.value)
    return 0;
  const profit = Math.abs(trade.value.target1 - trade.value.entryPrice);
  return dollarsToR(profit, riskPerShare.value);
});

const rMultipleTarget2 = computed(() => {
  if (!trade.value.entryPrice || !trade.value.target2 || !riskPerShare.value)
    return 0;
  const profit = Math.abs(trade.value.target2 - trade.value.entryPrice);
  return dollarsToR(profit, riskPerShare.value);
});

const dailyRiskPercentage = computed(() => {
  return calculateRiskPercentage(
    totalRisk.value,
    settingsStore.riskSettings.maxDailyLoss
  );
});

const dailyRiskWarningIcon = computed(() => {
  return getRiskWarningLevel(dailyRiskPercentage.value).icon;
});

const remainingDailyRiskAfterTrade = computed(() => {
  return calculateRemainingRisk(
    settingsStore.riskSettings.maxDailyLoss,
    tradesStore.totalOpenRisk + totalRisk.value
  );
});

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

watch([calculatedShares], () => {
  if (calculatedShares.value > 0) {
    trade.value.shares = calculatedShares.value;
  }
});

const userModifiedRSize = ref(false);

watch(
  () => settingsStore.riskSettings.defaultRSize,
  (newVal) => {
    if (!userModifiedRSize.value) {
      trade.value.rSize = newVal;
    }
  }
);

watch(
  () => trade.value.rSize,
  (newVal, oldVal) => {
    if (oldVal !== undefined && newVal !== oldVal) {
      userModifiedRSize.value = true;
    }
  }
);

watch(
  () => settingsStore.riskSettings.stateTaxRate,
  (newVal) => {
    trade.value.stateTaxRate = newVal;
  }
);

watch(
  () => settingsStore.riskSettings.federalTaxRate,
  (newVal) => {
    trade.value.federalTaxRate = newVal;
  }
);

watch(
  () => settingsStore.riskSettings.marginInterestRate,
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
    stateTaxRate: settingsStore.riskSettings.stateTaxRate,
    federalTaxRate: settingsStore.riskSettings.federalTaxRate,
    marginInterestRate: settingsStore.riskSettings.marginInterestRate,
    rSize: settingsStore.riskSettings.defaultRSize,
  };
};
</script>

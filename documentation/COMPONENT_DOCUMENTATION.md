# Component Documentation

Comprehensive documentation for all Vue 3 components in the Trade Dashboard application.

## Table of Contents

- [Component Overview](#component-overview)
- [TradingDashboard](#tradingdashboard)
- [ActiveTrades](#activetrades)
- [TradeHistory](#tradehistory)
- [TradeForm](#tradeform)
- [SettingsModal](#settingsmodal)
- [ModeSelector](#modeselector)
- [RiskSettings](#risksettings)
- [RToggle](#rtoggle)
- [Toast](#toast)

---

## Component Overview

### Component Hierarchy

```
App.vue
└── TradingDashboard.vue (Main Container)
    ├── ModeSelector.vue
    ├── RiskSettings.vue
    ├── ActiveTrades.vue
    │   ├── RToggle.vue
    │   └── TradeForm.vue (modal)
    ├── TradeHistory.vue
    │   └── RToggle.vue
    ├── SettingsModal.vue
    └── Toast.vue
```

### Component Responsibilities

| Component        | Purpose                                | State Management     |
| ---------------- | -------------------------------------- | -------------------- |
| TradingDashboard | Main container, orchestrates all views | Manages global state |
| ActiveTrades     | Display and manage open positions      | Local + props        |
| TradeHistory     | Display closed trades with analytics   | Local + props        |
| TradeForm        | Create/edit trade form                 | Local form state     |
| SettingsModal    | Risk management configuration          | Local + API          |
| ModeSelector     | Switch trading modes                   | Props + emits        |
| RiskSettings     | Display risk metrics                   | Props only           |
| RToggle          | Toggle between $ and R display         | Local state          |
| Toast            | Notification system                    | Props + emits        |

---

## TradingDashboard

**File**: `frontend/src/components/TradingDashboard.vue`

### Purpose

Main container component that orchestrates the entire trading dashboard. Manages global state, API calls, and coordinates child components.

### Key Features

- Manages open and closed trades
- Handles risk management settings
- Coordinates mode switching (DAY/SWING, Dev/Prod)
- Provides toast notifications
- Calculates aggregate risk metrics

### Props

None (root component)

### Emits

None

### State

```javascript
// Trades
const openTrades = ref([]);
const closedTrades = ref([]);
const loading = ref(false);

// Risk Management
const riskSettings = ref({
  maxDailyLoss: 2500,
  maxOpenRisk: 5000,
  defaultRSize: 2500,
  stateTaxRate: 9.2,
  federalTaxRate: 24,
  marginInterestRate: 8,
});

// Mode Management
const tradingMode = ref("SWING");
const devMode = ref(false);

// UI State
const activeTab = ref("active");
const showSettings = ref(false);
const showTradeForm = ref(false);
const editingTrade = ref(null);

// Toast
const toastMessage = ref("");
const toastType = ref("success");
const showToast = ref(false);
```

### Computed Properties

```javascript
// Calculate total risk across all open positions
const totalOpenRisk = computed(() => {
  return openTrades.value.reduce((sum, trade) => {
    return sum + (trade.riskAmount || 0);
  }, 0);
});

// Calculate risk percentage based on trading mode
const riskPercentage = computed(() => {
  const limit =
    tradingMode.value === "DAY"
      ? riskSettings.value.maxDailyLoss
      : riskSettings.value.maxOpenRisk;
  return (totalOpenRisk.value / limit) * 100;
});
```

### Key Methods

#### `loadOpenTrades()`

Fetches all open positions with current market prices.

```javascript
async function loadOpenTrades() {
  loading.value = true;
  try {
    openTrades.value = await api.getOpenTrades();
  } catch (error) {
    showToastMessage("Failed to load open trades", "error");
  } finally {
    loading.value = false;
  }
}
```

#### `handleCloseTrade(tradeId, exitPrice, additionalData)`

Closes a trade and recalculates risk metrics.

```javascript
async function handleCloseTrade(tradeId, exitPrice, additionalData) {
  try {
    const result = await api.closeTrade(tradeId, exitPrice, additionalData);
    await loadOpenTrades();
    await loadClosedTrades();
    showToastMessage(
      `Trade closed: ${result.rMultiple.toFixed(2)}R`,
      "success"
    );
  } catch (error) {
    showToastMessage("Failed to close trade", "error");
  }
}
```

#### `switchMode(newMode)`

Switches between DAY and SWING trading modes.

```javascript
async function switchMode(newMode) {
  try {
    await api.switchTradingMode(newMode, devMode.value);
    tradingMode.value = newMode;
    await loadOpenTrades();
    showToastMessage(`Switched to ${newMode} mode`, "success");
  } catch (error) {
    showToastMessage("Failed to switch mode", "error");
  }
}
```

### Usage

```vue
<template>
  <div id="app">
    <TradingDashboard />
  </div>
</template>
```

---

## ActiveTrades

**File**: `frontend/src/components/ActiveTrades.vue`

### Purpose

Displays all open positions with real-time P&L, risk metrics, and position management controls.

### Key Features

- Real-time profit/loss tracking
- R-multiple visualization with progress bars
- Position management (edit, close, delete)
- Risk warnings and indicators
- Auto-refresh market data

### Props

```javascript
const props = defineProps({
  trades: {
    type: Array,
    required: true,
  },
  riskSettings: {
    type: Object,
    required: true,
  },
  tradingMode: {
    type: String,
    required: true,
    validator: (value) => ["DAY", "SWING"].includes(value),
  },
});
```

### Emits

```javascript
const emit = defineEmits([
  "close-trade", // (tradeId, exitPrice, additionalData)
  "edit-trade", // (trade)
  "delete-trade", // (tradeId)
  "refresh", // ()
]);
```

### State

```javascript
const showRInDollars = ref(true);
const closingTradeId = ref(null);
const closePrice = ref("");
const customCloseDate = ref("");
const autoRefresh = ref(true);
const refreshInterval = ref(null);
```

### Computed Properties

#### `sortedTrades`

Sorts trades by entry time (newest first).

#### `tradesWithMetrics`

Calculates real-time metrics for each trade:

- Current P&L
- R-multiple
- Risk percentage
- Target prices
- Progress position

```javascript
const tradesWithMetrics = computed(() => {
  return sortedTrades.value.map((trade) => {
    const currentPrice = trade.currentPrice || trade.entryPrice;
    const pnl = calculateProfitLoss(
      trade.type,
      trade.entryPrice,
      currentPrice,
      trade.quantity
    );
    const rMultiple = calculateRMultiple(pnl, trade.riskAmount);
    // ... more calculations
    return { ...trade, pnl, rMultiple /* ... */ };
  });
});
```

### Key Methods

#### `handleCloseTrade(trade)`

Opens close trade dialog with pre-filled current price.

#### `confirmClose()`

Validates and submits trade closure with tax and margin calculations.

```javascript
async function confirmClose() {
  const exitPrice = parseFloat(closePrice.value);
  if (!exitPrice || exitPrice <= 0) {
    alert("Please enter a valid exit price");
    return;
  }

  const trade = trades.value.find((t) => t.id === closingTradeId.value);
  const additionalData = {
    taxAmount: calculateTaxAmount(/* ... */),
    marginInterest: calculateMarginInterest(/* ... */),
    closeDate: customCloseDate.value || undefined,
  };

  emit("close-trade", closingTradeId.value, exitPrice, additionalData);
  closingTradeId.value = null;
}
```

#### `startAutoRefresh()`

Starts automatic market data refresh every 30 seconds.

### Visual Features

- **Progress Bars**: Show position between stop loss and targets
- **Color Coding**: Green (profit), red (loss), gray (breakeven)
- **Risk Indicators**: Visual warnings for high risk positions
- **R-Multiple Display**: Toggle between $ and R values

---

## TradeHistory

**File**: `frontend/src/components/TradeHistory.vue`

### Purpose

Displays closed trades with comprehensive performance analytics and statistics.

### Key Features

- Closed trade list with detailed metrics
- Performance statistics (win rate, average R, total P&L)
- Filtering and sorting
- Export capabilities (future)
- Tax and margin interest tracking

### Props

```javascript
const props = defineProps({
  trades: {
    type: Array,
    required: true,
  },
  riskSettings: {
    type: Object,
    required: true,
  },
});
```

### Emits

```javascript
const emit = defineEmits([
  "delete-trade", // (tradeId)
]);
```

### State

```javascript
const showRInDollars = ref(true);
const sortBy = ref("exitTime");
const sortOrder = ref("desc");
const filterSymbol = ref("");
const filterType = ref("ALL");
```

### Computed Properties

#### `statistics`

Calculates aggregate performance metrics:

```javascript
const statistics = computed(() => {
  const wins = filteredTrades.value.filter((t) => t.profitLoss > 0);
  const losses = filteredTrades.value.filter((t) => t.profitLoss < 0);

  return {
    totalTrades: filteredTrades.value.length,
    winCount: wins.length,
    lossCount: losses.length,
    winRate: (wins.length / filteredTrades.value.length) * 100,
    totalPnL: filteredTrades.value.reduce((sum, t) => sum + t.profitLoss, 0),
    totalTax: filteredTrades.value.reduce(
      (sum, t) => sum + (t.taxAmount || 0),
      0
    ),
    totalMarginInterest: filteredTrades.value.reduce(
      (sum, t) => sum + (t.marginInterest || 0),
      0
    ),
    averageR:
      filteredTrades.value.reduce((sum, t) => {
        return sum + calculateRMultiple(t.profitLoss, t.riskAmount);
      }, 0) / filteredTrades.value.length,
  };
});
```

#### `filteredTrades`

Applies symbol and type filters to trade list.

#### `sortedTrades`

Sorts filtered trades by selected column and order.

### Key Methods

#### `formatDate(dateString)`

Formats ISO date to readable format.

#### `formatCurrency(value)`

Formats number as currency with $ sign.

#### `formatPercent(value)`

Formats number as percentage.

#### `formatR(value)`

Formats R-multiple with + sign for positive values.

### Visual Features

- **Statistics Cards**: Win rate, total P&L, average R
- **Trade Cards**: Detailed metrics for each closed trade
- **Color Coding**: Green (wins), red (losses)
- **Sorting Controls**: Sort by date, symbol, P&L, R-multiple
- **Filters**: Filter by symbol or trade type

---

## TradeForm

**File**: `frontend/src/components/TradeForm.vue`

### Purpose

Modal form for creating new trades or editing existing ones with automatic position sizing calculations.

### Key Features

- Create new trades
- Edit existing trades
- Automatic position sizing based on R-size
- Real-time risk calculations
- Target price calculations
- Form validation

### Props

```javascript
const props = defineProps({
  trade: {
    type: Object,
    default: null, // null for new trade, object for editing
  },
  riskSettings: {
    type: Object,
    required: true,
  },
  tradingMode: {
    type: String,
    required: true,
  },
});
```

### Emits

```javascript
const emit = defineEmits([
  "submit", // (tradeData)
  "cancel", // ()
]);
```

### State

```javascript
const formData = ref({
  symbol: "",
  type: "LONG",
  entryPrice: "",
  stopLoss: "",
  targetPrice1: "",
  targetPrice2: "",
  notes: "",
  rSize: props.riskSettings.defaultRSize,
});

const calculatedValues = ref({
  riskPerShare: 0,
  quantity: 0,
  positionValue: 0,
  riskAmount: 0,
});
```

### Computed Properties

#### `isEditing`

Returns true if editing an existing trade.

#### `formTitle`

Returns "Edit Trade" or "New Trade" based on mode.

### Key Methods

#### `calculatePosition()`

Automatically calculates position size and risk metrics when entry price or stop loss changes.

```javascript
function calculatePosition() {
  const entry = parseFloat(formData.value.entryPrice);
  const stop = parseFloat(formData.value.stopLoss);
  const rSize = parseFloat(formData.value.rSize);

  if (!entry || !stop || !rSize) return;

  const riskPerShare = calculateRiskPerShare(entry, stop);
  const quantity = calculatePositionSize(rSize, riskPerShare);
  const positionValue = calculatePositionValue(entry, quantity);
  const riskAmount = calculateTotalRisk(riskPerShare, quantity);

  calculatedValues.value = {
    riskPerShare,
    quantity,
    positionValue,
    riskAmount,
  };
}
```

#### `calculateTargets()`

Automatically calculates target prices based on R-multiples.

```javascript
function calculateTargets() {
  const entry = parseFloat(formData.value.entryPrice);
  const stop = parseFloat(formData.value.stopLoss);

  if (!entry || !stop) return;

  const riskPerShare = calculateRiskPerShare(entry, stop);
  formData.value.targetPrice1 = calculateTargetPrice(
    formData.value.type,
    entry,
    riskPerShare,
    1 // +1R
  );
  formData.value.targetPrice2 = calculateTargetPrice(
    formData.value.type,
    entry,
    riskPerShare,
    2 // +2R
  );
}
```

#### `handleSubmit()`

Validates and submits form data.

```javascript
function handleSubmit() {
  if (!validateForm()) return;

  const tradeData = {
    ...formData.value,
    quantity: calculatedValues.value.quantity,
    riskAmount: calculatedValues.value.riskAmount,
    tradingMode: props.tradingMode,
  };

  emit("submit", tradeData);
}
```

### Validation Rules

- Symbol: Required, uppercase
- Type: Required, LONG or SHORT
- Entry Price: Required, > 0
- Stop Loss: Required, > 0, different from entry
- Quantity: Auto-calculated, must be > 0
- R Size: Required, > 0

---

## SettingsModal

**File**: `frontend/src/components/SettingsModal.vue`

### Purpose

Modal for configuring risk management settings including limits, tax rates, and margin interest.

### Key Features

- Configure risk limits
- Set tax rates (state and federal)
- Set margin interest rate
- Real-time validation
- Persist settings to database

### Props

```javascript
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  currentSettings: {
    type: Object,
    required: true,
  },
});
```

### Emits

```javascript
const emit = defineEmits([
  "close", // ()
  "save", // (settings)
  "update-success", // (message)
]);
```

### State

```javascript
const settings = ref({
  maxDailyLoss: 2500,
  maxOpenRisk: 5000,
  maxOpenPositions: 5,
  defaultRSize: 2500,
  stateTaxRate: 9.2,
  federalTaxRate: 24,
  marginInterestRate: 8,
  enableAlerts: true,
});

const saving = ref(false);
```

### Computed Properties

#### `combinedTaxRate`

Calculates total tax rate.

```javascript
const combinedTaxRate = computed(() => {
  return settings.value.stateTaxRate + settings.value.federalTaxRate;
});
```

### Key Methods

#### `handleSave()`

Validates and saves settings.

```javascript
async function handleSave() {
  if (!validateSettings()) return;

  saving.value = true;
  try {
    await api.updateRiskSettings(settings.value);
    emit("save", settings.value);
    emit("update-success", "Settings saved successfully");
    emit("close");
  } catch (error) {
    alert("Failed to save settings");
  } finally {
    saving.value = false;
  }
}
```

#### `resetToDefaults()`

Resets all settings to default values.

### Settings Categories

1. **Risk Limits**

   - Max Daily Loss
   - Max Open Risk
   - Max Open Positions
   - Default R Size

2. **Tax Configuration**

   - State Tax Rate (%)
   - Federal Tax Rate (%)
   - Combined Rate (calculated)

3. **Margin Settings**

   - Margin Interest Rate (% APR)

4. **Alerts**
   - Enable/Disable Alerts

---

## ModeSelector

**File**: `frontend/src/components/ModeSelector.vue`

### Purpose

Toggle between DAY and SWING trading modes, and switch between production and development databases.

### Key Features

- Trading mode selection (DAY/SWING)
- Dev mode toggle
- Visual mode indicators
- Confirmation dialogs for mode switches

### Props

```javascript
const props = defineProps({
  currentMode: {
    type: String,
    required: true,
    validator: (value) => ["DAY", "SWING"].includes(value),
  },
  devMode: {
    type: Boolean,
    required: true,
  },
});
```

### Emits

```javascript
const emit = defineEmits([
  "switch-mode", // (newMode)
  "toggle-dev-mode", // (newDevMode)
]);
```

### Key Methods

#### `handleModeSwitch(newMode)`

Emits mode switch event with confirmation.

#### `handleDevModeToggle()`

Toggles development mode with warning.

### Visual States

- **DAY Mode**: Yellow indicator, "Daily risk tracking"
- **SWING Mode**: Blue indicator, "Open risk tracking"
- **Dev Mode**: Red badge, "DEVELOPMENT"
- **Prod Mode**: Green badge, "PRODUCTION"

---

## RiskSettings

**File**: `frontend/src/components/RiskSettings.vue`

### Purpose

Displays current risk metrics with visual indicators and warnings.

### Key Features

- Risk usage visualization
- Color-coded warnings
- Progress bars
- Risk capacity display

### Props

```javascript
const props = defineProps({
  totalRisk: {
    type: Number,
    required: true,
  },
  riskLimit: {
    type: Number,
    required: true,
  },
  tradingMode: {
    type: String,
    required: true,
  },
});
```

### Computed Properties

#### `riskPercentage`

Calculates risk as percentage of limit.

#### `riskWarning`

Returns warning level object with color and message.

```javascript
const riskWarning = computed(() => {
  return getRiskWarningLevel(riskPercentage.value);
});
```

### Visual Indicators

- **Safe (< 50%)**: Green, ✅
- **Caution (50-79%)**: Yellow, ⚠️
- **Warning (80-99%)**: Orange, 🔴
- **Danger (≥ 100%)**: Red, 🔴

---

## RToggle

**File**: `frontend/src/components/RToggle.vue`

### Purpose

Toggle button to switch between dollar ($) and R-multiple display formats.

### Key Features

- Simple toggle button
- Persistent state per component instance
- Visual active state

### Props

```javascript
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true, // true = show dollars, false = show R
  },
});
```

### Emits

```javascript
const emit = defineEmits([
  "update:modelValue", // (newValue)
]);
```

### Usage

```vue
<RToggle v-model="showRInDollars" />
```

---

## Toast

**File**: `frontend/src/components/Toast.vue`

### Purpose

Notification system for displaying success, error, and info messages.

### Key Features

- Auto-dismiss after timeout
- Multiple types (success, error, info, warning)
- Smooth animations
- Stacking support (future)

### Props

```javascript
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "success",
    validator: (value) =>
      ["success", "error", "info", "warning"].includes(value),
  },
  duration: {
    type: Number,
    default: 3000, // milliseconds
  },
  show: {
    type: Boolean,
    required: true,
  },
});
```

### Emits

```javascript
const emit = defineEmits([
  "close", // ()
]);
```

### Toast Types

- **success**: Green background, ✓ icon
- **error**: Red background, ✗ icon
- **info**: Blue background, ℹ icon
- **warning**: Yellow background, ⚠ icon

### Usage

```vue
<Toast
  :show="showToast"
  :message="toastMessage"
  :type="toastType"
  @close="showToast = false"
/>
```

---

## Best Practices

### Component Communication

1. **Props Down**: Pass data from parent to child via props
2. **Events Up**: Child components emit events to parent
3. **Avoid Prop Mutation**: Never mutate props directly
4. **Use v-model**: For two-way binding when appropriate

### State Management

1. **Local State**: Use `ref()` for component-specific state
2. **Computed Properties**: Use `computed()` for derived state
3. **Watchers**: Use `watch()` for side effects
4. **Lifecycle Hooks**: Use `onMounted()`, `onUnmounted()` for setup/cleanup

### Performance

1. **Computed Caching**: Leverage computed property caching
2. **v-if vs v-show**: Use v-if for conditional rendering, v-show for toggling
3. **Key Attributes**: Always use :key in v-for loops
4. **Debouncing**: Debounce expensive operations (search, filter)

### Accessibility

1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Labels**: Add aria-label for screen readers
3. **Keyboard Navigation**: Support tab navigation
4. **Focus Management**: Manage focus for modals and dialogs

---

**Last Updated**: January 2026

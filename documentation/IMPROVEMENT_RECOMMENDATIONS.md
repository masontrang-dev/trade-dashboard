# Improvement Recommendations

Technical debt analysis and recommended improvements for the Trade Dashboard application.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Critical Improvements](#critical-improvements)
- [High Priority](#high-priority)
- [Medium Priority](#medium-priority)
- [Low Priority](#low-priority)
- [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

The Trade Dashboard is a well-structured application with solid fundamentals. However, several key areas could benefit from modernization and best practices to improve maintainability, testability, and scalability.

### Current Strengths

✅ Clean separation of concerns (frontend/backend/shared)  
✅ Centralized calculation logic  
✅ RESTful API design  
✅ Vue 3 Composition API usage  
✅ Comprehensive documentation

### Areas for Improvement

⚠️ No state management library (prop drilling)  
⚠️ No input validation library  
⚠️ No unit tests  
⚠️ No UI component library  
⚠️ Mixed localStorage and database persistence  
⚠️ No error boundary handling  
⚠️ No logging framework

---

## Critical Improvements

### 1. State Management - Pinia

**Current Issue:**

- State is managed in `TradingDashboard.vue` and passed down via props
- Prop drilling through multiple component levels
- localStorage used as fallback/cache alongside database
- No single source of truth for application state

**Current Implementation:**

```javascript
// TradingDashboard.vue - 1200+ lines
const openTrades = ref([]);
const closedTrades = ref([]);
const riskSettings = ref({...});
// Passed to multiple children via props
```

**Recommended Solution: Pinia**

**Why Pinia:**

- Official Vue state management (replaces Vuex)
- TypeScript support
- Lightweight (~1kb)
- Composition API friendly
- DevTools integration
- SSR support (future-proof)

**Implementation:**

```javascript
// stores/trades.js
import { defineStore } from "pinia";
import api from "../services/api";

export const useTradesStore = defineStore("trades", {
  state: () => ({
    openTrades: [],
    closedTrades: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalOpenRisk: (state) => {
      return state.openTrades.reduce((sum, t) => sum + (t.riskAmount || 0), 0);
    },
    openTradeCount: (state) => state.openTrades.length,
  },

  actions: {
    async fetchOpenTrades() {
      this.loading = true;
      try {
        this.openTrades = await api.getOpenTrades();
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async closeTrade(tradeId, exitPrice, additionalData) {
      await api.closeTrade(tradeId, exitPrice, additionalData);
      await this.fetchOpenTrades();
      await this.fetchClosedTrades();
    },
  },
});

// stores/settings.js
export const useSettingsStore = defineStore("settings", {
  state: () => ({
    riskSettings: {
      maxDailyLoss: 2500,
      maxOpenRisk: 5000,
      defaultRSize: 2500,
      stateTaxRate: 9.2,
      federalTaxRate: 24,
      marginInterestRate: 8,
    },
    tradingMode: "SWING",
    devMode: false,
  }),

  actions: {
    async loadSettings() {
      const settings = await api.getRiskSettings();
      this.riskSettings = settings;

      const modeSettings = await api.getModeSettings();
      this.tradingMode = modeSettings.tradingMode;
      this.devMode = modeSettings.devMode;
    },

    async updateRiskSettings(newSettings) {
      await api.updateRiskSettings(newSettings);
      this.riskSettings = { ...this.riskSettings, ...newSettings };
    },
  },

  // Persist to localStorage as cache
  persist: {
    key: "trade-dashboard-settings",
    storage: localStorage,
    paths: ["tradingMode", "devMode"], // Only cache UI state
  },
});
```

**Usage in Components:**

```vue
<script setup>
import { useTradesStore } from "../stores/trades";
import { useSettingsStore } from "../stores/settings";

const tradesStore = useTradesStore();
const settingsStore = useSettingsStore();

// Direct access, no prop drilling
const openTrades = computed(() => tradesStore.openTrades);
const totalRisk = computed(() => tradesStore.totalOpenRisk);
</script>
```

**Benefits:**

- ✅ Eliminates prop drilling
- ✅ Single source of truth
- ✅ Better separation of concerns
- ✅ Easier testing
- ✅ DevTools debugging
- ✅ Automatic reactivity
- ✅ Built-in persistence plugin

**Effort:** Medium (2-3 days)  
**Impact:** High  
**Priority:** Critical

---

### 2. Input Validation - Zod or Joi

**Current Issue:**

- Manual validation scattered across components
- Inconsistent error messages
- No schema validation
- Backend validation is minimal

**Current Implementation:**

```javascript
// Manual validation in components
if (!symbol || !type || !quantity || !entryPrice) {
  return res.status(400).json({ error: "Missing required fields" });
}

if (!["LONG", "SHORT"].includes(type)) {
  return res.status(400).json({ error: "Type must be LONG or SHORT" });
}
```

**Recommended Solution: Zod (preferred) or Joi**

**Why Zod over Joi:**

- TypeScript-first (better type inference)
- Smaller bundle size
- Better error messages
- Works in browser and Node.js
- No dependencies

**Implementation:**

```javascript
// shared/schemas.js
import { z } from 'zod';

export const tradeSchema = z.object({
  symbol: z.string()
    .min(1, "Symbol is required")
    .max(10, "Symbol too long")
    .regex(/^[A-Z]+$/, "Symbol must be uppercase letters"),

  type: z.enum(['LONG', 'SHORT'], {
    errorMap: () => ({ message: "Type must be LONG or SHORT" })
  }),

  quantity: z.number()
    .positive("Quantity must be positive")
    .int("Quantity must be a whole number"),

  entryPrice: z.number()
    .positive("Entry price must be positive")
    .max(1000000, "Entry price too high"),

  stopLoss: z.number()
    .positive("Stop loss must be positive")
    .optional(),

  targetPrice1: z.number()
    .positive("Target 1 must be positive")
    .optional(),

  targetPrice2: z.number()
    .positive("Target 2 must be positive")
    .optional(),

  notes: z.string()
    .max(1000, "Notes too long")
    .optional(),

  riskAmount: z.number()
    .nonnegative("Risk amount cannot be negative")
    .optional(),

  rSize: z.number()
    .positive("R size must be positive")
    .optional()
}).refine(
  (data) => !data.stopLoss || data.stopLoss !== data.entryPrice,
  { message: "Stop loss must be different from entry price" }
);

export const riskSettingsSchema = z.object({
  maxDailyLoss: z.number().positive().max(1000000),
  maxOpenRisk: z.number().positive().max(1000000),
  maxOpenPositions: z.number().int().positive().max(100),
  defaultRSize: z.number().positive().max(100000),
  stateTaxRate: z.number().min(0).max(100),
  federalTaxRate: z.number().min(0).max(100),
  marginInterestRate: z.number().min(0).max(100),
  enableAlerts: z.boolean()
});

export const closeTrade Schema = z.object({
  exitPrice: z.number().positive("Exit price must be positive"),
  taxAmount: z.number().nonnegative().optional(),
  marginInterest: z.number().nonnegative().optional(),
  closeDate: z.string().datetime().optional()
});
```

**Backend Usage:**

```javascript
// routes/trades.js
const { tradeSchema } = require("../../shared/schemas");

router.post("/", async (req, res) => {
  try {
    // Validate request body
    const validatedData = tradeSchema.parse(req.body);

    const newTrade = await Trade.create(validatedData);
    res.status(201).json(newTrade);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    res.status(500).json({ error: error.message });
  }
});
```

**Frontend Usage:**

```vue
<script setup>
import { tradeSchema } from "../../shared/schemas";

function validateForm() {
  try {
    tradeSchema.parse(formData.value);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors.reduce((acc, e) => {
        acc[e.path[0]] = e.message;
        return acc;
      }, {}),
    };
  }
}

function handleSubmit() {
  const validation = validateForm();
  if (!validation.valid) {
    fieldErrors.value = validation.errors;
    return;
  }
  // Submit...
}
</script>
```

**Benefits:**

- ✅ Consistent validation across frontend/backend
- ✅ Type-safe schemas
- ✅ Better error messages
- ✅ Reusable validation logic
- ✅ Automatic TypeScript types
- ✅ Runtime type checking

**Effort:** Medium (2-3 days)  
**Impact:** High  
**Priority:** Critical

---

### 3. Unit Testing - Vitest

**Current Issue:**

- Zero test coverage
- No confidence in refactoring
- Manual testing only
- Calculation errors could go unnoticed

**Recommended Solution: Vitest**

**Why Vitest:**

- Built for Vite (already using)
- Jest-compatible API
- Fast (uses Vite's transform pipeline)
- ESM and TypeScript support
- Vue component testing support

**Implementation:**

```javascript
// shared/tradeCalculations.test.js
import { describe, it, expect } from "vitest";
import {
  calculateRiskPerShare,
  calculatePositionSize,
  calculateProfitLoss,
  calculateRMultiple,
  calculateTaxAmount,
  calculateMarginInterest,
} from "./tradeCalculations";

describe("Trade Calculations", () => {
  describe("calculateRiskPerShare", () => {
    it("calculates risk for LONG trade", () => {
      expect(calculateRiskPerShare(150, 145)).toBe(5);
    });

    it("calculates risk for SHORT trade", () => {
      expect(calculateRiskPerShare(150, 155)).toBe(5);
    });

    it("handles zero values", () => {
      expect(calculateRiskPerShare(0, 145)).toBe(0);
      expect(calculateRiskPerShare(150, 0)).toBe(0);
    });
  });

  describe("calculatePositionSize", () => {
    it("calculates correct share count", () => {
      expect(calculatePositionSize(2500, 5)).toBe(500);
    });

    it("floors to whole shares", () => {
      expect(calculatePositionSize(2500, 4.7)).toBe(531);
    });

    it("handles zero risk per share", () => {
      expect(calculatePositionSize(2500, 0)).toBe(0);
    });
  });

  describe("calculateProfitLoss", () => {
    it("calculates LONG profit", () => {
      expect(calculateProfitLoss("LONG", 150, 160, 500)).toBe(5000);
    });

    it("calculates LONG loss", () => {
      expect(calculateProfitLoss("LONG", 150, 145, 500)).toBe(-2500);
    });

    it("calculates SHORT profit", () => {
      expect(calculateProfitLoss("SHORT", 150, 145, 500)).toBe(2500);
    });

    it("calculates SHORT loss", () => {
      expect(calculateProfitLoss("SHORT", 150, 155, 500)).toBe(-2500);
    });
  });

  describe("calculateTaxAmount", () => {
    it("calculates tax on profit", () => {
      expect(calculateTaxAmount(5000, 9.2, 24)).toBe(1660);
    });

    it("returns 0 for losses", () => {
      expect(calculateTaxAmount(-2500, 9.2, 24)).toBe(0);
    });

    it("returns 0 for breakeven", () => {
      expect(calculateTaxAmount(0, 9.2, 24)).toBe(0);
    });
  });

  describe("calculateMarginInterest", () => {
    it("calculates interest for multi-day hold", () => {
      expect(calculateMarginInterest(75000, 8, 5)).toBe(83.33);
    });

    it("returns 0 for same-day trade", () => {
      expect(calculateMarginInterest(75000, 8, 1)).toBe(0);
    });

    it("returns 0 for 0 days", () => {
      expect(calculateMarginInterest(75000, 8, 0)).toBe(0);
    });
  });
});

// backend/models/Trade.test.js
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Trade from "./Trade";
import { getDb } from "./database";

describe("Trade Model", () => {
  beforeEach(async () => {
    // Setup test database
  });

  afterEach(async () => {
    // Cleanup
  });

  it("creates a trade", async () => {
    const trade = await Trade.create({
      symbol: "AAPL",
      type: "LONG",
      quantity: 100,
      entryPrice: 150,
      stopLoss: 145,
    });

    expect(trade.id).toBeDefined();
  });

  it("closes a trade with calculations", async () => {
    const trade = await Trade.create({
      symbol: "AAPL",
      type: "LONG",
      quantity: 100,
      entryPrice: 150,
      stopLoss: 145,
      riskAmount: 500,
    });

    const result = await Trade.close(trade.id, 160);

    expect(result.pnl).toBe(1000);
    expect(result.rMultiple).toBe(2);
  });
});

// frontend/src/components/TradeForm.test.js
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TradeForm from "./TradeForm.vue";

describe("TradeForm", () => {
  it("renders form fields", () => {
    const wrapper = mount(TradeForm, {
      props: {
        riskSettings: { defaultRSize: 2500 },
        tradingMode: "SWING",
      },
    });

    expect(wrapper.find('input[placeholder="Symbol"]').exists()).toBe(true);
  });

  it("calculates position size automatically", async () => {
    const wrapper = mount(TradeForm, {
      props: {
        riskSettings: { defaultRSize: 2500 },
        tradingMode: "SWING",
      },
    });

    await wrapper.find('input[placeholder="Entry Price"]').setValue("150");
    await wrapper.find('input[placeholder="Stop Loss"]').setValue("145");

    // Should calculate 500 shares
    expect(wrapper.vm.calculatedValues.quantity).toBe(500);
  });
});
```

**Test Coverage Goals:**

- Shared calculations: 100%
- Backend models: 90%+
- Backend routes: 80%+
- Frontend components: 70%+
- Frontend services: 90%+

**Benefits:**

- ✅ Catch bugs before production
- ✅ Confidence in refactoring
- ✅ Documentation through tests
- ✅ Faster development (less manual testing)
- ✅ Regression prevention

**Effort:** High (1-2 weeks for comprehensive coverage)  
**Impact:** High  
**Priority:** Critical

---

## High Priority

### 4. UI Component Library - shadcn/vue or PrimeVue

**Current Issue:**

- Custom components for everything
- Inconsistent styling
- No accessibility features
- Reinventing the wheel

**Recommended: shadcn/vue**

**Why shadcn/vue:**

- Copy-paste components (not a dependency)
- Built on Radix Vue (accessibility)
- Tailwind CSS based
- Customizable
- Modern design
- TypeScript support

**Alternative: PrimeVue**

- More comprehensive
- Pre-built themes
- Commercial support
- Larger bundle size

**Implementation:**

```bash
npx shadcn-vue@latest init
npx shadcn-vue@latest add button
npx shadcn-vue@latest add dialog
npx shadcn-vue@latest add select
npx shadcn-vue@latest add input
npx shadcn-vue@latest add card
```

**Benefits:**

- ✅ Accessibility out of the box
- ✅ Consistent design system
- ✅ Less custom CSS
- ✅ Keyboard navigation
- ✅ ARIA attributes
- ✅ Mobile responsive

**Effort:** Medium (1 week)  
**Impact:** Medium  
**Priority:** High

---

### 5. Error Boundary & Logging

**Current Issue:**

- Errors crash the entire app
- Console.log for debugging
- No error tracking
- Poor user experience on errors

**Recommended Solution:**

```javascript
// composables/useErrorHandler.js
import { ref } from 'vue';

const globalError = ref(null);

export function useErrorHandler() {
  function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);

    // Log to external service (future)
    // logToSentry(error, context);

    globalError.value = {
      message: error.message,
      context,
      timestamp: new Date()
    };

    // Auto-clear after 5 seconds
    setTimeout(() => {
      globalError.value = null;
    }, 5000);
  }

  return {
    globalError,
    handleError
  };
}

// components/ErrorBoundary.vue
<template>
  <div v-if="error" class="error-boundary">
    <h2>Something went wrong</h2>
    <p>{{ error.message }}</p>
    <button @click="reset">Try Again</button>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';

const error = ref(null);

onErrorCaptured((err) => {
  error.value = err;
  return false; // Prevent propagation
});

function reset() {
  error.value = null;
}
</script>
```

**Logging Service:**

```javascript
// services/logger.js
class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(level, message, data = {}) {
    const entry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    console[level](message, data);

    // Send to external service (future)
    // this.sendToService(entry);
  }

  info(message, data) {
    this.log("info", message, data);
  }

  warn(message, data) {
    this.log("warn", message, data);
  }

  error(message, data) {
    this.log("error", message, data);
  }

  getLogs() {
    return this.logs;
  }
}

export default new Logger();
```

**Benefits:**

- ✅ Graceful error handling
- ✅ Better debugging
- ✅ Error tracking
- ✅ User-friendly errors

**Effort:** Low (2-3 days)  
**Impact:** Medium  
**Priority:** High

---

## Medium Priority

### 6. TypeScript Migration

**Current Issue:**

- No type safety
- Runtime errors
- Poor IDE support
- Refactoring is risky

**Recommended: Gradual TypeScript adoption**

Start with:

1. Shared calculations (`.ts`)
2. API service (`.ts`)
3. Stores (`.ts`)
4. Components (`.vue` with `<script setup lang="ts">`)

**Benefits:**

- ✅ Type safety
- ✅ Better IDE support
- ✅ Catch errors at compile time
- ✅ Self-documenting code

**Effort:** High (2-3 weeks)  
**Impact:** Medium  
**Priority:** Medium

---

### 7. API Rate Limiting & Caching

**Current Issue:**

- Basic rate limiting
- Simple cache implementation
- No cache invalidation strategy

**Recommended:**

- Implement Redis for caching (if scaling)
- Add rate limiting middleware (express-rate-limit)
- Implement cache-control headers

**Effort:** Medium (1 week)  
**Impact:** Low  
**Priority:** Medium

---

### 8. Environment Configuration

**Current Issue:**

- Hardcoded API URL in frontend
- Limited environment variables

**Recommended:**

```javascript
// frontend/.env.development
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENABLE_DEVTOOLS=true

// frontend/.env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_ENABLE_DEVTOOLS=false

// frontend/src/config.js
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  enableDevTools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true'
};
```

**Effort:** Low (1 day)  
**Impact:** Low  
**Priority:** Medium

---

## Low Priority

### 9. Performance Optimizations

- Virtual scrolling for large trade lists
- Lazy loading components
- Image optimization
- Bundle size optimization

**Effort:** Medium  
**Impact:** Low  
**Priority:** Low

---

### 10. Internationalization (i18n)

- Multi-language support
- Currency formatting
- Date/time localization

**Effort:** Medium  
**Impact:** Low  
**Priority:** Low

---

## Implementation Roadmap

### Version 2.0 - Foundation (Q1 2026: 6-8 weeks)

**Priority: Critical**  
**Focus:** Technical improvements and stability

#### v2.0.1 - State Management (Week 1-2)

- Install Pinia
- Create stores (trades, settings, ui, analytics)
- Migrate TradingDashboard state
- Remove localStorage dependency (keep only as UI cache)
- Update all components
- Implement proper error handling in stores

#### v2.0.2 - Validation & Testing (Week 3-5)

- Install Zod
- Create validation schemas
- Implement backend validation middleware
- Implement frontend form validation
- Setup Vitest testing framework
- Write calculation tests (100% coverage)
- Write model tests (90% coverage)
- Write API tests (80% coverage)
- Write component tests (70% coverage)
- Setup CI/CD pipeline for tests

#### v2.0.3 - UI Enhancement (Week 6-7)

- Integrate shadcn/vue or PrimeVue
- Migrate to component library
- Implement error boundaries
- Add logging service
- Improve accessibility (ARIA labels, keyboard nav)
- Add loading skeletons
- Improve mobile responsiveness
- Add dark mode support

### Version 2.1 - Analytics (Q2 2026: 4-6 weeks)

**Priority: High**  
**Focus:** Performance insights and data analysis

#### v2.1.1 - Advanced Analytics Dashboard (Week 8-9)

- Implement performance metrics (win rate, profit factor, expectancy)
- Add time-based analysis (daily/weekly/monthly P&L)
- Create risk analysis views
- Build visual charts (equity curve, R-multiple distribution)

#### v2.1.2 - Trade Journaling (Week 10-11)

- Add rich text notes with markdown support
- Implement trade review system
- Create journal search & filter functionality
- Add journal templates

#### v2.1.3 - Data Export & Reporting (Week 12)

- Export formats (CSV, Excel, PDF, JSON)
- Custom reports (monthly, tax, risk management)
- Scheduled reports (optional)

### Version 2.2 - Automation (Q2-Q3 2026: 4-6 weeks)

**Priority: High**  
**Focus:** Alerts, automation, and efficiency

#### v2.2.1 - Alerts & Notifications (Week 13-14)

- Price alerts (target reached, stop loss hit)
- Risk alerts (daily loss limit, max open risk)
- Performance alerts (streaks, targets)
- Notification channels (browser, email, desktop)

#### v2.2.2 - Watchlists & Pre-Trade Planning (Week 15)

- Watchlist management
- Pre-trade calculator
- Trade templates

#### v2.2.3 - Auto-Calculations & Smart Features (Week 16)

- Smart position sizing
- Auto stop loss adjustment
- Quick actions and batch operations

### Version 3.0 - Advanced Features (Q3-Q4 2026: 8-10 weeks)

**Priority: Medium**  
**Focus:** Multi-account, portfolio, and advanced analytics

#### v3.0.1 - Multiple Accounts & Portfolio View (Week 17-19)

- Account management
- Portfolio dashboard
- Account switching

#### v3.0.2 - Strategy Backtesting (Week 20-22)

- Historical data import
- Strategy definition
- Backtest engine
- Results analysis

#### v3.0.3 - Mobile Application (Week 23-26)

- Mobile web app (PWA)
- Mobile features
- Native apps (future consideration)

### Version 3.1 - Professional Tools (2027: 12+ weeks)

**Priority: Low**  
**Focus:** Professional trader features

#### Additional Enhancements (Optional)

- TypeScript migration (if desired)
- Performance optimizations
- Internationalization (i18n)
- Advanced features (see FEATURE_ROADMAP.md for details)

---

## localStorage vs Database Decision

### Current State

- **Database**: Primary data storage (trades, settings)
- **localStorage**: Fallback cache + UI state

### Recommendation: **Remove localStorage entirely, use Pinia with persistence**

**Rationale:**

1. **Single Source of Truth**: Database is authoritative
2. **Consistency**: Avoid sync issues between localStorage and DB
3. **Pinia Persistence**: Built-in plugin handles caching elegantly
4. **Offline Support**: Can be added later with proper service worker

**Migration Strategy:**

```javascript
// stores/settings.js with Pinia
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    // Only cache UI preferences, not data
    uiPreferences: useStorage("ui-prefs", {
      showRInDollars: true,
      theme: "light",
      expandedSections: [],
    }),
  }),

  actions: {
    async loadFromDatabase() {
      // Always fetch from database
      const settings = await api.getRiskSettings();
      this.riskSettings = settings;
    },
  },
});
```

**What to Cache:**

- ✅ UI preferences (R toggle state, theme, expanded sections)
- ✅ Last selected trading mode (for quick load)
- ❌ Trade data (always from database)
- ❌ Risk settings (always from database)
- ❌ Calculated values (always compute fresh)

---

## Summary

### Must-Have (Critical)

1. **Pinia** - State management
2. **Zod** - Input validation
3. **Vitest** - Unit testing

### Should-Have (High)

4. **shadcn/vue** - UI components
5. **Error Boundaries** - Error handling
6. **Logging Service** - Debugging

### Nice-to-Have (Medium)

7. **TypeScript** - Type safety
8. **Rate Limiting** - API protection
9. **Environment Config** - Deployment flexibility

### Future (Low)

10. **Performance** - Virtual scrolling, lazy loading
11. **i18n** - Internationalization

---

**Estimated Total Effort:** 6-8 weeks for Critical + High priority items  
**Recommended Start:** Pinia → Zod → Vitest → UI Library

---

**Last Updated**: January 2026

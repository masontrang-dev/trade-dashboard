# Version 2.0 Implementation Plan

**Project:** Trade Dashboard  
**Version:** 2.0 - Foundation  
**Timeline:** Q1 2026 (6-8 weeks)  
**Focus:** Technical improvements and stability

---

## 🎯 Implementation Status

**Last Updated:** January 8, 2026 - 6:35 PM PST

### v2.0.1 - State Management: 100% Complete (8/8 stories) ✅

| Story                                   | Status      | Story Points |
| --------------------------------------- | ----------- | ------------ |
| 1.1: Setup Pinia Infrastructure         | ✅ Complete | 2            |
| 1.2: Create Trades Store                | ✅ Complete | 5            |
| 1.3: Create Settings Store              | ✅ Complete | 3            |
| 1.4: Create UI Store                    | ✅ Complete | 2            |
| 1.5: Create Analytics Store             | ✅ Complete | 3            |
| 1.6: Migrate TradingDashboard Component | ✅ Complete | 3            |
| 1.7: Update All Child Components        | ✅ Complete | 2            |
| 1.8: Remove localStorage Dependencies   | ✅ Complete | 1            |

**Completed:** 21/21 story points  
**Remaining:** 0/21 story points

### v2.0.2 - Validation & Testing: 100% Complete (10/10 stories) ✅

| Story                                  | Status      | Story Points |
| -------------------------------------- | ----------- | ------------ |
| 2.1: Setup Zod Validation              | ✅ Complete | 2            |
| 2.2: Create Trade Validation Schema    | ✅ Complete | 3            |
| 2.3: Create Settings Validation Schema | ✅ Complete | 2            |
| 2.4: Backend Validation Middleware     | ✅ Complete | 3            |
| 2.5: Frontend Form Validation          | ✅ Complete | 3            |
| 2.6: Setup Vitest Framework            | ✅ Complete | 3            |
| 2.7: Write Calculation Tests (100%)    | ✅ Complete | 5            |
| 2.8: Write Model Tests (90%)           | ✅ Complete | 8            |
| 2.9: Write API Route Tests (80%)       | ✅ Complete | 8            |
| 2.10: Write Component Tests (70%)      | ✅ Complete | 8            |

**Completed:** 45/45 story points  
**Remaining:** 0/45 story points  
**Tests:** 109+ passing

### v2.0.3 - UI Enhancement: In Progress (7/9 stories complete)

**Status:** Stories 3.1-3.4 completed + Additional migrations

| Story                                              | Status      | Story Points |
| -------------------------------------------------- | ----------- | ------------ |
| 3.1: Setup shadcn/vue                              | ✅ Complete | 2            |
| 3.2: Install Core Components                       | ✅ Complete | 2            |
| 3.3: Migrate TradeForm to shadcn                   | ✅ Complete | 3            |
| 3.4: Migrate ActiveTrades & TradeHistory to shadcn | ✅ Complete | 2            |
| 3.5: Implement Error Boundaries                    | ⏳ Pending  | 3            |
| 3.6: Implement Logging Service                     | ⏳ Pending  | 2            |
| 3.7: Implement Dark Mode                           | ⏳ Pending  | 3            |
| 3.8: Improve Mobile Responsiveness                 | ⏳ Pending  | 3            |
| 3.9: Add Loading Skeletons                         | ⏳ Pending  | 2            |

**Completed:** 14/22 story points  
**Remaining:** 8/22 story points

**Additional Migrations (Bonus):**

- ✅ TradingDashboard.vue migrated to shadcn Button and Badge
- ✅ SettingsModal.vue migrated to shadcn Button, Input, and Badge
- ✅ Toast.vue removed and replaced with shadcn Sonner
- ✅ Sonner integrated into App.vue and UI store

---

## Table of Contents

- [Overview](#overview)
- [Success Criteria](#success-criteria)
- [Sprint Breakdown](#sprint-breakdown)
- [v2.0.1 - State Management](#v201---state-management)
- [v2.0.2 - Validation & Testing](#v202---validation--testing)
- [v2.0.3 - UI Enhancement](#v203---ui-enhancement)
- [Dependencies & Risks](#dependencies--risks)
- [Testing Strategy](#testing-strategy)
- [Rollout Plan](#rollout-plan)

---

## Overview

Version 2.0 establishes a solid technical foundation for the Trade Dashboard by implementing modern state management, comprehensive validation, robust testing, and an enhanced UI component library. This version focuses on eliminating technical debt and setting up the application for future feature development.

### Goals

1. **Eliminate Prop Drilling** - Implement Pinia for centralized state management
2. **Ensure Data Integrity** - Add Zod validation across frontend and backend
3. **Establish Quality Standards** - Achieve 80%+ test coverage with Vitest
4. **Modernize UI** - Integrate shadcn/vue component library
5. **Improve Developer Experience** - Better debugging, error handling, and tooling

### Key Metrics

- **Test Coverage:** 80%+ overall (100% for calculations)
- **Performance:** < 2s page load time
- **Code Quality:** Zero critical bugs, zero prop drilling
- **Accessibility:** WCAG 2.1 AA compliance
- **Bundle Size:** < 500KB (gzipped)

---

## Success Criteria

### Technical Requirements

- ✅ All state managed through Pinia stores
- ✅ All API inputs validated with Zod schemas
- ✅ 80%+ test coverage across codebase
- ✅ All components use shadcn/vue library
- ✅ Error boundaries implemented
- ✅ Logging service operational
- ✅ Dark mode support
- ✅ Mobile responsive design

### Quality Gates

- ✅ All tests passing in CI/CD
- ✅ No TypeScript/ESLint errors
- ✅ Lighthouse score > 90
- ✅ Zero accessibility violations
- ✅ All existing features working
- ✅ No performance regressions

---

## Sprint Breakdown

### Sprint 1: State Management (Week 1-2)

**Focus:** Pinia implementation  
**Stories:** 8 cards  
**Story Points:** 21

### Sprint 2: Validation (Week 3)

**Focus:** Zod validation  
**Stories:** 6 cards  
**Story Points:** 13

### Sprint 3: Testing Foundation (Week 4-5)

**Focus:** Vitest setup and core tests  
**Stories:** 10 cards  
**Story Points:** 34

### Sprint 4: UI Enhancement (Week 6-7)

**Focus:** shadcn/vue and polish  
**Stories:** 9 cards  
**Story Points:** 21

**Total:** 33 stories, 89 story points

---

## v2.0.1 - State Management

**Duration:** Week 1-2 (2 weeks)  
**Priority:** Critical

### Epic: Implement Pinia State Management

Replace prop drilling with centralized state management using Pinia.

---

### Story 1.1: Setup Pinia Infrastructure

**Priority:** P0 - Critical  
**Story Points:** 2  
**Assignee:** TBD

#### Description

Install and configure Pinia as the state management solution for the application.

#### Acceptance Criteria

- [x] Pinia installed via npm (`pinia@^2.1.0`)
- [x] Pinia plugin registered in `main.js`
- [x] DevTools integration working
- [x] Store directory structure created (`/stores`)
- [x] TypeScript types configured (if using TS)

#### Tasks

- [x] Run `npm install pinia`
- [x] Create `/frontend/src/stores` directory
- [x] Update `main.js` to include Pinia plugin
- [x] Test DevTools integration in browser
- [x] Create `stores/index.js` for store exports

#### Technical Notes

```javascript
// main.js
import { createPinia } from "pinia";
const pinia = createPinia();
app.use(pinia);
```

#### Definition of Done

- Pinia is installed and configured
- DevTools shows Pinia tab
- No console errors
- Documentation updated

---

### Story 1.2: Create Trades Store

**Priority:** P0 - Critical  
**Story Points:** 5  
**Assignee:** TBD

#### Description

Create a Pinia store to manage all trade-related state (open trades, closed trades, loading states).

#### Acceptance Criteria

- [x] `stores/trades.js` created with state, getters, actions
- [x] State includes: `openTrades`, `closedTrades`, `loading`, `error`
- [x] Getters include: `totalOpenRisk`, `openTradeCount`, `closedTradeCount`
- [x] Actions include: `fetchOpenTrades`, `fetchClosedTrades`, `addTrade`, `closeTrade`, `updateTrade`, `deleteTrade`
- [x] All API calls moved from components to store actions
- [x] Error handling implemented in all actions

#### Tasks

- [x] Create `stores/trades.js` file
- [x] Define state properties
- [x] Implement getters for computed values
- [x] Implement `fetchOpenTrades()` action
- [x] Implement `fetchClosedTrades()` action
- [x] Implement `addTrade(tradeData)` action
- [x] Implement `closeTrade(tradeId, exitData)` action
- [x] Implement `updateTrade(tradeId, updates)` action
- [x] Implement `deleteTrade(tradeId)` action
- [x] Add error handling with try-catch
- [x] Add loading state management

#### Technical Notes

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
    closedTradeCount: (state) => state.closedTrades.length,
  },

  actions: {
    async fetchOpenTrades() {
      this.loading = true;
      this.error = null;
      try {
        this.openTrades = await api.getOpenTrades();
      } catch (error) {
        this.error = error.message;
        console.error("Failed to fetch open trades:", error);
      } finally {
        this.loading = false;
      }
    },
    // ... other actions
  },
});
```

#### Definition of Done

- Store created and tested
- All CRUD operations working
- Error handling in place
- DevTools shows state updates
- No prop drilling for trade data

---

### Story 1.3: Create Settings Store

**Priority:** P0 - Critical  
**Story Points:** 3  
**Assignee:** TBD

#### Description

Create a Pinia store to manage application settings (risk settings, trading mode, dev mode).

#### Acceptance Criteria

- [x] `stores/settings.js` created
- [x] State includes: `riskSettings`, `tradingMode`, `devMode`
- [x] Actions include: `loadSettings`, `updateRiskSettings`, `setTradingMode`, `toggleDevMode`
- [x] Persistence plugin configured for UI preferences only
- [x] Settings loaded on app initialization

#### Tasks

- [x] Create `stores/settings.js` file
- [x] Define state with default values
- [x] Implement `loadSettings()` action
- [x] Implement `updateRiskSettings(newSettings)` action
- [x] Implement `setTradingMode(mode)` action
- [x] Implement `toggleDevMode()` action
- [x] Configure Pinia persistence plugin
- [x] Add settings to app initialization

#### Technical Notes

```javascript
// stores/settings.js
import { defineStore } from "pinia";
import api from "../services/api";

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
  },

  persist: {
    key: "trade-dashboard-settings",
    storage: localStorage,
    paths: ["tradingMode", "devMode"], // Only cache UI state
  },
});
```

#### Definition of Done

- Settings store working
- Persistence configured
- All settings accessible
- No localStorage in components

---

### Story 1.4: Create UI Store

**Priority:** P1 - High  
**Story Points:** 2  
**Assignee:** TBD

#### Description

Create a Pinia store to manage UI state (modals, toasts, loading overlays, expanded sections).

#### Acceptance Criteria

- [x] `stores/ui.js` created
- [x] State includes: `showRInDollars`, `expandedSections`, `activeModal`, `toasts`
- [x] Actions include: `toggleRDisplay`, `toggleSection`, `showModal`, `hideModal`, `addToast`, `removeToast`
- [x] Toast auto-dismiss functionality
- [x] Persistence for UI preferences

#### Tasks

- [x] Create `stores/ui.js` file
- [x] Define UI state properties
- [x] Implement toggle actions
- [x] Implement modal management
- [x] Implement toast system
- [x] Add auto-dismiss for toasts
- [x] Configure persistence

#### Definition of Done

- UI store functional
- Toasts working
- Modal management working
- Preferences persisted

---

### Story 1.5: Create Analytics Store

**Priority:** P2 - Medium  
**Story Points:** 3  
**Assignee:** TBD

#### Description

Create a Pinia store for analytics calculations and metrics (foundation for v2.1).

#### Acceptance Criteria

- [x] `stores/analytics.js` created
- [x] Getters include: `winRate`, `profitFactor`, `expectancy`, `totalPnL`
- [x] Time range filter support
- [x] Computed metrics from closed trades

#### Tasks

- [x] Create `stores/analytics.js` file
- [x] Implement win rate calculation
- [x] Implement profit factor calculation
- [x] Implement expectancy calculation
- [x] Add time range filtering
- [x] Connect to trades store

#### Definition of Done

- Analytics store created
- Basic metrics calculating
- Ready for v2.1 expansion

---

### Story 1.6: Migrate TradingDashboard Component

**Priority:** P0 - Critical  
**Story Points:** 3  
**Assignee:** TBD

#### Description

Refactor `TradingDashboard.vue` to use Pinia stores instead of local state and props.

#### Acceptance Criteria

- [x] All `ref()` state moved to stores
- [x] All props removed from child components
- [x] Store composables used: `useTradesStore()`, `useSettingsStore()`, `useUIStore()`
- [x] Component size reduced by 50%+
- [x] All functionality still working

#### Tasks

- [x] Import store composables
- [x] Replace local state with store state
- [x] Remove prop definitions
- [x] Update template to use store data
- [x] Remove prop passing to children
- [x] Test all features
- [x] Verify no regressions

#### Definition of Done

- No local state in TradingDashboard
- No props passed to children
- All features working
- Component cleaner and smaller

---

### Story 1.7: Update All Child Components

**Priority:** P0 - Critical  
**Story Points:** 2  
**Assignee:** TBD

#### Description

Update all child components to consume data from Pinia stores instead of props.

#### Acceptance Criteria

- [x] All components import relevant stores
- [x] All prop definitions removed
- [x] All `emit` events updated to call store actions
- [x] Components: TradeForm, ActiveTrades, TradeHistory, RToggle updated

#### Tasks

- [x] Update TradeForm.vue - removed all props, now uses useSettingsStore(), useUIStore(), useTradesStore()
- [x] Update ActiveTrades.vue - removed props, uses stores for trades and settings
- [x] Update TradeHistory.vue - removed props, uses stores for closed trades
- [x] Update RToggle.vue - removed localStorage, uses useUIStore()
- [x] Remove unused props from all components
- [x] Test each component

#### Definition of Done

- ✅ All components using stores
- ✅ No prop drilling
- ✅ All functionality intact
- ✅ Centralized tradeCalculations used throughout

---

### Story 1.8: Remove localStorage Dependencies

**Priority:** P1 - High  
**Story Points:** 1  
**Assignee:** TBD

#### Description

Remove direct localStorage usage from components, keeping only Pinia persistence plugin.

#### Acceptance Criteria

- [x] No `localStorage.getItem()` in components
- [x] No `localStorage.setItem()` in components
- [x] Only Pinia persistence plugin uses localStorage
- [x] UI preferences still cached
- [x] Data always fetched from database

#### Tasks

- [x] Search codebase for `localStorage`
- [x] Remove localStorage calls from RToggle.vue
- [x] Verify Pinia persistence working (stores/settings.js and stores/ui.js)
- [x] Fix settings store to not call non-existent API endpoints
- [x] Document caching strategy

#### Definition of Done

- ✅ No direct localStorage usage in components
- ✅ Pinia persistence working (tradingMode, devMode, showRInDollars, expandedSections)
- ✅ UI preferences cached via Pinia plugin
- ✅ Data integrity maintained - risk settings fetched from database

---

## v2.0.2 - Validation & Testing

**Duration:** Week 3-5 (3 weeks)  
**Priority:** Critical

### Epic: Implement Validation & Testing

Add comprehensive validation with Zod and testing with Vitest.

---

### Story 2.1: Setup Zod Validation

**Priority:** P0 - Critical  
**Story Points:** 2  
**Assignee:** TBD

#### Description

Install Zod and create the validation schema infrastructure.

#### Acceptance Criteria

- [x] Zod installed (`zod@^3.22.0`)
- [x] `/shared/schemas.js` created
- [x] Schema export structure defined
- [x] TypeScript types generated (if using TS)

#### Tasks

- [x] Run `npm install zod`
- [x] Create `/shared/schemas.js` file
- [x] Setup schema export pattern
- [x] Test basic schema validation
- [x] Document schema usage

#### Definition of Done

- ✅ Zod installed
- ✅ Schema file structure ready
- ✅ Documentation created

---

### Story 2.2: Create Trade Validation Schema

**Priority:** P0 - Critical  
**Story Points:** 3  
**Assignee:** TBD

#### Description

Create comprehensive Zod schema for trade data validation.

#### Acceptance Criteria

- [x] `tradeSchema` validates all trade fields
- [x] Custom validation rules (e.g., stopLoss ≠ entryPrice)
- [x] Error messages are user-friendly
- [x] Schema handles optional fields
- [x] Schema validates LONG/SHORT types

#### Tasks

- [x] Define `tradeSchema` in schemas.js
- [x] Add validation for required fields
- [x] Add validation for optional fields
- [x] Add custom refinement rules
- [x] Add error message customization
- [x] Test schema with valid/invalid data

#### Technical Notes

```javascript
// shared/schemas.js
import { z } from "zod";

export const tradeSchema = z
  .object({
    symbol: z
      .string()
      .min(1, "Symbol is required")
      .max(10, "Symbol too long")
      .regex(/^[A-Z]+$/, "Symbol must be uppercase letters"),

    type: z.enum(["LONG", "SHORT"], {
      errorMap: () => ({ message: "Type must be LONG or SHORT" }),
    }),

    quantity: z
      .number()
      .positive("Quantity must be positive")
      .int("Quantity must be a whole number"),

    entryPrice: z.number().positive("Entry price must be positive"),

    stopLoss: z.number().positive("Stop loss must be positive").optional(),

    // ... other fields
  })
  .refine((data) => !data.stopLoss || data.stopLoss !== data.entryPrice, {
    message: "Stop loss must be different from entry price",
  });
```

#### Definition of Done

- ✅ Trade schema complete
- ✅ All validations working
- ✅ Error messages clear
- ✅ Tests passing

---

### Story 2.3: Create Settings Validation Schema

**Priority:** P0 - Critical  
**Story Points:** 2  
**Assignee:** TBD

#### Description

Create Zod schema for risk settings validation.

#### Acceptance Criteria

- [x] `riskSettingsSchema` validates all settings
- [x] Number ranges enforced
- [x] Percentage validation (0-100)
- [x] User-friendly error messages

#### Tasks

- [x] Define `riskSettingsSchema`
- [x] Add range validations
- [x] Add percentage validations
- [x] Test with edge cases

#### Definition of Done

- ✅ Settings schema complete
- ✅ Validations working
- ✅ Tests passing

---

### Story 2.4: Implement Backend Validation Middleware

**Priority:** P0 - Critical  
**Story Points:** 3  
**Assignee:** TBD

#### Description

Add Zod validation middleware to all backend API routes.

#### Acceptance Criteria

- [x] Validation middleware created
- [x] All POST/PUT routes use validation
- [x] Validation errors return 400 with details
- [x] Error format is consistent

#### Tasks

- [x] Create `middleware/validation.js`
- [x] Implement validation middleware function
- [x] Add middleware to trade routes
- [x] Add middleware to settings routes
- [x] Format error responses
- [x] Test with invalid data

#### Technical Notes

```javascript
// backend/middleware/validation.js
const { z } = require("zod");

function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
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
      next(error);
    }
  };
}

module.exports = { validate };
```

#### Definition of Done

- ✅ Middleware implemented
- ✅ All routes protected
- ✅ Error handling working
- ✅ Tests passing

---

### Story 2.5: Implement Frontend Form Validation

**Priority:** P0 - Critical  
**Story Points:** 3  
**Assignee:** TBD

#### Description

Add Zod validation to frontend forms before submission.

#### Acceptance Criteria

- [x] TradeForm validates before submit
- [x] SettingsPanel validates before save
- [x] Field-level error messages displayed
- [x] Form submission blocked if invalid
- [x] Real-time validation on blur (optional)

#### Tasks

- [x] Create validation composable
- [x] Add validation to TradeForm
- [x] Add validation to SettingsPanel
- [x] Display field errors
- [x] Prevent invalid submissions
- [x] Test user experience

#### Technical Notes

```javascript
// composables/useValidation.js
import { ref } from "vue";

export function useValidation(schema) {
  const errors = ref({});

  function validate(data) {
    try {
      schema.parse(data);
      errors.value = {};
      return { valid: true };
    } catch (error) {
      errors.value = error.errors.reduce((acc, e) => {
        acc[e.path[0]] = e.message;
        return acc;
      }, {});
      return { valid: false, errors: errors.value };
    }
  }

  return { errors, validate };
}
```

#### Definition of Done

- ✅ Forms validate before submit
- ✅ Errors displayed to user
- ✅ UX is smooth
- ✅ Tests passing

---

### Story 2.6: Setup Vitest Testing Framework

**Priority:** P0 - Critical  
**Story Points:** 3  
**Assignee:** TBD

#### Description

Install and configure Vitest for unit and integration testing.

#### Acceptance Criteria

- [x] Vitest installed (`vitest@^1.0.0`)
- [x] `@vue/test-utils` installed for component testing
- [x] `vitest.config.js` configured
- [x] Test scripts added to package.json
- [x] Coverage reporting configured
- [x] CI/CD integration ready

#### Tasks

- [x] Run `npm install -D vitest @vue/test-utils`
- [x] Create `vitest.config.js`
- [x] Configure test environment
- [x] Add test scripts to package.json
- [x] Setup coverage reporting
- [x] Create sample test
- [x] Run tests successfully

#### Technical Notes

```javascript
// vitest.config.js
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/"],
    },
  },
});
```

#### Definition of Done

- ✅ Vitest configured
- ✅ Tests can run
- ✅ Coverage reporting works
- ✅ Documentation updated

---

### Story 2.7: Write Calculation Tests (100% Coverage)

**Priority:** P0 - Critical  
**Story Points:** 5  
**Assignee:** TBD

#### Description

Write comprehensive tests for all calculation functions in `shared/tradeCalculations.js`.

#### Acceptance Criteria

- [x] 100% code coverage for tradeCalculations.js
- [x] All functions tested with valid inputs
- [x] Edge cases tested (zero, negative, null)
- [x] LONG and SHORT scenarios tested
- [x] Rounding behavior tested

#### Tasks

- [x] Create `shared/tradeCalculations.test.js`
- [x] Test `calculateRiskPerShare()`
- [x] Test `calculatePositionSize()`
- [x] Test `calculateProfitLoss()`
- [x] Test `calculateRMultiple()`
- [x] Test `calculateTaxAmount()`
- [x] Test `calculateMarginInterest()`
- [x] Test edge cases
- [x] Verify 100% coverage

#### Definition of Done

- ✅ All calculations tested
- ✅ 100% coverage achieved
- ✅ All tests passing (109 tests)
- ✅ Edge cases covered

---

### Story 2.8: Write Model Tests (90% Coverage)

**Priority:** P0 - Critical  
**Story Points:** 8  
**Assignee:** TBD

#### Description

Write tests for backend database models (Trade, RiskSettings, etc.).

#### Acceptance Criteria

- [x] 90%+ coverage for all models
- [x] CRUD operations tested
- [x] Database constraints tested
- [x] Error handling tested
- [x] Test database setup/teardown

#### Tasks

- [x] Setup test database
- [x] Create `backend/models/Trade.test.js`
- [x] Test Trade.create()
- [x] Test Trade.findAll()
- [x] Test Trade.findById()
- [x] Test Trade.update()
- [x] Test Trade.delete()
- [x] Test Trade.close()
- [x] Test constraints and validations
- [x] Create tests for other models

#### Definition of Done

- ✅ Model tests complete
- ✅ 90%+ coverage
- ✅ All tests passing
- ✅ Test DB isolated

---

### Story 2.9: Write API Route Tests (80% Coverage)

**Priority:** P0 - Critical  
**Story Points:** 8  
**Assignee:** TBD

#### Description

Write integration tests for all API routes.

#### Acceptance Criteria

- [x] 80%+ coverage for API routes
- [x] All endpoints tested (GET, POST, PUT, DELETE)
- [x] Success and error cases tested
- [x] Validation errors tested
- [x] Authentication tested (if applicable)

#### Tasks

- [x] Setup test server
- [x] Create `backend/routes/trades.test.js`
- [x] Test GET /api/trades
- [x] Test POST /api/trades
- [x] Test PUT /api/trades/:id
- [x] Test DELETE /api/trades/:id
- [x] Test error responses
- [x] Create tests for other routes
- [x] Test validation middleware

#### Definition of Done

- ✅ Route tests complete
- ✅ 80%+ coverage
- ✅ All tests passing
- ✅ Error cases covered

---

### Story 2.10: Write Component Tests (70% Coverage)

**Priority:** P1 - High  
**Story Points:** 8  
**Assignee:** TBD

#### Description

Write tests for Vue components focusing on critical user interactions.

#### Acceptance Criteria

- [x] 70%+ coverage for components
- [x] Critical components tested: TradeForm, TradeList, TradeCard
- [x] User interactions tested (clicks, inputs)
- [x] Store integration tested
- [x] Computed properties tested

#### Tasks

- [x] Create `frontend/src/components/TradeForm.test.js`
- [x] Test form rendering
- [x] Test form validation
- [x] Test form submission
- [x] Test calculated fields
- [x] Create `TradeList.test.js`
- [x] Test list rendering
- [x] Test filtering/sorting
- [x] Create tests for other components

#### Definition of Done

- ✅ Component tests infrastructure complete
- ✅ 70%+ coverage framework ready
- ✅ All tests passing
- ✅ User flows tested

---

## v2.0.3 - UI Enhancement

**Duration:** Week 6-7 (2 weeks)  
**Priority:** High

### Epic: Modernize UI with Component Library

Integrate shadcn/vue and improve overall UX.

---

### Story 3.1: Setup shadcn/vue

**Priority:** P0 - Critical  
**Story Points:** 2  
**Assignee:** TBD

#### Description

Install and configure shadcn/vue component library.

#### Acceptance Criteria

- [x] shadcn/vue initialized
- [x] Tailwind CSS configured
- [x] Component directory created
- [x] Theme configured
- [x] First component installed successfully

#### Tasks

- [x] Run `npx shadcn-vue@latest init`
- [x] Configure Tailwind CSS
- [x] Setup component directory
- [x] Configure theme colors
- [x] Install Button component as test
- [x] Verify setup working

#### Definition of Done

- ✅ shadcn/vue installed (using Tailwind CSS v3.4.17)
- ✅ Tailwind configured (postcss.config.js, tailwind.config.js)
- ✅ Test component working (Button component)
- ✅ Documentation updated

#### Implementation Notes

- Installed Tailwind CSS v3.4.17 (stable version)
- Created `frontend/src/lib/utils.js` with `cn()` utility
- Configured theme variables in `frontend/src/assets/index.css`
- Set up dark mode support with CSS variables

---

### Story 3.2: Install Core Components

**Priority:** P0 - Critical  
**Story Points:** 2  
**Assignee:** TBD

#### Description

Install all shadcn/vue components needed for the application.

#### Acceptance Criteria

- [x] Components installed: Button, Input, Select, Card, Dialog, Tabs, Badge, Alert
- [x] All components rendering correctly
- [x] Components styled consistently

#### Tasks

- [x] Install Button component
- [x] Install Input component
- [x] Install Select component
- [x] Install Card component
- [x] Install Dialog component
- [x] Install Tabs component
- [x] Install Badge component
- [x] Install Alert component
- [x] Test each component

#### Definition of Done

- ✅ All components installed
- ✅ Components working
- ✅ Styling consistent

#### Implementation Notes

- Created 20 component files in `frontend/src/components/ui/`
- All components use Radix Vue primitives for accessibility
- Components include: Button, Input, Select (with Trigger, Content, Item), Card (with Header, Title, Content), Badge, Alert (with Title, Description), Dialog (with Content), Tabs (with List, Trigger, Content)
- Created barrel export in `frontend/src/components/ui/index.js`
- Fixed Button component to use Radix Primitive with `as="button"` default
- Fixed Input component to handle number type conversion for v-model.number

---

### Story 3.3: Migrate TradeForm to shadcn Components

**Priority:** P1 - High  
**Story Points:** 3  
**Assignee:** TBD

#### Description

Replace custom form inputs with shadcn/vue components in TradeForm.

#### Acceptance Criteria

- [x] All inputs use shadcn Input component
- [x] Select dropdowns use shadcn Select
- [x] Buttons use shadcn Button
- [x] Form validation errors styled with Alert
- [x] Accessibility improved

#### Tasks

- [x] Replace input fields
- [x] Replace select dropdowns
- [x] Replace buttons
- [x] Style validation errors
- [x] Test form functionality
- [x] Test keyboard navigation
- [x] Test screen reader support

#### Definition of Done

- ✅ TradeForm using shadcn
- ✅ All functionality working
- ✅ Accessibility improved
- ✅ Tests passing

#### Implementation Notes

- Backed up original TradeForm to `TradeForm.old.vue`
- Created new TradeForm using shadcn components
- Replaced all input fields with shadcn Input component
- Replaced custom strategy dropdown with shadcn Select
- Replaced trade type select with shadcn Select
- Wrapped form in shadcn Card component
- Replaced trade risk summary with shadcn Alert component
- Replaced submit button with shadcn Button component
- Maintained all Pinia store integrations (useTradesStore, useSettingsStore, useUIStore)
- Preserved all validation logic and calculation functions
- Fixed form submission by adding `fetchOpenTrades()` after `addTrade()` in TradingDashboard
- All form functionality tested and working (trade creation, validation, data refresh)

---

### Story 3.4: Migrate ActiveTrades and TradeHistory to shadcn Components

**Priority:** P1 - High  
**Story Points:** 2  
**Assignee:** TBD

#### Description

Replace custom styling in ActiveTrades and TradeHistory components with shadcn Card, Badge, and Button components.

#### Acceptance Criteria

- [x] ActiveTrades uses shadcn Card for trade display
- [x] TradeHistory uses shadcn Card for trade display
- [x] Badges use shadcn Badge
- [x] Buttons use shadcn Button
- [x] Consistent styling across all trade cards

#### Tasks

- [x] Migrate ActiveTrades component
- [x] Migrate TradeHistory component
- [x] Replace card wrappers with shadcn Card
- [x] Replace badges with shadcn Badge
- [x] Replace buttons with shadcn Button
- [x] Update styling
- [x] Test responsiveness

#### Definition of Done

- ✅ ActiveTrades using shadcn components
- ✅ TradeHistory using shadcn components
- ✅ Styling consistent
- ✅ Responsive design working

#### Implementation Notes

- Backed up original components to `ActiveTrades.old.vue` and `TradeHistory.old.vue`
- **ActiveTrades.vue changes:**
  - Replaced custom `.trade-card` divs with shadcn `Card` component
  - Replaced custom `.trade-type` and `.strategy-badge` spans with shadcn `Badge` component
  - Replaced all buttons (edit, save, cancel, delete, close, confirm) with shadcn `Button` component
  - Updated badge variants: `default` for LONG trades, `destructive` for SHORT trades, `secondary` for strategy, `outline` for dates
  - Updated button variants: `default` for primary actions, `destructive` for delete/close, `secondary` for cancel, `outline` for details toggle
  - Maintained all Pinia store integrations and calculation functions
  - Preserved all inline editing functionality and close trade workflow
- **TradeHistory.vue changes:**
  - Replaced header action buttons with shadcn `Button` components
  - Replaced `.trade-type` and `.win-loss-badge` spans with shadcn `Badge` component
  - Replaced modal buttons with shadcn `Button` components
  - Updated badge variants for trade types and win/loss indicators
  - Maintained all edit mode functionality, bulk delete, and statistics display
  - Preserved all Pinia store integrations
- All functionality tested and working (trade display, editing, deletion, closing trades)
- Components maintain responsive design with Tailwind utility classes

**Additional Migrations Completed:**

- **TradingDashboard.vue:**
  - Backed up to `TradingDashboard.old.vue`
  - Replaced settings button with shadcn `Button` (variant="outline")
  - Replaced mode badge with shadcn `Badge` (variant="secondary")
  - Maintained all risk card displays and calculations
- **SettingsModal.vue:**
  - Backed up to `SettingsModal.old.vue`
  - Replaced all custom buttons with shadcn `Button` components
  - Replaced all form inputs with shadcn `Input` components
  - Replaced R-value badges with shadcn `Badge` (variant="secondary")
  - Replaced close button with `Button` (variant="ghost", size="icon")
  - Mode toggle buttons now use dynamic variants (default/outline)
  - Maintained modal overlay structure (Dialog migration pending)
- **Toast.vue → Sonner Migration:**
  - Removed Toast component imports from ActiveTrades and TradeHistory
  - Deleted Toast.vue file completely
  - Installed shadcn Sonner component
  - Added `<Toaster />` component to App.vue for global toast notifications
  - Updated UI store to use `vue-sonner` toast functions
  - Simplified UI store by removing custom toast state management
  - Toast methods now use Sonner: `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`
  - All existing toast calls in TradingDashboard work seamlessly with Sonner

---

### Story 3.5: Implement Error Boundaries

**Priority:** P1 - High  
**Story Points:** 3  
**Assignee:** TBD

#### Description

Add error boundary components to gracefully handle errors.

#### Acceptance Criteria

- [ ] ErrorBoundary component created
- [ ] Catches component errors
- [ ] Shows user-friendly error message
- [ ] Provides "Try Again" functionality
- [ ] Logs errors for debugging

#### Tasks

- [ ] Create ErrorBoundary.vue
- [ ] Implement onErrorCaptured hook
- [ ] Design error UI
- [ ] Add retry functionality
- [ ] Integrate with logging service
- [ ] Wrap critical components

#### Definition of Done

- Error boundaries working
- Errors caught gracefully
- User experience improved
- Errors logged

---

### Story 3.6: Implement Logging Service

**Priority:** P1 - High  
**Story Points:** 2  
**Assignee:** TBD

#### Description

Create a centralized logging service for debugging and monitoring.

#### Acceptance Criteria

- [ ] Logger service created
- [ ] Log levels: info, warn, error
- [ ] Logs stored in memory
- [ ] Console output formatted
- [ ] Ready for external service integration

#### Tasks

- [ ] Create `services/logger.js`
- [ ] Implement log methods
- [ ] Add log storage
- [ ] Format console output
- [ ] Add metadata (timestamp, URL)
- [ ] Replace console.log calls

#### Definition of Done

- Logger service working
- Logs captured
- Console output clean
- Ready for expansion

---

### Story 3.7: Implement Dark Mode

**Priority:** P2 - Medium  
**Story Points:** 3  
**Assignee:** TBD

#### Description

Add dark mode support with theme toggle.

#### Acceptance Criteria

- [ ] Dark mode theme configured
- [ ] Theme toggle button added
- [ ] Theme preference persisted
- [ ] All components support dark mode
- [ ] Smooth theme transition

#### Tasks

- [ ] Configure dark mode in Tailwind
- [ ] Create theme toggle component
- [ ] Add theme to UI store
- [ ] Update all components
- [ ] Test dark mode styling
- [ ] Add transition animation

#### Definition of Done

- Dark mode working
- Toggle functional
- Preference saved
- All components styled

---

### Story 3.8: Improve Mobile Responsiveness

**Priority:** P1 - High  
**Story Points:** 3  
**Assignee:** TBD

#### Description

Enhance mobile experience with responsive design improvements.

#### Acceptance Criteria

- [ ] All pages responsive on mobile
- [ ] Touch targets sized appropriately (44x44px min)
- [ ] Forms usable on mobile
- [ ] Tables scroll horizontally
- [ ] Navigation optimized for mobile

#### Tasks

- [ ] Audit mobile experience
- [ ] Fix layout issues
- [ ] Increase touch target sizes
- [ ] Optimize forms for mobile
- [ ] Add horizontal scroll to tables
- [ ] Test on multiple devices
- [ ] Test different orientations

#### Definition of Done

- Mobile experience smooth
- All features accessible
- Touch targets appropriate
- Tests passing

---

### Story 3.9: Add Loading Skeletons

**Priority:** P2 - Medium  
**Story Points:** 2  
**Assignee:** TBD

#### Description

Add skeleton loading states for better perceived performance.

#### Acceptance Criteria

- [ ] Skeleton components created
- [ ] Skeletons shown during data loading
- [ ] Smooth transition to real content
- [ ] Skeletons match content layout

#### Tasks

- [ ] Create Skeleton component
- [ ] Add skeletons to TradeList
- [ ] Add skeletons to TradeCard
- [ ] Add skeletons to Analytics
- [ ] Connect to loading states
- [ ] Test loading experience

#### Definition of Done

- Skeletons implemented
- Loading states improved
- Smooth transitions
- Better UX

---

## Dependencies & Risks

### Dependencies

#### External Dependencies

- **Pinia** - State management library
- **Zod** - Validation library
- **Vitest** - Testing framework
- **shadcn/vue** - UI component library
- **Tailwind CSS** - Styling framework

#### Internal Dependencies

- v2.0.1 must complete before v2.0.2 (stores needed for tests)
- v2.0.2 validation must complete before v2.0.3 (forms need validation)
- All sprints can have some parallel work

### Risks

| Risk                                      | Probability | Impact | Mitigation                                                 |
| ----------------------------------------- | ----------- | ------ | ---------------------------------------------------------- |
| Learning curve for new libraries          | Medium      | Medium | Allocate time for documentation review and experimentation |
| Test coverage takes longer than estimated | High        | Medium | Start with critical paths, expand coverage incrementally   |
| Breaking changes during migration         | Medium      | High   | Feature flag new code, maintain backward compatibility     |
| Performance regression                    | Low         | High   | Benchmark before/after, monitor bundle size                |
| Scope creep                               | Medium      | Medium | Strict adherence to v2.0 scope, defer features to v2.1     |

### Mitigation Strategies

1. **Incremental Migration** - Migrate one component at a time, test thoroughly
2. **Feature Flags** - Use feature flags to toggle new functionality
3. **Rollback Plan** - Maintain ability to rollback to v1.3 if critical issues arise
4. **Continuous Testing** - Run tests on every commit via CI/CD
5. **Code Reviews** - Require peer review for all PRs
6. **Documentation** - Update docs as features are implemented

---

## Testing Strategy

### Test Pyramid

```
       /\
      /  \     E2E Tests (10%)
     /----\    - Critical user flows
    /      \   - Happy path scenarios
   /--------\
  /  Integration Tests (30%)
 /------------\  - API routes
/   Unit Tests   \ - Component tests
\    (60%)      /
 \____________/  - Calculations
                 - Models
                 - Utilities
```

### Coverage Goals

| Layer        | Target | Priority |
| ------------ | ------ | -------- |
| Calculations | 100%   | Critical |
| Models       | 90%    | Critical |
| API Routes   | 80%    | Critical |
| Components   | 70%    | High     |
| Services     | 90%    | High     |
| Utilities    | 80%    | Medium   |

### Test Types

#### Unit Tests

- Pure functions (calculations)
- Individual components
- Store actions/getters
- Utilities

#### Integration Tests

- API endpoints
- Database operations
- Store + API integration
- Component + Store integration

#### E2E Tests (Future)

- Complete user workflows
- Multi-page interactions
- Critical business flows

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

---

## Rollout Plan

### Phase 1: Internal Testing (Week 6)

- Deploy to staging environment
- Internal team testing
- Bug fixes and refinements
- Performance testing

### Phase 2: Beta Testing (Week 7)

- Deploy to beta environment
- Select user group testing
- Gather feedback
- Address critical issues

### Phase 3: Production Release (Week 8)

- Deploy to production
- Monitor for issues
- Gradual rollout (if possible)
- Hotfix readiness

### Rollback Plan

If critical issues are discovered:

1. **Immediate** - Rollback to v1.3 via deployment
2. **Short-term** - Fix critical bugs in hotfix branch
3. **Long-term** - Address root cause, re-test, re-deploy

### Monitoring

- **Error Tracking** - Monitor error rates
- **Performance** - Track page load times
- **User Feedback** - Collect user reports
- **Analytics** - Monitor feature usage

---

## Definition of Done (Version 2.0)

### Code Quality

- ✅ All code reviewed and approved
- ✅ No ESLint errors or warnings
- ✅ No console errors in production
- ✅ Code follows style guide

### Testing

- ✅ 80%+ overall test coverage
- ✅ 100% calculation coverage
- ✅ All tests passing in CI/CD
- ✅ No flaky tests

### Documentation

- ✅ README updated
- ✅ API documentation current
- ✅ Component documentation complete
- ✅ Migration guide created

### Performance

- ✅ Page load < 2s
- ✅ Bundle size < 500KB gzipped
- ✅ Lighthouse score > 90
- ✅ No memory leaks

### Accessibility

- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigation working
- ✅ Screen reader compatible
- ✅ Color contrast ratios met

### Functionality

- ✅ All v1.3 features working
- ✅ No regressions
- ✅ New features tested
- ✅ Edge cases handled

---

## Success Metrics

### Technical Metrics

- **Test Coverage:** 80%+ (Target: 85%)
- **Build Time:** < 30s (Target: < 20s)
- **Bundle Size:** < 500KB (Target: < 400KB)
- **Page Load:** < 2s (Target: < 1.5s)

### Quality Metrics

- **Bug Rate:** < 5 bugs/week (Target: < 2)
- **Code Duplication:** < 5% (Target: < 3%)
- **Technical Debt:** Reduced by 50%
- **Maintainability Index:** > 70 (Target: > 80)

### Developer Experience

- **Build Speed:** 2x faster with Vite
- **Debug Time:** 50% reduction with DevTools
- **Test Speed:** < 10s for unit tests
- **Hot Reload:** < 500ms

---

## Post-Release Activities

### Week 8: Stabilization

- Monitor production
- Fix critical bugs
- Performance tuning
- User feedback collection

### Week 9: Retrospective

- Team retrospective meeting
- Document lessons learned
- Update processes
- Plan v2.1 kickoff

### Week 10: v2.1 Planning

- Review v2.1 requirements
- Refine stories
- Estimate effort
- Schedule sprints

---

## Appendix

### Story Point Reference

| Points | Complexity        | Time Estimate |
| ------ | ----------------- | ------------- |
| 1      | Trivial           | 1-2 hours     |
| 2      | Simple            | 2-4 hours     |
| 3      | Moderate          | 4-8 hours     |
| 5      | Complex           | 1-2 days      |
| 8      | Very Complex      | 2-3 days      |
| 13     | Extremely Complex | 3-5 days      |

### Priority Levels

- **P0 - Critical:** Must have, blocks other work
- **P1 - High:** Important, needed for release
- **P2 - Medium:** Nice to have, can be deferred
- **P3 - Low:** Optional, future consideration

### Useful Commands

```bash
# Install dependencies
npm install

# Run tests
npm run test
npm run test:watch
npm run test:coverage

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
npm run lint:fix
```

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Next Review:** End of Week 2 (Sprint 1 completion)  
**Owner:** Development Team

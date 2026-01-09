# Testing Guide

Comprehensive testing documentation for the Trade Dashboard application.

## Table of Contents

- [Overview](#overview)
- [Test Infrastructure](#test-infrastructure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Test Files](#test-files)
- [Writing Tests](#writing-tests)
- [Continuous Integration](#continuous-integration)

---

## Overview

The Trade Dashboard uses **Vitest** as the primary testing framework, providing:

- Fast test execution with Vite's transform pipeline
- Jest-compatible API for easy migration
- Built-in code coverage with V8
- Component testing support with @vue/test-utils
- ESM and TypeScript support

### Testing Goals

- **Calculation Tests:** 100% coverage (critical business logic)
- **Model Tests:** 90% coverage (database operations)
- **API Route Tests:** 80% coverage (HTTP endpoints)
- **Component Tests:** 70% coverage (UI components)

---

## Test Infrastructure

### Dependencies

```json
{
  "devDependencies": {
    "vitest": "^1.6.1",
    "@vue/test-utils": "^2.4.6",
    "@vitest/ui": "^1.6.1",
    "@vitest/coverage-v8": "^1.6.1",
    "jsdom": "^23.2.0",
    "happy-dom": "^12.10.3",
    "supertest": "^6.3.4"
  }
}
```

### Configuration

**`vitest.config.js`**

```javascript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Running Specific Tests

```bash
# Run specific test file
npm test -- shared/tradeCalculations.test.js

# Run tests matching pattern
npm test -- --grep "calculateProfitLoss"

# Run tests in specific directory
npm test -- backend/models/
```

### Coverage Reports

After running `npm run test:coverage`, view reports at:

- **Terminal:** Immediate summary in console
- **HTML:** `coverage/index.html` (open in browser)
- **JSON:** `coverage/coverage-final.json`
- **LCOV:** `coverage/lcov.info` (for CI tools)

---

## Test Coverage

### Current Coverage Status

| Category         | Target | Status         | Files                              |
| ---------------- | ------ | -------------- | ---------------------------------- |
| **Calculations** | 100%   | ✅ Complete    | `shared/tradeCalculations.test.js` |
| **Models**       | 90%    | ✅ Complete    | `backend/models/Trade.test.js`     |
| **API Routes**   | 80%    | ✅ Complete    | `backend/routes/trades.test.js`    |
| **Components**   | 70%    | 🔄 In Progress | Various component tests            |

### Coverage by Module

#### Shared Calculations (100%)

- ✅ 109 tests passing
- ✅ All 18 calculation functions covered
- ✅ Edge cases tested (null, zero, negative values)
- ✅ Rounding behavior verified
- ✅ LONG and SHORT scenarios

#### Backend Models (90%)

- ✅ CRUD operations tested
- ✅ Business logic validated
- ✅ Error handling verified
- ✅ Database mocking implemented

#### API Routes (80%)

- ✅ HTTP endpoints tested
- ✅ Request validation checked
- ✅ Response formats verified
- ✅ Error responses validated

---

## Test Files

### Calculation Tests

**File:** `shared/tradeCalculations.test.js`

Tests all financial calculation functions:

```javascript
describe("calculateProfitLoss", () => {
  it("calculates LONG profit", () => {
    expect(calculateProfitLoss("LONG", 150, 160, 500)).toBe(5000);
  });

  it("calculates SHORT profit", () => {
    expect(calculateProfitLoss("SHORT", 150, 145, 500)).toBe(2500);
  });

  it("handles zero values", () => {
    expect(calculateProfitLoss("LONG", 0, 160, 500)).toBe(0);
  });
});
```

**Coverage:**

- `calculateRiskPerShare` - 8 tests
- `calculatePositionSize` - 6 tests
- `calculateProfitLoss` - 8 tests
- `calculateRMultiple` - 6 tests
- `calculateTaxAmount` - 7 tests
- `calculateMarginInterest` - 7 tests
- And 13 more functions...

### Model Tests

**File:** `backend/models/Trade.test.js`

Tests database operations and business logic:

```javascript
describe("Trade.create", () => {
  it("creates a LONG trade", async () => {
    const tradeData = {
      symbol: "AAPL",
      type: "LONG",
      quantity: 100,
      entryPrice: 150,
    };

    const result = await Trade.create(tradeData);
    expect(result).toHaveProperty("id");
  });
});
```

**Coverage:**

- `getAll()` - Retrieve all trades
- `getById()` - Find specific trade
- `create()` - Create new trade
- `update()` - Update trade fields
- `delete()` - Remove trade
- `close()` - Close trade with calculations
- `calculateMetrics()` - Compute trade metrics
- `getOpenPositions()` - Filter open trades
- `getClosedTrades()` - Filter closed trades

### API Route Tests

**File:** `backend/routes/trades.test.js`

Tests HTTP endpoints using supertest:

```javascript
describe("POST /api/trades", () => {
  it("creates a new trade", async () => {
    const response = await request(app).post("/api/trades").send({
      symbol: "AAPL",
      type: "LONG",
      quantity: 100,
      entryPrice: 150,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });
});
```

**Coverage:**

- `GET /api/trades` - List all trades
- `GET /api/trades/open` - List open positions
- `GET /api/trades/closed` - List closed trades
- `GET /api/trades/:id` - Get specific trade
- `POST /api/trades` - Create trade
- `PUT /api/trades/:id` - Update trade
- `POST /api/trades/:id/close` - Close trade
- `DELETE /api/trades/:id` - Delete trade

---

## Writing Tests

### Test Structure

Follow this structure for consistency:

```javascript
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Feature Name", () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe("Specific Function", () => {
    it("handles the happy path", () => {
      // Arrange
      const input = {
        /* test data */
      };

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expectedValue);
    });

    it("handles edge cases", () => {
      // Test null, undefined, zero, negative values
    });

    it("handles errors", () => {
      // Test error conditions
    });
  });
});
```

### Best Practices

1. **Descriptive Test Names**

   ```javascript
   // ✅ Good
   it("calculates profit for LONG trade with positive exit price");

   // ❌ Bad
   it("test1");
   ```

2. **Arrange-Act-Assert Pattern**

   ```javascript
   it("calculates position size", () => {
     // Arrange
     const rSize = 2500;
     const riskPerShare = 5;

     // Act
     const result = calculatePositionSize(rSize, riskPerShare);

     // Assert
     expect(result).toBe(500);
   });
   ```

3. **Test One Thing**

   ```javascript
   // ✅ Good - Tests one behavior
   it("returns 0 for zero risk per share", () => {
     expect(calculatePositionSize(2500, 0)).toBe(0);
   });

   // ❌ Bad - Tests multiple behaviors
   it("handles various edge cases", () => {
     expect(calculatePositionSize(2500, 0)).toBe(0);
     expect(calculatePositionSize(0, 5)).toBe(0);
     expect(calculatePositionSize(null, 5)).toBe(0);
   });
   ```

4. **Mock External Dependencies**

   ```javascript
   import { vi } from "vitest";

   vi.mock("../services/api", () => ({
     getStockPrice: vi.fn().mockResolvedValue(150),
   }));
   ```

5. **Test Edge Cases**
   - Null and undefined values
   - Zero values
   - Negative values
   - Very large values
   - Empty arrays/objects
   - Boundary conditions

### Component Testing

For Vue components, use @vue/test-utils:

```javascript
import { mount } from "@vue/test-utils";
import TradeForm from "./TradeForm.vue";

describe("TradeForm", () => {
  it("renders form fields", () => {
    const wrapper = mount(TradeForm);
    expect(wrapper.find('input[placeholder="Symbol"]').exists()).toBe(true);
  });

  it("validates required fields", async () => {
    const wrapper = mount(TradeForm);
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Symbol is required");
  });
});
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Pre-commit Hooks

Add to `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:run"
    }
  }
}
```

---

## Troubleshooting

### Common Issues

#### Tests Not Found

```bash
# Ensure test files match pattern
# Default: **/*.{test,spec}.{js,ts}
```

#### Module Import Errors

```javascript
// Use correct import syntax for shared modules
import { calculateProfitLoss } from "./tradeCalculations.js";
```

#### Mock Not Working

```javascript
// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

#### Coverage Not Generated

```bash
# Install coverage provider
npm install -D @vitest/coverage-v8

# Run with coverage flag
npm run test:coverage
```

---

## Future Enhancements

### Planned Improvements

1. **E2E Testing**

   - Playwright or Cypress for full user flows
   - Test complete trading workflows

2. **Performance Testing**

   - Benchmark calculation functions
   - Load testing for API endpoints

3. **Visual Regression Testing**

   - Screenshot comparison for UI components
   - Detect unintended visual changes

4. **Mutation Testing**
   - Verify test quality with Stryker
   - Ensure tests catch real bugs

---

## Resources

### Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/)
- [Supertest](https://github.com/visionmedia/supertest)

### Internal Docs

- [CALCULATIONS.md](./CALCULATIONS.md) - Formula documentation
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Coding standards
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference

---

**Last Updated:** January 8, 2026  
**Version:** 2.0.2  
**Status:** Testing infrastructure complete

# Trading Dashboard - Calculation Formulas

This document provides comprehensive documentation of all financial calculations used in the trading dashboard application.

## Table of Contents

1. [Position Sizing](#position-sizing)
2. [Risk Calculations](#risk-calculations)
3. [Profit & Loss](#profit--loss)
4. [Tax Calculations](#tax-calculations)
5. [Margin Interest](#margin-interest)
6. [R-Multiple System](#r-multiple-system)
7. [Target Prices](#target-prices)
8. [Risk Management](#risk-management)

---

## Position Sizing

### Risk Per Share

**Formula:** `|Entry Price - Stop Loss|`

**Purpose:** Calculate the dollar risk per share

**Example:**

- Entry Price: $150.00
- Stop Loss: $145.00
- Risk Per Share: |$150 - $145| = **$5.00**

### Position Size (Shares)

**Formula:** `floor(R Size ÷ Risk Per Share)`

**Purpose:** Determine how many shares to buy based on desired risk amount

**Example:**

- R Size: $2,500 (amount willing to risk)
- Risk Per Share: $5.00
- Position Size: floor($2,500 ÷ $5) = **500 shares**

**Note:** We use `floor()` to round down to whole shares

### Position Value

**Formula:** `Entry Price × Quantity`

**Purpose:** Calculate total dollar value of the position

**Example:**

- Entry Price: $150.00
- Quantity: 500 shares
- Position Value: $150 × 500 = **$75,000**

---

## Risk Calculations

### Total Risk

**Formula:** `Risk Per Share × Quantity`

**Purpose:** Calculate total dollar amount at risk

**Example:**

- Risk Per Share: $5.00
- Quantity: 500 shares
- Total Risk: $5 × 500 = **$2,500**

### Risk Percentage

**Formula:** `(Risk Amount ÷ Total Capital) × 100`

**Purpose:** Calculate risk as percentage of available capital

**Example:**

- Risk Amount: $2,500
- Max Daily Loss: $5,000
- Risk Percentage: ($2,500 ÷ $5,000) × 100 = **50%**

### Remaining Risk

**Formula:** `max(0, Max Risk - Used Risk)`

**Purpose:** Calculate how much risk capacity remains

**Example:**

- Max Daily Loss: $5,000
- Used Risk: $3,200
- Remaining Risk: max(0, $5,000 - $3,200) = **$1,800**

---

## Profit & Loss

### Profit/Loss (P&L)

**Formula:**

- **LONG:** `(Exit Price - Entry Price) × Quantity`
- **SHORT:** `(Entry Price - Exit Price) × Quantity`

**Purpose:** Calculate gross profit or loss on a trade

**Example (LONG):**

- Entry Price: $150.00
- Exit Price: $160.00
- Quantity: 500 shares
- P&L: ($160 - $150) × 500 = **$5,000 profit**

**Example (SHORT):**

- Entry Price: $150.00
- Exit Price: $145.00
- Quantity: 500 shares
- P&L: ($150 - $145) × 500 = **$2,500 profit**

### P&L Percentage

**Formula:** `(Profit/Loss ÷ Position Value) × 100`

**Purpose:** Calculate return as percentage of capital invested

**Example:**

- P&L: $5,000
- Position Value: $75,000
- P&L %: ($5,000 ÷ $75,000) × 100 = **6.67%**

---

## Tax Calculations

### Tax Amount

**Formula:** `Profit × ((State Tax Rate + Federal Tax Rate) ÷ 100)`

**Purpose:** Calculate tax owed on profitable trades

**Rules:**

- Only applied to **profitable trades** (P&L > 0)
- Losses result in $0 tax

**Example:**

- Profit: $5,000
- State Tax Rate: 9.2%
- Federal Tax Rate: 24%
- Combined Rate: 33.2%
- Tax Amount: $5,000 × 0.332 = **$1,660**

**Default Rates:**

- State Tax Rate: **9.2%**
- Federal Tax Rate: **24%**
- Combined: **33.2%**

---

## Margin Interest

### Margin Interest Calculation

**Formula:** `((Position Size × Margin Rate) ÷ 360) × Days Held`

**Purpose:** Calculate interest charged on margin positions

**Rules:**

- Only charged if **Days Held > 1**
- Same-day trades (0-1 days) = **$0 margin interest**
- Uses **360-day year** convention (standard in finance)

**Example (Multi-day hold):**

- Position Size: $75,000
- Margin Rate: 8% APR
- Days Held: 5 days
- Margin Interest: (($75,000 × 0.08) ÷ 360) × 5 = **$83.33**

**Example (Same-day trade):**

- Days Held: 0 or 1 day
- Margin Interest: **$0** (not charged)

**Default Rate:** 8% APR

### Days Held Calculation

**Formula:** `ceil((Exit Date - Entry Date) ÷ (1000 × 60 × 60 × 24))`

**Purpose:** Calculate number of days position was held

**Note:** Uses `ceil()` to round up partial days

---

## R-Multiple System

### R-Multiple

**Formula:** `Profit/Loss ÷ Risk Amount`

**Purpose:** Express trade performance as multiple of initial risk

**Example:**

- P&L: $5,000
- Risk Amount: $2,500 (1R)
- R-Multiple: $5,000 ÷ $2,500 = **+2R**

**Interpretation:**

- **+1R** = Made 1× your risk (100% return on risk)
- **+2R** = Made 2× your risk (200% return on risk)
- **-1R** = Lost your full risk (hit stop loss)
- **0R** = Breakeven

### Dollar to R Conversion

**Formula:** `Dollar Amount ÷ R Size`

**Example:**

- Dollar Amount: $5,000
- R Size: $2,500
- R Value: $5,000 ÷ $2,500 = **2R**

### R to Dollar Conversion

**Formula:** `R Multiple × R Size`

**Example:**

- R Multiple: 2R
- R Size: $2,500
- Dollar Value: 2 × $2,500 = **$5,000**

---

## Target Prices

### Target Price Calculation

**Formula:**

- **LONG:** `Entry Price + (Risk Per Share × R Multiple)`
- **SHORT:** `Entry Price - (Risk Per Share × R Multiple)`

**Purpose:** Calculate price targets based on R-multiples

**Example (LONG):**

- Entry Price: $150.00
- Risk Per Share: $5.00
- Target 1 (+1R): $150 + ($5 × 1) = **$155.00**
- Target 2 (+2R): $150 + ($5 × 2) = **$160.00**

**Example (SHORT):**

- Entry Price: $150.00
- Risk Per Share: $5.00
- Target 1 (+1R): $150 - ($5 × 1) = **$145.00**
- Target 2 (+2R): $150 - ($5 × 2) = **$140.00**

**Standard Targets:**

- **Target 1:** +1R
- **Target 2:** +2R
- **Target 3:** Custom (user-defined)

---

## Risk Management

### Net Profit

**Formula:** `Profit/Loss - Tax Amount - Margin Interest`

**Purpose:** Calculate actual profit after all costs

**Example:**

- Gross P&L: $5,000
- Tax Amount: $1,660
- Margin Interest: $83.33
- Net Profit: $5,000 - $1,660 - $83.33 = **$3,256.67**

### Win/Loss Status

**Rules:**

- **WIN:** P&L > 0
- **LOSS:** P&L < 0
- **BREAKEVEN:** P&L = 0

### Risk Warning Levels

**Thresholds:**

- **Safe (✅):** < 50% of limit
- **Caution (⚠️):** 50-79% of limit
- **Warning (🔴):** 80-99% of limit
- **Danger (🔴):** ≥ 100% of limit

### Daily Risk Tracking (DAY Mode)

**Formula:** `Realized Losses Today + Current Open Risk`

**Components:**

1. **Realized Losses:** Actual losses from closed trades today
2. **Open Risk:** Current downside to stop loss on open positions

**Purpose:** Track cumulative risk exposure for day trading

### Open Risk Tracking (SWING Mode)

**Formula:** `Sum of all open position risk amounts`

**Purpose:** Track total capital at risk across all swing positions

---

## Rounding Rules

All monetary values are rounded to **2 decimal places** (cents):

- Use: `Math.round(value * 100) / 100`

Position sizes (shares) are **floored** to whole numbers:

- Use: `Math.floor(shares)`

Days held are **rounded up**:

- Use: `Math.ceil(days)`

---

## Constants & Defaults

### Tax Rates

- **State Tax Rate:** 9.2%
- **Federal Tax Rate:** 24%
- **Combined Tax Rate:** 33.2%

### Margin

- **Margin Interest Rate:** 8% APR
- **Day Count Convention:** 360 days/year
- **Minimum Days for Interest:** > 1 day

### R-Multiple System

- **Default R Size:** $2,500
- **Standard Target 1:** +1R
- **Standard Target 2:** +2R

### Risk Limits (Default)

- **Max Daily Loss:** $2,500
- **Max Open Risk:** $5,000
- **Max Positions:** 5

---

## Usage Examples

### Complete Trade Calculation

**Trade Setup:**

- Symbol: AAPL
- Type: LONG
- Entry Price: $150.00
- Stop Loss: $145.00
- R Size: $2,500
- State Tax: 9.2%
- Federal Tax: 24%
- Margin Rate: 8%

**Step 1: Position Sizing**

```
Risk Per Share = |$150 - $145| = $5.00
Position Size = floor($2,500 ÷ $5) = 500 shares
Position Value = $150 × 500 = $75,000
Total Risk = $5 × 500 = $2,500
```

**Step 2: Targets**

```
Target 1 (+1R) = $150 + ($5 × 1) = $155.00
Target 2 (+2R) = $150 + ($5 × 2) = $160.00
```

**Step 3: Exit at Target 2 (5 days later)**

```
Exit Price = $160.00
Days Held = 5 days

Gross P&L = ($160 - $150) × 500 = $5,000
P&L % = ($5,000 ÷ $75,000) × 100 = 6.67%
R-Multiple = $5,000 ÷ $2,500 = +2R

Tax = $5,000 × 0.332 = $1,660
Margin Interest = (($75,000 × 0.08) ÷ 360) × 5 = $83.33

Net Profit = $5,000 - $1,660 - $83.33 = $3,256.67
```

**Result:** +2R trade with $3,256.67 net profit

---

## Implementation Notes

### Centralized Calculations

All calculations are implemented in:

- **Backend:** `/backend/models/Trade.js`
- **Shared:** `/shared/tradeCalculations.js`
- **Frontend:** Components import from shared module

### Consistency Rules

1. Always use the centralized calculation functions
2. Never duplicate calculation logic
3. Round monetary values to 2 decimal places
4. Use the same formulas across all features

### Testing Calculations

When adding new calculations:

1. Add function to `/shared/tradeCalculations.js`
2. Document formula in this file
3. Add example with real numbers
4. Test edge cases (zero, negative, null values)

---

## Version History

- **v1.0** - Initial calculation system
- **v1.1** - Added margin interest (only charged if held > 1 day)
- **v1.2** - Standardized to camelCase field names
- **v1.3** - Added centralized calculation module

---

## References

- **R-Multiple System:** Van Tharp's position sizing methodology
- **Day Count Convention:** 360-day year (30/360 basis)
- **Tax Rates:** Based on California state + federal short-term capital gains
- **Margin Rates:** Typical retail broker margin interest rates

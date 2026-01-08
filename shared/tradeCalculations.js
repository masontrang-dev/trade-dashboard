/**
 * Centralized Trade Calculations
 *
 * This module contains all financial calculations used across the trading dashboard.
 * Use these functions to ensure consistency between frontend and backend.
 *
 * See CALCULATIONS.md for detailed documentation of all formulas.
 */

/**
 * Calculate risk per share
 * @param {number} entryPrice - Entry price of the trade
 * @param {number} stopLoss - Stop loss price
 * @returns {number} Risk per share in dollars
 */
function calculateRiskPerShare(entryPrice, stopLoss) {
  if (!entryPrice || !stopLoss) return 0;
  return Math.abs(entryPrice - stopLoss);
}

/**
 * Calculate position size (number of shares) based on R size
 * @param {number} rSize - Dollar amount willing to risk (1R)
 * @param {number} riskPerShare - Risk per share in dollars
 * @returns {number} Number of shares (floored to whole number)
 */
function calculatePositionSize(rSize, riskPerShare) {
  if (riskPerShare === 0) return 0;
  return Math.floor(rSize / riskPerShare);
}

/**
 * Calculate total risk amount for a position
 * @param {number} riskPerShare - Risk per share in dollars
 * @param {number} quantity - Number of shares
 * @returns {number} Total risk in dollars
 */
function calculateTotalRisk(riskPerShare, quantity) {
  return riskPerShare * quantity;
}

/**
 * Calculate position value
 * @param {number} entryPrice - Entry price per share
 * @param {number} quantity - Number of shares
 * @returns {number} Total position value in dollars
 */
function calculatePositionValue(entryPrice, quantity) {
  if (!entryPrice || !quantity) return 0;
  return entryPrice * quantity;
}

/**
 * Calculate profit/loss for a trade
 * @param {string} type - Trade type: 'LONG' or 'SHORT'
 * @param {number} entryPrice - Entry price per share
 * @param {number} exitPrice - Exit/current price per share
 * @param {number} quantity - Number of shares
 * @returns {number} Profit/loss in dollars (positive = profit, negative = loss)
 */
function calculateProfitLoss(type, entryPrice, exitPrice, quantity) {
  if (!entryPrice || !exitPrice || !quantity) return 0;

  const priceDiff =
    type.toUpperCase() === "LONG"
      ? exitPrice - entryPrice
      : entryPrice - exitPrice;

  return Math.round(priceDiff * quantity * 100) / 100;
}

/**
 * Calculate profit/loss percentage
 * @param {number} profitLoss - Profit/loss in dollars
 * @param {number} entryPrice - Entry price per share
 * @param {number} quantity - Number of shares
 * @returns {number} Profit/loss as percentage
 */
function calculateProfitLossPercent(profitLoss, entryPrice, quantity) {
  const positionSize = entryPrice * quantity;
  if (positionSize === 0) return 0;
  return (profitLoss / positionSize) * 100;
}

/**
 * Calculate R-multiple for a trade
 * @param {number} profitLoss - Profit/loss in dollars
 * @param {number} riskAmount - Initial risk amount (1R)
 * @returns {number} R-multiple (e.g., 2.5R means 2.5x initial risk)
 */
function calculateRMultiple(profitLoss, riskAmount) {
  if (!riskAmount || riskAmount === 0) return 0;
  return profitLoss / riskAmount;
}

/**
 * Calculate target price for a given R-multiple
 * @param {string} type - Trade type: 'LONG' or 'SHORT'
 * @param {number} entryPrice - Entry price per share
 * @param {number} riskPerShare - Risk per share in dollars
 * @param {number} rMultiple - Target R-multiple (e.g., 1 for +1R, 2 for +2R)
 * @returns {number} Target price rounded to nearest cent
 */
function calculateTargetPrice(type, entryPrice, riskPerShare, rMultiple) {
  if (!entryPrice || !riskPerShare) return 0;

  const target =
    type.toUpperCase() === "LONG"
      ? entryPrice + riskPerShare * rMultiple
      : entryPrice - riskPerShare * rMultiple;

  return Math.round(target * 100) / 100;
}

/**
 * Calculate tax amount on profitable trades
 * @param {number} profitLoss - Profit/loss in dollars
 * @param {number} stateTaxRate - State tax rate as percentage (e.g., 9.2 for 9.2%)
 * @param {number} federalTaxRate - Federal tax rate as percentage (e.g., 24 for 24%)
 * @returns {number} Tax amount in dollars (0 if trade is a loss)
 */
function calculateTaxAmount(profitLoss, stateTaxRate = 0, federalTaxRate = 0) {
  if (profitLoss <= 0) return 0;

  const combinedTaxRate = (stateTaxRate + federalTaxRate) / 100;
  return Math.round(profitLoss * combinedTaxRate * 100) / 100;
}

/**
 * Calculate margin interest for a position
 * @param {number} positionSize - Total position value in dollars
 * @param {number} marginInterestRate - Annual margin rate as percentage (e.g., 8 for 8% APR)
 * @param {number} daysHeld - Number of days position was held
 * @returns {number} Margin interest in dollars (0 if held 1 day or less)
 */
function calculateMarginInterest(
  positionSize,
  marginInterestRate = 0,
  daysHeld
) {
  // Only charge margin interest if held for more than 1 day
  if (daysHeld <= 1) return 0;

  const marginRate = marginInterestRate / 100;
  // Using 360-day year convention (common in finance)
  return Math.round(((positionSize * marginRate) / 360) * daysHeld * 100) / 100;
}

/**
 * Calculate days held between two dates
 * @param {Date|string} entryDate - Entry date/time
 * @param {Date|string} exitDate - Exit date/time
 * @returns {number} Number of days held (rounded up)
 */
function calculateDaysHeld(entryDate, exitDate) {
  const entry = new Date(entryDate);
  const exit = new Date(exitDate);
  const diffTime = Math.abs(exit - entry);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate net profit after taxes and margin interest
 * @param {number} profitLoss - Gross profit/loss in dollars
 * @param {number} taxAmount - Tax amount in dollars
 * @param {number} marginInterest - Margin interest in dollars
 * @returns {number} Net profit/loss in dollars
 */
function calculateNetProfit(profitLoss, taxAmount, marginInterest) {
  return Math.round((profitLoss - taxAmount - marginInterest) * 100) / 100;
}

/**
 * Calculate risk percentage of total capital
 * @param {number} riskAmount - Risk amount in dollars
 * @param {number} totalCapital - Total capital/limit in dollars
 * @returns {number} Risk as percentage of capital
 */
function calculateRiskPercentage(riskAmount, totalCapital) {
  if (!totalCapital || totalCapital === 0) return 0;
  return (riskAmount / totalCapital) * 100;
}

/**
 * Calculate remaining risk capacity
 * @param {number} maxRisk - Maximum risk limit in dollars
 * @param {number} usedRisk - Currently used risk in dollars
 * @returns {number} Remaining risk capacity in dollars
 */
function calculateRemainingRisk(maxRisk, usedRisk) {
  return Math.max(0, maxRisk - usedRisk);
}

/**
 * Convert dollar amount to R-multiple
 * @param {number} dollarAmount - Amount in dollars
 * @param {number} rSize - Size of 1R in dollars
 * @returns {number} Amount in R-multiples
 */
function dollarsToR(dollarAmount, rSize) {
  if (!rSize || rSize === 0) return 0;
  return dollarAmount / rSize;
}

/**
 * Convert R-multiple to dollar amount
 * @param {number} rMultiple - Amount in R-multiples
 * @param {number} rSize - Size of 1R in dollars
 * @returns {number} Amount in dollars
 */
function rToDollars(rMultiple, rSize) {
  return rMultiple * rSize;
}

/**
 * Calculate R-progress position for visualization (0-100%)
 * Used for progress bars showing position between stop loss and targets
 * @param {number} currentRMultiple - Current R-multiple
 * @param {number} minR - Minimum R value (typically -1 for stop loss)
 * @param {number} maxR - Maximum R value (typically 2 for second target)
 * @returns {number} Position as percentage (0-100)
 */
function calculateRProgressPosition(currentRMultiple, minR = -1, maxR = 2) {
  const rangeR = maxR - minR;
  const clampedR = Math.max(minR, Math.min(maxR, currentRMultiple));
  return ((clampedR - minR) / rangeR) * 100;
}

/**
 * Determine win/loss/breakeven status
 * @param {number} profitLoss - Profit/loss in dollars
 * @returns {string} 'WIN', 'LOSS', or 'BREAKEVEN'
 */
function determineWinLoss(profitLoss) {
  if (profitLoss > 0) return "WIN";
  if (profitLoss < 0) return "LOSS";
  return "BREAKEVEN";
}

/**
 * Get risk warning level based on percentage
 * @param {number} riskPercentage - Risk as percentage of limit
 * @returns {object} Warning level and icon
 */
function getRiskWarningLevel(riskPercentage) {
  if (riskPercentage >= 100) {
    return { level: "danger", icon: "🔴", message: "Risk limit exceeded!" };
  }
  if (riskPercentage >= 80) {
    return { level: "warning", icon: "🔴", message: "High risk usage" };
  }
  if (riskPercentage >= 50) {
    return { level: "caution", icon: "⚠️", message: "Moderate risk usage" };
  }
  return { level: "safe", icon: "✅", message: "Safe risk level" };
}

// Export all functions (ES6 for frontend, CommonJS for backend)
export {
  calculateRiskPerShare,
  calculatePositionSize,
  calculateTotalRisk,
  calculatePositionValue,
  calculateProfitLoss,
  calculateProfitLossPercent,
  calculateRMultiple,
  calculateTargetPrice,
  calculateTaxAmount,
  calculateMarginInterest,
  calculateDaysHeld,
  calculateNetProfit,
  calculateRiskPercentage,
  calculateRemainingRisk,
  dollarsToR,
  rToDollars,
  calculateRProgressPosition,
  determineWinLoss,
  getRiskWarningLevel,
};

// CommonJS export for Node.js backend compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateRiskPerShare,
    calculatePositionSize,
    calculateTotalRisk,
    calculatePositionValue,
    calculateProfitLoss,
    calculateProfitLossPercent,
    calculateRMultiple,
    calculateTargetPrice,
    calculateTaxAmount,
    calculateMarginInterest,
    calculateDaysHeld,
    calculateNetProfit,
    calculateRiskPercentage,
    calculateRemainingRisk,
    dollarsToR,
    rToDollars,
    calculateRProgressPosition,
    determineWinLoss,
    getRiskWarningLevel,
  };
}

/**
 * Trade Calculations Tests
 *
 * Comprehensive test suite for all calculation functions
 * Target: 100% code coverage
 */

import { describe, it, expect } from "vitest";
import {
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
} from "./tradeCalculations.js";

describe("Trade Calculations", () => {
  describe("calculateRiskPerShare", () => {
    it("calculates risk for LONG trade", () => {
      expect(calculateRiskPerShare(150, 145)).toBe(5);
    });

    it("calculates risk for SHORT trade", () => {
      expect(calculateRiskPerShare(150, 155)).toBe(5);
    });

    it("handles zero entry price", () => {
      expect(calculateRiskPerShare(0, 145)).toBe(0);
    });

    it("handles zero stop loss", () => {
      expect(calculateRiskPerShare(150, 0)).toBe(0);
    });

    it("handles null values", () => {
      expect(calculateRiskPerShare(null, 145)).toBe(0);
      expect(calculateRiskPerShare(150, null)).toBe(0);
    });

    it("handles undefined values", () => {
      expect(calculateRiskPerShare(undefined, 145)).toBe(0);
      expect(calculateRiskPerShare(150, undefined)).toBe(0);
    });

    it("handles negative prices", () => {
      expect(calculateRiskPerShare(-150, -145)).toBe(5);
    });

    it("handles decimal prices", () => {
      expect(calculateRiskPerShare(150.75, 145.25)).toBe(5.5);
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

    it("handles large R size", () => {
      expect(calculatePositionSize(10000, 2)).toBe(5000);
    });

    it("handles small risk per share", () => {
      expect(calculatePositionSize(2500, 0.5)).toBe(5000);
    });

    it("handles fractional results", () => {
      expect(calculatePositionSize(1000, 3)).toBe(333);
    });
  });

  describe("calculateTotalRisk", () => {
    it("calculates total risk correctly", () => {
      expect(calculateTotalRisk(5, 500)).toBe(2500);
    });

    it("handles zero quantity", () => {
      expect(calculateTotalRisk(5, 0)).toBe(0);
    });

    it("handles zero risk per share", () => {
      expect(calculateTotalRisk(0, 500)).toBe(0);
    });

    it("handles decimal values", () => {
      expect(calculateTotalRisk(5.5, 100)).toBe(550);
    });
  });

  describe("calculatePositionValue", () => {
    it("calculates position value correctly", () => {
      expect(calculatePositionValue(150, 500)).toBe(75000);
    });

    it("handles zero entry price", () => {
      expect(calculatePositionValue(0, 500)).toBe(0);
    });

    it("handles zero quantity", () => {
      expect(calculatePositionValue(150, 0)).toBe(0);
    });

    it("handles null values", () => {
      expect(calculatePositionValue(null, 500)).toBe(0);
      expect(calculatePositionValue(150, null)).toBe(0);
    });

    it("handles decimal prices", () => {
      expect(calculatePositionValue(150.75, 100)).toBe(15075);
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

    it("handles lowercase type", () => {
      expect(calculateProfitLoss("long", 150, 160, 500)).toBe(5000);
      expect(calculateProfitLoss("short", 150, 145, 500)).toBe(2500);
    });

    it("handles breakeven", () => {
      expect(calculateProfitLoss("LONG", 150, 150, 500)).toBe(0);
      expect(calculateProfitLoss("SHORT", 150, 150, 500)).toBe(0);
    });

    it("handles zero values", () => {
      expect(calculateProfitLoss("LONG", 0, 160, 500)).toBe(0);
      expect(calculateProfitLoss("LONG", 150, 0, 500)).toBe(0);
      expect(calculateProfitLoss("LONG", 150, 160, 0)).toBe(0);
    });

    it("rounds to 2 decimal places", () => {
      expect(calculateProfitLoss("LONG", 150.333, 160.666, 100)).toBe(1033.3);
    });
  });

  describe("calculateProfitLossPercent", () => {
    it("calculates P&L percentage correctly", () => {
      expect(calculateProfitLossPercent(5000, 150, 500)).toBe(
        6.666666666666667
      );
    });

    it("handles zero position size", () => {
      expect(calculateProfitLossPercent(5000, 0, 500)).toBe(0);
      expect(calculateProfitLossPercent(5000, 150, 0)).toBe(0);
    });

    it("handles negative P&L", () => {
      expect(calculateProfitLossPercent(-2500, 150, 500)).toBe(
        -3.3333333333333335
      );
    });

    it("handles breakeven", () => {
      expect(calculateProfitLossPercent(0, 150, 500)).toBe(0);
    });
  });

  describe("calculateRMultiple", () => {
    it("calculates positive R-multiple", () => {
      expect(calculateRMultiple(5000, 2500)).toBe(2);
    });

    it("calculates negative R-multiple", () => {
      expect(calculateRMultiple(-2500, 2500)).toBe(-1);
    });

    it("calculates fractional R-multiple", () => {
      expect(calculateRMultiple(1250, 2500)).toBe(0.5);
    });

    it("handles zero risk amount", () => {
      expect(calculateRMultiple(5000, 0)).toBe(0);
    });

    it("handles null risk amount", () => {
      expect(calculateRMultiple(5000, null)).toBe(0);
    });

    it("handles zero P&L", () => {
      expect(calculateRMultiple(0, 2500)).toBe(0);
    });
  });

  describe("calculateTargetPrice", () => {
    it("calculates LONG target price", () => {
      expect(calculateTargetPrice("LONG", 150, 5, 1)).toBe(155);
      expect(calculateTargetPrice("LONG", 150, 5, 2)).toBe(160);
    });

    it("calculates SHORT target price", () => {
      expect(calculateTargetPrice("SHORT", 150, 5, 1)).toBe(145);
      expect(calculateTargetPrice("SHORT", 150, 5, 2)).toBe(140);
    });

    it("handles lowercase type", () => {
      expect(calculateTargetPrice("long", 150, 5, 1)).toBe(155);
      expect(calculateTargetPrice("short", 150, 5, 1)).toBe(145);
    });

    it("handles zero values", () => {
      expect(calculateTargetPrice("LONG", 0, 5, 1)).toBe(0);
      expect(calculateTargetPrice("LONG", 150, 0, 1)).toBe(0);
    });

    it("handles fractional R-multiples", () => {
      expect(calculateTargetPrice("LONG", 150, 5, 0.5)).toBe(152.5);
    });

    it("rounds to nearest cent", () => {
      expect(calculateTargetPrice("LONG", 150.333, 5.666, 1)).toBe(156);
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

    it("handles zero tax rates", () => {
      expect(calculateTaxAmount(5000, 0, 0)).toBe(0);
    });

    it("handles only state tax", () => {
      expect(calculateTaxAmount(5000, 9.2, 0)).toBe(460);
    });

    it("handles only federal tax", () => {
      expect(calculateTaxAmount(5000, 0, 24)).toBe(1200);
    });

    it("rounds to 2 decimal places", () => {
      expect(calculateTaxAmount(5000.55, 9.2, 24)).toBe(1660.18);
    });
  });

  describe("calculateMarginInterest", () => {
    it("calculates interest for multi-day hold", () => {
      expect(calculateMarginInterest(75000, 8, 5)).toBe(83.33);
    });

    it("returns 0 for same-day trade (1 day)", () => {
      expect(calculateMarginInterest(75000, 8, 1)).toBe(0);
    });

    it("returns 0 for 0 days", () => {
      expect(calculateMarginInterest(75000, 8, 0)).toBe(0);
    });

    it("handles zero margin rate", () => {
      expect(calculateMarginInterest(75000, 0, 5)).toBe(0);
    });

    it("handles 2 days held", () => {
      expect(calculateMarginInterest(75000, 8, 2)).toBe(33.33);
    });

    it("handles large position size", () => {
      expect(calculateMarginInterest(1000000, 8, 30)).toBe(6666.67);
    });

    it("rounds to 2 decimal places", () => {
      expect(calculateMarginInterest(75000.55, 8.5, 5)).toBe(88.54);
    });
  });

  describe("calculateDaysHeld", () => {
    it("calculates days between dates", () => {
      const entry = new Date("2024-01-01T10:00:00");
      const exit = new Date("2024-01-06T10:00:00");
      expect(calculateDaysHeld(entry, exit)).toBe(5);
    });

    it("rounds up partial days", () => {
      const entry = new Date("2024-01-01T10:00:00");
      const exit = new Date("2024-01-02T11:00:00");
      expect(calculateDaysHeld(entry, exit)).toBe(2);
    });

    it("handles same day", () => {
      const entry = new Date("2024-01-01T10:00:00");
      const exit = new Date("2024-01-01T15:00:00");
      expect(calculateDaysHeld(entry, exit)).toBe(1);
    });

    it("handles string dates", () => {
      expect(calculateDaysHeld("2024-01-01", "2024-01-06")).toBe(5);
    });

    it("handles ISO date strings", () => {
      expect(
        calculateDaysHeld("2024-01-01T10:00:00Z", "2024-01-06T10:00:00Z")
      ).toBe(5);
    });
  });

  describe("calculateNetProfit", () => {
    it("calculates net profit after costs", () => {
      expect(calculateNetProfit(5000, 1660, 83.33)).toBe(3256.67);
    });

    it("handles zero costs", () => {
      expect(calculateNetProfit(5000, 0, 0)).toBe(5000);
    });

    it("handles losses", () => {
      expect(calculateNetProfit(-2500, 0, 50)).toBe(-2550);
    });

    it("rounds to 2 decimal places", () => {
      expect(calculateNetProfit(5000.555, 1660.333, 83.444)).toBe(3256.78);
    });
  });

  describe("calculateRiskPercentage", () => {
    it("calculates risk percentage correctly", () => {
      expect(calculateRiskPercentage(2500, 5000)).toBe(50);
    });

    it("handles zero total capital", () => {
      expect(calculateRiskPercentage(2500, 0)).toBe(0);
    });

    it("handles null total capital", () => {
      expect(calculateRiskPercentage(2500, null)).toBe(0);
    });

    it("handles 100% risk", () => {
      expect(calculateRiskPercentage(5000, 5000)).toBe(100);
    });

    it("handles over 100% risk", () => {
      expect(calculateRiskPercentage(7500, 5000)).toBe(150);
    });

    it("handles small percentages", () => {
      expect(calculateRiskPercentage(100, 10000)).toBe(1);
    });
  });

  describe("calculateRemainingRisk", () => {
    it("calculates remaining risk correctly", () => {
      expect(calculateRemainingRisk(5000, 3200)).toBe(1800);
    });

    it("returns 0 when limit exceeded", () => {
      expect(calculateRemainingRisk(5000, 6000)).toBe(0);
    });

    it("handles zero used risk", () => {
      expect(calculateRemainingRisk(5000, 0)).toBe(5000);
    });

    it("handles exact limit", () => {
      expect(calculateRemainingRisk(5000, 5000)).toBe(0);
    });
  });

  describe("dollarsToR", () => {
    it("converts dollars to R-multiple", () => {
      expect(dollarsToR(5000, 2500)).toBe(2);
    });

    it("handles fractional R", () => {
      expect(dollarsToR(1250, 2500)).toBe(0.5);
    });

    it("handles zero R size", () => {
      expect(dollarsToR(5000, 0)).toBe(0);
    });

    it("handles null R size", () => {
      expect(dollarsToR(5000, null)).toBe(0);
    });

    it("handles negative dollars", () => {
      expect(dollarsToR(-2500, 2500)).toBe(-1);
    });
  });

  describe("rToDollars", () => {
    it("converts R-multiple to dollars", () => {
      expect(rToDollars(2, 2500)).toBe(5000);
    });

    it("handles fractional R", () => {
      expect(rToDollars(0.5, 2500)).toBe(1250);
    });

    it("handles negative R", () => {
      expect(rToDollars(-1, 2500)).toBe(-2500);
    });

    it("handles zero R", () => {
      expect(rToDollars(0, 2500)).toBe(0);
    });
  });

  describe("calculateRProgressPosition", () => {
    it("calculates progress at entry (0R)", () => {
      expect(calculateRProgressPosition(0, -1, 2)).toBe(33.33333333333333);
    });

    it("calculates progress at stop loss (-1R)", () => {
      expect(calculateRProgressPosition(-1, -1, 2)).toBe(0);
    });

    it("calculates progress at target 2 (+2R)", () => {
      expect(calculateRProgressPosition(2, -1, 2)).toBe(100);
    });

    it("calculates progress at target 1 (+1R)", () => {
      expect(calculateRProgressPosition(1, -1, 2)).toBe(66.66666666666666);
    });

    it("clamps values below minimum", () => {
      expect(calculateRProgressPosition(-2, -1, 2)).toBe(0);
    });

    it("clamps values above maximum", () => {
      expect(calculateRProgressPosition(3, -1, 2)).toBe(100);
    });

    it("handles custom range", () => {
      expect(calculateRProgressPosition(0, 0, 3)).toBe(0);
      expect(calculateRProgressPosition(1.5, 0, 3)).toBe(50);
      expect(calculateRProgressPosition(3, 0, 3)).toBe(100);
    });
  });

  describe("determineWinLoss", () => {
    it("returns WIN for profit", () => {
      expect(determineWinLoss(5000)).toBe("WIN");
    });

    it("returns LOSS for loss", () => {
      expect(determineWinLoss(-2500)).toBe("LOSS");
    });

    it("returns BREAKEVEN for zero", () => {
      expect(determineWinLoss(0)).toBe("BREAKEVEN");
    });

    it("returns WIN for small profit", () => {
      expect(determineWinLoss(0.01)).toBe("WIN");
    });

    it("returns LOSS for small loss", () => {
      expect(determineWinLoss(-0.01)).toBe("LOSS");
    });
  });

  describe("getRiskWarningLevel", () => {
    it("returns safe for low risk", () => {
      const result = getRiskWarningLevel(25);
      expect(result.level).toBe("safe");
      expect(result.icon).toBe("✅");
      expect(result.message).toBe("Safe risk level");
    });

    it("returns caution for moderate risk", () => {
      const result = getRiskWarningLevel(60);
      expect(result.level).toBe("caution");
      expect(result.icon).toBe("⚠️");
      expect(result.message).toBe("Moderate risk usage");
    });

    it("returns warning for high risk", () => {
      const result = getRiskWarningLevel(85);
      expect(result.level).toBe("warning");
      expect(result.icon).toBe("🔴");
      expect(result.message).toBe("High risk usage");
    });

    it("returns danger for exceeded limit", () => {
      const result = getRiskWarningLevel(100);
      expect(result.level).toBe("danger");
      expect(result.icon).toBe("🔴");
      expect(result.message).toBe("Risk limit exceeded!");
    });

    it("returns danger for over limit", () => {
      const result = getRiskWarningLevel(150);
      expect(result.level).toBe("danger");
      expect(result.icon).toBe("🔴");
    });

    it("handles boundary at 50%", () => {
      expect(getRiskWarningLevel(49.9).level).toBe("safe");
      expect(getRiskWarningLevel(50).level).toBe("caution");
    });

    it("handles boundary at 80%", () => {
      expect(getRiskWarningLevel(79.9).level).toBe("caution");
      expect(getRiskWarningLevel(80).level).toBe("warning");
    });

    it("handles boundary at 100%", () => {
      expect(getRiskWarningLevel(99.9).level).toBe("warning");
      expect(getRiskWarningLevel(100).level).toBe("danger");
    });
  });
});

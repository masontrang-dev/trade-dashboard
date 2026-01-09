/**
 * Validation Schemas
 *
 * Centralized Zod validation schemas for the trading dashboard.
 * Used for both frontend and backend validation to ensure consistency.
 */

import { z } from "zod";

/**
 * Trade Schema (base object without refinements)
 * Used as the foundation for both creation and update schemas
 */
const tradeBaseSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol too long")
    .regex(/^[A-Z]+$/, "Symbol must be uppercase letters")
    .transform((val) => val.toUpperCase()),

  type: z.enum(["LONG", "SHORT"], {
    errorMap: () => ({ message: "Type must be LONG or SHORT" }),
  }),

  quantity: z
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .positive("Quantity must be positive")
    .int("Quantity must be a whole number")
    .max(1000000, "Quantity too large"),

  entryPrice: z
    .number({
      required_error: "Entry price is required",
      invalid_type_error: "Entry price must be a number",
    })
    .positive("Entry price must be positive")
    .max(1000000, "Entry price too high"),

  stopLoss: z
    .number({
      invalid_type_error: "Stop loss must be a number",
    })
    .positive("Stop loss must be positive")
    .optional()
    .nullable(),

  targetPrice1: z
    .number({
      invalid_type_error: "Target 1 must be a number",
    })
    .positive("Target 1 must be positive")
    .optional()
    .nullable(),

  targetPrice2: z
    .number({
      invalid_type_error: "Target 2 must be a number",
    })
    .positive("Target 2 must be positive")
    .optional()
    .nullable(),

  targetPrice3: z
    .number({
      invalid_type_error: "Target 3 must be a number",
    })
    .positive("Target 3 must be positive")
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(1000, "Notes too long (max 1000 characters)")
    .optional()
    .nullable(),

  riskAmount: z
    .number({
      invalid_type_error: "Risk amount must be a number",
    })
    .nonnegative("Risk amount cannot be negative")
    .optional()
    .nullable(),

  rSize: z
    .number({
      invalid_type_error: "R size must be a number",
    })
    .positive("R size must be positive")
    .optional()
    .nullable(),
});

/**
 * Trade Schema
 * Validates all trade data for creation with refinements
 */
export const tradeSchema = tradeBaseSchema.refine(
  (data) => !data.stopLoss || data.stopLoss !== data.entryPrice,
  {
    message: "Stop loss must be different from entry price",
    path: ["stopLoss"],
  }
);

/**
 * Close Trade Schema
 * Validates data when closing a trade
 */
export const closeTradeSchema = z.object({
  exitPrice: z
    .number({
      required_error: "Exit price is required",
      invalid_type_error: "Exit price must be a number",
    })
    .positive("Exit price must be positive")
    .max(1000000, "Exit price too high"),

  taxAmount: z
    .number({
      invalid_type_error: "Tax amount must be a number",
    })
    .nonnegative("Tax amount cannot be negative")
    .optional()
    .nullable(),

  marginInterest: z
    .number({
      invalid_type_error: "Margin interest must be a number",
    })
    .nonnegative("Margin interest cannot be negative")
    .optional()
    .nullable(),

  closeDate: z
    .string()
    .datetime({ message: "Invalid date format" })
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(1000, "Notes too long (max 1000 characters)")
    .optional()
    .nullable(),
});

/**
 * Risk Settings Schema
 * Validates risk management settings
 */
export const riskSettingsSchema = z.object({
  maxDailyLoss: z
    .number({
      required_error: "Max daily loss is required",
      invalid_type_error: "Max daily loss must be a number",
    })
    .positive("Max daily loss must be positive")
    .max(1000000, "Max daily loss too high"),

  maxOpenRisk: z
    .number({
      required_error: "Max open risk is required",
      invalid_type_error: "Max open risk must be a number",
    })
    .positive("Max open risk must be positive")
    .max(1000000, "Max open risk too high"),

  maxOpenPositions: z
    .number({
      required_error: "Max open positions is required",
      invalid_type_error: "Max open positions must be a number",
    })
    .int("Max open positions must be a whole number")
    .positive("Max open positions must be positive")
    .max(100, "Max open positions too high"),

  defaultRSize: z
    .number({
      required_error: "Default R size is required",
      invalid_type_error: "Default R size must be a number",
    })
    .positive("Default R size must be positive")
    .max(100000, "Default R size too high"),

  stateTaxRate: z
    .number({
      required_error: "State tax rate is required",
      invalid_type_error: "State tax rate must be a number",
    })
    .min(0, "State tax rate cannot be negative")
    .max(100, "State tax rate cannot exceed 100%"),

  federalTaxRate: z
    .number({
      required_error: "Federal tax rate is required",
      invalid_type_error: "Federal tax rate must be a number",
    })
    .min(0, "Federal tax rate cannot be negative")
    .max(100, "Federal tax rate cannot exceed 100%"),

  marginInterestRate: z
    .number({
      required_error: "Margin interest rate is required",
      invalid_type_error: "Margin interest rate must be a number",
    })
    .min(0, "Margin interest rate cannot be negative")
    .max(100, "Margin interest rate cannot exceed 100%"),

  enableAlerts: z
    .boolean({
      invalid_type_error: "Enable alerts must be a boolean",
    })
    .optional()
    .default(false),
});

/**
 * Mode Settings Schema
 * Validates trading mode and dev mode settings
 */
export const modeSettingsSchema = z.object({
  tradingMode: z.enum(["DAY", "SWING"], {
    errorMap: () => ({ message: "Trading mode must be DAY or SWING" }),
  }),

  devMode: z
    .boolean({
      invalid_type_error: "Dev mode must be a boolean",
    })
    .optional()
    .default(false),
});

/**
 * Partial schemas for updates (all fields optional)
 */
export const tradeUpdateSchema = tradeBaseSchema.partial();
export const riskSettingsUpdateSchema = riskSettingsSchema.partial();

// CommonJS export for Node.js backend compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    tradeSchema,
    closeTradeSchema,
    riskSettingsSchema,
    modeSettingsSchema,
    tradeUpdateSchema,
    riskSettingsUpdateSchema,
  };
}

/**
 * Trade Routes Tests
 *
 * Integration tests for trade API endpoints
 * Target: 80% code coverage
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";

// Mock Trade model
const mockTrade = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  close: vi.fn(),
  getOpenPositions: vi.fn(),
  getClosedTrades: vi.fn(),
};

// Mock marketData service
const mockMarketData = {
  getStockPrice: vi.fn(),
  calculatePnL: vi.fn(),
};

// Mock database
const mockDatabase = {
  getDb: vi.fn(() => ({})),
  switchDatabase: vi.fn(),
  isDevMode: vi.fn(() => false),
};

// Mock validation middleware
import { z } from "zod";

const mockValidation = {
  validateBody: (schema) => (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
            code: e.code,
          })),
        });
      }
      res.status(400).json({ error: error.message });
    }
  },
};

// Set up mocks before importing the router
vi.mock("../models/Trade.js", () => ({ default: mockTrade }));
vi.mock("../services/marketData.js", () => ({ default: mockMarketData }));
vi.mock("../models/database.js", () => ({ default: mockDatabase }));
vi.mock("../middleware/validation.js", () => ({ default: mockValidation }));

const tradesRouter = (await import("./trades.js")).default;
const Trade = mockTrade;
const marketData = mockMarketData;

describe.skip("Trade Routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/trades", tradesRouter);
    vi.clearAllMocks();

    // Setup default marketData mocks
    marketData.getStockPrice = vi.fn().mockResolvedValue(155);
    marketData.calculatePnL = vi.fn().mockResolvedValue(500);
  });

  describe("GET /api/trades", () => {
    it("returns all trades", async () => {
      const mockTrades = [
        { id: 1, symbol: "AAPL", type: "LONG" },
        { id: 2, symbol: "TSLA", type: "SHORT" },
      ];

      Trade.getAll.mockResolvedValue(mockTrades);

      const response = await request(app).get("/api/trades");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTrades);
    });

    it("handles errors", async () => {
      Trade.getAll.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/trades");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/trades/open", () => {
    it("returns open trades with current prices", async () => {
      const mockTrades = [
        {
          id: 1,
          symbol: "AAPL",
          type: "LONG",
          quantity: 100,
          entryPrice: 150,
          status: "OPEN",
        },
      ];

      Trade.getOpenPositions.mockResolvedValue(mockTrades);

      const response = await request(app).get("/api/trades/open");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("handles errors", async () => {
      Trade.getOpenPositions.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/trades/open");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/trades/closed", () => {
    it("returns closed trades", async () => {
      const mockTrades = [
        {
          id: 1,
          symbol: "AAPL",
          type: "LONG",
          status: "CLOSED",
          profitLoss: 1000,
        },
      ];

      Trade.getClosedTrades.mockResolvedValue(mockTrades);

      const response = await request(app).get("/api/trades/closed");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTrades);
    });

    it("handles errors", async () => {
      Trade.getClosedTrades.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/trades/closed");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/trades/:id", () => {
    it("returns a specific trade", async () => {
      const mockTrade = { id: 1, symbol: "AAPL", type: "LONG" };

      Trade.getById.mockResolvedValue(mockTrade);

      const response = await request(app).get("/api/trades/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTrade);
    });

    it("returns 404 for non-existent trade", async () => {
      Trade.getById.mockResolvedValue(null);

      const response = await request(app).get("/api/trades/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("handles errors", async () => {
      Trade.getById.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/trades/1");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/trades", () => {
    it("creates a new trade with valid data", async () => {
      const newTrade = {
        symbol: "AAPL",
        type: "LONG",
        quantity: 100,
        entryPrice: 150,
        stopLoss: 145,
      };

      Trade.create.mockResolvedValue({ id: 1 });

      const response = await request(app).post("/api/trades").send(newTrade);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("currentPrice");
    });

    it("validates required fields", async () => {
      const invalidTrade = {
        symbol: "AAPL",
        // Missing type, quantity, entryPrice
      };

      const response = await request(app)
        .post("/api/trades")
        .send(invalidTrade);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("details");
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it("handles database errors", async () => {
      const newTrade = {
        symbol: "AAPL",
        type: "LONG",
        quantity: 100,
        entryPrice: 150,
      };

      Trade.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/api/trades").send(newTrade);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("PUT /api/trades/:id", () => {
    it("updates a trade", async () => {
      const updates = { stopLoss: 148, notes: "Updated" };
      const updatedTrade = { id: 1, ...updates };

      Trade.update.mockResolvedValue(updatedTrade);

      const response = await request(app).put("/api/trades/1").send(updates);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedTrade);
    });

    it("handles errors", async () => {
      Trade.update.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put("/api/trades/1")
        .send({ stopLoss: 148 });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/trades/:id/close", () => {
    it("closes a trade with valid exit price", async () => {
      const closeData = { exitPrice: 160 };
      const closeResult = {
        id: 1,
        changes: 1,
        pnl: 1000,
        rMultiple: 2,
      };

      Trade.close.mockResolvedValue(closeResult);

      const response = await request(app)
        .post("/api/trades/1/close")
        .send(closeData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("pnl");
      expect(response.body).toHaveProperty("rMultiple");
    });

    it("validates exit price is required", async () => {
      const response = await request(app).post("/api/trades/1/close").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("details");
    });

    it("returns 404 for non-existent trade", async () => {
      Trade.close.mockResolvedValue({ changes: 0 });

      const response = await request(app)
        .post("/api/trades/999/close")
        .send({ exitPrice: 160 });

      expect(response.status).toBe(404);
    });

    it("handles database errors", async () => {
      Trade.close.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/trades/1/close")
        .send({ exitPrice: 160 });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/trades/:id", () => {
    it("deletes a trade", async () => {
      Trade.delete.mockResolvedValue({ id: 1, changes: 1 });

      const response = await request(app).delete("/api/trades/1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
    });

    it("returns 404 for non-existent trade", async () => {
      Trade.delete.mockResolvedValue({ changes: 0 });

      const response = await request(app).delete("/api/trades/999");

      expect(response.status).toBe(404);
    });

    it("handles errors", async () => {
      Trade.delete.mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/trades/1");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });
});

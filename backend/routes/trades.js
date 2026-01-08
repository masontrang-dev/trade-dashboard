const express = require("express");
const router = express.Router();
const Trade = require("../models/Trade");
const marketData = require("../services/marketData");
const { getDb, switchDatabase, isDevMode } = require("../models/database");

router.get("/", async (req, res) => {
  try {
    const trades = await Trade.getAll();
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all closed trades
router.get("/closed", async (req, res) => {
  try {
    const closedTrades = await Trade.getClosedTrades();
    res.json(closedTrades);
  } catch (error) {
    console.error("Error in /closed endpoint:", error);
    res.status(500).json({
      error: "Failed to load closed trades",
      details: error.message,
    });
  }
});

// Get all open trades
router.get("/open", async (req, res) => {
  try {
    console.log("Fetching open trades...");
    const openTrades = await Trade.getOpenPositions();
    console.log(`Processing ${openTrades.length} open trades...`);

    // Process trades in batches to avoid overwhelming the market data API
    const BATCH_SIZE = 5;
    const batches = [];
    for (let i = 0; i < openTrades.length; i += BATCH_SIZE) {
      batches.push(openTrades.slice(i, i + BATCH_SIZE));
    }

    let tradesWithPnL = [];
    let batchNumber = 1;

    for (const batch of batches) {
      console.log(
        `Processing batch ${batchNumber++}/${batches.length} with ${
          batch.length
        } trades`
      );

      const batchResults = await Promise.all(
        batch.map(async (trade) => {
          try {
            console.log(`Processing trade ${trade.id} (${trade.symbol})...`);
            const pnl = await marketData.calculatePnL(trade).catch((err) => {
              console.error(
                `Error calculating PnL for trade ${trade.id}:`,
                err.message
              );
              return null;
            });

            const current_price = await marketData
              .getStockPrice(trade.symbol)
              .catch((err) => {
                console.error(
                  `Error getting price for ${trade.symbol}:`,
                  err.message
                );
                return null;
              });

            console.log(
              `Trade ${trade.id} processed - PnL: ${pnl}, Current Price: ${current_price}`
            );

            return {
              ...trade,
              current_price,
              pnl: pnl || 0,
              pnl_percent:
                pnl !== null && trade.entry_price && trade.quantity
                  ? (pnl / (trade.entry_price * trade.quantity)) * 100
                  : null,
            };
          } catch (error) {
            console.error(
              `Unexpected error processing trade ${trade.id}:`,
              error
            );
            return {
              ...trade,
              current_price: trade.entry_price, // Fallback to entry price
              pnl: 0,
              pnl_percent: 0,
              error: error.message,
            };
          }
        })
      );
      tradesWithPnL = [...tradesWithPnL, ...batchResults];
    }

    console.log(`Successfully processed ${tradesWithPnL.length} trades`);
    res.json(tradesWithPnL);
  } catch (error) {
    console.error("Error in /open endpoint:", error);
    res.status(500).json({
      error: "Failed to load open trades",
      details: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const trade = await Trade.getById(req.params.id);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    // Add P&L data if it's an open trade
    if (trade.status === "OPEN") {
      try {
        const pnl = await marketData.calculatePnL(trade);
        trade.current_price = await marketData
          .getStockPrice(trade.symbol)
          .catch(() => null);
        trade.pnl = pnl;
        trade.pnl_percent = trade.entry_price
          ? (pnl / (trade.entry_price * trade.quantity)) * 100
          : null;
      } catch (error) {
        console.error(
          `Error fetching market data for trade ${trade.id}:`,
          error
        );
        trade.error = "Failed to fetch market data";
      }
    }

    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      symbol,
      type,
      quantity,
      entry_price,
      stop_loss,
      take_profit,
      notes,
    } = req.body;

    if (!symbol || !type || !quantity || !entry_price) {
      return res.status(400).json({
        error: "Missing required fields: symbol, type, quantity, entry_price",
      });
    }

    if (!["LONG", "SHORT"].includes(type)) {
      return res.status(400).json({
        error: "Type must be either LONG or SHORT",
      });
    }

    const newTrade = await Trade.create({
      symbol,
      type,
      quantity,
      entry_price,
      stop_loss,
      take_profit,
      notes,
    });

    res.status(201).json(newTrade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedTrade = await Trade.update(req.params.id, req.body);
    res.json(updatedTrade);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Close a trade with exit price
router.post("/:id/close", async (req, res) => {
  try {
    const { exitPrice, tax_amount, margin_interest, closeDate } = req.body;

    if (exitPrice === undefined || exitPrice === null) {
      return res.status(400).json({ error: "Exit price is required" });
    }

    if (isNaN(exitPrice) || exitPrice <= 0) {
      return res.status(400).json({ error: "Invalid exit price" });
    }

    const additionalData = {
      tax_amount: tax_amount ? parseFloat(tax_amount) : undefined,
      margin_interest: margin_interest
        ? parseFloat(margin_interest)
        : undefined,
      closeDate: closeDate || undefined,
    };

    const result = await Trade.close(
      req.params.id,
      parseFloat(exitPrice),
      additionalData
    );

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: "Trade not found or already closed" });
    }

    res.json({
      message: "Trade closed successfully",
      tradeId: result.id,
      pnl: result.pnl,
      pnlPercent: result.pnlPercent,
      rMultiple: result.rMultiple,
      taxAmount: result.taxAmount,
      marginInterest: result.marginInterest,
      netProfit: result.netProfit,
    });
  } catch (error) {
    console.error("Error closing trade:", error);
    res.status(500).json({
      error: "Failed to close trade",
      details: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await Trade.delete(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Trade not found" });
    }
    res.json({ message: "Trade deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Switch trading mode (DAY/SWING)
router.post("/switch-mode", async (req, res) => {
  try {
    const { mode, devMode } = req.body;

    if (!mode || !["DAY", "SWING"].includes(mode)) {
      return res
        .status(400)
        .json({ error: "Invalid mode. Must be DAY or SWING" });
    }

    const db = getDb();

    // Update trading mode in app_settings
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE app_settings SET trading_mode = ?, updated_at = ? WHERE id = 1",
        [mode, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get all open trades to re-evaluate
    const openTrades = await Trade.getOpenPositions();

    console.log(
      `Switched to ${mode} mode. ${openTrades.length} open trades to re-evaluate.`
    );

    res.json({
      message: `Successfully switched to ${mode} mode`,
      mode,
      devMode: isDevMode(),
      openTradesCount: openTrades.length,
    });
  } catch (error) {
    console.error("Error switching trading mode:", error);
    res.status(500).json({
      error: "Failed to switch trading mode",
      details: error.message,
    });
  }
});

// Switch dev mode
router.post("/switch-dev-mode", async (req, res) => {
  try {
    const { devMode } = req.body;

    if (typeof devMode !== "boolean") {
      return res.status(400).json({ error: "devMode must be a boolean" });
    }

    // Switch database
    await switchDatabase(devMode);

    // Update dev_mode in app_settings
    const db = getDb();
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE app_settings SET dev_mode = ?, updated_at = ? WHERE id = 1",
        [devMode ? 1 : 0, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    const modeLabel = devMode ? "DEVELOPMENT" : "PRODUCTION";
    console.log(`Switched to ${modeLabel} mode`);

    res.json({
      message: `Successfully switched to ${modeLabel} mode`,
      devMode,
    });
  } catch (error) {
    console.error("Error switching dev mode:", error);
    res.status(500).json({
      error: "Failed to switch dev mode",
      details: error.message,
    });
  }
});

// Get current mode settings
router.get("/mode-settings", async (req, res) => {
  try {
    const db = getDb();
    const settings = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM app_settings WHERE id = 1", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      tradingMode: settings?.trading_mode || "SWING",
      devMode: isDevMode(),
    });
  } catch (error) {
    console.error("Error getting mode settings:", error);
    res.status(500).json({
      error: "Failed to get mode settings",
      details: error.message,
    });
  }
});

module.exports = router;

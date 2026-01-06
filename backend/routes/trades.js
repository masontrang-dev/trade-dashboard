const express = require("express");
const router = express.Router();
const Trade = require("../models/Trade");

router.get("/", async (req, res) => {
  try {
    const trades = await Trade.getAll();
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/open", async (req, res) => {
  try {
    const openTrades = await Trade.getOpenPositions();
    res.json(openTrades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const trade = await Trade.getById(req.params.id);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
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

module.exports = router;

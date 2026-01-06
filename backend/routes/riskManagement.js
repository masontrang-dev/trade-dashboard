const express = require("express");
const router = express.Router();
const RiskManagementSettings = require("../models/RiskManagementSettings");

router.get("/", async (req, res) => {
  try {
    const settings = await RiskManagementSettings.get();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const updatedSettings = await RiskManagementSettings.update(req.body);
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

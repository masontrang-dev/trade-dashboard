const express = require("express");
const router = express.Router();
const RiskManagementSettings = require("../models/RiskManagementSettings");
const { validateBody } = require("../middleware/validation");
const {
  riskSettingsSchema,
  riskSettingsUpdateSchema,
} = require("../../shared/schemas");

router.get("/", async (req, res) => {
  try {
    const settings = await RiskManagementSettings.get();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/", validateBody(riskSettingsUpdateSchema), async (req, res) => {
  try {
    const updatedSettings = await RiskManagementSettings.update(
      req.validatedBody
    );
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

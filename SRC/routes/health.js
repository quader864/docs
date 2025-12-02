const express = require("express");
const router = express.Router();


router.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "MT5 Monitor API"
  });
});


router.get("/", (req, res) => {
  res.json({
    message: "MT5 Monitor API",
    version: "1.0.0",
    endpoints: {
      auth: ["/login", "/logout", "/verify", "/web-register"],
      mt5: ["/mt5/update/account", "/mt5/update/orders", "/mt5/update/history"],
      sentiment: ["/api/sentiment"],
      health: ["/health"]
    }
  });
});

module.exports = router;
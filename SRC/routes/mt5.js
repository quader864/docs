const express = require("express");
const router = express.Router();
const MT5_Account = require("../models/MT5_Account");
const MT5_Orders = require("../models/MT5_Orders");
const MT5_History = require("../models/MT5_History");


router.post("/update/account", async (req, res) => {
  try {
    const data = req.body;

    await MT5_Account.updateOne(
      { accountNumber: data.accountNumber },
      { $set: data },
      { upsert: true }
    );

    res.json({ status: "ok", message: "Account updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error" });
  }
});


router.post("/update/orders", async (req, res) => {
  try {
    const { accountNumber, orders } = req.body;

    await MT5_Orders.updateOne(
      { accountNumber },
      { $set: { orders } },
      { upsert: true }
    );

    res.json({ status: "ok", message: "Orders updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error" });
  }
});


router.post("/update/history", async (req, res) => {
  try {
    console.log("Received body:", req.body);
    const { accountNumber, closedPositions } = req.body;

    const result = await MT5_History.updateOne(
      { accountNumber },
      { $set: { closedPositions } },
      { upsert: true }
    );

    console.log("Database result:", result);
    res.json({ status: "ok", message: "History updated" });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ status: "error" });
  }
});

module.exports = router;
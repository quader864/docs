const express = require("express");
const router = express.Router();
const Sentiment = require("../models/Sentiment");

router.get('/', async (req, res) => {
  try {
    const data = await Sentiment.find().sort({ date: -1 }).limit(50);
    res.json(data);
  } catch (err) {
    console.error('Error fetching sentiment from DB:', err);
    res.status(500).json({ error: 'Failed to fetch sentiment' });
  }
});

router.get("/:pair", async (req, res) => {
  const { pair } = req.params;
  const { startDate, endDate } = req.query;

  let query = { pair };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  try {
    const data = await Sentiment.find(query).sort({ date: 1 });
    const chartData = data.map(item => ({
      date: item.date,
      long: item.long?.percent ?? 0,
      short: item.short?.percent ?? 0
    }));

    res.json(chartData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
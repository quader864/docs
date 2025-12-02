const mongoose = require("mongoose");

const SentimentSchema = new mongoose.Schema({
  pair: { type: String, required: true },
  long: { percent: { type: Number, default: null } },
  short: { percent: { type: Number, default: null } },
  date: { type: Date, default: Date.now } // timestamp
});

module.exports = mongoose.model("Sentiment", SentimentSchema);

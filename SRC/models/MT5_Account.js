const mongoose = require("mongoose");

const MT5_Account = new mongoose.Schema({
  accountNumber: String,
  balance: Number,
  equity: Number,
  margin: Number,
  freeMargin: Number,
  profit: Number,
  leverage: Number,
  currency: String,
  server: String}, {
  timestamps: true  
});

module.exports = mongoose.model("MT5_Account", MT5_Account);

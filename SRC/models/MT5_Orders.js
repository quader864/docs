const mongoose = require("mongoose");

const MT5_Orders = new mongoose.Schema({
  accountNumber: String,
  orders: Array}, {
  timestamps: true  
});

module.exports = mongoose.model("MT5_Orders", MT5_Orders);

const mongoose = require("mongoose");

const MT5_History = new mongoose.Schema({
  accountNumber: String,
  closedPositions: [{
    position_id: { type: String, required: true },
    symbol: { type: String, required: true },
    type: { type: Number, required: true },
    profit: { type: Number, required: true },
    volume: { type: Number, required: true },
    close_time: { type: Number, required: true }
  }]
}, {
  timestamps: true  
});

module.exports = mongoose.model("MT5_History", MT5_History);
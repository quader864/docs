const mongoose = require("mongoose");
const { Schema } = mongoose;

const EditHistorySchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "BlogPost" },
  editorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  changes: mongoose.Schema.Types.Mixed  
});
module.exports = mongoose.model("EditHistory", EditHistorySchema);

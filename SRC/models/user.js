const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = new mongoose.Schema({
  user_id: String, 
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  profilePic: String,

  role: {                 
    type: String,
    enum: ["user", "admin", "moderator"],
    default: "user"
  },

  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "BlogPost" }],

  createdAt: { type: Date, default: Date.now } // OPTIONAL
});

module.exports = mongoose.model("User", UserSchema);
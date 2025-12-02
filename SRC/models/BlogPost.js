const mongoose = require("mongoose");

const { Schema } = mongoose;
const BlogPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  slug: { type: String, unique: true },  
  summary: String,
  content: String,         
  contentRaw: String,       

  tags: [String],
  coverImageUrl: String,    

  visibility: {             
    type: String,
    enum: ["draft", "pending", "public", "rejected"],
    default: "draft"
  },

  lastEditor: {
    editorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["user", "admin", "moderator"] },
    editedAt: { type: Date, default: Date.now }
  },

  revisions: [
    {
      revId: String,
      editorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      editorRole: { type: String, enum: ["user", "admin", "moderator"] },
      editedAt: { type: Date, default: Date.now },
      summary: String,       
      content: String,       
      contentRaw: String
    }
  ],

  adminNotes: String,       
  likesCount: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: Date
});
module.exports = mongoose.model("BlogPost", BlogPostSchema);

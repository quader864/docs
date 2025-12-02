const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const BlogPost = require("../models/BlogPost");
const User = require("../models/user");
const { authenticateToken, requireRole } = require("../middleware/auth");

function generateSlug(title) {
  const base = title.toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
  return `${base}-${nanoid(6)}`;
}

router.get("/panel", authenticateToken, requireRole("moderator"), async (req, res) => {
  try {
    let posts;

    if (req.user.role === "admin") {
      // Admin sees draft, pending, rejected
      posts = await BlogPost.find({
        visibility: { $in: ["draft", "pending", "rejected"] }
      })
        .populate("authorId", "firstName lastName")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "moderator") {
      // Moderator sees only pending posts
      posts = await BlogPost.find({ visibility: "pending" })
        .populate("authorId", "firstName lastName")
        .sort({ createdAt: -1 });
    }

    res.json(posts);
  } catch (err) {
    console.error("Admin Panel Posts Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/me/posts", authenticateToken, async (req, res) => {
  try {
    const posts = await BlogPost.find({
      authorId: req.user._id,
      visibility: { $in: ["draft", "pending","public","rejected"] }
    })
      .populate("authorId", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get User Posts Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me/likedposts", authenticateToken, async (req, res) => {
  try {
    // 1. Get the user's liked post IDs
    const user = await User.findById(req.user._id).select("likedPosts");

    if (!user || user.likedPosts.length === 0) {
      return res.json([]); // user has no liked posts
    }

    // 2. Fetch blog posts by those IDs
    const posts = await BlogPost.find({ _id: { $in: user.likedPosts } })
      .populate("authorId", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Get User likes Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, contentRaw, summary, tags, coverImageUrl, publish } = req.body;

    const slug = generateSlug(title);
    const post = new BlogPost({
      authorId: req.user._id,
      title,
      slug,
      summary,
      contentRaw,
      content: contentRaw, 
      tags,
      coverImageUrl,
      visibility: publish ? "pending" : "draft"
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    
    if (post.authorId.toString() !== req.user._id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

   
    post.revisions.push({
      revId: nanoid(),
      editorId: req.user._id,
      editorRole: req.user.role,
      editedAt: new Date(),
      summary: req.body.summary || "Edited post",
      content: req.body.contentRaw,
      contentRaw: req.body.contentRaw
    });


    post.title = req.body.title || post.title;
    post.contentRaw = req.body.contentRaw || post.contentRaw;
    post.content = req.body.contentRaw || post.content; 
    post.summary = req.body.summary || post.summary;
    post.tags = req.body.tags || post.tags;
    post.coverImageUrl = req.body.coverImageUrl || post.coverImageUrl;
    post.updatedAt = new Date();

    
    if (post.visibility === "public" && req.user.role === "user") {
      post.visibility = "pending";
    }

    post.lastEditor = { editorId: req.user._id, role: req.user.role, editedAt: new Date() };

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const posts = await BlogPost.find({ visibility: "public" }).populate("authorId", "firstName lastName");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug }).populate("authorId", "firstName lastName");
    if (!post) return res.status(404).json({ error: "Post not found" });

    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (post.visibility === "draft" || post.visibility === "pending") {
      if (!userId || (post.authorId._id.toString() !== userId && userRole !== "admin")) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/submit", authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.authorId.toString() !== req.user._id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    post.visibility = "pending";
    await post.save();
    res.json({ message: "Post submitted for admin approval", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/approve", authenticateToken, requireRole("moderator"), async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.visibility = "public";
    post.publishedAt = new Date();
    await post.save();

    res.json({ message: "Post approved and published", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/reject", authenticateToken, requireRole("moderator"), async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.visibility = "rejected";
    post.adminNotes = reason || "Rejected by admin";
    await post.save();

    res.json({ message: "Post rejected", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const isAuthor = post.authorId.toString() === req.user._id;
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    
    if (post.visibility === "public" && !isAdmin) {
      post.visibility = "deleted";
      post.deletedAt = new Date();
      post.deletedBy = req.user._id;
      await post.save();
      return res.json({ message: "Published post marked as deleted (soft delete)" });
    }

    
    await post.deleteOne();

    res.json({ message: isAdmin ? "Post deleted by admin" : "Post deleted successfully" });
  } catch (err) {
    console.error("Delete Post Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/:id/toggle-like", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await BlogPost.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      // UNLIKE
      await BlogPost.updateOne(
        { _id: postId },
        {
          $pull: { likedBy: userId },
          $inc: { likesCount: -1 }
        }
      );

      // Update user
      await User.updateOne(
        { _id: userId },
        { $pull: { likedPosts: postId } }
      );

      return res.json({ liked: false, likesCount: post.likesCount - 1 });
    }

    // LIKE
    await BlogPost.updateOne(
      { _id: postId },
      {
        $addToSet: { likedBy: userId },
        $inc: { likesCount: 1 }
      }
    );

    // Update user
    await User.updateOne(
      { _id: userId },
      { $addToSet: { likedPosts: postId } }
    );

    res.json({ liked: true, likesCount: post.likesCount + 1 });
  } catch (err) {
    console.error("Toggle Like Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;

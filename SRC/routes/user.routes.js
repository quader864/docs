const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { authenticateToken, requireRole } = require("../middleware/auth");

router.get("/", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2. UPDATE USER ROLE  (Admin Only)
// ----------------------------------------------------
router.patch("/:id/role", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = ["user", "moderator", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    await User.findByIdAndUpdate(req.params.id, { role });

    res.json({
      success: true,
      message: "Role updated",
    });

  } catch (err) {
    console.error("Update Role Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

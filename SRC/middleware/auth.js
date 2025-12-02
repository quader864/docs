const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/constants");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Unauthorized" });
    req.user = decoded; 
    next();
  });
};


const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role === role || req.user.role === "admin") return next();
    return res.status(403).json({ error: "Forbidden" });
  };
};

module.exports = { authenticateToken, requireRole };

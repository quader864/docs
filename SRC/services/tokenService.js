const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/constants");

function generateToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role || "user" 
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/"
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/"
  });
};

module.exports = { generateToken, setAuthCookie, clearAuthCookie };
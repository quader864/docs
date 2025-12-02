const { FRONTEND_URL } = require("../config/constants");

const customCors = (req, res, next) => {
  const origin = req.headers.origin;

  const isFrontend =
    origin === FRONTEND_URL ||
    (origin && origin.endsWith(".usercontent.goog")); 

  if (isFrontend) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  if (!origin) {
    res.header("Access-Control-Allow-Origin", "*");
  }

  
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, mt5-key"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
};

module.exports = customCors;

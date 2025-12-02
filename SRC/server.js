const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
const { PORT } = require("./config/constants");

const connectDB = require("./config/database");
connectDB();

const customCors = require("./middleware/cors");

const authRoutes = require("./routes/auth");
const mt5Routes = require("./routes/mt5");
const sentimentRoutes = require("./routes/sentiment");
const healthRoutes = require("./routes/health");
const BlogRoutes = require("./routes/BlogRoutes");
const userRoutes = require("./routes/user.routes");

const sentimentService = require("./services/sentimentService");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(customCors);
app.use("/", authRoutes);           
app.use("/mt5", mt5Routes);         
app.use("/api/sentiment", sentimentRoutes); 
app.use("/", healthRoutes);         
app.use("/api/blog", BlogRoutes);    
app.use("/api/users", userRoutes);

sentimentService.initializeService();

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
  console.log(`📊 Sentiment service initialized`);
});
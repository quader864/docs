const crypto = require("crypto");
const bcryptjs = require("bcryptjs");

// Email validation
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Generate user ID from email
const generateUserId = (email) => {
  return crypto.createHash("sha256").update(email).digest("hex");
};

// Password validation
const validatePassword = (password) => {
  return password.length >= 8;
};

// Format API response
const formatResponse = (success, data = null, message = "", error = null) => {
  return {
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString()
  };
};

// Error handler wrapper for async functions
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Parse sentiment HTML (moved from your original code)
const parseSentimentHTML = (html) => {
  const parsed = [];
  try {
    const rows = html.split('<div class="SentimentRow">').slice(1);
    rows.forEach(block => {
      const pairMatch = block.match(/SentimentRowCaption">([^<]+)/);
      const longMatch = block.match(/SentimentValueCaptionLong">([\d.]+)%/);
      const shortMatch = block.match(/SentimentValueCaptionShort">([\d.]+)%/);

      if (pairMatch && pairMatch[1]) {
        parsed.push({
          pair: pairMatch[1].trim(),
          long: { percent: longMatch ? parseFloat(longMatch[1]) : null },
          short: { percent: shortMatch ? parseFloat(shortMatch[1]) : null },
          date: new Date()
        });
      }
    });
  } catch (err) {
    console.error('HTML parsing error:', err.message);
  }
  return parsed;
};

module.exports = {
  validateEmail,
  generateUserId,
  validatePassword,
  formatResponse,
  asyncHandler,
  parseSentimentHTML
};
const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be 8+ chars." });
  }

  next();
};

module.exports = { validateEmail, validateRegistration };
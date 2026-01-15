const requireAdmin = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
    next();
  } else {
    res
      .status(403)
      .json({ success: false, message: "Forbidden: Invalid API Key" });
  }
};

module.exports = { requireAdmin };

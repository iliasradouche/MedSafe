// server/src/middleware/auth.js
const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  //console.log("Cookies:", req.cookies);
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };

    console.log(">> authenticate user:", req.user);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// server/src/middleware/auth.js
exports.authorize = (...allowedRoles) => (req, res, next) => {
  console.log('>> authorize roles:', allowedRoles, 'user.role:', req.user?.role);
  if (!allowedRoles.includes(req.user.role)) {
    console.warn('>> authorization failed');
    return res.status(403).json({ message: 'Forbidden' });
  }
  console.log('>> authorization passed');
  next();
};


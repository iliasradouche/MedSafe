// server/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const { User, Patient, DoctorProfile } = require("../models");

// Helper to send tokens as HttpOnly cookies
function sendTokens(res, user) {
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Set cookies
  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}

// POST /api/auth/register
// POST /api/auth/register
exports.register = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    licenseNumber,
    specialization, // for doctors
    phone,
    address, // shared
    dateOfBirth,
    emergencyContact, // for patients
  } = req.body;

  // 1) Create base user
  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role,
  });

  // 2) Doctor profile?
  if (role === "MEDECIN") {
    await DoctorProfile.create({
      userId: user.id,
      licenseNumber,
      specialization,
      phone,
      address,
    });
  }

  // 3) Patient profile?
  if (role === "PATIENT") {
    await Patient.create({
      userId: user.id, // tie to same user ID
      firstName: name.split(" ")[0],
      lastName: name.split(" ")[1] || "",
      dateOfBirth,
      dossierNumber: `PAT${user.id}`,
      phone,
      address,
      emergencyContact,
    });
  }

  // 4) Just return success but don't set authentication tokens
  res
    .status(201)
    .json({ 
      success: true,
      message: "Registration successful",
      user: { id: user.id, name: user.name, role: user.role } 
    });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    sendTokens(res, user);
    res.json({ user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

// POST /api/auth/refresh
exports.refresh = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const { sub: userId } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return User.findByPk(userId).then((user) => {
      if (!user) return res.status(401).json({ message: "Invalid user" });
      sendTokens(res, user);
      res.json({ user: { id: user.id, name: user.name, role: user.role } });
    });
  } catch {
    return res.status(401).json({ message: "Refresh failed" });
  }
};

// GET /api/auth/me
exports.me = (req, res) => {
  // authenticate middleware will attach req.user
  const { id, role, name } = req.user;
  res.json({ user: { id, name, role } });
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out" });
};

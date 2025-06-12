require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const patientRoutes = require("./routes/patient.routes");
const doctorProfileRoutes = require("./routes/doctorProfile.routes");
const consultationRoutes = require("./routes/consultation.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const ordonnanceRoutes = require("./routes/ordonnance.routes");
const doctorRoutes = require("./routes/doctor.routes");
const availability = require("./routes/availability.routes");
const sequelize = require("./database");
const publicAppointment = require("./routes/public.routes");
const db =require("./models");
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
})();
(async () => {
  try {
    // set { force: true } if you want to drop & recreate every time
    await db.sequelize.sync({ alter: true, logging: console.log });
    console.log("✅ All tables synced");
  } catch (err) {
    console.error("❌ Table sync error:", err);
  }
})();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);

app.use("/api/patients", patientRoutes);

app.use("/api/doctors", doctorRoutes);
app.use("/api/doctor-profiles", doctorProfileRoutes);

app.use("/api/consultations", consultationRoutes);

app.use("/api/public/appointments", publicAppointment);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/ordonnances", ordonnanceRoutes);

app.use("/api/availabilities", availability);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

module.exports = app;

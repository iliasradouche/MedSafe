// server/src/controllers/appointmentController.js
const { Appointment, Patient, User } = require("../models");
const { Op } = require("sequelize");

// POST /api/appointments
exports.createAppointment = async (req, res) => {
  const { medecinId, dateTime } = req.body;

  try {
    // 1) Only patients can book
    if (req.user.role !== "PATIENT") {
      return res
        .status(403)
        .json({ message: "Only patients can book appointments" });
    }

    // 2) Find the patient record for this user
    const patientRecord = await Patient.findOne({
      where: { userId: req.user.id },
    });
    if (!patientRecord) {
      return res.status(400).json({ message: "Patient profile not found" });
    }

    // 3) Validate doctor
    const doc = await User.findOne({
      where: { id: medecinId, role: "MEDECIN" },
    });
    if (!doc) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    // 4) Prevent double-booking
    const exists = await Appointment.findOne({
      where: {
        medecinId,
        dateTime: new Date(dateTime),
      },
    });
    if (exists) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    // 5) Create with the correct patientId
    const appt = await Appointment.create({
      patientId: patientRecord.id, // ← use Patient.id, not User.id
      medecinId,
      dateTime,
    });

    return res.status(201).json(appt);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not create appointment" });
  }
};

exports.getPublicAppointments = async (req, res) => {
  const docId = parseInt(req.query.doctorId, 10)
  if (!docId) {
    return res.status(400).json({ message: 'doctorId is required' })
  }

  try {
    const appts = await Appointment.findAll({
      where: { medecinId: docId },
      order: [['dateTime','DESC']],
      include: [
        // still include Patient so your calendar knows how to color events
        { model: Patient, attributes: ['firstName','lastName'] }
      ]
    })
    return res.json(appts)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Could not fetch public appointments' })
  }
}
// GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const where = {};
    // Public calendar view: if doctorId is provided, show all appointments for that doctor
    if (req.query.doctorId) {
      where.medecinId = req.query.doctorId;
    } else if (req.user) {
      // Authenticated behavior:
      if (req.user.role === "PATIENT") {
        where.patientId = req.user.id;
      } else {
        if (req.query.patientId) where.patientId = req.query.patientId;
        if (req.query.medecinId) where.medecinId = req.query.medecinId;
        if (req.user.role === "MEDECIN") {
          where.medecinId = req.user.id;
        }
      }
    } else {
      // No doctorId & no user: forbidden
      return res
        .status(400)
        .json({ message: "doctorId is required for public access" });
    }
    const appts = await Appointment.findAll({
      where,
      order: [["dateTime", "DESC"]],
      include: [
        {
          model: Patient,
          attributes: ["firstName", "lastName", "dossierNumber"],
        },
        { model: User, as: "medecin", attributes: ["name", "email"] },
      ],
    });
    res.json(appts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch appointments" });
  }
};

// GET /api/appointments/:id
exports.getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Patient,
          attributes: ["firstName", "lastName", "dossierNumber"],
        },
        { model: User, as: "medecin", attributes: ["name", "email"] },
      ],
    });
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });
    // Patients only their own; Medecin only theirs
    if (req.user.role === "PATIENT" && appt.patientId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (req.user.role === "MEDECIN" && appt.medecinId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch appointment" });
  }
};

// PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });
    // Only Admin/Medecin can update
    if (req.user.role === "PATIENT") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { dateTime, status } = req.body;
    await appt.update({ dateTime, status });
    res.json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update appointment" });
  }
};

// DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });
    // Only Admin/Medecin can delete
    if (req.user.role === "PATIENT") {
      return res.status(403).json({ message: "Forbidden" });
    }
    await appt.destroy();
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete appointment" });
  }
};

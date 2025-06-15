// server/src/controllers/appointmentController.js
const { Appointment, Patient, User } = require("../models");
const { Op } = require("sequelize");

exports.createAppointment = async (req, res) => {
  const { medecinId, dateTime, patientId, notes } = req.body;
console.log("Received request to create appointment:", req.body);
  try {
    console.log("Authenticated User:", req.user);
    console.log("Request Payload:", req.body);

    // Validate doctor
    const doc = await User.findOne({
      where: { id: medecinId, role: "MEDECIN" },
    });
    if (!doc) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    let finalPatientId = patientId;

    // [Patient validation logic - no changes]

    // Parse the date and time from dateTime
    const dtObj = new Date(dateTime);
    const appointmentDate = dtObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const hours = dtObj.getHours().toString().padStart(2, '0');
    const minutes = dtObj.getMinutes().toString().padStart(2, '0');
    const seconds = dtObj.getSeconds().toString().padStart(2, '0');
    const appointmentTime = `${hours}:${minutes}:${seconds}`; // HH:MM:SS

    // Prevent double-booking - using the new fields
    const exists = await Appointment.findOne({
      where: {
        medecinId,
        appointmentDate,
        appointmentTime,
      },
    });
    if (exists) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    // Create the appointment with both old and new fields
    const appt = await Appointment.create({
      patientId: finalPatientId,
      medecinId,
      dateTime, // Keep for backward compatibility
      appointmentDate, // New field
      appointmentTime, // New field
      notes,
    });

    // Fetch and return with patient included!
    const apptWithPatient = await Appointment.findByPk(appt.id, {
      include: [
        { model: Patient, as: 'patient', attributes: ['firstName', 'lastName', 'dossierNumber'] }
      ]
    });

    console.log("Appointment Created:", apptWithPatient);
    return res.status(201).json(apptWithPatient);
  } catch (err) {
    console.error("Error creating appointment:", err);
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
      attributes: ['id', 'appointmentDate', 'appointmentTime', 'dateTime', 'status'],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
      include: [
        { model: Patient, as: 'patient', attributes: ['firstName', 'lastName'] }
      ]
    })
    return res.json(appts)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Could not fetch public appointments' })
  }
};

// GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const where = {};
    // [Filtering logic - no changes]

    const appts = await Appointment.findAll({
      where,
      order: [["appointmentDate", "DESC"], ["appointmentTime", "ASC"]],
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: ["firstName", "lastName", "dossierNumber"],
        },
        { model: User, as: "doctor", attributes: ["name", "email"] },
      ],
    });
    res.json(appts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch appointments" });
  }
};

// Update appointment function
exports.updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only Admin/Medecin can update
    if (req.user.role === "PATIENT") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { dateTime, status, notes } = req.body;
    const updateData = { status, notes };

    // If dateTime is provided, update both dateTime and the new fields
    if (dateTime) {
      const dtObj = new Date(dateTime);
      updateData.dateTime = dateTime;
      updateData.appointmentDate = dtObj.toISOString().split('T')[0];
      
      const hours = dtObj.getHours().toString().padStart(2, '0');
      const minutes = dtObj.getMinutes().toString().padStart(2, '0');
      const seconds = dtObj.getSeconds().toString().padStart(2, '0');
      updateData.appointmentTime = `${hours}:${minutes}:${seconds}`;
    }

    console.log("Payload received:", req.body);
    await appt.update(updateData);
    console.log("Updated Appointment:", appt);

    res.json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update appointment" });
  }
};

// GET /api/appointments/:id

// PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only Admin/Medecin can update
    if (req.user.role === "PATIENT") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { dateTime, status, notes } = req.body;

    console.log("Payload received:", { dateTime, status, notes }); // Log incoming payload
    await appt.update({ dateTime, status, notes });
    console.log("Updated Appointment:", appt); // Log updated appointment
    
    res.json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update appointment" });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: Patient,
          as: "patient",
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

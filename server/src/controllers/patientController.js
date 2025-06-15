// server/src/controllers/patientController.js
const { Patient } = require('../models')
const { Op } = require('sequelize')

// server/src/controllers/patientController.js
exports.createPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      phone,
      address,
      emergencyContact,
      userId: bodyUserId
    } = req.body;

    const userId = bodyUserId || req.user.id;

    // 1. Create patient WITHOUT dossierNumber
    const patient = await Patient.create({
      firstName,
      lastName,
      dateOfBirth,
      userId,
      phone,
      address,
      emergencyContact,
    });

    // 2. Update dossierNumber to PAT+patient.id
    patient.dossierNumber = `PAT${patient.id}`;
    await patient.save();

    res.status(201).json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create patient' });
  }
};



// GET /api/patients
exports.getPatients = async (req, res) => {
  try {
    const where = {}
    if (req.user.role === 'PATIENT') {
      // patients see only their own
      where.userId = req.user.id
    } else if (req.query.search) {
      // existing search logic for ADMIN/MEDECIN
      where[Op.or] = [ /* … */ ]
    }
    const patients = await Patient.findAll({ where, order: [['lastName','ASC']] })
    res.json(patients)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not fetch patients' })
  }
}

// GET /api/patients/:id
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id)
    if (!patient) return res.status(404).json({ message: 'Patient not found' })
    res.json(patient)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not fetch patient' })
  }
}

// PUT /api/patients/:id
exports.updatePatient = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, dossierNumber } = req.body
    const patient = await Patient.findByPk(req.params.id)
    if (!patient) return res.status(404).json({ message: 'Patient not found' })
    await patient.update({ firstName, lastName, dateOfBirth, dossierNumber })
    res.json(patient)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not update patient' })
  }
}

// DELETE /api/patients/:id
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id)
    if (!patient) return res.status(404).json({ message: 'Patient not found' })
    await patient.destroy()
    res.json({ message: 'Patient deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not delete patient' })
  }
}

// GET /api/patients/me
exports.getMyProfile = async (req, res) => {
  try {
    console.log('>> getMyProfile for user', req.user.id)
    const patient = await Patient.findOne({
      where: { userId: req.user.id }
    })
    console.log('>> found patient:', patient)
    if (!patient) return res.status(404).json({ message: 'Profile not found' })
    res.json(patient)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not fetch profile' })
  }
}
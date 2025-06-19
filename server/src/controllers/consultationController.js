const { Consultation, Patient, User } = require('../models')
const { Op } = require('sequelize')

// POST /api/consultations
exports.createConsultation = async (req, res) => {
  try {
    const { patientId, dateTime, notes } = req.body
    const consultation = await Consultation.create({
      patientId,
      medecinId: req.user.id,
      dateTime,
      notes
    })
    res.status(201).json(consultation)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not create consultation' })
  }
}

// GET /api/consultations
exports.getConsultations = async (req, res) => {
  try {
    const where = {}
    if (req.user.role === 'PATIENT') {
      // Find patient profile for this user!
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) {
        return res.json([]); // or 404 if you prefer
      }
      where.patientId = patient.id;
    } else if (req.query.patientId) {
      where.patientId = req.query.patientId
    }

    const consultations = await Consultation.findAll({
      where,
      order: [['dateTime', 'DESC']],
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id','firstName', 'lastName', 'dossierNumber']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'email'] // <--- ADD id HERE!
        }
      ]
    })
  console.log('>> consultations:',consultations);
    res.json(consultations)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not fetch consultations' })
  }
}

// GET /api/consultations/:id
exports.getConsultationById = async (req, res) => {
  try {
    const consult = await Consultation.findByPk(req.params.id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id','firstName', 'lastName', 'dossierNumber', 'userId']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'name', 'email'] // <--- ADD id HERE!
        }
      ]
    })
    if (!consult) return res.status(404).json({ message: 'Consultation not found' })
    if (
      req.user.role === 'PATIENT' &&
      consult.patient &&
      consult.patient.userId !== req.user.id // compare userId, not patientId
    ) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    res.json(consult)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not fetch consultation' })
  }
}

// PUT /api/consultations/:id
exports.updateConsultation = async (req, res) => {
  try {
    const consult = await Consultation.findByPk(req.params.id)
    if (!consult) return res.status(404).json({ message: 'Consultation not found' })
    if (req.user.role === 'PATIENT') {
      return res.status(403).json({ message: 'Patients cannot modify consultations' })
    }
    const { dateTime, notes } = req.body
    await consult.update({ dateTime, notes })
    res.json(consult)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not update consultation' })
  }
}

// DELETE /api/consultations/:id
exports.deleteConsultation = async (req, res) => {
  try {
    const consult = await Consultation.findByPk(req.params.id)
    if (!consult) return res.status(404).json({ message: 'Consultation not found' })
    if (req.user.role === 'PATIENT') {
      return res.status(403).json({ message: 'Patients cannot delete consultations' })
    }
    await consult.destroy()
    res.json({ message: 'Consultation deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Could not delete consultation' })
  }
}
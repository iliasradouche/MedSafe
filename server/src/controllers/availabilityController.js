// server/src/controllers/availabilityController.js
const { Availability } = require('../models');

// GET /api/availabilities/me
exports.getMyAvailabilities = async (req, res) => {
  try {
    const slots = await Availability.findAll({
      where: { doctorId: req.user.id },
      order: [['dayOfWeek','ASC'], ['startTime','ASC']]
    });
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch availabilities' });
  }
};

// POST /api/availabilities
exports.createAvailability = async (req, res) => {
  const { dayOfWeek, startTime, endTime } = req.body;
  try {
    const slot = await Availability.create({
      doctorId: req.user.id,
      dayOfWeek,
      startTime,
      endTime
    });
    res.status(201).json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create availability' });
  }
};

// PUT /api/availabilities/:id
exports.updateAvailability = async (req, res) => {
  try {
    const slot = await Availability.findByPk(req.params.id);
    if (!slot || slot.doctorId !== req.user.id) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    const { dayOfWeek, startTime, endTime } = req.body;
    await slot.update({ dayOfWeek, startTime, endTime });
    res.json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update availability' });
  }
};

// DELETE /api/availabilities/:id
exports.deleteAvailability = async (req, res) => {
  try {
    const slot = await Availability.findByPk(req.params.id);
    if (!slot || slot.doctorId !== req.user.id) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    await slot.destroy();
    res.json({ message: 'Availability deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete availability' });
  }
};

// GET /api/availabilities?doctorId=123
exports.getByDoctor = async (req, res) => {
  const docId = parseInt(req.query.doctorId, 10);
  if (!docId) return res.status(400).json({ message: 'doctorId required' });
  try {
    // ensure doctor exists
    const doc = await require('../models').User.findOne({
      where: { id: docId, role: 'MEDECIN' }
    });
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });

    const slots = await Availability.findAll({
      where: { doctorId: docId },
      order: [['dayOfWeek','ASC'], ['startTime','ASC']]
    });
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch availabilities' });
  }
};

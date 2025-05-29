const router = require('express').Router()
const { getPublicAppointments } = require('../controllers/appointmentController')

// Public: anyone can query a doctor’s booked slots
// e.g. GET /api/public/appointments?doctorId=5
router.get('/', getPublicAppointments)

module.exports = router

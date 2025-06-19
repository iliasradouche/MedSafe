const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/doctorProfileController');

router.get(
  '/doctor/me',
  authenticate,
  authorize('MEDECIN'),
  controller.getMyDoctorProfile
);

router.put(
  '/doctor/me',
  authenticate,
  authorize('MEDECIN'),
  controller.updateMyProfile
);

module.exports = router;
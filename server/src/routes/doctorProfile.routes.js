// server/src/routes/doctorProfile.routes.js
const router = require('express').Router();
const controller = require('../controllers/doctorProfileController');
const { authenticate, authorize } = require('../middleware/auth');

// MUST come before any /:id route if you add one later
router.get(
  '/me',
  authenticate,
  authorize('MEDECIN','ADMIN'),
  controller.getMyDoctorProfile
);

router.put(
  '/me',
  authenticate,
  authorize('MEDECIN','ADMIN'),
  controller.updateMyProfile    // implement updating the profile in this controller
);

module.exports = router;

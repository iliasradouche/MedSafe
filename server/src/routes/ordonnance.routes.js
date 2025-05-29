// server/src/routes/ordonnance.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/ordonnanceController');
const { authenticate, authorize } = require('../middleware/auth');

// Only ADMIN & MEDECIN can create/update/delete
router.post(
  '/',
  authenticate,
  authorize('ADMIN','MEDECIN'),
  ctrl.createOrdonnance
);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN','MEDECIN'),
  ctrl.updateOrdonnance
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN','MEDECIN'),
  ctrl.deleteOrdonnance
);

// All roles can GET list or single; patients only see theirs
router.get(
  '/',
  authenticate,
  authorize('ADMIN','MEDECIN','PATIENT'),
  ctrl.getOrdonnances
);
router.get(
  '/:id',
  authenticate,
  authorize('ADMIN','MEDECIN','PATIENT'),
  ctrl.getOrdonnanceById
);

// PDF download endpoint
router.get(
  '/:id/pdf',
  authenticate,
  authorize('ADMIN','MEDECIN','PATIENT'),
  ctrl.getOrdonnancePdf
);

module.exports = router;

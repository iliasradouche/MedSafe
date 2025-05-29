// server/src/routes/consultation.routes.js
const router = require("express").Router();
const controller = require("../controllers/consultationController");
const { authenticate, authorize } = require("../middleware/auth");

// ADMIN & MEDECIN can manage; PATIENT can view their own
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "MEDECIN"),
  controller.createConsultation
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "MEDECIN", "PATIENT"),
  controller.getConsultations
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "MEDECIN", "PATIENT"),
  controller.getConsultationById
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "MEDECIN"),
  controller.updateConsultation
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "MEDECIN"),
  controller.deleteConsultation
);

module.exports = router;

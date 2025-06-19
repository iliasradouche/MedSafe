// server/src/routes/appointment.routes.js
const router = require("express").Router();
const ctrl = require("../controllers/appointmentController");
const { authenticate, authorize } = require("../middleware/auth");

console.log("Loaded appointment routes:", new Date().toISOString());
// PATIENT can create their own, ADMIN/MEDECIN can create for any
router.post("/", authenticate, authorize("MEDECIN","PATIENT"), ctrl.createAppointment);

// List & filter
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "MEDECIN", "PATIENT"),
  ctrl.getAppointments
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "MEDECIN", "PATIENT"),
  ctrl.getAppointmentById
);

// Only ADMIN/MEDECIN can update or delete
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "MEDECIN"),
  ctrl.updateAppointment
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "MEDECIN"),
  ctrl.deleteAppointment
);

module.exports = router;

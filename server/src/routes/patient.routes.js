// server/src/routes/patient.routes.js
const router = require("express").Router();
const controller = require("../controllers/patientController");
const { authenticate, authorize } = require("../middleware/auth");

// Only ADMIN and MEDECIN can manage patients
const roles = ["ADMIN", "MEDECIN"];

router.post("/", authenticate, authorize(...roles), controller.createPatient);

router.get("/", authenticate, authorize(...roles), controller.getPatients);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "MEDECIN", "PATIENT"),
  controller.getPatients
);
router.get(
  '/me',
  authenticate,
  authorize('PATIENT','MEDECIN','ADMIN'),
  controller.getMyProfile
);
router.get(
  "/:id",
  authenticate,
  authorize(...roles),
  controller.getPatientById
);

router.put("/:id", authenticate, authorize(...roles), controller.updatePatient);

router.delete(
  "/:id",
  authenticate,
  authorize(...roles),
  controller.deletePatient
);


module.exports = router;

const router = require("express").Router();
const ctrl = require("../controllers/availabilityController");
const { authenticate, authorize } = require("../middleware/auth");

// All routes require login + MEDECIN or ADMIN
router.get(
  "/me",
  authenticate,
  authorize("MEDECIN", "ADMIN"),
  ctrl.getMyAvailabilities
);

router.get(
  "/",ctrl.getByDoctor
);

router.post(
  "/",
  authenticate,
  authorize("MEDECIN", "ADMIN"),
  ctrl.createAvailability
);

router.put(
  "/:id",
  authenticate,
  authorize("MEDECIN", "ADMIN"),
  ctrl.updateAvailability
);

router.delete(
  "/:id",
  authenticate,
  authorize("MEDECIN", "ADMIN"),
  ctrl.deleteAvailability
);

module.exports = router;

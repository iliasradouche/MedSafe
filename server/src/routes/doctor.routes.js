const router = require("express").Router();
const controller = require("../controllers/doctorController");
const { authenticate } = require("../middleware/auth");

// Public: list all doctors
router.get("/", controller.getAllDoctors);
router.get("/:id", controller.getDoctorById);

module.exports = router;

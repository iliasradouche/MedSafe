// server/src/controllers/doctorController.js
const { User, DoctorProfile } = require("../models");
// to fetch for the patients
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: "MEDECIN" },
      attributes: ["id", "name", "email"],
      include: [
        {
          model: DoctorProfile,
          as: "doctorProfile",
          attributes: ["specialization"],
          required: false,
        },
      ],
    });
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch doctors" });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doc = await User.findOne({
      where: { id: req.params.id, role: "MEDECIN" },
      attributes: ["id", "name", "email"],
      include: [
        {
          model: DoctorProfile,
          as: "doctorProfile",
          attributes: ["specialization"],
          required: false,
        },
      ],
    });
    if (!doc) return res.status(404).json({ message: "Doctor not found" });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch doctor" });
  }
};

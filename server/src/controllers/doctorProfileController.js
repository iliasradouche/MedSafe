// server/src/controllers/doctorProfileController.js
const { DoctorProfile, User } = require('../models');

exports.getMyDoctorProfile = async (req, res) => {
  try {
    // include the User data if you want name/email
    const profile = await DoctorProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch doctor profile' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    // 1) find the profile tied to this user
    const profile = await DoctorProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: User }]
    });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // 2) only allow these fields to be updated
    const { licenseNumber, specialization, phone, address } = req.body;
    await profile.update({ licenseNumber, specialization, phone, address });

    // 3) return the updated profile, including the user's name/email
    const updated = await DoctorProfile.findOne({
      where: { userId: req.user.id },
      include: [{ model: User }]
    });
    res.json(updated);
  } catch (err) {
    console.error('Error in updateMyProfile:', err);
    res.status(500).json({ message: 'Could not update profile' });
  }
};
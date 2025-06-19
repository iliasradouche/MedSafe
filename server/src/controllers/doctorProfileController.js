const { DoctorProfile, User } = require('../models');

// Middleware to ensure only MEDECIN can access these endpoints
function requireDoctorRole(req, res, next) {
  if (req.user.role !== 'MEDECIN') {
    return res.status(403).json({ message: 'Access denied. Doctors only.' });
  }
  next();
}

exports.requireDoctorRole = requireDoctorRole;

// GET /api/doctor/me
exports.getMyDoctorProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ]
    });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    // Optional: flatten the response for frontend
    res.json({
      id: profile.id,
      userId: profile.userId,
      name: profile.user.name,
      email: profile.user.email,
      licenseNumber: profile.licenseNumber,
      specialization: profile.specialization,
      phone: profile.phone,
      address: profile.address,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch doctor profile' });
  }
};

// PUT /api/doctor/me
exports.updateMyProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ]
    });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Only update fields actually provided
    const updateFields = {};
    ['licenseNumber', 'specialization', 'phone', 'address'].forEach(field => {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field];
    });
    await profile.update(updateFields);

    // Update user name/email if provided
    const userUpdate = {};
    if (req.body.name && req.body.name !== profile.user.name) userUpdate.name = req.body.name;
    if (req.body.email && req.body.email !== profile.user.email) userUpdate.email = req.body.email;
    if (Object.keys(userUpdate).length > 0) {
      await User.update(userUpdate, { where: { id: profile.userId } });
    }

    // Return the updated profile
    const updated = await DoctorProfile.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ]
    });
    res.json({
      id: updated.id,
      userId: updated.userId,
      name: updated.user.name,
      email: updated.user.email,
      licenseNumber: updated.licenseNumber,
      specialization: updated.specialization,
      phone: updated.phone,
      address: updated.address,
    });
  } catch (err) {
    console.error('Error in updateMyProfile:', err);
    res.status(500).json({ message: 'Could not update profile' });
  }
};
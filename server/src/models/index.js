const sequelize        = require('../database');
const User             = require('./User');
const Patient          = require('./Patient');
const Consultation     = require('./Consultations');
const Appointment      = require('./Appointement');
const Ordonnance       = require('./Ordonnance');
const DoctorProfile    = require('./DoctorProfile');
const Availability     = require('./Availability')

// 1) DoctorProfile ↔ User
User.hasOne(DoctorProfile,    { foreignKey: 'userId' });
DoctorProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Availability, { foreignKey: 'doctorId' });
Availability.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

// 2) Existing associations...
User.hasMany(Consultation,     { as: 'consultations', foreignKey: 'medecinId' });
Consultation.belongsTo(User,   { as: 'medecin',       foreignKey: 'medecinId' });

Patient.hasMany(Consultation,  { foreignKey: 'patientId' });
Consultation.belongsTo(Patient,{ foreignKey: 'patientId' });

Consultation.hasOne(Ordonnance,    { foreignKey: 'consultationId' });
Ordonnance.belongsTo(Consultation, { foreignKey: 'consultationId' });

Patient.hasMany(Appointment,       { foreignKey: 'patientId' });
Appointment.belongsTo(Patient,     { foreignKey: 'patientId' });

User.hasMany(Appointment,          { as: 'appointments', foreignKey: 'medecinId' });
Appointment.belongsTo(User,        { as: 'medecin',      foreignKey: 'medecinId' });

User.hasOne(Patient,    { foreignKey: 'userId' });
Patient.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  DoctorProfile,    // ← make sure this is exported!
  Patient,
  Consultation,
  Appointment,
  Ordonnance,
  Availability
};

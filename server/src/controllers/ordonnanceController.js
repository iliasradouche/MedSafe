// server/src/controllers/ordonnanceController.js
const PDFDocument = require('pdfkit');
const { Ordonnance, Consultation, Patient, User } = require('../models');

// POST /api/ordonnances
exports.createOrdonnance = async (req, res) => {
  try {
    const { consultationId, prescription } = req.body;
    // ensure consultation exists
    const consult = await Consultation.findByPk(consultationId);
    if (!consult) return res.status(404).json({ message: 'Consultation not found' });

    const ord = await Ordonnance.create({ consultationId, prescription });
    res.status(201).json(ord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create ordonnance' });
  }
};

// GET /api/ordonnances
exports.getOrdonnances = async (req, res) => {
  try {
    const where = {};
    // Patients only see their own ordonnances
    if (req.user.role === 'PATIENT') {
      const consults = await Consultation.findAll({
        where: { patientId: req.user.id },
        attributes: ['id']
      });
      where.consultationId = consults.map(c => c.id);
    }
    const ords = await Ordonnance.findAll({
      where,
      order: [['id', 'DESC']]
    });
    res.json(ords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch ordonnances' });
  }
};

// GET /api/ordonnances/:id
exports.getOrdonnanceById = async (req, res) => {
  try {
    const ord = await Ordonnance.findByPk(req.params.id, {
      include: [
        { model: Consultation, include: [{ model: Patient }, { model: User, as: 'medecin' }] }
      ]
    });
    if (!ord) return res.status(404).json({ message: 'Ordonnance not found' });
    // If patient, ensure it’s theirs
    if (req.user.role === 'PATIENT' && ord.Consultation.patientId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(ord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch ordonnance' });
  }
};

// PUT /api/ordonnances/:id
exports.updateOrdonnance = async (req, res) => {
  try {
    const ord = await Ordonnance.findByPk(req.params.id);
    if (!ord) return res.status(404).json({ message: 'Ordonnance not found' });
    const { prescription } = req.body;
    await ord.update({ prescription });
    res.json(ord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update ordonnance' });
  }
};

// DELETE /api/ordonnances/:id
exports.deleteOrdonnance = async (req, res) => {
  try {
    const ord = await Ordonnance.findByPk(req.params.id);
    if (!ord) return res.status(404).json({ message: 'Ordonnance not found' });
    await ord.destroy();
    res.json({ message: 'Ordonnance deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete ordonnance' });
  }
};

// GET /api/ordonnances/:id/pdf
exports.getOrdonnancePdf = async (req, res) => {
  try {
    const ord = await Ordonnance.findByPk(req.params.id, {
      include: [
        { model: Consultation, include: [{ model: Patient }, { model: User, as: 'medecin' }] }
      ]
    });
    if (!ord) return res.status(404).json({ message: 'Ordonnance not found' });
    // Patients can only download their own
    if (req.user.role === 'PATIENT' && ord.Consultation.patientId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ordonnance_${ord.id}.pdf"`
    );
    doc.pipe(res);

    doc.fontSize(18).text('Ordonnance Médicale', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Patient: ${ord.Consultation.Patient.firstName} ${ord.Consultation.Patient.lastName}`);
    doc.text(`Dossier N°: ${ord.Consultation.Patient.dossierNumber}`);
    doc.text(`Médecin: ${ord.Consultation.medecin.name}`);
    doc.text(`Date: ${ord.Consultation.dateTime.toLocaleString()}`);
    doc.moveDown();
    doc.text('Prescription:', { underline: true });
    doc.moveDown();
    doc.text(ord.prescription);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not generate PDF' });
  }
};

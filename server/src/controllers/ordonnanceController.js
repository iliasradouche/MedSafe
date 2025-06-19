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
    if (req.user.role === 'PATIENT') {
      // Find patient profile for this user
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) return res.json([]);
      const consults = await Consultation.findAll({
        where: { patientId: patient.id },
        attributes: ['id']
      });
      const consultIds = consults.map(c => c.id);
      where.consultationId = consultIds;
    }

    const ords = await Ordonnance.findAll({
      where,
      order: [['id', 'DESC']],
      include: [
        {
          model: Consultation,
          as: 'consultation',
          attributes: ['id', 'dateTime', 'patientId', 'medecinId'],
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['id', 'firstName', 'lastName', 'dossierNumber', 'userId']
            },
            {
              model: User,
              as: 'doctor', // Use the same alias everywhere!
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
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
        {
          model: Consultation,
          as: 'consultation',
          attributes: ['id', 'dateTime', 'patientId', 'medecinId'],
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['id', 'firstName', 'lastName', 'dossierNumber', 'userId']
            },
            {
              model: User,
              as: 'doctor', // Use the same alias as above
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });
    if (!ord) return res.status(404).json({ message: 'Ordonnance not found' });
    // If patient, ensure it’s theirs (compare with patient.userId not patientId)
    if (req.user.role === 'PATIENT') {
      if (!ord.consultation || !ord.consultation.patient || ord.consultation.patient.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
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
        {
          model: Consultation,
          as: 'consultation',
          attributes: ['id', 'dateTime', 'patientId', 'medecinId'],
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['id', 'firstName', 'lastName', 'dossierNumber', 'userId']
            },
            {
              model: User,
              as: 'doctor',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!ord) {
      return res.status(404).json({ message: 'Ordonnance not found' });
    }

    // Patients can only download their own ordonnances
    if (
      req.user.role === 'PATIENT' &&
      (!ord.consultation || !ord.consultation.patient || ord.consultation.patient.userId !== req.user.id)
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // PDF generation
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ordonnance_${ord.id}.pdf"`
    );
    doc.pipe(res);

    // Header
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('Cabinet Médical MedSafe', { align: 'center' })
      .moveDown(0.2);

    // Draw a line under header
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Patient and doctor info
    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica');

    doc.text(`Patient : ${ord.consultation.patient ? `${ord.consultation.patient.firstName} ${ord.consultation.patient.lastName}` : 'Inconnu'}`);
    doc.text(`Dossier N° : ${ord.consultation.patient ? ord.consultation.patient.dossierNumber : 'Inconnu'}`);
    doc.text(`Médecin : ${ord.consultation.doctor ? ord.consultation.doctor.name : 'Inconnu'}`);
    doc.text(`Date de consultation : ${ord.consultation.dateTime ? new Date(ord.consultation.dateTime).toLocaleString('fr-FR') : 'Inconnue'}`);
    doc.moveDown();

    // Prescription section
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('Prescription', { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(ord.prescription || 'Aucune prescription renseignée.', {
        indent: 20,
        align: 'left'
      })
      .moveDown(2);

    // Footer/signature
    doc
      .fontSize(12)
      .font('Helvetica')
      .text('Signature du médecin :', 50, doc.y + 20)
      .moveDown(3);

    doc
      .fontSize(10)
      .font('Helvetica-Oblique')
      .text('Document généré par MedSafe', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('Error generating PDF:', err);

    if (!res.headersSent) {
      res.status(500).json({ message: 'Could not generate PDF' });
    }
  }
};
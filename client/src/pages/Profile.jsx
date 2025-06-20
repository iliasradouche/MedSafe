import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import api from '../api/axios';
import useAuth from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Typography,
  Space,
  Row,
  Col,
} from 'antd';
import {
  EditOutlined,
  DownloadOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  MailOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Loading from '../components/Loading';
import DoctorStats from '../components/DoctorStats';
const { Text, Title } = Typography;

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [ordonnances, setOrdonnances] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Charger le profil en fonction du rôle
  const loadProfile = async () => {
    try {
      if (user.role === 'PATIENT') {
        const res = await api.get('/patients/me');
        setProfile(res.data);
      } else {
        const res = await api.get('/doctor/me');
        setProfile(res.data);
      }
    } catch (err) {
      message.error('Impossible de charger le profil');
    }
  };

  // 1. Load profile when user changes
  useEffect(() => {
    loadProfile();
    // Do NOT fetch consultations/appointments here!
  }, [user.role, user.id]);

  // 2. Load consultations/appointments/ordonnances when profile is loaded (for PATIENT)
  useEffect(() => {
    if (user.role === 'PATIENT' && profile) {
      api.get('/consultations')
        .then((res) => {
          const patientConsults = res.data.filter((c) => c.patientId === profile.id && new Date(c.dateTime) < new Date());
          setConsultations(patientConsults);
        })
        .catch(() => {});

      api.get('/appointments')
      .then((res) => {
        const allAppts = res.data.filter((a) => a.patientId === profile.id);
        setAppointments(allAppts);
        const now = new Date();
        setPastAppointments(allAppts.filter((a) => new Date(a.dateTime) < now));
      })
      .catch(() => {});

      api.get('/ordonnances')
        .then((res) => {
          const myOrdonnances = res.data.filter(
            o =>
              o.consultation &&
              (
                o.consultation.patientId === profile.id ||
                (o.consultation.patient && o.consultation.patient.id === profile.id)
              )
          );
          setOrdonnances(myOrdonnances);
        })
        .catch(() => {});
    }
  }, [user.role, profile]);

  // Load data for doctors (appointments, consultations, ordonnances)
useEffect(() => {
  if (user.role !== 'PATIENT' && profile) {
    console.log('[DOCTOR DASHBOARD] Loading data for doctor. User ID:', user.id, 'Profile ID:', profile.id);
    
    // Fetch appointments
    api.get('/appointments')
      .then((res) => {
        console.log('[DOCTOR DASHBOARD] All appointments received:', res.data.length);
        
        // Filter appointments for this specific doctor using the USER ID
        const doctorAppointments = res.data.filter((a) => {
          const isDoctorMatch = a.medecinId === user.id;
          const isFutureAppointment = new Date(a.dateTime) > new Date();
          
          return isDoctorMatch && isFutureAppointment;
        });
        
        console.log('[DOCTOR DASHBOARD] Filtered doctor appointments:', doctorAppointments.length);
        setAppointments(doctorAppointments);
      })
      .catch((err) => {
        console.error('[DOCTOR DASHBOARD] Error fetching appointments:', err);
      });
    
    // Fetch consultations
    api.get('/consultations')
      .then((res) => {
        console.log('[DOCTOR DASHBOARD] All consultations received:', res.data.length);
        
        // Filter consultations for this specific doctor using the USER ID
        const doctorConsultations = res.data.filter((c) => {
          const isDoctorMatch = 
            c.medecinId === user.id || 
            (c.doctor && c.doctor.id === user.id) ||
            (c.medecin && c.medecin.id === user.id);
          
          const isPastConsultation = new Date(c.dateTime) < new Date();
          
          return isDoctorMatch && isPastConsultation;
        });
        
        console.log('[DOCTOR DASHBOARD] Filtered doctor consultations:', doctorConsultations.length);
        setConsultations(doctorConsultations);
      })
      .catch((err) => {
        console.error('[DOCTOR DASHBOARD] Error fetching consultations:', err);
      });
    
    // Fetch ordonnances
    api.get('/ordonnances')
      .then((res) => {
        console.log('[DOCTOR DASHBOARD] All ordonnances received:', res.data.length);
        
        // Filter ordonnances for this specific doctor using the USER ID
        const doctorOrdonnances = res.data.filter((o) => {
          const isDoctorMatch = o.consultation && (
            o.consultation.medecinId === user.id || 
            (o.consultation.doctor && o.consultation.doctor.id === user.id) ||
            (o.consultation.medecin && o.consultation.medecin.id === user.id)
          );
          
          return isDoctorMatch;
        });
        
        console.log('[DOCTOR DASHBOARD] Filtered doctor ordonnances:', doctorOrdonnances.length);
        setOrdonnances(doctorOrdonnances);
      })
      .catch((err) => {
        console.error('[DOCTOR DASHBOARD] Error fetching ordonnances:', err);
      });
  }
}, [user.role, profile, user.id]); // Include user.id in dependencies

  // Ouvrir la modale d'édition et définir les valeurs initiales
  const showEditModal = () => {
    const initial = {};
    if (user.role === 'PATIENT') {
      initial.firstName = profile.firstName;
      initial.lastName = profile.lastName;
      initial.dateOfBirth = profile.dateOfBirth ? moment(profile.dateOfBirth) : null;
      initial.phone = profile.phone;
      initial.address = profile.address;
      initial.emergencyContact = profile.emergencyContact;
    } else {
      initial.name = profile.name;
      initial.email = profile.email;
      initial.licenseNumber = profile.licenseNumber;
      initial.specialization = profile.specialization;
      initial.phone = profile.phone;
      initial.address = profile.address;
      initial.ville = profile.ville;
    }
    form.setFieldsValue(initial);
    setIsModalVisible(true);
  };

  // Gérer la sauvegarde
  const handleOk = async () => {
    try {
      message.loading({ content: 'Enregistrement du profil...', key: 'profile' });
      const values = await form.validateFields();
      const payload = { ...values };
      if (values.dateOfBirth) {
        payload.dateOfBirth = values.dateOfBirth.format('YYYY-MM-DD');
      }
      const url = user.role === 'PATIENT' ? '/patients/me' : '/doctor/me';
      await api.put(url, payload);
      await loadProfile();
      message.success({ content: 'Profil mis à jour avec succès', key: 'profile', duration: 2 });
      setIsModalVisible(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Échec de la mise à jour';
      message.error({ content: errMsg, key: 'profile', duration: 2 });
    }
  };

  const handleCancel = () => setIsModalVisible(false);

  // Rendre les champs de profil avec icônes et traductions
  const renderProfileField = (icon, label, value) => (
    <Space>
      {icon}
      <Text>
        <b>{label} :</b> {value || 'N/A'}
      </Text>
    </Space>
  );

  // Liste des médecins passés pour le patient (consultations + appointments)
  const pastDoctors = useMemo(() => {
    if (user.role !== 'PATIENT') return [];
    const uniqueDoctors = {};

    // From consultations
    consultations.forEach((c) => {
      const doc = c.doctor || c.medecin;
      if (doc && doc.id) uniqueDoctors[doc.id] = doc;
    });

    // From appointments (if API includes doctor info)
    appointments.forEach((a) => {
      const doc = a.doctor || a.medecin;
      if (doc && doc.id) uniqueDoctors[doc.id] = doc;
    });

    return Object.values(uniqueDoctors);
  }, [consultations, appointments, user.role]);

  // Colonnes pour consultations (médecin ET patient)
  const consultColumns = user.role === 'PATIENT'
    ? [
        {
          title: 'Date & Heure',
          dataIndex: 'dateTime',
          key: 'dateTime',
          render: (dt) => new Date(dt).toLocaleString(),
        },
        { title: 'Notes', dataIndex: 'notes', key: 'notes' },
        {
          title: 'Médecin',
          key: 'doctor',
          render: (_, record) =>
            record.doctor
              ? `${record.doctor.name}`
              : record.medecin
                ? `${record.medecin.name}`
                : 'N/A',
        },
      ]
    : [
        {
          title: 'Patient',
          key: 'patient',
          render: (_, record) =>
            record.patient
              ? `${record.patient.firstName} ${record.patient.lastName} (${record.patient.dossierNumber})`
              : 'N/A',
        },
        {
          title: 'Date & Heure',
          dataIndex: 'dateTime',
          key: 'dateTime',
          render: (dt) => new Date(dt).toLocaleString(),
        },
        { title: 'Notes', dataIndex: 'notes', key: 'notes' },
      ];

  // Colonnes pour ordonnances
  const ordCols = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (dt) => dt ? new Date(dt).toLocaleDateString() : 'N/A',
    },
    user.role === 'PATIENT'
      ? {
          title: 'Médecin',
          key: 'ord_doctor',
          render: (_, record) =>
            record.consultation && record.consultation.doctor
              ? record.consultation.doctor.name
              : record.consultation && record.consultation.medecin
                ? record.consultation.medecin.name
                : 'N/A',
        }
      : {
          title: 'Patient',
          key: 'ord_patient',
          render: (_, record) =>
            record.consultation && record.consultation.patient
              ? `${record.consultation.patient.firstName} ${record.consultation.patient.lastName} (${record.consultation.patient.dossierNumber})`
              : 'N/A',
        },
    {
      title: 'Consultation',
      key: 'consult_date',
      render: (_, record) =>
        record.consultation
          ? new Date(record.consultation.dateTime).toLocaleString()
          : 'N/A',
    },
    {
      title: 'Prescription',
      dataIndex: 'prescription',
      key: 'prescription',
      ellipsis: true,
    },
    {
      title: 'Télécharger',
      key: 'download',
      render: (_, record) => (
        <Button
          icon={<DownloadOutlined />}
          type="link"
          onClick={async () => {
            const blob = await api
              .get(`/ordonnances/${record.id}/pdf`, { responseType: 'blob' })
              .then((r) => r.data);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `ordonnance_${record.id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
          }}
        />
      ),
    },
  ];

  // Colonnes pour rendez-vous (docteur uniquement)
  const apptColumns = [
    {
      title: 'Date & Heure',
      dataIndex: 'dateTime',
      key: 'dateTime',
      render: (dt) => new Date(dt).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/appointments`)}>
          Voir
        </Button>
      ),
    },
  ];

  if (!profile) return <Loading />;
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: 'auto' }}>
      {/* Carte de profil */}
      {user.role !== 'PATIENT' && (
        <DoctorStats userId={user.id} />
      )}
      <Card
        title={<Title level={3}>Mon Profil</Title>}
        extra={<Button icon={<EditOutlined />} onClick={showEditModal}>Modifier</Button>}
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            {user.role === 'PATIENT' ? (
              <Space direction="vertical" size="middle">
                {renderProfileField(<UserOutlined />, 'Nom', `${profile.firstName} ${profile.lastName}`)}
                {renderProfileField(<CalendarOutlined />, 'Date de naissance', new Date(profile.dateOfBirth).toLocaleDateString())}
                {renderProfileField(<PhoneOutlined />, 'Téléphone', profile.phone)}
                {renderProfileField(<HomeOutlined />, 'Adresse', profile.address)}
                {renderProfileField(<IdcardOutlined />, "Contact d'urgence", profile.emergencyContact)}
              </Space>
            ) : (
              <Space direction="vertical" size="middle">
                {renderProfileField(<UserOutlined />, 'Nom', profile.name)}
                {renderProfileField(<MailOutlined />, 'Email', profile.email)}
                {renderProfileField(<IdcardOutlined />, 'Numéro de licence', profile.licenseNumber)}
                {renderProfileField(<UserOutlined />, 'Spécialisation', profile.specialization)}
                {renderProfileField(<PhoneOutlined />, 'Téléphone', profile.phone)}
                {renderProfileField(<HomeOutlined />, 'Adresse', profile.address)}
                 {renderProfileField(<HomeOutlined />, 'Ville', profile.ville)}
              </Space>
            )}
          </Col>
        </Row>
      </Card>

{user.role === 'PATIENT' && (
  <Card title="Mes rendez-vous passés" style={{ marginBottom: '24px', borderRadius: '8px' }}>
    <Table
      dataSource={pastAppointments}
      columns={[
        {
          title: 'Date & Heure',
          dataIndex: 'dateTime',
          key: 'dateTime',
          render: (dt) => new Date(dt).toLocaleString(),
        },
        {
          title: 'Médecin',
          key: 'doctor',
          render: (_, record) =>
            record.doctor
              ? `${record.doctor.name}`
              : record.medecin
                ? `${record.medecin.name}`
                : 'N/A',
        },
        {
          title: 'Motif',
          dataIndex: 'motif',
          key: 'motif',
        },
      ]}
      rowKey="id"
      pagination={{ pageSize: 5 }}
    />
  </Card>
)}
      {/* Patient: Consultations personnelles */}
      {user.role === 'PATIENT' && (
        <Card title="Mes consultations récentes" style={{ marginBottom: '24px', borderRadius: '8px' }}>
          <Table
            dataSource={consultations}
            columns={consultColumns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}

      {/* Patient: Ordonnances */}
      {user.role === 'PATIENT' && (
        <Card title="Mes ordonnances récentes" style={{ marginBottom: '24px', borderRadius: '8px' }}>
          <Table
            dataSource={ordonnances}
            columns={ordCols}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}

      {/* Patient: Médecins passés */}
      {user.role === 'PATIENT' && (
        <Card title="Mes médecins passés" style={{ marginBottom: '24px', borderRadius: '8px' }}>
          <Table
            dataSource={pastDoctors}
            columns={[
              {
                title: 'Nom du médecin',
                dataIndex: 'name',
                key: 'name',
                render: (name, record) => name || record?.user?.name || 'N/A'
              },
              {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
                render: (email, record) => email || record?.user?.email || 'N/A'
              }
            ]}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}

      {/* Docteur: Rendez-vous à venir */}
      {user.role !== 'PATIENT' && (
        <Card title="Rendez-vous à venir" style={{ marginBottom: '24px', borderRadius: '8px' }}>
          <Table
            dataSource={appointments}
            columns={apptColumns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}

      {/* Docteur: Consultations passées */}
      {user.role !== 'PATIENT' && (
        <Card title="Consultations passées" style={{ marginBottom: '24px', borderRadius: '8px' }}>
          <Table
            dataSource={consultations}
            columns={consultColumns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}

      {/* Docteur: Ordonnances */}
      {user.role !== 'PATIENT' && (
        <Card title="Mes Ordonnances" style={{ borderRadius: '8px' }}>
          <Table
            dataSource={ordonnances}
            columns={ordCols}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}

      {/* Modale d'édition */}
      <Modal
        title="Modifier le Profil"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Sauvegarder"
        cancelText="Annuler"
      >
        <Form layout="vertical" form={form}>
          {user.role === 'PATIENT' ? (
            <>
              <Form.Item name="firstName" label="Prénom" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="lastName" label="Nom" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="dateOfBirth" label="Date de naissance" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="phone" label="Téléphone">
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Adresse">
                <Input />
              </Form.Item>
              <Form.Item name="emergencyContact" label="Contact d'urgence">
                <Input />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="name" label="Nom">
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>
              <Form.Item name="licenseNumber" label="Numéro de licence">
                <Input />
              </Form.Item>
              <Form.Item name="specialization" label="Spécialisation">
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Téléphone">
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Adresse">
                <Input />
              </Form.Item>
              <Form.Item name="ville" label="Ville">
                <Input />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
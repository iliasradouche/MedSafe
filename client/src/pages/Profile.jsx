import React, { useState, useEffect } from 'react';
import moment from 'moment';
import api from '../api/axios';
import { fetchMyDoctorProfile } from '../api/doctorProfiles';
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
  Divider,
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

const { Text, Title } = Typography;

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [ordonnances, setOrdonnances] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Charger le profil en fonction du rôle
  const loadProfile = async () => {
    try {
      if (user.role === 'PATIENT') {
        const res = await api.get('/patients/me');
        setProfile(res.data);
      } else {
        const doc = await fetchMyDoctorProfile();
        setProfile(doc);
      }
    } catch (err) {
      message.error('Impossible de charger le profil');
    }
  };

  // Chargement initial des données
  useEffect(() => {
    loadProfile();
    api.get('/appointments')
      .then((res) => setAppointments(res.data.filter((a) => new Date(a.dateTime) > new Date())))
      .catch(() => {});
    api.get('/consultations')
      .then((res) => setConsultations(res.data.filter((c) => new Date(c.dateTime) < new Date())))
      .catch(() => {});
    api.get('/ordonnances')
      .then((res) => setOrdonnances(res.data))
      .catch(() => {});
  }, [user.role]);

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
      initial.name = profile.user.name;
      initial.email = profile.user.email;
      initial.licenseNumber = profile.licenseNumber;
      initial.specialization = profile.specialization;
      initial.phone = profile.phone;
      initial.address = profile.address;
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
      const url = user.role === 'PATIENT' ? '/patients/me' : '/doctor-profiles/me';
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

  if (!profile) return <Loading />;

  // Rendre les champs de profil avec icônes et traductions
  const renderProfileField = (icon, label, value) => (
    <Space>
      {icon}
      <Text>
        <b>{label} :</b> {value || 'N/A'}
      </Text>
    </Space>
  );

  // Définition des colonnes des tableaux
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

  const consultColumns = [
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

  const ordCols = [
  {
    title: 'Date',
    dataIndex: 'createdAt',
    key: 'date',
    render: (dt) => dt ? new Date(dt).toLocaleDateString() : 'N/A',
  },
  {
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

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: 'auto' }}>
      {/* Carte de profil */}
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
                {renderProfileField(<IdcardOutlined />, 'Contact d\'urgence', profile.emergencyContact)}
              </Space>
            ) : (
              <Space direction="vertical" size="middle">
                {renderProfileField(<UserOutlined />, 'Nom', profile.user?.name)}
                {renderProfileField(<MailOutlined />, 'Email', profile.user?.email)}
                {renderProfileField(<IdcardOutlined />, 'Numéro de licence', profile.licenseNumber)}
                {renderProfileField(<UserOutlined />, 'Spécialisation', profile.specialization)}
                {renderProfileField(<PhoneOutlined />, 'Téléphone', profile.phone)}
                {renderProfileField(<HomeOutlined />, 'Adresse', profile.address)}
              </Space>
            )}
          </Col>
        </Row>
      </Card>

      {/* Rendez-vous */}
      <Card title="Rendez-vous à venir" style={{ marginBottom: '24px', borderRadius: '8px' }}>
        <Table
          dataSource={appointments}
          columns={apptColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Consultations */}
      <Card title="Consultations passées" style={{ marginBottom: '24px', borderRadius: '8px' }}>
        <Table
          dataSource={consultations}
          columns={consultColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Ordonnances */}
      <Card title="Mes Ordonnances" style={{ borderRadius: '8px' }}>
        <Table
          dataSource={ordonnances}
          columns={ordCols}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

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
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
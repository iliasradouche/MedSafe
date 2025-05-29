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
  Space
} from 'antd';
import {
  EditOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Text } = Typography;

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [ordonnances, setOrdonnances] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Load profile by role
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
      console.error('Profile load error', err);
      message.error('Could not load profile');
    }
  };

  // Initial data load
  useEffect(() => {
    loadProfile();
    api.get('/appointments')
      .then(res => setAppointments(res.data.filter(a => new Date(a.dateTime) > new Date())))
      .catch(() => { });
    api.get('/consultations')
      .then(res => setConsultations(res.data.filter(c => new Date(c.dateTime) < new Date())))
      .catch(() => { });
    api.get('/ordonnances')
      .then(res => setOrdonnances(res.data))
      .catch(() => { });
  }, [user.role]);

  // Open edit modal and set initial values
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
      initial.licenseNumber = profile.licenseNumber;
      initial.specialization = profile.specialization;
      initial.phone = profile.phone;
      initial.address = profile.address;
    }
    form.setFieldsValue(initial);
    setIsModalVisible(true);
  };

  // Handle save
  const handleOk = async () => {
    try {
      message.loading({ content: 'Saving profile...', key: 'profile' });
      const values = await form.validateFields();
      const payload = { ...values };
      if (values.dateOfBirth) {
        payload.dateOfBirth = values.dateOfBirth.format('YYYY-MM-DD');
      }
      const url = user.role === 'PATIENT'
        ? '/patients/me'
        : '/doctor-profiles/me';
      console.log('Updating profile at', url, payload);
      await api.put(url, payload);
      console.log('Profile update succeeded, reloading profile');
      await loadProfile();
      message.success({ content: 'Profile updated', key: 'profile', duration: 2 });
      setIsModalVisible(false);
    } catch (err) {
      console.error('Update error', err);
      const errMsg = err.response?.data?.message || err.message || 'Update failed';
      message.error({ content: errMsg, key: 'profile', duration: 2 });
    }
  };

  const handleCancel = () => setIsModalVisible(false);

  if (!profile) return <Text>Loading...</Text>;

  // Table columns definitions
  const apptColumns = [
    {
      title: 'Date & Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
      render: dt => new Date(dt).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/appointments/${record.id}`)}>
          View
        </Button>
      )
    }
  ];

  const consultColumns = [
    {
      title: 'Date & Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
      render: dt => new Date(dt).toLocaleString()
    },
    { title: 'Notes', dataIndex: 'notes', key: 'notes' }
  ];

  const ordCols = [
    {
      title: 'Date',
      dataIndex: ['Consultation', 'dateTime'],
      key: 'date',
      render: dt => new Date(dt).toLocaleDateString()
    },
    {
      title: 'Download',
      key: 'download',
      render: (_, record) => (
        <Button
          icon={<DownloadOutlined />}
          type="link"
          onClick={async () => {
            const blob = await api
              .get(`/ordonnances/${record.id}/pdf`, { responseType: 'blob' })
              .then(r => r.data);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `ordonnance_${record.id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
          }}
        />
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="My Profile"
        extra={<Button icon={<EditOutlined />} onClick={showEditModal} />}
        style={{ marginBottom: 24 }}
      >
        {user.role === 'PATIENT' ? (
          <Space direction="vertical">
            <Text><b>Name:</b> {profile.firstName} {profile.lastName}</Text>
            <Text><b>DOB:</b> {new Date(profile.dateOfBirth).toLocaleDateString()}</Text>
            <Text><b>Phone:</b> {profile.phone}</Text>
            <Text><b>Address:</b> {profile.address}</Text>
            <Text><b>Emergency Contact:</b> {profile.emergencyContact}</Text>
          </Space>
        ) : (
          <Space direction="vertical">
            <Text><b>Name:</b> {profile.User?.name}</Text>
            <Text><b>Email:</b> {profile.User?.email}</Text>
            <Text><b>License #:</b> {profile.licenseNumber}</Text>
            <Text><b>Specialization:</b> {profile.specialization}</Text>
            <Text><b>Phone:</b> {profile.phone}</Text>
            <Text><b>Address:</b> {profile.address}</Text>
          </Space>
        )}
      </Card>

      <Modal
        title="Edit Profile"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form layout="vertical" form={form}>
          {user.role === 'PATIENT' ? (
            <>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Address">
                <Input />
              </Form.Item>
              <Form.Item name="emergencyContact" label="Emergency Contact">
                <Input />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="licenseNumber" label="License #">
                <Input />
              </Form.Item>
              <Form.Item name="specialization" label="Specialization">
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Address">
                <Input />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <Divider>Upcoming Appointments</Divider>
      <Table
        dataSource={appointments}
        columns={apptColumns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{ marginBottom: 24 }}
      />

      <Divider>Past Consultations</Divider>
      <Table
        dataSource={consultations}
        columns={consultColumns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{ marginBottom: 24 }}
      />

      <Divider>My Ordonnances</Divider>
      <Table
        dataSource={ordonnances}
        columns={ordCols}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}

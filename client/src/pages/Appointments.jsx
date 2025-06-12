import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Space,
  Typography,
  Badge,
} from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
} from '../api/appointments';
import { fetchPatients } from '../api/patients';
import useAuth from '../auth/useAuth'; // Importing useAuth to get the authenticated user

const { Title } = Typography;
const { Option } = Select;

export default function AppointmentsPage() {
  const { user } = useAuth(); // Retrieve the user object
  const [appointments, setAppointments] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await fetchAppointments();
      setAppointments(data);
    } catch {
      message.error('Failed to load appointments');
    }
  };

  const loadPatients = async () => {
    try {
      const data = await fetchPatients('');
      setPatientOptions(
        data.map((p) => ({
          label: `${p.firstName} ${p.lastName}`,
          value: p.id,
        }))
      );
    } catch {
      message.error('Failed to load patients');
    }
  };

  const openModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsUpdateModalVisible(false);
    setSelectedAppointment(null);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        medecinId: user.id, // Use the authenticated user's ID as medecinId
        patientId: values.patientId, // Selected patient
        dateTime: values.dateTime.toISOString(), // ISO formatted date
        notes: values.notes || '', // Optional notes
      };

      console.log('Payload:', payload); // Debug log

      await createAppointment(payload);
      message.success('Appointment created successfully');
      setIsModalVisible(false);
      loadAppointments();
    } catch (err) {
      console.error('Error in handleOk:', err); // Debug log
      message.error('Failed to create appointment');
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        dateTime: values.dateTime.toISOString(),
        notes: values.notes || '',
        status: values.status, // Ensure this contains the correct ENUM status
      };

      console.log('Update Payload:', payload); // Debug log to confirm status value

      await updateAppointment(selectedAppointment.id, payload);
      message.success('Appointment updated successfully');
      setIsUpdateModalVisible(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (err) {
      console.error('Error in handleUpdate:', err); // Debug log
      message.error('Failed to update appointment');
    }
  };

  const openUpdateModal = (appointment) => {
    setSelectedAppointment(appointment);
    form.setFieldsValue({
      dateTime: moment(appointment.dateTime),
      notes: appointment.notes,
      status: appointment.status,
    });
    setIsUpdateModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Patient',
      key: 'patient',
      render: (_, record) =>
        `${record.patient.firstName} ${record.patient.lastName}`,
    },
    {
      title: 'Date & Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
      render: (dt) => new Date(dt).toLocaleString(),
      sorter: (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={
            status === 'PENDING'
              ? 'processing'
              : status === 'CONFIRMED'
              ? 'success'
              : 'error'
          }
          text={
            status === 'PENDING'
              ? 'Pending'
              : status === 'CONFIRMED'
              ? 'Confirmed'
              : 'Cancelled'
          }
        />
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => openUpdateModal(record)}
        >
          Update
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{
          marginBottom: 16,
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Title level={4}>Appointments</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
          New Appointment
        </Button>
      </Space>

      <Table
        dataSource={appointments}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* New Appointment Modal */}
      <Modal
        title="New Appointment"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ notes: '' }}>
          {/* Patient Selector */}
          <Form.Item
            name="patientId"
            label="Select Patient"
            rules={[{ required: true, message: 'Please select a patient' }]}
          >
            <Select
              options={patientOptions}
              placeholder="Select a patient"
              allowClear
            />
          </Form.Item>

          {/* Appointment Date & Time */}
          <Form.Item
            name="dateTime"
            label="Date & Time"
            rules={[{ required: true, message: 'Please select date and time' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>

          {/* Notes */}
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Add any notes (optional)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Appointment Modal */}
      <Modal
        title="Update Appointment"
        open={isUpdateModalVisible}
        onOk={handleUpdate}
        onCancel={handleCancel}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          {/* Appointment Date & Time */}
          <Form.Item
            name="dateTime"
            label="Date & Time"
            rules={[{ required: true, message: 'Please select date and time' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>

          {/* Status */}
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select placeholder="Select status">
              <Option value="PENDING">Pending</Option>
              <Option value="CONFIRMED">Confirmed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Form.Item>

          {/* Notes */}
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Update notes (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
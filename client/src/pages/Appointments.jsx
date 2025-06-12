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
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  fetchAppointments,
  createAppointment,
} from '../api/appointments';
import { fetchPatients } from '../api/patients';

const { Title } = Typography;
const { Option } = Select;

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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
  };

  const handleOk = async () => {
  try {
    const values = await form.validateFields();
    console.log('Form values:', values); // Debug log
    const payload = {
      patientId: values.patientId,
      dateTime: values.dateTime.toISOString(),
      notes: values.notes,
      patientData: {
        name: values.patientName,
        email: values.patientEmail,
        phone: values.patientPhone,
      },
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
      render: (_, record) => `${record.Patient.firstName} ${record.Patient.lastName}`,
    },
    {
      title: 'Date & Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
      render: (dt) => new Date(dt).toLocaleString(),
      sorter: (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
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
        destroyOnClose
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

          {/* Patient Data */}
          <Title level={5} style={{ marginTop: '1rem' }}>
            Patient Data
          </Title>
          <Form.Item
            name="patientName"
            label="Name"
            rules={[{ required: true, message: 'Please input patient name' }]}
          >
            <Input placeholder="Enter patient name" />
          </Form.Item>
          <Form.Item
            name="patientEmail"
            label="Email"
            rules={[
              { required: true, message: 'Please input patient email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter patient email" />
          </Form.Item>
          <Form.Item
            name="patientPhone"
            label="Phone"
            rules={[
              { required: true, message: 'Please input patient phone number' },
            ]}
          >
            <Input placeholder="Enter patient phone number" />
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
    </div>
  );
}
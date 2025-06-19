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
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
} from '../api/appointments';
import { fetchPatients } from '../api/patients';
import useAuth from '../auth/useAuth';

const { Title } = Typography;
const { Option } = Select;

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // For the native date/time inputs
  const [updateDate, setUpdateDate] = useState('');
  const [updateTime, setUpdateTime] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateStatus, setUpdateStatus] = useState('PENDING');

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await fetchAppointments();
      if (!Array.isArray(data)) {
        setAppointments([]);
        return;
      }
      setAppointments(data);
    } catch (err) {
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
    if (isModalVisible) setIsModalVisible(false);
    if (isUpdateModalVisible) {
      setIsUpdateModalVisible(false);
      setSelectedAppointment(null);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        medecinId: user.id,
        patientId: values.patientId,
        dateTime: values.dateTime.toISOString(),
        notes: values.notes || '',
      };
      await createAppointment(payload);
      message.success('Appointment created successfully');
      setIsModalVisible(false);
      loadAppointments();
    } catch (err) {
      message.error('Failed to create appointment');
    }
  };

  const handleUpdate = async () => {
    try {
      if (!updateDate) {
        message.error('Please select a date');
        return;
      }
      if (!updateTime) {
        message.error('Please select a time');
        return;
      }
      const dateTimeString = `${updateDate}T${updateTime}:00`;
      const dateTime = new Date(dateTimeString);
      if (isNaN(dateTime.getTime())) {
        message.error('Invalid date or time format');
        return;
      }
      const payload = {
        dateTime: dateTime.toISOString(),
        notes: updateNotes || '',
        status: updateStatus,
      };
      await updateAppointment(selectedAppointment.id, payload);
      message.success('Appointment updated successfully');
      setIsUpdateModalVisible(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (err) {
      message.error('Failed to update appointment');
    }
  };

  const openUpdateModal = (appointment) => {
    setSelectedAppointment(appointment);
    const apptDate = new Date(appointment.dateTime);
    const formattedDate = apptDate.toISOString().split('T')[0];
    const hours = apptDate.getHours().toString().padStart(2, '0');
    const minutes = apptDate.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    setUpdateDate(formattedDate);
    setUpdateTime(formattedTime);
    setUpdateNotes(appointment.notes || '');
    setUpdateStatus(appointment.status || 'PENDING');
    setIsUpdateModalVisible(true);
  };

  // Columns for different roles
  let columns = [];

  if (user.role === 'PATIENT') {
    columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
      },
      {
        title: 'Doctor',
        key: 'doctor',
        render: (_, record) =>
          record.doctor
            ? `${record.doctor.name}`
            : 'Unknown',
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
        title: 'Notes',
        dataIndex: 'notes',
        key: 'notes',
        ellipsis: true,
      },
    ];
  } else {
    columns = [
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
          record.patient
            ? `${record.patient.firstName} ${record.patient.lastName}`
            : 'Unknown',
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
        title: 'Notes',
        dataIndex: 'notes',
        key: 'notes',
        ellipsis: true,
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
  }

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
        {(user.role === 'MEDECIN' || user.role === 'ADMIN') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
            New Appointment
          </Button>
        )}
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
        destroyOnClose={true}
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

      {/* Update Appointment Modal with native HTML inputs */}
      <Modal
        title="Update Appointment"
        open={isUpdateModalVisible}
        onOk={handleUpdate}
        onCancel={handleCancel}
        destroyOnClose={true}
      >
        <div className="ant-form ant-form-vertical">
          {/* Native Date Input */}
          <div className="ant-form-item">
            <div className="ant-form-item-label">
              <label className="ant-form-item-required">Date</label>
            </div>
            <div className="ant-form-item-control">
              <div className="ant-form-item-control-input">
                <div className="ant-form-item-control-input-content">
                  <input
                    type="date"
                    value={updateDate}
                    onChange={(e) => setUpdateDate(e.target.value)}
                    className="ant-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Native Time Input */}
          <div className="ant-form-item">
            <div className="ant-form-item-label">
              <label className="ant-form-item-required">Time</label>
            </div>
            <div className="ant-form-item-control">
              <div className="ant-form-item-control-input">
                <div className="ant-form-item-control-input-content">
                  <input
                    type="time"
                    value={updateTime}
                    onChange={(e) => setUpdateTime(e.target.value)}
                    className="ant-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="ant-form-item">
            <div className="ant-form-item-label">
              <label className="ant-form-item-required">Status</label>
            </div>
            <div className="ant-form-item-control">
              <div className="ant-form-item-control-input">
                <div className="ant-form-item-control-input-content">
                  <Select
                    value={updateStatus}
                    onChange={(value) => setUpdateStatus(value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="PENDING">Pending</Option>
                    <Option value="CONFIRMED">Confirmed</Option>
                    <Option value="CANCELLED">Cancelled</Option>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="ant-form-item">
            <div className="ant-form-item-label">
              <label>Notes</label>
            </div>
            <div className="ant-form-item-control">
              <div className="ant-form-item-control-input">
                <div className="ant-form-item-control-input-content">
                  <Input.TextArea
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    rows={3}
                    placeholder="Update notes (optional)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
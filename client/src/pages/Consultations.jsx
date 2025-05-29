import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  message,
  Space,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import moment from 'moment';
import {
  fetchConsultations,
  createConsultation,
  updateConsultation,
  deleteConsultation
} from '../api/consultations';
import { fetchPatients } from '../api/patients';

const { Title } = Typography;
const { Option } = Select;

export default function ConsultationsPage() {
  const [consults, setConsults] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConsult, setEditingConsult] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPatients();
    loadConsults();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await fetchPatients('');
      setPatientOptions(
        data.map(p => ({
          label: `${p.firstName} ${p.lastName}`,
          value: p.id
        }))
      );
    } catch {
      message.error('Failed to load patients');
    }
  };

  const loadConsults = async () => {
    try {
      const data = await fetchConsultations();
      setConsults(data);
    } catch {
      message.error('Failed to load consultations');
    }
  };

  const openNew = () => {
    form.resetFields();
    setEditingConsult(null);
    setIsModalVisible(true);
  };

  const openEdit = record => {
    form.setFieldsValue({
      patientId: record.patientId,
      dateTime: moment(record.dateTime),
      notes: record.notes
    });
    setEditingConsult(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        patientId: values.patientId,
        dateTime: values.dateTime.toISOString(),
        notes: values.notes
      };

      if (editingConsult) {
        await updateConsultation(editingConsult.id, payload);
        message.success('Consultation updated');
      } else {
        await createConsultation(payload);
        message.success('Consultation created');
      }

      setIsModalVisible(false);
      loadConsults();
    } catch (err) {
      if (err.errorFields) {
        // validation errors are shown inline
        return;
      }
      message.error('Operation failed');
    }
  };

  const handleDelete = record => {
    Modal.confirm({
      title: 'Delete this consultation?',
      onOk: async () => {
        try {
          await deleteConsultation(record.id);
          message.success('Consultation deleted');
          loadConsults();
        } catch {
          message.error('Delete failed');
        }
      }
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Patient',
      key: 'patient',
      render: (_, r) => `${r.Patient.firstName} ${r.Patient.lastName}`
    },
    {
      title: 'Date & Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
      render: dt => new Date(dt).toLocaleString(),
      sorter: (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record)}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}
      >
        <Title level={4}>Consultations</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openNew}
        >
          New Consultation
        </Button>
      </Space>

      <Table
        dataSource={consults}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingConsult ? 'Edit Consultation' : 'New Consultation'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ notes: '' }}
        >
          <Form.Item
            name="patientId"
            label="Patient"
            rules={[{ required: true, message: 'Patient is required' }]}
          >
            <Select options={patientOptions} placeholder="Select a patient" />
          </Form.Item>

          <Form.Item
            name="dateTime"
            label="Date & Time"
            rules={[{ required: true, message: 'Date & time is required' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  DatePicker,
  message,
  Space,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import moment from 'moment';
import * as Yup from 'yup';
import { fetchPatients, createPatient, updatePatient, deletePatient } from '../api/patients';

const { Title } = Typography;

const schema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  dossierNumber: Yup.string().required('Dossier number is required'),
});

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async q => {
    try {
      const data = await fetchPatients(q || '');
      setPatients(data);
    } catch {
      message.error('Failed to load patients');
    }
  };

  const onSearch = e => {
    const q = e.target.value;
    setSearch(q);
    loadPatients(q);
  };

  const openNew = () => {
    form.resetFields();
    setEditingPatient(null);
    setIsModalVisible(true);
  };

  const openEdit = record => {
    form.setFieldsValue({
      ...record,
      dateOfBirth: moment(record.dateOfBirth),
    });
    setEditingPatient(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await schema.validate(values, { abortEarly: false });
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
      };

      if (editingPatient) {
        await updatePatient(editingPatient.id, payload);
        message.success('Patient updated');
      } else {
        await createPatient(payload);
        message.success('Patient created');
      }

      setIsModalVisible(false);
      loadPatients(search);
    } catch (err) {
      if (err.name === 'ValidationError') {
        err.inner.forEach(e => message.error(e.message));
      } else {
        message.error('Operation failed');
      }
    }
  };

  const handleDelete = async record => {
    Modal.confirm({
      title: `Delete patient ${record.firstName} ${record.lastName}?`,
      onOk: async () => {
        try {
          await deletePatient(record.id);
          message.success('Patient deleted');
          loadPatients(search);
        } catch {
          message.error('Delete failed');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Dossier No',
      dataIndex: 'dossierNumber',
      key: 'dossierNumber',
      sorter: (a, b) => a.dossierNumber.localeCompare(b.dossierNumber),
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'DOB',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: dob => new Date(dob).toLocaleDateString(),
      sorter: (a, b) => new Date(a.dateOfBirth) - new Date(b.dateOfBirth),
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
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={4}>Patients</Title>
        <Space>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={onSearch}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openNew}
          >
            New Patient
          </Button>
        </Space>
      </Space>

      <Table
        dataSource={patients}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingPatient ? 'Edit Patient' : 'New Patient'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            firstName: '',
            lastName: '',
            dateOfBirth: null,
            dossierNumber: ''
          }}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'First name is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Last name is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label="Date of Birth"
            rules={[{ required: true, message: 'Date of birth is required' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="dossierNumber"
            label="Dossier Number"
            rules={[{ required: true, message: 'Dossier number is required' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

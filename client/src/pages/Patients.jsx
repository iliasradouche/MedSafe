import React, { useState, useEffect } from 'react';
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
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
import PatientDetailsModal from '../components/PatientDetailModal';

const { Title } = Typography;

const schema = Yup.object().shape({
  firstName: Yup.string().required('Le prénom est requis'),
  lastName: Yup.string().required('Le nom est requis'),
  dateOfBirth: Yup.string().required('La date de naissance est requise'),
  //dossierNumber: Yup.string().required('Le numéro de dossier est requis'),
});

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form] = Form.useForm();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);  

  // Native date input state
  const [dateOfBirth, setDateOfBirth] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async q => {
    try {
      const data = await fetchPatients(q || '');
      setPatients(data);
    } catch {
      message.error('Impossible de charger les patients');
    }
  };

  const showPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  const onSearch = e => {
    const q = e.target.value;
    setSearch(q);
    loadPatients(q);
  };

  const openNew = () => {
    form.resetFields();
    setDateOfBirth('');
    setEditingPatient(null);
    setIsModalVisible(true);
  };

  const openEdit = record => {
    form.setFieldsValue({
      ...record,
      phone: record.phone || '',
      address: record.address || '',
      emergencyContact: record.emergencyContact || ''
    });
    setDateOfBirth(record.dateOfBirth ? moment(record.dateOfBirth).format('YYYY-MM-DD') : '');
    setEditingPatient(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Use native date input value
      if (!dateOfBirth) {
        message.error('La date de naissance est requise');
        return;
      }

      await schema.validate({ ...values, dateOfBirth }, { abortEarly: false });

      const payload = {
        ...values,
        dateOfBirth: dateOfBirth,
      };

      if (editingPatient) {
        // Allow dossierNumber on edit if you want
        await updatePatient(editingPatient.id, payload);
        message.success('Patient modifié');
      } else {
        // DO NOT send dossierNumber on create!
        delete payload.dossierNumber;
        await createPatient(payload);
        message.success('Patient créé');
      }

      setIsModalVisible(false);
      loadPatients(search);
    } catch (err) {
      if (err.name === 'ValidationError') {
        err.inner.forEach(e => message.error(e.message));
      } else {
        message.error('Échec de l\'opération');
      }
    }
  };

  const handleDelete = async record => {
    Modal.confirm({
      title: `Supprimer le patient ${record.firstName} ${record.lastName} ?`,
      onOk: async () => {
        try {
          await deletePatient(record.id);
          message.success('Patient supprimé');
          loadPatients(search);
        } catch {
          message.error('Échec de la suppression');
        }
      }
    });
  };

  const columns = [
    {
      title: 'N° Dossier',
      dataIndex: 'dossierNumber',
      key: 'dossierNumber',
      sorter: (a, b) => a.dossierNumber.localeCompare(b.dossierNumber),
    },
    {
      title: 'Prénom',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      render: (text, record) => (
        <Button type="link" onClick={() => showPatientDetails(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Nom',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
      render: (text, record) => (
        <Button type="link" onClick={() => showPatientDetails(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Date de naissance',
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
            placeholder="Rechercher..."
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
            Nouveau Patient
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
        title={editingPatient ? 'Modifier le patient' : 'Nouveau patient'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        destroyOnHidden
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            firstName: '',
            lastName: '',
            dossierNumber: '',
            phone: '',
            address: '',
            emergencyContact: ''
          }}
        >
          <Form.Item
            name="firstName"
            label="Prénom"
            rules={[{ required: true, message: 'Le prénom est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input />
          </Form.Item>

          {/* Native date input */}
          <div className="ant-form-item" style={{ marginBottom: '24px' }}>
            <div className="ant-form-item-label">
              <label className="ant-form-item-required">Date de naissance</label>
            </div>
            <div className="ant-form-item-control">
              <div className="ant-form-item-control-input">
                <div className="ant-form-item-control-input-content">
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    className="ant-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              {!dateOfBirth && (
                <div className="ant-form-item-explain ant-form-item-explain-error">
                  <div>La date de naissance est requise</div>
                </div>
              )}
            </div>
          </div>

          <Form.Item
            name="phone"
            label="Téléphone"
            rules={[]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Adresse"
            rules={[]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="emergencyContact"
            label="Contact d'urgence"
            rules={[]}
          >
            <Input />
          </Form.Item>

          {/* <Form.Item
            name="dossierNumber"
            label="Numéro de dossier"
            rules={[{ required: true, message: 'Le numéro de dossier est requis' }]}
          >
            <Input />
          </Form.Item> */}
        </Form>
      </Modal>

      <PatientDetailsModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        patient={selectedPatient}
      />
    </div>
  );
}
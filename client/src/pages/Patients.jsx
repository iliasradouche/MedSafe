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
import useAuth from '../auth/useAuth';
import api from '../api/axios'; // Make sure this import is available

const { Title } = Typography;

const schema = Yup.object().shape({
  firstName: Yup.string().required('Le prénom est requis'),
  lastName: Yup.string().required('Le nom est requis'),
  dateOfBirth: Yup.string().required('La date de naissance est requise'),
});

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form] = Form.useForm();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);  
  const [loading, setLoading] = useState(true);
  const [locallyCreatedPatients, setLocallyCreatedPatients] = useState([]);
  const [dateOfBirth, setDateOfBirth] = useState('');

  useEffect(() => {
    loadPatients();
  }, [user]);

  // Updated to use both API filtering and locally created patients
  const loadPatients = async q => {
    try {
      setLoading(true);
      console.log('[PATIENTS PAGE] Loading patients for doctor ID:', user?.id);
      
      // Fetch all patients first
      const allPatients = await fetchPatients(q || '');
      console.log('[PATIENTS PAGE] All patients received:', allPatients.length);
      
      // Include any locally created patients that aren't in the API response yet
      let combinedPatients = [...allPatients];
      
      if (locallyCreatedPatients.length > 0) {
        // Create a set of existing IDs for quick lookup
        const existingIds = new Set(allPatients.map(p => p.id));
        
        // Add any locally created patients that aren't in the response yet
        locallyCreatedPatients.forEach(patient => {
          if (!existingIds.has(patient.id)) {
            combinedPatients.push(patient);
          }
        });
      }
      
      // If user is a doctor, filter patients
      if (user?.role !== 'PATIENT' && user?.role !== 'ADMIN') {
        console.log('[PATIENTS PAGE] Filtering patients for doctor');
        
        // Get appointments and consultations to find patients associated with this doctor
        const [appointmentsRes, consultationsRes] = await Promise.all([
          api.get('/appointments').then(res => res.data),
          api.get('/consultations').then(res => res.data)
        ]).catch(err => {
          console.error('[PATIENTS PAGE] Error fetching appointments/consultations:', err);
          return [[], []]; // Return empty arrays if fetch fails
        });
        
        console.log('[PATIENTS PAGE] Appointments:', appointmentsRes?.length || 0);
        console.log('[PATIENTS PAGE] Consultations:', consultationsRes?.length || 0);
        
        // Get unique patient IDs from appointments and consultations
        const doctorPatientIds = new Set();
        
        // Filter patients directly created by or linked to this doctor via userId
        const directlyLinkedPatients = combinedPatients.filter(patient => 
          patient.userId === user.id
        );
        
        // Add these patients' IDs to our set
        directlyLinkedPatients.forEach(patient => {
          doctorPatientIds.add(patient.id);
        });
        
        // Add patients from appointments
        if (Array.isArray(appointmentsRes)) {
          appointmentsRes.forEach(appt => {
            if (appt.medecinId === user.id && appt.patientId) {
              doctorPatientIds.add(appt.patientId);
            }
          });
        }
        
        // Add patients from consultations
        if (Array.isArray(consultationsRes)) {
          consultationsRes.forEach(consult => {
            if ((consult.medecinId === user.id || 
                (consult.doctor && consult.doctor.id === user.id) ||
                (consult.medecin && consult.medecin.id === user.id)) && 
                consult.patientId) {
              doctorPatientIds.add(consult.patientId);
            }
          });
        }
        
        console.log('[PATIENTS PAGE] Unique doctor patient IDs:', Array.from(doctorPatientIds));
        
        // Filter patients to only those associated with this doctor
        const filteredPatients = combinedPatients.filter(patient => 
          doctorPatientIds.has(patient.id) || patient.userId === user.id
        );
        
        console.log('[PATIENTS PAGE] Filtered patients:', filteredPatients.length);
        setPatients(filteredPatients);
      } else {
        // For admin or patient, show all patients
        setPatients(combinedPatients);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('[PATIENTS PAGE] Error loading patients:', err);
      message.error('Impossible de charger les patients');
      setLoading(false);
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
        // Add userId to link patient to doctor
        if (user?.role !== 'PATIENT' && user?.role !== 'ADMIN') {
          payload.userId = user.id;
          console.log('[PATIENTS PAGE] Creating patient with userId:', user.id);
        }
        
        // DO NOT send dossierNumber on create!
        delete payload.dossierNumber;
        
        // Create the patient
        const newPatient = await createPatient(payload);
        message.success('Patient créé');
        
        // Add to locally created patients array
        if (newPatient && newPatient.id) {
          // Ensure the userId is set in our local copy
          const patientWithUserId = {
            ...newPatient,
            userId: user.id
          };
          setLocallyCreatedPatients(prev => [...prev, patientWithUserId]);
        }
      }

      setIsModalVisible(false);
      loadPatients(search);
    } catch (err) {
      if (err.name === 'ValidationError') {
        err.inner.forEach(e => message.error(e.message));
      } else {
        console.error('[PATIENTS PAGE] Error submitting form:', err);
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
          
          // Remove from locally created patients if present
          setLocallyCreatedPatients(prev => 
            prev.filter(p => p.id !== record.id)
          );
          
          message.success('Patient supprimé');
          loadPatients(search);
        } catch (err) {
          console.error('[PATIENTS PAGE] Error deleting patient:', err);
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
      sorter: (a, b) => (a.dossierNumber || '').localeCompare(b.dossierNumber || ''),
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
      render: dob => dob ? new Date(dob).toLocaleDateString() : 'N/A',
      sorter: (a, b) => new Date(a.dateOfBirth || 0) - new Date(b.dateOfBirth || 0),
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
        loading={loading}
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
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
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
import ConsultationDetailsModal from '../components/ConsultationDetailsModal';
import useAuth from '../auth/useAuth';
import api from '../api/axios';

const { Title } = Typography;
const { Option } = Select;

export default function ConsultationsPage() {
  const { user } = useAuth();
  const [consults, setConsults] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConsult, setEditingConsult] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  // State for native date and time inputs
  const [consultDate, setConsultDate] = useState('');
  const [consultTime, setConsultTime] = useState('');

  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // For mapping user.id (user table) to patient.id (patient table)
  const [patientProfile, setPatientProfile] = useState(null);

  useEffect(() => {
    if (user.role === 'PATIENT') {
      // Fetch patient profile to get patient.id
      setLoading(true);
      api.get('/patients/me')
        .then(res => {
          setPatientProfile(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('[CONSULTATIONS PAGE] Failed to load patient profile:', err);
          message.error('Failed to load your patient profile');
          setLoading(false);
        });
    } else {
      loadPatients();
    }
    // eslint-disable-next-line
  }, [user.role, user.id]);

  useEffect(() => {
    if (user.role !== 'PATIENT' || patientProfile) {
      loadConsults();
    }
    // eslint-disable-next-line
  }, [user.role, user.id, patientProfile]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      console.log('[CONSULTATIONS PAGE] Loading patients for doctor ID:', user?.id);
      
      const data = await fetchPatients('');
      console.log('[CONSULTATIONS PAGE] All patients received:', data.length);
      
      // If user is a doctor, filter patients to only those associated with this doctor
      let filteredPatients = data;
      
      if (user?.role !== 'PATIENT' && user?.role !== 'ADMIN') {
        console.log('[CONSULTATIONS PAGE] Filtering patients for doctor');
        
        // Filter by userId (patients created by this doctor)
        const patientsCreatedByDoctor = data.filter(patient => 
          patient.userId === user.id
        );
        
        // Get patients from appointments and consultations
        try {
          const [appointmentsRes, consultationsRes] = await Promise.all([
            api.get('/appointments').then(res => res.data),
            api.get('/consultations').then(res => res.data)
          ]);
          
          // Get unique patient IDs from appointments and consultations
          const patientIdsWithRelation = new Set();
          
          // From appointments
          appointmentsRes.forEach(appt => {
            if (appt.medecinId === user.id && appt.patientId) {
              patientIdsWithRelation.add(appt.patientId);
            }
          });
          
          // From consultations
          consultationsRes.forEach(consult => {
            if ((consult.medecinId === user.id || 
                (consult.doctor && consult.doctor.id === user.id) ||
                (consult.medecin && consult.medecin.id === user.id)) && 
                consult.patientId) {
              patientIdsWithRelation.add(consult.patientId);
            }
          });
          
          // Filter patients that have relations with this doctor
          const patientsWithRelation = data.filter(
            patient => patientIdsWithRelation.has(patient.id)
          );
          
          // Combine both lists and remove duplicates
          const patientMap = new Map();
          
          // Add patients created by doctor
          patientsCreatedByDoctor.forEach(patient => {
            patientMap.set(patient.id, patient);
          });
          
          // Add patients with relations
          patientsWithRelation.forEach(patient => {
            patientMap.set(patient.id, patient);
          });
          
          // Convert map back to array
          filteredPatients = Array.from(patientMap.values());
          console.log('[CONSULTATIONS PAGE] Filtered patients for doctor:', filteredPatients.length);
        } catch (err) {
          console.error('[CONSULTATIONS PAGE] Error fetching relations:', err);
          // If we fail to get relations, at least return patients created by this doctor
          filteredPatients = patientsCreatedByDoctor;
        }
      }
      
      setPatientOptions(
        filteredPatients.map(p => ({
          label: `${p.firstName} ${p.lastName}`,
          value: p.id
        }))
      );
      setLoading(false);
    } catch (err) {
      console.error('[CONSULTATIONS PAGE] Failed to load patients:', err);
      message.error('Failed to load patients');
      setLoading(false);
    }
  };

  const loadConsults = async () => {
    try {
      setLoading(true);
      console.log('[CONSULTATIONS PAGE] Loading consultations');
      
      const data = await fetchConsultations();
      console.log('[CONSULTATIONS PAGE] All consultations received:', data.length);
      
      let filtered;
      
      if (user.role === 'PATIENT' && patientProfile) {
        // Filter consultations for patients
        filtered = data.filter(
          (c) =>
            (c.patient && c.patient.id === patientProfile.id) ||
            (c.Patient && c.Patient.id === patientProfile.id)
        );
        console.log('[CONSULTATIONS PAGE] Filtered consultations for patient:', filtered.length);
      } else if (user.role !== 'ADMIN') {
        // Filter consultations for doctors
        filtered = data.filter(
          (c) =>
            c.medecinId === user.id ||
            (c.doctor && c.doctor.id === user.id) ||
            (c.medecin && c.medecin.id === user.id)
        );
        console.log('[CONSULTATIONS PAGE] Filtered consultations for doctor:', filtered.length);
      } else {
        // Admin sees all
        filtered = data;
      }

      setConsults(
        filtered.map((c) => ({
          id: c.id,
          patientId: c.patientId,
          medecinId: c.medecinId,
          patient: c.patient || c.Patient,
          doctor: c.doctor || c.medecin,
          dateTime: c.dateTime,
          notes: c.notes
        }))
      );
      setLoading(false);
    } catch (err) {
      console.error('[CONSULTATIONS PAGE] Failed to load consultations:', err);
      message.error('Failed to load consultations');
      setLoading(false);
    }
  };

  const openNew = () => {
    form.resetFields();
    const now = moment();
    setConsultDate(now.format('YYYY-MM-DD'));
    setConsultTime(now.format('HH:mm'));
    setEditingConsult(null);
    setIsModalVisible(true);
  };

  const openEdit = record => {
    form.setFieldsValue({
      patientId: record.patientId,
      notes: record.notes
    });

    const dateTime = moment(record.dateTime);
    setConsultDate(dateTime.format('YYYY-MM-DD'));
    setConsultTime(dateTime.format('HH:mm'));

    setEditingConsult(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!consultDate) {
        message.error('Date is required');
        return;
      }
      if (!consultTime) {
        message.error('Time is required');
        return;
      }
      const dateTimeString = `${consultDate}T${consultTime}:00`;
      const dateTime = new Date(dateTimeString);

      if (isNaN(dateTime.getTime())) {
        message.error('Invalid date or time format');
        return;
      }

      const payload = {
        patientId: values.patientId,
        dateTime: dateTime.toISOString(),
        notes: values.notes || ''
      };

      if (editingConsult) {
        await updateConsultation(editingConsult.id, payload);
        message.success('Consultation updated');
      } else {
        const newConsultation = await createConsultation(payload);
        message.success('Consultation created');
        
        // Immediately add the new consultation to the list with the current doctor info
        if (newConsultation) {
          const consultWithDoctor = {
            ...newConsultation,
            doctor: { id: user.id, name: user.name || user.email }
          };
          setConsults(prev => [consultWithDoctor, ...prev]);
        }
      }

      setIsModalVisible(false);
      loadConsults(); // Reload all to ensure data consistency
    } catch (err) {
      console.error('[CONSULTATIONS PAGE] Error saving consultation:', err);
      if (err.errorFields) return;
      message.error('Operation failed');
    }
  };

  const handleDelete = record => {
    Modal.confirm({
      title: 'Supprimer cette consultation ?',
      content: 'Êtes-vous sûr de vouloir supprimer cette consultation ?',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await deleteConsultation(record.id);
          message.success('La consultation a été supprimée');
          loadConsults();
        } catch (err) {
          console.error('[CONSULTATIONS PAGE] Error deleting consultation:', err);
          message.error('Échec de la suppression');
        }
      }
    });
  };

  const showConsultationDetails = (consultation) => {
    setSelectedConsultation(consultation);
    setShowConsultationModal(true);
  };

  // Columns for PATIENT: show Doctor column, no click on rows
  // Columns for Doctor: show Patient column, allow click/details modal
  const columns = user.role === 'PATIENT'
    ? [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
          width: 80,
        },
        {
          title: 'Médecin',
          key: 'doctor',
          render: (_, record) =>
            record.doctor
              ? record.doctor.name
              : 'N/A'
        },
        {
          title: 'Date & Heure',
          dataIndex: 'dateTime',
          key: 'dateTime',
          render: dt => new Date(dt).toLocaleString(),
          sorter: (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
        },
        {
          title: 'Notes',
          dataIndex: 'notes',
          key: 'notes',
          ellipsis: true,
        },
      ]
    : [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
          width: 80,
        },
        {
          title: 'Patient',
          key: 'patient',
          render: (_, record) => {
            const opt = patientOptions.find(o => o.value === record.patientId);
            const patientName = opt?.label || 
                              (record.patient?.firstName ? 
                                `${record.patient.firstName} ${record.patient.lastName}` : 
                                'Unknown Patient');
            return patientName;
          }
        },
        {
          title: 'Date & Heure',
          dataIndex: 'dateTime',
          key: 'dateTime',
          render: dt => new Date(dt).toLocaleString(),
          sorter: (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
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
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={e => {
                  e.stopPropagation(); // Prevent row click from firing
                  openEdit(record);
                }}
              />
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={e => {
                  e.stopPropagation(); // Prevent row click from firing
                  handleDelete(record);
                }}
              />
            </Space>
          ),
        }
      ];

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}
      >
        <Title level={4}>Consultations</Title>
        {user.role !== 'PATIENT' && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openNew}
          >
            New Consultation
          </Button>
        )}
      </Space>

      <Table
        dataSource={consults}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
        // Only allow row click for details for doctors
        onRow={user.role !== 'PATIENT'
          ? (record) => ({
              onClick: () => showConsultationDetails(record)
            })
          : undefined
        }
        style={{ cursor: user.role !== 'PATIENT' ? 'pointer' : 'default' }}
      />

      {/* Only show modal for doctor */}
      {user.role !== 'PATIENT' && (
        <Modal
          title={editingConsult ? 'Edit Consultation' : 'New Consultation'}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          destroyOnClose={true}
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
              <Select 
                options={patientOptions} 
                placeholder="Select a patient"
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Form.Item>

            {/* Custom Date and Time with native inputs */}
            <div style={{ marginBottom: '24px' }}>
              <div className="ant-form-item">
                <div className="ant-form-item-label">
                  <label className="ant-form-item-required">Date</label>
                </div>
                <div className="ant-form-item-control">
                  <div className="ant-form-item-control-input">
                    <div className="ant-form-item-control-input-content">
                      <input
                        type="date"
                        value={consultDate}
                        onChange={(e) => setConsultDate(e.target.value)}
                        className="ant-input"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  {!consultDate && (
                    <div className="ant-form-item-explain ant-form-item-explain-error">
                      <div>Date is required</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="ant-form-item" style={{ marginTop: '16px' }}>
                <div className="ant-form-item-label">
                  <label className="ant-form-item-required">Time</label>
                </div>
                <div className="ant-form-item-control">
                  <div className="ant-form-item-control-input">
                    <div className="ant-form-item-control-input-content">
                      <input
                        type="time"
                        value={consultTime}
                        onChange={(e) => setConsultTime(e.target.value)}
                        className="ant-input"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  {!consultTime && (
                    <div className="ant-form-item-explain ant-form-item-explain-error">
                      <div>Time is required</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      )}

      {/* Only for doctor: details modal */}
      {user.role !== 'PATIENT' && (
        <ConsultationDetailsModal
          open={showConsultationModal}
          onClose={() => setShowConsultationModal(false)}
          consultation={selectedConsultation}
        />
      )}
    </div>
  );
}
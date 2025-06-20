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
import api from '../api/axios';

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
  const [loading, setLoading] = useState(true);

  // Pour les entrées date/heure natives
  const [updateDate, setUpdateDate] = useState('');
  const [updateTime, setUpdateTime] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateStatus, setUpdateStatus] = useState('PENDING');

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log('[APPOINTMENTS PAGE] Loading appointments for user:', user?.id, user?.role);
      
      const data = await fetchAppointments();
      console.log('[APPOINTMENTS PAGE] All appointments received:', data?.length || 0);
      
      if (!Array.isArray(data)) {
        setAppointments([]);
        setLoading(false);
        return;
      }
      
      // Filter appointments based on user role
      let filteredAppointments = data;
      
      if (user?.role === 'MEDECIN') {
        // For doctors, filter to only show their appointments
        filteredAppointments = data.filter(appointment => 
          appointment.medecinId === user.id
        );
        console.log('[APPOINTMENTS PAGE] Filtered appointments for doctor:', filteredAppointments.length);
      }
      
      setAppointments(filteredAppointments);
      setLoading(false);
    } catch (err) {
      console.error('[APPOINTMENTS PAGE] Error loading appointments:', err);
      message.error("Échec du chargement des rendez-vous");
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      console.log('[APPOINTMENTS PAGE] Loading patients for user:', user?.id, user?.role);
      
      const data = await fetchPatients('');
      console.log('[APPOINTMENTS PAGE] All patients received:', data?.length || 0);
      
      // Filter patients for doctors
      let filteredPatients = data;
      
      if (user?.role === 'MEDECIN') {
        console.log('[APPOINTMENTS PAGE] Filtering patients for doctor');
        
        try {
          // Get patients that this doctor has created or has appointments/consultations with
          const [appointmentsRes, consultationsRes] = await Promise.all([
            api.get('/appointments').then(res => res.data),
            api.get('/consultations').then(res => res.data)
          ]);
          
          // Create a set of unique patient IDs
          const doctorPatientIds = new Set();
          
          // Add patients with a userId matching this doctor
          data.forEach(patient => {
            if (patient.userId === user.id) {
              doctorPatientIds.add(patient.id);
            }
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
          
          console.log('[APPOINTMENTS PAGE] Unique doctor patient IDs:', Array.from(doctorPatientIds));
          
          // Filter patients to only those associated with this doctor
          filteredPatients = data.filter(patient => 
            doctorPatientIds.has(patient.id) || patient.userId === user.id
          );
          
          console.log('[APPOINTMENTS PAGE] Filtered patients for doctor:', filteredPatients.length);
        } catch (err) {
          console.error('[APPOINTMENTS PAGE] Error filtering patients:', err);
          // If filtering fails, just use patients directly created by this doctor
          filteredPatients = data.filter(patient => patient.userId === user.id);
        }
      }
      
      setPatientOptions(
        filteredPatients.map((p) => ({
          label: `${p.firstName} ${p.lastName}`,
          value: p.id,
        }))
      );
      setLoading(false);
    } catch (err) {
      console.error('[APPOINTMENTS PAGE] Error loading patients:', err);
      message.error("Échec du chargement des patients");
      setLoading(false);
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
      
      console.log('[APPOINTMENTS PAGE] Creating appointment:', payload);
      const newAppointment = await createAppointment(payload);
      
      message.success('Rendez-vous créé avec succès');
      setIsModalVisible(false);
      
      // Immediately add the new appointment to the list
      if (newAppointment) {
        const patient = patientOptions.find(p => p.value === values.patientId);
        const appointmentWithDetails = {
          ...newAppointment,
          patient: { 
            firstName: patient?.label.split(' ')[0] || '',
            lastName: patient?.label.split(' ').slice(1).join(' ') || ''
          },
          doctor: { id: user.id, name: user.name || user.email }
        };
        
        setAppointments(prev => [appointmentWithDetails, ...prev]);
      }
      
      // Reload to ensure data consistency
      loadAppointments();
    } catch (err) {
      console.error('[APPOINTMENTS PAGE] Error creating appointment:', err);
      message.error("Échec de la création du rendez-vous");
    }
  };

  const handleUpdate = async () => {
    try {
      if (!updateDate) {
        message.error('Veuillez sélectionner une date');
        return;
      }
      if (!updateTime) {
        message.error('Veuillez sélectionner une heure');
        return;
      }
      const dateTimeString = `${updateDate}T${updateTime}:00`;
      const dateTime = new Date(dateTimeString);
      if (isNaN(dateTime.getTime())) {
        message.error('Format de date ou d\'heure invalide');
        return;
      }
      const payload = {
        dateTime: dateTime.toISOString(),
        notes: updateNotes || '',
        status: updateStatus,
      };
      
      console.log('[APPOINTMENTS PAGE] Updating appointment:', selectedAppointment?.id, payload);
      await updateAppointment(selectedAppointment.id, payload);
      
      message.success('Rendez-vous mis à jour avec succès');
      setIsUpdateModalVisible(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (err) {
      console.error('[APPOINTMENTS PAGE] Error updating appointment:', err);
      message.error("Échec de la mise à jour du rendez-vous");
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

  // Colonnes selon le rôle
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
        title: 'Médecin',
        key: 'doctor',
        render: (_, record) =>
          record.doctor
            ? `${record.doctor.name}`
            : 'Inconnu',
      },
      {
        title: 'Date & Heure',
        dataIndex: 'dateTime',
        key: 'dateTime',
        render: (dt) => new Date(dt).toLocaleString(),
        sorter: (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
      },
      {
        title: 'Statut',
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
                ? 'En attente'
                : status === 'CONFIRMED'
                ? 'Confirmé'
                : 'Annulé'
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
            : 'Inconnu',
      },
      {
        title: 'Date & Heure',
        dataIndex: 'dateTime',
        key: 'dateTime',
        render: (dt) => new Date(dt).toLocaleString(),
        sorter: (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
      },
      {
        title: 'Statut',
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
                ? 'En attente'
                : status === 'CONFIRMED'
                ? 'Confirmé'
                : 'Annulé'
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
            Modifier
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
        <Title level={4}>Rendez-vous</Title>
        {(user.role === 'MEDECIN' || user.role === 'ADMIN') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
            Nouveau rendez-vous
          </Button>
        )}
      </Space>

      <Table
        dataSource={appointments}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      {/* Modal Nouveau rendez-vous */}
      <Modal
        title="Nouveau rendez-vous"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose={true}
      >
        <Form form={form} layout="vertical" initialValues={{ notes: '' }}>
          {/* Sélecteur de patient */}
          <Form.Item
            name="patientId"
            label="Sélectionner un patient"
            rules={[{ required: true, message: 'Veuillez sélectionner un patient' }]}
          >
            <Select
              options={patientOptions}
              placeholder="Sélectionner un patient"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              allowClear
            />
          </Form.Item>

          {/* Date & heure du rendez-vous */}
          <Form.Item
            name="dateTime"
            label="Date et heure"
            rules={[{ required: true, message: 'Veuillez sélectionner la date et l\'heure' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>

          {/* Notes */}
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Ajouter des notes (optionnel)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de mise à jour du rendez-vous avec entrées HTML natives */}
      <Modal
        title="Mettre à jour le rendez-vous"
        open={isUpdateModalVisible}
        onOk={handleUpdate}
        onCancel={handleCancel}
        destroyOnClose={true}
      >
        <div className="ant-form ant-form-vertical">
          {/* Entrée Date native */}
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

          {/* Entrée Heure native */}
          <div className="ant-form-item">
            <div className="ant-form-item-label">
              <label className="ant-form-item-required">Heure</label>
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

          {/* Statut */}
          <div className="ant-form-item">
            <div className="ant-form-item-label">
              <label className="ant-form-item-required">Statut</label>
            </div>
            <div className="ant-form-item-control">
              <div className="ant-form-item-control-input">
                <div className="ant-form-item-control-input-content">
                  <Select
                    value={updateStatus}
                    onChange={(value) => setUpdateStatus(value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="PENDING">En attente</Option>
                    <Option value="CONFIRMED">Confirmé</Option>
                    <Option value="CANCELLED">Annulé</Option>
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
                    placeholder="Mettre à jour les notes (optionnel)"
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
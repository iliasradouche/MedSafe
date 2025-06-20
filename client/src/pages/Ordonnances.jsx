import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import {
  fetchOrdonnances,
  createOrdonnance,
  updateOrdonnance,
  deleteOrdonnance,
  downloadOrdonnancePdf,
} from '../api/ordonnances';
import { fetchConsultations } from '../api/consultations';
import useAuth from '../auth/useAuth';
import api from '../api/axios';

const { Title } = Typography;
const { Option } = Select;

export default function OrdonnancesPage() {
  const { user } = useAuth();
  const [ords, setOrds] = useState([]);
  const [consults, setConsults] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingOrdonnance, setEditingOrdonnance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrdonnances();
    if (user.role !== 'PATIENT') {
      loadConsultations();
    }
  }, [user.role, user.id]);

  const loadOrdonnances = async () => {
    try {
      setLoading(true);
      console.log('[ORDONNANCES PAGE] Loading ordonnances for user:', user?.id, user?.role);
      
      const data = await fetchOrdonnances();
      console.log('[ORDONNANCES PAGE] All ordonnances received:', data?.length || 0);
      
      if (user.role === 'PATIENT') {
        // For patients, filter to only show their ordonnances
        const filtered = data.filter(
          (o) =>
            o.consultation &&
            o.consultation.patient &&
            o.consultation.patient.userId === user.id
        );
        console.log('[ORDONNANCES PAGE] Filtered ordonnances for patient:', filtered.length);
        setOrds(filtered);
      } else if (user.role === 'MEDECIN') {
        // For doctors, filter to only show ordonnances for their consultations
        const filtered = data.filter(
          (o) =>
            o.consultation &&
            (o.consultation.medecinId === user.id ||
             (o.consultation.doctor && o.consultation.doctor.id === user.id))
        );
        console.log('[ORDONNANCES PAGE] Filtered ordonnances for doctor:', filtered.length);
        setOrds(filtered);
      } else {
        // For admin, show all ordonnances
        setOrds(data);
      }
      setLoading(false);
    } catch (err) {
      console.error('[ORDONNANCES PAGE] Error loading ordonnances:', err);
      message.error("Échec du chargement des ordonnances");
      setLoading(false);
    }
  };

  const loadConsultations = async () => {
    try {
      setLoading(true);
      console.log('[ORDONNANCES PAGE] Loading consultations for user:', user?.id, user?.role);
      
      const data = await fetchConsultations();
      console.log('[ORDONNANCES PAGE] All consultations received:', data?.length || 0);
      
      // For doctors, filter to only show their consultations
      let filteredConsultations = data;
      
      if (user.role === 'MEDECIN') {
        filteredConsultations = data.filter(
          (c) =>
            c.medecinId === user.id ||
            (c.doctor && c.doctor.id === user.id) ||
            (c.medecin && c.medecin.id === user.id)
        );
        console.log('[ORDONNANCES PAGE] Filtered consultations for doctor:', filteredConsultations.length);
      }
      
      // Map consultations to options for the dropdown
      const consultOptions = filteredConsultations
        .filter(c => c.patient) // Only include consultations with patient data
        .map((c) => ({
          label: `${c.patient.firstName} ${c.patient.lastName} @ ${new Date(
            c.dateTime
          ).toLocaleDateString()}`,
          value: c.id,
        }));
      
      setConsults(consultOptions);
      setLoading(false);
    } catch (err) {
      console.error('[ORDONNANCES PAGE] Error loading consultations:', err);
      message.error("Échec du chargement des consultations");
      setLoading(false);
    }
  };

  const openModal = (ordonnance = null) => {
    if (ordonnance) {
      form.setFieldsValue({
        consultationId: ordonnance.consultationId,
        prescription: ordonnance.prescription,
      });
      setEditingOrdonnance(ordonnance);
    } else {
      form.resetFields();
      setEditingOrdonnance(null);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        consultationId: values.consultationId,
        prescription: values.prescription,
      };

      console.log('[ORDONNANCES PAGE] Saving ordonnance:', payload);
      
      if (editingOrdonnance) {
        await updateOrdonnance(editingOrdonnance.id, payload);
        message.success("Ordonnance modifiée avec succès");
      } else {
        const newOrdonnance = await createOrdonnance(payload);
        message.success("Ordonnance créée avec succès");
        
        // Add the new ordonnance to the list with consultation details
        if (newOrdonnance) {
          // Find the consultation details from our options
          const selectedConsult = consults.find(c => c.value === values.consultationId);
          if (selectedConsult) {
            // Get more details about this consultation
            try {
              const consultDetails = await api.get(`/consultations/${values.consultationId}`).then(res => res.data);
              
              // Add the new ordonnance with consultation details
              const ordWithDetails = {
                ...newOrdonnance,
                consultation: consultDetails
              };
              
              setOrds(prev => [ordWithDetails, ...prev]);
            } catch (err) {
              console.error('[ORDONNANCES PAGE] Error fetching consultation details:', err);
              // If we can't get full details, at least add the basic info
              setOrds(prev => [newOrdonnance, ...prev]);
            }
          } else {
            // Just add the basic ordonnance
            setOrds(prev => [newOrdonnance, ...prev]);
          }
        }
      }

      setIsModalVisible(false);
      loadOrdonnances(); // Reload to ensure data consistency
    } catch (err) {
      console.error('[ORDONNANCES PAGE] Error saving ordonnance:', err);
      message.error("Échec de la sauvegarde de l'ordonnance");
    }
  };

  const handleDelete = async (ordonnance) => {
    Modal.confirm({
      title: "Supprimer l'ordonnance",
      content: "Êtes-vous sûr de vouloir supprimer cette ordonnance ?",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk: async () => {
        try {
          await deleteOrdonnance(ordonnance.id);
          message.success("Ordonnance supprimée avec succès");
          loadOrdonnances();
        } catch (err) {
          console.error('[ORDONNANCES PAGE] Error deleting ordonnance:', err);
          message.error("Échec de la suppression de l'ordonnance");
        }
      },
    });
  };

  const handleDownload = async (id) => {
    try {
      console.log('[ORDONNANCES PAGE] Downloading ordonnance PDF:', id);
      const blob = await downloadOrdonnancePdf(id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `ordonnance_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success("Téléchargement réussi");
    } catch (err) {
      console.error('[ORDONNANCES PAGE] Error downloading PDF:', err);
      message.error("Échec du téléchargement du PDF de l'ordonnance");
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
      render: (_, record) =>
        record.consultation?.patient
          ? `${record.consultation.patient.firstName} ${record.consultation.patient.lastName}`
          : 'Inconnu',
    },
    {
      title: 'Date de consultation',
      key: 'dateTime',
      render: (_, record) =>
        record.consultation?.dateTime
          ? new Date(record.consultation.dateTime).toLocaleString()
          : 'N/A',
      sorter: (a, b) => 
        a.consultation?.dateTime && b.consultation?.dateTime
          ? new Date(a.consultation.dateTime) - new Date(b.consultation.dateTime)
          : 0,
    },
    {
      title: 'Prescription',
      dataIndex: 'prescription',
      key: 'prescription',
      ellipsis: true,
    },
    {
      title: 'PDF',
      key: 'pdf',
      render: (_, record) => (
        <Button
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(record.id)}
          type="link"
        >
          Télécharger
        </Button>
      ),
    },
    ...(user.role !== 'PATIENT'
      ? [
          {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => openModal(record)}
                  type="primary"
                >
                  Modifier
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record)}
                  danger
                >
                  Supprimer
                </Button>
              </Space>
            ),
          },
        ]
      : []),
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
        <Title level={4}>Ordonnances</Title>
        {user.role !== 'PATIENT' && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Nouvelle ordonnance
          </Button>
        )}
      </Space>

      <Table
        dataSource={ords}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      {/* Modal uniquement pour les médecins */}
      {user.role !== 'PATIENT' && (
        <Modal
          title={editingOrdonnance ? "Modifier l'ordonnance" : "Nouvelle ordonnance"}
          open={isModalVisible}
          onOk={handleSave}
          onCancel={handleCancel}
          destroyOnHidden
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="consultationId"
              label="Consultation"
              rules={[{ required: true, message: "Veuillez sélectionner une consultation" }]}
            >
              <Select
                placeholder="Sélectionner une consultation"
                options={consults}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Form.Item>
            <Form.Item
              name="prescription"
              label="Prescription"
              rules={[
                { required: true, message: "Veuillez saisir la prescription" },
              ]}
            >
              <Input.TextArea rows={4} placeholder="Saisir la prescription" />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
}
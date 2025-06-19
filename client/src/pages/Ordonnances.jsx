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

const { Title } = Typography;
const { Option } = Select;

export default function OrdonnancesPage() {
  const { user } = useAuth();
  const [ords, setOrds] = useState([]);
  const [consults, setConsults] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingOrdonnance, setEditingOrdonnance] = useState(null);

  useEffect(() => {
    loadOrdonnances();
    if (user.role !== 'PATIENT') {
      loadConsultations();
    }
  }, [user.role, user.id]);

  const loadOrdonnances = async () => {
    try {
      const data = await fetchOrdonnances();
      if (user.role === 'PATIENT') {
        const filtered = data.filter(
          (o) =>
            o.consultation &&
            o.consultation.patient &&
            o.consultation.patient.userId === user.id
        );
        setOrds(filtered);
      } else {
        setOrds(data);
      }
    } catch {
      message.error("Échec du chargement des ordonnances");
    }
  };

  const loadConsultations = async () => {
    try {
      const data = await fetchConsultations();
      setConsults(
        data.map((c) => ({
          label: `${c.patient.firstName} ${c.patient.lastName} @ ${new Date(
            c.dateTime
          ).toLocaleDateString()}`,
          value: c.id,
        }))
      );
    } catch {
      message.error("Échec du chargement des consultations");
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

      if (editingOrdonnance) {
        await updateOrdonnance(editingOrdonnance.id, payload);
        message.success("Ordonnance modifiée avec succès");
      } else {
        await createOrdonnance(payload);
        message.success("Ordonnance créée avec succès");
      }

      setIsModalVisible(false);
      loadOrdonnances();
    } catch (err) {
      message.error("Échec de la sauvegarde de l'ordonnance");
    }
  };

  const handleDelete = async (ordonnance) => {
    Modal.confirm({
      title: "Supprimer l'ordonnance",
      content: "Êtes-vous sûr de vouloir supprimer cette ordonnance ?",
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk: async () => {
        try {
          await deleteOrdonnance(ordonnance.id);
          message.success("Ordonnance supprimée avec succès");
          loadOrdonnances();
        } catch {
          message.error("Échec de la suppression de l'ordonnance");
        }
      },
    });
  };

  const handleDownload = async (id) => {
    try {
      const blob = await downloadOrdonnancePdf(id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `ordonnance_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
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
      title: 'Consultation',
      key: 'consultation',
      render: (_, record) =>
        record.consultation
          ? `${record.consultation.patient?.firstName || ''} ${record.consultation.patient?.lastName || ''} (${record.consultationId})`
          : record.consultationId,
    },
    {
      title: 'Prescription',
      dataIndex: 'prescription',
      key: 'prescription',
    },
    {
      title: 'PDF',
      key: 'pdf',
      render: (_, record) => (
        <Button
          icon={<DownloadOutlined />}
          type="link"
          onClick={() => handleDownload(record.id)}
        >
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
                  type="danger"
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
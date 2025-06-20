import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  TimePicker,
  Row,
  Col,
  Space,
  Typography,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import useAuth from '../auth/useAuth';
import api from '../api/axios';

const { Title } = Typography;
const { Option } = Select;

const days = [
  { label: 'Dimanche', value: 0 },
  { label: 'Lundi', value: 1 },
  { label: 'Mardi', value: 2 },
  { label: 'Mercredi', value: 3 },
  { label: 'Jeudi', value: 4 },
  { label: 'Vendredi', value: 5 },
  { label: 'Samedi', value: 6 },
];

export default function MyAvailabilityPage() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingSlot, setEditingSlot] = useState(null);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/availabilities/me');
      setSlots(res.data);
    } catch (err) {
      message.error('Échec du chargement des créneaux');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const openModal = (slot = null) => {
    if (slot) {
      form.setFieldsValue({
        dayOfWeek: slot.dayOfWeek,
        startTime: moment(slot.startTime, 'HH:mm'),
        endTime: moment(slot.endTime, 'HH:mm'),
      });
      setEditingSlot(slot);
    } else {
      form.resetFields();
      setEditingSlot(null);
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
        dayOfWeek: values.dayOfWeek,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
      };

      if (editingSlot) {
        // Update slot
        await api.put(`/availabilities/${editingSlot.id}`, payload);
        message.success('Créneau modifié avec succès');
      } else {
        // Create new slot
        await api.post('/availabilities', payload);
        message.success('Créneau ajouté avec succès');
      }

      setIsModalVisible(false);
      loadSlots();
    } catch (err) {
      message.error('Échec de la sauvegarde du créneau');
    }
  };

  const handleDelete = async (slot) => {
    Modal.confirm({
      title: 'Supprimer le créneau',
      content: 'Êtes-vous sûr de vouloir supprimer ce créneau ?',
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk: async () => {
        try {
          await api.delete(`/availabilities/${slot.id}`);
          message.success('Créneau supprimé avec succès');
          loadSlots();
        } catch {
          message.error('Échec de la suppression du créneau');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Jour',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (dayOfWeek) => days.find((d) => d.value === dayOfWeek)?.label,
    },
    {
      title: 'Heure de début',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'Heure de fin',
      dataIndex: 'endTime',
      key: 'endTime',
    },
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
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            danger
          >
          </Button>
        </Space>
      ),
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
        <Title level={4}>Mes disponibilités</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Nouveau créneau
        </Button>
      </Space>

      <Table
        dataSource={slots}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingSlot ? 'Modifier le créneau' : 'Nouveau créneau'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          {/* Sélecteur du jour de la semaine */}
          <Form.Item
            name="dayOfWeek"
            label="Jour de la semaine"
            rules={[{ required: true, message: 'Veuillez sélectionner un jour' }]}
          >
            <Select placeholder="Sélectionner un jour">
              {days.map((day) => (
                <Option key={day.value} value={day.value}>
                  {day.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Heure de début et fin sur la même ligne */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Heure de début"
                rules={[{ required: true, message: 'Veuillez sélectionner une heure de début' }]}
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="Heure de fin"
                rules={[{ required: true, message: 'Veuillez sélectionner une heure de fin' }]}
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
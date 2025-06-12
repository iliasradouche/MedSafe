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

const { Title } = Typography;
const { Option } = Select;

export default function OrdonnancesPage() {
  const [ords, setOrds] = useState([]);
  const [consults, setConsults] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingOrdonnance, setEditingOrdonnance] = useState(null);

  useEffect(() => {
    loadOrdonnances();
    loadConsultations();
  }, []);

  const loadOrdonnances = async () => {
    try {
      const data = await fetchOrdonnances();
      console.log('Consultations:', data);
      setOrds(data);
    } catch {
      message.error('Failed to load ordonnances');
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
      message.error('Failed to load consultations');
    }
  };

  const openModal = (ordonnance = null) => {
    if (ordonnance) {
      // Editing an existing ordonnance
      form.setFieldsValue({
        consultationId: ordonnance.consultationId,
        prescription: ordonnance.prescription,
      });
      setEditingOrdonnance(ordonnance);
    } else {
      // Creating a new ordonnance
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
        // Update ordonnance
        await updateOrdonnance(editingOrdonnance.id, payload);
        message.success('Ordonnance updated successfully');
      } else {
        // Create new ordonnance
        await createOrdonnance(payload);
        message.success('Ordonnance created successfully');
      }

      setIsModalVisible(false);
      loadOrdonnances();
    } catch (err) {
      message.error('Failed to save ordonnance');
    }
  };

  const handleDelete = async (ordonnance) => {
    Modal.confirm({
      title: 'Delete Ordonnance',
      content: 'Are you sure you want to delete this ordonnance?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteOrdonnance(ordonnance.id);
          message.success('Ordonnance deleted successfully');
          loadOrdonnances();
        } catch {
          message.error('Failed to delete ordonnance');
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
      message.error('Failed to download ordonnance PDF');
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
      render: (_, record) => record.consultationId,
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
          Download
        </Button>
      ),
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
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            type="danger"
          >
            Delete
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
        <Title level={4}>Ordonnances</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          New Ordonnance
        </Button>
      </Space>

      <Table
        dataSource={ords}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingOrdonnance ? 'Edit Ordonnance' : 'New Ordonnance'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="consultationId"
            label="Consultation"
            rules={[{ required: true, message: 'Please select a consultation' }]}
          >
            <Select
              placeholder="Select a consultation"
              options={consults}
            />
          </Form.Item>
          <Form.Item
            name="prescription"
            label="Prescription"
            rules={[
              { required: true, message: 'Please enter the prescription text' },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter prescription" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
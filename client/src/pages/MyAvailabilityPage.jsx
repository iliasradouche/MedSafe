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
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
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
      message.error('Failed to load slots');
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
        message.success('Slot updated successfully');
      } else {
        // Create new slot
        await api.post('/availabilities', payload);
        message.success('Slot created successfully');
      }

      setIsModalVisible(false);
      loadSlots();
    } catch (err) {
      message.error('Failed to save slot');
    }
  };

  const handleDelete = async (slot) => {
    Modal.confirm({
      title: 'Delete Slot',
      content: 'Are you sure you want to delete this slot?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await api.delete(`/availabilities/${slot.id}`);
          message.success('Slot deleted successfully');
          loadSlots();
        } catch {
          message.error('Failed to delete slot');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Day',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (dayOfWeek) => days.find((d) => d.value === dayOfWeek)?.label,
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'End Time',
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
        <Title level={4}>My Availability</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          New Slot
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
        title={editingSlot ? 'Edit Slot' : 'New Slot'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          {/* Day of Week Selector */}
          <Form.Item
            name="dayOfWeek"
            label="Day of Week"
            rules={[{ required: true, message: 'Please select a day' }]}
          >
            <Select placeholder="Select a day">
              {days.map((day) => (
                <Option key={day.value} value={day.value}>
                  {day.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Start Time and End Time on the Same Row */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true, message: 'Please select a start time' }]}
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="End Time"
                rules={[{ required: true, message: 'Please select an end time' }]}
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
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

const { Title } = Typography;
const { Option } = Select;

export default function ConsultationsPage() {
  const [consults, setConsults] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConsult, setEditingConsult] = useState(null);
  const [form] = Form.useForm();
  
  // State for native date and time inputs
  const [consultDate, setConsultDate] = useState('');
  const [consultTime, setConsultTime] = useState('');

  useEffect(() => {
    loadPatients();
    loadConsults();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await fetchPatients('');
      setPatientOptions(
        data.map(p => ({
          label: `${p.firstName} ${p.lastName}`,
          value: p.id
        }))
      );
    } catch {
      message.error('Failed to load patients');
    }
  };

  const loadConsults = async () => {
    try {
      const data = await fetchConsultations();
      console.log(data);
      setConsults(
        data.map((c) => ({
          id: c.id,
          patientId: c.patientId,
          patient: c.Patient,
          dateTime: c.dateTime,
          notes: c.notes
        }))
      );
    } catch {
      message.error('Failed to load consultations');
    }
  };

  const openNew = () => {
    form.resetFields();
    // Set default date to today and time to current time
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
    
    // Set date and time from the record
    const dateTime = moment(record.dateTime);
    setConsultDate(dateTime.format('YYYY-MM-DD'));
    setConsultTime(dateTime.format('HH:mm'));
    
    setEditingConsult(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => setIsModalVisible(false);

  const handleOk = async () => {
    try {
      // Get values from the form
      const values = await form.validateFields();
      
      // Validate date and time
      if (!consultDate) {
        message.error('Date is required');
        return;
      }
      
      if (!consultTime) {
        message.error('Time is required');
        return;
      }
      
      // Combine date and time into a single ISO string
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

      console.log('Submitting payload:', payload);

      if (editingConsult) {
        await updateConsultation(editingConsult.id, payload);
        message.success('Consultation updated');
      } else {
        await createConsultation(payload);
        message.success('Consultation created');
      }

      setIsModalVisible(false);
      loadConsults();
    } catch (err) {
      console.error('Operation failed:', err);
      
      if (err.errorFields) {
        // validation errors are shown inline
        return;
      }
      message.error('Operation failed');
    }
  };

  const handleDelete = record => {
    console.log('Delete button clicked for record:', record); // Debug log
    Modal.confirm({
      title: 'Supprimer cette consultation ?',
      content: 'Êtes-vous sûr de vouloir supprimer cette consultation ?',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        console.log('Confirm deletion for record:', record.id); // Debug log
        try {
          await deleteConsultation(record.id);
          message.success('La consultation a été supprimée');
          loadConsults();
        } catch (err) {
          console.error('Delete failed:', err); // Debug log
          message.error('Échec de la suppression');
        }
      }
    });
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
      render: (_, record) => {
        const opt = patientOptions.find(o => o.value === record.patientId);
        return opt?.label || 'Unknown Patient';
      }
    },
    {
      title: 'Date & Time',
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
      <Space
        style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}
      >
        <Title level={4}>Consultations</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openNew}
        >
          New Consultation
        </Button>
      </Space>

      <Table
        dataSource={consults}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingConsult ? 'Edit Consultation' : 'New Consultation'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose={true} // Changed from destroyOnHidden
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
            <Select options={patientOptions} placeholder="Select a patient" />
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
    </div>
  );
}
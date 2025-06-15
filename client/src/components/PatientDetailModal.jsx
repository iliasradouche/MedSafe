import React from "react";
import { Modal, Descriptions, Tag, Typography, Space } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function PatientDetailsModal({ open, onClose, patient }) {
  return (
    <Modal
      title={
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Informations du Patient :
          </Title>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      bodyStyle={{
        background: "#f0f4ff",
        borderRadius: 12,
        padding: 24,
      }}
      style={{
        top: 40,
        borderRadius: 16,
      }}
    >
      {patient && (
        <Descriptions
          bordered
          size="middle"
          column={1}
          labelStyle={{
            background: "#e6f7ff",
            fontWeight: 600,
            color: "#1890ff",
            width: 160,
          }}
          contentStyle={{ background: "#fff", color: "#333" }}
        >
          <Descriptions.Item label="Dossier N°">
            <Tag color="blue" style={{ fontWeight: 600 }}>
              {patient.dossierNumber}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={<span><UserOutlined /> Nom </span>}>
            {patient.firstName} {patient.lastName}
          </Descriptions.Item>
          <Descriptions.Item label={<span><CalendarOutlined /> Date de naissance </span>}>
            {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label={<span><PhoneOutlined /> Téléphone</span>}>
            {patient.phone || <Tag color="red">No phone</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label={<span><HomeOutlined /> Addresse </span>}>
            {patient.address || <Tag color="orange">No address</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label={<span><IdcardOutlined /> Contact d'urgence</span>}>
            {patient.emergencyContact || <Tag color="gold">No emergency contact</Tag>}
          </Descriptions.Item>
        </Descriptions>
      )}
      {!patient && (
        <Space direction="vertical" align="center" style={{ width: "100%" }}>
          <ExclamationCircleOutlined style={{ fontSize: 38, color: "#faad14" }} />
          <div>Patient not found</div>
        </Space>
      )}
    </Modal>
  );
}
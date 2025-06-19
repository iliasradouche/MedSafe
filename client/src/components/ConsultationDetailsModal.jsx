import React from "react";
import { Modal, Descriptions, Tag, Typography, Space } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function ConsultationDetailsModal({ open, onClose, consultation }) {
  // Defensive: find the patient and doctor objects safely
  const patient = consultation?.patient || consultation?.Patient || null;
  const doctor = consultation?.doctor || consultation?.medecin || null;

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: "#52c41a" }} />
          <Title level={4} style={{ margin: 0 }}>
            Détails de la Consultation
          </Title>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      bodyStyle={{
        background: "#f6ffed",
        borderRadius: 12,
        padding: 24,
      }}
      style={{
        top: 40,
        borderRadius: 16,
      }}
    >
      {consultation ? (
        <Descriptions
          bordered
          size="middle"
          column={1}
          labelStyle={{
            background: "#e6fffb",
            fontWeight: 600,
            color: "#52c41a",
            width: 180,
          }}
          contentStyle={{ background: "#fff", color: "#333" }}
        >
          <Descriptions.Item label={<span><CalendarOutlined /> Date & Heure</span>}>
            {consultation.dateTime ? new Date(consultation.dateTime).toLocaleString() : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label={<span><UserOutlined /> Patient</span>}>
            {patient
              ? `${patient.firstName || ""} ${patient.lastName || ""}`
              : "N/A"}
            {patient?.dossierNumber && (
              <Tag color="blue" style={{ marginLeft: 8 }}>
                Dossier N° {patient.dossierNumber}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={<span><UserOutlined /> Médecin</span>}>
            {doctor
              ? doctor.name
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label={<span><FileTextOutlined /> Notes</span>}>
            {consultation.notes || <Tag color="orange">Aucune note</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label={<span><IdcardOutlined /> Consultation ID</span>}>
            {consultation.id}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Space direction="vertical" align="center" style={{ width: "100%" }}>
          <ExclamationCircleOutlined style={{ fontSize: 38, color: "#faad14" }} />
          <div>Consultation introuvable</div>
        </Space>
      )}
    </Modal>
  );
}
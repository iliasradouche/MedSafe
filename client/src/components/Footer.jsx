import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, LinkedinOutlined, InstagramOutlined } from '@ant-design/icons';
import logo from '../assets/images/MedSafe.png';
const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

export default function Footer() {
  return (
    <AntFooter
      style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%)', // Gradient background
        color: 'var(--text-on-primary)', // Text color
        padding: '3rem 0',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
        }}
      >
        <Row gutter={[16, 16]} justify="space-between">
          {/* Column 1: Logo and Social Links */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '1.5rem' }}>
              {/* Logo Section */}
              <img
                src={logo}// Replace with your logo path
                alt="MedSafe Logo"
                style={{ maxWidth: '100px' }}
              />
              <Text style={{ color: 'var(--light)', display: 'block' }}>
                Gestion sécurisée des patients pour les prestataires de santé modernes.
              </Text>
            </div>
            {/* Social Media Icons */}
            <Space size="middle">
              <a href="#" style={{ color: 'var(--accent)', fontSize: '1.8rem' }}>
                <FacebookOutlined />
              </a>
              <a href="#" style={{ color: 'var(--accent)', fontSize: '1.8rem' }}>
                <TwitterOutlined />
              </a>
              <a href="#" style={{ color: 'var(--accent)', fontSize: '1.8rem' }}>
                <LinkedinOutlined />
              </a>
              <a href="#" style={{ color: 'var(--accent)', fontSize: '1.8rem' }}>
                <InstagramOutlined />
              </a>
            </Space>
          </Col>

          {/* Column 2: Product */}
          <Col xs={24} sm={12} md={6}>
            <Title
              level={5}
              style={{
                color: 'var(--text-on-primary)',
                marginBottom: '1rem',
              }}
            >
              Produit
            </Title>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
              <li>
                <a href="#" style={{ color: 'var(--light)' }}>
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#" style={{ color: 'var(--light)' }}>
                  Tarifs
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 3: Resources */}
          <Col xs={24} sm={12} md={6}>
            <Title
              level={5}
              style={{
                color: 'var(--text-on-primary)',
                marginBottom: '1rem',
              }}
            >
              Ressources
            </Title>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
              <li>
                <a href="#" style={{ color: 'var(--light)' }}>
                  Assistance
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 4: Company */}
          <Col xs={24} sm={12} md={6}>
            <Title
              level={5}
              style={{
                color: 'var(--text-on-primary)',
                marginBottom: '1rem',
              }}
            >
              Société
            </Title>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
              <li>
                <a href="#" style={{ color: 'var(--light)' }}>
                  À propos
                </a>
              </li>
              <li>
                <a href="#" style={{ color: 'var(--light)' }}>
                  Carrières
                </a>
              </li>
              <li>
                <a href="#" style={{ color: 'var(--light)' }}>
                  Confidentialité
                </a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--accent)',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            textAlign: 'center',
            color: 'var(--light)',
          }}
        >
          <Text>
            © 2025 MedSafe. Tous droits réservés. &nbsp;
            <a
              href="#"
              style={{
                color: 'var(--accent)',
                margin: '0 0.5rem',
              }}
            >
              Politique de confidentialité
            </a>
            <a
              href="#"
              style={{
                color: 'var(--accent)',
                margin: '0 0.5rem',
              }}
            >
              Conditions d'utilisation
            </a>
          </Text>
        </div>
      </div>
    </AntFooter>
  );
}
import React from 'react';
import { Layout, Row, Col, Typography, Space, Button, Divider, Input } from 'antd';
import { 
  FacebookOutlined, 
  TwitterOutlined, 
  LinkedinOutlined, 
  InstagramOutlined,
  SendOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import logo from '../assets/images/MedSafe.png';

const { Footer: AntFooter } = Layout;
const { Title, Text, Paragraph } = Typography;

// Fresh blue color palette to match the header
const colors = {
  primary: '#2B7DE0',    // Vibrant blue
  primary2: '#4F9BE2',   // Lighter complementary blue
  accent: '#7ADEFF',     // Fresh sky blue accent
  light: '#E0F7FF',      // Very light airy blue
  textOnPrimary: '#ffffff',
  background: '#F7FCFF',
  textLight: 'rgba(255, 255, 255, 0.8)',
  footerBackground: '#1A2B4A',  // Deep blue for the footer
};

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const currentYear = new Date().getFullYear();
  
  return (
    <AntFooter
      style={{
        background: colors.footerBackground,
        color: colors.textOnPrimary,
        padding: '4rem 0 2rem',
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem',
        }}
      >
        {/* Back to top button */}
        <div 
          style={{
            position: 'absolute',
            top: '-25px',
            right: '50px',
          }}
        >
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<ArrowUpOutlined />}
            onClick={scrollToTop}
            style={{
              background: colors.primary,
              borderColor: colors.primary,
              boxShadow: '0 4px 12px rgba(43, 125, 224, 0.4)',
            }}
          />
        </div>
        
        <Row gutter={[40, 40]} justify="space-between">
          {/* Column 1: Logo and Description */}
          <Col xs={24} sm={12} md={8} lg={7}>
            <div style={{ marginBottom: '1.5rem' }}>
              {/* Logo Section */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary2} 100%)`,
                  padding: '10px',
                  borderRadius: '10px',
                  marginRight: '15px',
                  boxShadow: '0 4px 12px rgba(43, 125, 224, 0.3)',
                }}>
                  <img
                    src={logo}
                    alt="MedSafe Logo"
                    style={{ 
                      width: '40px', 
                      height: '40px',
                      filter: 'brightness(0) invert(1)', // Make logo white
                    }}
                  />
                </div>
                <Title level={3} style={{ margin: 0, color: colors.textOnPrimary }}>
                  MedSafe
                </Title>
              </div>
              
              <Paragraph style={{ color: colors.textLight, fontSize: '15px', marginBottom: '24px' }}>
                Gestion sécurisée des patients pour les prestataires de santé modernes. Notre plateforme offre des solutions complètes pour moderniser vos services de santé.
              </Paragraph>
            </div>
            
            {/* Newsletter Signup */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={{ color: colors.accent, marginBottom: '16px' }}>
                Restez informé
              </Title>
              <div style={{ display: 'flex' }}>
                <Input 
                  placeholder="Votre email" 
                  style={{ 
                    borderTopRightRadius: 0, 
                    borderBottomRightRadius: 0,
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: colors.textOnPrimary,
                  }}
                />
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  style={{ 
                    borderTopLeftRadius: 0, 
                    borderBottomLeftRadius: 0,
                    background: colors.primary,
                    borderColor: colors.primary,
                  }}
                />
              </div>
            </div>
            
            {/* Social Media Icons */}
            <Space size="middle">
              <a href="#" style={{ color: colors.accent, fontSize: '20px' }}>
                <FacebookOutlined />
              </a>
              <a href="#" style={{ color: colors.accent, fontSize: '20px' }}>
                <TwitterOutlined />
              </a>
              <a href="#" style={{ color: colors.accent, fontSize: '20px' }}>
                <LinkedinOutlined />
              </a>
              <a href="#" style={{ color: colors.accent, fontSize: '20px' }}>
                <InstagramOutlined />
              </a>
            </Space>
          </Col>

          {/* Column 2: Product */}
          <Col xs={24} sm={12} md={5} lg={4}>
            <Title
              level={5}
              style={{
                color: colors.textOnPrimary,
                marginBottom: '1.5rem',
                fontSize: '18px',
              }}
            >
              Produit
            </Title>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.2' }}>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  Démonstration
                </a>
              </li>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  API
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 3: Resources */}
          <Col xs={24} sm={12} md={5} lg={4}>
            <Title
              level={5}
              style={{
                color: colors.textOnPrimary,
                marginBottom: '1.5rem',
                fontSize: '18px',
              }}
            >
              Ressources
            </Title>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.2' }}>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  Assistance
                </a>
              </li>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  Blog
                </a>
              </li>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  Tutoriels
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 4: Company */}
          <Col xs={24} sm={12} md={5} lg={4}>
            <Title
              level={5}
              style={{
                color: colors.textOnPrimary,
                marginBottom: '1.5rem',
                fontSize: '18px',
              }}
            >
              Société
            </Title>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.2' }}>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  À propos
                </a>
              </li>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  Carrières
                </a>
              </li>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  Équipe
                </a>
              </li>
              <li>
                <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
                  Confidentialité
                </a>
              </li>
            </ul>
          </Col>
          
          {/* Column 5: Contact */}
          <Col xs={24} sm={12} md={8} lg={5}>
            <Title
              level={5}
              style={{
                color: colors.textOnPrimary,
                marginBottom: '1.5rem',
                fontSize: '18px',
              }}
            >
              Contact
            </Title>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.2' }}>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <PhoneOutlined style={{ color: colors.accent, marginRight: '12px' }} />
                <Text style={{ color: colors.textLight }}>+33 1 23 45 67 89</Text>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <MailOutlined style={{ color: colors.accent, marginRight: '12px' }} />
                <Text style={{ color: colors.textLight }}>contact@medsafe.com</Text>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                <EnvironmentOutlined style={{ color: colors.accent, marginRight: '12px', marginTop: '5px' }} />
                <Text style={{ color: colors.textLight }}>
                  123 Avenue de la Santé<br />
                  75000 Paris, France
                </Text>
              </li>
            </ul>
          </Col>
        </Row>

        <Divider style={{ 
          borderColor: 'rgba(255, 255, 255, 0.1)', 
          margin: '40px 0 20px' 
        }} />

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            color: colors.textLight,
            fontSize: '14px',
          }}
        >
          <Text style={{ color: colors.textLight }}>
            © {currentYear} MedSafe. Tous droits réservés.
          </Text>
          
          <Space split={<Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />}>
            <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
              Politique de confidentialité
            </a>
            <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
              Conditions d'utilisation
            </a>
            <a href="#" style={{ color: colors.textLight, transition: 'color 0.3s' }}>
              Cookies
            </a>
            <Text style={{ color: colors.textLight }}>
              {new Date().toISOString().slice(0, 10)}
            </Text>
          </Space>
        </div>
      </div>
    </AntFooter>
  );
}
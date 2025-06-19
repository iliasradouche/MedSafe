import React, { useState } from 'react';
import { Button, Card, Form, Input, Typography, Checkbox, Grid } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import loginBg from '../assets/images/MedSafeLogin.png';
const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const screens = useBreakpoint();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      navigate('/profile');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: screens.md ? 'row' : 'column',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#f0f2f5',
      }}
    >
      {/* Image Section (hidden on mobile) */}
      {screens.md && (
        <div
          style={{
            flex: 1,
            minHeight: '100vh',
            backgroundImage: `url(${loginBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      )}

      {/* Login Form Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: screens.md ? 'auto' : '100vw',
          boxSizing: 'border-box',
          padding: screens.md ? '2rem' : '1rem',
          background: screens.md ? 'none' : '#f0f2f5',
        }}
      >
        <Card
          style={{
            maxWidth: 400,
            width: '100%',
            padding: screens.xs ? '1.5rem 0.5rem' : '2rem',
            boxShadow: '0 2px 24px 0 rgba(0,0,0,0.08)',
            borderRadius: 16,
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ padding: screens.xs ? '1.5rem 1rem' : '2rem' }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              Connexion à MedSafe
            </Title>
            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              initialValues={{ remember: true }}
            >
              <Form.Item
                name="email"
                label="Adresse e-mail"
                rules={[
                  { required: true, message: 'Veuillez entrer votre e-mail' },
                  { type: 'email', message: 'Veuillez entrer un e-mail valide' },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Entrez votre e-mail"
                  autoComplete="email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mot de passe"
                rules={[{ required: true, message: 'Veuillez entrer votre mot de passe' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
                  size="large"
                />
              </Form.Item>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Se souvenir de moi</Checkbox>
                </Form.Item>
                <a style={{ fontSize: '0.95em' }} href="#">
                  Mot de passe oublié ?
                </a>
              </div>

              <Form.Item style={{ marginBottom: 8 }}>
                <Button type="primary" htmlType="submit" block loading={loading} size="large">
                  Se connecter
                </Button>
              </Form.Item>

              <Form.Item style={{ textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>
                Nouveau sur MedSafe ?{' '}
                <a onClick={() => navigate('/register')} style={{ color: '#1890ff' }}>
                  Créer un compte
                </a>
              </Form.Item>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
}
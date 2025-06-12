// src/pages/Login.jsx
import React, { useState } from 'react';
import { Button, Card, Form, Input, Typography, Checkbox } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';

const { Title } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      navigate('/profile'); // Redirect to profile after login
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
    }}>
      {/* Image Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'url(https://via.placeholder.com/600x800)', // Replace with your image URL
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: window.innerWidth < 768 ? 'none' : 'flex', // Hide on mobile
      }} />

      {/* Login Form Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <Card style={{ maxWidth: 400, width: '100%', padding: '2rem' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            Connexion à MedSafe
          </Title>
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ remember: true }}
          >
            {/* Email Input */}
            <Form.Item
              name="email"
              label="Adresse e-mail"
              rules={[
                { required: true, message: 'Veuillez entrer votre e-mail' },
                { type: 'email', message: 'Veuillez entrer un e-mail valide' }
              ]}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="Entrez votre e-mail" 
              />
            </Form.Item>

            {/* Password Input */}
            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[{ required: true, message: 'Veuillez entrer votre mot de passe' }]}
            >
              <Input.Password 
                prefix={<LockOutlined className="site-form-item-icon" />} 
                placeholder="Entrez votre mot de passe" 
              />
            </Form.Item>

            {/* Remember Me */}
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Se souvenir de moi</Checkbox>
            </Form.Item>

            <Form.Item>
              <a style={{ float: 'right', marginTop: '0.5rem' }} href="#">
                Mot de passe oublié ?
              </a>
            </Form.Item>

            {/* Submit Button */}
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
              >
                Se connecter
              </Button>
            </Form.Item>

            {/* Register Link */}
            <Form.Item style={{ textAlign: 'center', marginTop: '1rem' }}>
              Nouveau sur MedSafe ?{' '}
              <a onClick={() => navigate('/register')} style={{ color: '#1890ff' }}>
                Créer un compte
              </a>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
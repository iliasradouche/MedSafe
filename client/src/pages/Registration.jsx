// src/pages/Registration.jsx
import React, { useState } from 'react';
import { Steps, Button, Card, Form, Input, Typography, Select, DatePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const { Step } = Steps;
const { Title } = Typography;
const { Option } = Select;

export default function Registration() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false); // For submit button
  const [data, setData] = useState({
    role: null, name: '', email: '', password: '',
    licenseNumber: '', specialization: '', phone: '', address: '',
    dateOfBirth: null, emergencyContact: ''
  });

  const steps = [
    {
      title: 'Role',
      content: (
        <Form layout="vertical">
          <Form.Item label="Choisissez votre rôle" required>
            <Select 
              placeholder="Sélectionnez votre rôle"
              value={data.role}
              onChange={(value) => setData({ ...data, role: value })}
            >
              <Option value="PATIENT">Patient</Option>
              <Option value="MEDECIN">Médecin</Option>
            </Select>
          </Form.Item>
        </Form>
      )
    },
    {
      title: 'Account Details',
      content: (
        <Form layout="vertical">
          <Form.Item label="Nom complet" required>
            <Input 
              placeholder="Entrez votre nom complet" 
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Email" required>
            <Input 
              type="email"
              placeholder="Entrez votre email" 
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Mot de passe" required>
            <Input.Password 
              placeholder="Entrez votre mot de passe" 
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
          </Form.Item>
        </Form>
      )
    },
    {
      title: data.role === 'MEDECIN' ? 'Doctor Info' : 'Patient Info',
      content: (
        <Form layout="vertical">
          {data.role === 'MEDECIN' && (
            <>
              <Form.Item label="Numéro de licence" required>
                <Input 
                  placeholder="Entrez votre numéro de licence"
                  value={data.licenseNumber}
                  onChange={(e) => setData({ ...data, licenseNumber: e.target.value })}
                />
              </Form.Item>
              <Form.Item label="Spécialisation" required>
                <Input 
                  placeholder="Entrez votre spécialisation"
                  value={data.specialization}
                  onChange={(e) => setData({ ...data, specialization: e.target.value })}
                />
              </Form.Item>
            </>
          )}
          {data.role === 'PATIENT' && (
            <>
              <Form.Item label="Date de naissance" required>
                <DatePicker 
                  style={{ width: '100%' }} 
                  value={data.dateOfBirth}
                  onChange={(date) => setData({ ...data, dateOfBirth: date })}
                />
              </Form.Item>
              <Form.Item label="Contact d'urgence" required>
                <Input 
                  placeholder="Entrez un contact d'urgence"
                  value={data.emergencyContact}
                  onChange={(e) => setData({ ...data, emergencyContact: e.target.value })}
                />
              </Form.Item>
            </>
          )}
          <Form.Item label="Téléphone" required>
            <Input 
              placeholder="Entrez votre numéro de téléphone"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Adresse" required>
            <Input 
              placeholder="Entrez votre adresse"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
            />
          </Form.Item>
        </Form>
      )
    }
  ];

  const next = () => setActive((prev) => Math.min(prev + 1, steps.length - 1));
  const prev = () => setActive((prev) => Math.max(prev - 1, 0));

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/auth/register', data);
      navigate('/register-success');
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '1rem'
    }}>
      <Card style={{ width: '100%', maxWidth: 600 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Inscription à MedSafe
        </Title>
        <Steps current={active} style={{ marginBottom: '2rem' }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} />
          ))}
        </Steps>
        <div style={{ marginBottom: '2rem' }}>
          {steps[active].content}
        </div>
        <div style={{ textAlign: 'right' }}>
          {active > 0 && (
            <Button style={{ marginRight: 8 }} onClick={prev}>
              Précédent
            </Button>
          )}
          {active < steps.length - 1 ? (
            <Button type="primary" onClick={next}>
              Suivant
            </Button>
          ) : (
            <Button type="primary" loading={loading} onClick={submit}>
              S'inscrire
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
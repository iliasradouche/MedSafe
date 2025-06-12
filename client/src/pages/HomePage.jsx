import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Typography, Card, Spin } from 'antd';
import api from '../api/axios';
import useAuth from '../auth/useAuth';
import DoctorCard from '../components/DoctorCard';

const { Title, Text } = Typography;

export default function HomePage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Updated Color Palette
  const colors = {
    primary: '#2973B2',
    secondary: '#48A6A7',
    accent: '#9ACBD0',
    light: '#F2EFE7',
    dark: '#1e293b', // Optional for dark text
  };

  useEffect(() => {
    api
      .get('/doctors')
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error('Échec du chargement des médecins', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Spin size="large" />
        <Text>Chargement des médecins…</Text>
      </div>
    );

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, rgba(41,115,178,0.1) 0%, rgba(72,166,167,0.1) 100%)`,
          padding: '5rem 1rem',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={1} style={{ color: colors.dark }}>
            Gestion sécurisée des patients <span style={{ color: colors.primary }}>Simplifiée</span>
          </Title>
          <Text style={{ fontSize: '1.125rem', color: '#4a5568', marginBottom: '2rem', display: 'block' }}>
            MedSafe offre aux professionnels de santé une plateforme intuitive et sécurisée : gérez dossiers, rendez-vous et e‑prescriptions en un seul endroit.
          </Text>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/register')}
              style={{
                background: colors.primary,
                borderColor: colors.primary,
              }}
            >
              Commencer l'essai gratuit
            </Button>
            <Button
              type="default"
              size="large"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
              }}
            >
              Regarder la démonstration
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '3rem 1rem', background: colors.light }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '2rem' }}>
            Pourquoi choisir MedSafe ?
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Title level={4}>Gestion des patients</Title>
                <Text>Organisez et accédez facilement aux dossiers de vos patients.</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Title level={4}>Planification simplifiée</Title>
                <Text>Planifiez vos rendez-vous avec un calendrier interactif.</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Title level={4}>Prescriptions électroniques</Title>
                <Text>Créez et envoyez des ordonnances en quelques clics.</Text>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Choose Your Doctor Section */}
      <section style={{ padding: '3rem 1rem', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Choisissez votre médecin
          </Title>
          <Row gutter={[16, 16]}>
            {doctors.map((doctor) => (
              <Col xs={24} sm={12} md={8} key={doctor.id}>
                <DoctorCard doctor={doctor} />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '3rem 1rem', background: colors.light }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '2rem' }}>
            Ce que disent nos utilisateurs
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Text>
                  "MedSafe m'a permis de mieux organiser mon cabinet et de gagner du temps."
                </Text>
                <br />
                <strong>- Dr. Jean Dupont</strong>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Text>
                  "Une solution intuitive et sécurisée pour mes besoins professionnels."
                </Text>
                <br />
                <strong>- Dr. Marie Curie</strong>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable>
                <Text>
                  "Je recommande fortement MedSafe à tous les professionnels de santé."
                </Text>
                <br />
                <strong>- Dr. Claude Bernard</strong>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        style={{
          padding: '3rem 1rem',
          background: colors.primary,
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={{ color: '#fff', marginBottom: '1rem' }}>
            Prêt à découvrir MedSafe ?
          </Title>
          <Text style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'block' }}>
            Rejoignez des milliers de professionnels de santé qui utilisent MedSafe pour simplifier leur quotidien.
          </Text>
          <Button
            type="primary"
            size="large"
            style={{
              backgroundColor: colors.accent,
              borderColor: colors.accent,
            }}
            href="/register"
          >
            Inscrivez-vous gratuitement
          </Button>
        </div>
      </section>
    </div>
  );
}
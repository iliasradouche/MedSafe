import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Typography, Card, Spin, Input, Select, Steps } from 'antd';
import api from '../api/axios';
import useAuth from '../auth/useAuth';
import DoctorCard from '../components/DoctorCard';
import {
  SearchOutlined,
  SolutionOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import homepic from '../assets/images/MedSafe.png';
const { Title, Text } = Typography;
const { Option } = Select;

export default function HomePage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [city, setCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Color palette (blue light family)
  const colors = {
    primary: '#2973B2',
    secondary: '#4DA8DA',
    accent: '#A9D6E5',
    light: '#EDF6FB',
    card: '#F8FBFD',
    dark: '#1e293b',
  };

  // Fetch doctors and specialties
  useEffect(() => {
    api
      .get('/doctors')
      .then((res) => {
        setDoctors(res.data);
        // Extract unique specialties for search bar
        const specs = Array.from(
          new Set(
            res.data
              .map(doc => doc.doctorProfile?.specialization)
              .filter(Boolean)
          )
        );
        setSpecialties(specs);
      })
      .catch((err) => console.error('Échec du chargement des médecins', err))
      .finally(() => setLoading(false));
  }, []);

  // Redirect to the new doctors list page with search params
  const handleSearch = () => {
    const params = [];
    if (selectedSpecialty) params.push(`specialty=${encodeURIComponent(selectedSpecialty)}`);
    if (city) params.push(`city=${encodeURIComponent(city)}`);
    navigate(`/all-doctors${params.length ? '?' + params.join('&') : ''}`);
  };

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: '2rem', background: colors.light, minHeight: '100vh' }}>
        <Spin size="large" />
        <Text>Chargement des médecins…</Text>
      </div>
    );

  return (
    <div style={{ background: colors.light, minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 1rem 3rem 1rem',
          background: `linear-gradient(120deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
          borderRadius: '0 0 32px 32px',
          boxShadow: '0 8px 32px #2973b215',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Row align="middle" gutter={[32, 32]}>
            {/* Left: Image */}
            <Col xs={24} md={12} style={{ textAlign: 'center' }}>
              <img
                src={homepic}
                alt="MedSafe Hero Visual"
                style={{ width: '100%', maxWidth: 320, minWidth: 180 }}
              />
            </Col>
            {/* Right: Content */}
            <Col xs={24} md={12}>
              <Title level={1} style={{ color: colors.dark, textAlign: 'left' }}>
                Prenez rendez-vous <span style={{ color: colors.secondary }}>facilement</span>
              </Title>
              <Text
                style={{
                  fontSize: '1.2rem',
                  color: '#364057',
                  marginBottom: '2rem',
                  display: 'block',
                  textAlign: 'left',
                }}
              >
                Trouvez le bon médecin, choisissez un créneau et réservez en ligne en toute sécurité.
              </Text>
              {/* Search Bar */}
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  background: colors.card,
                  borderRadius: 16,
                  boxShadow: '0 2px 16px #2973b230',
                  padding: 20,
                  margin: '0 0 2rem 0',
                  maxWidth: 450,
                  alignItems: 'center',
                }}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Spécialité"
                  style={{ width: 140 }}
                  value={selectedSpecialty || undefined}
                  onChange={setSelectedSpecialty}
                  filterOption={(input, option) =>
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {specialties.map((spec) => (
                    <Option key={spec} value={spec}>{spec}</Option>
                  ))}
                </Select>
                <Input
                  placeholder="Ville"
                  style={{ width: 110 }}
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  style={{
                    background: colors.primary,
                    borderColor: colors.primary,
                    fontWeight: 500,
                  }}
                  onClick={handleSearch}
                >
                  Chercher
                </Button>
              </div>
              {/* <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
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
              </div> */}
            </Col>
          </Row>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '3rem 1rem 2rem 1rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '2rem', color: colors.primary }}>
            Comment ça marche ?
          </Title>
          <Steps
            current={3}
            responsive
            size="small"
            style={{ maxWidth: 800, margin: '0 auto', marginBottom: 32 }}
            items={[
              {
                title: 'Chercher un médecin',
                icon: <SolutionOutlined style={{ color: colors.primary, fontSize: 24 }} />,
                description: 'Recherchez par spécialité ou par ville.',
              },
              {
                title: 'Choisir un créneau',
                icon: <CalendarOutlined style={{ color: colors.secondary, fontSize: 24 }} />,
                description: 'Consultez les disponibilités en temps réel.',
              },
              {
                title: 'Réserver en ligne',
                icon: <CheckCircleOutlined style={{ color: colors.accent, fontSize: 24 }} />,
                description: 'Réservez et recevez une confirmation.',
              },
            ]}
          />
        </div>
      </section>

      {/* Choose Your Doctor Section */}
      <section style={{ padding: '3rem 1rem', background: colors.card }}>
  <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
    <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem', color: colors.secondary }}>
      Choisissez votre médecin
    </Title>
    <Row gutter={[16, 16]}>
      {doctors.length === 0 && (
        <Col span={24} style={{ textAlign: 'center', color: '#aaa', fontSize: 18 }}>
          Aucun médecin trouvé avec ces critères.
        </Col>
      )}
      {doctors.map((doctor) => (
        <Col xs={24} sm={12} md={8} key={doctor.id}>
          <DoctorCard doctor={doctor} />
        </Col>
      ))}
    </Row>
    
    {/* Button to redirect to all doctors */}
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <Button 
        type="primary" 
        size="large"
        onClick={() => navigate('/all-doctors')}
        style={{ 
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          borderRadius: '4px',
          padding: '0 2rem',
          height: '44px',
          fontWeight: 'bold'
        }}
      >
        Voir tous les médecins
      </Button>
    </div>
  </div>
</section>

      {/* Features Section */}
      <section style={{ padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '2rem', color: colors.primary }}>
            Pourquoi choisir MedSafe ?
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ background: colors.card, border: 'none', minHeight: 210 }}>
                <UserOutlined style={{ fontSize: 40, color: colors.primary, marginBottom: 12 }} />
                <Title level={4}>Gestion des patients</Title>
                <Text>Organisez et accédez facilement aux dossiers de vos patients.</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ background: colors.card, border: 'none', minHeight: 210 }}>
                <TeamOutlined style={{ fontSize: 40, color: colors.secondary, marginBottom: 12 }} />
                <Title level={4}>Planification simplifiée</Title>
                <Text>Planifiez vos rendez-vous avec un calendrier interactif.</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ background: colors.card, border: 'none', minHeight: 210 }}>
                <SafetyCertificateOutlined style={{ fontSize: 40, color: colors.accent, marginBottom: 12 }} />
                <Title level={4}>Prescriptions électroniques</Title>
                <Text>Créez et envoyez des ordonnances en quelques clics.</Text>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '3rem 1rem', background: colors.card }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '2rem', color: colors.secondary }}>
            Ce que disent nos utilisateurs
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ background: colors.light, border: 'none', minHeight: 150 }}>
                <SmileOutlined style={{ fontSize: 32, color: colors.primary, marginBottom: 12 }} />
                <Text>
                  "MedSafe m'a permis de mieux organiser mon cabinet et de gagner du temps."
                </Text>
                <br />
                <strong>- Dr. Jean Dupont</strong>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ background: colors.light, border: 'none', minHeight: 150 }}>
                <SmileOutlined style={{ fontSize: 32, color: colors.secondary, marginBottom: 12 }} />
                <Text>
                  "Une solution intuitive et sécurisée pour mes besoins professionnels."
                </Text>
                <br />
                <strong>- Dr. Marie Curie</strong>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ background: colors.light, border: 'none', minHeight: 150 }}>
                <SmileOutlined style={{ fontSize: 32, color: colors.accent, marginBottom: 12 }} />
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
{/*       <section
        style={{
          padding: '3rem 1rem',
          background: `linear-gradient(120deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
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
              color: colors.dark,
              fontWeight: 600,
            }}
            href="/register"
          >
            Inscrivez-vous gratuitement
          </Button>
        </div>
      </section> */}
    </div>
  );
}
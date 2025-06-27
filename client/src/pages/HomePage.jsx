import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Button,
  Typography,
  Card,
  Spin,
  Input,
  Select,
  Steps,
  Carousel,
  Avatar,
  Statistic,
  Divider,
  Empty,
  Tag,
  Space,
  Badge
} from 'antd';
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
  ArrowRightOutlined,
  StarFilled,
  MedicineBoxOutlined,
  LockOutlined,
  ClockCircleOutlined,
  HeartFilled,
  GlobalOutlined,
  //ShieldOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import homepic from '../assets/images/MedSafe.png';
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function HomePage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [city, setCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentDateTime = '2025-06-20 22:49:51';
  const currentUser = 'username';

  // Fresh blue color palette
  const colors = {
    primary: '#2B7DE0',     // Vibrant blue
    primary2: '#4F9BE2',    // Lighter complementary blue
    accent: '#7ADEFF',      // Fresh sky blue accent
    light: '#E0F7FF',       // Very light airy blue
    textOnPrimary: '#ffffff',
    background: '#F7FCFF',  // Almost white with hint of blue
    card: '#FFFFFF',        // White for cards
    dark: '#1A2B4A',        // Deep blue for contrast
    grey: '#F0F2F5',        // Light grey for backgrounds
    darkGrey: '#8C9CB0',    // For secondary text
    border: '#E3ECF5',      // Border color
    lightGradient: 'linear-gradient(135deg, #F7FCFF 0%, #E0F7FF 100%)',
    primaryGradient: 'linear-gradient(135deg, #2B7DE0 0%, #4F9BE2 100%)',
    cardShadow: '0 4px 12px rgba(43, 125, 224, 0.08)',
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

  // Statistics data
  const stats = [
    { title: 'Médecins', value: '2,500+', icon: <MedicineBoxOutlined style={{ color: colors.primary }} /> },
    { title: 'Utilisateurs', value: '50,000+', icon: <UserOutlined style={{ color: colors.primary2 }} /> },
    { title: 'Consultations', value: '350,000+', icon: <CalendarOutlined style={{ color: colors.accent }} /> },
  ];

  // Testimonial data
  const testimonials = [
    {
      name: 'Dr. Jean Dupont',
      role: 'Cardiologue',
      text: "MedSafe m'a permis de mieux organiser mon cabinet et de gagner du temps. L'interface est intuitive et mes patients apprécient la facilité de prise de rendez-vous.",
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
      rating: 5,
    },
    {
      name: 'Dr. Marie Curie',
      role: 'Pédiatre',
      text: "Une solution intuitive et sécurisée pour mes besoins professionnels. Les fonctionnalités de gestion des dossiers patients sont particulièrement bien conçues.",
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 5,
    },
    {
      name: 'Dr. Claude Bernard',
      role: 'Médecin généraliste',
      text: "Je recommande fortement MedSafe à tous les professionnels de santé. Depuis que j'utilise cette plateforme, j'ai réduit mes tâches administratives de moitié.",
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 4,
    },
  ];

  if (loading)
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        background: colors.background,
        minHeight: '100vh',
        gap: '16px',
      }}>
        <Spin size="large" />
        <Text style={{ color: colors.primary, marginTop: '12px' }}>
          Chargement des informations...
        </Text>
      </div>
    );

  return (
    <div style={{ background: colors.background, minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: colors.primaryGradient,
            opacity: 0.05,
            zIndex: 1,
          }}
        />

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '80px 24px 60px',
          position: 'relative',
          zIndex: 2,
        }}>
          <Row align="middle" gutter={[48, 48]}>
            <Col xs={24} md={12} style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <Badge.Ribbon
                  text="Service sécurisé"
                  color={colors.primary}
                  style={{
                    marginRight: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    paddingInline: '10px',
                  }}
                >
                  <Title
                    level={1}
                    style={{
                      color: colors.dark,
                      fontSize: '42px',
                      marginBottom: '16px',
                      lineHeight: 1.2,
                    }}
                  >
                    Votre santé, <br />
                    <span style={{
                      background: colors.primaryGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      notre priorité
                    </span>
                  </Title>
                </Badge.Ribbon>
              </div>

              <Paragraph
                style={{
                  fontSize: '18px',
                  color: colors.darkGrey,
                  marginBottom: '32px',
                  maxWidth: '500px',
                  lineHeight: 1.6,
                }}
              >
                MedSafe facilite la gestion de vos rendez-vous médicaux. Trouvez rapidement le bon médecin, choisissez un créneau disponible et réservez en ligne en toute sécurité.
              </Paragraph>

              {/* Search Bar */}
              <Card
                style={{
                  borderRadius: '12px',
                  boxShadow: colors.cardShadow,
                  border: 'none',
                  marginBottom: '32px',
                  maxWidth: '520px',
                  background: colors.card,
                }}
              >
                <Title level={5} style={{ marginBottom: '16px', color: colors.dark }}>
                  Trouvez un médecin
                </Title>

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <Select
                      showSearch
                      allowClear
                      placeholder="Spécialité"
                      style={{ flex: 1 }}
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
                      style={{ flex: 1 }}
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      prefix={<GlobalOutlined style={{ color: colors.darkGrey }} />}
                    />
                  </div>

                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    style={{
                      background: colors.primaryGradient,
                      borderColor: colors.primary,
                      width: '100%',
                      height: '40px',
                      fontSize: '16px',
                      fontWeight: 500,
                      boxShadow: '0 2px 8px rgba(43, 125, 224, 0.25)',
                    }}
                    onClick={handleSearch}
                  >
                    Rechercher
                  </Button>
                </Space>
              </Card>

              {/* Statistics */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                maxWidth: '450px',
                marginTop: '24px',
              }}>
                {stats.map((stat, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: colors.dark,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}>
                      {stat.icon}
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: colors.darkGrey,
                      marginTop: '4px',
                    }}>
                      {stat.title}
                    </div>
                  </div>
                ))}
              </div>
            </Col>

            {/* Right: Image */}
            <Col xs={24} md={12} style={{ textAlign: 'center' }}>
              <div style={{
                background: colors.light,
                borderRadius: '24px',
                padding: '40px',
                boxShadow: colors.cardShadow,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at 70% 30%, rgba(122, 222, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%)',
                  zIndex: 1,
                }} />

                <img
                  src={homepic}
                  alt="MedSafe Hero Visual"
                  style={{
                    width: '80%',
                    maxWidth: 360,
                    position: 'relative',
                    zIndex: 2,
                  }}
                />
              </div>

              {/* Trust badges */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '24px',
                marginTop: '24px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: colors.darkGrey,
                  fontSize: '14px',
                }}>
                  <SafetyCertificateOutlined style={{ color: colors.primary }} />
                  Données sécurisées
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: colors.darkGrey,
                  fontSize: '14px',
                }}>
                  <ClockCircleOutlined style={{ color: colors.primary }} />
                  Support 24/7
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: colors.darkGrey,
                  fontSize: '14px',
                }}>
                  <HeartFilled style={{ color: colors.primary }} />
                  98% satisfaction
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Wave separator */}
        <div style={{
          position: 'relative',
          height: '100px',
          marginTop: '-40px',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style={{ position: 'absolute', bottom: 0 }}>
            <path
              fill={colors.light}
              fillOpacity="1"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,170.7C960,139,1056,85,1152,80C1248,75,1344,117,1392,138.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '40px 24px 80px', background: colors.light }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <Text style={{
            color: colors.primary,
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Processus Simple
          </Text>
          <Title level={2} style={{
            marginBottom: '40px',
            color: colors.dark,
            fontSize: '36px',
          }}>
            Comment ça marche ?
          </Title>

          <Steps
            current={3}
            responsive
            style={{ maxWidth: 1000, margin: '0 auto 48px', textAlign: 'left' }}
            items={[
              {
                title: 'Chercher un médecin',
                description: 'Recherchez par spécialité, localisation ou disponibilité.',
                icon: <div style={{
                  background: colors.primary,
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(43, 125, 224, 0.25)',
                }}>
                  <SolutionOutlined style={{ color: 'white', fontSize: 24 }} />
                </div>,
              },
              {
                title: 'Choisir un créneau',
                description: 'Sélectionnez une date et une heure qui vous conviennent.',
                icon: <div style={{
                  background: colors.primary2,
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(43, 125, 224, 0.25)',
                }}>
                  <CalendarOutlined style={{ color: 'white', fontSize: 24 }} />
                </div>,
              },
              {
                title: 'Confirmer la réservation',
                description: 'Recevez une confirmation instantanée par email et SMS.',
                icon: <div style={{
                  background: colors.accent,
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(122, 222, 255, 0.25)',
                }}>
                  <CheckCircleOutlined style={{ color: 'white', fontSize: 24 }} />
                </div>,
              },
            ]}
          />

          {/* CTA Button */}
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/all-doctors')}
            style={{
              background: colors.primaryGradient,
              borderColor: colors.primary,
              height: '48px',
              padding: '0 32px',
              fontSize: '16px',
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(43, 125, 224, 0.25)',
              borderRadius: '8px',
            }}
          >
            Prendre rendez-vous maintenant
            <ArrowRightOutlined style={{ marginLeft: 8 }} />
          </Button>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section style={{ padding: '80px 24px', background: colors.background }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <Text style={{
                color: colors.primary,
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Experts Médicaux
              </Text>
              <Title level={2} style={{
                margin: '8px 0 0',
                color: colors.dark,
                fontSize: '36px',
              }}>
                Médecins Recommandés
              </Title>
            </div>

            <Button
              type="primary"
              ghost
              onClick={() => navigate('/all-doctors')}
              style={{
                borderColor: colors.primary,
                color: colors.primary,
                height: '40px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Voir tous les médecins
              <ArrowRightOutlined style={{ marginLeft: 8 }} />
            </Button>
          </div>

          {/* Doctor Cards */}
          <Row gutter={[24, 24]}>
            {doctors.length === 0 ? (
              <Col span={24}>
                <Empty
                  description="Aucun médecin disponible pour le moment"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{
                    background: colors.card,
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: colors.cardShadow,
                  }}
                />
              </Col>
            ) : (
              doctors.slice(0, 3).map((doctor) => (
                <Col xs={24} sm={12} md={8} key={doctor.id}>
                  <DoctorCard doctor={doctor} />
                </Col>
              ))
            )}
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 24px', background: colors.lightGradient }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <Text style={{
            color: colors.primary,
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Nos Avantages
          </Text>
          <Title level={2} style={{
            marginBottom: '40px',
            color: colors.dark,
            fontSize: '36px',
          }}>
            Pourquoi choisir MedSafe ?
          </Title>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{
                  borderRadius: '12px',
                  boxShadow: colors.cardShadow,
                  border: 'none',
                  height: '100%',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  background: `rgba(43, 125, 224, 0.1)`,
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <UserOutlined style={{ fontSize: 28, color: colors.primary }} />
                </div>
                <Title level={4} style={{ color: colors.dark }}>Gestion des patients</Title>
                <Paragraph style={{ color: colors.darkGrey, fontSize: '15px' }}>
                  Organisez et accédez facilement aux dossiers de vos patients. Consultez l'historique médical, les prescriptions et les rendez-vous antérieurs.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{
                  borderRadius: '12px',
                  boxShadow: colors.cardShadow,
                  border: 'none',
                  height: '100%',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  background: `rgba(79, 155, 226, 0.1)`,
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <TeamOutlined style={{ fontSize: 28, color: colors.primary2 }} />
                </div>
                <Title level={4} style={{ color: colors.dark }}>Planification simplifiée</Title>
                <Paragraph style={{ color: colors.darkGrey, fontSize: '15px' }}>
                  Planifiez vos rendez-vous avec un calendrier interactif. Recevez des notifications et évitez les chevauchements dans votre emploi du temps.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{
                  borderRadius: '12px',
                  boxShadow: colors.cardShadow,
                  border: 'none',
                  height: '100%',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  background: `rgba(122, 222, 255, 0.1)`,
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <SafetyCertificateOutlined style={{ fontSize: 28, color: colors.accent }} />
                </div>
                <Title level={4} style={{ color: colors.dark }}>Prescriptions électroniques</Title>
                <Paragraph style={{ color: colors.darkGrey, fontSize: '15px' }}>
                  Créez et envoyez des ordonnances en quelques clics. Les patients peuvent récupérer leurs prescriptions directement à la pharmacie.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '80px 24px', background: colors.background }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <Text style={{
            color: colors.primary,
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'block',
            textAlign: 'center',
          }}>
            Témoignages
          </Text>
          <Title level={2} style={{
            marginBottom: '40px',
            color: colors.dark,
            fontSize: '36px',
            textAlign: 'center',
          }}>
            Ce que disent nos utilisateurs
          </Title>

          <Row gutter={[24, 24]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  style={{
                    borderRadius: '12px',
                    boxShadow: colors.cardShadow,
                    border: 'none',
                    height: '100%',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      {Array(testimonial.rating).fill().map((_, i) => (
                        <StarFilled key={i} style={{ color: '#FFBB00', marginRight: '4px' }} />
                      ))}
                    </div>

                    <Paragraph style={{
                      color: colors.dark,
                      fontSize: '16px',
                      flex: 1,
                      marginBottom: '20px',
                    }}>
                      "{testimonial.text}"
                    </Paragraph>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={testimonial.avatar}
                        size={48}
                        style={{ marginRight: '12px' }}
                      />
                      <div>
                        <Text style={{
                          display: 'block',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          color: colors.dark,
                        }}>
                          {testimonial.name}
                        </Text>
                        <Text style={{
                          color: colors.darkGrey,
                          fontSize: '14px',
                        }}>
                          {testimonial.role}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={{
        padding: '80px 24px',
        background: colors.primaryGradient,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-100px',
          left: '-100px',
        }} />
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          bottom: '-50px',
          right: '100px',
        }} />

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
        }}>
          <Title level={2} style={{
            color: colors.textOnPrimary,
            marginBottom: '16px',
            fontSize: '36px',
          }}>
            Besoin d'aide pour démarrer ?
          </Title>

          <Paragraph style={{
            fontSize: '18px',
            marginBottom: '32px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: 1.6,
          }}>
            Notre équipe est disponible pour vous accompagner dans la prise en main de MedSafe. N'hésitez pas à nous contacter pour toute question.
          </Paragraph>

          <Space size="large">
            <Button
              size="large"
              style={{
                backgroundColor: colors.textOnPrimary,
                color: colors.primary,
                fontWeight: 600,
                height: '48px',
                fontSize: '16px',
                padding: '0 32px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              onClick={() => navigate('/register')}
            >
              S'inscrire gratuitement
            </Button>

            <Button
              size="large"
              type="default"
              ghost
              icon={<PhoneOutlined />}
              style={{
                borderColor: colors.textOnPrimary,
                color: colors.textOnPrimary,
                height: '48px',
                fontSize: '16px',
                padding: '0 32px',
                borderRadius: '8px',
              }}
              onClick={() => navigate('/contact')}
            >
              Nous contacter
            </Button>
          </Space>

          <Text style={{
            display: 'block',
            marginTop: '24px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px',
          }}>
            Aucune carte de crédit requise • Annulez à tout moment
          </Text>
        </div>
      </section>

      {/* Current date and time */}
      <div style={{
        padding: '10px 24px',
        background: colors.dark,
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '12px',
        textAlign: 'center',
      }}>
        Date et heure actuelles (UTC): {currentDateTime} • Utilisateur: {currentUser}
      </div>
    </div>
  );
}
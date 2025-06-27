import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Typography, 
  Spin, 
  Select, 
  Button, 
  Card, 
  Tag, 
  Divider, 
  Empty, 
  Tooltip,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  MedicineBoxOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  FilterOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import api from '../api/axios';
import DoctorCard from '../components/DoctorCard';

const { Title, Text } = Typography;
const { Option } = Select;

export default function DoctorsListPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [allSpecialties, setAllSpecialties] = useState([]);
  const [allCities, setAllCities] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Fresh blue color palette
  const colors = {
    primary: '#2B7DE0',    // Vibrant blue
    primary2: '#4F9BE2',   // Lighter complementary blue
    accent: '#7ADEFF',     // Fresh sky blue accent
    light: '#E0F7FF',      // Very light airy blue
    textOnPrimary: '#ffffff',
    background: '#FFFFFF', // White background
    card: '#FFFFFF',       // White for cards
    dark: '#1A2B4A',       // Deep blue for contrast
    grey: '#F5F7FA',       // Light grey for backgrounds
    darkGrey: '#8C9CB0',   // For secondary text
    border: '#E3ECF5',     // Border color
  };

  // Parse query params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const specialtyParam = params.get('specialty') || '';
    const cityParam = params.get('city') || '';
    setSpecialty(specialtyParam);
    setCity(cityParam);
  }, [location.search]);

  // Fetch all doctors
  useEffect(() => {
    setLoading(true);
    api.get('/doctors')
      .then(res => {
        setDoctors(res.data);
        // Extract unique specialties and cities for filters
        setAllSpecialties(Array.from(new Set(res.data.map(d => d.doctorProfile?.specialization).filter(Boolean))));
        setAllCities(Array.from(new Set(res.data.map(d => d.doctorProfile?.address).filter(Boolean))));
      })
      .catch(err => {
        setDoctors([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtered doctors
  const filteredDoctors = doctors.filter(doctor => {
    const spec = (doctor.doctorProfile?.specialization || '').toLowerCase();
    const addr = (doctor.doctorProfile?.address || '').toLowerCase();
    const matchSpec = specialty ? spec.includes(specialty.toLowerCase()) : true;
    const matchCity = city ? addr.includes(city.toLowerCase()) : true;
    return matchSpec && matchCity;
  });

  // Handle filter changes (updates URL)
  const handleFilter = () => {
    const params = [];
    if (specialty) params.push(`specialty=${encodeURIComponent(specialty)}`);
    if (city) params.push(`city=${encodeURIComponent(city)}`);
    navigate(`/all-doctors${params.length ? '?' + params.join('&') : ''}`);
  };

  // Reset filters
  const resetFilters = () => {
    setSpecialty('');
    setCity('');
    navigate('/all-doctors');
  };

  return (
    <div style={{ 
      background: colors.grey,
      minHeight: 'calc(100vh - 64px - 300px)',
      paddingBottom: '30px'
    }}>
      <div style={{ 
        background: colors.primary, 
        padding: '40px 0 140px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          top: '-200px',
          right: '10%',
        }}/>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          bottom: '-150px',
          left: '5%',
        }}/>
        
        {/* Page header */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
          <Title level={1} style={{ 
            color: colors.textOnPrimary, 
            margin: 0,
            fontSize: '36px',
            fontWeight: 600
          }}>
            Trouver un médecin
          </Title>
          <Text style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '16px',
            display: 'block',
            marginTop: '8px'
          }}>
            Consultez nos médecins qualifiés et prenez rendez-vous en ligne
          </Text>
        </div>
      </div>
      
      {/* Main content area */}
      <div style={{ maxWidth: 1200, margin: '-80px auto 0', padding: '0 24px', position: 'relative' }}>
        {/* Filter card */}
        <Card 
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            marginBottom: '32px',
            border: 'none'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <Title level={4} style={{ 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px'
            }}>
              <FilterOutlined style={{ color: colors.primary }} />
              Filtrer les résultats
            </Title>
            
            <div>
              <Text type="secondary" style={{ fontSize: '14px', marginRight: '8px' }}>
                {filteredDoctors.length} {filteredDoctors.length > 1 ? 'médecins trouvés' : 'médecin trouvé'}
              </Text>
              
              {(specialty || city) && (
                <Button 
                  type="link" 
                  onClick={resetFilters}
                  style={{ fontSize: '14px', padding: '0 8px' }}
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
          
          {/* Filters */}
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={10} md={10}>
              <Select
                showSearch
                allowClear
                style={{ width: '100%' }}
                placeholder="Spécialité médicale"
                value={specialty || undefined}
                onChange={val => setSpecialty(val || '')}
                suffixIcon={<MedicineBoxOutlined style={{ color: colors.primary }} />}
                dropdownStyle={{ borderRadius: '8px' }}
              >
                {allSpecialties.map(spec => (
                  <Option key={spec} value={spec}>{spec}</Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} sm={10} md={10}>
              <Select
                showSearch
                allowClear
                style={{ width: '100%' }}
                placeholder="Localisation"
                value={city || undefined}
                onChange={val => setCity(val || '')}
                suffixIcon={<EnvironmentOutlined style={{ color: colors.primary }} />}
                dropdownStyle={{ borderRadius: '8px' }}
              >
                {allCities.map(addr => (
                  <Option key={addr} value={addr}>{addr}</Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} sm={4} md={4}>
              <Button 
                type="primary" 
                block 
                onClick={handleFilter}
                icon={<SearchOutlined />}
                style={{
                  height: '40px',
                  background: colors.primary,
                  borderColor: colors.primary,
                  boxShadow: '0 2px 6px rgba(43, 125, 224, 0.25)',
                  borderRadius: '6px'
                }}
              >
                Rechercher
              </Button>
            </Col>
          </Row>
          
          {/* Applied filters */}
          {(specialty || city) && (
            <div style={{ marginTop: '16px' }}>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Filtres appliqués:
                </Text>
                
                {specialty && (
                  <Tag 
                    color={colors.primary} 
                    style={{ borderRadius: '4px' }}
                    closable
                    onClose={() => {
                      setSpecialty('');
                      handleFilter();
                    }}
                  >
                    <MedicineBoxOutlined /> {specialty}
                  </Tag>
                )}
                
                {city && (
                  <Tag 
                    color={colors.primary2} 
                    style={{ borderRadius: '4px' }}
                    closable
                    onClose={() => {
                      setCity('');
                      handleFilter();
                    }}
                  >
                    <EnvironmentOutlined /> {city}
                  </Tag>
                )}
              </div>
            </div>
          )}
        </Card>
        
        {/* Results Section */}
        <div>
          {loading ? (
            <Card 
              style={{ 
                textAlign: 'center', 
                padding: '40px 0', 
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Spin size="large" />
              <div style={{ marginTop: '16px', color: colors.darkGrey }}>
                Chargement des médecins...
              </div>
            </Card>
          ) : filteredDoctors.length === 0 ? (
            <Card 
              style={{ 
                borderRadius: '12px', 
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: colors.darkGrey }}>
                    Aucun médecin ne correspond à vos critères de recherche
                  </span>
                }
              >
                <Button type="primary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[24, 24]}>
              {filteredDoctors.map(doctor => (
                <Col xs={24} sm={12} md={8} key={doctor.id}>
                  <DoctorCard doctor={doctor} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
}
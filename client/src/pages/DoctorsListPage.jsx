import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Spin, Input, Select, Button } from 'antd';
import api from '../api/axios';
import DoctorCard from '../components/DoctorCard';
const { Title } = Typography;
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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Title level={2} style={{ marginBottom: 16 }}>Nos médecins</Title>
      {/* Filters */}
      <Row gutter={16} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Select
            showSearch
            allowClear
            style={{ width: '100%' }}
            placeholder="Spécialité"
            value={specialty || undefined}
            onChange={val => setSpecialty(val || '')}
          >
            {allSpecialties.map(spec => (
              <Option key={spec} value={spec}>{spec}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <Select
            showSearch
            allowClear
            style={{ width: '100%' }}
            placeholder="Ville/Adresse"
            value={city || undefined}
            onChange={val => setCity(val || '')}
          >
            {allCities.map(addr => (
              <Option key={addr} value={addr}>{addr}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <Button type="primary" block onClick={handleFilter}>
            Filtrer
          </Button>
        </Col>
      </Row>
      {/* Doctors List */}
      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredDoctors.length === 0 ? (
            <Col span={24} style={{ textAlign: 'center', color: '#aaa', fontSize: 18 }}>
              Aucun médecin trouvé avec ces critères.
            </Col>
          ) : (
            filteredDoctors.map(doctor => (
              <Col xs={24} sm={12} md={8} key={doctor.id}>
                <DoctorCard doctor={doctor} />
              </Col>
            ))
          )}
        </Row>
      )}
    </div>
  );
}
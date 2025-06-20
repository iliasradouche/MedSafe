// src/components/DoctorStats.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Empty, Tabs, Select, Divider, Typography, Badge } from 'antd';
import { 
  UserOutlined, CalendarOutlined, FileTextOutlined, 
  RiseOutlined, BarChartOutlined, PieChartOutlined,
  TeamOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import api from '../api/axios';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

// Modern color palette for charts
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
const AREA_COLORS = ['rgba(24, 144, 255, 0.2)', 'rgba(82, 196, 26, 0.2)', 'rgba(250, 173, 20, 0.2)'];

const DoctorStats = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalConsultations: 0,
    appointmentsByDate: [],
    consultationsByDate: [],
    patientDemographics: [],
    patientGrowth: [],
    upcomingAppointments: 0,
    recentConsultations: 0
  });
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch all data needed for stats
        const [appointmentsRes, consultationsRes, patientsRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/consultations'),
          api.get('/patients')
        ]);

        // Filter data for this doctor
        const doctorAppointments = appointmentsRes.data.filter(a => 
          a.medecinId === userId
        );
        
        const doctorConsultations = consultationsRes.data.filter(c => 
          c.medecinId === userId || 
          (c.doctor && c.doctor.id === userId) ||
          (c.medecin && c.medecin.id === userId)
        );
        
        // Get unique patient IDs from both appointments and consultations
        const patientIdsSet = new Set();
        
        doctorAppointments.forEach(a => {
          if (a.patientId) patientIdsSet.add(a.patientId);
        });
        
        doctorConsultations.forEach(c => {
          if (c.patientId) patientIdsSet.add(c.patientId);
        });
        
        // Add patients created by this doctor
        const doctorPatients = patientsRes.data.filter(p => 
          p.userId === userId || patientIdsSet.has(p.id)
        );

        // Process data for charts
        const appointmentsByDate = processTimeSeriesData(doctorAppointments, timeRange);
        const consultationsByDate = processTimeSeriesData(doctorConsultations, timeRange);
        
        // Patient demographics
        const patientsByAge = processPatientDemographics(doctorPatients);
        
        // Patient growth over time
        const patientGrowth = processPatientGrowth(doctorPatients, timeRange);

        // Count upcoming appointments and recent consultations
        const now = new Date();
        const upcomingAppointments = doctorAppointments.filter(a => 
          new Date(a.dateTime) > now
        ).length;

        const last30Days = new Date(now);
        last30Days.setDate(now.getDate() - 30);
        const recentConsultations = doctorConsultations.filter(c => 
          new Date(c.dateTime) > last30Days && new Date(c.dateTime) <= now
        ).length;

        setStats({
          totalPatients: doctorPatients.length,
          totalAppointments: doctorAppointments.length,
          totalConsultations: doctorConsultations.length,
          appointmentsByDate,
          consultationsByDate,
          patientDemographics: patientsByAge,
          patientGrowth,
          upcomingAppointments,
          recentConsultations
        });
      } catch (err) {
        console.error('Error fetching doctor statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId, timeRange]);

  // Helper function to process time series data
  const processTimeSeriesData = (data, range) => {
    // Get date range
    const now = new Date();
    let startDate;
    
    if (range === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else if (range === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    // Filter data to the selected range
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.dateTime);
      return itemDate >= startDate && itemDate <= now;
    });
    
    // Group by date
    const dateFormat = range === 'year' ? 'MMM YYYY' : 'DD MMM';
    const groupedData = {};
    
    // Create all dates in the range for continuous display
    let currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = range === 'year'
        ? moment(currentDate).format(dateFormat)
        : moment(currentDate).format(dateFormat);
      
      groupedData[dateKey] = 0;
      
      if (range === 'year') {
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    // Fill in actual data
    filteredData.forEach(item => {
      const date = new Date(item.dateTime);
      const dateKey = range === 'year'
        ? moment(date).format(dateFormat)
        : moment(date).format(dateFormat);
      
      if (groupedData[dateKey] !== undefined) {
        groupedData[dateKey]++;
      }
    });
    
    // Convert to array format for charts
    return Object.keys(groupedData).map(date => ({
      date,
      count: groupedData[date]
    }));
  };
  
  // Helper function to process patient demographics
  const processPatientDemographics = (patients) => {
    // Age groups
    const ageGroups = {
      '0-18': 0,
      '19-30': 0,
      '31-45': 0,
      '46-60': 0,
      '61+': 0
    };
    
    patients.forEach(patient => {
      if (!patient.dateOfBirth) return;
      
      const birthDate = new Date(patient.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 30) ageGroups['19-30']++;
      else if (age <= 45) ageGroups['31-45']++;
      else if (age <= 60) ageGroups['46-60']++;
      else ageGroups['61+']++;
    });
    
    return Object.keys(ageGroups).map(group => ({
      name: group,
      value: ageGroups[group]
    }));
  };

  // Process patient growth over time
  const processPatientGrowth = (patients, range) => {
    const now = new Date();
    let startDate;
    
    if (range === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else if (range === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    // Group patients by creation date
    const dateFormat = range === 'year' ? 'MMM YYYY' : 'DD MMM';
    const groupedData = {};
    
    // Create all dates in the range for continuous display
    let currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = range === 'year'
        ? moment(currentDate).format(dateFormat)
        : moment(currentDate).format(dateFormat);
      
      groupedData[dateKey] = 0;
      
      if (range === 'year') {
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    // Count patients created in each period
    patients.forEach(patient => {
      if (!patient.createdAt) return;
      
      const createdAt = new Date(patient.createdAt);
      if (createdAt >= startDate && createdAt <= now) {
        const dateKey = range === 'year'
          ? moment(createdAt).format(dateFormat)
          : moment(createdAt).format(dateFormat);
        
        if (groupedData[dateKey] !== undefined) {
          groupedData[dateKey]++;
        }
      }
    });
    
    // Convert to array and calculate cumulative sum
    let cumulativeSum = 0;
    return Object.keys(groupedData).map(date => {
      cumulativeSum += groupedData[date];
      return {
        date,
        newPatients: groupedData[date],
        totalPatients: cumulativeSum
      };
    });
  };

  // Custom pie chart label
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ fontWeight: 'bold', fontSize: '12px' }}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    ) : null;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card bordered={false} style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color, margin: '5px 0 0' }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </Card>
      );
    }
  
    return null;
  };

  if (loading) {
    return (
      <Card style={{ marginBottom: '24px', borderRadius: '12px', textAlign: 'center', padding: '60px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Spin size="large" />
        <div style={{ marginTop: 20 }}>
          <Text type="secondary">Chargement des statistiques...</Text>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card 
        style={{ 
          marginBottom: '24px', 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <Title level={4} style={{ marginBottom: 24 }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          Tableau de bord
        </Title>
        
        {/* Summary Stats - Top Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="stat-card" 
              style={{ 
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                color: 'white',
                borderRadius: '8px'
              }}
            >
              <Statistic 
                title={<span style={{ color: 'white' }}>Patients totaux</span>} 
                value={stats.totalPatients}
                valueStyle={{ color: 'white', fontWeight: 'bold' }}
                prefix={<TeamOutlined />} 
              />
              <div style={{ marginTop: 8 }}>
                <Badge status="processing" text={<span style={{ color: 'white' }}>Base de patients</span>} />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="stat-card" 
              style={{ 
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                color: 'white',
                borderRadius: '8px'
              }}
            >
              <Statistic 
                title={<span style={{ color: 'white' }}>Rendez-vous à venir</span>} 
                value={stats.upcomingAppointments} 
                valueStyle={{ color: 'white', fontWeight: 'bold' }}
                prefix={<CalendarOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Badge status="processing" text={<span style={{ color: 'white' }}>En attente</span>} />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="stat-card" 
              style={{ 
                background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                color: 'white',
                borderRadius: '8px'
              }}
            >
              <Statistic 
                title={<span style={{ color: 'white' }}>Consultations récentes</span>} 
                value={stats.recentConsultations} 
                valueStyle={{ color: 'white', fontWeight: 'bold' }}
                prefix={<FileTextOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Badge status="processing" text={<span style={{ color: 'white' }}>30 derniers jours</span>} />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className="stat-card" 
              style={{ 
                background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                color: 'white',
                borderRadius: '8px'
              }}
            >
              <Statistic 
                title={<span style={{ color: 'white' }}>Total des consultations</span>} 
                value={stats.totalConsultations} 
                valueStyle={{ color: 'white', fontWeight: 'bold' }}
                prefix={<ClockCircleOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Badge status="processing" text={<span style={{ color: 'white' }}>Historique</span>} />
              </div>
            </Card>
          </Col>
        </Row>
        
        <Divider style={{ margin: '12px 0 24px' }} />
        
        {/* Chart Section */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0 }}>
            <RiseOutlined style={{ marginRight: 8 }} />
            Analyse d'activité
          </Title>
          <Select 
            defaultValue={timeRange} 
            style={{ width: 120 }} 
            onChange={value => setTimeRange(value)}
            bordered={true}
          >
            <Option value="week">7 jours</Option>
            <Option value="month">30 jours</Option>
            <Option value="year">12 mois</Option>
          </Select>
        </div>
        
        <Tabs 
          defaultActiveKey="1" 
          type="card"
          style={{ marginBottom: 16 }}
        >
          <TabPane 
            tab={
              <span>
                <CalendarOutlined />
                Rendez-vous
              </span>
            } 
            key="1"
          >
            <div style={{ height: 300, marginTop: 20, paddingRight: 20 }}>
              {stats.appointmentsByDate?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.appointmentsByDate}
                    margin={{
                      top: 10,
                      right: 0,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name="Rendez-vous" 
                      stroke="#1890ff" 
                      fillOpacity={1}
                      fill="url(#colorAppointments)"
                      activeDot={{ r: 8, strokeWidth: 0 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description={
                    <span style={{ color: '#8c8c8c' }}>
                      Aucune donnée de rendez-vous pour cette période
                    </span>
                  } 
                />
              )}
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Consultations
              </span>
            } 
            key="2"
          >
            <div style={{ height: 300, marginTop: 20, paddingRight: 20 }}>
              {stats.consultationsByDate?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.consultationsByDate}
                    margin={{
                      top: 10,
                      right: 0,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorConsultations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name="Consultations" 
                      stroke="#52c41a"
                      fillOpacity={1}
                      fill="url(#colorConsultations)"
                      activeDot={{ r: 8, strokeWidth: 0 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description={
                    <span style={{ color: '#8c8c8c' }}>
                      Aucune donnée de consultation pour cette période
                    </span>
                  } 
                />
              )}
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                Évolution des patients
              </span>
            } 
            key="3"
          >
            <div style={{ height: 300, marginTop: 20, paddingRight: 20 }}>
              {stats.patientGrowth?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.patientGrowth}
                    margin={{
                      top: 10,
                      right: 0,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="newPatients" 
                      name="Nouveaux patients" 
                      fill="#faad14" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description={
                    <span style={{ color: '#8c8c8c' }}>
                      Aucune donnée sur les nouveaux patients pour cette période
                    </span>
                  } 
                />
              )}
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <PieChartOutlined />
                Patients par âge
              </span>
            } 
            key="4"
          >
            <div style={{ height: 300, marginTop: 20 }}>
              {stats.patientDemographics?.some(group => group.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.patientDemographics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {stats.patientDemographics.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} patients`, 'Nombre']} />
                    <Legend 
                      iconType="circle"
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description={
                    <span style={{ color: '#8c8c8c' }}>
                      Aucune donnée démographique disponible
                    </span>
                  } 
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DoctorStats;
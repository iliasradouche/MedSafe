import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Row, Col, Card, Space, Result, message, Spin, Alert, Tag } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../api/axios';
import '../css/BookingStyles.css';

const { Title, Text } = Typography;

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const getMonthDates = (year, month) => {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }
  return days;
};
const slotKey = (date, time) => `${date}|${time}`;

const AppointmentCalendar = ({ doctorId }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availabilities, setAvailabilities] = useState([]);
  const [slotsMap, setSlotsMap] = useState({});
  const [bookedMap, setBookedMap] = useState({});
  const [patient, setPatient] = useState(null);

  // Récupérer les informations du patient (veiller à obtenir le vrai objet Patient, pas seulement l'utilisateur)
  useEffect(() => {
    api.get('/patients/me')
      .then(res => setPatient(res.data))
      .catch(() => setPatient(null));
  }, []);

  // S’assurer que medecinId est toujours un nombre (on pourrait récupérer les infos du médecin ici si besoin)
  const medecinId = Number(doctorId);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/availabilities?doctorId=${medecinId}`),
      api.get(`/public/appointments?doctorId=${medecinId}`)
    ]).then(([availRes, bookedRes]) => {
      setAvailabilities(availRes.data);

      // Cartographier les créneaux pour ce mois
      const monthDates = getMonthDates(currentYear, currentMonth);
      const slotMap = {};
      monthDates.forEach(date => {
        const dayOfWeek = date.getDay();
        const found = availRes.data.find(avail => avail.dayOfWeek === dayOfWeek);
        if (!found) return;
        const startH = parseInt(found.startTime.split(':')[0], 10);
        const endH = parseInt(found.endTime.split(':')[0], 10);
        const dateStr = date.toISOString().split('T')[0];
        slotMap[dateStr] = [];
        for (let h = startH; h < endH; h++) {
          const hour12 = h % 12 === 0 ? 12 : h % 12;
          const ampm = h < 12 ? 'AM' : 'PM';
          slotMap[dateStr].push(`${hour12}:00 ${ampm}`);
        }
      });
      setSlotsMap(slotMap);

      // Cartographier les réservations pour une recherche rapide
      const bMap = {};
      bookedRes.data.forEach(appt => {
        if (
          appt.status === "CONFIRMED" && // Ne bloquer que les rendez-vous confirmés
          appt.appointmentDate &&
          appt.appointmentTime
        ) {
          const t = appt.appointmentTime.slice(0,5); // 'HH:mm'
          bMap[slotKey(appt.appointmentDate, t)] = appt.patient
            ? { name: `${appt.patient.firstName} ${appt.patient.lastName}` }
            : {};
        }
      });
      setBookedMap(bMap);

    }).catch(() => {
      message.error('Impossible de charger les disponibilités ou les rendez-vous');
    }).finally(() => setLoading(false));
  }, [medecinId, currentMonth, currentYear]);

  const monthDates = getMonthDates(currentYear, currentMonth);
  const daysArray = (() => {
    const arr = [];
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    for (let i = 0; i < firstDayIndex; i++) arr.push(null);
    return arr.concat(monthDates);
  })();

  const handlePrev = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y=>y-1);}
    else setCurrentMonth(m => m-1);
  };
  const handleNext = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y=>y+1);}
    else setCurrentMonth(m => m+1);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setShowModal(true);
  };
  const handleTimeSelect = (time) => setSelectedTime(time);

  // Action de réservation
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !patient) {
      message.error('Informations manquantes (date, heure ou patient)');
      return;
    }
    const dateStr = selectedDate.toISOString().split('T')[0];
    const hour24 = (() => {
      let [h, m] = selectedTime.split(':');
      let ampm = selectedTime.split(' ')[1];
      h = parseInt(h, 10);
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:00:00`;
    })();
    const dateTime = `${dateStr}T${hour24}`;
    try {
      // console.log('Booking payload', {
      //   medecinId,
      //   appointmentDate: dateStr,
      //   appointmentTime: hour24,
      //   dateTime,
      //   patientId: patient.id,
      //   notes: ''
      // });
      await api.post('/appointments', {
        medecinId,
        appointmentDate: dateStr,
        appointmentTime: hour24,
        dateTime,
        patientId: patient.id,
        notes: ''
      });
      setShowModal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Échec de la réservation. Veuillez réessayer.');
    }
  };

  return (
    <div className="booking-container">
      <Alert
        message="Réservez votre rendez-vous"
        description="Sélectionnez une date, choisissez un créneau disponible, puis réservez instantanément. Les créneaux réservés sont affichés comme indisponibles."
        type="info" showIcon style={{ marginBottom: 16 }}
      />

      <div className="calendar-header">
        <Button onClick={handlePrev}>Précédent</Button>
        <h2>{monthNames[currentMonth]} {currentYear}</h2>
        <Button onClick={handleNext}>Suivant</Button>
        <Button icon={<ReloadOutlined />} onClick={() => { setLoading(true); setTimeout(()=>setLoading(false), 500); }} style={{ marginLeft: 10 }} size="small" />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="calendar-grid">
          {['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'].map(d => (
            <div key={d} className="grid-header">{d}</div>
          ))}
          {daysArray.map((date, idx) => {
            if (!date) return <div key={idx} className="grid-cell empty"></div>;
            const dateStr = date.toISOString().split('T')[0];
            const hasAvail = slotsMap[dateStr]?.length > 0;
            return (
              <div
                key={idx}
                className={`grid-cell${selectedDate&&date.toDateString()===selectedDate.toDateString()?' selected-date':''}${hasAvail?' has-availability':''}`}
                style={{ cursor: hasAvail ? 'pointer' : 'default', color: hasAvail ? 'black':'#bbb' }}
                onClick={() => hasAvail && handleDateClick(date)}
              >
                {date.getDate()}
                {hasAvail && <span className="slot-indicator" style={{ backgroundColor: '#52c41a' }}></span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de sélection du créneau horaire */}
      <Modal
        title={<Title level={4}>Réserver un rendez-vous</Title>}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowModal(false)}>Annuler</Button>,
          <Button key="book" type="primary" onClick={handleBooking} disabled={!selectedTime}>Réserver</Button>
        ]}
      >
        {selectedDate && (
          <>
            <Text>Sélectionnez une heure pour le <b>{selectedDate.toLocaleDateString()}</b> :</Text>
            <div style={{ marginTop: 16 }}>
              <Row gutter={[8,8]}>
                {(slotsMap[selectedDate.toISOString().split('T')[0]] || []).map((time) => {
                  const dateStr = selectedDate.toISOString().split('T')[0];
                  const hour24 = (() => {
                    let [h, m] = time.split(':');
                    let ampm = time.split(' ')[1];
                    h = parseInt(h, 10);
                    if (ampm === 'PM' && h !== 12) h += 12;
                    if (ampm === 'AM' && h === 12) h = 0;
                    return `${h.toString().padStart(2, '0')}:00`;
                  })();
                  const isBooked = !!bookedMap[slotKey(dateStr, hour24)];
                  const patientName = bookedMap[slotKey(dateStr, hour24)]?.name;
                  return (
                    <Col span={8} key={time}>
                      <Card
                        hoverable={!isBooked}
                        size="small"
                        onClick={() => !isBooked && handleTimeSelect(time)}
                        style={{
                          textAlign:'center',
                          borderColor: selectedTime===time?'#1890ff':isBooked?'#f5222d':'#e5e7eb',
                          background: isBooked?'#fff1f0':selectedTime===time?'#e6f7ff':undefined,
                          cursor: isBooked?'not-allowed':'pointer'
                        }}
                      >
                        <Space>
                          <ClockCircleOutlined />
                          <span>{time}</span>
                        </Space>
                        {isBooked && (
                          <div style={{ marginTop: 6 }}>
                            <Tag color="red">Réservé</Tag>
                          </div>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
            {selectedTime && (
              <Result status="info" icon={<CheckCircleOutlined />} title={`Sélectionné : ${selectedTime}`} />
            )}
          </>
        )}
      </Modal>

      {/* Succès de la réservation */}
      <Modal open={showSuccess} footer={null} closable={false} centered width={400}>
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="Rendez-vous réservé !"
          subTitle="Vous recevrez bientôt un e-mail de confirmation."
          extra={[
            <Button type="primary" key="ok" onClick={() => setShowSuccess(false)}>OK</Button>
          ]}
        />
      </Modal>
    </div>
  );
};

export default AppointmentCalendar;
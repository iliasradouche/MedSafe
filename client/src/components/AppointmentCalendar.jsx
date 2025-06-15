import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, Row, Col, Card, Space, Result, message, Spin, Alert, Tag } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../api/axios';
import '../css/BookingStyles.css';

const { Title, Text } = Typography;

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
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

  // Fetch patient info (ensure you get the real Patient object, not just user)
  useEffect(() => {
    api.get('/patients/me')
      .then(res => setPatient(res.data))
      .catch(() => setPatient(null));
  }, []);

  // Confirm medecinId is always a number (could fetch doctor info here if needed)
  const medecinId = Number(doctorId);


  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/availabilities?doctorId=${medecinId}`),
      api.get(`/public/appointments?doctorId=${medecinId}`)
    ]).then(([availRes, bookedRes]) => {
      setAvailabilities(availRes.data);

      // Map out slots for this month
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

      // Map out bookings for fast lookup
      const bMap = {};
bookedRes.data.forEach(appt => {
  if (
    appt.status === "CONFIRMED" && // Only block confirmed appointments
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
      message.error('Could not load availabilities or appointments');
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

  // Booking action
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !patient) {
      message.error('Missing information (date, time, or patient)');
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
      console.log('Booking payload', {
        medecinId,
        appointmentDate: dateStr,
        appointmentTime: hour24,
        dateTime,
        patientId: patient.id,
        notes: ''
      });
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
      message.error(err?.response?.data?.message || 'Failed to book. Try again.');
    }
  };

  return (
    <div className="booking-container">
      <Alert
        message="Book Your Appointment"
        description="Select a date, pick an available time slot, and book instantly. Booked slots are shown as unavailable."
        type="info" showIcon style={{ marginBottom: 16 }}
      />

      <div className="calendar-header">
        <Button onClick={handlePrev}>Prev</Button>
        <h2>{monthNames[currentMonth]} {currentYear}</h2>
        <Button onClick={handleNext}>Next</Button>
        <Button icon={<ReloadOutlined />} onClick={() => { setLoading(true); setTimeout(()=>setLoading(false), 500); }} style={{ marginLeft: 10 }} size="small" />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="calendar-grid">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
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

      {/* Time slot selection modal */}
      <Modal
        title={<Title level={4}>Book Appointment</Title>}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowModal(false)}>Cancel</Button>,
          <Button key="book" type="primary" onClick={handleBooking} disabled={!selectedTime}>Book Now</Button>
        ]}
      >
        {selectedDate && (
          <>
            <Text>Select a time for <b>{selectedDate.toDateString()}</b>:</Text>
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
                            <Tag color="red">Booked</Tag>
                          </div>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
            {selectedTime && (
              <Result status="info" icon={<CheckCircleOutlined />} title={`Selected: ${selectedTime}`} />
            )}
          </>
        )}
      </Modal>

      {/* Booking success */}
      <Modal open={showSuccess} footer={null} closable={false} centered width={400}>
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="Appointment Booked!"
          subTitle="You will receive a confirmation email soon."
          extra={[
            <Button type="primary" key="ok" onClick={() => setShowSuccess(false)}>OK</Button>
          ]}
        />
      </Modal>
    </div>
  );
};

export default AppointmentCalendar;
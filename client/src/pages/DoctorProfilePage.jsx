import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import api from './../api/axios';
import AppointmentCalendar from './../components/AppointmentCalendar';
import './../css/DoctorProfilePage.css';

export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [availabilities, setAvailabilities] = useState({});
  const toast = useRef(null);

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then(res => setDoctor(res.data))
      .catch(() =>
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not load doctor', life: 3000 })
      );
  }, [id]);

  const loadAvailabilities = () => {
    api.get(`/availabilities?doctorId=${id}`)
      .then(res => setAvailabilities(res.data))
      .catch(() =>
        toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Could not load availability', life: 3000 })
      );
  };
  useEffect(loadAvailabilities, [id]);

  const handleBook = async (doctorIdParam, date, timeStr) => {
    try {
      let [hourStr, rest] = timeStr.split(':');
      let [minStr, period] = rest.split(' ');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      const dt = new Date(date);
      dt.setHours(hour, minute, 0, 0);
      await api.post('/appointments', { medecinId: id, dateTime: dt.toISOString() });
      toast.current.show({ severity: 'success', summary: 'Booked', detail: 'Appointment created', life: 3000 });
      loadAvailabilities();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Booking failed', life: 3000 });
    }
  };

  if (!doctor) return <p>Loading doctor...</p>;

  const daysAbbrev = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const availableDaysSet = new Set(
    Object.keys(availabilities).map(dateStr => new Date(dateStr).getDay())
  );

  return (
    <div className="profile-container">
      <Toast ref={toast} />

      <div className="profile-header">
        <h1>Book Your Appointment</h1>
        <p>Select a date and available time slot to schedule your consultation</p>
      </div>

      <div className="profile-content">
        <aside className="profile-sidebar">
          <div className="avatar-container">
            <i className="fas fa-user-md avatar-icon" />
          </div>
          <h3 className="doctor-name">{doctor.name}</h3>
          <p className="doctor-specialization">{doctor.DoctorProfile?.specialization || 'Specialist'}</p>
          {doctor.DoctorProfile?.rating && (
            <div className="rating">
              <i className="fas fa-star" />
              <span>{doctor.DoctorProfile.rating} ({doctor.DoctorProfile.reviewCount || 0} reviews)</span>
            </div>
          )}

          <div className="section-divider" />
          <div className="available-days-section">
            <h4>Available Days</h4>
            <div className="available-days-list">
              {daysAbbrev.map((day, idx) => (
                <span
                  key={day}
                  className={`day-badge ${availableDaysSet.has(idx) ? 'available-day' : 'unavailable-day'}`}>
                  {day}
                </span>
              ))}
            </div>
          </div>

          <div className="section-divider" />
          <div className="clinic-section">
            <h4>Clinic Location</h4>
            <p className="clinic-location">
              <i className="fas fa-map-marker-alt location-icon" />
              {doctor.DoctorProfile?.address || 'Location N/A'}
            </p>
          </div>
        </aside>

        <main className="profile-calendar">
          <AppointmentCalendar
            availabilities={availabilities}
            doctorId={id}
            onBook={handleBook}
          />
        </main>
      </div>
    </div>
  );
}

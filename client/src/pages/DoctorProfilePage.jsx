import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import api from './../api/axios';
import AppointmentCalendar from './../components/AppointmentCalendar';
import './../css/DoctorProfilePage.css';
import Loading from '../components/Loading';

export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const toast = useRef(null);
  const [loading, setLoading] = useState(true);

  // Fetch doctor information
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data);
      } catch (error) {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Could not load doctor information', 
          life: 3000 
        });
      }
    };
    
    fetchDoctor();
  }, [id]);

  // Load availabilities and booked slots
  const loadAvailabilities = async () => {
    setLoading(true);
    try {
      // Get doctor's availability schedule
      const availRes = await api.get(`/availabilities?doctorId=${id}`);
      setAvailabilities(availRes.data);
      
      // Get booked appointments for this doctor
      const apptsRes = await api.get(`/appointments?medecinId=${id}`);
      
      // Filter to only include confirmed/accepted appointments
      const confirmedAppointments = apptsRes.data.filter(
        appt => appt.status === 'CONFIRMED'
      );
      
      setBookedSlots(confirmedAppointments);
    } catch (error) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Warning', 
        detail: 'Could not load availability or appointments', 
        life: 3000 
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAvailabilities();
  }, [id]);

  const handleBook = async (doctorIdParam, date, timeStr) => {
    try {
      // Parse the time string into hours and minutes
      let [hourStr, rest] = timeStr.split(':');
      let [minStr, period] = rest.split(' ');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);
      
      // Convert to 24-hour format
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      // Create date object with the correct time
      const dt = new Date(date);
      dt.setHours(hour, minute, 0, 0);
      
      // Book the appointment
      await api.post('/appointments', { 
        medecinId: id, 
        dateTime: dt.toISOString() 
      });
      
      toast.current.show({ 
        severity: 'success', 
        summary: 'Booked', 
        detail: 'Appointment request created. Waiting for doctor confirmation.', 
        life: 3000 
      });
      
      // Refresh the availabilities and booked slots
      loadAvailabilities();
    } catch (error) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Booking failed. Please try again.', 
        life: 3000 
      });
    }
  };

  // Check if a slot is already booked
  const isSlotBooked = (date, timeStr) => {
    // Parse the time string
    let [hourStr, rest] = timeStr.split(':');
    let [minStr, period] = rest.split(' ');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);
    
    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    // Create a date object for the slot
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);
    
    // Check if this slot matches any booked appointment
    return bookedSlots.some(appt => {
      const apptTime = new Date(appt.dateTime);
      return apptTime.getTime() === slotTime.getTime();
    });
  };

  if (!doctor || loading) return <Loading />;

  // Process availabilities to determine available days
  const availableDays = {};
  availabilities.forEach(avail => {
    // Day of week (0 = Sunday, 1 = Monday, etc.)
    availableDays[avail.dayOfWeek] = {
      available: true,
      startTime: avail.startTime,
      endTime: avail.endTime
    };
  });

  const daysAbbrev = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
                  className={`day-badge ${availableDays[idx] ? 'available-day' : 'unavailable-day'}`}
                  title={availableDays[idx] ? 
                    `Available ${availableDays[idx].startTime} - ${availableDays[idx].endTime}` : 
                    'Not Available'}
                >
                  {day}
                </span>
              ))}
            </div>
            
            <div className="availability-legend">
              <div className="legend-item">
                <span className="legend-dot available-dot"></span>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot booked-dot"></span>
                <span>Booked</span>
              </div>
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
          
          <div className="section-divider" />
          <div className="booking-instructions">
            <h4>Booking Instructions</h4>
            <ul>
              <li>Green slots are available for booking</li>
              <li>Grey slots are already booked</li>
              <li>Your booking requires doctor confirmation</li>
              <li>You'll receive a notification when confirmed</li>
            </ul>
          </div>
        </aside>

        <main className="profile-calendar">
          <AppointmentCalendar
            availabilities={availabilities}
            bookedSlots={bookedSlots}
            doctorId={id}
            onBook={handleBook}
            isSlotBooked={isSlotBooked}
          />
        </main>
      </div>
    </div>
  );
}
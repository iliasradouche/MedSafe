import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import api from '../api/axios';
import AppointmentCalendar from '../components/AppointmentCalendar';
import useAuth from '../auth/useAuth';
import { fetchPublicAppointments } from '../api/appointments';

export default function DoctorProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [events, setEvents] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [patientRecord, setPatientRecord] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  // 1) fetch doctor details
  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then(res => setDoctor(res.data))
      .catch(() =>
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not load doctor', life: 3000 })
      );
  }, [id]);

  // 2) fetch patient record (so we know patient.id)
  useEffect(() => {
    if (user?.role === 'PATIENT') {
      api.get('/patients/me')
        .then(res => setPatientRecord(res.data))
        .catch(() => {});
    }
  }, [user]);

  // 3) load appointments & availability
  const loadData = () => {
    fetchPublicAppointments(id)
      .then(data => setEvents(data))
      .catch(() => {
        toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Could not load appointments', life: 3000 });
      });
    api.get(`/availabilities?doctorId=${id}`)
      .then(res => setAvailabilities(res.data))
      .catch(() =>
        toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Could not load availability', life: 3000 })
      );
  };
  useEffect(loadData, [id]);

  const onDateSelect = date => {
    if (user?.role !== 'PATIENT') {
      toast.current?.show({
        severity: 'warn',
        summary: 'Please log in or sign up',
        detail: 'You must be a registered patient to book an appointment.',
        life: 3000
      });
      return;
    }
    setBookingDate(date);
    setDialogVisible(true);
  };

  const confirmBooking = async () => {
    try {
      await api.post('/appointments', { medecinId: id, dateTime: bookingDate });
      toast.current.show({ severity: 'success', summary: 'Booked', detail: 'Appointment created', life: 3000 });
      setDialogVisible(false);
      loadData();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Booking failed', life: 3000 });
    }
  };

  if (!doctor) return <p>Loading doctor...</p>;

  return (
    <div className="p-m-4">
      <Toast ref={toast} />

      {/* Doctor Info */}
      <Card className="p-mb-4" title={doctor.name} subTitle={doctor.DoctorProfile?.specialization || 'Specialization N/A'}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <p><strong>About:</strong> {doctor.DoctorProfile?.bio || 'No bio available.'}</p>
            {doctor.DoctorProfile?.phone && <p><strong>Contact:</strong> {doctor.DoctorProfile.phone}</p>}
            {doctor.DoctorProfile?.address && <p><strong>Office:</strong> {doctor.DoctorProfile.address}</p>}
          </div>
        </div>
      </Card>

      <Divider align="left"><b>Book an Appointment</b></Divider>

      {/* Calendar */}
      <Card>
        <AppointmentCalendar
          events={events}
          availabilities={availabilities}
          patientId={patientRecord?.id}
          onDateSelect={onDateSelect}
          onEventClick={evt => navigate(`/appointments/${evt.id}`)}
        />
      </Card>

      {/* Booking Confirmation Dialog */}
      <Dialog header="Confirm Booking" visible={dialogVisible} modal onHide={() => setDialogVisible(false)} style={{ width: '400px' }}>
        <p>You are about to book an appointment on:</p>
        <h4>{bookingDate?.toLocaleString()}</h4>
        <div className="p-d-flex p-jc-end">
          <Button label="Cancel" className="p-button-text p-mr-2" onClick={() => setDialogVisible(false)} />
          <Button label="Confirm" icon="pi pi-check" onClick={confirmBooking} />
        </div>
      </Dialog>
    </div>
  );
}

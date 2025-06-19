import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import api from './../api/axios';
import AppointmentCalendar from './../components/AppointmentCalendar';
import './../css/DoctorProfilePage.css';
import Loading from '../components/Loading';
import placeholder from '../assets/images/doctor.png';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const toast = useRef(null);
  const [loading, setLoading] = useState(true);

  // Récupérer les informations du médecin
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        setDoctor(res.data);
        console.log(res.data);
      } catch (error) {
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: 'Impossible de charger les informations du médecin', 
          life: 3000 
        });
      }
    };
    
    fetchDoctor();
  }, [id]);

  // Charger les disponibilités et les créneaux réservés
  const loadAvailabilities = async () => {
    setLoading(true);
    try {
      // Récupérer le planning de disponibilité du médecin
      const availRes = await api.get(`/availabilities?doctorId=${id}`);
      setAvailabilities(availRes.data);
      
      // Récupérer les rendez-vous réservés pour ce médecin
      const apptsRes = await api.get(`/appointments?medecinId=${id}`);
      
      // Filtrer pour ne garder que les rendez-vous confirmés/acceptés
      const confirmedAppointments = apptsRes.data.filter(
        appt => appt.status === 'CONFIRMED'
      );
      
      setBookedSlots(confirmedAppointments);
    } catch (error) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Attention', 
        detail: 'Impossible de charger les disponibilités ou les rendez-vous', 
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
      // Analyser la chaîne d'heure en heures et minutes
      let [hourStr, rest] = timeStr.split(':');
      let [minStr, period] = rest.split(' ');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);
      
      // Convertir au format 24h
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      // Créer l'objet date avec la bonne heure
      const dt = new Date(date);
      dt.setHours(hour, minute, 0, 0);
      
      // Réserver le rendez-vous
      await api.post('/appointments', { 
        medecinId: id, 
        dateTime: dt.toISOString() 
      });
      
      toast.current.show({ 
        severity: 'success', 
        summary: 'Réservé', 
        detail: 'Demande de rendez-vous créée. En attente de confirmation du médecin.', 
        life: 3000 
      });
      
      // Rafraîchir les disponibilités et les créneaux réservés
      loadAvailabilities();
    } catch (error) {
      toast.current.show({ 
        severity: 'error', 
        summary: 'Erreur', 
        detail: 'La réservation a échoué. Veuillez réessayer.', 
        life: 3000 
      });
    }
  };

  // Vérifier si un créneau est déjà réservé
  const isSlotBooked = (date, timeStr) => {
    // Analyser la chaîne d'heure
    let [hourStr, rest] = timeStr.split(':');
    let [minStr, period] = rest.split(' ');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);
    
    // Convertir au format 24h
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    // Créer un objet date pour le créneau
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);
    
    // Vérifier si ce créneau correspond à un rendez-vous réservé
    return bookedSlots.some(appt => {
      const apptTime = new Date(appt.dateTime);
      return apptTime.getTime() === slotTime.getTime();
    });
  };

  if (!doctor || loading) return <Loading />;

  // Utilitaire pour obtenir les infos du profil médecin
  const profile = doctor.doctorProfile || doctor.DoctorProfile || {};

  // Traiter les disponibilités pour déterminer les jours disponibles
  const availableDays = {};
  availabilities.forEach(avail => {
    // Jour de la semaine (0 = dimanche, 1 = lundi, etc.)
    availableDays[avail.dayOfWeek] = {
      available: true,
      startTime: avail.startTime,
      endTime: avail.endTime
    };
  });

  const daysAbbrev = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const photoUrl = profile.photo || placeholder;
  return (
    <div className="profile-container">
      <Toast ref={toast} />

      <div className="profile-header">
        <h1>Réservez votre rendez-vous</h1>
        <p>Sélectionnez une date et un créneau disponible pour programmer votre consultation</p>
      </div>

      <div className="profile-content">
        <aside className="profile-sidebar">
          <div className="avatar-container">
            <Avatar
          size={96}
          src={photoUrl}
          icon={<UserOutlined />}
          alt="Docteur"
          className="doctor-card-avatar"
        />
          </div>
          <h3 className="doctor-name">{"Dr. " + doctor.name}</h3>
          <p className="doctor-label"><b>Téléphone :</b> {profile.phone || 'N/A'}</p>
          <p className="doctor-label"><b>Numéro d'ordre :</b> {profile.license_number || 'N/A'}</p>
          <p className="doctor-specialization">{profile.specialization || 'Spécialiste'}</p>
          {profile.rating && (
            <div className="rating">
              <i className="fas fa-star" />
              <span>{profile.rating} ({profile.reviewCount || 0} avis)</span>
            </div>
          )}

          <div className="section-divider" />
          <div className="available-days-section">
            <h4>Jours disponibles</h4>
            <div className="available-days-list">
              {daysAbbrev.map((day, idx) => (
                <span
                  key={day}
                  className={`day-badge ${availableDays[idx] ? 'available-day' : 'unavailable-day'}`}
                  title={availableDays[idx] ? 
                    `Disponible ${availableDays[idx].startTime} - ${availableDays[idx].endTime}` : 
                    'Non disponible'}
                >
                  {day}
                </span>
              ))}
            </div>
            
            <div className="availability-legend">
              <div className="legend-item">
                <span className="legend-dot available-dot"></span>
                <span>Disponible</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot booked-dot"></span>
                <span>Réservé</span>
              </div>
            </div>
          </div>

          <div className="section-divider" />
          <div className="clinic-section">
            <h4>Lieu de consultation</h4>
            <p className="clinic-location">
              <i className="fas fa-map-marker-alt location-icon" />
              {profile.address || 'Lieu N/A'}
            </p>
          </div>
          
          <div className="section-divider" />
          <div className="booking-instructions">
            <h4>Instructions de réservation</h4>
            <ul>
              <li>Les créneaux verts sont disponibles à la réservation</li>
              <li>Les créneaux gris sont déjà réservés</li>
              <li>Votre réservation requiert la confirmation du médecin</li>
              <li>Vous recevrez une notification une fois confirmée</li>
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
// client/src/components/AppointmentCalendar.jsx
import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import useAuth from '../auth/useAuth';
import './AppointmentCalendar.css';

export default function AppointmentCalendar({
  events,
  availabilities = [],
  onDateSelect,
  onEventClick
}) {
  const { user } = useAuth();
  const calRef = useRef(null);

  // doctors see patient names; others see "Booked"
  const showNames = user?.role === 'MEDECIN';

  // build businessHours from availability slots
  const businessHours = availabilities.map(slot => ({
    daysOfWeek: [slot.dayOfWeek],
    startTime: slot.startTime,
    endTime:   slot.endTime
  }));

  // map appointments to FullCalendar events
  const fcEvents = events.map(appt => {
    const start = appt.dateTime;
    const isDoctorOwn = showNames && appt.patientId === user.id;

    const title = showNames
      ? `${appt.Patient?.firstName || ''} ${appt.Patient?.lastName || ''}`.trim()
      : 'Booked';

    return {
      id: appt.id,
      title,
      start,
      extendedProps: appt,
      color: isDoctorOwn ? '#3674B5' : '#578FCA'
    };
  });

  return (
    <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left:   'prev,next today',
        center: 'title',
        right:  'timeGridDay,timeGridWeek'
      }}
      height="auto"
      contentHeight="auto"
      aspectRatio={1.35}
      slotMinTime="08:00:00"
      slotMaxTime="18:00:00"
      slotDuration="00:30:00"
      nowIndicator
      selectable
      select={info => onDateSelect(info.start)}
      selectAllow={info => {
        return businessHours.some(bh => {
          const day = info.start.getDay();
          if (!bh.daysOfWeek.includes(day)) return false;
          const hhmm = d => d.toTimeString().substr(0,5);
          return (
            hhmm(info.start) >= bh.startTime &&
            hhmm(info.end)   <= bh.endTime
          );
        });
      }}
      businessHours={businessHours}
      events={fcEvents}
      eventClick={info => onEventClick(info.event.extendedProps)}
      ref={calRef}
    />
  );
}

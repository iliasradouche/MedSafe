// client/src/pages/Appointments.jsx
import React, { useState, useEffect, useRef } from 'react';
import useAuth from '../auth/useAuth';
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../api/appointments';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import * as Yup from 'yup';

import AppointmentCalendar from '../components/AppointmentCalendar';
import { fetchMyAvailabilities } from '../api/availabilities';
// Validation schema
const schema = Yup.object().shape({
  dateTime: Yup.date().required('Date & time is required'),
  status: Yup.string().oneOf(['PENDING', 'CONFIRMED', 'CANCELLED']).required()
});

// Status options
const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Cancelled', value: 'CANCELLED' }
];

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState({ id: null, dateTime: null, status: 'PENDING' });
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const toast = useRef(null);
const [availabilities, setAvailabilities] = useState([]);

  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetchAppointments().then(data => {
      setAppts(data);
      setEvents(data);
    });
  }, []);

  const load = async () => {
    try {
      const data = await fetchAppointments();
      setAppts(data);
      setEvents(data);

      if (user.role === 'MEDECIN') {
        const av = await fetchMyAvailabilities();
        setAvailabilities(av);
      }
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary:  'Error',
        detail:   'Load failed',
       life:     3000
      });
    }
  };

 useEffect(() => {
    load();
  }, [user]);
  
  const openNew = () => {
    setForm({ id: null, dateTime: null, status: 'PENDING' });
    setErrors({});
    setEditing(false);
    setDialogVisible(true);
  };

  const openEdit = a => {
    setForm({ id: a.id, dateTime: new Date(a.dateTime), status: a.status });
    setErrors({});
    setEditing(true);
    setDialogVisible(true);
  };

  const hideDialog = () => setDialogVisible(false);

  const handleSubmit = async () => {
    try {
      await schema.validate(form, { abortEarly: false });
      const payload = {
        dateTime: form.dateTime.toISOString(),
        status: form.status
      };
      if (editing) {
        await updateAppointment(form.id, payload);
        toast.current.show({ severity: 'success', summary: 'Updated', life: 3000 });
      } else {
        await createAppointment({ dateTime: form.dateTime.toISOString() });
        toast.current.show({ severity: 'success', summary: 'Created', life: 3000 });
      }
      hideDialog();
      load();
    } catch (err) {
      if (err.name === 'ValidationError') {
        const f = {};
        err.inner.forEach(({ path, message }) => { f[path] = message; });
        setErrors(f);
      } else {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Operation failed', life: 3000 });
      }
    }
  };

  const confirmDelete = async a => {
    if (window.confirm('Delete this appointment?')) {
      try {
        await deleteAppointment(a.id);
        toast.current.show({ severity: 'success', summary: 'Deleted', life: 3000 });
        load();
      } catch {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Delete failed', life: 3000 });
      }
    }
  };

  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Button label="New Appointment" icon="pi pi-plus" onClick={openNew} />
    </div>
  );

  return (

    <div className="p-m-4">
      <Toast ref={toast} />
      <DataTable value={appts} header={header} paginator rows={10} responsiveLayout="scroll">
        <Column field="id" header="ID" style={{ width: '4rem' }} />
        <Column
          header="Patient"
          body={row => row.Patient ? `${row.Patient.firstName} ${row.Patient.lastName}` : '—'}
        />
        <Column
          header="Medecin"
          body={row => row.medecin ? row.medecin.name : '—'}
        />
        <Column
          field="dateTime"
          header="Date & Time"
          body={row => new Date(row.dateTime).toLocaleString()}
          sortable
        />
        <Column field="status" header="Status" />
        <Column
          body={row => (
            <>
              {/* Everyone can open/edit (reschedule) if you want */}
              <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-success p-mr-2"
                onClick={() => openEdit(row)}
              />
              {/* Only show cancel/delete to non-patients */}
              {user.role !== 'PATIENT' && (
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-danger"
                  onClick={() => confirmDelete(row)}
                />
              )}
            </>
          )}
        />
      </DataTable>

      <Dialog visible={dialogVisible} style={{ width: '450px' }} header={editing ? 'Edit Appointment' : 'New Appointment'} modal onHide={hideDialog}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="dateTime">Date & Time</label>
            <Calendar
              id="dateTime"
              value={form.dateTime}
              onChange={e => setForm({ ...form, dateTime: e.value })}
              showTime
              dateFormat="yy-mm-dd"
              style={{ width: '100%' }}
            />
            {errors.dateTime && <small className="p-error">{errors.dateTime}</small>}
          </div>
          {/* Only Doctors/Admins get the dropdown */}
          {editing && user.role !== 'PATIENT' && (
            <div className="p-field">
              <label htmlFor="status">Status</label>
              <Dropdown
                id="status"
                value={form.status}
                options={statusOptions}
                onChange={e => setForm({ ...form, status: e.value })}
                placeholder="Select status"
              />
              {errors.status && <small className="p-error">{errors.status}</small>}
            </div>
          )}
          {/* read-only status only if doctor/admin has already changed it */}
          {editing && form.status !== 'PENDING' && (
            <div className="p-field">
              <label>Status</label>
              <div>{form.status.charAt(0) + form.status.slice(1).toLowerCase()}</div>
            </div>
          )}
        </div>
        <div className="p-dialog-footer">
          <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
          <Button label="Save" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </Dialog>
      <AppointmentCalendar
        events={events}
        availabilities={availabilities}
        onDateSelect={date => {
          setForm({ ...form, dateTime: date });
          setEditing(false);
          setDialogVisible(true);
        }}
        onEventClick={appt => openEdit(appt)}
      />

    </div>
  );
}

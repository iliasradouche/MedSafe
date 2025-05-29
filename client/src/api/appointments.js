// client/src/api/appointments.js
import api from './axios';

// Fetch appointments (optional filters)
export function fetchAppointments(params = {}) {
  return api
    .get('/appointments', { params })
    .then(res => res.data);
}

export function fetchPublicAppointments(doctorId) {
  return api.get(`/public/appointments?doctorId=${doctorId}`)
             .then(r => r.data)
}

// Create a new appointment
export function createAppointment(data) {
  return api
    .post('/appointments', data)
    .then(res => res.data);
}

// Update an appointment
export function updateAppointment(id, data) {
  return api
    .put(`/appointments/${id}`, data)
    .then(res => res.data);
}

// Delete an appointment
export function deleteAppointment(id) {
  return api
    .delete(`/appointments/${id}`)
    .then(res => res.data);
}


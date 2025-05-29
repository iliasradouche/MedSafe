// client/src/api/patients.js
import api from './axios';

// Fetch all patients (with optional search)
export function fetchPatients(search) {
  return api
    .get('/patients', { params: { search } })
    .then(res => res.data);
}

// Create a new patient
export function createPatient(data) {
  return api
    .post('/patients', data)
    .then(res => res.data);
}

// Update an existing patient
export function updatePatient(id, data) {
  return api
    .put(`/patients/${id}`, data)
    .then(res => res.data);
}

// Delete a patient
export function deletePatient(id) {
  return api
    .delete(`/patients/${id}`)
    .then(res => res.data);
}

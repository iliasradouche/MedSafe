import api from './axios';

// Fetch consultations (optionally filter by patientId)
export function fetchConsultations(patientId) {
  return api
    .get('/consultations', { params: { patientId } })
    .then(res => res.data);
}

// Create a new consultation
export function createConsultation(data) {
  return api
    .post('/consultations', data)
    .then(res => res.data);
}

// Update an existing consultation
export function updateConsultation(id, data) {
  return api
    .put(`/consultations/${id}`, data)
    .then(res => res.data);
}

// Delete a consultation
export function deleteConsultation(id) {
  return api
    .delete(`/consultations/${id}`)
    .then(res => res.data);
}

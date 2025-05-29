// client/src/api/ordonnances.js
import api from './axios';

// Fetch all ordonnances (patients only see theirs)
export function fetchOrdonnances() {
  return api
    .get('/ordonnances')
    .then(res => res.data);
}

// Create a new ordonnance
export function createOrdonnance(data) {
  return api
    .post('/ordonnances', data)
    .then(res => res.data);
}

// Update an existing ordonnance
export function updateOrdonnance(id, data) {
  return api
    .put(`/ordonnances/${id}`, data)
    .then(res => res.data);
}

// Delete an ordonnance
export function deleteOrdonnance(id) {
  return api
    .delete(`/ordonnances/${id}`)
    .then(res => res.data);
}

export async function downloadOrdonnancePdf(id) {
  const res = await api.get(`/ordonnances/${id}/pdf`, {
    responseType: 'blob'
  });
  return res.data; // this is a Blob
}
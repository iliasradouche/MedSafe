import api from './axios';

// Fetch the current doctor’s availability slots
export function fetchMyAvailabilities() {
  return api.get('/availabilities/me').then(res => res.data);
}

// Fetch all availability slots for a given doctor
export function fetchAvailabilities(doctorId) {
  return api.get(`/availabilities?doctorId=${doctorId}`).then(res => res.data);
}
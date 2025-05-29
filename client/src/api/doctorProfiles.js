import api from './axios';

export function fetchMyDoctorProfile() {
  return api.get('/doctor-profiles/me').then(res => res.data);
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import PrivateRoute from '../auth/PrivateRoute';
import DashboardLayout from '../layouts/DashboardLayout';

import PatientsPage from '../pages/Patients';
import ConsultationsPage from '../pages/Consultations';
import AppointmentsPage from '../pages/Appointments';
import OrdonnancesPage from '../pages/Ordonnances';
import Registration from '../pages/Registration';
import RegisterSuccess from '../pages/RegisterSuccess'; // Import the new component
import PublicLayout from '../layouts/PublicLayout';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/Profile';
import DoctorProfilePage from '../pages/DoctorProfilePage';
import MyAvailabilityPage from '../pages/MyAvailabilityPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Registration />} />
        <Route path="register-success" element={<RegisterSuccess />} /> {/* Add this new route */}
        <Route path="doctors/:id/book" element={<DoctorProfilePage />} />
      </Route>

      {/* Patients (ADMIN + MEDECIN only) */}
      <Route element={<PrivateRoute roles={['ADMIN', 'MEDECIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="patients" element={<PatientsPage />} />
          
        </Route>
      </Route>

      {/* Consultations & Appointments (all roles) */}
      <Route element={<PrivateRoute roles={['ADMIN', 'MEDECIN', 'PATIENT']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="consultations" element={<ConsultationsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
        </Route>
      </Route>

      {/* Ordonnances (ADMIN + MEDECIN only) */}
      <Route element={<PrivateRoute roles={['ADMIN', 'MEDECIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="ordonnances" element={<OrdonnancesPage />} />
          <Route path="availability" element={<MyAvailabilityPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
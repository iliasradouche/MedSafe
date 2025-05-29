// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuth from '../auth/useAuth';
import Header from '../components/Header';
import DoctorCard from '../components/DoctorCard';

export default function HomePage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1) fetch doctors
  useEffect(() => {
    api.get('/doctors')
      .then(res => setDoctors(res.data))
      .catch(err => console.error('Échec du chargement des médecins', err))
      .finally(() => setLoading(false));
  }, []);

  // 2) your color palette from homepage.html
  const colors = {
    primary:   '#3b82f6',
    secondary: '#10b981',
    accent:    '#6366f1',
    dark:      '#1e293b',
    light:     '#f8fafc'
  };

  // 3) inline styles pulled from your <style> block
  const heroGradient = {
    background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(16,185,129,0.1) 100%)',
    padding:    '5rem 1rem'
  };
  const container = {
    maxWidth: '1280px',
    margin:   '0 auto',
    padding:  '0 1rem'
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Chargement des médecins…</p>;

  return (
    <>
      {/* Section Héros */}
      <section style={heroGradient}>
        <div style={container}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
            {/* Texte gauche */}
            <div style={{ flex:'1 1 50%', marginBottom:'2rem' }}>
              <h1 style={{ fontSize:'2.5rem', fontWeight:'bold', marginBottom:'1rem', color: colors.dark }}>
                Gestion sécurisée des patients <span style={{ color: colors.primary }}>Simplifiée</span>
              </h1>
              <p style={{ fontSize:'1.125rem', color: '#4a5568', marginBottom:'2rem' }}>
                MedSafe offre aux professionnels de santé une plateforme intuitive et sécurisée : gérez dossiers, rendez-vous et e‑prescriptions en un seul endroit.
              </p>
              <div style={{ display:'flex', gap:'1rem' }}>
                <button
                  style={{
                    background: colors.primary,
                    color:      '#fff',
                    padding:    '0.75rem 1.5rem',
                    border:     'none',
                    borderRadius: '0.375rem',
                    cursor:     'pointer'
                  }}
                  onClick={() => navigate('/register')}
                >
                  Commencer l'essai gratuit
                </button>
                <button
                  style={{
                    border:       `2px solid ${colors.primary}`,
                    color:         colors.primary,
                    padding:       '0.75rem 1.5rem',
                    borderRadius:  '0.375rem',
                    background:   'transparent',
                    cursor:        'pointer'
                  }}
                  onClick={() => {/* maybe scroll to demo video */}}
                >
                  Regarder la démonstration
                </button>
              </div>
            </div>

            {/* Image/visuel droit */}
            <div style={{ flex:'1 1 40%', textAlign:'center' }}>
              <div style={{ position:'relative', display:'inline-block' }}>
                <div
                  style={{
                    position:'absolute', top:'-1.5rem', left:'-1.5rem',
                    width:'8rem', height:'8rem',
                    background: colors.secondary,
                    borderRadius:'50%', opacity: 0.2
                  }}
                />
                <div
                  style={{
                    position:'absolute', bottom:'-1.5rem', right:'-1.5rem',
                    width:'8rem', height:'8rem',
                    background: colors.accent,
                    borderRadius:'50%', opacity: 0.2
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section de la liste des médecins */}
      <section style={{ padding:'3rem 1rem', background: colors.light }}>
        <div style={container}>
          <h2 style={{ textAlign:'center', fontSize:'2rem', fontWeight:'bold', marginBottom:'2rem' }}>
            Choisissez votre médecin
          </h2>
          <div style={{
            display:          'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap:              '1rem'
          }}>
            {doctors.map(doc => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

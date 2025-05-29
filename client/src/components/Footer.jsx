import React from 'react';
import { FacebookOutlined, TwitterOutlined, LinkedinOutlined, InstagramOutlined } from '@ant-design/icons';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#1e293b', // bg-dark
        color: '#ffffff',
        padding: '3rem 0'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
          gap: '2rem'
        }}
      >
        {/* Colonne 1 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>MedSafe</span>
          </div>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            Gestion sécurisée des patients pour les prestataires de santé modernes.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#"><FacebookOutlined style={{ color: '#94a3b8', fontSize: '1.25rem'}} /></a>
            <a href="#"><TwitterOutlined  style={{ color: '#94a3b8', fontSize: '1.25rem'}} /></a>
            <a href="#"><LinkedinOutlined style={{ color: '#94a3b8', fontSize: '1.25rem'}} /></a>
            <a href="#"><InstagramOutlined style={{ color: '#94a3b8', fontSize: '1.25rem'}} /></a>
          </div>
        </div>

        {/* Colonne 2 : Produit */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>Produit</h3>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2 }}>
            <li><a href="#" style={{ color: '#94a3b8' }}>Fonctionnalités</a></li>
            <li><a href="#" style={{ color: '#94a3b8' }}>Tarifs</a></li>
          </ul>
        </div>

        {/* Colonne 3 : Ressources */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>Ressources</h3>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2 }}>
            <li><a href="#" style={{ color: '#94a3b8' }}>Assistance</a></li>
          </ul>
        </div>

        {/* Colonne 4 : Société */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>Société</h3>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2 }}>
            <li><a href="#" style={{ color: '#94a3b8' }}>À propos</a></li>
            <li><a href="#" style={{ color: '#94a3b8' }}>Carrières</a></li>
            <li><a href="#" style={{ color: '#94a3b8' }}>Confidentialité</a></li>
          </ul>
        </div>
      </div>

      {/* Barre inférieure */}
      <div
        style={{
          borderTop: '1px solid #374151',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          textAlign: 'center',
          color: '#94a3b8'
        }}
      >
        © 2025 MedSafe. Tous droits réservés. &nbsp;
        <a href="#" style={{ color: '#94a3b8', margin: '0 0.5rem' }}>Politique de confidentialité</a>
        <a href="#" style={{ color: '#94a3b8', margin: '0 0.5rem' }}>Conditions d'utilisation</a>
      </div>
    </footer>
  );
}

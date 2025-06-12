// src/pages/RegisterSuccess.jsx
import React from 'react';
import { Button, Card, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function RegisterSuccess() {
  const navigate = useNavigate();

  return (
    <Card style={{ maxWidth: 600, margin: '2rem auto' }}>
      <Result
        status="success"
        title="Inscription réussie!"
        subTitle="Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter pour accéder à votre compte."
        extra={[
          <Button 
            type="primary" 
            key="login" 
            onClick={() => navigate('/login')}
          >
            Aller à la page de connexion
          </Button>
        ]}
      />
    </Card>
  );
}
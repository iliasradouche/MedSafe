import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';

const { Meta } = Card;

export default function DoctorCard({ doctor }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    // guests and patients both hit the booking page; your PublicLayout / Calendar logic will gate login
    navigate(`/doctors/${doctor.id}/book`);
  };

  return (
    <Card
      style={{ marginBottom: 16 }}
      hoverable
      bodyStyle={{ paddingBottom: 16 }}
    >
      <Meta
        title={doctor.name}
        description={doctor.DoctorProfile?.specialization || '—'}
        specialization={doctor.DoctorProfile?.specialization || '—'}
      />
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Button type="primary" onClick={handleClick}>
          Book
        </Button>
      </div>
    </Card>
  );
}

DoctorCard.propTypes = {
  doctor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    DoctorProfile: PropTypes.shape({
      specialization: PropTypes.string
    })
  }).isRequired
};

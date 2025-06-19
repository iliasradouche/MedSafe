import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Avatar } from 'antd';
import { UserOutlined, StarFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import placeholder from '../assets/images/doctor.png';
import '../css/DoctorCard.css'; // Import the new CSS file for styling

const { Meta } = Card;

export default function DoctorCard({ doctor }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const photoUrl =
    doctor.doctorProfile?.photo ? doctor.doctorProfile.photo : placeholder;

  const handleClick = () => {
    navigate(`/doctors/${doctor.id}/book`);
  };

  const rating = doctor.doctorProfile?.rating;
  const reviewCount = doctor.doctorProfile?.reviewCount;

  return (
    <Card
      className="doctor-card"
      hoverable
      bodyStyle={{ padding: 0 }}
    >
      <div className="doctor-card-avatar-section">
        <Avatar
          size={96}
          src={photoUrl}
          icon={<UserOutlined />}
          alt="Docteur"
          className="doctor-card-avatar"
        />
      </div>
      <div className="doctor-card-info-section">
        <div className="doctor-card-name">{"Dr. " + doctor.name}</div>
        <div className="doctor-card-specialty">
          {doctor.doctorProfile?.specialization || <span className="doctor-card-specialty-placeholder">—</span>}
        </div>
        {rating && (
          <div className="doctor-card-rating">
            <StarFilled style={{ color: "#f59e0b", marginRight: 4 }} />
            <span>{rating}{reviewCount ? <span className="doctor-card-review-count"> ({reviewCount})</span> : null}</span>
          </div>
        )}
      </div>
      <div className="doctor-card-action">
        <Button type="primary" onClick={handleClick} block>
          Réserver
        </Button>
      </div>
    </Card>
  );
}

DoctorCard.propTypes = {
  doctor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    doctorProfile: PropTypes.shape({
      specialization: PropTypes.string,
      photo: PropTypes.string,
      rating: PropTypes.number,
      reviewCount: PropTypes.number
    })
  }).isRequired
};
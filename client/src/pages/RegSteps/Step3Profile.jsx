// src/pages/RegSteps/Step3Profile.jsx
import React from 'react';
import { Input, DatePicker, Form } from 'antd';
import moment from 'moment';

export default function Step3Profile({ data, setData }) {
  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  return (
    <Form layout="vertical">
      {data.role === 'MEDECIN' ? (
        <>
          <Form.Item label="License #">
            <Input
              name="licenseNumber"
              value={data.licenseNumber}
              onChange={e => handleChange('licenseNumber', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Specialization">
            <Input
              name="specialization"
              value={data.specialization}
              onChange={e => handleChange('specialization', e.target.value)}
            />
          </Form.Item>
        </>
      ) : (
        <Form.Item label="Date of Birth">
          <DatePicker
            style={{ width: '100%' }}
            value={data.dateOfBirth ? moment(data.dateOfBirth) : null}
            onChange={d => handleChange('dateOfBirth', d ? d.format('YYYY-MM-DD') : '')}
          />
        </Form.Item>
      )}

      <Form.Item label="Phone">
        <Input
          name="phone"
          value={data.phone}
          onChange={e => handleChange('phone', e.target.value)}
        />
      </Form.Item>
      <Form.Item label="Address">
        <Input
          name="address"
          value={data.address}
          onChange={e => handleChange('address', e.target.value)}
        />
      </Form.Item>

      {data.role === 'PATIENT' && (
        <Form.Item label="Emergency Contact">
          <Input
            name="emergencyContact"
            value={data.emergencyContact}
            onChange={e => handleChange('emergencyContact', e.target.value)}
          />
        </Form.Item>
      )}
    </Form>
  );
}

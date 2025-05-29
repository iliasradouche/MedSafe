// src/pages/RegSteps/Step1Role.jsx
import React from 'react';
import { Radio } from 'antd';

export default function Step1Role({ data, setData }) {
  return (
    <Radio.Group
      onChange={e => setData({ ...data, role: e.target.value })}
      value={data.role}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <Radio value="MEDECIN">Doctor</Radio>
      <Radio value="PATIENT">Patient</Radio>
    </Radio.Group>
  );
}

// src/pages/Registration.jsx
import React, { useState } from 'react';
import { Steps, Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

import Step1Role     from './RegSteps/Step1Role';
import Step2Basic    from './RegSteps/Step2Basic';
import Step3Profile  from './RegSteps/Step3Profile';

const { Step } = Steps;

export default function Registration() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [data, setData] = useState({
    role: null, name:'', email:'', password:'',
    licenseNumber:'', specialization:'', phone:'', address:'',
    dateOfBirth:'', emergencyContact:''
  });

  const steps = [
    { title: 'Role',        content: <Step1Role data={data} setData={setData}/> },
    { title: 'Account',     content: <Step2Basic data={data} setData={setData}/> },
    { title: data.role === 'MEDECIN' ? 'Doctor Info' : 'Patient Info',
      content: <Step3Profile data={data} setData={setData}/> }
  ];

  const next = () => setActive(i => Math.min(i + 1, steps.length - 1));
  const prev = () => setActive(i => Math.max(i - 1, 0));

  const submit = async () => {
    try {
      await api.post('/auth/register', data);
      if (data.role === 'PATIENT') navigate('/profile');
      else navigate('/patients');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card style={{ maxWidth: 600, margin: '2rem auto' }}>
      <Steps current={active} style={{ marginBottom: 32 }}>
        {steps.map(s => <Step key={s.title} title={s.title} />)}
      </Steps>

      <div>{steps[active].content}</div>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        {active > 0 && <Button style={{ marginRight: 8 }} onClick={prev}>Back</Button>}
        {active < steps.length - 1 ? (
          <Button type="primary" onClick={next}>Next</Button>
        ) : (
          <Button type="primary" onClick={submit}>Submit</Button>
        )}
      </div>
    </Card>
  );
}

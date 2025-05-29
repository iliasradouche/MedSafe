// src/pages/RegSteps/Step2Basic.jsx
import React, { useState } from 'react';
import { Input, Form } from 'antd';
import * as Yup from 'yup';

const schema = Yup.object().shape({
  name:     Yup.string().required('Name is required'),
  email:    Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6,'Min 6 chars').required('Password is required')
});

export default function Step2Basic({ data, setData }) {
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const validateField = async field => {
    try {
      await schema.validateAt(field, data);
      setErrors(e => { const ne = { ...e }; delete ne[field]; return ne; });
    } catch (err) {
      setErrors(e => ({ ...e, [field]: err.message }));
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item
        label="Full Name"
        validateStatus={errors.name && 'error'}
        help={errors.name}
      >
        <Input
          name="name"
          value={data.name}
          onChange={e => handleChange('name', e.target.value)}
          onBlur={() => validateField('name')}
        />
      </Form.Item>

      <Form.Item
        label="Email"
        validateStatus={errors.email && 'error'}
        help={errors.email}
      >
        <Input
          name="email"
          value={data.email}
          onChange={e => handleChange('email', e.target.value)}
          onBlur={() => validateField('email')}
        />
      </Form.Item>

      <Form.Item
        label="Password"
        validateStatus={errors.password && 'error'}
        help={errors.password}
      >
        <Input.Password
          name="password"
          value={data.password}
          onChange={e => handleChange('password', e.target.value)}
          onBlur={() => validateField('password')}
        />
      </Form.Item>
    </Form>
  );
}

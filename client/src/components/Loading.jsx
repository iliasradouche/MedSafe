// src/components/Loading.jsx
import React from 'react';
import { Spin } from 'antd';

export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        minHeight: 200,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Spin size="large" />
    </div>
  );
}

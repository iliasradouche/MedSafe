// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';       // note changed import
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import './index.css';
import './theme/overrides.css';
import 'antd/dist/reset.css';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container); // create the root
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { CustomerProvider } from './context/CustomerContext';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <CustomerProvider>
    <App />
  </CustomerProvider>
);

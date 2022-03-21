import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './App';
import { initI18next } from './locales/initI18next';

initI18next();

render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')!
);

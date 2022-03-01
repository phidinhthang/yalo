import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { initI18next } from './locales/initI18next';

initI18next();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

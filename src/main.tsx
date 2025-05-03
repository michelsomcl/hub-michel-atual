
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeLocalStorage } from './services/localStorage';

// Inicializar localStorage ao iniciar o aplicativo
initializeLocalStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

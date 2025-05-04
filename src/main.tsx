
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeLocalStorage } from './services/localStorage';
import { BrowserRouter } from 'react-router-dom';

// Inicializar dados do Supabase ao iniciar o aplicativo
(async () => {
  await initializeLocalStorage();
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

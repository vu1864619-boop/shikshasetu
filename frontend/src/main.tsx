import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';
import { AuthProvider } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { OfflineSyncProvider } from './context/OfflineSyncContext.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <OfflineSyncProvider>
          <App />
        </OfflineSyncProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);

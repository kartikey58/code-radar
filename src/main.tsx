import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

function Root() {
  const [clientId, setClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('VITE_GOOGLE_CLIENT_ID') || '');

  useEffect(() => {
    // Listen for changes from SettingsModal
    const handleStorage = () => {
      const stored = localStorage.getItem('VITE_GOOGLE_CLIENT_ID');
      const env = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      setClientId(stored || env);
    };
    
    // We can poll or just rely on a custom event
    const interval = setInterval(handleStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  // The GoogleOAuthProvider requires a non-empty clientId to prevent crashing.
  // We use a placeholder if the real one isn't available yet.
  const activeClientId = clientId || '667985348424-dummy.apps.googleusercontent.com';

  return (
    <React.StrictMode>
      <GoogleOAuthProvider clientId={activeClientId}>
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)

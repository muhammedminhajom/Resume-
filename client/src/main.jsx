import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
// Dynamically load Google AdSense only if a valid Client ID is configured
const adsenseClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
if (
  typeof adsenseClientId === 'string' &&
  adsenseClientId.startsWith('ca-pub-') &&
  !adsenseClientId.includes('XXXX') &&
  !adsenseClientId.includes('%')
) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClientId)}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
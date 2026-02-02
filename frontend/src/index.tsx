import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './components/Toast';
import './styles/globals.css'; // Fixed path

// Add Font Awesome
const fontAwesomeScript = document.createElement('script');
fontAwesomeScript.src = 'https://kit.fontawesome.com/your-kit-id.js'; // Replace with your actual Font Awesome kit ID
fontAwesomeScript.crossOrigin = 'anonymous';
document.head.appendChild(fontAwesomeScript);

// Add Inter Font
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Add Clash Display Font (optional, if you want premium font)
const clashLink = document.createElement('link');
clashLink.href = 'https://fonts.cdnfonts.com/css/clash-display';
clashLink.rel = 'stylesheet';
document.head.appendChild(clashLink);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
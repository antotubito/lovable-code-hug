import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/react-select.css';

// Initialize Supabase connection before rendering
import { initializeConnection } from './lib/supabase';

// Initialize connection and then render app
initializeConnection().then(() => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }
  
  createRoot(rootElement).render(
    <StrictMode>
      <Router>
        <App />
      </Router>
    </StrictMode>
  );
}).catch(error => {
  console.error('Failed to initialize app:', error);
  
  // Render error state
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
        <h1 style="color: #4F46E5;">Dislink</h1>
        <p style="color: #EF4444;">Failed to initialize application. Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 8px 16px; background-color: #4F46E5; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
});
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Buffer } from 'buffer'

// Polyfill Buffer and process for browser
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  if (!window.process) {
    window.process = { env: {} } as any;
  }
}

// Polyfill global
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Suppress wagmi token detection errors for non-token contracts
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const message = JSON.stringify(args);
  // Filter out token-related RPC errors
  if (message.includes('0x313ce567') || // decimals()
    message.includes('0x95d89b41') || // symbol()
    message.includes('0x01ffc9a7') || // supportsInterface()
    message.includes('execution reverted')) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const message = JSON.stringify(args);
  if (message.includes('0x313ce567') ||
    message.includes('0x95d89b41') ||
    message.includes('0x01ffc9a7') ||
    message.includes('execution reverted')) {
    return;
  }
  originalWarn.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

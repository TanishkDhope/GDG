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

const shouldSuppress = (args: any[]) => {
  try {
    const message = args.map(arg =>
      typeof arg === 'string' ? arg :
        typeof arg === 'object' ? JSON.stringify(arg, (_, v) => typeof v === 'bigint' ? v.toString() : v) :
          String(arg)
    ).join(' ');

    return (
      message.includes('0x313ce567') ||    // decimals()
      message.includes('0x95d89b41') ||    // symbol()
      message.includes('0x01ffc9a7') ||    // supportsInterface()
      message.includes('80ac58cd') ||      // ERC721 interface ID
      message.includes('execution reverted') ||
      message.includes('EthCall') ||
      message.includes('RPC request failed') ||
      message.includes('eth_call')
    );
  } catch {
    return false;
  }
};

console.error = (...args) => {
  if (shouldSuppress(args)) return;
  originalError.apply(console, args);
};

console.warn = (...args) => {
  if (shouldSuppress(args)) return;
  originalWarn.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

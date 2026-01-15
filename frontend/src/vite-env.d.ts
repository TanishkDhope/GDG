/// <reference types="vite/client" />

import { Buffer } from 'buffer';

declare global {
  interface Window {
    Buffer: typeof Buffer;
    global: Window;
    process: {
      env: Record<string, string | undefined>;
    };
  }

  var Buffer: typeof import('buffer').Buffer;
  var global: Window & typeof globalThis;
  var process: {
    env: Record<string, string | undefined>;
  };
}

export { };

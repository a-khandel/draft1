/// <reference types="vite/client" />

declare global {
  // Injected by the WebSpatial runtime when running in XR environments.
  // Falls back to Vite's BASE_URL when undefined (see src/xrEnv.ts).
  var __XR_ENV_BASE__: string | undefined;
}

export {};

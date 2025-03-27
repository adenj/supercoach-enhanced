// src/types.d.ts
interface Window {
  chrome?: typeof chrome;
  browser?: typeof browser;
}

// For compatibility with Chrome extensions
declare namespace chrome {
  export const storage: typeof browser.storage;
  export const runtime: typeof browser.runtime;
  // Add other Chrome APIs you're using
}
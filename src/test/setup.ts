import '@testing-library/jest-dom';

// Extend matchers for better assertions
// This provides matchers like .toBeInTheDocument(), .toHaveClass(), etc.

// Mock global fetch if needed for tests
global.fetch = global.fetch || (() => Promise.resolve({
  ok: true,
  status: 200,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  headers: new Headers(),
  redirected: false,
  statusText: 'OK',
  type: 'basic',
  url: '',
  clone: () => ({} as Response),
  body: null,
  bodyUsed: false,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  blob: () => Promise.resolve(new Blob()),
  formData: () => Promise.resolve(new FormData()),
} as Response));

// Set up global test environment
beforeEach(() => {
  // Clear any cookies or local storage between tests
  document.cookie = '';
  localStorage.clear();
  sessionStorage.clear();
});

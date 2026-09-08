import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
let localStore = {};
const localStorageMock = {
  getItem: vi.fn((key) => (key in localStore ? localStore[key] : null)),
  setItem: vi.fn((key, value) => {
    localStore[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete localStore[key];
  }),
  clear: vi.fn(() => {
    localStore = {};
  }),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();
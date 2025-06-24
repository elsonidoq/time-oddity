import { jest } from '@jest/globals';
// Centralized GSAP mock for all tests
const mockTimeline = {
  to: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  add: jest.fn().mockReturnThis(),
  play: jest.fn().mockReturnThis(),
  kill: jest.fn(),
  eventCallback: jest.fn((type, callback, params) => {
    if (type === 'onComplete' && callback) {
      callback(...(params || []));
    }
  }),
};

const killTweensOf = jest.fn();

const mockGsap = {
  to: jest.fn((target, vars) => {
    if (vars.onComplete) {
      vars.onComplete(...(vars.onCompleteParams || []));
    }
    return { kill: jest.fn() };
  }),
  timeline: jest.fn(() => mockTimeline),
  killTweensOf,
};

// Provide both default and named exports for compatibility
export default mockGsap;
export const gsap = mockGsap;
export { mockTimeline, killTweensOf };

export const from = jest.fn();
export const fromTo = jest.fn();
export const updateRoot = jest.fn(); 
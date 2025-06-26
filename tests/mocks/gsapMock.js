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

// Enhanced mock tween object for visual effects
const createMockTween = (target, vars) => {
  const tween = {
    kill: jest.fn(),
    target: target,
    vars: vars
  };
  
  // Execute onComplete callback if provided
  if (vars && vars.onComplete) {
    // Simulate async behavior by calling onComplete after a small delay
    setTimeout(() => {
      vars.onComplete(...(vars.onCompleteParams || []));
    }, 0);
  }
  
  return tween;
};

const mockGsap = {
  to: jest.fn((target, vars) => createMockTween(target, vars)),
  from: jest.fn((target, vars) => createMockTween(target, vars)),
  fromTo: jest.fn((target, fromVars, toVars) => createMockTween(target, toVars)),
  timeline: jest.fn(() => mockTimeline),
  killTweensOf,
  set: jest.fn((target, vars) => {
    // Apply properties immediately for set
    if (target && typeof target === 'object') {
      Object.assign(target, vars);
    }
  }),
  registerPlugin: jest.fn(),
  updateRoot: jest.fn(),
  ticker: {
    lagSmoothing: jest.fn(),
    remove: jest.fn()
  }
};

// Provide both default and named exports for compatibility
export default mockGsap;
export const gsap = mockGsap;
export { mockTimeline, killTweensOf };

export const from = jest.fn((target, vars) => createMockTween(target, vars));
export const fromTo = jest.fn((target, fromVars, toVars) => createMockTween(target, toVars));
export const updateRoot = jest.fn(); 
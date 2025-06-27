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
    vars: vars,
    _startValues: {},
    _targetValues: {}
  };
  
  // Store initial and target values for gradual animation simulation
  if (target && typeof target === 'object' && vars) {
    // Store starting values
    if (vars.x !== undefined) tween._startValues.x = target.x;
    if (vars.y !== undefined) tween._startValues.y = target.y;
    if (vars.rotation !== undefined) tween._startValues.rotation = target.rotation || 0;
    if (vars.alpha !== undefined) tween._startValues.alpha = target.alpha || 1;
    if (vars.scale !== undefined) tween._startValues.scale = target.scale || 1;
    
    // Store target values
    if (vars.x !== undefined) tween._targetValues.x = vars.x;
    if (vars.y !== undefined) tween._targetValues.y = vars.y;
    if (vars.rotation !== undefined) tween._targetValues.rotation = vars.rotation;
    if (vars.alpha !== undefined) tween._targetValues.alpha = vars.alpha;
    if (vars.scale !== undefined) tween._targetValues.scale = vars.scale;
    
    // For testing purposes, we'll simulate gradual movement
    // Apply 50% of the movement immediately to simulate animation progress
    const progress = 0.5;
    
    if (vars.x !== undefined) {
      const startX = tween._startValues.x;
      target.x = startX + (vars.x - startX) * progress;
    }
    if (vars.y !== undefined) {
      const startY = tween._startValues.y;
      target.y = startY + (vars.y - startY) * progress;
    }
    
    // Call onUpdate if provided
    if (vars.onUpdate) {
      vars.onUpdate();
    }
  }
  
  // Execute onComplete callback if provided (simulate completion)
  if (vars && vars.onComplete) {
    // Simulate async behavior by calling onComplete after a small delay
    setTimeout(() => {
      // Apply final target values before calling onComplete
      if (target && typeof target === 'object') {
        if (tween._targetValues.x !== undefined) target.x = tween._targetValues.x;
        if (tween._targetValues.y !== undefined) target.y = tween._targetValues.y;
        if (tween._targetValues.rotation !== undefined) target.rotation = tween._targetValues.rotation;
        if (tween._targetValues.alpha !== undefined) target.alpha = tween._targetValues.alpha;
        if (tween._targetValues.scale !== undefined) target.scale = tween._targetValues.scale;
        
        // Call onUpdate one more time with final values
        if (vars.onUpdate) {
          vars.onUpdate();
        }
      }
      
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
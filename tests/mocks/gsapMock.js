// Centralized GSAP mock for all tests
export const mockTimeline = {
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

export const gsapMock = {
  to: jest.fn((target, vars) => {
    if (vars && typeof vars.onComplete === 'function') {
      vars.onComplete(...(vars.onCompleteParams || []));
    }
    return { kill: jest.fn() };
  }),
  from: jest.fn(),
  fromTo: jest.fn(),
  killTweensOf: jest.fn(),
  updateRoot: jest.fn(),
  timeline: jest.fn(() => mockTimeline),
}; 
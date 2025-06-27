export const gsap = {
  to: jest.fn((target, config) => {
    // Immediately call onComplete if provided
    if (config.onComplete) {
      config.onComplete();
    }
    return {
      kill: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn()
    };
  }),
  from: jest.fn((target, config) => {
    // Immediately call onComplete if provided
    if (config.onComplete) {
      config.onComplete();
    }
    return {
      kill: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn()
    };
  }),
  timeline: jest.fn(() => ({
    to: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis(),
    play: jest.fn().mockReturnThis(),
    pause: jest.fn().mockReturnThis(),
    resume: jest.fn().mockReturnThis(),
    kill: jest.fn().mockReturnThis()
  }))
}; 
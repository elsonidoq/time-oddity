const timelineMock = () => ({
  to: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  play: jest.fn(),
  pause: jest.fn(),
  kill: jest.fn(),
});

export default {
  timeline: jest.fn(timelineMock),
}; 
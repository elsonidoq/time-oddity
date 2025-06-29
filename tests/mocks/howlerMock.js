import { jest } from '@jest/globals';

// Centralized Howler.js mock for all tests
export const mockHowlInstance = {
  play: jest.fn().mockReturnValue(Math.random()), // Return a unique sound ID
  stop: jest.fn(),
  volume: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  state: jest.fn().mockReturnValue('loaded'),
  rate: jest.fn(),
  pause: jest.fn(),
};

export const HowlMock = jest.fn().mockImplementation(() => mockHowlInstance);

export const HowlerMock = {
  volume: jest.fn(),
  mute: jest.fn(),
  pos: jest.fn(),
};

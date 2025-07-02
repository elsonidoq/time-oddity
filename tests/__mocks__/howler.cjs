// Mock for Howler.js - CommonJS format for Jest __mocks__
const mockHowlInstance = {
  play: jest.fn().mockReturnValue(Math.random()), // Return a unique sound ID
  stop: jest.fn(),
  volume: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  state: jest.fn().mockReturnValue('loaded'),
  rate: jest.fn(),
  pause: jest.fn(),
};

const HowlMock = jest.fn().mockImplementation(() => mockHowlInstance);

const HowlerMock = {
  volume: jest.fn(),
  mute: jest.fn(),
  pos: jest.fn(),
};

module.exports = {
  Howl: HowlMock,
  Howler: HowlerMock,
}; 
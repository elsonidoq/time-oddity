import { jest } from '@jest/globals';
import TimeManager from '../../client/src/systems/TimeManager.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

// Create mock AudioManager
const mockAudioManager = {
  playRewindStart: jest.fn(),
  playRewindEnd: jest.fn(),
  stopRewindAudio: jest.fn(),
  isRewindAudioPlaying: false
};

describe('TimeManager Audio Effects Integration', () => {
  let timeManager;
  let mockScene;
  let audioManagerMock;

  beforeEach(() => {
    jest.clearAllMocks();
    audioManagerMock = {
      playRewindStart: jest.fn(),
      playRewindEnd: jest.fn(),
      stopRewindAudio: jest.fn(),
      isRewindAudioPlaying: false
    };
    mockScene = createPhaserSceneMock('TestScene');
    mockScene.audioManager = audioManagerMock;
    timeManager = new TimeManager(mockScene);
  });

  test('calls playRewindStart when toggleRewind(true) is called', () => {
    timeManager.toggleRewind(true);
    expect(mockScene.audioManager.playRewindStart).toHaveBeenCalledTimes(1);
  });

  test('calls playRewindEnd when toggleRewind(false) is called after rewind started', () => {
    timeManager.toggleRewind(true);
    jest.clearAllMocks();
    timeManager.toggleRewind(false);
    expect(mockScene.audioManager.playRewindEnd).toHaveBeenCalledTimes(1);
  });

  test('does not call playRewindStart if already rewinding', () => {
    timeManager.toggleRewind(true);
    jest.clearAllMocks();
    timeManager.toggleRewind(true);
    expect(mockScene.audioManager.playRewindStart).not.toHaveBeenCalled();
  });

  test('does not call playRewindEnd if not rewinding', () => {
    timeManager.toggleRewind(false);
    expect(mockScene.audioManager.playRewindEnd).not.toHaveBeenCalled();
  });

  test('works if audioManager is set after TimeManager construction', () => {
    // Remove audioManager initially
    const scene = createPhaserSceneMock('TestScene');
    const tm = new TimeManager(scene);
    const audioManagerMock2 = {
      playRewindStart: jest.fn(),
      playRewindEnd: jest.fn(),
      stopRewindAudio: jest.fn(),
      isRewindAudioPlaying: false
    };
    // Set audioManager after construction
    scene.audioManager = audioManagerMock2;
    tm.toggleRewind(true);
    expect(audioManagerMock2.playRewindStart).toHaveBeenCalledTimes(1);
    tm.toggleRewind(false);
    expect(audioManagerMock2.playRewindEnd).toHaveBeenCalledTimes(1);
  });
}); 
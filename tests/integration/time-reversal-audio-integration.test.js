import { jest } from '@jest/globals';

// Create mock Howl instance
const mockHowl = {
  play: jest.fn(),
  stop: jest.fn(),
  fade: jest.fn(),
  volume: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
};

// ESM mock for Howler BEFORE importing AudioManager
await jest.unstable_mockModule('howler', () => ({
  Howl: jest.fn(() => mockHowl),
  Howler: {
    mute: jest.fn()
  }
}));

const AudioManager = (await import('../../client/src/systems/AudioManager.js')).default;
const TimeManager = (await import('../../client/src/systems/TimeManager.js')).default;

// No need to import GameScene for this integration

describe('Time Reversal Audio Integration', () => {
  let audioManager;
  let timeManager;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create real AudioManager instance
    audioManager = new AudioManager();
    
    // Create mock scene with audioManager
    const mockScene = {
      audioManager: audioManager,
      cameras: { main: { setTint: jest.fn(), clearTint: jest.fn() } },
      add: { graphics: jest.fn(() => ({ fillStyle: jest.fn(), fillRect: jest.fn(), setAlpha: jest.fn(), setScrollFactor: jest.fn(), setDepth: jest.fn(), setVisible: jest.fn(), destroy: jest.fn() })) },
      sys: { game: { config: { width: 1280, height: 720 } } }
    };
    
    // Create TimeManager with the scene
    timeManager = new TimeManager(mockScene);
  });

  test('AudioManager should have rewind sound properties', () => {
    expect(audioManager._rewindStartSound).toBeDefined();
    expect(audioManager._rewindEndSound).toBeDefined();
    expect(audioManager._isRewindAudioPlaying).toBeDefined();
  });

  test('TimeManager should receive AudioManager from scene', () => {
    expect(timeManager.audioManager).toBe(audioManager);
  });

  test('playRewindStart should trigger Howler play', () => {
    audioManager.playRewindStart();
    expect(mockHowl.play).toHaveBeenCalled();
    expect(audioManager._isRewindAudioPlaying).toBe(true);
  });

  test('playRewindEnd should trigger Howler play and stop rewind audio', () => {
    // Start rewind audio first
    audioManager.playRewindStart();
    jest.clearAllMocks();
    
    // Play end sound
    audioManager.playRewindEnd();
    expect(mockHowl.play).toHaveBeenCalled(); // Should call play for end sound
    expect(mockHowl.stop).toHaveBeenCalled(); // Should stop start sound
    expect(audioManager._isRewindAudioPlaying).toBe(false);
  });

  test('TimeManager toggleRewind should call AudioManager methods', () => {
    const playRewindStartSpy = jest.spyOn(audioManager, 'playRewindStart');
    const playRewindEndSpy = jest.spyOn(audioManager, 'playRewindEnd');
    
    // Start rewind
    timeManager.toggleRewind(true);
    expect(playRewindStartSpy).toHaveBeenCalledTimes(1);
    
    // End rewind
    timeManager.toggleRewind(false);
    expect(playRewindEndSpy).toHaveBeenCalledTimes(1);
  });

  test('Full integration: TimeManager toggleRewind should trigger Howler sounds', () => {
    // Start rewind
    timeManager.toggleRewind(true);
    expect(mockHowl.play).toHaveBeenCalled(); // Should trigger Howler play
    
    jest.clearAllMocks();
    
    // End rewind
    timeManager.toggleRewind(false);
    expect(mockHowl.play).toHaveBeenCalled(); // Should trigger Howler play for end sound
    expect(mockHowl.stop).toHaveBeenCalled(); // Should stop start sound
  });
}); 
import '../mocks/phaserMock.js';
import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import the mocks that Jest will provide via moduleNameMapper
let HowlMock, HowlerMock;

describe('Task 06.01: AudioManager Background Music', () => {
  let AudioManager;
  let audioManager;
  let audioManagerPath;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    audioManagerPath = join(__dirname, '../../client/src/systems/AudioManager.js');
    
    // Import the mocks that Jest provides via moduleNameMapper
    const howlerMock = await import('howler');
    HowlMock = howlerMock.Howl;
    HowlerMock = howlerMock.Howler;
    
    // AudioManager doesn't exist yet - this test will fail initially
    if (existsSync(audioManagerPath)) {
      const audioModule = await import(audioManagerPath);
      AudioManager = audioModule.default;
    } else {
      // Placeholder for when file doesn't exist yet
      AudioManager = null;
    }
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    HowlMock.mockClear();
    HowlerMock.mute.mockClear();
  });

  describe('AudioManager Class Existence', () => {
    test('AudioManager class file should exist', () => {
      expect(existsSync(audioManagerPath)).toBe(true);
    });

    test('AudioManager should be a class', () => {
      expect(AudioManager).toBeDefined();
      expect(typeof AudioManager).toBe('function');
    });
  });

  describe('AudioManager Constructor', () => {
    test('should create AudioManager instance', () => {
      if (!AudioManager) {
        // Skip if AudioManager doesn't exist yet (Red phase)
        expect(AudioManager).toBeNull();
        return;
      }
      
      audioManager = new AudioManager();
      expect(audioManager).toBeInstanceOf(AudioManager);
    });

    test('should initialize with default mute state', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      audioManager = new AudioManager();
      expect(audioManager.isMuted).toBe(false);
    });
  });

  describe('AudioManager.playMusic', () => {
    beforeEach(() => {
      if (AudioManager) {
        audioManager = new AudioManager();
      }
    });

    test('should create Howl instance with correct parameters for background music', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      audioManager.playMusic('background');
      
      expect(HowlMock).toHaveBeenCalledWith(
        expect.objectContaining({
          src: expect.arrayContaining([expect.stringContaining('cancion.ogg')]),
          loop: true,
          volume: 0.8
        })
      );
    });

    test('should call play() on the Howl instance', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      audioManager.playMusic('background');
      
      // Get the mock instance that was created
      const mockHowlInstance = HowlMock.mock.results[0].value;
      expect(mockHowlInstance.play).toHaveBeenCalled();
    });

    test('should store the Howl instance for later use', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      audioManager.playMusic('background');
      
      // Should store the music instance
      expect(audioManager._backgroundMusic).toBeDefined();
      expect(audioManager._backgroundMusic).toBe(HowlMock.mock.results[0].value);
    });
  });

  describe('AudioManager.stopMusic', () => {
    beforeEach(() => {
      if (AudioManager) {
        audioManager = new AudioManager();
        audioManager.playMusic('background');
      }
    });

    test('should call stop() on the background music instance', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      audioManager.stopMusic();
      
      const mockHowlInstance = HowlMock.mock.results[0].value;
      expect(mockHowlInstance.stop).toHaveBeenCalled();
    });

    test('should work even if no music is playing', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      // Create new instance without playing music
      const newAudioManager = new AudioManager();
      
      // Should not throw error
      expect(() => newAudioManager.stopMusic()).not.toThrow();
    });
  });

  describe('AudioManager.isMuted Property', () => {
    beforeEach(() => {
      if (AudioManager) {
        audioManager = new AudioManager();
      }
    });

    test('should have isMuted property', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      expect(audioManager.isMuted).toBeDefined();
      expect(typeof audioManager.isMuted).toBe('boolean');
    });

    test('should default to false', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      expect(audioManager.isMuted).toBe(false);
    });
  });
});

describe('GameScene AudioManager Integration', () => {
  let GameScene;
  let AudioManager;
  let gameScene;
  let scene;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const gameScenePath = join(__dirname, '../../client/src/scenes/GameScene.js');
    const audioManagerPath = join(__dirname, '../../client/src/systems/AudioManager.js');
    
    if (existsSync(gameScenePath)) {
      const gameSceneModule = await import(gameScenePath);
      GameScene = gameSceneModule.default;
    } else {
      GameScene = null;
    }
    
    if (existsSync(audioManagerPath)) {
      const audioModule = await import(audioManagerPath);
      AudioManager = audioModule.default;
    } else {
      AudioManager = null;
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock scene for GameScene
    scene = {
      input: {
        keyboard: {
          addKey: jest.fn(() => ({ isDown: false, isUp: true }))
        }
      },
      load: {
        audio: jest.fn()
      },
      add: {
        text: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
          setInteractive: jest.fn().mockReturnThis(),
          on: jest.fn()
        })),
        tileSprite: jest.fn(() => ({
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 0
        })),
        existing: jest.fn(),
        group: jest.fn(() => ({ add: jest.fn() })),
        sprite: jest.fn(() => ({
          setActive: jest.fn().mockReturnThis(),
          setVisible: jest.fn().mockReturnThis(),
          setOrigin: jest.fn().mockReturnThis(),
          texture: { key: 'ghost' }
        })),
      },
      physics: {
        add: {
          group: jest.fn(() => ({
            add: jest.fn()
          })),
          existing: jest.fn(),
          sprite: jest.fn(() => ({
            body: {
              setImmovable: jest.fn(),
              setAllowGravity: jest.fn(),
              setFriction: jest.fn(),
              setBounce: jest.fn(),
              setCollideWorldBounds: jest.fn()
            },
            play: jest.fn().mockReturnThis(),
            parentCoin: null
          })),
          collider: jest.fn(),
          overlap: jest.fn()
        },
        world: {
          gravity: { y: 980 },
          bounds: { setTo: jest.fn() }
        },
        config: { debug: false }
      },
      cameras: {
        main: {
          setBounds: jest.fn(),
          setZoom: jest.fn(),
          startFollow: jest.fn(),
          setDeadzone: jest.fn()
        }
      },
      sys: {
        game: {
          config: {
            width: 1280,
            height: 720,
            physics: {
              arcade: { debug: false }
            }
          }
        }
      },
      events: {
        emit: jest.fn(),
        on: jest.fn()
      },
      registry: {
        set: jest.fn()
      },
      scene: {
        start: jest.fn(),
        launch: jest.fn()
      }
    };
  });

  describe('GameScene AudioAsset Loading', () => {
    test('should load background music asset in preload()', () => {
      if (!GameScene) {
        expect(GameScene).toBeNull();
        return;
      }
      
      gameScene = new GameScene(scene);
      gameScene.preload();
      
      expect(scene.load.audio).toHaveBeenCalledWith(
        'background',
        expect.arrayContaining([expect.stringContaining('cancion.ogg')])
      );
    });
  });

  describe('GameScene AudioManager Instantiation', () => {
    test('should create AudioManager instance in create()', () => {
      if (!GameScene) {
        expect(GameScene).toBeNull();
        return;
      }
      
      gameScene = new GameScene(scene);
      gameScene.create();
      
      // AudioManager should be instantiated and attached to the scene
      expect(gameScene.audioManager).toBeDefined();
      expect(gameScene.audioManager).toBeInstanceOf(AudioManager);
    });

    test('should call playMusic() on AudioManager in create()', () => {
      if (!GameScene) {
        expect(GameScene).toBeNull();
        return;
      }
      
      // Spy on the AudioManager's playMusic method
      const originalPlayMusic = AudioManager.prototype.playMusic;
      const playMusicSpy = jest.fn();
      AudioManager.prototype.playMusic = playMusicSpy;
      
      gameScene = new GameScene(scene);
      gameScene.create();
      
      expect(playMusicSpy).toHaveBeenCalledWith('background');
      
      // Restore the original method
      AudioManager.prototype.playMusic = originalPlayMusic;
    });
  });
}); 
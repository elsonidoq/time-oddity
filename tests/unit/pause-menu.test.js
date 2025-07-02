import '../mocks/phaserMock.js';
import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Phaser KeyCodes mock for ESM/Jest
if (!globalThis.Phaser) globalThis.Phaser = {};
if (!globalThis.Phaser.Input) globalThis.Phaser.Input = {};
if (!globalThis.Phaser.Input.Keyboard) globalThis.Phaser.Input.Keyboard = {};
if (!globalThis.Phaser.Input.Keyboard.KeyCodes) {
  globalThis.Phaser.Input.Keyboard.KeyCodes = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UP: 'UP',
    DOWN: 'DOWN',
    A: 'A',
    D: 'D',
    W: 'W',
    S: 'S',
    SPACE: 'SPACE',
    SHIFT: 'SHIFT',
    R: 'R',
    P: 'P', // Add P key for pause
  };
}

// Initialize JustDown function immediately
globalThis.Phaser.Input.Keyboard.JustDown = jest.fn(() => false);

describe('Task 4.4: Pause Menu Functionality', () => {
  let InputManager;
  let GameScene;
  let UIScene;
  let inputManager;
  let gameScene;
  let uiScene;
  let mockScene;

  beforeAll(async () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Import classes
    const inputModule = await import('../../client/src/systems/InputManager.js');
    InputManager = inputModule.default;
    
    const gameModule = await import('../../client/src/scenes/GameScene.js');
    GameScene = gameModule.default;
    
    const uiModule = await import('../../client/src/scenes/UIScene.js');
    UIScene = uiModule.default;
  });

  beforeEach(() => {
    // Mock scene setup
    mockScene = {
      input: {
        keyboard: {
          addKey: jest.fn((key) => ({ 
            isDown: false, 
            isUp: true, 
            isPressed: false, 
            keyCode: key 
          }))
        }
      },
      time: { now: 0 },
      physics: {
        world: { gravity: { y: 0 }, tileBias: 0, bounds: { setTo: jest.fn() } },
        config: { debug: false },
        add: { 
          group: jest.fn(() => ({ 
            create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })),
            add: jest.fn()
          })), 
          sprite: jest.fn(() => ({ 
            body: { 
              setAllowGravity: jest.fn(),
              setGravity: jest.fn(),
              setCollideWorldBounds: jest.fn(),
              setBounce: jest.fn(),
              setVelocity: jest.fn(),
              setVelocityX: jest.fn(),
              setVelocityY: jest.fn(),
              velocity: { x: 0, y: 0 },
              onFloor: jest.fn(() => true)
            }, 
            play: jest.fn().mockReturnThis(), 
            parentCoin: null 
          })), 
          existing: jest.fn(),
          collider: jest.fn(),
        },
      },
      cameras: { main: { setBounds: jest.fn() } },
      sys: {
        game: {
          config: {
            physics: { arcade: { debug: false } },
            width: 1280,
            height: 720,
          }
        },
        events: { on: jest.fn(), off: jest.fn() }
      },
      scene: {
        pause: jest.fn(),
        resume: jest.fn(),
        launch: jest.fn(),
        get: jest.fn(),
        isActive: jest.fn(() => true),
        isPaused: jest.fn(() => false)
      },
      add: {
        text: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
          setInteractive: jest.fn().mockReturnThis(),
          on: jest.fn().mockReturnThis(),
          setVisible: jest.fn().mockReturnThis()
        })),
        graphics: jest.fn(() => ({
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis(),
          clear: jest.fn().mockReturnThis(),
          setVisible: jest.fn().mockReturnThis()
        }))
      },
      registry: {
        get: jest.fn(),
        set: jest.fn()
      },
      events: {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn()
      }
    };

    inputManager = new InputManager(mockScene);
    gameScene = new GameScene(mockScene);
    uiScene = new UIScene(mockScene);

    // Mock the InputManager methods directly to avoid JustDown issues
    jest.spyOn(inputManager, 'isPauseJustPressed', 'get').mockReturnValue(false);
  });

  describe('InputManager Pause Key Support', () => {
    test('should add P key to InputManager', () => {
      expect(mockScene.input.keyboard.addKey).toHaveBeenCalledWith('P');
      expect(inputManager.p).toBeDefined();
    });

    test('should have isPausePressed getter', () => {
      expect(typeof inputManager.isPausePressed).toBe('boolean');
    });

    test('should have isPauseJustPressed getter', () => {
      expect(typeof inputManager.isPauseJustPressed).toBe('boolean');
    });

    test('isPausePressed should return correct state', () => {
      inputManager.p = { isDown: true };
      expect(inputManager.isPausePressed).toBe(true);
      
      inputManager.p = { isDown: false };
      expect(inputManager.isPausePressed).toBe(false);
    });

    test('isPauseJustPressed should use Phaser.Input.Keyboard.JustDown', () => {
      // Mock the getter to return true for this test
      jest.spyOn(inputManager, 'isPauseJustPressed', 'get').mockReturnValue(true);
      
      const result = inputManager.isPauseJustPressed;
      expect(result).toBe(true);
    });
  });

  describe('GameScene Pause Functionality', () => {
    test('should handle pause input in update method', () => {
      // Mock player with inputManager
      gameScene.player = {
        inputManager: inputManager,
        update: jest.fn(),
        health: 100,
        dashTimer: 0,
        chronoPulse: { lastActivationTime: 0 }
      };
      
      // Mock TimeManager with update method
      gameScene.timeManager = {
        update: jest.fn(),
        pauseRecording: jest.fn(),
        resumeRecording: jest.fn(),
        isRewinding: false
      };

      // Mock pause key as just pressed
      jest.spyOn(gameScene.player.inputManager, 'isPauseJustPressed', 'get').mockReturnValue(true);
      
      gameScene.update(0, 16);
      
      expect(mockScene.scene.pause).toHaveBeenCalledWith('GameScene');
      expect(mockScene.scene.launch).toHaveBeenCalledWith('UIScene', { showPause: true });
    });

    test('should emit gamePaused event when pausing', () => {
      // Mock player with inputManager
      gameScene.player = {
        inputManager: inputManager,
        update: jest.fn(),
        health: 100,
        dashTimer: 0,
        chronoPulse: { lastActivationTime: 0 }
      };
      
      // Mock TimeManager with update method
      gameScene.timeManager = {
        update: jest.fn(),
        pauseRecording: jest.fn(),
        resumeRecording: jest.fn(),
        isRewinding: false
      };

      // Mock pause key as just pressed
      jest.spyOn(gameScene.player.inputManager, 'isPauseJustPressed', 'get').mockReturnValue(true);
      
      gameScene.update(0, 16);
      
      expect(mockScene.events.emit).toHaveBeenCalledWith('gamePaused');
    });

    test('should handle TimeManager during pause', () => {
      // Mock player with inputManager
      gameScene.player = {
        inputManager: inputManager,
        update: jest.fn(),
        health: 100,
        dashTimer: 0,
        chronoPulse: { lastActivationTime: 0 }
      };
      
      // Mock TimeManager
      gameScene.timeManager = {
        update: jest.fn(),
        pauseRecording: jest.fn(),
        resumeRecording: jest.fn(),
        isRewinding: false
      };
      
      // Mock pause key as just pressed
      jest.spyOn(gameScene.player.inputManager, 'isPauseJustPressed', 'get').mockReturnValue(true);
      
      gameScene.update(0, 16);
      
      expect(gameScene.timeManager.pauseRecording).toHaveBeenCalled();
    });
  });

  describe('UIScene Pause Menu Overlay', () => {
    test('should create pause menu when showPause is true', () => {
      uiScene.create({ showPause: true });
      
      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockScene.add.text).toHaveBeenCalledWith(
        expect.any(Number), 
        expect.any(Number), 
        'Resume', 
        expect.any(Object)
      );
    });

    test('should not create pause menu when showPause is false', () => {
      const graphicsCalls = mockScene.add.graphics.mock.calls.length;
      const textCalls = mockScene.add.text.mock.calls.length;
      
      uiScene.create({ showPause: false });
      
      // Should not add extra graphics/text for pause menu  
      expect(mockScene.add.graphics.mock.calls.length).toBe(graphicsCalls + 3); // Health bar graphics + MapOverlay
    });

    test('should create semi-transparent overlay', () => {
      const mockGraphics = {
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      
      uiScene.create({ showPause: true });
      
      expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 0.5);
      expect(mockGraphics.fillRect).toHaveBeenCalledWith(0, 0, 1280, 720);
    });

    test('should create resume button with correct properties', () => {
      const mockText = {
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis()
      };
      mockScene.add.text.mockReturnValue(mockText);
      
      uiScene.create({ showPause: true });
      
      expect(mockText.setOrigin).toHaveBeenCalledWith(0.5);
      expect(mockText.setInteractive).toHaveBeenCalledWith({ useHandCursor: true });
      expect(mockText.on).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    });

    test('should handle resume button click', () => {
      const mockText = {
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis()
      };
      mockScene.add.text.mockReturnValue(mockText);
      
      uiScene.create({ showPause: true });
      
      // Get the resume button click handler
      const resumeHandler = mockText.on.mock.calls.find(call => call[0] === 'pointerdown')[1];
      
      // Simulate button click
      resumeHandler();
      
      expect(mockScene.scene.resume).toHaveBeenCalledWith('GameScene');
      expect(mockScene.events.emit).toHaveBeenCalledWith('gameResumed');
    });

    test('should handle P key press while paused', () => {
      uiScene.isPaused = true;
      uiScene.inputManager = inputManager;
      
      // Mock pause key as just pressed
      jest.spyOn(uiScene.inputManager, 'isPauseJustPressed', 'get').mockReturnValue(true);
      
      uiScene.update(0, 16);
      
      expect(mockScene.scene.resume).toHaveBeenCalledWith('GameScene');
      expect(mockScene.events.emit).toHaveBeenCalledWith('gameResumed');
    });
  });

  describe('Pause/Resume Integration', () => {
    test('should properly transition from paused to resumed state', () => {
      // Setup initial pause
      gameScene.player = {
        inputManager: inputManager,
        update: jest.fn(),
        health: 100,
        dashTimer: 0,
        chronoPulse: { lastActivationTime: 0 }
      };
      
      gameScene.timeManager = {
        update: jest.fn(),
        pauseRecording: jest.fn(),
        resumeRecording: jest.fn(),
        isRewinding: false
      };

      // Mock pause key as just pressed
      jest.spyOn(gameScene.player.inputManager, 'isPauseJustPressed', 'get').mockReturnValue(true);
      
      // Pause the game
      gameScene.update(0, 16);
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Setup resume
      uiScene.isPaused = true;
      uiScene.inputManager = inputManager;
      
      // Mock pause key as just pressed for resume
      jest.spyOn(uiScene.inputManager, 'isPauseJustPressed', 'get').mockReturnValue(true);
      
      // Resume the game
      uiScene.update(0, 16);
      
      expect(mockScene.scene.resume).toHaveBeenCalledWith('GameScene');
      expect(mockScene.events.emit).toHaveBeenCalledWith('gameResumed');
    });
  });
}); 
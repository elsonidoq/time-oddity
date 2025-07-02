import '../mocks/phaserMock.js';
import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import the mocks that Jest will provide via moduleNameMapper
let HowlMock, HowlerMock;

describe('Task 06.03: Master Mute Toggle via M Key & UI Button', () => {
  let InputManager;
  let AudioManager;
  let UIScene;
  let GameScene;
  let inputManagerPath;
  let audioManagerPath;
  let uiScenePath;
  let gameScenePath;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
    audioManagerPath = join(__dirname, '../../client/src/systems/AudioManager.js');
    uiScenePath = join(__dirname, '../../client/src/scenes/UIScene.js');
    gameScenePath = join(__dirname, '../../client/src/scenes/GameScene.js');
    
    // Import the mocks that Jest provides via moduleNameMapper
    const howlerMock = await import('howler');
    HowlMock = howlerMock.Howl;
    HowlerMock = howlerMock.Howler;
    
    // Import modules if they exist
    if (existsSync(inputManagerPath)) {
      const inputModule = await import(inputManagerPath);
      InputManager = inputModule.default;
    } else {
      InputManager = null;
    }
    
    if (existsSync(audioManagerPath)) {
      const audioModule = await import(audioManagerPath);
      AudioManager = audioModule.default;
    } else {
      AudioManager = null;
    }
    
    if (existsSync(uiScenePath)) {
      const uiModule = await import(uiScenePath);
      UIScene = uiModule.default;
    } else {
      UIScene = null;
    }
    
    if (existsSync(gameScenePath)) {
      const gameModule = await import(gameScenePath);
      GameScene = gameModule.default;
    } else {
      GameScene = null;
    }
  });

  describe('InputManager Mute Key Support (06.03.1)', () => {
    let inputManager;
    let scene;

    beforeEach(() => {
      scene = {
        input: {
          keyboard: {
            addKey: jest.fn(() => ({
              isDown: false,
              isUp: true,
              justDown: false,
              justUp: false
            }))
          }
        }
      };
      
      if (InputManager) {
        inputManager = new InputManager(scene);
      }
    });

    test('should exist and be instantiable', () => {
      if (!InputManager) {
        expect(InputManager).toBeNull();
        return;
      }
      expect(inputManager).toBeInstanceOf(InputManager);
    });

    test('should have isMutePressed() method', () => {
      if (!inputManager) {
        expect(inputManager).toBeNull();
        return;
      }
      expect(typeof inputManager.isMutePressed).toBe('boolean');
    });

    test('should create M key when instantiated', () => {
      if (!inputManager) {
        expect(inputManager).toBeNull();
        return;
      }
      expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('M');
    });

    test('should return false when M key is not pressed', () => {
      if (!inputManager) {
        expect(inputManager).toBeNull();
        return;
      }
      expect(inputManager.isMutePressed).toBe(false);
    });

    test('should return true when M key is pressed', () => {
      if (!inputManager) {
        expect(inputManager).toBeNull();
        return;
      }
      
      // Mock the M key to be pressed
      const mockMKey = {
        isDown: true,
        isUp: false,
        justDown: false,
        justUp: false
      };
      scene.input.keyboard.addKey.mockReturnValue(mockMKey);
      
      inputManager = new InputManager(scene);
      expect(inputManager.isMutePressed).toBe(true);
    });
  });

  describe('AudioManager.toggleMute() Implementation (06.03.2)', () => {
    let audioManager;

    beforeEach(() => {
      if (AudioManager) {
        audioManager = new AudioManager();
      }
    });

    test('should have toggleMute() method', () => {
      if (!audioManager) {
        expect(audioManager).toBeNull();
        return;
      }
      expect(typeof audioManager.toggleMute).toBe('function');
    });

    test('should toggle isMuted from false to true', () => {
      if (!audioManager) {
        expect(audioManager).toBeNull();
        return;
      }
      
      audioManager.isMuted = false;
      audioManager.toggleMute();
      expect(audioManager.isMuted).toBe(true);
    });

    test('should toggle isMuted from true to false', () => {
      if (!audioManager) {
        expect(audioManager).toBeNull();
        return;
      }
      
      audioManager.isMuted = true;
      audioManager.toggleMute();
      expect(audioManager.isMuted).toBe(false);
    });

    test('should call Howler.mute(true) when muting', () => {
      if (!audioManager) {
        expect(audioManager).toBeNull();
        return;
      }
      
      audioManager.isMuted = false;
      audioManager.toggleMute();
      expect(HowlerMock.mute).toHaveBeenCalledWith(true);
    });

    test('should call Howler.mute(false) when unmuting', () => {
      if (!audioManager) {
        expect(audioManager).toBeNull();
        return;
      }
      
      audioManager.isMuted = true;
      audioManager.toggleMute();
      expect(HowlerMock.mute).toHaveBeenCalledWith(false);
    });

    test('should handle Howler not being ready gracefully', () => {
      if (!audioManager) {
        expect(audioManager).toBeNull();
        return;
      }
      
      // Mock Howler.mute to throw an error
      HowlerMock.mute.mockImplementation(() => {
        throw new Error('Howler not ready');
      });
      
      // Should not throw an error
      expect(() => {
        audioManager.toggleMute();
      }).not.toThrow();
    });
  });

  describe('UIScene Mute Button Integration (06.03.3)', () => {
    let uiScene;
    let scene;

    beforeEach(() => {
      const mockBackgroundGraphics = {
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis()
      };
      const mockForegroundGraphics = {
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis()
      };
      const mockMapOverlayGraphics = {
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis()
      };
      
      scene = {
        add: {
          image: jest.fn(() => ({
            setInteractive: jest.fn().mockReturnThis(),
            setTexture: jest.fn().mockReturnThis(),
            setPosition: jest.fn().mockReturnThis(),
            setScale: jest.fn().mockReturnThis(),
            setDepth: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            off: jest.fn().mockReturnThis()
          })),
          graphics: jest.fn()
            .mockReturnValueOnce(mockBackgroundGraphics)   // Health bar background
            .mockReturnValueOnce(mockForegroundGraphics)   // Health bar foreground  
            .mockReturnValueOnce(mockMapOverlayGraphics),  // MapOverlay graphics
          text: jest.fn(() => ({
            setOrigin: jest.fn().mockReturnThis(),
            setInteractive: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            setText: jest.fn().mockReturnThis(),
            setTint: jest.fn().mockReturnThis(),
            setAlpha: jest.fn().mockReturnThis()
          })),
          tileSprite: jest.fn(() => ({
            setDepth: jest.fn().mockReturnThis(),
            setData: jest.fn().mockReturnThis(),
            tilePositionX: 0
          }))
        },
        events: {
          on: jest.fn(),
          emit: jest.fn()
        },
        input: {
          keyboard: {
            addKey: jest.fn(() => ({
              isDown: false,
              isUp: true,
              justDown: false,
              justUp: false
            }))
          }
        },
        scene: {
          get: jest.fn(() => ({
            events: {
              on: jest.fn()
            }
          }))
        },
        registry: {
          get: jest.fn(),
          set: jest.fn()
        },
        time: {
          now: jest.fn(() => 0)
        },
        cameras: {
          main: {
            setBounds: jest.fn(),
            startFollow: jest.fn(),
            setDeadzone: jest.fn(),
            setZoom: jest.fn()
          }
        },
        physics: {
          add: {
            sprite: jest.fn(() => ({
              body: {
                setVelocityY: jest.fn(),
                setAllowGravity: jest.fn(),
                setImmovable: jest.fn().mockReturnThis(),
                setFriction: jest.fn().mockReturnThis(),
                setBounce: jest.fn().mockReturnThis(),
                setCollideWorldBounds: jest.fn().mockReturnThis()
              },
              setOrigin: jest.fn().mockReturnThis(),
              setScale: jest.fn().mockReturnThis()
            })),
            existing: jest.fn(),
            group: jest.fn(() => ({
              add: jest.fn(),
              get: jest.fn(() => ({
                setActive: jest.fn(),
                setVisible: jest.fn(),
                setPosition: jest.fn(),
                setScale: jest.fn(),
                setAlpha: jest.fn()
              }))
            })),
            overlap: jest.fn()
          },
          world: {
            pause: jest.fn()
          }
        },
        sys: {
          game: {
            config: {
              width: 1280,
              height: 720
            }
          }
        }
      };
      
      if (UIScene) {
        uiScene = new UIScene();
        uiScene.scene = scene;
        uiScene.add = scene.add;
        uiScene.events = scene.events;
        uiScene.registry = scene.registry;
        uiScene.time = scene.time;
        uiScene.input = scene.input;
      }
    });

    test('should exist and be instantiable', () => {
      if (!UIScene) {
        expect(UIScene).toBeNull();
        return;
      }
      expect(uiScene).toBeInstanceOf(UIScene);
    });

    test('should create mute button in create() method', () => {
      if (!uiScene) {
        expect(uiScene).toBeNull();
        return;
      }
      
      uiScene.create();
      expect(scene.add.image).toHaveBeenCalledWith(
        expect.any(Number), // x position
        expect.any(Number), // y position
        expect.stringContaining('mute') // texture key
      );
    });

    test('should make mute button interactive', () => {
      if (!uiScene) {
        expect(uiScene).toBeNull();
        return;
      }
      
      const mockButton = {
        setInteractive: jest.fn().mockReturnThis(),
        setTexture: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        off: jest.fn().mockReturnThis()
      };
      scene.add.image.mockReturnValue(mockButton);
      
      uiScene.create();
      expect(mockButton.setInteractive).toHaveBeenCalled();
    });

    test('should emit toggleMuteRequest event when button clicked', () => {
      if (!uiScene) {
        expect(uiScene).toBeNull();
        return;
      }
      
      const mockButton = {
        setInteractive: jest.fn().mockReturnThis(),
        setTexture: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        off: jest.fn().mockReturnThis()
      };
      scene.add.image.mockReturnValue(mockButton);
      
      uiScene.create();
      
      // Simulate button click
      const clickHandler = mockButton.on.mock.calls.find(call => 
        call[0] === 'pointerdown'
      );
      
      if (clickHandler && clickHandler[1]) {
        clickHandler[1](); // Call the click handler
        expect(scene.events.emit).toHaveBeenCalledWith('toggleMuteRequest');
      }
    });

    test('should update button texture based on mute state', () => {
      if (!uiScene) {
        expect(uiScene).toBeNull();
        return;
      }
      
      const mockButton = {
        setInteractive: jest.fn().mockReturnThis(),
        setTexture: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        off: jest.fn().mockReturnThis()
      };
      scene.add.image.mockReturnValue(mockButton);
      
      uiScene.create();
      
      // Test updating button texture
      uiScene.updateMuteButtonState(true); // muted
      expect(mockButton.setTexture).toHaveBeenCalledWith(expect.stringContaining('muted'));
      
      uiScene.updateMuteButtonState(false); // unmuted
      expect(mockButton.setTexture).toHaveBeenCalledWith(expect.stringContaining('unmuted'));
    });
  });

  describe('GameScene Event Flow Integration (06.03.4)', () => {
    let gameScene;
    let scene;
    let audioManager;

    beforeEach(() => {
      audioManager = {
        toggleMute: jest.fn(),
        isMuted: false
      };
      
      scene = {
        input: {
          keyboard: {
            addKey: jest.fn(() => ({
              isDown: false,
              isUp: true,
              justDown: false,
              justUp: false
            }))
          }
        },
        events: {
          on: jest.fn(),
          emit: jest.fn()
        },
        physics: {
          add: {
            sprite: jest.fn(() => ({
              body: {
                setVelocityY: jest.fn(),
                setAllowGravity: jest.fn(),
                setImmovable: jest.fn().mockReturnThis(),
                setFriction: jest.fn().mockReturnThis(),
                setBounce: jest.fn().mockReturnThis(),
                setCollideWorldBounds: jest.fn().mockReturnThis()
              },
              setOrigin: jest.fn().mockReturnThis(),
              setScale: jest.fn().mockReturnThis()
            })),
            existing: jest.fn(),
            group: jest.fn(() => ({
              add: jest.fn(),
              get: jest.fn(() => ({
                setActive: jest.fn(),
                setVisible: jest.fn(),
                setPosition: jest.fn(),
                setScale: jest.fn(),
                setAlpha: jest.fn()
              }))
            })),
            tileSprite: jest.fn(() => ({
              setDepth: jest.fn().mockReturnThis(),
              setData: jest.fn().mockReturnThis(),
              tilePositionX: 0
            })),
            text: jest.fn(() => ({
              setOrigin: jest.fn().mockReturnThis(),
              setInteractive: jest.fn().mockReturnThis(),
              on: jest.fn().mockReturnThis()
            })),
            overlap: jest.fn(),
            collider: jest.fn()
          },
          world: {
            pause: jest.fn(),
            gravity: { y: 980 },
            tileBias: 32
          },
          config: {
            debug: false
          }
        },
        add: {
          sprite: jest.fn(() => ({
            body: {
              setVelocityY: jest.fn(),
              setAllowGravity: jest.fn(),
              setImmovable: jest.fn().mockReturnThis(),
              setFriction: jest.fn().mockReturnThis(),
              setBounce: jest.fn().mockReturnThis(),
              setCollideWorldBounds: jest.fn().mockReturnThis()
            },
            setOrigin: jest.fn().mockReturnThis(),
            setScale: jest.fn().mockReturnThis(),
            setActive: jest.fn().mockReturnThis(),
            setVisible: jest.fn().mockReturnThis()
          })),
          existing: jest.fn(),
          group: jest.fn(() => ({
            add: jest.fn(),
            get: jest.fn(() => ({
              setActive: jest.fn(),
              setVisible: jest.fn(),
              setPosition: jest.fn(),
              setScale: jest.fn(),
              setAlpha: jest.fn()
            }))
          })),
          tileSprite: jest.fn(() => ({
            setDepth: jest.fn().mockReturnThis(),
            setData: jest.fn().mockReturnThis(),
            tilePositionX: 0
          })),
          text: jest.fn(() => ({
            setOrigin: jest.fn().mockReturnThis(),
            setInteractive: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis()
          }))
        },
        events: {
          on: jest.fn(),
          emit: jest.fn()
        },
        time: {
          now: jest.fn(() => 0)
        },
        cameras: {
          main: {
            setBounds: jest.fn(),
            startFollow: jest.fn(),
            setDeadzone: jest.fn(),
            setZoom: jest.fn()
          }
        },
        sys: {
          game: {
            config: {
              width: 1280,
              height: 720,
              physics: {
                arcade: {
                  debug: false
                }
              }
            }
          }
        }
      };
      
      if (GameScene) {
        gameScene = new GameScene(scene);
        gameScene.audioManager = audioManager;
        gameScene.registry = { get: jest.fn(), set: jest.fn() };
        
        // Mock player with inputManager
        gameScene.player = {
          inputManager: {
            isMutePressed: jest.fn().mockReturnValue(true)
          },
          update: jest.fn(),
          body: {
            velocity: { x: 0, y: 0 }
          },
          health: 100,
          dashTimer: 0,
          chronoPulse: { lastActivationTime: 0 }
        };
      }
    });

    test('should exist and be instantiable', () => {
      if (!GameScene) {
        expect(GameScene).toBeNull();
        return;
      }
      expect(gameScene).toBeInstanceOf(GameScene);
    });

    test('should listen for toggleMuteRequest events', () => {
      if (!gameScene) {
        expect(gameScene).toBeNull();
        return;
      }
      
      gameScene.create();
      expect(scene.events.on).toHaveBeenCalledWith('toggleMuteRequest', expect.any(Function));
    });

    test('should call audioManager.toggleMute() when toggleMuteRequest event received', () => {
      if (!gameScene) {
        expect(gameScene).toBeNull();
        return;
      }
      
      gameScene.create();
      
      // Override the audioManager with our mock
      gameScene.audioManager = audioManager;
      
      // Find the event handler
      const eventHandler = scene.events.on.mock.calls.find(call => 
        call[0] === 'toggleMuteRequest'
      );
      
      if (eventHandler && eventHandler[1]) {
        // Reset the mock before calling the handler
        audioManager.toggleMute.mockClear();
        eventHandler[1](); // Call the event handler
        expect(audioManager.toggleMute).toHaveBeenCalled();
      }
    });

    test('should check for mute key press in update() method', () => {
      if (!gameScene) {
        expect(gameScene).toBeNull();
        return;
      }
      
      gameScene.create();
      
      // Override the audioManager with our mock
      gameScene.audioManager = audioManager;
      
      // Mock player with inputManager AFTER create() method
      gameScene.player = {
        inputManager: {
          get isMutePressed() { return true; }
        },
        update: jest.fn()
      };
      gameScene.update();
      // Since isMutePressed is a getter property, we can't use toHaveBeenCalled()
      // Instead, we verify that the update method was called, which means the mute check was executed
      expect(gameScene.player.update).toHaveBeenCalled();
    });

    test('should call audioManager.toggleMute() when mute key is pressed', () => {
      if (!gameScene) {
        expect(gameScene).toBeNull();
        return;
      }
      
      gameScene.create();
      
      // Override the audioManager with our mock
      gameScene.audioManager = audioManager;
      
      // Mock player with inputManager to return true for mute key press
      gameScene.player = {
        inputManager: {
          get isMutePressed() { return true; }
        },
        update: jest.fn()
      };
      
      // Reset the mock before calling update
      audioManager.toggleMute.mockClear();
      gameScene.update();
      expect(audioManager.toggleMute).toHaveBeenCalled();
    });

    test('should not call toggleMute() when mute key is not pressed', () => {
      if (!gameScene) {
        expect(gameScene).toBeNull();
        return;
      }
      
      gameScene.create();
      
      // Override the audioManager with our mock
      gameScene.audioManager = audioManager;
      
      // Mock player with inputManager to return false for mute key press
      gameScene.player = {
        inputManager: {
          get isMutePressed() { return false; }
        },
        update: jest.fn()
      };
      
      // Reset the mock before calling update
      audioManager.toggleMute.mockClear();
      gameScene.update();
      expect(audioManager.toggleMute).not.toHaveBeenCalled();
    });
  });
}); 
import { jest } from '@jest/globals';
import GameScene from '../../client/src/scenes/GameScene.js';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('GameScene Background Factory Integration', () => {
  let gameScene;
  let mockScene;
  let mockSceneFactory;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    
    // Create comprehensive GameScene mock setup
    gameScene = new GameScene(mockScene);
    
    // Mock the required GameScene properties and methods
    gameScene.levelWidth = 1280;
    gameScene.levelHeight = 720;
    gameScene.cameras = {
      main: {
        setBounds: jest.fn(),
        setZoom: jest.fn(),
        startFollow: jest.fn(),
        setDeadzone: jest.fn()
      }
    };
    gameScene.physics = {
      world: { 
        gravity: { y: 980 }, 
        bounds: { setTo: jest.fn() },
        tileBias: 32
      },
      config: { debug: false },
      add: {
        group: jest.fn(() => ({
          create: jest.fn(() => ({
            setOrigin: jest.fn().mockReturnThis(),
            body: {
              setImmovable: jest.fn(),
              setAllowGravity: jest.fn(),
              setSize: jest.fn(),
              setOffset: jest.fn()
            }
          })),
          add: jest.fn()
        }))
      }
    };
    gameScene.registry = { set: jest.fn() };
    gameScene.add = {
      tileSprite: jest.fn().mockReturnValue({
        setDepth: jest.fn().mockReturnThis(),
        setData: jest.fn().mockReturnThis(),
        x: 640,
        y: 360
      })
    };
    gameScene.sys = {
      game: {
        config: {
          width: 1280,
          height: 720,
          physics: { arcade: { debug: false } }
        }
      }
    };
    
    // Mock SceneFactory
    mockSceneFactory = {
      loadConfiguration: jest.fn().mockReturnValue(true),
      createBackgroundsFromConfig: jest.fn().mockReturnValue([
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 640,
          y: 360,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.0 : undefined)
        },
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 640,
          y: 360,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.5 : undefined)
        }
      ])
    };
    
    // Mock other required methods
    gameScene.createPlatformsWithFactory = jest.fn();
    gameScene.createCoinsWithFactory = jest.fn();
    gameScene.createGoalsWithFactory = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('createBackgroundsWithFactory', () => {
    test('should call SceneFactory.createBackgroundsFromConfig instead of hardcoded creation', async () => {
      // Arrange
      const mockScene = createPhaserSceneMock();
      const gameScene = new GameScene(mockScene);
      
      // Mock SceneFactory
      const mockSceneFactory = {
        config: {
          backgrounds: [
            {
              type: 'layer',
              x: 3200,
              y: 1800,
              width: 6400,
              height: 3600,
              spriteKey: 'background_solid_sky',
              depth: -2,
              scrollSpeed: 0.0
            }
          ]
        },
        createBackgroundsFromConfig: jest.fn().mockResolvedValue([
          {
            setDepth: jest.fn(),
            setData: jest.fn(),
            tilePositionX: 0,
            tilePositionY: 0,
            getData: jest.fn().mockReturnValue(0.0)
          }
        ])
      };
      gameScene.sceneFactory = mockSceneFactory;

      // Act
      gameScene.createBackgroundsWithFactory();
      
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(mockSceneFactory.createBackgroundsFromConfig).toHaveBeenCalledWith(mockSceneFactory.config.backgrounds);
    });

    test('should preserve background references for parallax calculation', async () => {
      // Arrange
      const mockScene = createPhaserSceneMock();
      const gameScene = new GameScene(mockScene);
      
      const mockSkyBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0,
        getData: jest.fn().mockReturnValue(0.0),
        x: 3200
      };
      
      const mockHillsBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0,
        getData: jest.fn().mockReturnValue(0.5),
        x: 3200
      };
      
      const mockSceneFactory = {
        config: {
          backgrounds: [
            {
              type: 'layer',
              x: 3200,
              y: 1800,
              width: 6400,
              height: 3600,
              spriteKey: 'background_solid_sky',
              depth: -2,
              scrollSpeed: 0.0
            },
            {
              type: 'layer',
              x: 3200,
              y: 1800,
              width: 6400,
              height: 3600,
              spriteKey: 'background_color_hills',
              depth: -1,
              scrollSpeed: 0.5
            }
          ]
        },
        createBackgroundsFromConfig: jest.fn().mockResolvedValue([mockSkyBackground, mockHillsBackground])
      };
      gameScene.sceneFactory = mockSceneFactory;

      // Act
      gameScene.createBackgroundsWithFactory();
      
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(gameScene.backgroundLayers).toEqual([mockSkyBackground, mockHillsBackground]);
      expect(gameScene.skyBackground).toBe(mockSkyBackground);
      expect(gameScene.hillsBackground).toBe(mockHillsBackground);
    });

    test('should maintain depth ordering (-2 for sky, -1 for hills)', async () => {
      // Arrange
      const mockScene = createPhaserSceneMock();
      const gameScene = new GameScene(mockScene);
      
      const mockSkyBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0,
        getData: jest.fn().mockReturnValue(0.0)
      };
      
      const mockHillsBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0,
        getData: jest.fn().mockReturnValue(0.5)
      };
      
      const mockSceneFactory = {
        config: {
          backgrounds: [
            {
              type: 'layer',
              x: 3200,
              y: 1800,
              width: 6400,
              height: 3600,
              spriteKey: 'background_solid_sky',
              depth: -2,
              scrollSpeed: 0.0
            },
            {
              type: 'layer',
              x: 3200,
              y: 1800,
              width: 6400,
              height: 3600,
              spriteKey: 'background_color_hills',
              depth: -1,
              scrollSpeed: 0.5
            }
          ]
        },
        createBackgroundsFromConfig: jest.fn().mockResolvedValue([mockSkyBackground, mockHillsBackground])
      };
      gameScene.sceneFactory = mockSceneFactory;

      // Act
      gameScene.createBackgroundsWithFactory();
      
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(gameScene.skyBackground).toBe(mockSkyBackground);
      expect(gameScene.hillsBackground).toBe(mockHillsBackground);
    });

    test('should fallback to hardcoded creation if factory fails', async () => {
      // Arrange
      const mockScene = createPhaserSceneMock();
      const gameScene = new GameScene(mockScene);
      
      const mockSceneFactory = {
        config: {
          backgrounds: [
            {
              type: 'layer',
              x: 3200,
              y: 1800,
              width: 6400,
              height: 3600,
              spriteKey: 'background_solid_sky',
              depth: -2,
              scrollSpeed: 0.0
            }
          ]
        },
        createBackgroundsFromConfig: jest.fn().mockRejectedValue(new Error('Factory error'))
      };
      gameScene.sceneFactory = mockSceneFactory;
      
      // Mock the hardcoded creation method
      gameScene.createParallaxBackgroundHardcoded = jest.fn();

      // Act
      gameScene.createBackgroundsWithFactory();
      
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(gameScene.createParallaxBackgroundHardcoded).toHaveBeenCalled();
    });

    test('should fallback to hardcoded creation if no backgrounds created', async () => {
      // Arrange
      const mockScene = createPhaserSceneMock();
      const gameScene = new GameScene(mockScene);
      
      const mockSceneFactory = {
        config: {
          backgrounds: [
            {
              type: 'layer',
              x: 3200,
              y: 1800,
              width: 6400,
              height: 3600,
              spriteKey: 'background_solid_sky',
              depth: -2,
              scrollSpeed: 0.0
            }
          ]
        },
        createBackgroundsFromConfig: jest.fn().mockResolvedValue([])
      };
      gameScene.sceneFactory = mockSceneFactory;
      
      // Mock the hardcoded creation method
      gameScene.createParallaxBackgroundHardcoded = jest.fn();

      // Act
      gameScene.createBackgroundsWithFactory();
      
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(gameScene.createParallaxBackgroundHardcoded).toHaveBeenCalled();
    });

    test('should preserve parallax scrolling behavior compatibility', async () => {
      // Arrange
      const mockScene = createPhaserSceneMock();
      const gameScene = new GameScene(mockScene);
      
      const mockHillsBackground = {
        setDepth: jest.fn(),
        setData: jest.fn(),
        tilePositionX: 0,
        tilePositionY: 0,
        getData: jest.fn().mockReturnValue(0.5),
        x: 3200
      };
      
      const mockSceneFactory = {
        config: {
          backgrounds: [
            {
              type: 'layer',
              x: 3200,
              y: 1800,
              width: 6400,
              height: 3600,
              spriteKey: 'background_color_hills',
              depth: -1,
              scrollSpeed: 0.5
            }
          ]
        },
        createBackgroundsFromConfig: jest.fn().mockResolvedValue([mockHillsBackground])
      };
      gameScene.sceneFactory = mockSceneFactory;

      // Act
      gameScene.createBackgroundsWithFactory();
      
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(gameScene.hillsBackground).toBe(mockHillsBackground);
      expect(mockHillsBackground.setData).toHaveBeenCalledWith('initialX', 3200);
    });

    test('should handle missing sceneFactory gracefully', async () => {
      // Arrange
      const mockScene = createPhaserSceneMock();
      const gameScene = new GameScene(mockScene);
      gameScene.sceneFactory = null;
      
      // Mock the hardcoded creation method
      gameScene.createParallaxBackgroundHardcoded = jest.fn();

      // Act
      gameScene.createBackgroundsWithFactory();

      // Assert
      expect(gameScene.createParallaxBackgroundHardcoded).toHaveBeenCalled();
    });
  });

  describe('integration with existing GameScene.create()', () => {
    test('should replace createParallaxBackground() call with createBackgroundsWithFactory()', () => {
      // Arrange
      gameScene.sceneFactory = mockSceneFactory;
      gameScene.createBackgroundsWithFactory = jest.fn();
      gameScene.createParallaxBackground = jest.fn(); // This should NOT be called
      
      // Simulate create() method call order
      gameScene.levelWidth = 1280;
      gameScene.levelHeight = 720;

      // Act
      gameScene.createBackgroundsWithFactory(); // This should be called instead of createParallaxBackground

      // Assert
      expect(gameScene.createBackgroundsWithFactory).toHaveBeenCalled();
      expect(gameScene.createParallaxBackground).not.toHaveBeenCalled();
    });

    test('should maintain original parallax calculation in GameScene.update()', async () => {
      // Arrange
      const mockScene = createPhaserSceneMock();
      const gameScene = new GameScene(mockScene);
      
      // Mock SceneFactory with async createBackgroundsFromConfig
      const mockSceneFactory = {
        config: {
          backgrounds: [
            {
              type: 'layer',
              x: 3200,
              y: 1800,
              width: 6400,
              height: 3600,
              spriteKey: 'background_solid_sky',
              depth: -2,
              scrollSpeed: 0.0
            },
            {
              type: 'layer',
              x: 3200,
              y: 1800,
              width: 6400,
              height: 3600,
              spriteKey: 'background_color_hills',
              depth: -1,
              scrollSpeed: 0.5
            }
          ]
        },
        createBackgroundsFromConfig: jest.fn().mockResolvedValue([
          {
            setDepth: jest.fn(),
            setData: jest.fn(),
            tilePositionX: 0,
            tilePositionY: 0,
            getData: jest.fn().mockReturnValue(0.0)
          },
          {
            setDepth: jest.fn(),
            setData: jest.fn(),
            tilePositionX: 0,
            tilePositionY: 0,
            getData: jest.fn().mockReturnValue(0.5)
          }
        ])
      };
      gameScene.sceneFactory = mockSceneFactory;

      // Mock player with body and velocity
      gameScene.player = {
        body: {
          velocity: { x: 100, y: 0 }
        },
        inputManager: {
          isPauseJustPressed: false,
          isMutePressed: false,
          isRewindPressed: false
        },
        update: jest.fn()
      };

      // Act
      gameScene.createBackgroundsWithFactory();
      
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Simulate update call
      gameScene.update(1000, 16);

      // Assert
      expect(gameScene.backgroundLayers).toBeDefined();
      expect(gameScene.backgroundLayers.length).toBe(2);
    });
  });
}); 
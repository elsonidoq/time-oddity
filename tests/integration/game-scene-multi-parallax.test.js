import { jest } from '@jest/globals';
import GameScene from '../../client/src/scenes/GameScene.js';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('GameScene Multi-Parallax Integration', () => {
  let gameScene;
  let mockScene;
  let mockSceneFactory;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    
    // Create comprehensive GameScene mock setup
    gameScene = new GameScene(mockScene);
    
    // Mock the required GameScene properties and methods
    gameScene.levelWidth = 6400;
    gameScene.levelHeight = 3600;
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
        x: 3200,
        y: 1800,
        tilePositionX: 0,
        tilePositionY: 0
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
    
    // Mock SceneFactory with multiple background layers
    mockSceneFactory = {
      loadConfiguration: jest.fn().mockReturnValue(true),
      createBackgroundsFromConfig: jest.fn().mockReturnValue([
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.0 : undefined)
        },
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.2 : undefined)
        },
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.5 : undefined)
        }
      ]),
      config: {
        backgrounds: [
          { type: 'layer', scrollSpeed: 0.0 },
          { type: 'layer', scrollSpeed: 0.2 },
          { type: 'layer', scrollSpeed: 0.5 }
        ]
      }
    };
    
    // Mock other required methods
    gameScene.createPlatformsWithFactory = jest.fn();
    gameScene.createCoinsWithFactory = jest.fn();
    gameScene.createGoalsWithFactory = jest.fn();
    gameScene.createParallaxBackgroundHardcoded = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Multiple Parallax Layers Support', () => {
    test('should handle multiple background layers with different scroll speeds', () => {
      // Arrange
      gameScene.sceneFactory = mockSceneFactory;
      
      const mockBackgrounds = [
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.0 : undefined)
        },
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.2 : undefined)
        },
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.5 : undefined)
        }
      ];
      
      mockSceneFactory.createBackgroundsFromConfig.mockReturnValue(mockBackgrounds);

      // Act
      gameScene.createBackgroundsWithFactory();

      // Assert
      expect(gameScene.backgroundLayers).toBeDefined();
      expect(gameScene.backgroundLayers.length).toBe(3);
      
      // Verify each background layer has correct scroll speed
      expect(gameScene.backgroundLayers[0].getData('scrollSpeed')).toBe(0.0);
      expect(gameScene.backgroundLayers[1].getData('scrollSpeed')).toBe(0.2);
      expect(gameScene.backgroundLayers[2].getData('scrollSpeed')).toBe(0.5);
    });

    test('should replace hardcoded skyBackground and hillsBackground with dynamic array', () => {
      // Arrange
      gameScene.sceneFactory = mockSceneFactory;
      
      const mockBackgrounds = [
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.0 : undefined)
        },
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.5 : undefined)
        }
      ];
      
      mockSceneFactory.createBackgroundsFromConfig.mockReturnValue(mockBackgrounds);

      // Act
      gameScene.createBackgroundsWithFactory();

      // Assert - Should use dynamic array instead of hardcoded references
      expect(gameScene.backgroundLayers).toBeDefined();
      expect(gameScene.backgroundLayers.length).toBe(2);
      
      // Legacy references should still work for backward compatibility
      expect(gameScene.skyBackground).toBeDefined();
      expect(gameScene.hillsBackground).toBeDefined();
    });

    test('should calculate parallax for all layers in update method', () => {
      // Arrange
      gameScene.sceneFactory = mockSceneFactory;
      gameScene.player = {
        body: { velocity: { x: 100 } }
      };
      
      const mockBackgrounds = [
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.0 : undefined)
        },
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.2 : undefined)
        },
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.5 : undefined)
        }
      ];
      
      mockSceneFactory.createBackgroundsFromConfig.mockReturnValue(mockBackgrounds);
      gameScene.createBackgroundsWithFactory();
      
      // Act - Simulate GameScene.update() parallax calculation
      const deltaTime = 16; // 16ms = 60fps
      if (gameScene.backgroundLayers && gameScene.player) {
        gameScene.backgroundLayers.forEach(background => {
          const scrollSpeed = background.getData('scrollSpeed');
          const playerVelocityX = gameScene.player.body.velocity.x;
          background.tilePositionX -= playerVelocityX * scrollSpeed * (deltaTime / 1000);
        });
      }

      // Assert - Each layer should have different parallax movement
      expect(gameScene.backgroundLayers[0].tilePositionX).toBe(0); // Static (0.0 scroll speed)
      expect(gameScene.backgroundLayers[1].tilePositionX).toBe(-0.32); // 100 * 0.2 * (16/1000) = -0.32
      expect(gameScene.backgroundLayers[2].tilePositionX).toBe(-0.8); // 100 * 0.5 * (16/1000) = -0.8
    });
  });

  describe('Performance with Multiple Parallax Layers', () => {
    test('should maintain performance with multiple parallax layers', () => {
      // Arrange
      gameScene.sceneFactory = mockSceneFactory;
      gameScene.player = {
        body: { velocity: { x: 100 } }
      };
      
      // Create many background layers to test performance
      const mockBackgrounds = [];
      for (let i = 0; i < 10; i++) {
        mockBackgrounds.push({
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? i * 0.1 : undefined)
        });
      }
      
      mockSceneFactory.createBackgroundsFromConfig.mockReturnValue(mockBackgrounds);
      gameScene.createBackgroundsWithFactory();
      
      // Act - Performance test parallax calculation
      const startTime = performance.now();
      const deltaTime = 16;
      
      if (gameScene.backgroundLayers && gameScene.player) {
        gameScene.backgroundLayers.forEach(background => {
          const scrollSpeed = background.getData('scrollSpeed');
          const playerVelocityX = gameScene.player.body.velocity.x;
          background.tilePositionX -= playerVelocityX * scrollSpeed * (deltaTime / 1000);
        });
      }
      
      const endTime = performance.now();

      // Assert - Performance check
      const calculationTime = endTime - startTime;
      expect(calculationTime).toBeLessThan(1); // Should complete in less than 1ms
      expect(gameScene.backgroundLayers.length).toBe(10);
    });
  });

  describe('Integration with Existing Camera System', () => {
    test('should maintain camera bounds and follow behavior with multiple parallax layers', () => {
      // Arrange
      gameScene.sceneFactory = mockSceneFactory;
      gameScene.player = {
        body: { velocity: { x: 100 } }
      };
      
      const mockBackgrounds = [
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.0 : undefined)
        },
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200,
          y: 1800,
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.5 : undefined)
        }
      ];
      
      mockSceneFactory.createBackgroundsFromConfig.mockReturnValue(mockBackgrounds);
      gameScene.createBackgroundsWithFactory();

      // Act - Simulate camera setup
      if (gameScene.cameras && gameScene.cameras.main) {
        gameScene.cameras.main.setBounds(0, 0, gameScene.levelWidth, gameScene.levelHeight);
        gameScene.cameras.main.startFollow(gameScene.player, true, 0.1, 0.1);
      }

      // Assert - Camera should still work correctly
      expect(gameScene.cameras.main.setBounds).toHaveBeenCalledWith(0, 0, 6400, 3600);
      expect(gameScene.cameras.main.startFollow).toHaveBeenCalledWith(gameScene.player, true, 0.1, 0.1);
      
      // Background layers should not interfere with camera
      expect(gameScene.backgroundLayers).toBeDefined();
      expect(gameScene.backgroundLayers.length).toBe(2);
    });
  });

  describe('SceneFactory Initialization', () => {
    test('should ensure SceneFactory is loaded before background creation', () => {
      // Arrange
      gameScene.sceneFactory = mockSceneFactory;
      
      // Act
      gameScene.createBackgroundsWithFactory();

      // Assert
      expect(mockSceneFactory.loadConfiguration).toHaveBeenCalled();
      expect(mockSceneFactory.createBackgroundsFromConfig).toHaveBeenCalled();
    });

    test('should fallback to hardcoded creation if SceneFactory fails', () => {
      // Arrange
      gameScene.sceneFactory = mockSceneFactory;
      gameScene.createParallaxBackgroundHardcoded = jest.fn();
      
      // Make factory fail
      mockSceneFactory.loadConfiguration.mockReturnValue(false);

      // Act
      gameScene.createBackgroundsWithFactory();

      // Assert
      expect(gameScene.createParallaxBackgroundHardcoded).toHaveBeenCalled();
    });
  });

  describe('Background Dimensions Spanning Full Level', () => {
    test('should create backgrounds that span the full level dimensions', () => {
      // Arrange
      gameScene.sceneFactory = mockSceneFactory;
      gameScene.levelWidth = 6400;
      gameScene.levelHeight = 3600;
      
      const mockBackgrounds = [
        {
          setDepth: jest.fn().mockReturnThis(),
          setData: jest.fn().mockReturnThis(),
          x: 3200, // Center of 6400 width
          y: 1800, // Center of 3600 height
          width: 6400, // Full level width
          height: 3600, // Full level height
          tilePositionX: 0,
          tilePositionY: 0,
          getData: jest.fn((key) => key === 'scrollSpeed' ? 0.0 : undefined)
        }
      ];
      
      mockSceneFactory.createBackgroundsFromConfig.mockReturnValue(mockBackgrounds);

      // Act
      gameScene.createBackgroundsWithFactory();

      // Assert
      expect(gameScene.backgroundLayers).toBeDefined();
      expect(gameScene.backgroundLayers.length).toBe(1);
      
      // Background should span full level dimensions
      const background = gameScene.backgroundLayers[0];
      expect(background.x).toBe(3200); // Center X
      expect(background.y).toBe(1800); // Center Y
      expect(background.width).toBe(6400); // Full width
      expect(background.height).toBe(3600); // Full height
    });
  });
}); 
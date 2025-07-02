/**
 * Platform Tile Rendering Integration Tests
 * 
 * Comprehensive integration tests to verify that all platform types render correctly
 * with the new tile prefix system. Tests the interaction between SceneFactory,
 * TileSelector, and platform entities to ensure proper tile selection and placement.
 * 
 * Coverage:
 * - All platform types (ground, floating, moving)
 * - Single-tile and multi-tile scenarios
 * - Correct tile keys for each position (left, center/middle, right)
 * - Edge cases (2 tiles, many tiles)
 * - Performance verification
 */

import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { TileSelector } from '../../client/src/systems/TileSelector.js';
import MovingPlatform from '../../client/src/entities/MovingPlatform.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('Platform Tile Rendering Integration Tests', () => {
  let sceneFactory;
  let mockScene;
  let mockPlatformsGroup;
  let createdPlatforms;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    sceneFactory = new SceneFactory(mockScene);
    
    // Track created platforms for verification
    createdPlatforms = [];
    
    // Mock platforms group with detailed tracking
    mockPlatformsGroup = {
      create: jest.fn((x, y, texture, frame) => {
        const platform = {
          x,
          y,
          texture,
          frame,
          setOrigin: jest.fn().mockReturnThis(),
          body: {
            setImmovable: jest.fn(),
            setAllowGravity: jest.fn(),
            setSize: jest.fn(),
            setOffset: jest.fn(),
            setFriction: jest.fn(),
            setBounce: jest.fn(),
            setCollideWorldBounds: jest.fn()
          },
          width: 64,
          height: 64,
          active: true,
          visible: true
        };
        createdPlatforms.push(platform);
        return platform;
      }),
      add: jest.fn((platform) => {
        createdPlatforms.push(platform);
        return platform;
      }),
      getChildren: jest.fn(() => createdPlatforms)
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    createdPlatforms.length = 0;
  });

  describe('Ground Platform Tile Rendering', () => {
    test('should render single ground tile with base prefix', () => {
      const config = {
        type: 'ground',
        x: 100,
        y: 500,
        width: 64,
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(config, mockPlatformsGroup);

      expect(platforms).toHaveLength(1);
      expect(platforms[0].frame).toBe('terrain_grass_horizontal');
      expect(platforms[0].x).toBe(100);
      expect(platforms[0].y).toBe(500);
    });

    test('should render two ground tiles with left and right variants', () => {
      const config = {
        type: 'ground',
        x: 200,
        y: 400,
        width: 128, // Two tiles
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(config, mockPlatformsGroup);

      expect(platforms).toHaveLength(2);
      expect(platforms[0].frame).toBe('terrain_grass_horizontal_left');
      expect(platforms[0].x).toBe(200);
      expect(platforms[1].frame).toBe('terrain_grass_horizontal_right');
      expect(platforms[1].x).toBe(264);
    });

    test('should render three ground tiles with left, middle, right sequence', () => {
      const config = {
        type: 'ground',
        x: 0,
        y: 600,
        width: 192, // Three tiles
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(config, mockPlatformsGroup);

      expect(platforms).toHaveLength(3);
      expect(platforms[0].frame).toBe('terrain_grass_horizontal_left');
      expect(platforms[0].x).toBe(0);
      expect(platforms[1].frame).toBe('terrain_grass_horizontal_middle');
      expect(platforms[1].x).toBe(64);
      expect(platforms[2].frame).toBe('terrain_grass_horizontal_right');
      expect(platforms[2].x).toBe(128);
    });

    test('should render many ground tiles with correct middle tile repetition', () => {
      const config = {
        type: 'ground',
        x: 300,
        y: 700,
        width: 320, // Five tiles
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(config, mockPlatformsGroup);

      expect(platforms).toHaveLength(5);
      expect(platforms[0].frame).toBe('terrain_grass_horizontal_left');
      expect(platforms[1].frame).toBe('terrain_grass_horizontal_middle');
      expect(platforms[2].frame).toBe('terrain_grass_horizontal_middle');
      expect(platforms[3].frame).toBe('terrain_grass_horizontal_middle');
      expect(platforms[4].frame).toBe('terrain_grass_horizontal_right');
      
      // Verify positions
      for (let i = 0; i < 5; i++) {
        expect(platforms[i].x).toBe(300 + (i * 64));
        expect(platforms[i].y).toBe(700);
      }
    });
  });

  describe('Floating Platform Tile Rendering', () => {
    test('should render single floating tile with base prefix', () => {
      const config = {
        type: 'floating',
        x: 150,
        y: 300,
        width: 64,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platform = sceneFactory.createFloatingPlatform(config, mockPlatformsGroup);

      expect(platform).toBeDefined();
      expect(platform.frame).toBe('terrain_grass_block');
      expect(platform.x).toBe(150);
      expect(platform.y).toBe(300);
    });

    test('should render two floating tiles with left and right variants', () => {
      const config = {
        type: 'floating',
        x: 250,
        y: 200,
        width: 128, // Two tiles
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(config, mockPlatformsGroup);

      expect(Array.isArray(platforms)).toBe(true);
      expect(platforms).toHaveLength(2);
      expect(platforms[0].frame).toBe('terrain_grass_block_left');
      expect(platforms[0].x).toBe(250);
      expect(platforms[1].frame).toBe('terrain_grass_block_right');
      expect(platforms[1].x).toBe(314);
    });

    test('should render three floating tiles with left, center, right sequence', () => {
      const config = {
        type: 'floating',
        x: 400,
        y: 250,
        width: 192, // Three tiles
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(config, mockPlatformsGroup);

      expect(Array.isArray(platforms)).toBe(true);
      expect(platforms).toHaveLength(3);
      expect(platforms[0].frame).toBe('terrain_grass_block_left');
      expect(platforms[0].x).toBe(400);
      expect(platforms[1].frame).toBe('terrain_grass_block_center');
      expect(platforms[1].x).toBe(464);
      expect(platforms[2].frame).toBe('terrain_grass_block_right');
      expect(platforms[2].x).toBe(528);
    });

    test('should render many floating tiles with correct center tile repetition', () => {
      const config = {
        type: 'floating',
        x: 100,
        y: 150,
        width: 256, // Four tiles
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(config, mockPlatformsGroup);

      expect(Array.isArray(platforms)).toBe(true);
      expect(platforms).toHaveLength(4);
      expect(platforms[0].frame).toBe('terrain_grass_block_left');
      expect(platforms[1].frame).toBe('terrain_grass_block_center');
      expect(platforms[2].frame).toBe('terrain_grass_block_center');
      expect(platforms[3].frame).toBe('terrain_grass_block_right');
    });
  });

  describe('Moving Platform Tile Rendering', () => {
    test('should render single moving platform tile with base prefix', () => {
      const config = {
        type: 'moving',
        x: 500,
        y: 400,
        tilePrefix: 'terrain_grass_cloud',
        isFullBlock: true,
        movement: {
          type: 'linear',
          startX: 500,
          startY: 400,
          endX: 700,
          endY: 400,
          speed: 80,
          autoStart: false
        }
      };

      const platform = sceneFactory.createMovingPlatform(config, mockPlatformsGroup);

      expect(platform).toBeInstanceOf(MovingPlatform);
      expect(platform.sprites).toHaveLength(1);
      expect(platform.sprites[0].frame).toBe('terrain_grass_cloud');
      expect(platform.x).toBe(500);
      expect(platform.y).toBe(400);
    });

    test('should render two moving platform tiles with left and right variants', () => {
      const config = {
        type: 'moving',
        x: 600,
        y: 300,
        width: 128, // Two tiles
        tilePrefix: 'terrain_grass_cloud',
        isFullBlock: true,
        movement: {
          type: 'linear',
          startX: 600,
          startY: 300,
          endX: 800,
          endY: 300,
          speed: 60,
          autoStart: false
        }
      };

      const platform = sceneFactory.createMovingPlatform(config, mockPlatformsGroup);

      expect(platform).toBeInstanceOf(MovingPlatform);
      expect(platform.sprites).toHaveLength(2);
      expect(platform.sprites[0].frame).toBe('terrain_grass_cloud_left');
      expect(platform.sprites[0].x).toBe(600);
      expect(platform.sprites[1].frame).toBe('terrain_grass_cloud_right');
      expect(platform.sprites[1].x).toBe(664);
    });

    test('should render three moving platform tiles with left, center, right sequence', () => {
      const config = {
        type: 'moving',
        x: 700,
        y: 200,
        width: 192, // Three tiles
        tilePrefix: 'terrain_grass_cloud',
        isFullBlock: true,
        movement: {
          type: 'linear',
          startX: 700,
          startY: 200,
          endX: 900,
          endY: 200,
          speed: 70,
          autoStart: false
        }
      };

      const platform = sceneFactory.createMovingPlatform(config, mockPlatformsGroup);

      expect(platform).toBeInstanceOf(MovingPlatform);
      expect(platform.sprites).toHaveLength(3);
      expect(platform.sprites[0].frame).toBe('terrain_grass_cloud_left');
      expect(platform.sprites[0].x).toBe(700);
      expect(platform.sprites[1].frame).toBe('terrain_grass_cloud_middle');
      expect(platform.sprites[1].x).toBe(764);
      expect(platform.sprites[2].frame).toBe('terrain_grass_cloud_right');
      expect(platform.sprites[2].x).toBe(828);
    });

    test('should render many moving platform tiles with correct center tile repetition', () => {
      const config = {
        type: 'moving',
        x: 800,
        y: 100,
        width: 320, // Five tiles
        tilePrefix: 'terrain_grass_cloud',
        isFullBlock: true,
        movement: {
          type: 'linear',
          startX: 800,
          startY: 100,
          endX: 1000,
          endY: 100,
          speed: 90,
          autoStart: false
        }
      };

      const platform = sceneFactory.createMovingPlatform(config, mockPlatformsGroup);

      expect(platform).toBeInstanceOf(MovingPlatform);
      expect(platform.sprites).toHaveLength(5);
      expect(platform.sprites[0].frame).toBe('terrain_grass_cloud_left');
      expect(platform.sprites[1].frame).toBe('terrain_grass_cloud_middle');
      expect(platform.sprites[2].frame).toBe('terrain_grass_cloud_middle');
      expect(platform.sprites[3].frame).toBe('terrain_grass_cloud_middle');
      expect(platform.sprites[4].frame).toBe('terrain_grass_cloud_right');
      
      // Verify positions
      for (let i = 0; i < 5; i++) {
        expect(platform.sprites[i].x).toBe(800 + (i * 64));
        expect(platform.sprites[i].y).toBe(100);
      }
    });
  });

  describe('Mixed Platform Configuration Integration', () => {
    test('should create complete level with all platform types using correct tile variants', () => {
      const levelConfig = {
        platforms: [
          // Single-tile ground
          {
            type: 'ground',
            x: 0,
            y: 600,
            width: 64,
            tilePrefix: 'terrain_grass_horizontal',
            isFullBlock: true
          },
          // Multi-tile floating platform
          {
            type: 'floating',
            x: 200,
            y: 400,
            width: 192,
            tilePrefix: 'terrain_grass_block',
            isFullBlock: true
          },
          // Multi-tile moving platform
          {
            type: 'moving',
            x: 500,
            y: 300,
            width: 128,
            tilePrefix: 'terrain_grass_cloud',
            isFullBlock: true,
            movement: {
              type: 'linear',
              startX: 500,
              startY: 300,
              endX: 700,
              endY: 300,
              speed: 50,
              autoStart: false
            }
          }
        ]
      };

      sceneFactory.loadConfiguration(levelConfig);
      const allPlatforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);

      // Should create: 1 ground + 3 floating + 1 moving platform (MovingPlatform instance)
      expect(allPlatforms).toHaveLength(5);
      
      // Verify ground platform (single tile)
      const groundPlatforms = allPlatforms.slice(0, 1);
      expect(groundPlatforms[0].frame).toBe('terrain_grass_horizontal');
      
      // Verify floating platforms (3 tiles)
      const floatingPlatforms = allPlatforms.slice(1, 4);
      expect(floatingPlatforms[0].frame).toBe('terrain_grass_block_left');
      expect(floatingPlatforms[1].frame).toBe('terrain_grass_block_center');
      expect(floatingPlatforms[2].frame).toBe('terrain_grass_block_right');
      
      // Verify moving platform (MovingPlatform with 2 sprites)
      const movingPlatform = allPlatforms[4];
      expect(movingPlatform).toBeInstanceOf(MovingPlatform);
      expect(movingPlatform.sprites).toHaveLength(2);
      expect(movingPlatform.sprites[0].frame).toBe('terrain_grass_cloud_left');
      expect(movingPlatform.sprites[1].frame).toBe('terrain_grass_cloud_right');
    });
  });

  describe('Tile Naming Convention Verification', () => {
    test('should use correct naming convention for block-style prefixes', () => {
      const blockConfig = {
        type: 'floating',
        x: 100,
        y: 200,
        width: 192, // Three tiles
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(blockConfig, mockPlatformsGroup);

      expect(platforms[0].frame).toBe('terrain_grass_block_left');
      expect(platforms[1].frame).toBe('terrain_grass_block_center'); // Block style uses "center"
      expect(platforms[2].frame).toBe('terrain_grass_block_right');
    });

    test('should use correct naming convention for horizontal-style prefixes', () => {
      const horizontalConfig = {
        type: 'ground',
        x: 200,
        y: 500,
        width: 192, // Three tiles
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(horizontalConfig, mockPlatformsGroup);

      expect(platforms[0].frame).toBe('terrain_grass_horizontal_left');
      expect(platforms[1].frame).toBe('terrain_grass_horizontal_middle'); // Horizontal style uses "middle"
      expect(platforms[2].frame).toBe('terrain_grass_horizontal_right');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle missing tilePrefix gracefully', () => {
      const invalidConfig = {
        type: 'ground',
        x: 100,
        y: 500,
        width: 128
        // Missing tilePrefix
      };

      const result = sceneFactory.createGroundPlatform(invalidConfig, mockPlatformsGroup);

      expect(result).toBeNull();
      expect(mockPlatformsGroup.create).not.toHaveBeenCalled();
    });

    test('should handle invalid platforms group gracefully', () => {
      const config = {
        type: 'floating',
        x: 100,
        y: 200,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const result = sceneFactory.createFloatingPlatform(config, null);

      expect(result).toBeNull();
    });

    test('should handle very large platform widths efficiently', () => {
      const largeConfig = {
        type: 'ground',
        x: 0,
        y: 500,
        width: 1280, // 20 tiles
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const startTime = performance.now();
      const platforms = sceneFactory.createGroundPlatform(largeConfig, mockPlatformsGroup);
      const endTime = performance.now();

      expect(platforms).toHaveLength(20);
      expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
      
      // Verify first and last tiles
      expect(platforms[0].frame).toBe('terrain_grass_horizontal_left');
      expect(platforms[19].frame).toBe('terrain_grass_horizontal_right');
    });
  });

  describe('Physics Configuration Integration', () => {
    test('should configure physics correctly for all platform types', () => {
      const configs = [
        {
          type: 'ground',
          x: 100,
          y: 500,
          width: 128,
          tilePrefix: 'terrain_grass_horizontal',
          isFullBlock: true
        },
        {
          type: 'floating',
          x: 300,
          y: 300,
          width: 128,
          tilePrefix: 'terrain_grass_block',
          isFullBlock: true
        }
      ];

      // Test ground platform physics
      const groundPlatforms = sceneFactory.createGroundPlatform(configs[0], mockPlatformsGroup);
      for (const platform of groundPlatforms) {
        expect(platform.body.setImmovable).toHaveBeenCalledWith(true);
        expect(platform.body.setAllowGravity).toHaveBeenCalledWith(false);
      }

      // Test floating platform physics
      const floatingPlatforms = sceneFactory.createFloatingPlatform(configs[1], mockPlatformsGroup);
      for (const platform of floatingPlatforms) {
        expect(platform.body.setImmovable).toHaveBeenCalledWith(true);
        expect(platform.body.setAllowGravity).toHaveBeenCalledWith(false);
      }
    });

    test('should configure moving platform master sprite physics correctly', () => {
      const config = {
        type: 'moving',
        x: 400,
        y: 300,
        width: 192,
        tilePrefix: 'terrain_grass_cloud',
        isFullBlock: true,
        movement: {
          type: 'linear',
          startX: 400,
          startY: 300,
          endX: 600,
          endY: 300,
          speed: 60,
          autoStart: false
        }
      };

      const platform = sceneFactory.createMovingPlatform(config, mockPlatformsGroup);

      // Verify MovingPlatform is created with correct physics configuration
      expect(platform).toBeInstanceOf(MovingPlatform);
      expect(platform.body).toBeDefined();
      expect(platform.body.setImmovable).toBeDefined();
      expect(platform.body.setAllowGravity).toBeDefined();
      
      // Verify multi-sprite configuration 
      expect(platform.sprites).toHaveLength(3);
      for (const sprite of platform.sprites) {
        expect(sprite.body).toBeDefined();
        expect(sprite.body.setImmovable).toBeDefined();
        expect(sprite.body.setAllowGravity).toBeDefined();
      }
    });
  });

  describe('Performance and Resource Management', () => {
    test('should create multiple platforms efficiently without memory leaks', () => {
      const multiPlatformConfig = {
        platforms: []
      };

      // Create 20 different platforms
      for (let i = 0; i < 20; i++) {
        multiPlatformConfig.platforms.push({
          type: 'floating',
          x: i * 100,
          y: 300,
          width: 128,
          tilePrefix: 'terrain_grass_block',
          isFullBlock: true
        });
      }

      sceneFactory.loadConfiguration(multiPlatformConfig);
      
      const startTime = performance.now();
      const allPlatforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      const endTime = performance.now();

      // Should create 40 individual platform sprites (20 platforms × 2 tiles each)
      expect(allPlatforms).toHaveLength(40);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
      
      // Verify all platforms have correct tile structure
      for (let i = 0; i < 40; i += 2) {
        expect(allPlatforms[i].frame).toBe('terrain_grass_block_left');
        expect(allPlatforms[i + 1].frame).toBe('terrain_grass_block_right');
      }
    });
  });

  test('initial test', () => {
    expect(true).toBe(true);
  });
}); 
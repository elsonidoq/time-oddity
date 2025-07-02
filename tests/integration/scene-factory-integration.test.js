import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import testLevelConfig from '../../client/src/config/test-level.json';

describe('SceneFactory + GameScene Integration', () => {
  let mockScene;
  let sceneFactory;
  let mockPlatformsGroup;
  let mockCoinsGroup;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    
    // Create a mock platforms group that matches GameScene's physics group
    mockPlatformsGroup = {
      create: jest.fn((x, y, texture, frame) => ({
        x,
        y,
        texture,
        frame,
        setOrigin: jest.fn().mockReturnThis(),
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn()
        }
      })),
      add: jest.fn(),
      getChildren: jest.fn(() => [])
    };

    // Create a mock coins group for coin creation
    mockCoinsGroup = {
      add: jest.fn(),
      getChildren: jest.fn(() => [])
    };
    
    // Mock the physics.add.group to return our mock groups
    mockScene.physics.add.group = jest.fn((config) => {
      if (config && config.classType && config.classType.name === 'Coin') {
        return mockCoinsGroup;
      }
      return mockPlatformsGroup;
    });
    
    // Patch mockScene.physics.add.sprite for MovingPlatform and Coin
    mockScene.physics = mockScene.physics || {};
    mockScene.physics.add = mockScene.physics.add || {};
    mockScene.physics.add.sprite = jest.fn((x, y, texture, frame) => ({
      x,
      y,
      texture,
      frame: frame ? frame : 'block_coin_active',
      setOrigin: jest.fn().mockReturnThis(),
      body: {
        setImmovable: jest.fn(),
        setAllowGravity: jest.fn(function (allow) { this.allowGravity = allow; return this; }),
        setSize: jest.fn(),
        setOffset: jest.fn(),
        setFriction: jest.fn(),
        setBounce: jest.fn(),
        setCollideWorldBounds: jest.fn(),
        setVelocity: jest.fn(),
        velocity: { x: 0, y: 0 },
        touching: { up: false, down: false, left: false, right: false },
        allowGravity: false
      },
      anims: { play: jest.fn() },
      play: jest.fn(),
      visible: true,
      parentCoin: undefined
    }));
    
    sceneFactory = new SceneFactory(mockScene);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration Loading', () => {
    test('should load test level configuration successfully', () => {
      const result = sceneFactory.loadConfiguration(testLevelConfig);
      
      expect(result).toBe(true);
      expect(sceneFactory.config).toEqual(testLevelConfig);
    });

    test('should create all platforms from test level configuration', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      const groundConfigs = testLevelConfig.platforms.filter(p => p.type === 'ground');
      const expectedGroundTiles = groundConfigs.reduce((sum, config) => {
          return sum + Math.ceil(config.width / 64);
      }, 0);

      const floatingConfigs = testLevelConfig.platforms.filter(p => p.type === 'floating');
      const expectedFloatingPlatformTiles = floatingConfigs.reduce((sum, config) => {
        return sum + Math.ceil((config.width || 64) / 64);
      }, 0);

      const expectedCreateCalls = expectedGroundTiles + expectedFloatingPlatformTiles;
      expect(mockPlatformsGroup.create).toHaveBeenCalledTimes(expectedCreateCalls);
    });
  });

  describe('Platform Creation Integration', () => {
    test('should create ground platform with correct tile pattern', () => {
      const groundConfig = testLevelConfig.platforms.find(p => p.type === 'ground');
      const platforms = sceneFactory.createGroundPlatform(groundConfig, mockPlatformsGroup);
      
      expect(platforms).toBeDefined();
      expect(platforms.length).toBe(Math.ceil(groundConfig.width / 64));
      
      // Verify first and last tiles are positioned correctly
      expect(platforms[0].x).toBe(groundConfig.x);
      expect(platforms[0].y).toBe(groundConfig.y);
      const lastTileIndex = Math.ceil(groundConfig.width / 64) - 1;
      expect(platforms[lastTileIndex].x).toBe(groundConfig.x + (lastTileIndex * 64));
    });

    test('should create floating platforms with correct positions', () => {
      const floatingConfigs = testLevelConfig.platforms.filter(p => p.type === 'floating');
      
      for (const config of floatingConfigs) {
        const platform = sceneFactory.createFloatingPlatform(config, mockPlatformsGroup);
        expect(platform).toBeDefined();
        
        // Handle both single platform and array of platforms (when width is specified)
        if (Array.isArray(platform)) {
          // Multi-tile platform - check first tile
          expect(platform[0].x).toBe(config.x);
          expect(platform[0].y).toBe(config.y);
          expect(platform[0].texture).toBe('tiles');
          // For multi-tile platforms, check the first tile frame
          if (Array.isArray(platform)) {
            expect(platform[0].frame).toBe(config.tilePrefix + '_left');
          } else {
            expect(platform.frame).toBe(config.tilePrefix);
          }
        } else {
          // Single tile platform
          expect(platform.x).toBe(config.x);
          expect(platform.y).toBe(config.y);
          expect(platform.texture).toBe('tiles');
          expect(platform.frame).toBe(config.tilePrefix);
        }
      }
    });
  });

  describe('Coin Creation Integration', () => {
    test('should create coin with correct configuration', () => {
      const coinConfig = {
        type: 'coin',
        x: 400,
        y: 300,
        properties: {
          value: 100
        }
      };

      const coin = sceneFactory.createCoin(coinConfig, mockCoinsGroup);
      
      expect(coin).toBeDefined();
      expect(coin.x).toBe(coinConfig.x);
      expect(coin.y).toBe(coinConfig.y);
      expect(coin.texture).toBe('coin_spin');
      expect(coin.frame).toBe('block_coin_active');
      expect(mockCoinsGroup.add).toHaveBeenCalledWith(coin);
    });

    test('should create multiple coins from configuration array', () => {
      const coinConfigs = [
        {
          type: 'coin',
          x: 400,
          y: 450,
          properties: { value: 100 }
        },
        {
          type: 'coin',
          x: 500,
          y: 450,
          properties: { value: 100 }
        },
        {
          type: 'coin',
          x: 600,
          y: 350,
          properties: { value: 100 }
        }
      ];

      const coins = sceneFactory.createCoinsFromConfig(coinConfigs, mockCoinsGroup);
      
      expect(coins).toBeDefined();
      expect(coins.length).toBe(3);
      expect(mockCoinsGroup.add).toHaveBeenCalledTimes(3);
      
      // Verify each coin was created with correct position
      expect(coins[0].x).toBe(400);
      expect(coins[0].y).toBe(450);
      expect(coins[1].x).toBe(500);
      expect(coins[1].y).toBe(450);
      expect(coins[2].x).toBe(600);
      expect(coins[2].y).toBe(350);
    });

    test('should handle coin configuration with default value', () => {
      const coinConfig = {
        type: 'coin',
        x: 400,
        y: 300
        // No properties specified, should use default value
      };

      const coin = sceneFactory.createCoin(coinConfig, mockCoinsGroup);
      
      expect(coin).toBeDefined();
      expect(coin.x).toBe(coinConfig.x);
      expect(coin.y).toBe(coinConfig.y);
      expect(mockCoinsGroup.add).toHaveBeenCalledWith(coin);
    });

    test('should handle invalid coin configuration gracefully', () => {
      const invalidConfig = {
        type: 'coin',
        // Missing x, y coordinates
        properties: { value: 100 }
      };

      const coin = sceneFactory.createCoin(invalidConfig, mockCoinsGroup);
      
      expect(coin).toBeNull();
      expect(mockCoinsGroup.add).not.toHaveBeenCalled();
    });

    test('should handle missing coins group gracefully', () => {
      const coinConfig = {
        type: 'coin',
        x: 400,
        y: 300,
        properties: { value: 100 }
      };

      const coin = sceneFactory.createCoin(coinConfig, null);
      
      expect(coin).toBeNull();
    });

    test('should create coins from level configuration', () => {
      const configWithCoins = {
        platforms: testLevelConfig.platforms,
        coins: [
          {
            type: 'coin',
            x: 400,
            y: 450,
            properties: { value: 100 }
          },
          {
            type: 'coin',
            x: 500,
            y: 450,
            properties: { value: 100 }
          }
        ]
      };

      sceneFactory.loadConfiguration(configWithCoins);
      const coins = sceneFactory.createCoinsFromConfig(configWithCoins.coins, mockCoinsGroup);
      
      expect(coins).toBeDefined();
      expect(coins.length).toBe(2);
      expect(mockCoinsGroup.add).toHaveBeenCalledTimes(2);
    });
  });

  describe('Physics Configuration Integration', () => {
    test('should configure ground platform physics correctly', () => {
      const groundConfig = testLevelConfig.platforms.find(p => p.type === 'ground');
      const mockPlatform = {
        setOrigin: jest.fn().mockReturnThis(),
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn()
        }
      };
      
      mockPlatformsGroup.create = jest.fn(() => mockPlatform);
      
      sceneFactory.createGroundPlatform(groundConfig, mockPlatformsGroup);
      
      expect(mockPlatform.body.setImmovable).toHaveBeenCalledWith(true);
      expect(mockPlatform.body.setAllowGravity).toHaveBeenCalledWith(false);
      expect(mockPlatform.body.setSize).toHaveBeenCalled();
      expect(mockPlatform.body.setOffset).toHaveBeenCalled();
    });

    test('should configure floating platform physics correctly', () => {
      const floatingConfig = testLevelConfig.platforms.find(p => p.type === 'floating');
      const mockPlatform = {
        setOrigin: jest.fn().mockReturnThis(),
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn()
        }
      };
      
      mockPlatformsGroup.create = jest.fn(() => mockPlatform);
      
      const result = sceneFactory.createFloatingPlatform(floatingConfig, mockPlatformsGroup);
      
      // Handle both single platform and array of platforms
      if (Array.isArray(result)) {
        // Multi-tile platform - check that physics was configured for each tile
        expect(mockPlatform.body.setImmovable).toHaveBeenCalledWith(true);
        expect(mockPlatform.body.setAllowGravity).toHaveBeenCalledWith(false);
        expect(mockPlatform.body.setSize).toHaveBeenCalled();
        expect(mockPlatform.body.setOffset).toHaveBeenCalled();
      } else {
        // Single tile platform
        expect(mockPlatform.body.setImmovable).toHaveBeenCalledWith(true);
        expect(mockPlatform.body.setAllowGravity).toHaveBeenCalledWith(false);
        expect(mockPlatform.body.setSize).toHaveBeenCalled();
        expect(mockPlatform.body.setOffset).toHaveBeenCalled();
      }
    });

    test('should configure coin physics correctly', () => {
      const coinConfig = {
        type: 'coin',
        x: 400,
        y: 300,
        properties: { value: 100 }
      };

      const mockCoin = {
        setOrigin: jest.fn().mockReturnThis(),
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn()
        }
      };

      mockScene.physics.add.sprite = jest.fn(() => mockCoin);
      
      sceneFactory.createCoin(coinConfig, mockCoinsGroup);
      
      expect(mockCoin.body.setAllowGravity).toHaveBeenCalledWith(false);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle missing platforms group gracefully', () => {
      const groundConfig = testLevelConfig.platforms.find(p => p.type === 'ground');
      const result = sceneFactory.createGroundPlatform(groundConfig, null);
      
      expect(result).toBeNull();
    });

    test('should handle invalid configuration gracefully', () => {
      const invalidConfig = { platforms: [{ type: 'invalid', x: 0, y: 0 }] };
      sceneFactory.loadConfiguration(invalidConfig);
      const result = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      expect(result).toEqual([]);
    });

    test('should handle empty coins array gracefully', () => {
      const coins = sceneFactory.createCoinsFromConfig([], mockCoinsGroup);
      
      expect(coins).toEqual([]);
      expect(mockCoinsGroup.add).not.toHaveBeenCalled();
    });

    test('should handle null coins array gracefully', () => {
      const coins = sceneFactory.createCoinsFromConfig(null, mockCoinsGroup);
      
      expect(coins).toEqual([]);
      expect(mockCoinsGroup.add).not.toHaveBeenCalled();
    });
  });

  describe('Backward Compatibility', () => {
    test('should maintain same platform count as hardcoded version', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      const groundConfigs = testLevelConfig.platforms.filter(p => p.type === 'ground');
      const expectedGroundTiles = groundConfigs.reduce((sum, config) => sum + Math.ceil(config.width / 64), 0);

      const floatingConfigs = testLevelConfig.platforms.filter(p => p.type === 'floating');
      const expectedFloatingPlatformTiles = floatingConfigs.reduce((sum, config) => sum + Math.ceil((config.width || 64) / 64), 0);
      
      const movingConfigs = testLevelConfig.platforms.filter(p => p.type === 'moving');
      const expectedMovingPlatforms = movingConfigs.length;

      const expectedTotal = expectedGroundTiles + expectedFloatingPlatformTiles + expectedMovingPlatforms;
      
      expect(platforms.length).toBe(expectedTotal);
    });

    test('should maintain same platform positions as hardcoded version', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Get the expected floating platform positions from the config
      const floatingConfigs = testLevelConfig.platforms.filter(p => p.type === 'floating');
      expect(floatingConfigs.length).toBe(14);
      
      // Check that each floating platform was created at the correct position
      for (const config of floatingConfigs) {
        const found = platforms.find(p => p.x === config.x && p.y === config.y);
        expect(found).toBeDefined();
        expect(found.texture).toBe('tiles');
        
        // For multi-tile platforms, expect suffixed frames; for single tiles, expect base prefix
        const expectedFrame = config.width && config.width > 64 
          ? `${config.tilePrefix}_left` // Multi-tile platforms get suffixes
          : config.tilePrefix; // Single tile platforms use base prefix
        expect(found.frame).toBe(expectedFrame);
      }
    });

    test('should maintain backward compatibility with configs without coins', () => {
      // Test that existing configs without coins still work
      const result = sceneFactory.loadConfiguration(testLevelConfig);
      expect(result).toBe(true);
      
      const coins = sceneFactory.createCoinsFromConfig(testLevelConfig.coins, mockCoinsGroup);
      expect(coins.length).toBeGreaterThan(0);
    });
  });

  describe('Coin Creation', () => {
    it('should create coins with correct frame and physics configuration', () => {
      // Arrange
      const coinConfig = {
        type: 'coin',
        x: 400,
        y: 300,
        properties: { value: 100 }
      };

      // Act
      const coin = sceneFactory.createCoin(coinConfig, mockCoinsGroup);

      // Assert
      expect(coin).toBeTruthy();
      expect(coin.frame).toBe('block_coin_active'); // Should have correct frame
      expect(coin.body.allowGravity).toBe(false); // Should not be affected by gravity
      expect(mockCoinsGroup.add).toHaveBeenCalledWith(coin); // Should be added to group
    });

    it('should create multiple coins from configuration array', () => {
      // Arrange
      const coinConfigs = [
        { type: 'coin', x: 100, y: 200, properties: { value: 100 } },
        { type: 'coin', x: 300, y: 400, properties: { value: 100 } }
      ];

      // Act
      const coins = sceneFactory.createCoinsFromConfig(coinConfigs, mockCoinsGroup);

      // Assert
      expect(coins).toHaveLength(2);
      expect(coins[0].frame).toBe('block_coin_active');
      expect(coins[1].frame).toBe('block_coin_active');
      expect(coins[0].body.allowGravity).toBe(false);
      expect(coins[1].body.allowGravity).toBe(false);
    });

    it('should handle empty coin configuration gracefully', () => {
      // Act
      const coins = sceneFactory.createCoinsFromConfig([], mockCoinsGroup);

      // Assert
      expect(coins).toEqual([]);
    });

    it('should handle invalid coin configuration gracefully', () => {
      // Act
      const coin = sceneFactory.createCoin(null, mockCoinsGroup);

      // Assert
      expect(coin).toBeNull();
    });
  });
}); 
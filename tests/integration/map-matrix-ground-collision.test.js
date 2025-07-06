import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('Map Matrix Ground Collision Integration Tests', () => {
  let sceneMock;
  let sceneFactory;
  let mockPlatformsGroup;
  let createdPlatforms;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock();
    
    // Track created platforms for verification
    createdPlatforms = [];
    
    // Create a mock platforms group that tracks created platforms
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

    // Mock the physics.add.group to return our mock groups
    sceneMock.physics.add.group = jest.fn(() => mockPlatformsGroup);
    
    sceneFactory = new SceneFactory(sceneMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    createdPlatforms.length = 0;
  });

  describe('Map Matrix Ground Platform Creation', () => {
    test('should create ground platforms from map_matrix with correct physics', () => {
      // Arrange: Use the exact configuration from map-matrix-complex.json
      const config = {
        playerSpawn: { x: 50, y: 90 },
        goal: {
          x: 10,
          y: 150,
          tileKey: "sign_exit",
          isFullBlock: true
        },
        map_matrix: [
          [
            { tileKey: "terrain_grass_block", type: "decorative" },
            { tileKey: "terrain_grass_block", type: "decorative" },
            { tileKey: "terrain_grass_block", type: "decorative" },
            { tileKey: "bush", type: "decorative" },
            { tileKey: "terrain_grass_block", type: "ground" }
          ],
          [
            { tileKey: "rock", type: "ground" },
            { tileKey: "terrain_grass_block", type: "decorative" },
            { tileKey: "cactus", type: "decorative" },
            { tileKey: "terrain_grass_block", type: "decorative" },
            { tileKey: "mushroom_brown", type: "ground" }
          ],
          [
            { tileKey: "terrain_grass_block", type: "ground" },
            { tileKey: "terrain_grass_block", type: "decorative" },
            { tileKey: "terrain_grass_block", type: "decorative" },
            { tileKey: "terrain_grass_block", type: "decorative" },
            { tileKey: "terrain_grass_block", type: "ground" }
          ]
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Assert: Should create ground platforms with proper physics
      expect(result).toBeDefined();
      expect(result.groundPlatforms).toBeDefined();
      expect(result.groundPlatforms.length).toBeGreaterThan(0);

      // Verify that ground platforms were actually created in the physics group
      expect(mockPlatformsGroup.create).toHaveBeenCalled();

      // Verify physics configuration for each created platform
      for (const platform of createdPlatforms) {
        expect(platform.body.setImmovable).toHaveBeenCalledWith(true);
        expect(platform.body.setAllowGravity).toHaveBeenCalledWith(false);
        expect(platform.body.setSize).toHaveBeenCalled();
        expect(platform.body.setOffset).toHaveBeenCalled();
      }
    });

    test('should create ground platforms at correct world coordinates', () => {
      // Arrange: Simple 2x2 matrix with ground tiles
      const config = {
        map_matrix: [
          [
            { tileKey: "terrain_grass_block", type: "ground" },   // [0][0] → (0, 0)
            { tileKey: "terrain_grass_block", type: "ground" }    // [0][1] → (64, 0)
          ],
          [
            { tileKey: "terrain_grass_block", type: "ground" },   // [1][0] → (0, 64)
            { tileKey: "terrain_grass_block", type: "ground" }    // [1][1] → (64, 64)
          ]
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Assert: Should create ground platforms at correct coordinates
      expect(result.groundPlatforms.length).toBeGreaterThan(0);

      // Verify that platforms were created at the expected world coordinates
      const createCalls = mockPlatformsGroup.create.mock.calls;
      expect(createCalls.length).toBeGreaterThan(0);

      // Check that at least one platform was created at the expected positions
      const positions = createCalls.map(call => ({ x: call[0], y: call[1] }));
      
      // Should have platforms at matrix coordinates converted to world coordinates
      expect(positions.some(pos => pos.x === 0 && pos.y === 0)).toBe(true);
      expect(positions.some(pos => pos.x === 64 && pos.y === 0)).toBe(true);
      expect(positions.some(pos => pos.x === 0 && pos.y === 64)).toBe(true);
      expect(positions.some(pos => pos.x === 64 && pos.y === 64)).toBe(true);
    });

    test('should handle adjacent ground tiles as multi-tile platforms', () => {
      // Arrange: Matrix with adjacent ground tiles that should form a single platform
      const config = {
        map_matrix: [
          [
            { tileKey: "terrain_grass_block", type: "ground" },
            { tileKey: "terrain_grass_block", type: "ground" },
            { tileKey: "terrain_grass_block", type: "ground" }
          ]
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Assert: Should create one multi-tile platform instead of three single tiles
      expect(result.groundPlatforms.length).toBe(1);
      expect(result.groundPlatforms[0].width).toBe(192); // 3 tiles * 64px
    });

    test('should create separate platforms when ground tiles are not adjacent', () => {
      // Arrange: Matrix with non-adjacent ground tiles
      const config = {
        map_matrix: [
          [
            { tileKey: "terrain_grass_block", type: "ground" },
            { tileKey: "bush", type: "decorative" },
            { tileKey: "terrain_grass_block", type: "ground" }
          ]
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Assert: Should create two separate single-tile platforms
      expect(result.groundPlatforms.length).toBe(2);
      expect(result.groundPlatforms[0].width).toBe(64);
      expect(result.groundPlatforms[1].width).toBe(64);
    });
  });

  describe('Physics Configuration Validation', () => {
    test('should configure physics bodies correctly for ground platforms', () => {
      // Arrange: Simple ground platform
      const config = {
        map_matrix: [
          [
            { tileKey: "terrain_grass_block", type: "ground" }
          ]
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Assert: Verify physics configuration calls
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
      
      // Check that each created platform has proper physics configuration
      const createCalls = mockPlatformsGroup.create.mock.calls;
      for (let i = 0; i < createCalls.length; i++) {
        const platform = createdPlatforms[i];
        expect(platform.body.setImmovable).toHaveBeenCalledWith(true);
        expect(platform.body.setAllowGravity).toHaveBeenCalledWith(false);
        expect(platform.body.setSize).toHaveBeenCalled();
        expect(platform.body.setOffset).toHaveBeenCalled();
      }
    });

    test('should use full block hitbox for ground platforms', () => {
      // Arrange: Ground platform configuration
      const config = {
        map_matrix: [
          [
            { tileKey: "terrain_grass_block", type: "ground" }
          ]
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Assert: Should use full block hitbox (isFullBlock: true)
      // This is verified by checking that setSize is called with full dimensions
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
      
      // The configurePlatform method should be called with isFullBlock: true
      // which sets the full size hitbox
      for (const platform of createdPlatforms) {
        expect(platform.body.setSize).toHaveBeenCalledWith(64, 64); // Full tile size
        expect(platform.body.setOffset).toHaveBeenCalledWith(0, 0); // No offset
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid tile keys gracefully', () => {
      // Arrange: Matrix with invalid tile key
      const config = {
        map_matrix: [
          [
            { tileKey: "invalid_tile_key", type: "ground" }
          ]
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Assert: Should handle gracefully (may return null or empty result)
      // The exact behavior depends on the validation logic
      expect(result).toBeDefined();
    });

    test('should handle missing platforms group gracefully', () => {
      // Arrange: Valid matrix but no platforms group
      const config = {
        map_matrix: [
          [
            { tileKey: "terrain_grass_block", type: "ground" }
          ]
        ]
      };

      // Act
      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(null);

      // Assert: Should return null when no platforms group provided
      expect(result).toBeNull();
    });
  });
}); 
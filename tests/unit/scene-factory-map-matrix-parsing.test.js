import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { TileSelector } from '../../client/src/systems/TileSelector.js';

describe('SceneFactory Map Matrix Parsing', () => {
  let sceneMock;
  let sceneFactory;
  let mockPlatformsGroup;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock();
    
    // Create a mock platforms group
    mockPlatformsGroup = {
      create: jest.fn((x, y, texture, frame) => ({
        x,
        y,
        texture,
        frame, // <-- set frame to the argument
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

    // Mock the physics.add.group to return our mock groups
    sceneMock.physics.add.group = jest.fn(() => mockPlatformsGroup);
    
    sceneFactory = new SceneFactory(sceneMock);

    // Mock createGroundPlatform to return a mock platform object
    sceneFactory.createGroundPlatform = jest.fn((config, group) => ({
      x: config.x,
      y: config.y,
      width: config.width,
      frame: config.tilePrefix,
      type: 'ground',
    }));
    // Mock createDecorativePlatform to return a mock platform object
    sceneFactory.createDecorativePlatform = jest.fn((config) => ({
      x: config.x,
      y: config.y,
      frame: config.tilePrefix,
      type: 'decorative',
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMapMatrixFromConfig', () => {
    it('should parse 2x2 matrix with ground and decorative tiles', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ],
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'rock', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeDefined();
      expect(result.groundPlatforms).toHaveLength(2);
      expect(result.decorativePlatforms).toHaveLength(2);
    });

    it('should convert matrix coordinates to world positions correctly', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Check ground platform position: matrix[0][0] → world (0, 0)
      expect(result.groundPlatforms[0].x).toBe(0);
      expect(result.groundPlatforms[0].y).toBe(0);

      // Check decorative platform position: matrix[0][1] → world (64, 0)
      expect(result.decorativePlatforms[0].x).toBe(64);
      expect(result.decorativePlatforms[0].y).toBe(0);
    });

    it('should handle empty matrix', () => {
      const config = {
        map_matrix: []
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeNull();
    });

    it('should handle matrix with only ground tiles', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      // Should create two ground tiles
      expect(result.groundPlatforms).toHaveLength(2);
      expect(result.groundPlatforms[0].x).toBe(0);
      expect(result.groundPlatforms[0].y).toBe(0);
      expect(result.groundPlatforms[1].x).toBe(64);
      expect(result.groundPlatforms[1].y).toBe(0);
      expect(result.decorativePlatforms).toHaveLength(0);
    });

    it('should handle matrix with only decorative tiles', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'bush', type: 'decorative' },
            { tileKey: 'rock', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result.groundPlatforms).toHaveLength(0);
      expect(result.decorativePlatforms).toHaveLength(2);
    });

    it('should create ground platforms with correct tileKey', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result.groundPlatforms[0].frame).toBe('terrain_grass_block');
    });

    it('should create decorative platforms with correct tileKey', () => {
      const config = {
        map_matrix: [
          [
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result.decorativePlatforms[0].frame).toBe('bush');
    });

    it('should return null when no map_matrix in configuration', () => {
      const config = {};

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeNull();
    });

    it('should return null when map_matrix is empty', () => {
      const config = {
        map_matrix: []
      };

      sceneFactory.loadConfiguration(config);
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);

      expect(result).toBeNull();
    });
  });

  describe('Phaser property compliance for map_matrix tiles', () => {
    it('should create ground and decorative tiles with correct collision and gravity properties', () => {
      // Arrange: Use the patched mockPlatformsGroup
      const sceneFactory = new SceneFactory(sceneMock);
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ],
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'rock', type: 'decorative' }
          ]
        ]
      };
      sceneFactory.loadConfiguration(config);
      // Act
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);
      // Assert: ground tiles
      result.groundPlatforms.forEach(sprite => {
        expect(sprite.frame).toBe('terrain_grass_block');
        expect(sprite.body.setImmovable).toHaveBeenCalledWith(true);
        expect(sprite.body.setAllowGravity).toHaveBeenCalledWith(false);
      });
      // Assert: decorative tiles
      result.decorativePlatforms.forEach(sprite => {
        expect(['bush', 'rock']).toContain(sprite.frame);
        expect(sprite.body.setAllowGravity).toHaveBeenCalledWith(false);
        // Decorative tiles should not have collision enabled (setImmovable not called)
        expect(sprite.body.setImmovable).not.toHaveBeenCalled();
      });
    });
  });

  describe('Collision group separation for map_matrix tiles', () => {
    it('should add ground tiles to collision-enabled group and decorative tiles to non-collision group', () => {
      // Arrange
      const sceneFactory = new SceneFactory(sceneMock);
      const platformsGroup = mockPlatformsGroup;
      const decorativeGroup = {
        create: jest.fn((x, y, texture, frame) => ({
          x, y, texture, frame,
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
      
      const config = {
        map_matrix: [
          [
            { tileKey: 'terrain_grass_block', type: 'ground' },
            { tileKey: 'bush', type: 'decorative' }
          ]
        ]
      };
      sceneFactory.loadConfiguration(config);
      
      // Act - This will fail until we implement separate groups
      const result = sceneFactory.createMapMatrixFromConfig(platformsGroup, decorativeGroup);
      
      // Assert: Ground tiles should be added to platformsGroup (collision-enabled)
      expect(platformsGroup.create).toHaveBeenCalledWith(0, 0, 'tiles', 'terrain_grass_block');
      
      // Assert: Decorative tiles should be added to decorativeGroup (no collision)
      expect(decorativeGroup.create).toHaveBeenCalledWith(64, 0, 'tiles', 'bush');
      
      // Assert: No decorative tiles should be in platformsGroup
      expect(platformsGroup.create).not.toHaveBeenCalledWith(64, 0, 'tiles', 'bush');
      
      // Assert: No ground tiles should be in decorativeGroup
      expect(decorativeGroup.create).not.toHaveBeenCalledWith(0, 0, 'tiles', 'terrain_grass_block');
    });
  });
}); 
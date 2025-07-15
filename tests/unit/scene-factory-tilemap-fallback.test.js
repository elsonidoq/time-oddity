import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { LEVEL_SCALE } from '../../client/src/systems/SceneFactory.js';

// Mock Phaser scene with failing tilemap
const createMockSceneWithFailingTilemap = () => ({
  make: {
    tilemap: jest.fn(() => null), // Tilemap creation fails
    group: jest.fn(() => ({
      add: jest.fn(),
      create: jest.fn()
    }))
  },
  add: {
    group: jest.fn(() => ({
      add: jest.fn(),
      create: jest.fn()
    }))
  },
  physics: {
    add: {
      group: jest.fn(() => ({
        add: jest.fn(),
        create: jest.fn()
      }))
    }
  }
});

// Mock Phaser scene with working tilemap
const createMockSceneWithWorkingTilemap = () => ({
  make: {
    tilemap: jest.fn(() => ({
      addTilesetImage: jest.fn(() => ({
        name: 'tiles'
      })),
      createLayer: jest.fn(() => ({
        setCullPaddingX: jest.fn(),
        setCullPaddingY: jest.fn(),
        setScale: jest.fn(),
        putTileAt: jest.fn(),
        skipCull: false
      }))
    })),
    group: jest.fn(() => ({
      add: jest.fn(),
      create: jest.fn()
    }))
  },
  add: {
    group: jest.fn(() => ({
      add: jest.fn(),
      create: jest.fn()
    }))
  },
  physics: {
    add: {
      group: jest.fn(() => ({
        add: jest.fn(),
        create: jest.fn()
      }))
    }
  }
});

describe('SceneFactory Tilemap Fallback', () => {
  let sceneFactory;
  let mockScene;
  let mockPlatformsGroup;

  beforeEach(() => {
    mockPlatformsGroup = {
      add: jest.fn(),
      create: jest.fn(() => ({
        setOrigin: jest.fn(),
        setScale: jest.fn(),
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn()
        }
      }))
    };
  });

  describe('when tilemap creation fails', () => {
    beforeEach(() => {
      mockScene = createMockSceneWithFailingTilemap();
      sceneFactory = new SceneFactory(mockScene);
      
      // Load a simple map matrix configuration
      sceneFactory.loadConfiguration({
        map_matrix: [
          [
            { tileKey: 'terrain_purple_block_left', type: 'ground' },
            { tileKey: 'terrain_purple_block_center', type: 'ground' },
            { tileKey: 'terrain_purple_block_right', type: 'ground' }
          ]
        ]
      });
    });

    it('should fall back to sprite-based creation when tilemap fails', () => {
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);
      
      expect(result).toBeDefined();
      expect(result.groundPlatforms).toBeDefined();
      expect(Array.isArray(result.groundPlatforms)).toBe(true);
      expect(result.groundPlatforms.length).toBeGreaterThan(0);
    });

    it('should create sprites with correct positioning and scaling', () => {
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);
      
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
      // Verify sprite creation calls with correct parameters
      const createCalls = mockPlatformsGroup.create.mock.calls;
      expect(createCalls.length).toBeGreaterThan(0);
      
      // Check that sprites are created with correct tile keys
      createCalls.forEach(call => {
        expect(call[2]).toBe('tiles'); // texture key
        expect(['terrain_purple_block_left', 'terrain_purple_block_center', 'terrain_purple_block_right']).toContain(call[3]); // tile key
      });
    });

    it('should configure sprites with physics properties', () => {
      sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);
      
      // Verify that sprites are configured with physics
      const createdSprites = mockPlatformsGroup.create.mock.results.map(r => r.value);
      createdSprites.forEach(sprite => {
        expect(sprite.setOrigin).toHaveBeenCalledWith(0, 0);
        expect(sprite.setScale).toHaveBeenCalledWith(LEVEL_SCALE, LEVEL_SCALE); // Use actual LEVEL_SCALE
        expect(sprite.body.setImmovable).toHaveBeenCalledWith(true);
        expect(sprite.body.setAllowGravity).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('when tilemap creation succeeds', () => {
    beforeEach(() => {
      mockScene = createMockSceneWithWorkingTilemap();
      sceneFactory = new SceneFactory(mockScene);
      
      // Load configuration with culling enabled
      sceneFactory.loadConfiguration({
        map_matrix: [
          [
            { tileKey: 'terrain_purple_block_left', type: 'ground' },
            { tileKey: 'terrain_purple_block_center', type: 'ground' },
            { tileKey: 'terrain_purple_block_right', type: 'ground' }
          ]
        ],
        culling: {
          tilemap: {
            enabled: true
          }
        }
      });
    });

    it('should use tilemap creation when available', () => {
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);
      
      expect(result).toBeDefined();
      expect(result.groundPlatforms).toBeDefined();
      expect(Array.isArray(result.groundPlatforms)).toBe(true);
      expect(result.groundPlatforms.length).toBeGreaterThan(0);
      
      // Verify tilemap was created
      expect(mockScene.make.tilemap).toHaveBeenCalled();
    });
  });

  describe('when culling is disabled', () => {
    beforeEach(() => {
      mockScene = createMockSceneWithWorkingTilemap();
      sceneFactory = new SceneFactory(mockScene);
      
      // Load configuration with culling disabled
      sceneFactory.loadConfiguration({
        map_matrix: [
          [
            { tileKey: 'terrain_purple_block_left', type: 'ground' },
            { tileKey: 'terrain_purple_block_center', type: 'ground' },
            { tileKey: 'terrain_purple_block_right', type: 'ground' }
          ]
        ],
        culling: {
          tilemap: {
            enabled: false
          }
        }
      });
    });

    it('should use sprite-based creation when culling is disabled', () => {
      const result = sceneFactory.createMapMatrixFromConfig(mockPlatformsGroup);
      
      expect(result).toBeDefined();
      expect(result.groundPlatforms).toBeDefined();
      expect(Array.isArray(result.groundPlatforms)).toBe(true);
      expect(result.groundPlatforms.length).toBeGreaterThan(0);
      
      // Verify sprites were created instead of tilemap
      expect(mockPlatformsGroup.create).toHaveBeenCalled();
    });
  });
}); 
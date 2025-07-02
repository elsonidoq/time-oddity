import { jest } from '@jest/globals';
import MovingPlatform from '../../client/src/entities/MovingPlatform.js';
import { TileSelector } from '../../client/src/systems/TileSelector.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('MovingPlatform Tile Selection', () => {
  let scene;
  let mockPlatformsGroup;
  let originalGetTileKey;
  let mockGetTileKey;

  beforeEach(() => {
    scene = createPhaserSceneMock();
    mockPlatformsGroup = {
      add: jest.fn()
    };
    
    // Mock TileSelector.getTileKey method
    originalGetTileKey = TileSelector.getTileKey;
    mockGetTileKey = jest.fn();
    TileSelector.getTileKey = mockGetTileKey;
  });

  afterEach(() => {
    // Restore original TileSelector.getTileKey
    TileSelector.getTileKey = originalGetTileKey;
  });

  describe('Constructor with tilePrefix', () => {
    test('should use TileSelector for single tile moving platform', () => {
      // Setup TileSelector to return center tile for single tile
      mockGetTileKey.mockReturnValue('terrain_grass_block_center');

      const config = {
        type: 'linear',
        startX: 100,
        startY: 500,
        endX: 300,
        endY: 500,
        speed: 60,
        mode: 'bounce',
        autoStart: true
      };

      const options = {
        width: 64, // Single tile
        tilePrefix: 'terrain_grass_block'
      };

      const platform = new MovingPlatform(
        scene,
        100,
        500,
        'tiles',
        config,
        null, // frame should be ignored when tilePrefix is provided
        null,
        options
      );

      // Verify TileSelector was called for master sprite
      expect(mockGetTileKey).toHaveBeenCalledWith(
        'terrain_grass_block',
        { x: 100, y: 500 },
        1,
        0
      );

      // Verify platform was created with correct frame
      expect(platform.frame).toBe('terrain_grass_block_center');
      expect(platform.spriteCount).toBe(1);
      expect(platform.sprites.length).toBe(1);
    });

    test('should use TileSelector for multi-tile moving platform with correct left/center/right tiles', () => {
      // Setup TileSelector to return different tiles based on position
      mockGetTileKey
        .mockReturnValueOnce('terrain_grass_block_left')    // First sprite (index 0)
        .mockReturnValueOnce('terrain_grass_block_center')  // Second sprite (index 1)
        .mockReturnValueOnce('terrain_grass_block_right');  // Third sprite (index 2)

      const config = {
        type: 'linear',
        startX: 100,
        startY: 500,
        endX: 300,
        endY: 500,
        speed: 60,
        mode: 'bounce',
        autoStart: true
      };

      const options = {
        width: 192, // 3 tiles (192 / 64 = 3)
        tilePrefix: 'terrain_grass_block'
      };

      const platform = new MovingPlatform(
        scene,
        100,
        500,
        'tiles',
        config,
        null,
        null,
        options
      );

      // Verify TileSelector was called for each sprite
      expect(mockGetTileKey).toHaveBeenCalledTimes(3);
      
      // Check first sprite (master sprite)
      expect(mockGetTileKey).toHaveBeenNthCalledWith(1,
        'terrain_grass_block',
        { x: 100, y: 500 },
        3,
        0
      );

      // Check second sprite
      expect(mockGetTileKey).toHaveBeenNthCalledWith(2,
        'terrain_grass_block',
        { x: 164, y: 500 },
        3,
        1
      );

      // Check third sprite
      expect(mockGetTileKey).toHaveBeenNthCalledWith(3,
        'terrain_grass_block',
        { x: 228, y: 500 },
        3,
        2
      );

      // Verify platform properties
      expect(platform.frame).toBe('terrain_grass_block_left');
      expect(platform.spriteCount).toBe(3);
      expect(platform.sprites.length).toBe(3);
      
      // Verify additional sprites were created with correct frames
      expect(platform.sprites[1].frame).toBe('terrain_grass_block_center');
      expect(platform.sprites[2].frame).toBe('terrain_grass_block_right');
    });

    test('should use TileSelector for two-tile moving platform with left/right tiles', () => {
      // Setup TileSelector to return left and right tiles
      mockGetTileKey
        .mockReturnValueOnce('terrain_grass_block_left')   // First sprite (index 0)
        .mockReturnValueOnce('terrain_grass_block_right');  // Second sprite (index 1)

      const config = {
        type: 'linear',
        startX: 100,
        startY: 500,
        endX: 300,
        endY: 500,
        speed: 60,
        mode: 'bounce',
        autoStart: true
      };

      const options = {
        width: 128, // 2 tiles (128 / 64 = 2)
        tilePrefix: 'terrain_grass_block'
      };

      const platform = new MovingPlatform(
        scene,
        100,
        500,
        'tiles',
        config,
        null,
        null,
        options
      );

      // Verify TileSelector was called for each sprite
      expect(mockGetTileKey).toHaveBeenCalledTimes(2);
      
      // Check calls
      expect(mockGetTileKey).toHaveBeenNthCalledWith(1,
        'terrain_grass_block',
        { x: 100, y: 500 },
        2,
        0
      );

      expect(mockGetTileKey).toHaveBeenNthCalledWith(2,
        'terrain_grass_block',
        { x: 164, y: 500 },
        2,
        1
      );

      // Verify platform properties
      expect(platform.frame).toBe('terrain_grass_block_left');
      expect(platform.spriteCount).toBe(2);
      expect(platform.sprites.length).toBe(2);
      expect(platform.sprites[1].frame).toBe('terrain_grass_block_right');
    });
  });

  describe('Backward compatibility rejection', () => {
    test('should reject configuration with old tileKey format when no tilePrefix provided', () => {
      const config = {
        type: 'linear',
        startX: 100,
        startY: 500,
        endX: 300,
        endY: 500,
        speed: 60,
        mode: 'bounce',
        autoStart: true
      };

      const options = {
        width: 192
        // No tilePrefix provided, relying on old frame parameter
      };

      // This should either throw an error or handle gracefully
      expect(() => {
        new MovingPlatform(
          scene,
          100,
          500,
          'tiles',
          config,
          'terrain_grass_block_center', // Old tileKey format as frame
          null,
          options
        );
      }).toThrow(/tilePrefix is required/);
    });

    test('should require tilePrefix for multi-tile platforms', () => {
      const config = {
        type: 'linear',
        startX: 100,
        startY: 500,
        endX: 300,
        endY: 500,
        speed: 60
      };

      const options = {
        width: 192 // Multi-tile platform
        // Missing tilePrefix
      };

      expect(() => {
        new MovingPlatform(
          scene,
          100,
          500,
          'tiles',
          config,
          null,
          null,
          options
        );
      }).toThrow(/tilePrefix is required for multi-tile platforms/);
    });
  });

  describe('Time reversal compatibility', () => {
    test('should maintain time reversal functionality with tile selection', () => {
      // Setup TileSelector
      mockGetTileKey.mockReturnValue('terrain_grass_block_center');

      const config = {
        type: 'linear',
        startX: 100,
        startY: 500,
        endX: 300,
        endY: 500,
        speed: 60,
        mode: 'bounce',
        autoStart: true
      };

      const options = {
        width: 64,
        tilePrefix: 'terrain_grass_block'
      };

      const platform = new MovingPlatform(
        scene,
        100,
        500,
        'tiles',
        config,
        null,
        null,
        options
      );

      // Verify time reversal methods still exist and work
      expect(typeof platform.getStateForRecording).toBe('function');
      expect(typeof platform.setStateFromRecording).toBe('function');

      const state = platform.getStateForRecording();
      expect(state).toBeDefined();
      expect(state.x).toBe(100);
      expect(state.y).toBe(500);

      // Test state restoration
      const newState = { ...state, x: 200, y: 600, masterX: 200, masterY: 600 };
      platform.setStateFromRecording(newState);
      expect(platform.x).toBe(200);
      expect(platform.y).toBe(600);
    });
  });

  describe('Player carrying compatibility', () => {
    test('should maintain player carrying functionality with tile selection', () => {
      // Setup TileSelector
      mockGetTileKey
        .mockReturnValueOnce('terrain_grass_block_left')
        .mockReturnValueOnce('terrain_grass_block_right');

      const config = {
        type: 'linear',
        startX: 100,
        startY: 500,
        endX: 300,
        endY: 500,
        speed: 60
      };

      const options = {
        width: 128, // 2 tiles
        tilePrefix: 'terrain_grass_block'
      };

      const platform = new MovingPlatform(
        scene,
        100,
        500,
        'tiles',
        config,
        null,
        null,
        options
      );

      // Verify player carrying methods still exist
      expect(typeof platform.isPlayerStandingOnTop).toBe('function');
      expect(typeof platform.carryPlayerIfStanding).toBe('function');
      expect(typeof platform.isPlayerStandingOnAnySprite).toBe('function');

      // Create mock player body
      const mockPlayerBody = {
        touching: { down: true },
        position: { x: 120, y: 480 }
      };

      // Test player detection methods work
      const isStanding = platform.isPlayerStandingOnTop(mockPlayerBody);
      expect(typeof isStanding).toBe('boolean');
    });
  });
}); 
/**
 * Unit tests for SceneFactory scaling implementation
 * 
 * Tests that SceneFactory properly applies centralized scaling to all
 * platform sprites and entities.
 */

import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { LEVEL_SCALE } from '../../client/src/config/GameConfig.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('SceneFactory Scaling Implementation', () => {
  let sceneFactory;
  let mockScene;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    sceneFactory = new SceneFactory(mockScene);
  });

  describe('Platform Scaling', () => {
    test('should apply centralized scale to ground platform sprites', () => {
      const platformsGroup = mockScene.physics.add.group();
      const groundConfig = {
        type: 'ground',
        x: 0,
        y: 100,
        width: 192, // 3 tiles
        tilePrefix: 'terrain_grass_horizontal',
        isFullBlock: true
      };

      const platforms = sceneFactory.createGroundPlatform(groundConfig, platformsGroup);
      
      expect(platforms).toBeDefined();
      expect(Array.isArray(platforms)).toBe(true);
      expect(platforms.length).toBe(3); // 3 tiles for 192px width
      
      // Check that each platform sprite has the correct scale
      platforms.forEach(platform => {
        expect(platform.scaleX).toBe(LEVEL_SCALE);
        expect(platform.scaleY).toBe(LEVEL_SCALE);
      });
    });

    test('should apply centralized scale to floating platform sprites', () => {
      const platformsGroup = mockScene.physics.add.group();
      const floatingConfig = {
        type: 'floating',
        x: 100,
        y: 200,
        width: 128, // 2 tiles
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platforms = sceneFactory.createFloatingPlatform(floatingConfig, platformsGroup);
      
      expect(platforms).toBeDefined();
      expect(Array.isArray(platforms)).toBe(true);
      expect(platforms.length).toBe(2); // 2 tiles for 128px width
      
      // Check that each platform sprite has the correct scale
      platforms.forEach(platform => {
        expect(platform.scaleX).toBe(LEVEL_SCALE);
        expect(platform.scaleY).toBe(LEVEL_SCALE);
      });
    });

    test('should apply centralized scale to single floating platform', () => {
      const platformsGroup = mockScene.physics.add.group();
      const floatingConfig = {
        type: 'floating',
        x: 100,
        y: 200,
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true
      };

      const platform = sceneFactory.createFloatingPlatform(floatingConfig, platformsGroup);
      
      expect(platform).toBeDefined();
      expect(platform.scaleX).toBe(LEVEL_SCALE);
      expect(platform.scaleY).toBe(LEVEL_SCALE);
    });
  });

  describe('Moving Platform Scaling', () => {
    test('should apply centralized scale to moving platform', () => {
      const platformsGroup = mockScene.physics.add.group();
      const movingConfig = {
        type: 'moving',
        x: 300,
        y: 150,
        width: 192, // 3 tiles
        tilePrefix: 'terrain_grass_block',
        isFullBlock: true,
        movement: {
          type: 'linear',
          startX: 300,
          startY: 150,
          endX: 300,
          endY: 100,
          speed: 50,
          mode: 'bounce',
          autoStart: true
        }
      };

      const movingPlatform = sceneFactory.createMovingPlatform(movingConfig, platformsGroup);
      
      expect(movingPlatform).toBeDefined();
      // Debug: Check what properties the MovingPlatform instance has
      console.log('MovingPlatform properties:', Object.keys(movingPlatform));
      console.log('MovingPlatform scaleX:', movingPlatform.scaleX);
      console.log('MovingPlatform scaleY:', movingPlatform.scaleY);
      
      // Check that the MovingPlatform instance has the correct scale applied
      // The MovingPlatform extends Entity which should have scaleX/scaleY properties
      expect(movingPlatform.scaleX).toBe(LEVEL_SCALE);
      expect(movingPlatform.scaleY).toBe(LEVEL_SCALE);
      
      // Check that all additional sprites in the moving platform are scaled
      if (movingPlatform.sprites && movingPlatform.sprites.length > 1) {
        // Skip the first sprite (index 0) as it's the master sprite (the MovingPlatform itself)
        for (let i = 1; i < movingPlatform.sprites.length; i++) {
          const sprite = movingPlatform.sprites[i];
          expect(sprite.scaleX).toBe(LEVEL_SCALE);
          expect(sprite.scaleY).toBe(LEVEL_SCALE);
        }
      }
    });
  });

  describe('Goal Tile Scaling', () => {
    test('should apply centralized scale to goal tile', () => {
      const goalTilesGroup = mockScene.physics.add.group();
      const x = 400;
      const y = 100;
      const tileKey = 'sign_exit';

      const goalTile = sceneFactory.createGoalTile(x, y, tileKey, goalTilesGroup);
      
      expect(goalTile).toBeDefined();
      expect(goalTile.scaleX).toBe(LEVEL_SCALE);
      expect(goalTile.scaleY).toBe(LEVEL_SCALE);
    });
  });

  describe('Decorative Platform Scaling', () => {
    test('should apply centralized scale to decorative platforms', () => {
      const decorativeGroup = mockScene.physics.add.group();
      const decorativeConfig = {
        type: 'decorative',
        x: 200,
        y: 150,
        width: 192, // 3 tiles (192 > 64, so should create array)
        tilePrefix: 'terrain_grass_block',
        depth: -0.5
      };

      const decorativePlatforms = sceneFactory.createDecorativePlatform(decorativeConfig);
      
      expect(decorativePlatforms).toBeDefined();
      expect(Array.isArray(decorativePlatforms)).toBe(true);
      expect(decorativePlatforms.length).toBe(3); // 3 tiles for 192px width
      
      // Check that each decorative platform sprite has the correct scale
      decorativePlatforms.forEach(platform => {
        expect(platform.scaleX).toBe(LEVEL_SCALE);
        expect(platform.scaleY).toBe(LEVEL_SCALE);
      });
    });
  });

  describe('Map Matrix Scaling', () => {
    test('should apply centralized scale to map matrix tiles', () => {
      const platformsGroup = mockScene.physics.add.group();
      const decorativeGroup = mockScene.physics.add.group();
      
      const mapMatrix = [
        [
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'bush', type: 'decorative' }
        ],
        [
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'terrain_grass_block', type: 'ground' },
          { tileKey: 'rock', type: 'decorative' }
        ]
      ];

      const config = { map_matrix: mapMatrix };
      sceneFactory.loadConfiguration(config);
      
      const result = sceneFactory.createMapMatrixFromConfig(platformsGroup, decorativeGroup);
      
      expect(result).toBeDefined();
      expect(result.groundPlatforms).toBeDefined();
      expect(Array.isArray(result.groundPlatforms)).toBe(true);
      
      // Check that all ground platform sprites have the correct scale
      result.groundPlatforms.forEach(platform => {
        expect(platform.scaleX).toBe(LEVEL_SCALE);
        expect(platform.scaleY).toBe(LEVEL_SCALE);
      });
      
      // Check that all decorative platform sprites have the correct scale
      if (result.decorativePlatforms) {
        result.decorativePlatforms.forEach(platform => {
          expect(platform.scaleX).toBe(LEVEL_SCALE);
          expect(platform.scaleY).toBe(LEVEL_SCALE);
        });
      }
    });
  });
}); 
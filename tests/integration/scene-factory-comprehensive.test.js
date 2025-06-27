import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import testLevelConfig from '../../client/src/config/test-level.json';

describe('SceneFactory Comprehensive Integration', () => {
  let mockScene;
  let sceneFactory;
  let mockPlatformsGroup;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    
    // Create a comprehensive mock platforms group
    mockPlatformsGroup = {
      create: jest.fn((x, y, texture, frame) => ({
        x,
        y,
        texture,
        frame,
        width: 64,
        height: 64,
        setOrigin: jest.fn().mockReturnThis(),
        body: {
          setImmovable: jest.fn(),
          setAllowGravity: jest.fn(),
          setSize: jest.fn(),
          setOffset: jest.fn(),
          velocity: { x: 0, y: 0 }
        },
        active: true,
        visible: true
      })),
      add: jest.fn(),
      getChildren: jest.fn(() => []),
      getLength: jest.fn(() => 0)
    };
    
    // Mock the physics.add.group to return our mock platforms group
    mockScene.physics.add.group = jest.fn(() => mockPlatformsGroup);
    
    sceneFactory = new SceneFactory(mockScene);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Integration Validation', () => {
    test('should create complete level layout from configuration', () => {
      // Load configuration
      const configLoaded = sceneFactory.loadConfiguration(testLevelConfig);
      expect(configLoaded).toBe(true);
      
      // Create all platforms
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Verify total platform count
      const expectedGroundTiles = Math.ceil(1280 / 64); // 20 tiles
      const expectedFloatingPlatforms = 5;
      const expectedMovingPlatforms = 1;
      const expectedTotal = expectedGroundTiles + expectedFloatingPlatforms + expectedMovingPlatforms;
      
      expect(platforms.length).toBe(expectedTotal);
      // Moving platforms use .add() not .create(), so only count ground + floating
      expect(mockPlatformsGroup.create).toHaveBeenCalledTimes(expectedGroundTiles + expectedFloatingPlatforms);
    });

    test('should maintain exact platform positions from hardcoded version', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Verify ground platform tiles
      const groundTiles = platforms.filter(p => p.y === 656);
      expect(groundTiles.length).toBe(Math.ceil(1280 / 64));
      
      // Verify first and last ground tiles
      expect(groundTiles[0].x).toBe(0);
      expect(groundTiles[groundTiles.length - 1].x).toBe(1280 - 64);
      
      // Verify floating platform positions (includes moving platform)
      const floatingPlatforms = platforms.filter(p => p.y !== 656);
      expect(floatingPlatforms.length).toBe(6); // 5 static floating + 1 moving
      
      const expectedPositions = [
        { x: 200, y: 500 },
        { x: 1000, y: 550 },
        { x: 640, y: 400 },
        { x: 350, y: 250 },
        { x: 800, y: 200 }
      ];
      
      for (const expectedPos of expectedPositions) {
        const found = floatingPlatforms.find(p => p.x === expectedPos.x && p.y === expectedPos.y);
        expect(found).toBeDefined();
        expect(found.texture).toBe('tiles');
        expect(found.frame).toBe('terrain_grass_block_center');
      }
    });

    test('should configure physics correctly for all platforms', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Verify all platforms have physics configured
      for (const platform of platforms) {
        // Skip MovingPlatform instances which use different mock structure
        if (platform && typeof platform.getStateForRecording === 'function') {
          // MovingPlatform - verify it has physics body
          expect(platform.body).toBeDefined();
          expect(platform.body.setImmovable).toBeDefined();
          expect(platform.body.setFriction).toBeDefined();
        } else {
          // Regular platforms - verify Jest mock calls
          expect(platform.body.setImmovable).toHaveBeenCalledWith(true);
          expect(platform.body.setAllowGravity).toHaveBeenCalledWith(false);
          expect(platform.body.setSize).toHaveBeenCalled();
          expect(platform.body.setOffset).toHaveBeenCalled();
        }
      }
    });

    test('should handle error conditions gracefully', () => {
      // Test with invalid configuration
      const invalidConfig = { platforms: [{ type: 'invalid', x: 0, y: 0 }] };
      sceneFactory.loadConfiguration(invalidConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      expect(platforms).toEqual([]);
    });

    test('should maintain backward compatibility with existing systems', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Verify platforms have the expected structure for collision detection
      for (const platform of platforms) {
        expect(platform).toHaveProperty('x');
        expect(platform).toHaveProperty('y');
        expect(platform).toHaveProperty('body');
        expect(platform.body).toHaveProperty('setImmovable');
        expect(platform.body).toHaveProperty('setAllowGravity');
        expect(platform.body).toHaveProperty('setSize');
        expect(platform.body).toHaveProperty('setOffset');
      }
    });
  });

  describe('Performance and Memory Validation', () => {
    test('should create platforms efficiently', () => {
      const startTime = Date.now();
      
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      const endTime = Date.now();
      const creationTime = endTime - startTime;
      
      // Should complete in reasonable time (less than 100ms)
      expect(creationTime).toBeLessThan(100);
      expect(platforms.length).toBeGreaterThan(0);
    });

    test('should create consistent number of platforms on repeated calls', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      
      // Create platforms twice
      const platforms1 = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      const platforms2 = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Should create the same number of platforms each time
      expect(platforms1.length).toBe(platforms2.length);
      
      // Should have the same total number of platforms
      const expectedTotal = Math.ceil(1280 / 64) + 5 + 1; // ground tiles + floating platforms + moving platform
      expect(platforms1.length).toBe(expectedTotal);
      expect(platforms2.length).toBe(expectedTotal);
    });
  });

  describe('Configuration Validation', () => {
    test('should validate configuration schema', () => {
      // Test valid configuration
      expect(sceneFactory.loadConfiguration(testLevelConfig)).toBe(true);
      
      // Test invalid configurations
      expect(sceneFactory.loadConfiguration(null)).toBe(false);
      expect(sceneFactory.loadConfiguration({})).toBe(false);
      expect(sceneFactory.loadConfiguration({ platforms: [] })).toBe(false);
    });

    test('should handle missing platform properties gracefully', () => {
      const incompleteConfig = {
        platforms: [
          { type: 'ground', x: 0, y: 656 }, // Missing width and tileKey
          { type: 'floating', x: 100, y: 500 } // Missing tileKey
        ]
      };
      
      sceneFactory.loadConfiguration(incompleteConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Should handle gracefully and not crash
      expect(Array.isArray(platforms)).toBe(true);
    });
  });

  describe('Integration with Game Systems', () => {
    test('should create platforms compatible with collision detection', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Verify platforms have the structure expected by CollisionManager
      for (const platform of platforms) {
        expect(platform).toHaveProperty('x');
        expect(platform).toHaveProperty('y');
        expect(platform).toHaveProperty('body');
        expect(typeof platform.x).toBe('number');
        expect(typeof platform.y).toBe('number');
        expect(platform.body).toBeDefined();
      }
    });

    test('should create platforms compatible with TimeManager', () => {
      sceneFactory.loadConfiguration(testLevelConfig);
      const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
      
      // Verify platforms have the structure expected by TimeManager
      for (const platform of platforms) {
        expect(platform).toHaveProperty('x');
        expect(platform).toHaveProperty('y');
        expect(platform).toHaveProperty('body');
        expect(platform.body).toHaveProperty('velocity');
        expect(platform).toHaveProperty('active');
        expect(platform).toHaveProperty('visible');
      }
    });
  });
}); 
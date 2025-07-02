import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('Integration: SceneFactory floating platform width', () => {
  let sceneFactory;
  let mockScene;
  let mockPlatformsGroup;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
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
      add: jest.fn((platform) => platform),
      getChildren: jest.fn(() => mockPlatformsGroup._children || [])
    };
    mockPlatformsGroup._children = [];
    // Patch create to push to _children
    const origCreate = mockPlatformsGroup.create;
    mockPlatformsGroup.create = (...args) => {
      const obj = origCreate(...args);
      mockPlatformsGroup._children.push(obj);
      return obj;
    };
    sceneFactory = new SceneFactory(mockScene);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a 3-tile wide floating platform and correct positions', () => {
    const config = {
      platforms: [
        {
          type: 'floating',
          x: 100,
          y: 500,
          width: 192, // 3 tiles
          tilePrefix: 'terrain_grass_block',
          isFullBlock: true
        }
      ]
    };
    sceneFactory.loadConfiguration(config);
    const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
    // Should create 3 tiles
    expect(platforms).toHaveLength(3);
    // Check positions
    expect(platforms[0].x).toBe(100);
    expect(platforms[1].x).toBe(164);
    expect(platforms[2].x).toBe(228);
    // Check tile frames based on position
    expect(platforms[0].frame).toBe('terrain_grass_block_left');
    expect(platforms[1].frame).toBe('terrain_grass_block_center');
    expect(platforms[2].frame).toBe('terrain_grass_block_right');
    platforms.forEach(p => {
      expect(p.y).toBe(500);
      expect(p.texture).toBe('tiles');
    });
  });

  test('should allow player to stand and collide across full span (simulated)', () => {
    // This is a placeholder for a more advanced collision test if needed
    // For now, just ensure all platforms are created and have correct y
    const config = {
      platforms: [
        {
          type: 'floating',
          x: 300,
          y: 400,
          width: 128, // 2 tiles
          tilePrefix: 'terrain_grass_block',
          isFullBlock: true
        }
      ]
    };
    sceneFactory.loadConfiguration(config);
    const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
    expect(platforms).toHaveLength(2);
    expect(platforms[0].x).toBe(300);
    expect(platforms[1].x).toBe(364);
    // Check tile frames based on position
    expect(platforms[0].frame).toBe('terrain_grass_block_left');
    expect(platforms[1].frame).toBe('terrain_grass_block_right');
    platforms.forEach(p => {
      expect(p.y).toBe(400);
    });
  });
}); 
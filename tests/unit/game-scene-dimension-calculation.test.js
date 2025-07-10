import { jest } from '@jest/globals';
import GameScene from '../../client/src/scenes/GameScene.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('GameScene Dimension Calculation and Player Spawn', () => {
  describe('Level Dimension Calculation', () => {
    it('should calculate level width from platform positions', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 100, width: 1000 },
          { x: 500, y: 200, width: 200 },
          { x: 2000, y: 300, width: 500 }
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      const expectedWidth = Math.max(0 + 1000, 500 + 200, 2000 + 500);
      expect(gameScene.levelWidth).toBe(expectedWidth);
    });

    it('should calculate level height from platform y-coordinates only', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 100, width: 1000 },
          { x: 500, y: 200, width: 200 },
          { x: 2000, y: 300, width: 500 }
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      const expectedHeight = Math.max(100, 200, 300);
      expect(gameScene.levelHeight).toBe(expectedHeight);
    });

    it('should not add tile height to scene height calculation', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 500, width: 1000 },
          { x: 500, y: 1000, width: 200 },
          { x: 2000, y: 1500, width: 500 }
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      expect(gameScene.levelHeight).toBe(1500);
      expect(gameScene.levelHeight).not.toBe(1564);
    });

    // New tests for map_matrix dimension calculation
    it('should calculate level width from map_matrix when platforms are not present', () => {
      const testConfig = {
        map_matrix: [
          [{ tileKey: "terrain_grass_block", type: "ground" }, { tileKey: "bush", type: "decorative" }],
          [{ tileKey: "terrain_grass_block", type: "ground" }, { tileKey: "rock", type: "decorative" }]
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      // 2 columns * 64 pixels = 128 pixels width
      expect(gameScene.levelWidth).toBe(128);
    });

    it('should calculate level height from map_matrix when platforms are not present', () => {
      const testConfig = {
        map_matrix: [
          [{ tileKey: "terrain_grass_block", type: "ground" }, { tileKey: "bush", type: "decorative" }],
          [{ tileKey: "terrain_grass_block", type: "ground" }, { tileKey: "rock", type: "decorative" }],
          [{ tileKey: "terrain_grass_block", type: "ground" }, { tileKey: "cactus", type: "decorative" }]
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      // 3 rows * 64 pixels = 192 pixels height
      expect(gameScene.levelHeight).toBe(192);
    });

    it('should use maximum width between platforms and map_matrix', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 100, width: 500 } // Max platform width: 500
        ],
        map_matrix: [
          [{ tileKey: "terrain_grass_block", type: "ground" }, { tileKey: "bush", type: "decorative" }, { tileKey: "rock", type: "decorative" }]
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      // Platform max: 500, map_matrix: 3 columns * 64 = 192, so should use 500
      expect(gameScene.levelWidth).toBe(500);
    });

    it('should use maximum height between platforms and map_matrix', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 100, width: 500 } // Max platform y: 100
        ],
        map_matrix: [
          [{ tileKey: "terrain_grass_block", type: "ground" }],
          [{ tileKey: "terrain_grass_block", type: "ground" }],
          [{ tileKey: "terrain_grass_block", type: "ground" }]
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      // Platform max y: 100, map_matrix: 3 rows * 64 = 192, so should use 192
      expect(gameScene.levelHeight).toBe(192);
    });

    it('should handle empty map_matrix gracefully', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 100, width: 500 }
        ],
        map_matrix: []
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      expect(gameScene.levelWidth).toBe(500);
      expect(gameScene.levelHeight).toBe(100);
    });

    it('should handle map_matrix with empty rows gracefully', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 100, width: 500 }
        ],
        map_matrix: [[]]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      expect(gameScene.levelWidth).toBe(500);
      expect(gameScene.levelHeight).toBe(100);
    });
  });

  describe('Player Spawn Configuration', () => {
    it('should read player spawn coordinates from level configuration', () => {
      const testConfig = {
        playerSpawn: { x: 200, y: 400 },
        platforms: [
          { x: 0, y: 500, width: 1000 }
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      expect(gameScene.player).toBeDefined();
      expect(gameScene.player.x).toBe(200);
      expect(gameScene.player.y).toBe(400);
    });

    it('should use default spawn position if not configured', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 500, width: 1000 }
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      expect(gameScene.player).toBeDefined();
      expect(gameScene.player.x).toBe(100); // Default x
      expect(gameScene.player.y).toBeLessThan(500); // Should be above ground
    });

    it('should spawn player above the lowest ground platform', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 500, width: 1000, type: 'ground' },
          { x: 1000, y: 300, width: 500, type: 'ground' },
          { x: 1500, y: 600, width: 300, type: 'ground' }
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      const groundPlatforms = testConfig.platforms.filter(p => p.type === 'ground');
      const lowestGroundY = Math.min(...groundPlatforms.map(p => p.y));
      expect(gameScene.player.y).toBeLessThan(lowestGroundY);
    });
  });

  describe('Camera Bounds Configuration', () => {
    it('should set camera bounds based on calculated level dimensions', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 100, width: 1000 },
          { x: 500, y: 200, width: 200 },
          { x: 2000, y: 300, width: 500 }
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      const expectedWidth = Math.max(0 + 1000, 500 + 200, 2000 + 500);
      const expectedHeight = Math.max(100, 200, 300);
      expect(gameScene.levelWidth).toBe(expectedWidth);
      expect(gameScene.levelHeight).toBe(expectedHeight);
    });
  });

  describe('Floor Coordinate System', () => {
    it('should use y=0 as floor level', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 0, width: 1000, type: 'ground' },
          { x: 500, y: 100, width: 200, type: 'floating' }
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      expect(gameScene.levelHeight).toBe(100); // Max platform y-coordinate
    });

    it('should not use hardcoded 656 value for ground level', () => {
      const testConfig = {
        platforms: [
          { x: 0, y: 100, width: 1000, type: 'ground' }
        ]
      };
      const mockScene = createPhaserSceneMock('GameScene');
      const gameScene = new GameScene(mockScene, testConfig);
      gameScene.create();
      expect(gameScene.levelHeight).toBe(100);
      expect(gameScene.levelHeight).not.toBe(656);
    });
  });
}); 
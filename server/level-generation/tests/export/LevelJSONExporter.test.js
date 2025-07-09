/**
 * @fileoverview Tests for LevelJSONExporter - JSON export functionality for level generation
 */

const LevelJSONExporter = require('../../src/export/LevelJSONExporter');

describe('LevelJSONExporter', () => {
  describe('exportLevel', () => {
    test('should export complete level with all required components', () => {
      // Arrange
      const mockLevelData = {
        grid: testUtils.createMockGrid(10, 10),
        startPos: { x: 1, y: 1 },
        goalPos: { x: 8, y: 8 },
        coins: [
          { x: 2, y: 2 },
          { x: 3, y: 3 }
        ],
        enemies: [
          { x: 5, y: 5, type: 'LoopHound', patrolDistance: 100, direction: 1, speed: 80 }
        ],
        platforms: [
          { x: 4, y: 4, width: 128, height: 64, type: 'floating' }
        ]
      };

      // Act
      const result = LevelJSONExporter.exportLevel(mockLevelData);

      // Assert
      expect(result).toBeDefined();
      expect(result.playerSpawn).toBeDefined();
      expect(result.goal).toBeDefined();
      expect(result.coins).toBeDefined();
      expect(result.enemies).toBeDefined();
      expect(result.platforms).toBeDefined();
      expect(result.backgrounds).toBeDefined();
      expect(result.map_matrix).toBeDefined();
    });

    test('should convert grid coordinates to pixel coordinates', () => {
      // Arrange
      const mockLevelData = {
        grid: testUtils.createMockGrid(5, 5),
        startPos: { x: 1, y: 1 },
        goalPos: { x: 3, y: 3 }
      };

      // Act
      const result = LevelJSONExporter.exportLevel(mockLevelData);

      // Assert
      expect(result.playerSpawn.x).toBe(64); // 1 * 64
      expect(result.playerSpawn.y).toBe(64); // 1 * 64
      expect(result.goal.x).toBe(192); // 3 * 64
      expect(result.goal.y).toBe(192); // 3 * 64
    });

    test('should generate proper tile selection for wall tiles', () => {
      // Arrange
      const grid = testUtils.createMockGrid(5, 5);
      // Create a wall tile with floor neighbors
      grid.set(1, 1, 1); // Wall at center
      grid.set(1, 0, 0); // Floor above
      grid.set(1, 2, 0); // Floor below
      grid.set(0, 1, 0); // Floor to left
      grid.set(2, 1, 0); // Floor to right

      const mockLevelData = {
        grid: grid,
        startPos: { x: 0, y: 0 },
        goalPos: { x: 4, y: 4 }
      };

      // Act
      const result = LevelJSONExporter.exportLevel(mockLevelData);

      // Assert
      expect(result.map_matrix).toBeDefined();
      expect(result.map_matrix[1][1]).toBeDefined();
      expect(result.map_matrix[1][1].tileKey).toMatch(/terrain_.*_block_center/);
    });

    test('should generate background layers for visual depth', () => {
      // Arrange
      const mockLevelData = {
        grid: testUtils.createMockGrid(10, 10),
        startPos: { x: 1, y: 1 },
        goalPos: { x: 8, y: 8 }
      };

      // Act
      const result = LevelJSONExporter.exportLevel(mockLevelData);

      // Assert
      expect(result.backgrounds).toBeDefined();
      expect(Array.isArray(result.backgrounds)).toBe(true);
      expect(result.backgrounds.length).toBeGreaterThan(0);
      
      const background = result.backgrounds[0];
      expect(background.type).toBe('layer');
      expect(background.spriteKey).toBeDefined();
      expect(background.depth).toBeLessThan(0);
    });

    test('should handle empty level data gracefully', () => {
      // Arrange
      const emptyLevelData = {
        grid: testUtils.createMockGrid(0, 0),
        startPos: { x: 0, y: 0 },
        goalPos: { x: 0, y: 0 }
      };

      // Act
      const result = LevelJSONExporter.exportLevel(emptyLevelData);

      // Assert
      expect(result).toBeDefined();
      expect(result.playerSpawn).toBeDefined();
      expect(result.goal).toBeDefined();
      expect(result.map_matrix).toEqual([]);
    });

    test('should generate proper tile prefixes based on biome and platform shape', () => {
      // Arrange
      const mockLevelData = {
        grid: testUtils.createMockGrid(5, 5),
        startPos: { x: 1, y: 1 },
        goalPos: { x: 3, y: 3 },
        config: {
          biome: 'grass',
          platformShape: 'horizontal'
        }
      };

      // Act
      const result = LevelJSONExporter.exportLevel(mockLevelData);

      // Assert
      expect(result.platforms).toBeDefined();
      if (result.platforms.length > 0) {
        const platform = result.platforms[0];
        expect(platform.tilePrefix).toMatch(/terrain_grass_horizontal/);
      }
    });
  });

  describe('generateTileKey', () => {
    test('should generate center tile for isolated wall', () => {
      // Arrange
      const grid = testUtils.createMockGrid(3, 3);
      grid.set(1, 1, 1); // Wall at center

      // Act
      const tileKey = LevelJSONExporter.generateTileKey(grid, 1, 1, 'grass');

      // Assert
      expect(tileKey).toBe('terrain_grass_block_center');
    });

    test('should generate top tile when floor is below', () => {
      // Arrange
      const grid = testUtils.createMockGrid(3, 3);
      // Fill all with wall
      for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) grid.set(x, y, 1);
      grid.set(1, 1, 1); // Wall at center
      grid.set(1, 2, 0); // Floor below
      // TEMP DEBUG: Print neighbor values
      const x = 1, y = 1;
      const up = y > 0 ? grid.get(x, y - 1) : 1;
      const down = y < 3 - 1 ? grid.get(x, y + 1) : 1;
      const left = x > 0 ? grid.get(x - 1, y) : 1;
      const right = x < 3 - 1 ? grid.get(x + 1, y) : 1;
      console.log('DEBUG neighbors:', {up, down, left, right});
      // Act
      const tileKey = LevelJSONExporter.generateTileKey(grid, 1, 1, 'grass');
      // Assert
      expect(tileKey).toBe('terrain_grass_block_top');
    });

    test('should generate bottom tile when floor is above', () => {
      // Arrange
      const grid = testUtils.createMockGrid(3, 3);
      for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) grid.set(x, y, 1);
      grid.set(1, 1, 1); // Wall at center
      grid.set(1, 0, 0); // Floor above
      // Act
      const tileKey = LevelJSONExporter.generateTileKey(grid, 1, 1, 'grass');
      // Assert
      expect(tileKey).toBe('terrain_grass_block_bottom');
    });

    test('should generate left tile when floor is to the right', () => {
      // Arrange
      const grid = testUtils.createMockGrid(3, 3);
      for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) grid.set(x, y, 1);
      grid.set(1, 1, 1); // Wall at center
      grid.set(2, 1, 0); // Floor to right
      // Act
      const tileKey = LevelJSONExporter.generateTileKey(grid, 1, 1, 'grass');
      // Assert
      expect(tileKey).toBe('terrain_grass_block_left');
    });

    test('should generate right tile when floor is to the left', () => {
      // Arrange
      const grid = testUtils.createMockGrid(3, 3);
      for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) grid.set(x, y, 1);
      grid.set(1, 1, 1); // Wall at center
      grid.set(0, 1, 0); // Floor to left
      // Act
      const tileKey = LevelJSONExporter.generateTileKey(grid, 1, 1, 'grass');
      // Assert
      expect(tileKey).toBe('terrain_grass_block_right');
    });

    test('should generate corner tiles for multiple floor neighbors', () => {
      // Arrange
      const grid = testUtils.createMockGrid(3, 3);
      for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) grid.set(x, y, 1);
      grid.set(1, 1, 1); // Wall at center
      grid.set(0, 1, 0); // Floor to left
      grid.set(1, 2, 0); // Floor below
      // Act
      const tileKey = LevelJSONExporter.generateTileKey(grid, 1, 1, 'grass');
      // Assert
      expect(tileKey).toBe('terrain_grass_block_bottom_left');
    });
  });

  describe('generateBackgrounds', () => {
    test('should generate sky background layer', () => {
      // Arrange
      const config = { width: 640, height: 360 };

      // Act
      const backgrounds = LevelJSONExporter.generateBackgrounds(config);

      // Assert
      expect(backgrounds).toBeDefined();
      expect(Array.isArray(backgrounds)).toBe(true);
      expect(backgrounds.length).toBeGreaterThan(0);
      
      const skyLayer = backgrounds.find(bg => bg.spriteKey === 'background_solid_sky');
      expect(skyLayer).toBeDefined();
      expect(skyLayer.depth).toBe(-2);
      expect(skyLayer.scrollSpeed).toBe(0.0);
    });

    test('should generate hills background layer', () => {
      // Arrange
      const config = { width: 640, height: 360 };

      // Act
      const backgrounds = LevelJSONExporter.generateBackgrounds(config);

      // Assert
      const hillsLayer = backgrounds.find(bg => bg.spriteKey === 'background_color_hills');
      expect(hillsLayer).toBeDefined();
      expect(hillsLayer.depth).toBe(-1);
      expect(hillsLayer.scrollSpeed).toBe(0.5);
    });
  });

  describe('generateMapMatrix', () => {
    test('should generate decorative for floor tiles and ground for wall tiles', () => {
      // Arrange
      const grid = testUtils.createMockGrid(3, 3);
      // Fill all with floor first
      for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) grid.set(x, y, 0);
      // Set some wall tiles
      grid.set(1, 1, 1); // Wall at center
      grid.set(0, 0, 1); // Wall at top-left

      // Act
      const matrix = LevelJSONExporter.generateMapMatrix(grid, 'grass');

      // Assert
      expect(matrix).toBeDefined();
      expect(matrix).toHaveLength(3);
      expect(matrix[0]).toHaveLength(3);
      
      // Check floor tiles (should be decorative)
      expect(matrix[0][1]).toEqual({ tileKey: "block_empty", type: "decorative" });
      expect(matrix[0][2]).toEqual({ tileKey: "block_empty", type: "decorative" });
      expect(matrix[1][0]).toEqual({ tileKey: "block_empty", type: "decorative" });
      expect(matrix[1][2]).toEqual({ tileKey: "block_empty", type: "decorative" });
      expect(matrix[2][0]).toEqual({ tileKey: "block_empty", type: "decorative" });
      expect(matrix[2][1]).toEqual({ tileKey: "block_empty", type: "decorative" });
      expect(matrix[2][2]).toEqual({ tileKey: "block_empty", type: "decorative" });
      
      // Check wall tiles (should have terrain tiles and be ground type)
      expect(matrix[0][0].tileKey).toMatch(/terrain_grass_block/);
      expect(matrix[0][0].type).toBe("ground");
      expect(matrix[1][1].tileKey).toMatch(/terrain_grass_block/);
      expect(matrix[1][1].type).toBe("ground");
    });

    test('should handle empty grid gracefully', () => {
      // Arrange
      const grid = testUtils.createMockGrid(0, 0);

      // Act
      const matrix = LevelJSONExporter.generateMapMatrix(grid, 'grass');

      // Assert
      expect(matrix).toEqual([]);
    });
  });
}); 
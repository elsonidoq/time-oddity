/**
 * @fileoverview Tests for JSONSchemaValidator - Schema validation for level JSON format
 */

const JSONSchemaValidator = require('../../src/validation/JSONSchemaValidator');

describe('JSONSchemaValidator', () => {
  describe('validateLevelJSON', () => {
    test('should validate complete valid level JSON', () => {
      // Arrange
      const validLevelJSON = {
        playerSpawn: { x: 200, y: 870 },
        goal: {
          x: 4000,
          y: 850,
          tileKey: "sign_exit",
          isFullBlock: true
        },
        platforms: [
          {
            type: "ground",
            x: 0,
            y: 2900,
            width: 6000,
            tilePrefix: "terrain_grass_horizontal",
            isFullBlock: true
          }
        ],
        coins: [
          { type: "coin", x: 400, y: 850, properties: { value: 100 } }
        ],
        enemies: [
          {
            type: "LoopHound",
            x: 300,
            y: 2900,
            patrolDistance: 150,
            direction: 1,
            speed: 80
          }
        ],
        backgrounds: [
          {
            type: "layer",
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: "background_solid_sky",
            depth: -2,
            scrollSpeed: 0.0
          }
        ],
        map_matrix: [
          [
            { tileKey: "terrain_grass_block", type: "ground" },
            { tileKey: "bush", type: "decorative" }
          ]
        ]
      };

      // Act
      const result = JSONSchemaValidator.validateLevelJSON(validLevelJSON);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject level with invalid tile key', () => {
      // Arrange
      const invalidLevelJSON = {
        playerSpawn: { x: 200, y: 870 },
        goal: {
          x: 4000,
          y: 850,
          tileKey: "invalid_tile_key",
          isFullBlock: true
        },
        platforms: [],
        coins: [],
        enemies: [],
        backgrounds: [],
        map_matrix: []
      };

      // Act
      const result = JSONSchemaValidator.validateLevelJSON(invalidLevelJSON);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('tileKey'))).toBe(true);
    });

    test('should reject level with invalid enemy configuration', () => {
      // Arrange
      const invalidLevelJSON = {
        playerSpawn: { x: 200, y: 870 },
        goal: {
          x: 4000,
          y: 850,
          tileKey: "sign_exit",
          isFullBlock: true
        },
        platforms: [],
        coins: [],
        enemies: [
          {
            type: "LoopHound",
            x: 300,
            y: 2900,
            patrolDistance: 1000, // Invalid: too large
            direction: 1,
            speed: 80
          }
        ],
        backgrounds: [],
        map_matrix: []
      };

      // Act
      const result = JSONSchemaValidator.validateLevelJSON(invalidLevelJSON);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('patrolDistance'))).toBe(true);
    });

    test('should reject level with invalid background configuration', () => {
      // Arrange
      const invalidLevelJSON = {
        playerSpawn: { x: 200, y: 870 },
        goal: {
          x: 4000,
          y: 850,
          tileKey: "sign_exit",
          isFullBlock: true
        },
        platforms: [],
        coins: [],
        enemies: [],
        backgrounds: [
          {
            type: "layer",
            x: 640,
            y: 360,
            width: 1280,
            height: 720,
            spriteKey: "invalid_background_sprite",
            depth: 1, // Invalid: positive depth for background
            scrollSpeed: 0.0
          }
        ],
        map_matrix: []
      };

      // Act
      const result = JSONSchemaValidator.validateLevelJSON(invalidLevelJSON);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('depth') || error.includes('spriteKey'))).toBe(true);
    });

    test('should reject level with invalid map matrix', () => {
      // Arrange
      const invalidLevelJSON = {
        playerSpawn: { x: 200, y: 870 },
        goal: {
          x: 4000,
          y: 850,
          tileKey: "sign_exit",
          isFullBlock: true
        },
        platforms: [],
        coins: [],
        enemies: [],
        backgrounds: [],
        map_matrix: [
          [
            { tileKey: "invalid_tile", type: "invalid_type" }
          ]
        ]
      };

      // Act
      const result = JSONSchemaValidator.validateLevelJSON(invalidLevelJSON);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('tileKey') || error.includes('type'))).toBe(true);
    });

    test('should validate level with minimal required fields', () => {
      // Arrange
      const minimalLevelJSON = {
        playerSpawn: { x: 200, y: 870 },
        goal: {
          x: 4000,
          y: 850,
          tileKey: "sign_exit",
          isFullBlock: true
        }
      };

      // Act
      const result = JSONSchemaValidator.validateLevelJSON(minimalLevelJSON);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject level with missing required fields', () => {
      // Arrange
      const invalidLevelJSON = {
        // Missing playerSpawn
        goal: {
          x: 4000,
          y: 850,
          tileKey: "sign_exit",
          isFullBlock: true
        }
      };

      // Act
      const result = JSONSchemaValidator.validateLevelJSON(invalidLevelJSON);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('playerSpawn'))).toBe(true);
    });

    test('should reject level with invalid coordinate values', () => {
      // Arrange
      const invalidLevelJSON = {
        playerSpawn: { x: -100, y: 870 }, // Invalid negative x
        goal: {
          x: 4000,
          y: 850,
          tileKey: "sign_exit",
          isFullBlock: true
        }
      };

      // Act
      const result = JSONSchemaValidator.validateLevelJSON(invalidLevelJSON);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('coordinate') || error.includes('negative'))).toBe(true);
    });
  });

  describe('validateTileKey', () => {
    test('should validate valid tile keys', () => {
      // Arrange
      const validTileKeys = [
        'terrain_grass_block',
        'terrain_dirt_block',
        'terrain_stone_block',
        'sign_exit',
        'bush',
        'rock'
      ];

      // Act & Assert
      validTileKeys.forEach(tileKey => {
        const result = JSONSchemaValidator.validateTileKey(tileKey);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    test('should reject invalid tile keys', () => {
      // Arrange
      const invalidTileKeys = [
        'invalid_tile',
        'terrain_invalid_block',
        'nonexistent_sprite'
      ];

      // Act & Assert
      invalidTileKeys.forEach(tileKey => {
        const result = JSONSchemaValidator.validateTileKey(tileKey);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('validateEnemyConfiguration', () => {
    test('should validate valid LoopHound configuration', () => {
      // Arrange
      const validEnemy = {
        type: "LoopHound",
        x: 300,
        y: 2900,
        patrolDistance: 150,
        direction: 1,
        speed: 80
      };

      // Act
      const result = JSONSchemaValidator.validateEnemyConfiguration(validEnemy);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject LoopHound with invalid patrol distance', () => {
      // Arrange
      const invalidEnemy = {
        type: "LoopHound",
        x: 300,
        y: 2900,
        patrolDistance: 1000, // Too large
        direction: 1,
        speed: 80
      };

      // Act
      const result = JSONSchemaValidator.validateEnemyConfiguration(invalidEnemy);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('patrolDistance'))).toBe(true);
    });

    test('should reject LoopHound with invalid direction', () => {
      // Arrange
      const invalidEnemy = {
        type: "LoopHound",
        x: 300,
        y: 2900,
        patrolDistance: 150,
        direction: 2, // Invalid: should be 1 or -1
        speed: 80
      };

      // Act
      const result = JSONSchemaValidator.validateEnemyConfiguration(invalidEnemy);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('direction'))).toBe(true);
    });
  });

  describe('validateBackgroundConfiguration', () => {
    test('should validate valid background configuration', () => {
      // Arrange
      const validBackground = {
        type: "layer",
        x: 640,
        y: 360,
        width: 1280,
        height: 720,
        spriteKey: "background_solid_sky",
        depth: -2,
        scrollSpeed: 0.0
      };

      // Act
      const result = JSONSchemaValidator.validateBackgroundConfiguration(validBackground);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject background with positive depth', () => {
      // Arrange
      const invalidBackground = {
        type: "layer",
        x: 640,
        y: 360,
        width: 1280,
        height: 720,
        spriteKey: "background_solid_sky",
        depth: 1, // Invalid: should be negative
        scrollSpeed: 0.0
      };

      // Act
      const result = JSONSchemaValidator.validateBackgroundConfiguration(invalidBackground);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('depth'))).toBe(true);
    });

    test('should reject background with invalid sprite key', () => {
      // Arrange
      const invalidBackground = {
        type: "layer",
        x: 640,
        y: 360,
        width: 1280,
        height: 720,
        spriteKey: "invalid_background_sprite",
        depth: -2,
        scrollSpeed: 0.0
      };

      // Act
      const result = JSONSchemaValidator.validateBackgroundConfiguration(invalidBackground);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('spriteKey'))).toBe(true);
    });
  });
}); 
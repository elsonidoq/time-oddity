/**
 * @fileoverview LevelJSONExporter - Exports level data to JSON format with proper tile selection
 */

const GridUtilities = require('../core/GridUtilities');

class LevelJSONExporter {
  /**
   * Exports complete level data to JSON format
   * @param {Object} levelData - The level data to export
   * @param {Object} levelData.grid - The level grid (ndarray)
   * @param {Object} levelData.startPos - Player spawn position
   * @param {Object} levelData.goalPos - Goal position
   * @param {Array} levelData.coins - Array of coin positions
   * @param {Array} levelData.enemies - Array of enemy configurations
   * @param {Array} levelData.platforms - Array of platform configurations
   * @param {Object} levelData.config - Generation configuration
   * @returns {Object} The exported level JSON
   */
  static exportLevel(levelData) {
    const { grid, startPos, goalPos, coins = [], enemies = [], platforms = [], config = {} } = levelData;
    const tileSize = 64;
    
    // Select biome and platform shape randomly
    const biome = config.biome || this.selectRandomBiome();
    const platformShape = config.platformShape || this.selectRandomPlatformShape();
    
    const result = {
      playerSpawn: {
        x: startPos.x * tileSize,
        y: startPos.y * tileSize
      },
      goal: {
        x: goalPos.x * tileSize,
        y: goalPos.y * tileSize,
        tileKey: "sign_exit",
        isFullBlock: true
      },
      platforms: this.convertPlatformsToJSON(platforms, tileSize, biome, platformShape),
      coins: this.convertCoinsToJSON(coins, tileSize),
      enemies: this.convertEnemiesToJSON(enemies, tileSize),
      backgrounds: this.generateBackgrounds({ width: grid.shape[0] * tileSize, height: grid.shape[1] * tileSize }),
      map_matrix: this.generateMapMatrix(grid, biome)
    };

    return result;
  }

  /**
   * Generates tile key based on neighbor analysis
   * @param {Object} grid - The level grid
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} biome - The biome type
   * @returns {string} The tile key
   */
  static generateTileKey(grid, x, y, biome) {
    const [width, height] = grid.shape;
    // 0 = floor, 1 = wall
    const up = y > 0 ? grid.get(x, y - 1) : 1;
    const down = y < height - 1 ? grid.get(x, y + 1) : 1;
    const left = x > 0 ? grid.get(x - 1, y) : 1;
    const right = x < width - 1 ? grid.get(x + 1, y) : 1;

    // Neighbor analysis for tileKey selection
    // Only DOWN is floor
    if (down === 0 && up !== 0 && left !== 0 && right !== 0) return `terrain_${biome}_block_bottom`;
    // Only UP is floor
    if (up === 0 && down !== 0 && left !== 0 && right !== 0) return `terrain_${biome}_block_top`;
    // Only RIGHT is floor
    if (right === 0 && up !== 0 && down !== 0 && left !== 0) return `terrain_${biome}_block_right`;
    // Only LEFT is floor
    if (left === 0 && up !== 0 && down !== 0 && right !== 0) return `terrain_${biome}_block_left`;
    // Only UP and LEFT are floor
    if (up === 0 && left === 0 && down !== 0 && right !== 0) return `terrain_${biome}_block_top_left`;
    // Only UP and RIGHT are floor
    if (up === 0 && right === 0 && down !== 0 && left !== 0) return `terrain_${biome}_block_top_right`;
    // Only DOWN and LEFT are floor
    if (down === 0 && left === 0 && up !== 0 && right !== 0) return `terrain_${biome}_block_bottom_left`;
    // Only DOWN and RIGHT are floor
    if (down === 0 && right === 0 && up !== 0 && left !== 0) return `terrain_${biome}_block_bottom_right`;
    // No neighbors are floor
     if (up !== 0 && down !== 0 && left !== 0 && right !== 0) return `terrain_${biome}_block_center`;

     // horizontal tiles
     if (up === 0 && down === 0 && left === 0 && right !== 0) return `terrain_${biome}_horizontal_left`;
     if (up === 0 && down === 0 && left !== 0 && right === 0) return `terrain_${biome}_horizontal_right`;
     if (up === 0 && down === 0 && left !== 0 && right !== 0) return `terrain_${biome}_horizontal_middle`;
     if (up === 0 && down !== 0 && left === 0 && right === 0) return `terrain_${biome}_vertical_top`;
     if (up !== 0 && down === 0 && left === 0 && right === 0) return `terrain_${biome}_vertical_bottom`;
     if (up !== 0 && down !== 0 && left === 0 && right === 0) return `terrain_${biome}_vertical_middle`;

    // Default to center for complex patterns
    return `terrain_${biome}_block_center`;
  }

  /**
   * Generates map matrix from grid with proper tile selection
   * @param {Object} grid - The level grid
   * @param {string} biome - The biome type
   * @returns {Array} The map matrix
   */
  static generateMapMatrix(grid, biome) {
    const [width, height] = grid.shape;
    const matrix = [];

    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        const value = grid.get(x, y);
        if (value === 1) {
          // Wall tile - generate proper tile key based on neighbors, type: "ground"
          const tileKey = this.generateTileKey(grid, x, y, biome);
          row.push({ tileKey, type: "ground" });
        } else {
          // Floor tile - use block_empty, type: "decorative" (visual only, no collision)
          row.push(null);
        }
      }
      matrix.push(row);
    }

    return matrix;
  }

  /**
   * Converts platforms to JSON format
   * @param {Array} platforms - Array of platform objects
   * @param {number} tileSize - Tile size in pixels
   * @param {string} biome - The biome type
   * @param {string} platformShape - The platform shape
   * @returns {Array} Array of platform JSON objects
   */
  static convertPlatformsToJSON(platforms, tileSize, biome, platformShape) {
    return platforms.map(platform => {
      const tilePrefix = `terrain_${biome}_${platformShape}`;
      
      return {
        type: platform.type || "floating",
        x: platform.x * tileSize,
        y: platform.y * tileSize,
        width: platform.width || tileSize,
        tilePrefix,
        isFullBlock: true
      };
    });
  }

  /**
   * Converts coins to JSON format
   * @param {Array} coins - Array of coin positions
   * @param {number} tileSize - Tile size in pixels
   * @returns {Array} Array of coin JSON objects
   */
  static convertCoinsToJSON(coins, tileSize) {
    return coins.map(coin => ({
      type: "coin",
      x: coin.x * tileSize,
      y: coin.y * tileSize,
      properties: { value: 100 }
    }));
  }

  /**
   * Converts enemies to JSON format
   * @param {Array} enemies - Array of enemy configurations
   * @param {number} tileSize - Tile size in pixels
   * @returns {Array} Array of enemy JSON objects
   */
  static convertEnemiesToJSON(enemies, tileSize) {
    return enemies.map(enemy => ({
      type: enemy.type || "LoopHound",
      x: enemy.x * tileSize,
      y: enemy.y * tileSize,
      patrolDistance: enemy.patrolDistance || 200,
      direction: enemy.direction || 1,
      speed: enemy.speed || 80
    }));
  }

  /**
   * Generates background layers for visual depth
   * @param {Object} config - Configuration with width and height
   * @returns {Array} Array of background layer objects
   */
  static generateBackgrounds(config) {
    const { width, height } = config;
    
    return [
      {
        type: "layer",
        x: width / 2,
        y: height / 2,
        width: width,
        height: height,
        spriteKey: "background_solid_sky",
        depth: -2,
        scrollSpeed: 0.0
      },
      {
        type: "layer",
        x: width / 2,
        y: height / 2,
        width: width,
        height: height,
        spriteKey: "background_color_hills",
        depth: -1,
        scrollSpeed: 0.5
      }
    ];
  }

  /**
   * Selects a random biome
   * @returns {string} The selected biome
   */
  static selectRandomBiome() {
    const biomes = ['grass', 'dirt', 'sand', 'snow', 'stone', 'purple'];
    return biomes[Math.floor(Math.random() * biomes.length)];
  }

  /**
   * Selects a random platform shape
   * @returns {string} The selected platform shape
   */
  static selectRandomPlatformShape() {
    const shapes = ['horizontal', 'cloud'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  }
}

module.exports = LevelJSONExporter; 
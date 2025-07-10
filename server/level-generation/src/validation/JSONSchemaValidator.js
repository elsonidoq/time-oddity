/**
 * @fileoverview JSONSchemaValidator - Validates level JSON against format specification
 */

class JSONSchemaValidator {
  // Valid tile keys from available_tiles.md
  static VALID_TILE_KEYS = [
    'terrain_grass_block', 'terrain_grass_block_bottom', 'terrain_grass_block_bottom_left',
    'terrain_grass_block_bottom_right', 'terrain_grass_block_center', 'terrain_grass_block_left',
    'terrain_grass_block_right', 'terrain_grass_block_top', 'terrain_grass_block_top_left',
    'terrain_grass_block_top_right', 'terrain_grass_horizontal', 'terrain_grass_horizontal_left',
    'terrain_grass_horizontal_middle', 'terrain_grass_horizontal_right',
    'terrain_dirt_block', 'terrain_dirt_block_bottom', 'terrain_dirt_block_bottom_left',
    'terrain_dirt_block_bottom_right', 'terrain_dirt_block_center', 'terrain_dirt_block_left',
    'terrain_dirt_block_right', 'terrain_dirt_block_top', 'terrain_dirt_block_top_left',
    'terrain_dirt_block_top_right', 'terrain_dirt_horizontal', 'terrain_dirt_horizontal_left',
    'terrain_dirt_horizontal_middle', 'terrain_dirt_horizontal_right',
    'terrain_stone_block', 'terrain_stone_block_bottom', 'terrain_stone_block_bottom_left',
    'terrain_stone_block_bottom_right', 'terrain_stone_block_center', 'terrain_stone_block_left',
    'terrain_stone_block_right', 'terrain_stone_block_top', 'terrain_stone_block_top_left',
    'terrain_stone_block_top_right', 'terrain_stone_horizontal', 'terrain_stone_horizontal_left',
    'terrain_stone_horizontal_middle', 'terrain_stone_horizontal_right',
    'terrain_sand_block', 'terrain_sand_block_bottom', 'terrain_sand_block_bottom_left',
    'terrain_sand_block_bottom_right', 'terrain_sand_block_center', 'terrain_sand_block_left',
    'terrain_sand_block_right', 'terrain_sand_block_top', 'terrain_sand_block_top_left',
    'terrain_sand_block_top_right', 'terrain_sand_horizontal', 'terrain_sand_horizontal_left',
    'terrain_sand_horizontal_middle', 'terrain_sand_horizontal_right',
    'terrain_snow_block', 'terrain_snow_block_bottom', 'terrain_snow_block_bottom_left',
    'terrain_snow_block_bottom_right', 'terrain_snow_block_center', 'terrain_snow_block_left',
    'terrain_snow_block_right', 'terrain_snow_block_top', 'terrain_snow_block_top_left',
    'terrain_snow_block_top_right', 'terrain_snow_horizontal', 'terrain_snow_horizontal_left',
    'terrain_snow_horizontal_middle', 'terrain_snow_horizontal_right',
    'terrain_purple_block', 'terrain_purple_block_bottom', 'terrain_purple_block_bottom_left',
    'terrain_purple_block_bottom_right', 'terrain_purple_block_center', 'terrain_purple_block_left',
    'terrain_purple_block_right', 'terrain_purple_block_top', 'terrain_purple_block_top_left',
    'terrain_purple_block_top_right', 'terrain_purple_horizontal', 'terrain_purple_horizontal_left',
    'terrain_purple_horizontal_middle', 'terrain_purple_horizontal_right',
    'sign_exit', 'bush', 'rock', 'hill', 'hill_top'
  ];

  // Valid background sprite keys
  static VALID_BACKGROUND_SPRITES = [
    'background_solid_sky', 'background_solid_cloud', 'background_solid_dirt',
    'background_solid_grass', 'background_solid_sand', 'background_color_desert',
    'background_color_hills', 'background_color_mushrooms', 'background_color_trees',
    'background_fade_desert', 'background_fade_hills', 'background_fade_mushrooms',
    'background_fade_trees', 'background_clouds'
  ];

  /**
   * Validates complete level JSON against format specification
   * @param {Object} levelJSON - The level JSON to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validateLevelJSON(levelJSON) {
    const errors = [];

    // Validate required fields
    if (!levelJSON.playerSpawn) {
      errors.push('Missing required field: playerSpawn');
    } else {
      const spawnErrors = this.validateCoordinates(levelJSON.playerSpawn, 'playerSpawn');
      errors.push(...spawnErrors);
    }

    if (!levelJSON.goal) {
      errors.push('Missing required field: goal');
    } else {
      const goalErrors = this.validateGoal(levelJSON.goal);
      errors.push(...goalErrors);
    }

    // Validate optional arrays
    if (levelJSON.platforms) {
      const platformErrors = this.validatePlatforms(levelJSON.platforms);
      errors.push(...platformErrors);
    }

    if (levelJSON.coins) {
      const coinErrors = this.validateCoins(levelJSON.coins);
      errors.push(...coinErrors);
    }

    if (levelJSON.enemies) {
      const enemyErrors = this.validateEnemies(levelJSON.enemies);
      errors.push(...enemyErrors);
    }

    if (levelJSON.backgrounds) {
      const backgroundErrors = this.validateBackgrounds(levelJSON.backgrounds);
      errors.push(...backgroundErrors);
    }

    if (levelJSON.map_matrix) {
      const matrixErrors = this.validateMapMatrix(levelJSON.map_matrix);
      errors.push(...matrixErrors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates tile key against available tiles
   * @param {string} tileKey - The tile key to validate
   * @returns {Object} Validation result
   */
  static validateTileKey(tileKey) {
    if (!tileKey || typeof tileKey !== 'string') {
      return {
        isValid: false,
        error: 'Tile key must be a non-empty string'
      };
    }

    if (!this.VALID_TILE_KEYS.includes(tileKey)) {
      return {
        isValid: false,
        error: `Invalid tile key: ${tileKey}. Must be one of the available tiles.`
      };
    }

    return {
      isValid: true,
      error: null
    };
  }

  /**
   * Validates enemy configuration
   * @param {Object} enemy - The enemy configuration to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validateEnemyConfiguration(enemy) {
    const errors = [];

    if (!enemy.type) {
      errors.push('Enemy type is required');
    }

    if (enemy.type === 'LoopHound') {
      if (enemy.patrolDistance && (enemy.patrolDistance < 50 || enemy.patrolDistance > 500)) {
        errors.push('LoopHound patrolDistance must be between 50 and 500 pixels');
      }

      if (enemy.direction && enemy.direction !== 1 && enemy.direction !== -1) {
        errors.push('LoopHound direction must be 1 (right) or -1 (left)');
      }

      if (enemy.speed && (enemy.speed < 10 || enemy.speed > 200)) {
        errors.push('LoopHound speed must be between 10 and 200 pixels/second');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates background configuration
   * @param {Object} background - The background configuration to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validateBackgroundConfiguration(background) {
    const errors = [];

    if (background.type !== 'layer') {
      errors.push('Background type must be "layer"');
    }

    if (!this.VALID_BACKGROUND_SPRITES.includes(background.spriteKey)) {
      errors.push(`Background spriteKey: Invalid background sprite key: ${background.spriteKey}`);
    }

    if (background.depth >= 0) {
      errors.push('Background depth must be negative for background rendering');
    }

    if (background.scrollSpeed < 0 || background.scrollSpeed > 1) {
      errors.push('Background scrollSpeed must be between 0.0 and 1.0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates coordinates
   * @param {Object} coords - The coordinates to validate
   * @param {string} fieldName - The field name for error reporting
   * @returns {Array} Array of error messages
   */
  static validateCoordinates(coords, fieldName) {
    const errors = [];

    if (typeof coords.x !== 'number' || typeof coords.y !== 'number') {
      errors.push(`${fieldName} coordinates must be numbers`);
    }

    if (coords.x < 0 || coords.y < 0) {
      errors.push(`${fieldName} coordinates must be non-negative`);
    }

    return errors;
  }

  /**
   * Validates goal configuration
   * @param {Object} goal - The goal configuration to validate
   * @returns {Array} Array of error messages
   */
  static validateGoal(goal) {
    const errors = [];

    errors.push(...this.validateCoordinates(goal, 'goal'));

    if (!goal.tileKey) {
      errors.push('Goal tileKey is required');
    } else {
      const tileValidation = this.validateTileKey(goal.tileKey);
      if (!tileValidation.isValid) {
        errors.push(`Goal tileKey: ${tileValidation.error}`);
      }
    }

    return errors;
  }

  /**
   * Validates platforms array
   * @param {Array} platforms - The platforms array to validate
   * @returns {Array} Array of error messages
   */
  static validatePlatforms(platforms) {
    const errors = [];

    if (!Array.isArray(platforms)) {
      errors.push('Platforms must be an array');
      return errors;
    }

    platforms.forEach((platform, index) => {
      if (!platform.type) {
        errors.push(`Platform ${index}: type is required`);
      }

      if (!platform.tilePrefix) {
        errors.push(`Platform ${index}: tilePrefix is required`);
      }

      errors.push(...this.validateCoordinates(platform, `Platform ${index}`));
    });

    return errors;
  }

  /**
   * Validates coins array
   * @param {Array} coins - The coins array to validate
   * @returns {Array} Array of error messages
   */
  static validateCoins(coins) {
    const errors = [];

    if (!Array.isArray(coins)) {
      errors.push('Coins must be an array');
      return errors;
    }

    coins.forEach((coin, index) => {
      if (coin.type !== 'coin') {
        errors.push(`Coin ${index}: type must be "coin"`);
      }

      errors.push(...this.validateCoordinates(coin, `Coin ${index}`));
    });

    return errors;
  }

  /**
   * Validates enemies array
   * @param {Array} enemies - The enemies array to validate
   * @returns {Array} Array of error messages
   */
  static validateEnemies(enemies) {
    const errors = [];

    if (!Array.isArray(enemies)) {
      errors.push('Enemies must be an array');
      return errors;
    }

    enemies.forEach((enemy, index) => {
      const enemyValidation = this.validateEnemyConfiguration(enemy);
      if (!enemyValidation.isValid) {
        errors.push(`Enemy ${index}: ${enemyValidation.errors.join(', ')}`);
      }

      errors.push(...this.validateCoordinates(enemy, `Enemy ${index}`));
    });

    return errors;
  }

  /**
   * Validates backgrounds array
   * @param {Array} backgrounds - The backgrounds array to validate
   * @returns {Array} Array of error messages
   */
  static validateBackgrounds(backgrounds) {
    const errors = [];

    if (!Array.isArray(backgrounds)) {
      errors.push('Backgrounds must be an array');
      return errors;
    }

    backgrounds.forEach((background, index) => {
      const backgroundValidation = this.validateBackgroundConfiguration(background);
      if (!backgroundValidation.isValid) {
        errors.push(`Background ${index}: ${backgroundValidation.errors.join(', ')}`);
      }
    });

    return errors;
  }

  /**
   * Validates map matrix
   * @param {Array} mapMatrix - The map matrix to validate
   * @returns {Array} Array of error messages
   */
  static validateMapMatrix(mapMatrix) {
    const errors = [];

    if (!Array.isArray(mapMatrix)) {
      errors.push('Map matrix must be an array');
      return errors;
    }

    mapMatrix.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) {
        errors.push(`Map matrix row ${rowIndex} must be an array`);
        return;
      }

      row.forEach((tile, colIndex) => {
        if (tile !== null) {
          if (!tile.tileKey) {
            errors.push(`Map matrix tile at [${rowIndex}][${colIndex}]: tileKey is required`);
          } else {
            const tileValidation = this.validateTileKey(tile.tileKey);
            if (!tileValidation.isValid) {
              errors.push(`Map matrix tile at [${rowIndex}][${colIndex}]: ${tileValidation.error}`);
            }
          }

          if (!tile.type || (tile.type !== 'ground' && tile.type !== 'decorative')) {
            errors.push(`Map matrix tile at [${rowIndex}][${colIndex}]: type must be "ground" or "decorative"`);
          }
        }
      });
    });

    return errors;
  }
}

module.exports = JSONSchemaValidator; 
/**
 * @fileoverview Parameter validation system for cave generation
 * Validates all input parameters against the Python specification with detailed error messages
 */

const ValidationError = require('./ValidationError');

/**
 * Parameter validator for cave generation system
 * Validates all parameters against the Python specification with detailed error messages
 */
class ParameterValidator {
  constructor() {
    // Parameter validation rules based on comprehensive documentation
    this.validationRules = {
      seed: { type: 'string', required: true },
      width: { type: 'number', min: 50, max: 200, required: true },
      height: { type: 'number', min: 30, max: 120, required: true },
      initialWallRatio: { type: 'number', min: 0.4, max: 0.55, required: true },
      simulationSteps: { type: 'number', min: 3, max: 6, required: true },
      birthThreshold: { type: 'number', min: 4, max: 6, required: true },
      survivalThreshold: { type: 'number', min: 2, max: 4, required: true },
      minRoomSize: { type: 'number', min: 20, max: 100, required: true },
      minStartGoalDistance: { type: 'number', min: 30, max: 100, required: true },
      coinCount: { type: 'number', min: 10, max: 30, required: true },
      enemyCount: { type: 'number', min: 3, max: 10, required: true }
    };
  }

  /**
   * Validates seed parameter
   * @param {*} seed - The seed value to validate
   * @throws {ValidationError} If seed is invalid
   */
  validateSeed(seed) {
    if (typeof seed !== 'string') {
      throw new ValidationError(
        'Seed must be a string',
        'seed',
        seed,
        'Provide a string value for the seed parameter'
      );
    }
  }

  /**
   * Validates width parameter
   * @param {*} width - The width value to validate
   * @throws {ValidationError} If width is invalid
   */
  validateWidth(width) {
    if (typeof width !== 'number') {
      throw new ValidationError(
        'Width must be a number',
        'width',
        width,
        'Provide a numeric value for the width parameter'
      );
    }

    if (width < 50 || width > 200) {
      throw new ValidationError(
        'Width must be between 50 and 200',
        'width',
        width,
        'Width should be between 50 and 200 for optimal cave generation'
      );
    }
  }

  /**
   * Validates height parameter
   * @param {*} height - The height value to validate
   * @throws {ValidationError} If height is invalid
   */
  validateHeight(height) {
    if (typeof height !== 'number') {
      throw new ValidationError(
        'Height must be a number',
        'height',
        height,
        'Provide a numeric value for the height parameter'
      );
    }

    if (height < 30 || height > 120) {
      throw new ValidationError(
        'Height must be between 30 and 120',
        'height',
        height,
        'Height should be between 30 and 120 for optimal cave generation'
      );
    }
  }

  /**
   * Validates initialWallRatio parameter
   * @param {*} initialWallRatio - The initial wall ratio value to validate
   * @throws {ValidationError} If initialWallRatio is invalid
   */
  validateInitialWallRatio(initialWallRatio) {
    if (typeof initialWallRatio !== 'number') {
      throw new ValidationError(
        'Initial wall ratio must be a number',
        'initialWallRatio',
        initialWallRatio,
        'Provide a numeric value between 0.4 and 0.55 for the initial wall ratio'
      );
    }

    if (initialWallRatio < 0.4 || initialWallRatio > 0.55) {
      throw new ValidationError(
        'Initial wall ratio must be between 0.4 and 0.55',
        'initialWallRatio',
        initialWallRatio,
        'Values near 0.45 produce good cave structures'
      );
    }
  }

  /**
   * Validates simulationSteps parameter
   * @param {*} simulationSteps - The simulation steps value to validate
   * @throws {ValidationError} If simulationSteps is invalid
   */
  validateSimulationSteps(simulationSteps) {
    if (typeof simulationSteps !== 'number') {
      throw new ValidationError(
        'Simulation steps must be a number',
        'simulationSteps',
        simulationSteps,
        'Provide a numeric value between 3 and 6 for simulation steps'
      );
    }

    if (simulationSteps < 3 || simulationSteps > 6) {
      throw new ValidationError(
        'Simulation steps must be between 3 and 6',
        'simulationSteps',
        simulationSteps,
        'More steps result in smoother caves, fewer steps result in noisy caves'
      );
    }
  }

  /**
   * Validates birthThreshold parameter
   * @param {*} birthThreshold - The birth threshold value to validate
   * @throws {ValidationError} If birthThreshold is invalid
   */
  validateBirthThreshold(birthThreshold) {
    if (typeof birthThreshold !== 'number') {
      throw new ValidationError(
        'Birth threshold must be a number',
        'birthThreshold',
        birthThreshold,
        'Provide a numeric value between 4 and 6 for the birth threshold'
      );
    }

    if (birthThreshold < 4 || birthThreshold > 6) {
      throw new ValidationError(
        'Birth threshold must be between 4 and 6',
        'birthThreshold',
        birthThreshold,
        'Higher values lead to more open caves'
      );
    }
  }

  /**
   * Validates survivalThreshold parameter
   * @param {*} survivalThreshold - The survival threshold value to validate
   * @throws {ValidationError} If survivalThreshold is invalid
   */
  validateSurvivalThreshold(survivalThreshold) {
    if (typeof survivalThreshold !== 'number') {
      throw new ValidationError(
        'Survival threshold must be a number',
        'survivalThreshold',
        survivalThreshold,
        'Provide a numeric value between 2 and 4 for the survival threshold'
      );
    }

    if (survivalThreshold < 2 || survivalThreshold > 4) {
      throw new ValidationError(
        'Survival threshold must be between 2 and 4',
        'survivalThreshold',
        survivalThreshold,
        'Higher values lead to more linear, corridor-like caves'
      );
    }
  }

  /**
   * Validates minRoomSize parameter
   * @param {*} minRoomSize - The minimum room size value to validate
   * @throws {ValidationError} If minRoomSize is invalid
   */
  validateMinRoomSize(minRoomSize) {
    if (typeof minRoomSize !== 'number') {
      throw new ValidationError(
        'Minimum room size must be a number',
        'minRoomSize',
        minRoomSize,
        'Provide a numeric value between 20 and 100 for minimum room size'
      );
    }

    if (minRoomSize < 20 || minRoomSize > 100) {
      throw new ValidationError(
        'Minimum room size must be between 20 and 100',
        'minRoomSize',
        minRoomSize,
        'Smaller values keep more regions, larger values cull small noisy pockets'
      );
    }
  }

  /**
   * Validates minStartGoalDistance parameter
   * @param {*} minStartGoalDistance - The minimum start-goal distance value to validate
   * @throws {ValidationError} If minStartGoalDistance is invalid
   */
  validateMinStartGoalDistance(minStartGoalDistance) {
    if (typeof minStartGoalDistance !== 'number') {
      throw new ValidationError(
        'Minimum start-goal distance must be a number',
        'minStartGoalDistance',
        minStartGoalDistance,
        'Provide a numeric value between 30 and 100 for minimum start-goal distance'
      );
    }

    if (minStartGoalDistance < 30 || minStartGoalDistance > 100) {
      throw new ValidationError(
        'Minimum start-goal distance must be between 30 and 100',
        'minStartGoalDistance',
        minStartGoalDistance,
        'This enforces a minimum level length for gameplay'
      );
    }
  }

  /**
   * Validates coinCount parameter
   * @param {*} coinCount - The coin count value to validate
   * @throws {ValidationError} If coinCount is invalid
   */
  validateCoinCount(coinCount) {
    if (typeof coinCount !== 'number') {
      throw new ValidationError(
        'Coin count must be a number',
        'coinCount',
        coinCount,
        'Provide a numeric value between 10 and 30 for coin count'
      );
    }

    if (coinCount < 10 || coinCount > 30) {
      throw new ValidationError(
        'Coin count must be between 10 and 30',
        'coinCount',
        coinCount,
        'This controls the number of collectibles placed in the level'
      );
    }
  }

  /**
   * Validates enemyCount parameter
   * @param {*} enemyCount - The enemy count value to validate
   * @throws {ValidationError} If enemyCount is invalid
   */
  validateEnemyCount(enemyCount) {
    if (typeof enemyCount !== 'number') {
      throw new ValidationError(
        'Enemy count must be a number',
        'enemyCount',
        enemyCount,
        'Provide a numeric value between 3 and 10 for enemy count'
      );
    }

    if (enemyCount < 3 || enemyCount > 10) {
      throw new ValidationError(
        'Enemy count must be between 3 and 10',
        'enemyCount',
        enemyCount,
        'This controls the number of enemies placed in the level'
      );
    }
  }

  /**
   * Validates all parameters in a configuration object
   * @param {Object} config - The configuration object to validate
   * @throws {ValidationError} If any parameter is invalid
   */
  validateAll(config) {
    if (!config || typeof config !== 'object') {
      throw new ValidationError(
        'Configuration must be an object',
        'config',
        config,
        'Provide a valid configuration object with all required parameters'
      );
    }

    // Validate each parameter
    this.validateSeed(config.seed);
    this.validateWidth(config.width);
    this.validateHeight(config.height);
    this.validateInitialWallRatio(config.initialWallRatio);
    this.validateSimulationSteps(config.simulationSteps);
    this.validateBirthThreshold(config.birthThreshold);
    this.validateSurvivalThreshold(config.survivalThreshold);
    this.validateMinRoomSize(config.minRoomSize);
    this.validateMinStartGoalDistance(config.minStartGoalDistance);
    this.validateCoinCount(config.coinCount);
    this.validateEnemyCount(config.enemyCount);
  }

  /**
   * Gets the default configuration with all valid parameters
   * @returns {Object} Default configuration object
   */
  getDefaultConfig() {
    return {
      seed: 'time-oddity-level-1',
      width: 100,
      height: 60,
      initialWallRatio: 0.45,
      simulationSteps: 4,
      birthThreshold: 5,
      survivalThreshold: 4,
      minRoomSize: 50,
      minStartGoalDistance: 40,
      coinCount: 15,
      enemyCount: 5
    };
  }

  /**
   * Validates a configuration and returns a validated config with defaults
   * @param {Object} config - The configuration to validate
   * @returns {Object} Validated configuration with defaults for missing values
   * @throws {ValidationError} If any provided parameter is invalid
   */
  validateAndMergeDefaults(config) {
    const defaultConfig = this.getDefaultConfig();
    const mergedConfig = { ...defaultConfig, ...config };
    
    this.validateAll(mergedConfig);
    return mergedConfig;
  }
}

module.exports = ParameterValidator; 
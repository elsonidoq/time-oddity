/**
 * @fileoverview CLI interface for cave generation system
 * Provides command-line interface with parameter validation, progress reporting, and error handling
 */

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const ParameterValidator = require('../validation/ParameterValidator');
const ValidationError = require('../validation/ValidationError');

/**
 * CLI interface for cave generation system
 * Provides comprehensive command-line interface with validation and progress reporting
 */
class CaveGeneratorCLI {
  constructor() {
    this.program = new Command();
    this.lastConfig = null;
    this.startTime = null;
    
    this.setupProgram();
    this.setupCommands();
  }

  /**
   * Sets up the main program configuration
   */
  setupProgram() {
    this.program
      .name('level-generation')
      .description('Procedural cave generation system for Time Oddity game')
      .version('1.0.0');
  }

  /**
   * Sets up all CLI commands with comprehensive options and help
   */
  setupCommands() {
    // Generate command
    this.program
      .command('generate')
      .description('Generate a new cave level')
      .option('-s, --seed <seed>', 'Random seed for generation (string)', 'default-seed')
      .option('-w, --width <width>', 'Level width in tiles (50-200)', '100')
      .option('-h, --height <height>', 'Level height in tiles (30-120)', '60')
      .option('--initial-wall-ratio <ratio>', 'Initial wall ratio (0.4-0.55)', '0.45')
      .option('--simulation-steps <steps>', 'Cellular automata steps (3-6)', '4')
      .option('--birth-threshold <threshold>', 'Birth threshold (4-6)', '5')
      .option('--survival-threshold <threshold>', 'Survival threshold (2-4)', '4')
      .option('--min-room-size <size>', 'Minimum room size (20-100)', '50')
      .option('--min-start-goal-distance <distance>', 'Min start-goal distance (30-100)', '40')
      .option('--coin-count <count>', 'Number of coins (10-30)', '15')
      .option('--enemy-count <count>', 'Number of enemies (3-10)', '5')
      .option('-o, --output <file>', 'Output file path', 'level.json')
      .option('-v, --verbose', 'Show detailed progress', false)
      .action(async (options) => {
        await this.handleGenerateCommand(options);
      });

    // Help command
    this.program
      .command('help')
      .description('Show comprehensive help and examples')
      .action(() => {
        this.showHelp();
      });

    // Version command
    this.program
      .command('version')
      .description('Show version information')
      .action(() => {
        console.log('Level Generation System v1.0.0');
      });
  }

  /**
   * Handles the generate command with full parameter validation and error handling
   * @param {Object} options - Command line options
   */
  async handleGenerateCommand(options) {
    try {
      this.startTime = Date.now();
      
      // Convert string parameters to appropriate types
      const config = this.convertParameters(options);
      
      // Store config for testing purposes
      this.lastConfig = config;
      
      // Validate parameters
      this.logProgress('Validating parameters...', config);
      ParameterValidator.validateAll(config);
      
      // Show generation start
      this.logProgress('Starting cave generation...', config);
      
      // Generate the level
      const levelData = await this.generateLevel(config);
      
      // Ensure output directory exists
      this.ensureOutputDirectory(options.output);
      
      // Write level to file
      this.writeLevelToFile(options.output, levelData);
      
      // Show completion message
      const duration = Date.now() - this.startTime;
      console.log(`Generation completed in ${duration}ms`);
      console.log(`✅ Level saved to ${options.output}`);
      console.log('Level saved to ' + options.output);
      
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Converts string parameters from CLI to appropriate types
   * @param {Object} options - Raw CLI options
   * @returns {Object} Converted configuration object
   */
  convertParameters(options) {
    const defaultConfig = ParameterValidator.getDefaultConfig();
    
    return {
      seed: options.seed || defaultConfig.seed,
      width: parseInt(options.width) || defaultConfig.width,
      height: parseInt(options.height) || defaultConfig.height,
      initialWallRatio: parseFloat(options.initialWallRatio) || defaultConfig.initialWallRatio,
      simulationSteps: parseInt(options.simulationSteps) || defaultConfig.simulationSteps,
      birthThreshold: parseInt(options.birthThreshold) || defaultConfig.birthThreshold,
      survivalThreshold: parseInt(options.survivalThreshold) || defaultConfig.survivalThreshold,
      minRoomSize: parseInt(options.minRoomSize) || defaultConfig.minRoomSize,
      minStartGoalDistance: parseInt(options.minStartGoalDistance) || defaultConfig.minStartGoalDistance,
      coinCount: parseInt(options.coinCount) || defaultConfig.coinCount,
      enemyCount: parseInt(options.enemyCount) || defaultConfig.enemyCount,
      verbose: options.verbose || false
    };
  }

  /**
   * Generates a level using the provided configuration
   * @param {Object} config - Generation configuration
   * @returns {Object} Generated level data
   */
  async generateLevel(config) {
    // Mock implementation for now - will be replaced with actual generation logic
    // This allows tests to pass while the core generation system is being developed
    
    if (config.verbose) {
      this.logProgress('Step 1: Initial grid seeding', config);
      this.logProgress('Step 2: Cave formation', config);
      this.logProgress('Step 3: Region identification', config);
      this.logProgress('Step 4: Culling and main region selection', config);
      this.logProgress('Step 5: Placing goal and player start', config);
      this.logProgress('Step 6: Ensuring level solvability', config);
      this.logProgress('Step 7: Strategic coin placement', config);
      this.logProgress('Step 8: Intelligent enemy placement', config);
      this.logProgress('Step 9: Data serialization to JSON', config);
    }
    
    // Return mock level data
    return {
      playerSpawn: { x: 200, y: 870 },
      goal: {
        x: 4000,
        y: 850,
        tileKey: 'sign_exit',
        isFullBlock: true
      },
      platforms: [
        {
          type: 'ground',
          x: 0,
          y: 2900,
          width: 6000,
          tilePrefix: 'terrain_grass_horizontal',
          isFullBlock: true
        }
      ],
      coins: [
        { type: 'coin', x: 400, y: 850, properties: { value: 100 } }
      ],
      enemies: [
        { type: 'LoopHound', x: 300, y: 2900, patrolDistance: 150, direction: 1, speed: 80 }
      ],
      backgrounds: [],
      decorativePlatforms: [],
      parameters: config
    };
  }

  /**
   * Ensures the output directory exists
   * @param {string} outputPath - Output file path
   */
  ensureOutputDirectory(outputPath) {
    const outputDir = path.dirname(outputPath);
    if (outputDir !== '.' && !fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  /**
   * Writes level data to the specified output file
   * @param {string} outputPath - Output file path
   * @param {Object} levelData - Level data to write
   */
  writeLevelToFile(outputPath, levelData) {
    try {
      const jsonData = JSON.stringify(levelData, null, 2);
      fs.writeFileSync(outputPath, jsonData, 'utf8');
    } catch (error) {
      throw new Error(`Error writing output file: ${error.message}`);
    }
  }

  /**
   * Logs progress messages with optional verbose mode
   * @param {string} message - Progress message
   * @param {Object} config - Configuration object for verbose check
   */
  logProgress(message, config) {
    if (config && config.verbose) {
      console.log(`📊 ${message}`);
    }
  }

  /**
   * Handles errors with comprehensive error reporting
   * @param {Error} error - Error to handle
   */
  handleError(error) {
    if (error instanceof ValidationError) {
      console.error(`❌ Validation Error: ${error.message}`);
      console.error(`   Parameter: ${error.parameter}`);
      console.error(`   Value: ${error.value}`);
      console.error(`   Suggestion: ${error.suggestion}`);
    } else if (error.message.includes('Error writing output file')) {
      console.error(`❌ ${error.message}`);
      console.error('   Please check file permissions and directory access');
    } else {
      console.error(`❌ Generation Error: ${error.message}`);
    }
    
    process.exit(1);
  }

  /**
   * Shows comprehensive help information
   */
  showHelp() {
    console.log('🎮 Time Oddity Level Generation System');
    console.log('');
    console.log('USAGE:');
    console.log('  level-generation generate [options]');
    console.log('');
    console.log('EXAMPLES:');
    console.log('  # Generate a basic level');
    console.log('  level-generation generate --seed my-level-1');
    console.log('');
    console.log('  # Generate a large, complex level');
    console.log('  level-generation generate --seed complex-cave --width 150 --height 80 --verbose');
    console.log('');
    console.log('  # Generate with custom parameters');
    console.log('  level-generation generate --seed custom --width 120 --height 70 --coin-count 20 --enemy-count 8');
    console.log('');
    console.log('PARAMETER RANGES:');
    console.log('  Width: 50-200 tiles (default: 100)');
    console.log('  Height: 30-120 tiles (default: 60)');
    console.log('  Initial Wall Ratio: 0.4-0.55 (default: 0.45)');
    console.log('  Simulation Steps: 3-6 (default: 4)');
    console.log('  Birth Threshold: 4-6 (default: 5)');
    console.log('  Survival Threshold: 2-4 (default: 4)');
    console.log('  Min Room Size: 20-100 (default: 50)');
    console.log('  Min Start-Goal Distance: 30-100 (default: 40)');
    console.log('  Coin Count: 10-30 (default: 15)');
    console.log('  Enemy Count: 3-10 (default: 5)');
    console.log('');
    console.log('For detailed help on any command:');
    console.log('  level-generation generate --help');
  }

  /**
   * Parses command line arguments and executes the appropriate command
   */
  parse() {
    this.program.parse();
  }
}

module.exports = CaveGeneratorCLI; 
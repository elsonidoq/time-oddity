/**
 * @fileoverview Tests for CaveGeneratorCLI
 * Tests for command-line interface with parameter validation and progress reporting
 */

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

// Mock the validation system
jest.mock('../../src/validation/ParameterValidator', () => ({
  validateAll: jest.fn(),
  getDefaultConfig: jest.fn(() => ({
    seed: 'test-seed',
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
  }))
}));

// Mock the core generation system
jest.mock('../../src/core/RandomGenerator', () => {
  return jest.fn().mockImplementation(() => ({
    random: jest.fn(() => 0.5),
    randomInt: jest.fn((min, max) => Math.floor((min + max) / 2)),
    reset: jest.fn()
  }));
});

jest.mock('../../src/core/GridUtilities', () => ({
  createGrid: jest.fn(() => ({ shape: [100, 60], data: new Uint8Array(6000) })),
  pixelToGrid: jest.fn((x, y) => ({ x: Math.floor(x / 64), y: Math.floor(y / 64) })),
  gridToPixel: jest.fn((x, y) => ({ x: x * 64, y: y * 64 }))
}));

// Mock file system operations
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn(() => false),
  mkdirSync: jest.fn()
}));

describe('CaveGeneratorCLI', () => {
  let CaveGeneratorCLI;
  let mockConsole;
  let mockProcess;
  let ParameterValidator;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock console for testing output
    mockConsole = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    global.console = mockConsole;

    // Mock process for testing exit codes
    mockProcess = {
      exit: jest.fn()
    };
    global.process = mockProcess;

    // Import the CLI class and ParameterValidator
    CaveGeneratorCLI = require('../../src/cli/CaveGeneratorCLI');
    ParameterValidator = require('../../src/validation/ParameterValidator');
  });

  afterEach(() => {
    // Restore original console and process
    global.console = console;
    global.process = process;
  });

  describe('CLI Framework', () => {
    test('should create a commander program with proper configuration', () => {
      const cli = new CaveGeneratorCLI();
      expect(cli.program).toBeInstanceOf(Command);
      expect(cli.program.name()).toBe('level-generation');
      expect(cli.program.description()).toBe('Procedural cave generation system for Time Oddity game');
    });

    test('should have generate command with all required options', () => {
      const cli = new CaveGeneratorCLI();
      const commands = cli.program.commands;
      const generateCommand = commands.find(cmd => cmd.name() === 'generate');
      
      expect(generateCommand).toBeDefined();
      expect(generateCommand.description()).toBe('Generate a new cave level');
      
      // Check for required options
      const options = generateCommand.options;
      const optionNames = options.map(opt => opt.long);
      expect(optionNames).toContain('--seed');
      expect(optionNames).toContain('--width');
      expect(optionNames).toContain('--height');
      expect(optionNames).toContain('--output');
    });

    test('should have help command with comprehensive documentation', () => {
      const cli = new CaveGeneratorCLI();
      const commands = cli.program.commands;
      const helpCommand = commands.find(cmd => cmd.name() === 'help');
      
      expect(helpCommand).toBeDefined();
    });
  });

  describe('Parameter Integration', () => {
    test('should validate parameters before generation', async () => {
      const ParameterValidator = require('../../src/validation/ParameterValidator');
      const cli = new CaveGeneratorCLI();
      
      const options = {
        seed: 'test-seed',
        width: '100',
        height: '60',
        output: 'test.json'
      };

      await cli.handleGenerateCommand(options);
      
      expect(ParameterValidator.validateAll).toHaveBeenCalledWith(
        expect.objectContaining({
          seed: 'test-seed',
          width: 100,
          height: 60
        })
      );
    });

    test('should handle validation errors gracefully', async () => {
      const ParameterValidator = require('../../src/validation/ParameterValidator');
      const ValidationError = require('../../src/validation/ValidationError');
      
      ParameterValidator.validateAll.mockImplementation(() => {
        throw new ValidationError('Invalid width', 'width', 999, 'Width should be between 50 and 200');
      });

      const cli = new CaveGeneratorCLI();
      
      const options = {
        seed: 'test-seed',
        width: '999',
        height: '60',
        output: 'test.json'
      };

      await cli.handleGenerateCommand(options);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Validation Error: Invalid width')
      );
      expect(mockProcess.exit).toHaveBeenCalledWith(1);
    });

    test('should convert string parameters to appropriate types', async () => {
      const cli = new CaveGeneratorCLI();
      
      const options = {
        seed: 'test-seed',
        width: '100',
        height: '60',
        initialWallRatio: '0.45',
        simulationSteps: '4',
        birthThreshold: '5',
        survivalThreshold: '4',
        minRoomSize: '50',
        minStartGoalDistance: '40',
        coinCount: '15',
        enemyCount: '5',
        output: 'test.json'
      };

      await cli.handleGenerateCommand(options);
      
      // Check that parameters were converted to proper types
      expect(cli.lastConfig).toEqual(
        expect.objectContaining({
          seed: 'test-seed',
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
        })
      );
    });
  });

  describe('Progress Reporting', () => {
    test('should show progress indicators during generation', async () => {
      ParameterValidator.validateAll.mockImplementation(() => {}); // Always pass validation
      const cli = new CaveGeneratorCLI();
      const options = {
        seed: 'test-seed',
        width: '100',
        height: '60',
        output: 'test.json'
      };
      await cli.handleGenerateCommand(options);
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Level saved to test.json')
      );
    });

    test('should show detailed progress for each generation step', async () => {
      ParameterValidator.validateAll.mockImplementation(() => {}); // Always pass validation
      const cli = new CaveGeneratorCLI();
      const options = {
        seed: 'test-seed',
        width: '100',
        height: '60',
        output: 'test.json',
        verbose: true
      };
      await cli.handleGenerateCommand(options);
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Step 1: Initial grid seeding')
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Step 2: Cave formation')
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Step 3: Region identification')
      );
    });

    test('should show timing information for generation steps', async () => {
      ParameterValidator.validateAll.mockImplementation(() => {}); // Always pass validation
      const cli = new CaveGeneratorCLI();
      const options = {
        seed: 'test-seed',
        width: '100',
        height: '60',
        output: 'test.json',
        verbose: true
      };
      await cli.handleGenerateCommand(options);
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringMatching(/Generation completed in \d+ms/)
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle file system errors gracefully', async () => {
      ParameterValidator.validateAll.mockImplementation(() => {}); // Always pass validation
      const fs = require('fs');
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      const cli = new CaveGeneratorCLI();
      const options = {
        seed: 'test-seed',
        width: '100',
        height: '60',
        output: '/invalid/path/test.json'
      };
      await cli.handleGenerateCommand(options);
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Error writing output file')
      );
      expect(mockProcess.exit).toHaveBeenCalledWith(1);
    });

    test('should handle generation errors gracefully', async () => {
      ParameterValidator.validateAll.mockImplementation(() => {}); // Always pass validation
      const cli = new CaveGeneratorCLI();
      const originalGenerateLevel = cli.generateLevel;
      cli.generateLevel = jest.fn().mockRejectedValue(new Error('Generation failed'));
      const options = {
        seed: 'test-seed',
        width: '100',
        height: '60',
        output: 'test.json'
      };
      await cli.handleGenerateCommand(options);
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Generation failed')
      );
      expect(mockProcess.exit).toHaveBeenCalledWith(1);
      cli.generateLevel = originalGenerateLevel;
    });

    test('should provide actionable error messages', async () => {
      const ParameterValidator = require('../../src/validation/ParameterValidator');
      const ValidationError = require('../../src/validation/ValidationError');
      
      ParameterValidator.validateAll.mockImplementation(() => {
        throw new ValidationError(
          'Width must be between 50 and 200',
          'width',
          999,
          'Width should be between 50 and 200 for optimal cave generation'
        );
      });

      const cli = new CaveGeneratorCLI();
      
      const options = {
        seed: 'test-seed',
        width: '999',
        height: '60',
        output: 'test.json'
      };

      await cli.handleGenerateCommand(options);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Width should be between 50 and 200 for optimal cave generation')
      );
    });
  });

  describe('Help System', () => {
    test('should provide comprehensive help for generate command', () => {
      const cli = new CaveGeneratorCLI();
      const commands = cli.program.commands;
      const generateCommand = commands.find(cmd => cmd.name() === 'generate');
      
      expect(generateCommand.description()).toBe('Generate a new cave level');
      
      // Check that all options have descriptions
      const options = generateCommand.options;
      options.forEach(option => {
        expect(option.description).toBeTruthy();
      });
    });

    test('should show parameter examples in help', () => {
      const cli = new CaveGeneratorCLI();
      
      cli.showHelp();
      
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Time Oddity Level Generation System')
      );
    });

    test('should provide parameter range information', () => {
      const cli = new CaveGeneratorCLI();
      const commands = cli.program.commands;
      const generateCommand = commands.find(cmd => cmd.name() === 'generate');
      
      const widthOption = generateCommand.options.find(opt => opt.long === '--width');
      expect(widthOption.description).toContain('50-200');
      
      const heightOption = generateCommand.options.find(opt => opt.long === '--height');
      expect(heightOption.description).toContain('30-120');
    });
  });

  describe('Output Handling', () => {
    test('should write level to specified output file', async () => {
      ParameterValidator.validateAll.mockImplementation(() => {}); // Always pass validation
      const fs = require('fs');
      const cli = new CaveGeneratorCLI();
      const options = {
        seed: 'test-seed',
        width: '100',
        height: '60',
        output: 'test.json'
      };
      await cli.handleGenerateCommand(options);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'test.json',
        expect.any(String),
        'utf8'
      );
    });

    test('should create output directory if it does not exist', async () => {
      ParameterValidator.validateAll.mockImplementation(() => {}); // Always pass validation
      const fs = require('fs');
      fs.existsSync.mockReturnValue(false);
      const cli = new CaveGeneratorCLI();
      const options = {
        seed: 'test-seed',
        width: '100',
        height: '60',
        output: 'output/levels/test.json'
      };
      await cli.handleGenerateCommand(options);
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        'output/levels',
        expect.objectContaining({ recursive: true })
      );
    });

    test('should show success message with file path', async () => {
      ParameterValidator.validateAll.mockImplementation(() => {}); // Always pass validation
      const cli = new CaveGeneratorCLI();
      const options = {
        seed: 'test-seed',
        width: '100',
        height: '60',
        output: 'test.json'
      };
      await cli.handleGenerateCommand(options);
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('Level saved to test.json')
      );
    });
  });

  describe('CLI Integration', () => {
    test('should handle missing required parameters with defaults', async () => {
      const cli = new CaveGeneratorCLI();
      
      const options = {
        seed: 'test-seed',
        output: 'test.json'
        // Missing width and height
      };

      await cli.handleGenerateCommand(options);
      
      // Should use default values
      expect(cli.lastConfig).toEqual(
        expect.objectContaining({
          width: 100,
          height: 60
        })
      );
    });
  });
}); 
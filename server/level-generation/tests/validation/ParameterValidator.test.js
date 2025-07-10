/**
 * @fileoverview Parameter validation tests
 * Tests for parameter validation and error handling components
 */

const ValidationError = require('../../src/validation/ValidationError');

describe('ValidationError', () => {
  test('should create ValidationError with detailed information', () => {
    const error = new ValidationError(
      'Invalid width value',
      'width',
      999,
      'Width must be between 50 and 200'
    );
    
    expect(error.message).toBe('Invalid width value');
    expect(error.parameter).toBe('width');
    expect(error.value).toBe(999);
    expect(error.suggestion).toBe('Width must be between 50 and 200');
    expect(error.name).toBe('ValidationError');
  });

  test('should generate detailed error message', () => {
    const error = new ValidationError(
      'Invalid width value',
      'width',
      999,
      'Width must be between 50 and 200'
    );
    
    const detailedMessage = error.getDetailedMessage();
    expect(detailedMessage).toContain('Invalid width value');
    expect(detailedMessage).toContain('Parameter: width');
    expect(detailedMessage).toContain('Value: 999');
    expect(detailedMessage).toContain('Suggestion: Width must be between 50 and 200');
  });
});

describe('ParameterValidator', () => {
  let ParameterValidator;
  
  beforeEach(() => {
    // Import the class we're testing
    ParameterValidator = require('../../src/validation/ParameterValidator');
  });

  describe('validateSeed', () => {
    test('should accept any string as valid seed', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateSeed('time-oddity-level-1')).not.toThrow();
      expect(() => validator.validateSeed('')).not.toThrow();
      expect(() => validator.validateSeed('123')).not.toThrow();
    });

    test('should reject non-string seeds', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateSeed(123)).toThrow(ValidationError);
      expect(() => validator.validateSeed(null)).toThrow(ValidationError);
      expect(() => validator.validateSeed(undefined)).toThrow(ValidationError);
      expect(() => validator.validateSeed({})).toThrow(ValidationError);
    });
  });

  describe('validateWidth', () => {
    test('should accept width in valid range (50-200)', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateWidth(50)).not.toThrow();
      expect(() => validator.validateWidth(100)).not.toThrow();
      expect(() => validator.validateWidth(200)).not.toThrow();
    });

    test('should reject width outside valid range', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateWidth(49)).toThrow(ValidationError);
      expect(() => validator.validateWidth(201)).toThrow(ValidationError);
      expect(() => validator.validateWidth(0)).toThrow(ValidationError);
      expect(() => validator.validateWidth(-1)).toThrow(ValidationError);
    });

    test('should reject non-numeric width', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateWidth('100')).toThrow(ValidationError);
      expect(() => validator.validateWidth(null)).toThrow(ValidationError);
      expect(() => validator.validateWidth(undefined)).toThrow(ValidationError);
    });
  });

  describe('validateHeight', () => {
    test('should accept height in valid range (30-120)', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateHeight(30)).not.toThrow();
      expect(() => validator.validateHeight(60)).not.toThrow();
      expect(() => validator.validateHeight(120)).not.toThrow();
    });

    test('should reject height outside valid range', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateHeight(29)).toThrow(ValidationError);
      expect(() => validator.validateHeight(121)).toThrow(ValidationError);
      expect(() => validator.validateHeight(0)).toThrow(ValidationError);
      expect(() => validator.validateHeight(-1)).toThrow(ValidationError);
    });
  });

  describe('validateInitialWallRatio', () => {
    test('should accept ratio in valid range (0.4-0.55)', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateInitialWallRatio(0.4)).not.toThrow();
      expect(() => validator.validateInitialWallRatio(0.45)).not.toThrow();
      expect(() => validator.validateInitialWallRatio(0.55)).not.toThrow();
    });

    test('should reject ratio outside valid range', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateInitialWallRatio(0.39)).toThrow(ValidationError);
      expect(() => validator.validateInitialWallRatio(0.56)).toThrow(ValidationError);
      expect(() => validator.validateInitialWallRatio(0)).toThrow(ValidationError);
      expect(() => validator.validateInitialWallRatio(1)).toThrow(ValidationError);
    });
  });

  describe('validateSimulationSteps', () => {
    test('should accept steps in valid range (3-6)', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateSimulationSteps(3)).not.toThrow();
      expect(() => validator.validateSimulationSteps(4)).not.toThrow();
      expect(() => validator.validateSimulationSteps(6)).not.toThrow();
    });

    test('should reject steps outside valid range', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateSimulationSteps(2)).toThrow(ValidationError);
      expect(() => validator.validateSimulationSteps(7)).toThrow(ValidationError);
      expect(() => validator.validateSimulationSteps(0)).toThrow(ValidationError);
      expect(() => validator.validateSimulationSteps(-1)).toThrow(ValidationError);
    });
  });

  describe('validateBirthThreshold', () => {
    test('should accept threshold in valid range (4-6)', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateBirthThreshold(4)).not.toThrow();
      expect(() => validator.validateBirthThreshold(5)).not.toThrow();
      expect(() => validator.validateBirthThreshold(6)).not.toThrow();
    });

    test('should reject threshold outside valid range', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateBirthThreshold(3)).toThrow(ValidationError);
      expect(() => validator.validateBirthThreshold(7)).toThrow(ValidationError);
      expect(() => validator.validateBirthThreshold(0)).toThrow(ValidationError);
      expect(() => validator.validateBirthThreshold(-1)).toThrow(ValidationError);
    });
  });

  describe('validateSurvivalThreshold', () => {
    test('should accept threshold in valid range (2-4)', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateSurvivalThreshold(2)).not.toThrow();
      expect(() => validator.validateSurvivalThreshold(3)).not.toThrow();
      expect(() => validator.validateSurvivalThreshold(4)).not.toThrow();
    });

    test('should reject threshold outside valid range', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateSurvivalThreshold(1)).toThrow(ValidationError);
      expect(() => validator.validateSurvivalThreshold(5)).toThrow(ValidationError);
      expect(() => validator.validateSurvivalThreshold(0)).toThrow(ValidationError);
      expect(() => validator.validateSurvivalThreshold(-1)).toThrow(ValidationError);
    });
  });

  describe('validateMinRoomSize', () => {
    test('should accept size in valid range (20-100)', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateMinRoomSize(20)).not.toThrow();
      expect(() => validator.validateMinRoomSize(50)).not.toThrow();
      expect(() => validator.validateMinRoomSize(100)).not.toThrow();
    });

    test('should reject size outside valid range', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateMinRoomSize(19)).toThrow(ValidationError);
      expect(() => validator.validateMinRoomSize(101)).toThrow(ValidationError);
      expect(() => validator.validateMinRoomSize(0)).toThrow(ValidationError);
      expect(() => validator.validateMinRoomSize(-1)).toThrow(ValidationError);
    });
  });

  describe('validateMinStartGoalDistance', () => {
    test('should accept distance in valid range (30-100)', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateMinStartGoalDistance(30)).not.toThrow();
      expect(() => validator.validateMinStartGoalDistance(40)).not.toThrow();
      expect(() => validator.validateMinStartGoalDistance(100)).not.toThrow();
    });

    test('should reject distance outside valid range', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateMinStartGoalDistance(29)).toThrow(ValidationError);
      expect(() => validator.validateMinStartGoalDistance(101)).toThrow(ValidationError);
      expect(() => validator.validateMinStartGoalDistance(0)).toThrow(ValidationError);
      expect(() => validator.validateMinStartGoalDistance(-1)).toThrow(ValidationError);
    });
  });

  describe('validateCoinCount', () => {
    test('should accept count in valid range (10-30)', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateCoinCount(10)).not.toThrow();
      expect(() => validator.validateCoinCount(15)).not.toThrow();
      expect(() => validator.validateCoinCount(30)).not.toThrow();
    });

    test('should reject count outside valid range', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateCoinCount(9)).toThrow(ValidationError);
      expect(() => validator.validateCoinCount(31)).toThrow(ValidationError);
      expect(() => validator.validateCoinCount(0)).toThrow(ValidationError);
      expect(() => validator.validateCoinCount(-1)).toThrow(ValidationError);
    });
  });

  describe('validateEnemyCount', () => {
    test('should accept count in valid range (3-10)', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateEnemyCount(3)).not.toThrow();
      expect(() => validator.validateEnemyCount(5)).not.toThrow();
      expect(() => validator.validateEnemyCount(10)).not.toThrow();
    });

    test('should reject count outside valid range', () => {
      const validator = new ParameterValidator();
      
      expect(() => validator.validateEnemyCount(2)).toThrow(ValidationError);
      expect(() => validator.validateEnemyCount(11)).toThrow(ValidationError);
      expect(() => validator.validateEnemyCount(0)).toThrow(ValidationError);
      expect(() => validator.validateEnemyCount(-1)).toThrow(ValidationError);
    });
  });

  describe('validateAll', () => {
    test('should accept valid configuration object', () => {
      const validator = new ParameterValidator();
      const validConfig = {
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
      };
      
      expect(() => validator.validateAll(validConfig)).not.toThrow();
    });

    test('should reject configuration with invalid parameters', () => {
      const validator = new ParameterValidator();
      const invalidConfig = {
        seed: 'test-seed',
        width: 999, // Invalid
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
      
      expect(() => validator.validateAll(invalidConfig)).toThrow(ValidationError);
    });

    test('should provide detailed error messages for invalid parameters', () => {
      const validator = new ParameterValidator();
      const invalidConfig = {
        seed: 'test-seed',
        width: 999,
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
      
      try {
        validator.validateAll(invalidConfig);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.parameter).toBe('width');
        expect(error.value).toBe(999);
        expect(error.suggestion).toContain('between 50 and 200');
      }
    });
  });

  describe('Performance', () => {
    test('should validate large configuration quickly', () => {
      const validator = new ParameterValidator();
      const config = {
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
      };
      
      const startTime = Date.now();
      
      // Run validation 1000 times to test performance
      for (let i = 0; i < 1000; i++) {
        validator.validateAll(config);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });
}); 
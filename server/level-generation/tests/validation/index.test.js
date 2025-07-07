/**
 * @fileoverview Validation module tests
 * Tests for parameter validation and error handling components
 */

const validation = require('../../src/validation');

describe('Validation Module', () => {
  test('should export ValidationError class', () => {
    expect(validation.ValidationError).toBeDefined();
    expect(typeof validation.ValidationError).toBe('function');
  });

  test('should export ParameterValidator class', () => {
    expect(validation.ParameterValidator).toBeDefined();
    expect(typeof validation.ParameterValidator).toBe('function');
  });

  test('should create ValidationError instances', () => {
    const error = new validation.ValidationError(
      'Test error',
      'testParam',
      'testValue',
      'Test suggestion'
    );
    
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Test error');
    expect(error.parameter).toBe('testParam');
    expect(error.value).toBe('testValue');
    expect(error.suggestion).toBe('Test suggestion');
  });

  test('should create ParameterValidator instances', () => {
    const validator = new validation.ParameterValidator();
    
    expect(validator).toBeDefined();
    expect(validator.validationRules).toBeDefined();
    expect(typeof validator.validateSeed).toBe('function');
    expect(typeof validator.validateAll).toBe('function');
  });
}); 
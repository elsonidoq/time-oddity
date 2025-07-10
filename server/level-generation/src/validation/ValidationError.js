/**
 * @fileoverview Custom validation error class for parameter validation
 * Provides detailed error messages with suggestions for fixes
 */

class ValidationError extends Error {
  /**
   * Creates a new ValidationError
   * @param {string} message - The error message
   * @param {string} parameter - The parameter that failed validation
   * @param {*} value - The invalid value
   * @param {string} suggestion - Suggestion for fixing the error
   */
  constructor(message, parameter, value, suggestion = '') {
    super(message);
    this.name = 'ValidationError';
    this.parameter = parameter;
    this.value = value;
    this.suggestion = suggestion;
    
    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Creates a detailed error message with parameter info and suggestion
   * @returns {string} Formatted error message
   */
  getDetailedMessage() {
    let message = `${this.message}`;
    
    if (this.parameter) {
      message += `\nParameter: ${this.parameter}`;
    }
    
    if (this.value !== undefined) {
      message += `\nValue: ${JSON.stringify(this.value)}`;
    }
    
    if (this.suggestion) {
      message += `\nSuggestion: ${this.suggestion}`;
    }
    
    return message;
  }
}

module.exports = ValidationError; 
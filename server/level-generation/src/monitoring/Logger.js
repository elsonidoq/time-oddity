/**
 * @fileoverview Structured logging system
 * Provides configurable logging with different levels and output formats
 */

class Logger {
  /**
   * Valid log levels in order of severity
   */
  static LOG_LEVELS = ['debug', 'info', 'warn', 'error'];

  /**
   * Valid output formats
   */
  static OUTPUT_FORMATS = ['console', 'json'];

  /**
   * Creates a new Logger instance
   * @param {Object} options - Configuration options
   * @param {string} options.level - Log level (default: 'info')
   * @param {string} options.output - Output format (default: 'console')
   */
  constructor(options = {}) {
    this.setLevel(options.level || 'info');
    this.setOutput(options.output || 'console');
  }

  /**
   * Sets the log level
   * @param {string} level - Log level to set
   * @throws {Error} If level is invalid
   */
  setLevel(level) {
    if (!Logger.LOG_LEVELS.includes(level)) {
      throw new Error(`Invalid log level: ${level}`);
    }
    this.level = level;
  }

  /**
   * Sets the output format
   * @param {string} output - Output format to set
   * @throws {Error} If output format is invalid
   */
  setOutput(output) {
    if (!Logger.OUTPUT_FORMATS.includes(output)) {
      throw new Error(`Invalid output format: ${output}`);
    }
    this.output = output;
  }

  /**
   * Checks if a log level should be output
   * @param {string} level - Log level to check
   * @returns {boolean} Whether the level should be logged
   */
  shouldLog(level) {
    const levelIndex = Logger.LOG_LEVELS.indexOf(level);
    const currentIndex = Logger.LOG_LEVELS.indexOf(this.level);
    return levelIndex >= currentIndex;
  }

  /**
   * Safely stringifies an object, handling circular references
   * @param {*} obj - Object to stringify
   * @returns {string} String representation
   */
  safeStringify(obj) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  }

  /**
   * Formats a log message for console output
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   * @returns {string} Formatted log message
   */
  formatConsoleMessage(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase();
    
    let formattedMessage = `${timestamp} [${levelUpper}] ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      const metadataStr = this.safeStringify(metadata);
      formattedMessage += ` ${metadataStr}`;
    }
    
    return formattedMessage;
  }

  /**
   * Formats a log message for JSON output
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   * @returns {string} JSON formatted log message
   */
  formatJsonMessage(level, message, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: String(message),
      ...metadata
    };
    
    return this.safeStringify(logEntry);
  }

  /**
   * Outputs a log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    try {
      let formattedMessage;
      
      if (this.output === 'json') {
        formattedMessage = this.formatJsonMessage(level, message, metadata);
      } else {
        formattedMessage = this.formatConsoleMessage(level, message, metadata);
      }
      
      console.log(formattedMessage);
    } catch (error) {
      // Fallback to basic logging if formatting fails
      try {
        console.log(`${new Date().toISOString()} [${level.toUpperCase()}] ${message}`);
      } catch (e) {
        // Swallow error to ensure graceful handling
      }
    }
  }

  /**
   * Logs a debug message
   * @param {string} message - Debug message
   * @param {Object} metadata - Additional metadata
   */
  debug(message, metadata = {}) {
    this.log('debug', message, metadata);
  }

  /**
   * Logs an info message
   * @param {string} message - Info message
   * @param {Object} metadata - Additional metadata
   */
  info(message, metadata = {}) {
    this.log('info', message, metadata);
  }

  /**
   * Logs a warning message
   * @param {string} message - Warning message
   * @param {Object} metadata - Additional metadata
   */
  warn(message, metadata = {}) {
    this.log('warn', message, metadata);
  }

  /**
   * Logs an error message
   * @param {string} message - Error message
   * @param {Object} metadata - Additional metadata
   */
  error(message, metadata = {}) {
    this.log('error', message, metadata);
  }
}

module.exports = Logger; 
/**
 * @fileoverview Tests for Logger class
 * Tests structured logging with different levels and output formatting
 */

const Logger = require('../../src/monitoring/Logger');

describe('Logger', () => {
  describe('Constructor and Initialization', () => {
    test('should create instance with default settings', () => {
      const logger = new Logger();
      expect(logger).toBeInstanceOf(Logger);
      expect(logger.level).toBe('info');
      expect(logger.output).toBe('console');
    });

    test('should create instance with custom settings', () => {
      const logger = new Logger({ level: 'debug', output: 'json' });
      expect(logger.level).toBe('debug');
      expect(logger.output).toBe('json');
    });

    test('should validate log levels', () => {
      expect(() => new Logger({ level: 'invalid' })).toThrow('Invalid log level: invalid');
    });

    test('should validate output formats', () => {
      expect(() => new Logger({ output: 'invalid' })).toThrow('Invalid output format: invalid');
    });
  });

  describe('Log Levels', () => {
    let logger;
    let consoleSpy;

    beforeEach(() => {
      logger = new Logger({ level: 'info' });
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should log debug messages when level is debug', () => {
      logger = new Logger({ level: 'debug' });
      logger.debug('Debug message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should not log debug messages when level is info', () => {
      logger.debug('Debug message');
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('should log info messages when level is info', () => {
      logger.info('Info message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should log warn messages when level is info', () => {
      logger.warn('Warning message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should log error messages when level is info', () => {
      logger.error('Error message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('should not log info messages when level is warn', () => {
      logger = new Logger({ level: 'warn' });
      logger.info('Info message');
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Structured Logging', () => {
    let logger;
    let consoleSpy;

    beforeEach(() => {
      logger = new Logger({ level: 'debug' });
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should log with timestamp and level', () => {
      logger.info('Test message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
      );
    });

    test('should log with metadata', () => {
      logger.info('Test message', { operation: 'test', duration: 100 });
      
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('Test message');
      expect(logCall).toContain('operation');
      expect(logCall).toContain('test');
    });

    test('should handle objects and arrays in metadata', () => {
      const metadata = {
        array: [1, 2, 3],
        object: { key: 'value' },
        number: 42
      };
      
      logger.info('Test message', metadata);
      
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('[1,2,3]');
      expect(logCall).toContain('{"key":"value"}');
      expect(logCall).toContain('42');
    });

    test('should handle circular references gracefully', () => {
      const obj = { name: 'test' };
      obj.self = obj;
      
      logger.info('Test message', { circular: obj });
      
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('[Circular]');
    });
  });

  describe('JSON Output Format', () => {
    let logger;
    let consoleSpy;

    beforeEach(() => {
      logger = new Logger({ level: 'debug', output: 'json' });
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should output structured JSON logs', () => {
      logger.info('Test message', { operation: 'test' });
      
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed).toEqual({
        timestamp: expect.any(String),
        level: 'info',
        message: 'Test message',
        operation: 'test'
      });
    });

    test('should handle error objects in JSON format', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', { error: error.message, stack: error.stack });
      
      const logCall = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(logCall);
      
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('Error occurred');
      expect(parsed.error).toBe('Test error');
    });
  });

  describe('Performance Integration', () => {
    let logger;
    let consoleSpy;

    beforeEach(() => {
      logger = new Logger({ level: 'debug' });
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should log performance metrics', () => {
      logger.info('Generation completed', {
        operation: 'level-generation',
        duration: 1500,
        memoryUsage: {
          heapUsed: 1024 * 1024,
          heapTotal: 2048 * 1024
        }
      });
      
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('Generation completed');
      expect(logCall).toContain('1500');
      expect(logCall).toContain('1048576'); // 1024 * 1024
    });

    test('should log benchmark results', () => {
      const benchmarkData = {
        operation: 'cellular-automata',
        iterations: 5,
        averageTime: 250,
        minTime: 200,
        maxTime: 300
      };
      
      logger.info('Benchmark results', benchmarkData);
      
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).toContain('Benchmark results');
      expect(logCall).toContain('250');
      expect(logCall).toContain('200');
      expect(logCall).toContain('300');
    });
  });

  describe('Error Handling', () => {
    let logger;
    let consoleSpy;

    beforeEach(() => {
      logger = new Logger({ level: 'debug' });
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should handle null and undefined messages', () => {
      logger.info(null);
      logger.info(undefined);
      
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    test('should handle non-string messages', () => {
      logger.info(42);
      logger.info({ message: 'test' });
      
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    test('should handle logging errors gracefully', () => {
      // Mock console.log to throw an error
      consoleSpy.mockImplementation(() => {
        throw new Error('Console error');
      });
      
      // Should not throw, should handle gracefully
      expect(() => logger.info('Test message')).not.toThrow();
    });
  });

  describe('Log Level Methods', () => {
    let logger;
    let consoleSpy;

    beforeEach(() => {
      logger = new Logger({ level: 'debug' });
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('should have all log level methods', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    test('should call appropriate log level methods', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      expect(consoleSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe('Configuration', () => {
    test('should allow changing log level', () => {
      const logger = new Logger({ level: 'info' });
      expect(logger.level).toBe('info');
      
      logger.setLevel('debug');
      expect(logger.level).toBe('debug');
    });

    test('should validate new log level', () => {
      const logger = new Logger();
      expect(() => logger.setLevel('invalid')).toThrow('Invalid log level: invalid');
    });

    test('should allow changing output format', () => {
      const logger = new Logger({ output: 'console' });
      expect(logger.output).toBe('console');
      
      logger.setOutput('json');
      expect(logger.output).toBe('json');
    });

    test('should validate new output format', () => {
      const logger = new Logger();
      expect(() => logger.setOutput('invalid')).toThrow('Invalid output format: invalid');
    });
  });
}); 
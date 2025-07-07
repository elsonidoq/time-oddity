/**
 * @fileoverview Tests for PerformanceMonitor class
 * Tests performance tracking, memory monitoring, and benchmarking capabilities
 */

const PerformanceMonitor = require('../../src/monitoring/PerformanceMonitor');

// Mock process.memoryUsage for deterministic testing
const originalMemoryUsage = process.memoryUsage;
let mockMemoryUsage = jest.fn();

beforeEach(() => {
  mockMemoryUsage = jest.fn();
  process.memoryUsage = mockMemoryUsage;
});

afterEach(() => {
  process.memoryUsage = originalMemoryUsage;
});

describe('PerformanceMonitor', () => {
  describe('Constructor and Initialization', () => {
    test('should create instance with default settings', () => {
      const monitor = new PerformanceMonitor();
      expect(monitor).toBeInstanceOf(PerformanceMonitor);
      expect(monitor.isEnabled).toBe(true);
      expect(monitor.startTime).toBeNull();
      expect(monitor.memorySnapshots).toEqual([]);
    });

    test('should create instance with custom settings', () => {
      const monitor = new PerformanceMonitor({ enabled: false });
      expect(monitor.isEnabled).toBe(false);
    });

    test('should initialize with empty benchmark data', () => {
      const monitor = new PerformanceMonitor();
      expect(monitor.benchmarks).toEqual({});
    });
  });

  describe('Performance Tracking', () => {
    let monitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    test('should start performance tracking', () => {
      const startTime = monitor.startTracking('test-operation');
      expect(startTime).toBeGreaterThan(0);
      expect(Array.isArray(monitor.startTime)).toBe(true);
      expect(monitor.currentOperation).toBe('test-operation');
    });

    test('should stop performance tracking and return duration', () => {
      monitor.startTracking('test-operation');
      
      // Simulate some time passing
      const mockHrtime = jest.spyOn(process, 'hrtime');
      mockHrtime.mockReturnValueOnce([0, 1000000]); // 1ms
      mockHrtime.mockReturnValueOnce([0, 2000000]); // 2ms
      
      const duration = monitor.stopTracking();
      
      expect(duration).toBeGreaterThan(0);
      expect(monitor.startTime).toBeNull();
      expect(monitor.currentOperation).toBeNull();
      
      mockHrtime.mockRestore();
    });

    test('should throw error when stopping without starting', () => {
      expect(() => monitor.stopTracking()).toThrow('No tracking session active');
    });

    test('should throw error when starting while already tracking', () => {
      monitor.startTracking('test-operation');
      expect(() => monitor.startTracking('another-operation')).toThrow('Tracking session already active');
    });

    test('should not track when disabled', () => {
      monitor.isEnabled = false;
      const startTime = monitor.startTracking('test-operation');
      expect(startTime).toBeNull();
      expect(monitor.startTime).toBeNull();
    });
  });

  describe('Memory Monitoring', () => {
    let monitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
      mockMemoryUsage.mockReturnValue({
        heapUsed: 1024 * 1024, // 1MB
        heapTotal: 2048 * 1024, // 2MB
        external: 512 * 1024, // 512KB
        rss: 4096 * 1024 // 4MB
      });
    });

    test('should capture memory snapshot', () => {
      const snapshot = monitor.captureMemorySnapshot('test-snapshot');
      
      expect(snapshot).toEqual({
        name: 'test-snapshot',
        timestamp: expect.any(Number),
        heapUsed: 1024 * 1024,
        heapTotal: 2048 * 1024,
        external: 512 * 1024,
        rss: 4096 * 1024
      });
      
      expect(monitor.memorySnapshots).toHaveLength(1);
      expect(monitor.memorySnapshots[0]).toBe(snapshot);
    });

    test('should detect memory leaks', () => {
      // First snapshot
      mockMemoryUsage.mockReturnValue({
        heapUsed: 1024 * 1024,
        heapTotal: 2048 * 1024,
        external: 512 * 1024,
        rss: 4096 * 1024
      });
      monitor.captureMemorySnapshot('initial');

      // Second snapshot with increased memory
      mockMemoryUsage.mockReturnValue({
        heapUsed: 2048 * 1024, // Doubled
        heapTotal: 4096 * 1024,
        external: 1024 * 1024,
        rss: 8192 * 1024
      });
      monitor.captureMemorySnapshot('after-operation');

      const leakReport = monitor.detectMemoryLeaks();
      
      expect(leakReport.hasLeak).toBe(true);
      expect(leakReport.heapUsedIncrease).toBe(1024 * 1024);
      expect(leakReport.percentageIncrease).toBe(100);
    });

    test('should not detect leak for normal memory usage', () => {
      // First snapshot
      mockMemoryUsage.mockReturnValue({
        heapUsed: 1024 * 1024,
        heapTotal: 2048 * 1024,
        external: 512 * 1024,
        rss: 4096 * 1024
      });
      monitor.captureMemorySnapshot('initial');

      // Second snapshot with minimal increase
      mockMemoryUsage.mockReturnValue({
        heapUsed: 1025 * 1024, // 1KB increase
        heapTotal: 2048 * 1024,
        external: 512 * 1024,
        rss: 4096 * 1024
      });
      monitor.captureMemorySnapshot('after-operation');

      const leakReport = monitor.detectMemoryLeaks();
      
      expect(leakReport.hasLeak).toBe(false);
      expect(leakReport.heapUsedIncrease).toBe(1024); // 1KB
      expect(leakReport.percentageIncrease).toBe(0.1); // 0.1%
    });

    test('should clear memory snapshots', () => {
      monitor.captureMemorySnapshot('test1');
      monitor.captureMemorySnapshot('test2');
      expect(monitor.memorySnapshots).toHaveLength(2);
      
      monitor.clearMemorySnapshots();
      expect(monitor.memorySnapshots).toHaveLength(0);
    });
  });

  describe('Benchmarking', () => {
    let monitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    test('should add benchmark data', () => {
      monitor.addBenchmark('test-operation', 100);
      monitor.addBenchmark('test-operation', 150);
      monitor.addBenchmark('test-operation', 200);
      
      expect(monitor.benchmarks['test-operation']).toEqual([100, 150, 200]);
    });

    test('should calculate benchmark statistics', () => {
      monitor.addBenchmark('test-operation', 100);
      monitor.addBenchmark('test-operation', 150);
      monitor.addBenchmark('test-operation', 200);
      
      const stats = monitor.getBenchmarkStats('test-operation');
      
      expect(stats).toEqual({
        count: 3,
        min: 100,
        max: 200,
        mean: 150,
        median: 150,
        p95: 200,
        p99: 200
      });
    });

    test('should return null for non-existent benchmark', () => {
      const stats = monitor.getBenchmarkStats('non-existent');
      expect(stats).toBeNull();
    });

    test('should clear benchmark data', () => {
      monitor.addBenchmark('test-operation', 100);
      expect(monitor.benchmarks['test-operation']).toHaveLength(1);
      
      monitor.clearBenchmarks();
      expect(monitor.benchmarks).toEqual({});
    });

    test('should get all benchmark names', () => {
      monitor.addBenchmark('operation1', 100);
      monitor.addBenchmark('operation2', 200);
      
      const names = monitor.getBenchmarkNames();
      expect(names).toEqual(['operation1', 'operation2']);
    });
  });

  describe('Performance Reporting', () => {
    let monitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
      mockMemoryUsage.mockReturnValue({
        heapUsed: 1024 * 1024,
        heapTotal: 2048 * 1024,
        external: 512 * 1024,
        rss: 4096 * 1024
      });
    });

    test('should generate performance report', () => {
      // Add some benchmark data
      monitor.addBenchmark('test-operation', 100);
      monitor.addBenchmark('test-operation', 150);
      
      // Capture memory snapshot
      monitor.captureMemorySnapshot('test-snapshot');
      
      const report = monitor.generateReport();
      
      expect(report).toEqual({
        timestamp: expect.any(Number),
        memorySnapshots: expect.any(Array),
        benchmarks: expect.any(Object),
        summary: expect.any(Object)
      });
      
      expect(report.memorySnapshots).toHaveLength(1);
      expect(report.benchmarks['test-operation']).toHaveLength(2);
    });

    test('should generate summary statistics', () => {
      monitor.addBenchmark('operation1', 100);
      monitor.addBenchmark('operation1', 200);
      monitor.addBenchmark('operation2', 50);
      
      const summary = monitor.generateSummary();
      
      expect(summary).toEqual({
        totalBenchmarks: 2,
        totalSamples: 3,
        averageDuration: 116.67, // (100 + 200 + 50) / 3
        fastestOperation: 'operation2',
        slowestOperation: 'operation1'
      });
    });

    test('should export report as JSON', () => {
      monitor.addBenchmark('test-operation', 100);
      monitor.captureMemorySnapshot('test-snapshot');
      
      const jsonReport = monitor.exportReport();
      const parsed = JSON.parse(jsonReport);
      
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('memorySnapshots');
      expect(parsed).toHaveProperty('benchmarks');
    });
  });

  describe('Integration with Generation Pipeline', () => {
    let monitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    test('should track complete generation cycle', () => {
      // Simulate a generation pipeline
      monitor.startTracking('level-generation');
      
      // Simulate memory usage during generation
      mockMemoryUsage.mockReturnValue({
        heapUsed: 1024 * 1024,
        heapTotal: 2048 * 1024,
        external: 512 * 1024,
        rss: 4096 * 1024
      });
      monitor.captureMemorySnapshot('before-generation');
      
      // Simulate memory increase
      mockMemoryUsage.mockReturnValue({
        heapUsed: 2048 * 1024,
        heapTotal: 4096 * 1024,
        external: 1024 * 1024,
        rss: 8192 * 1024
      });
      monitor.captureMemorySnapshot('after-generation');
      
      const duration = monitor.stopTracking();
      
      // Add to benchmarks
      monitor.addBenchmark('level-generation', duration);
      
      const report = monitor.generateReport();
      
      expect(report.memorySnapshots).toHaveLength(2);
      expect(report.benchmarks['level-generation']).toHaveLength(1);
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    let monitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    test('should handle memory usage errors gracefully', () => {
      mockMemoryUsage.mockImplementation(() => {
        throw new Error('Memory usage unavailable');
      });
      
      const snapshot = monitor.captureMemorySnapshot('test');
      
      expect(snapshot).toEqual({
        name: 'test',
        timestamp: expect.any(Number),
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
        error: 'Memory usage unavailable'
      });
    });

    test('should handle timing errors gracefully', () => {
      const mockHrtime = jest.spyOn(process, 'hrtime');
      mockHrtime.mockImplementation(() => {
        throw new Error('High resolution time unavailable');
      });
      
      const startTime = monitor.startTracking('test');
      expect(startTime).toBeNull();
      
      mockHrtime.mockRestore();
    });
  });
}); 
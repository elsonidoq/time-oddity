/**
 * @fileoverview Performance monitoring and benchmarking system
 * Provides performance tracking, memory monitoring, and statistical analysis
 */

class PerformanceMonitor {
  /**
   * Creates a new PerformanceMonitor instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.enabled - Whether monitoring is enabled (default: true)
   */
  constructor(options = {}) {
    this.isEnabled = options.enabled !== false;
    this.startTime = null;
    this.currentOperation = null;
    this.memorySnapshots = [];
    this.benchmarks = {};
  }

  /**
   * Starts performance tracking for an operation
   * @param {string} operationName - Name of the operation to track
   * @returns {number|null} Start time in nanoseconds, or null if disabled
   */
  startTracking(operationName) {
    if (!this.isEnabled) {
      return null;
    }

    if (this.startTime !== null) {
      throw new Error('Tracking session already active');
    }

    try {
      const startArr = process.hrtime();
      this.startTime = startArr;
      this.currentOperation = operationName;
      return startArr[0] * 1e9 + startArr[1];
    } catch (error) {
      return null;
    }
  }

  /**
   * Stops performance tracking and returns duration
   * @returns {number} Duration in milliseconds
   * @throws {Error} If no tracking session is active
   */
  stopTracking() {
    if (this.startTime === null) {
      throw new Error('No tracking session active');
    }

    try {
      const diff = process.hrtime(this.startTime);
      const duration = (diff[0] * 1000) + (diff[1] / 1e6); // ms
      this.startTime = null;
      this.currentOperation = null;
      return duration;
    } catch (error) {
      this.startTime = null;
      this.currentOperation = null;
      return 0;
    }
  }

  /**
   * Captures a memory usage snapshot
   * @param {string} name - Name for the snapshot
   * @returns {Object} Memory snapshot with usage data
   */
  captureMemorySnapshot(name) {
    const timestamp = Date.now();
    let memoryData = {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0
    };

    try {
      memoryData = process.memoryUsage();
    } catch (error) {
      memoryData.error = error.message;
    }

    const snapshot = {
      name,
      timestamp,
      ...memoryData
    };

    this.memorySnapshots.push(snapshot);
    return snapshot;
  }

  /**
   * Detects potential memory leaks by comparing snapshots
   * @returns {Object} Leak detection report
   */
  detectMemoryLeaks() {
    if (this.memorySnapshots.length < 2) {
      return {
        hasLeak: false,
        message: 'Need at least 2 snapshots to detect leaks'
      };
    }

    const first = this.memorySnapshots[0];
    const last = this.memorySnapshots[this.memorySnapshots.length - 1];

    const heapUsedIncrease = last.heapUsed - first.heapUsed;
    const percentageIncrease = (heapUsedIncrease / first.heapUsed) * 100;

    // Consider it a leak if heap usage increased by more than 10%
    const hasLeak = percentageIncrease > 10;

    return {
      hasLeak,
      heapUsedIncrease,
      percentageIncrease: Math.round(percentageIncrease * 100) / 100,
      firstSnapshot: first,
      lastSnapshot: last
    };
  }

  /**
   * Clears all memory snapshots
   */
  clearMemorySnapshots() {
    this.memorySnapshots = [];
  }

  /**
   * Adds a benchmark data point
   * @param {string} operationName - Name of the operation
   * @param {number} duration - Duration in milliseconds
   */
  addBenchmark(operationName, duration) {
    if (!this.benchmarks[operationName]) {
      this.benchmarks[operationName] = [];
    }
    this.benchmarks[operationName].push(duration);
  }

  /**
   * Calculates statistical data for a benchmark
   * @param {string} operationName - Name of the operation
   * @returns {Object|null} Statistical data or null if no data exists
   */
  getBenchmarkStats(operationName) {
    const data = this.benchmarks[operationName];
    if (!data || data.length === 0) {
      return null;
    }

    const sorted = [...data].sort((a, b) => a - b);
    const count = data.length;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const mean = data.reduce((sum, val) => sum + val, 0) / count;
    const median = sorted[Math.floor(sorted.length / 2)];
    
    // Calculate percentiles
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);
    const p95 = sorted[p95Index] || max;
    const p99 = sorted[p99Index] || max;

    return {
      count,
      min,
      max,
      mean: Math.round(mean * 100) / 100,
      median,
      p95,
      p99
    };
  }

  /**
   * Clears all benchmark data
   */
  clearBenchmarks() {
    this.benchmarks = {};
  }

  /**
   * Gets all benchmark operation names
   * @returns {string[]} Array of operation names
   */
  getBenchmarkNames() {
    return Object.keys(this.benchmarks);
  }

  /**
   * Generates a comprehensive performance report
   * @returns {Object} Performance report with all data
   */
  generateReport() {
    const summary = this.generateSummary();
    
    return {
      timestamp: Date.now(),
      memorySnapshots: [...this.memorySnapshots],
      benchmarks: { ...this.benchmarks },
      summary
    };
  }

  /**
   * Generates summary statistics
   * @returns {Object} Summary statistics
   */
  generateSummary() {
    const operationNames = this.getBenchmarkNames();
    const totalBenchmarks = operationNames.length;
    
    if (totalBenchmarks === 0) {
      return {
        totalBenchmarks: 0,
        totalSamples: 0,
        averageDuration: 0,
        fastestOperation: null,
        slowestOperation: null
      };
    }

    let totalSamples = 0;
    let totalDuration = 0;
    let fastestOperation = null;
    let slowestOperation = null;
    let fastestTime = Infinity;
    let slowestTime = -Infinity;

    for (const operationName of operationNames) {
      const stats = this.getBenchmarkStats(operationName);
      if (stats) {
        totalSamples += stats.count;
        totalDuration += stats.mean * stats.count;

        if (stats.mean < fastestTime) {
          fastestTime = stats.mean;
          fastestOperation = operationName;
        }

        if (stats.mean > slowestTime) {
          slowestTime = stats.mean;
          slowestOperation = operationName;
        }
      }
    }

    const averageDuration = totalSamples > 0 ? totalDuration / totalSamples : 0;

    return {
      totalBenchmarks,
      totalSamples,
      averageDuration: Math.round(averageDuration * 100) / 100,
      fastestOperation,
      slowestOperation
    };
  }

  /**
   * Exports the performance report as JSON
   * @returns {string} JSON string representation of the report
   */
  exportReport() {
    const report = this.generateReport();
    return JSON.stringify(report, null, 2);
  }
}

module.exports = PerformanceMonitor; 
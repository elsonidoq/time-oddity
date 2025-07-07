/**
 * @fileoverview Comprehensive Solvability Testing System
 * Provides multiple verification methods, path analysis, fallback mechanisms,
 * performance monitoring, and detailed reporting for level solvability validation
 */

const PathfindingIntegration = require('../pathfinding/PathfindingIntegration');

/**
 * SolvabilityTester class for comprehensive level solvability validation
 * Implements multiple verification methods, fallback mechanisms, and detailed reporting
 */
class SolvabilityTester {
  /**
   * Creates a new SolvabilityTester instance
   * @param {Object} config - Configuration options
   * @param {number} config.maxPathfindingAttempts - Maximum attempts per method
   * @param {Array<string>} config.fallbackMethods - Array of fallback method names
   * @param {number} config.performanceThreshold - Performance threshold in milliseconds
   * @param {boolean} config.enableDetailedReporting - Enable detailed reporting
   */
  constructor(config = {}) {
    this.config = {
      maxPathfindingAttempts: config.maxPathfindingAttempts || 3,
      fallbackMethods: config.fallbackMethods || ['bfs', 'dfs'],
      performanceThreshold: config.performanceThreshold || 5000, // 5 seconds
      enableDetailedReporting: config.enableDetailedReporting !== false,
      ...config
    };

    // Initialize pathfinding integration
    this.pathfindingIntegration = new PathfindingIntegration();
    
    // Performance tracking
    this.performanceStats = {
      methodTimings: {},
      totalExecutionTime: 0,
      memoryUsage: 0
    };
  }

  /**
   * Validates level solvability using multiple verification methods
   * @param {ndarray} grid - The level grid
   * @param {Object} startPos - Start position {x, y}
   * @param {Object} goalPos - Goal position {x, y}
   * @returns {Object} Solvability validation result
   */
  validateSolvability(grid, startPos, goalPos) {
    const startTime = performance.now();
    
    try {
      // Validate inputs
      this._validateInputs(grid, startPos, goalPos);
      
      // Initialize result object
      const result = {
        valid: false,
        path: [],
        verificationMethods: [],
        fallbackUsed: false,
        fallbackAttempts: 0,
        pathValidated: false,
        pathAnalysis: {},
        performanceStats: {},
        issues: [],
        report: {},
        errorHandled: false,
        allMethodsFailed: false
      };

      // Try primary A* method
      const primaryResult = this._tryPrimaryMethod(grid, startPos, goalPos);
      result.verificationMethods.push('a_star');
      
      if (primaryResult.valid) {
        result.valid = true;
        result.path = primaryResult.path;
        result.pathValidated = this._validatePath(grid, result.path, startPos, goalPos);
        result.pathAnalysis = this._analyzePath(result.path, startPos, goalPos);
      } else {
        // Try fallback methods
        const fallbackResult = this._tryFallbackMethods(grid, startPos, goalPos, result);
        if (fallbackResult.valid) {
          result.valid = true;
          result.path = fallbackResult.path;
          result.fallbackUsed = true;
          result.fallbackAttempts = fallbackResult.attempts;
          result.pathValidated = this._validatePath(grid, result.path, startPos, goalPos);
          result.pathAnalysis = this._analyzePath(result.path, startPos, goalPos);
        } else {
          result.allMethodsFailed = true;
          result.issues.push('All verification methods failed');
        }
      }

      // Generate performance stats
      result.performanceStats = this._generatePerformanceStats(startTime);
      
      // Generate detailed report
      if (this.config.enableDetailedReporting) {
        result.report = this._generateDetailedReport(result, grid, startPos, goalPos);
      }

      return result;

    } catch (error) {
      return this._handleError(error, startTime);
    }
  }

  /**
   * Tries the primary A* pathfinding method
   * @param {ndarray} grid - The level grid
   * @param {Object} startPos - Start position
   * @param {Object} goalPos - Goal position
   * @returns {Object} Primary method result
   * @private
   */
  _tryPrimaryMethod(grid, startPos, goalPos) {
    const methodStartTime = performance.now();
    
    try {
      // Check if points are reachable
      const isReachable = this.pathfindingIntegration.isReachable(grid, startPos, goalPos);
      
      if (isReachable) {
        // Find actual path
        const path = this.pathfindingIntegration.findPath(grid, startPos, goalPos);
        
        this._recordMethodTiming('a_star', performance.now() - methodStartTime);
        
        return {
          valid: true,
          path: path
        };
      } else {
        this._recordMethodTiming('a_star', performance.now() - methodStartTime);
        
        return {
          valid: false,
          path: []
        };
      }
    } catch (error) {
      this._recordMethodTiming('a_star', performance.now() - methodStartTime);
      throw error;
    }
  }

  /**
   * Tries fallback methods when primary method fails
   * @param {ndarray} grid - The level grid
   * @param {Object} startPos - Start position
   * @param {Object} goalPos - Goal position
   * @param {Object} result - Current result object
   * @returns {Object} Fallback method result
   * @private
   */
  _tryFallbackMethods(grid, startPos, goalPos, result) {
    let attempts = 0;
    
    for (const method of this.config.fallbackMethods) {
      attempts++;
      const methodStartTime = performance.now();
      
      try {
        result.verificationMethods.push(method);
        
        // Try different fallback strategies
        let fallbackResult;
        
        switch (method) {
          case 'bfs':
            fallbackResult = this._tryBreadthFirstSearch(grid, startPos, goalPos);
            break;
          case 'dfs':
            fallbackResult = this._tryDepthFirstSearch(grid, startPos, goalPos);
            break;
          case 'dijkstra':
            fallbackResult = this._tryDijkstra(grid, startPos, goalPos);
            break;
          default:
            fallbackResult = { valid: false, path: [] };
        }
        
        this._recordMethodTiming(method, performance.now() - methodStartTime);
        
        if (fallbackResult.valid) {
          return {
            valid: true,
            path: fallbackResult.path,
            attempts: attempts
          };
        }
        
      } catch (error) {
        this._recordMethodTiming(method, performance.now() - methodStartTime);
        result.issues.push(`${method} method failed: ${error.message}`);
      }
    }
    
    return {
      valid: false,
      path: [],
      attempts: attempts
    };
  }

  /**
   * Implements Breadth-First Search as fallback method
   * @param {ndarray} grid - The level grid
   * @param {Object} startPos - Start position
   * @param {Object} goalPos - Goal position
   * @returns {Object} BFS result
   * @private
   */
  _tryBreadthFirstSearch(grid, startPos, goalPos) {
    const queue = [[startPos.x, startPos.y]];
    const visited = new Set();
    const parent = new Map();
    
    visited.add(`${startPos.x},${startPos.y}`);
    
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      
      if (x === goalPos.x && y === goalPos.y) {
        // Reconstruct path
        const path = this._reconstructPath(parent, startPos, goalPos);
        return { valid: true, path: path };
      }
      
      // Check all 4 directions
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const key = `${nx},${ny}`;
        
        if (this._isValidPosition(grid, nx, ny) && 
            !visited.has(key) && 
            grid.get(nx, ny) === 0) {
          
          visited.add(key);
          queue.push([nx, ny]);
          parent.set(key, [x, y]);
        }
      }
    }
    
    return { valid: false, path: [] };
  }

  /**
   * Implements Depth-First Search as fallback method
   * @param {ndarray} grid - The level grid
   * @param {Object} startPos - Start position
   * @param {Object} goalPos - Goal position
   * @returns {Object} DFS result
   * @private
   */
  _tryDepthFirstSearch(grid, startPos, goalPos) {
    const stack = [[startPos.x, startPos.y]];
    const visited = new Set();
    const parent = new Map();
    
    visited.add(`${startPos.x},${startPos.y}`);
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      
      if (x === goalPos.x && y === goalPos.y) {
        // Reconstruct path
        const path = this._reconstructPath(parent, startPos, goalPos);
        return { valid: true, path: path };
      }
      
      // Check all 4 directions
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const key = `${nx},${ny}`;
        
        if (this._isValidPosition(grid, nx, ny) && 
            !visited.has(key) && 
            grid.get(nx, ny) === 0) {
          
          visited.add(key);
          stack.push([nx, ny]);
          parent.set(key, [x, y]);
        }
      }
    }
    
    return { valid: false, path: [] };
  }

  /**
   * Implements Dijkstra's algorithm as fallback method
   * @param {ndarray} grid - The level grid
   * @param {Object} startPos - Start position
   * @param {Object} goalPos - Goal position
   * @returns {Object} Dijkstra result
   * @private
   */
  _tryDijkstra(grid, startPos, goalPos) {
    const distances = new Map();
    const parent = new Map();
    const unvisited = new Set();
    
    // Initialize distances
    for (let y = 0; y < grid.shape[1]; y++) {
      for (let x = 0; x < grid.shape[0]; x++) {
        if (grid.get(x, y) === 0) {
          const key = `${x},${y}`;
          distances.set(key, Infinity);
          unvisited.add(key);
        }
      }
    }
    
    // Set start distance to 0
    const startKey = `${startPos.x},${startPos.y}`;
    distances.set(startKey, 0);
    
    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let minKey = null;
      let minDistance = Infinity;
      
      for (const key of unvisited) {
        const distance = distances.get(key);
        if (distance < minDistance) {
          minDistance = distance;
          minKey = key;
        }
      }
      
      if (!minKey || minDistance === Infinity) {
        break; // No path exists
      }
      
      unvisited.delete(minKey);
      
      const [x, y] = minKey.split(',').map(Number);
      
      if (x === goalPos.x && y === goalPos.y) {
        // Reconstruct path
        const path = this._reconstructPath(parent, startPos, goalPos);
        return { valid: true, path: path };
      }
      
      // Check neighbors
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const neighborKey = `${nx},${ny}`;
        
        if (this._isValidPosition(grid, nx, ny) && 
            unvisited.has(neighborKey) && 
            grid.get(nx, ny) === 0) {
          
          const newDistance = minDistance + 1;
          
          if (newDistance < distances.get(neighborKey)) {
            distances.set(neighborKey, newDistance);
            parent.set(neighborKey, [x, y]);
          }
        }
      }
    }
    
    return { valid: false, path: [] };
  }

  /**
   * Reconstructs path from parent map
   * @param {Map} parent - Parent map
   * @param {Object} startPos - Start position
   * @param {Object} goalPos - Goal position
   * @returns {Array} Reconstructed path
   * @private
   */
  _reconstructPath(parent, startPos, goalPos) {
    const path = [];
    let current = [goalPos.x, goalPos.y];
    
    while (current[0] !== startPos.x || current[1] !== startPos.y) {
      path.unshift(current);
      const key = `${current[0]},${current[1]}`;
      const parentCoords = parent.get(key);
      
      if (!parentCoords) {
        return []; // No path found
      }
      
      current = parentCoords;
    }
    
    path.unshift([startPos.x, startPos.y]);
    return path;
  }

  /**
   * Validates path correctness
   * @param {ndarray} grid - The level grid
   * @param {Array} path - Path to validate
   * @param {Object} startPos - Start position
   * @param {Object} goalPos - Goal position
   * @returns {boolean} True if path is valid
   * @private
   */
  _validatePath(grid, path, startPos, goalPos) {
    try {
      return this.pathfindingIntegration.validatePath(grid, path, startPos, goalPos);
    } catch (error) {
      return false;
    }
  }

  /**
   * Analyzes path characteristics
   * @param {Array} path - Path to analyze
   * @param {Object} startPos - Start position
   * @param {Object} goalPos - Goal position
   * @returns {Object} Path analysis
   * @private
   */
  _analyzePath(path, startPos, goalPos) {
    if (!path || path.length === 0) {
      return {
        pathLength: 0,
        distance: 0,
        complexity: 0,
        efficiency: 0
      };
    }

    const pathLength = path.length;
    const manhattanDistance = Math.abs(goalPos.x - startPos.x) + Math.abs(goalPos.y - startPos.y);
    const efficiency = manhattanDistance / pathLength;
    
    // Calculate complexity (number of direction changes)
    let directionChanges = 0;
    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const next = path[i + 1];
      
      const dir1 = [curr[0] - prev[0], curr[1] - prev[1]];
      const dir2 = [next[0] - curr[0], next[1] - curr[1]];
      
      if (dir1[0] !== dir2[0] || dir1[1] !== dir2[1]) {
        directionChanges++;
      }
    }
    
    const complexity = directionChanges / Math.max(1, pathLength - 2);
    
    return {
      pathLength: pathLength,
      distance: manhattanDistance,
      complexity: complexity,
      efficiency: efficiency
    };
  }

  /**
   * Validates input parameters
   * @param {ndarray} grid - The level grid
   * @param {Object} startPos - Start position
   * @param {Object} goalPos - Goal position
   * @throws {Error} If inputs are invalid
   * @private
   */
  _validateInputs(grid, startPos, goalPos) {
    if (!grid) {
      throw new Error('Grid is required');
    }
    
    if (!startPos) {
      throw new Error('Start position is required');
    }
    
    if (!goalPos) {
      throw new Error('Goal position is required');
    }
    
    // Validate coordinates
    this._validateCoordinates(grid, startPos, 'start');
    this._validateCoordinates(grid, goalPos, 'goal');
  }

  /**
   * Validates coordinates against grid bounds
   * @param {ndarray} grid - The level grid
   * @param {Object} coords - Coordinates {x, y}
   * @param {string} name - Name for error message
   * @throws {Error} If coordinates are invalid
   * @private
   */
  _validateCoordinates(grid, coords, name) {
    if (!coords || typeof coords.x !== 'number' || typeof coords.y !== 'number') {
      throw new Error(`Invalid ${name} coordinates`);
    }

    if (coords.x < 0 || coords.y < 0) {
      throw new Error(`Invalid ${name} coordinates`);
    }

    if (coords.x >= grid.shape[0] || coords.y >= grid.shape[1]) {
      throw new Error(`Coordinates out of bounds`);
    }
  }

  /**
   * Checks if position is valid within grid bounds
   * @param {ndarray} grid - The level grid
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if position is valid
   * @private
   */
  _isValidPosition(grid, x, y) {
    return x >= 0 && y >= 0 && x < grid.shape[0] && y < grid.shape[1];
  }

  /**
   * Records method timing for performance monitoring
   * @param {string} method - Method name
   * @param {number} time - Execution time in milliseconds
   * @private
   */
  _recordMethodTiming(method, time) {
    if (!this.performanceStats.methodTimings[method]) {
      this.performanceStats.methodTimings[method] = [];
    }
    this.performanceStats.methodTimings[method].push(time);
  }

  /**
   * Generates performance statistics
   * @param {number} startTime - Start time from performance.now()
   * @returns {Object} Performance statistics
   * @private
   */
  _generatePerformanceStats(startTime) {
    const totalTime = performance.now() - startTime;
    const memoryUsage = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
    
    const stats = {
      executionTime: totalTime,
      methodsUsed: Object.keys(this.performanceStats.methodTimings),
      memoryUsage: memoryUsage,
      methodTimings: this.performanceStats.methodTimings
    };
    
    // Check for performance warnings
    if (totalTime > this.config.performanceThreshold) {
      stats.performanceWarning = `Execution time (${totalTime.toFixed(2)}ms) exceeded threshold (${this.config.performanceThreshold}ms)`;
    }
    
    return stats;
  }

  /**
   * Generates detailed report
   * @param {Object} result - Validation result
   * @param {ndarray} grid - The level grid
   * @param {Object} startPos - Start position
   * @param {Object} goalPos - Goal position
   * @returns {Object} Detailed report
   * @private
   */
  _generateDetailedReport(result, grid, startPos, goalPos) {
    const report = {
      summary: {
        valid: result.valid,
        methodsUsed: result.verificationMethods,
        fallbackUsed: result.fallbackUsed,
        pathLength: result.path.length
      },
      details: {
        gridSize: `${grid.shape[0]}x${grid.shape[1]}`,
        startPosition: startPos,
        goalPosition: goalPos,
        pathAnalysis: result.pathAnalysis
      },
      issues: result.issues,
      recommendations: this._generateRecommendations(result),
      performance: {
        insights: this._generatePerformanceInsights(result.performanceStats)
      }
    };
    
    return report;
  }

  /**
   * Generates recommendations based on validation result
   * @param {Object} result - Validation result
   * @returns {Array<string>} Recommendations
   * @private
   */
  _generateRecommendations(result) {
    const recommendations = [];
    
    if (!result.valid) {
      recommendations.push('Check level connectivity');
      recommendations.push('Verify start and goal positions are on walkable tiles');
      recommendations.push('Consider adding platforms or corridors');
    }
    
    if (result.fallbackUsed) {
      recommendations.push('Primary pathfinding method failed, consider optimizing level structure');
    }
    
    if (result.performanceStats.performanceWarning) {
      recommendations.push('Consider optimizing level size or complexity');
    }
    
    if (result.pathAnalysis.complexity > 0.5) {
      recommendations.push('Path is complex, consider simplifying level layout');
    }
    
    return recommendations;
  }

  /**
   * Generates performance insights
   * @param {Object} performanceStats - Performance statistics
   * @returns {Object} Performance insights
   * @private
   */
  _generatePerformanceInsights(performanceStats) {
    const insights = {
      totalTime: performanceStats.executionTime,
      methodCount: performanceStats.methodsUsed.length,
      slowestMethod: null,
      fastestMethod: null
    };
    
    // Find slowest and fastest methods
    let slowestTime = 0;
    let fastestTime = Infinity;
    
    for (const [method, times] of Object.entries(performanceStats.methodTimings)) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      
      if (avgTime > slowestTime) {
        slowestTime = avgTime;
        insights.slowestMethod = method;
      }
      
      if (avgTime < fastestTime) {
        fastestTime = avgTime;
        insights.fastestMethod = method;
      }
    }
    
    return insights;
  }

  /**
   * Handles errors during validation
   * @param {Error} error - The error that occurred
   * @param {number} startTime - Start time from performance.now()
   * @returns {Object} Error result
   * @private
   */
  _handleError(error, startTime) {
    const performanceStats = this._generatePerformanceStats(startTime);
    
    return {
      valid: false,
      path: [],
      verificationMethods: [],
      fallbackUsed: false,
      fallbackAttempts: 0,
      pathValidated: false,
      pathAnalysis: {},
      performanceStats: performanceStats,
      issues: [`Pathfinding error occurred: ${error.message}`],
      report: {
        summary: { valid: false, error: error.message },
        details: { error: error.stack },
        issues: [`Pathfinding error occurred: ${error.message}`],
        recommendations: ['Check input parameters', 'Verify grid format']
      },
      errorHandled: true,
      allMethodsFailed: true
    };
  }
}

module.exports = SolvabilityTester; 
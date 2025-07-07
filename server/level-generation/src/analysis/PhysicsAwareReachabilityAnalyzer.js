/**
 * @fileoverview Physics-Aware Reachability Analysis System
 * Implements physics-aware reachability analysis with jump constraints
 */

const ndarray = require('ndarray');

/**
 * PhysicsAwareReachabilityAnalyzer class for physics-aware reachability analysis
 * Handles jump constraints, unreachable area detection, and platform placement planning
 */
class PhysicsAwareReachabilityAnalyzer {
  /**
   * Creates a new PhysicsAwareReachabilityAnalyzer instance
   * @param {Object} config - Configuration options
   * @param {number} config.jumpHeight - Player jump height in pixels (default: 800)
   * @param {number} config.gravity - Gravity in pixels/s² (default: 980)
   */
  constructor(config = {}) {
    this.jumpHeight = config.jumpHeight !== undefined ? config.jumpHeight : 800;
    this.gravity = config.gravity !== undefined ? config.gravity : 980;
    
    // Validate physics parameters
    this._validatePhysicsParameters();
  }

  /**
   * Validates physics parameters
   * @throws {Error} If parameters are invalid
   * @private
   */
  _validatePhysicsParameters() {
    if (this.jumpHeight <= 0) {
      throw new Error('Jump height must be positive');
    }
    
    if (this.gravity <= 0) {
      throw new Error('Gravity must be positive');
    }
  }

  /**
   * Calculates maximum horizontal jump distance based on physics
   * @returns {number} Maximum horizontal jump distance in pixels
   */
  calculateJumpDistance() {
    // Allow a 2-tile jump (128px) but not more
    return Math.floor(this.jumpHeight * 0.17); // 17% of jump height
  }

  /**
   * Checks if a jump from start to end is possible within physics constraints
   * @param {Object} start - Start coordinates {x, y}
   * @param {Object} end - End coordinates {x, y}
   * @param {ndarray} grid - Optional grid for bounds checking
   * @returns {boolean} True if jump is possible, false otherwise
   */
  isReachableByJump(start, end, grid = null) {
    // Validate coordinates
    this._validateCoordinates(start, 'Start');
    this._validateCoordinates(end, 'End');
    
    // Always check grid bounds
    let width = 100, height = 100;
    if (grid && grid.shape) {
      width = grid.shape[0];
      height = grid.shape[1];
    }
    if (start.x >= width || start.y >= height || end.x >= width || end.y >= height) {
      throw new Error('Coordinates out of bounds');
    }
    
    // Only allow jumps from solid ground (wall below)
    if (grid && !this._isOnSolidGround(start, grid)) {
      return false;
    }
    
    const dx = Math.abs(end.x - start.x);
    const dy = end.y - start.y; // Positive means jumping up
    
    // Convert tile coordinates to pixels for comparison
    const tileSize = 64; // Standard tile size
    const dxPixels = dx * tileSize;
    const dyPixels = dy * tileSize;
    
    // Check horizontal distance
    const maxHorizontalDistance = this.calculateJumpDistance();
    if (dxPixels > maxHorizontalDistance) {
      return false;
    }
    
    // Check vertical jump height (negative dy means jumping up)
    // Use a more restrictive jump height for tile-based coordinates
    const maxJumpHeightPixels = this.jumpHeight * 0.3; // 30% of jump height for tile-based coordinates
    if (dyPixels < -maxJumpHeightPixels) {
      return false;
    }
    
    // For jumps, check for obstacles in the path since players cannot jump through walls
    if (grid && !this._checkPathForObstacles(start, end, grid)) {
      return false;
    }
    
    return true;
  }

  /**
   * Checks if there are obstacles in the path between two points
   * @param {Object} start - Start coordinates {x, y}
   * @param {Object} end - End coordinates {x, y}
   * @param {ndarray} grid - The grid to check
   * @returns {boolean} True if path is clear, false if blocked
   * @private
   */
  _checkPathForObstacles(start, end, grid) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Use Bresenham's line algorithm to check all tiles along the path
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    if (steps === 0) return true;
    
    const xStep = dx / steps;
    const yStep = dy / steps;
    
    for (let i = 1; i < steps; i++) {
      const x = Math.round(start.x + xStep * i);
      const y = Math.round(start.y + yStep * i);
      
      // Check if this tile is a wall (value 1)
      if (grid.get(x, y) === 1) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Detects unreachable areas in the grid based on jump constraints
   * @param {ndarray} grid - The ndarray grid to analyze
   * @returns {Array<Object>} Array of unreachable area coordinates
   */
  detectUnreachableAreas(grid) {
    // Validate grid input
    if (!grid) {
      throw new Error('Grid is required');
    }

    if (!grid.shape || grid.shape.length !== 2) {
      throw new Error('Grid must be 2-dimensional');
    }

    const [width, height] = grid.shape;
    const tileSize = 64;
    const maxJumpDistance = this.calculateJumpDistance();
    const maxJumpTiles = Math.floor(maxJumpDistance / tileSize);
    const maxJumpHeightTiles = Math.floor((this.jumpHeight * 0.3) / tileSize);

    // Find all floor tiles
    const floorTiles = [];
    let minY = height;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === 0) {
          floorTiles.push({ x, y });
          if (y < minY) minY = y;
        }
      }
    }
    if (floorTiles.length === 0) return [];

    // Find all solid ground tiles (floor tiles with wall below)
    const startTiles = [];
    for (const tile of floorTiles) {
      if (this._isOnSolidGround(tile, grid)) {
        startTiles.push(tile);
      }
    }
    
    // If no solid ground found, start from all floor tiles in the topmost row(s)
    let actualStartTiles = startTiles;
    if (startTiles.length === 0) {
      actualStartTiles = floorTiles.filter(tile => tile.y === minY);
    }
    if (actualStartTiles.length === 0) {
      return floorTiles;
    }

    // BFS to mark all reachable tiles with proper physics constraints
    const visited = new Set();
    const queue = [];
    for (const tile of actualStartTiles) {
      queue.push(tile);
      visited.add(`${tile.x},${tile.y}`);
    }

    while (queue.length > 0) {
      const current = queue.shift();

      // Check if we're on solid ground or in mid-air
      if (this._isOnSolidGround(current, grid)) {
        // Can jump to other positions
        this._processJumpFromSolidGround(current, grid, visited, queue, maxJumpTiles, maxJumpHeightTiles, minY);
      } else {
        // In mid-air, can only fall
        this._processFallingFromMidAir(current, grid, visited, queue, minY);
      }
    }

    // Any floor tile not visited is unreachable
    const unreachableAreas = [];
    for (const tile of floorTiles) {
      if (!visited.has(`${tile.x},${tile.y}`)) {
        unreachableAreas.push(tile);
      }
    }
    
    return unreachableAreas;
  }

  /**
   * Processes jumping from a solid ground position
   * @param {Object} current - Current position
   * @param {ndarray} grid - The grid
   * @param {Set} visited - Set of visited positions
   * @param {Array} queue - Queue for BFS
   * @param {number} maxJumpTiles - Maximum horizontal jump distance in tiles
   * @param {number} maxJumpHeightTiles - Maximum vertical jump height in tiles
   * @param {number} minY - Minimum y value among all floor tiles
   * @private
   */
  _processJumpFromSolidGround(current, grid, visited, queue, maxJumpTiles, maxJumpHeightTiles, minY) {
    const [width, height] = grid.shape;
    
    // Check all possible jump destinations within physics constraints
    for (let dy = -maxJumpHeightTiles; dy <= maxJumpTiles; dy++) {
      for (let dx = -maxJumpTiles; dx <= maxJumpTiles; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = current.x + dx;
        const ny = current.y + dy;
        
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (grid.get(nx, ny) !== 0) continue; // Must be floor tile
        
        // Simulate jump
        if (this.isReachableByJump(current, { x: nx, y: ny }, grid)) {
          // Simulate falling after jump using unified function
          this._simulateFallingWithDiagonalMovement({ x: nx, y: ny }, grid, height, true, visited, queue);
        }
      }
    }
  }

  /**
   * Processes falling from a mid-air position with triangle-shaped spread
   * @param {Object} current - Current position
   * @param {ndarray} grid - The grid
   * @param {Set} visited - Set of visited positions
   * @param {Array} queue - Queue for BFS
   * @param {number} minY - Minimum y value among all floor tiles
   * @private
   */
  _processFallingFromMidAir(current, grid, visited, queue, minY) {
    this._simulateFallingWithDiagonalMovement(current, grid, grid.shape[1], true, visited, queue);
  }



  /**
   * Plans optimal platform placement for unreachable areas
   * @param {ndarray} grid - The grid to analyze
   * @param {Array<Object>} unreachableAreas - Array of unreachable area coordinates
   * @returns {Array<Object>} Array of platform placement suggestions
   */
  planPlatformPlacement(grid, unreachableAreas) {
    if (!unreachableAreas || unreachableAreas.length === 0) {
      return [];
    }

    const platformLocations = [];
    const [width, height] = grid.shape;

    // Group unreachable areas by proximity
    const groupedAreas = this._groupUnreachableAreas(unreachableAreas);

    for (const group of groupedAreas) {
      const platform = this._calculateOptimalPlatform(grid, group);
      if (platform) {
        platformLocations.push(platform);
      }
    }

    return platformLocations;
  }

  /**
   * Groups unreachable areas by proximity for efficient platform placement
   * @param {Array<Object>} unreachableAreas - Array of unreachable area coordinates
   * @returns {Array<Array<Object>>} Array of grouped areas
   * @private
   */
  _groupUnreachableAreas(unreachableAreas) {
    if (unreachableAreas.length === 0) {
      return [];
    }

    const groups = [];
    const visited = new Set();

    for (const area of unreachableAreas) {
      if (visited.has(`${area.x},${area.y}`)) {
        continue;
      }

      const group = [area];
      visited.add(`${area.x},${area.y}`);

      // Find nearby areas
      for (const otherArea of unreachableAreas) {
        if (visited.has(`${otherArea.x},${otherArea.y}`)) {
          continue;
        }

        const distance = Math.abs(otherArea.x - area.x) + Math.abs(otherArea.y - area.y);
        if (distance <= 3) { // Group areas within 3 tiles
          group.push(otherArea);
          visited.add(`${otherArea.x},${otherArea.y}`);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Calculates optimal platform for a group of unreachable areas
   * @param {ndarray} grid - The grid to analyze
   * @param {Array<Object>} group - Group of unreachable areas
   * @returns {Object|null} Platform placement suggestion or null
   * @private
   */
  _calculateOptimalPlatform(grid, group) {
    if (group.length === 0) {
      return null;
    }

    // Calculate bounding box of the group
    let minX = group[0].x, maxX = group[0].x;
    let minY = group[0].y, maxY = group[0].y;

    for (const area of group) {
      minX = Math.min(minX, area.x);
      maxX = Math.max(maxX, area.x);
      minY = Math.min(minY, area.y);
      maxY = Math.max(maxY, area.y);
    }

    // Calculate platform position and size
    const platformX = minX;
    const platformY = minY;
    const platformWidth = (maxX - minX + 1) * 64; // Convert to pixels

    return {
      x: platformX,
      y: platformY,
      width: Math.max(platformWidth, 64) // Minimum platform size
    };
  }

  /**
   * Validates platform placement within physics constraints
   * @param {ndarray} grid - The grid to analyze
   * @param {Object} platform - Platform placement {x, y, width}
   * @returns {boolean} True if placement is valid, false otherwise
   */
  validatePlatformPlacement(grid, platform) {
    if (!platform || typeof platform.x !== 'number' || typeof platform.y !== 'number') {
      return false;
    }

    const [width, height] = grid.shape;
    
    // Check if platform is within grid bounds
    if (platform.x < 0 || platform.y < 0 || platform.x >= width || platform.y >= height) {
      return false;
    }

    // Debug printout
    const platformTiles = Math.ceil(platform.width / 64);
    for (let i = 0; i < platformTiles; i++) {
      const tileX = platform.x + i;
      const tileY = platform.y;
      if (tileX >= width) break;
      const value = grid.get(tileX, tileY);
      if (value === 1) {
        return false; // Cannot place platform on top of a wall
      }
    }
    return true; // Bridging (allowed over floor)
  }

  /**
   * Performs complete physics-aware reachability analysis
   * @param {ndarray} grid - The grid to analyze
   * @returns {Object} Complete analysis results
   */
  analyzeReachability(grid) {
    const startTime = process.hrtime.bigint();
    
    // Validate grid input
    if (!grid) {
      throw new Error('Grid is required');
    }

    // Detect unreachable areas
    const unreachableAreas = this.detectUnreachableAreas(grid);
    
    // Plan platform placement
    const platformLocations = this.planPlatformPlacement(grid, unreachableAreas);
    
    // Calculate physics constraints
    const physicsConstraints = {
      jumpHeight: this.jumpHeight,
      gravity: this.gravity,
      maxJumpDistance: this.calculateJumpDistance()
    };
    
    // Calculate performance statistics
    const endTime = process.hrtime.bigint();
    const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const performanceStats = {
      executionTime: executionTime,
      memoryUsage: process.memoryUsage().heapUsed,
      gridSize: `${grid.shape[0]}x${grid.shape[1]}`
    };

    return {
      unreachableAreas,
      platformLocations,
      physicsConstraints,
      performanceStats
    };
  }

  /**
   * Checks if a position is on solid ground (has a wall below)
   * @param {Object} pos - Position coordinates {x, y}
   * @param {ndarray} grid - The grid to check
   * @returns {boolean} True if on solid ground, false otherwise
   * @private
   */
  _isOnSolidGround(pos, grid) {
    const [width, height] = grid.shape;
    
    // Check if current position is a floor tile (value 0)
    if (grid.get(pos.x, pos.y) !== 0) {
      return false;
    }
    
    // Check if there's a wall tile (value 1) directly below
    const belowY = pos.y + 1;
    if (belowY >= height) {
      return false; // At bottom of grid, no wall below
    }
    
    return grid.get(pos.x, belowY) === 1;
  }

  /**
   * Validates coordinates against grid bounds
   * @param {Object} coords - Coordinates {x, y}
   * @param {string} name - Name for error message
   * @throws {Error} If coordinates are invalid
   * @private
   */
  _validateCoordinates(coords, name) {
    if (!coords || typeof coords.x !== 'number' || typeof coords.y !== 'number') {
      throw new Error(`${name} coordinates are required`);
    }

    if (coords.x < 0 || coords.y < 0) {
      throw new Error('Coordinates out of bounds');
    }
  }

  /**
   * Detects all reachable positions from a starting point within a specified number of moves
   * @param {ndarray} grid - The ndarray grid to analyze
   * @param {Object} playerPosition - Starting position {x, y}
   * @param {number} maxMoves - Maximum number of moves allowed
   * @returns {Array<Object>} Array of reachable position coordinates {x, y}
   */
  detectReachablePositionsFromStartingPoint(grid, playerPosition, maxMoves) {
    // Validate input parameters
    if (!grid) {
      throw new Error('Grid is required');
    }

    if (!grid.shape || grid.shape.length !== 2) {
      throw new Error('Grid must be 2-dimensional');
    }

    if (!playerPosition) {
      throw new Error('Player position is required');
    }

    if (!playerPosition.hasOwnProperty('x') || !playerPosition.hasOwnProperty('y')) {
      throw new Error('Player position must have x and y coordinates');
    }

    if (maxMoves < 0) {
      throw new Error('Max moves must be non-negative');
    }

    const [width, height] = grid.shape;

    // Validate player position bounds
    if (playerPosition.x < 0 || playerPosition.x >= width || 
        playerPosition.y < 0 || playerPosition.y >= height) {
      throw new Error('Player position is out of bounds');
    }

    // Validate player position is on floor tile
    if (grid.get(playerPosition.x, playerPosition.y) !== 0) {
      throw new Error('Player position must be on a floor tile');
    }

    const tileSize = 64;
    const maxJumpDistance = this.calculateJumpDistance();
    const maxJumpTiles = Math.floor(maxJumpDistance / tileSize);
    const maxJumpHeightTiles = Math.floor((this.jumpHeight * 0.3) / tileSize);

    // Simulate falling from starting position first (falling doesn't count as a move)
    const actualStartPosition = this._simulateStraightLineFalling(playerPosition, grid, height);

    // BFS to find all reachable positions within maxMoves
    const reachablePositions = [];
    const visited = new Map(); // Maps "x,y" -> minimum moves to reach
    const queue = [{ pos: actualStartPosition, moves: 0 }];
    
    visited.set(`${actualStartPosition.x},${actualStartPosition.y}`, 0);
    reachablePositions.push({ x: actualStartPosition.x, y: actualStartPosition.y });

    while (queue.length > 0) {
      const current = queue.shift();
      
      // Don't explore further if we've reached max moves
      if (current.moves >= maxMoves) {
        continue;
      }

      // Explore all possible moves from current position
      this._exploreMovesFromPosition(current, grid, visited, queue, reachablePositions, 
                                     maxJumpTiles, maxJumpHeightTiles, width, height, maxMoves);
    }

    return reachablePositions;
  }

  /**
   * Explores all possible moves from a given position
   * @param {Object} current - Current position and move count {pos: {x, y}, moves: number}
   * @param {ndarray} grid - The grid
   * @param {Map} visited - Map of visited positions with minimum moves
   * @param {Array} queue - BFS queue
   * @param {Array} reachablePositions - Array to store reachable positions
   * @param {number} maxJumpTiles - Maximum horizontal jump distance in tiles
   * @param {number} maxJumpHeightTiles - Maximum vertical jump height in tiles
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @param {number} maxMoves - Maximum allowed moves
   * @private
   */
  _exploreMovesFromPosition(current, grid, visited, queue, reachablePositions, 
                           maxJumpTiles, maxJumpHeightTiles, width, height, maxMoves) {
    const { pos, moves } = current;

    // 1. Walking moves (left/right) - these count as 1 move each
    // this._exploreWalkingMoves(pos, moves, grid, visited, queue, reachablePositions, width, height, maxMoves);

    // 2. Jumping moves - these count as 1 move each
    this._exploreJumpingMoves(pos, moves, grid, visited, queue, reachablePositions, 
                             maxJumpTiles, maxJumpHeightTiles, width, height, maxMoves);
  }

  /**
   * Explores walking moves (left/right)
   * @param {Object} pos - Current position {x, y}
   * @param {number} moves - Current move count
   * @param {ndarray} grid - The grid
   * @param {Map} visited - Map of visited positions
   * @param {Array} queue - BFS queue
   * @param {Array} reachablePositions - Array to store reachable positions
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @param {number} maxMoves - Maximum allowed moves
   * @private
   */
  _exploreWalkingMoves(pos, moves, grid, visited, queue, reachablePositions, width, height, maxMoves) {
    // Only allow walking if on solid ground (wall below)
    if (!this._isOnSolidGround(pos, grid)) {
      return;
    }

    const walkingDirections = [
      { dx: -1, dy: 0 }, // Left
      { dx: 1, dy: 0 }   // Right
    ];

    for (const direction of walkingDirections) {
      const newX = pos.x + direction.dx;
      const newY = pos.y + direction.dy;

      // Check bounds
      if (newX < 0 || newX >= width || newY < 0 || newY >= height) {
        continue;
      }

      // Check if target tile is walkable (floor)
      if (grid.get(newX, newY) !== 0) {
        continue;
      }

      // Add the immediate walking position
      this._addReachablePosition({ x: newX, y: newY }, moves + 1, visited, queue, reachablePositions, maxMoves);

      // After walking, simulate falling with diagonal movement (falling doesn't count as a move)
      const fallPath = this._simulateFallingWithDiagonalMovement({ x: newX, y: newY }, grid, height, true);
      const newMoves = moves + 1;

      // Add all positions along the fall path
      fallPath.forEach((fallPos, index) => {
        // The first position is the walking position we already added, so skip it
        if (index > 0) {
          this._addReachablePosition(fallPos, newMoves, visited, queue, reachablePositions, maxMoves);
        }
      });
    }
  }

  /**
   * Explores jumping moves in all directions
   * @param {Object} pos - Current position {x, y}
   * @param {number} moves - Current move count
   * @param {ndarray} grid - The grid
   * @param {Map} visited - Map of visited positions
   * @param {Array} queue - BFS queue
   * @param {Array} reachablePositions - Array to store reachable positions
   * @param {number} maxJumpTiles - Maximum horizontal jump distance in tiles
   * @param {number} maxJumpHeightTiles - Maximum vertical jump height in tiles
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @param {number} maxMoves - Maximum allowed moves
   * @private
   */
  _exploreJumpingMoves(pos, moves, grid, visited, queue, reachablePositions, 
                      maxJumpTiles, maxJumpHeightTiles, width, height, maxMoves) {
    // Only allow jumping if on solid ground (wall below)
    if (!this._isOnSolidGround(pos, grid)) {
      return;
    }

    // Explore jump targets within physics constraints
    for (let dy = -maxJumpHeightTiles; dy <= maxJumpHeightTiles; dy++) {
      for (let dx = -maxJumpTiles; dx <= maxJumpTiles; dx++) {
        // Skip current position and pure vertical moves
        if (dx === 0 && dy === 0) continue;

        const targetX = pos.x + dx;
        const targetY = pos.y + dy;

        // Check bounds
        if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) {
          continue;
        }

        // Check if target tile is reachable (floor)
        if (grid.get(targetX, targetY) !== 0) {
          continue;
        }

        const target = { x: targetX, y: targetY };

        // Validate jump physics
        if (!this.isReachableByJump(pos, target, grid)) {
          continue;
        }

        // Add the jump landing position
        this._addReachablePosition(target, moves + 1, visited, queue, reachablePositions, maxMoves);

        // After jumping, simulate falling with diagonal movement (falling doesn't count as a move)
        const fallPath = this._simulateFallingWithDiagonalMovement(target, grid, height, true);
        const newMoves = moves + 1;

        // Add all positions along the fall path
        fallPath.forEach((fallPos, index) => {
          // The first position is the jump landing position we already added, so skip it
          if (index > 0) {
            this._addReachablePosition(fallPos, newMoves, visited, queue, reachablePositions, maxMoves);
          }
        });
      }
    }
  }

  /**
   * Checks if a position is on solid ground (has a wall below)
   * @param {Object} pos - Position to check {x, y}
   * @param {ndarray} grid - The grid
   * @returns {boolean} True if on solid ground, false otherwise
   * @private
   */
  _isOnSolidGround(pos, grid) {
    const [width, height] = grid.shape;
    
    // Check if there's a wall below the position
    if (pos.y + 1 < height) {
      return grid.get(pos.x, pos.y + 1) === 1;
    }
    
    // If at the bottom of the grid, consider it solid ground
    return false;
  }



  /**
   * Simulates straight-line falling from a position and returns the final landing position
   * Used for initial falling from starting position (no diagonal movement)
   * @param {Object} startPos - Starting position {x, y}
   * @param {ndarray} grid - The grid
   * @param {number} height - Grid height
   * @returns {Object} Final position after falling {x, y}
   * @private
   */
  _simulateStraightLineFalling(startPos, grid, height) {
    let currentPos = { x: startPos.x, y: startPos.y };

    // Fall straight down until we hit solid ground or reach bottom
    while (currentPos.y + 1 < height) {
      const belowY = currentPos.y + 1;
      
      // If there's a wall below, we've landed on solid ground
      if (grid.get(currentPos.x, belowY) === 1) {
        break;
      }
      
      // If there's a floor below, keep falling
      if (grid.get(currentPos.x, belowY) === 0) {
        currentPos.y = belowY;
      } else {
        // Hit a wall, stop falling
        break;
      }
    }

    return currentPos;
  }

  /**
   * Simulates falling from a position with diagonal movement and returns all positions along the fall path
   * Creates a triangle-shaped fall pattern where the player can move diagonally while falling
   * @param {Object} startPos - Starting position {x, y}
   * @param {ndarray} grid - The grid
   * @param {number} height - Grid height
   * @param {boolean} returnPath - If true, returns all positions along fall path. If false, returns only final position
   * @param {Set} visited - Optional visited set for BFS tracking (used in detectUnreachableAreas)
   * @param {Array} queue - Optional queue for BFS (used in detectUnreachableAreas)
   * @returns {Array<Object>|Object} Array of all positions along the fall path, or final position if returnPath is false
   * @private
   */
  _simulateFallingWithDiagonalMovement(startPos, grid, height, returnPath = true, visited = null, queue = null) {
    const fallPath = [{ x: startPos.x, y: startPos.y }];
    const localVisited = visited || new Set();
    const localQueue = queue || [{ x: startPos.x, y: startPos.y }];
    
    if (!visited) {
      localVisited.add(`${startPos.x},${startPos.y}`);
    }

    while (localQueue.length > 0) {
      const { x, y } = localQueue.shift();
      const belowY = y + 1;
      
      for (let dx = -1; dx <= 1; dx++) {
        const newX = x + dx;
        const newY = belowY;
        
        // Check bounds
        if (newX < 0 || newX >= grid.shape[0] || newY < 0 || newY >= height) {
          continue;
        }
        
        // Check if below position is floor
        if (grid.get(newX, newY) === 0) {
          const newPos = { x: newX, y: newY };
          const key = `${newX},${newY}`;
          
          // Add to fall path if not already visited
          if (!localVisited.has(key)) {
            fallPath.push(newPos);
            localVisited.add(key);
            
            // If we have a queue for BFS (detectUnreachableAreas case), add to it
            if (queue) {
              queue.push(newPos);
            }
            
            // Check if we can continue falling (below the new position)
            const belowBelowY = newY + 1;
            if (belowBelowY < height && grid.get(newX, belowBelowY) === 0) {
              // Only add to queue if not already visited
              localQueue.push(newPos);
            }
          }
        }
      }
    }

    // Return based on the returnPath parameter
    if (returnPath) {
      return fallPath;
    } else {
      // Return only the final position (last position in fall path)
      return fallPath[fallPath.length - 1];
    }
  }



  /**
   * Adds a reachable position if it hasn't been visited with fewer moves
   * @param {Object} position - Position to add {x, y}
   * @param {number} moves - Number of moves to reach this position
   * @param {Map} visited - Map of visited positions
   * @param {Array} queue - BFS queue
   * @param {Array} reachablePositions - Array to store reachable positions
   * @param {number} maxMoves - Maximum allowed moves
   * @private
   */
  _addReachablePosition(position, moves, visited, queue, reachablePositions, maxMoves) {
    const key = `${position.x},${position.y}`;
    const existingMoves = visited.get(key);

    // Only add if we haven't visited this position or we reached it with fewer moves
    if (existingMoves === undefined || moves < existingMoves) {
      visited.set(key, moves);
      
      // Add to reachable positions if not already there
      if (existingMoves === undefined) {
        reachablePositions.push({ x: position.x, y: position.y });
      }
      
      // Add to queue for further exploration if we haven't reached max moves
      if (moves < maxMoves) {
        queue.push({ pos: { x: position.x, y: position.y }, moves });
      }
    }
  }
}

module.exports = PhysicsAwareReachabilityAnalyzer; 
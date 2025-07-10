/**
 * @fileoverview StrategicEnemyPlacer - Strategic enemy placement with solvability validation
 * Places enemies strategically using analysis while preserving level solvability
 */

const EnemyPlacementAnalyzer = require('./EnemyPlacementAnalyzer');

class StrategicEnemyPlacer {
  /**
   * Creates a StrategicEnemyPlacer with configuration
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      maxEnemies: config.maxEnemies || 10,
      enemyDensity: config.enemyDensity || 0.1,
      minDistanceFromSpawn: config.minDistanceFromSpawn || 5,
      minDistanceFromGoal: config.minDistanceFromGoal || 3,
      preserveSolvability: config.preserveSolvability !== false,
      ...config
    };
    this.analyzer = new EnemyPlacementAnalyzer(config);
  }

  /**
   * Places enemies strategically while preserving level solvability
   * @param {ndarray} grid - The cave grid
   * @param {Object} playerPos - Player spawn position
   * @param {Array} coins - Array of coin positions
   * @param {Object} goalPos - Goal position
   * @param {Array} platforms - Array of platform data
   * @param {Function} rng - Random number generator function
   * @returns {Array} Array of enemy configurations
   */
  placeEnemies(grid, playerPos, coins, goalPos, platforms, rng) {
    console.log('🔍 Analyzing strategic enemy placement locations...');
    
    // Get placement candidates from analyzer
    const candidates = this.analyzer.generateEnemyPlacementCandidates(grid, coins, goalPos);
    console.log(`📊 Found ${candidates.length} potential enemy placement candidates`);
    
    if (candidates.length === 0) {
      console.log('⚠️  No enemy placement candidates found');
      return [];
    }

    // Calculate target enemy count based on cave size and density
    const caveSize = grid.shape[0] * grid.shape[1];
    const targetEnemies = Math.min(
      this.config.maxEnemies,
      Math.floor(caveSize * this.config.enemyDensity)
    );

    console.log(`🎯 Target enemy count: ${targetEnemies}`);

    // Sort candidates by strategic priority (type, then zone)
    const sortedCandidates = this.sortCandidatesByPriority(candidates, playerPos, goalPos);

    // Partition candidates into zones (left, middle, right)
    const levelWidth = goalPos ? Math.max(goalPos.x, playerPos.x) : grid.shape[0] - 1;
    const zones = [[], [], []];
    for (const candidate of sortedCandidates) {
      const relativeX = candidate.x / levelWidth;
      const zoneIdx = Math.min(2, Math.floor(relativeX * 3)); // 0, 1, or 2
      zones[zoneIdx].push(candidate);
    }

    // Round-robin selection from zones to ensure even distribution
    const placedEnemies = [];
    const usedPositions = new Set();
    let zonePointer = 0;
    let attempts = 0;
    while (placedEnemies.length < targetEnemies && attempts < 1000) {
      // Find next available candidate in the current zone
      let candidate = null;
      while (zones[zonePointer].length > 0 && !candidate) {
        const next = zones[zonePointer].shift();
        // Check distance constraints
        if (!this.isValidDistance(next, playerPos, goalPos)) continue;
        // Check if position is already used
        const posKey = `${next.x},${next.y}`;
        if (usedPositions.has(posKey)) continue;
        // Validate solvability if required
        if (this.config.preserveSolvability) {
          if (!this.validateSolvability(grid, next, playerPos, goalPos)) {
            continue;
          }
        }
        candidate = next;
      }
      if (candidate) {
        const enemyConfig = this.createEnemyConfiguration(candidate, rng);
        placedEnemies.push(enemyConfig);
        usedPositions.add(`${candidate.x},${candidate.y}`);
      }
      // Move to next zone
      zonePointer = (zonePointer + 1) % 3;
      attempts++;
      // If all zones are empty, break
      if (zones.every(z => z.length === 0)) break;
    }

    console.log(`🎮 Successfully placed ${placedEnemies.length} enemies`);
    return placedEnemies;
  }

  /**
   * Sorts candidates by strategic priority
   * @param {Array} candidates - Placement candidates
   * @param {Object} playerPos - Player position
   * @param {Object} goalPos - Goal position
   * @returns {Array} Sorted candidates
   */
  sortCandidatesByPriority(candidates, playerPos, goalPos) {
    return candidates.sort((a, b) => {
      // Priority order: choke points > strategic > patrol areas > platforms
      const priorityOrder = { chokePoint: 4, strategic: 3, patrol: 2, platform: 1 };
      const aPriority = priorityOrder[a.type] || 0;
      const bPriority = priorityOrder[b.type] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      // Secondary sort by level-wide distribution instead of distance from player
      // This ensures enemies are placed across the entire level, not just the right side
      const aLevelPosition = this.getLevelPosition(a, playerPos, goalPos);
      const bLevelPosition = this.getLevelPosition(b, playerPos, goalPos);
      return aLevelPosition - bLevelPosition;
    });
  }

  /**
   * Calculates a level position score for even distribution
   * @param {Object} candidate - Placement candidate
   * @param {Object} playerPos - Player position
   * @param {Object} goalPos - Goal position
   * @returns {number} Level position score (lower = higher priority)
   */
  getLevelPosition(candidate, playerPos, goalPos) {
    // Calculate the relative position in the level (0 = left side, 1 = right side)
    const levelWidth = goalPos ? Math.max(goalPos.x, playerPos.x) : 100;
    const relativeX = candidate.x / levelWidth;
    
    // Create zones for even distribution
    // Zone 0: 0-0.33 (left third)
    // Zone 1: 0.33-0.66 (middle third)
    // Zone 2: 0.66-1.0 (right third)
    const zone = Math.floor(relativeX * 3);
    
    // Add some randomness within each zone to avoid clustering
    const zoneRandomness = (candidate.x + candidate.y) % 10;
    
    // Return a score that prioritizes even distribution across zones
    // Lower scores get higher priority
    return zone * 10 + zoneRandomness;
  }

  /**
   * Validates distance constraints
   * @param {Object} candidate - Placement candidate
   * @param {Object} playerPos - Player position
   * @param {Object} goalPos - Goal position
   * @returns {boolean} True if distance constraints are met
   */
  isValidDistance(candidate, playerPos, goalPos) {
    if (playerPos) {
      const distanceFromSpawn = this.calculateDistance(candidate, playerPos);
      if (distanceFromSpawn < this.config.minDistanceFromSpawn) {
        return false;
      }
    }

    if (goalPos) {
      const distanceFromGoal = this.calculateDistance(candidate, goalPos);
      if (distanceFromGoal < this.config.minDistanceFromGoal) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validates that enemy placement doesn't break level solvability
   * @param {ndarray} grid - The cave grid
   * @param {Object} candidate - Placement candidate
   * @param {Object} playerPos - Player position
   * @param {Object} goalPos - Goal position
   * @returns {boolean} True if solvability is preserved
   */
  validateSolvability(grid, candidate, playerPos, goalPos) {
    // For now, use a simple heuristic: don't block critical paths
    // In a full implementation, this would use pathfinding validation
    
    // Check if the position blocks a direct path to goal
    if (goalPos && playerPos) {
      const isOnCriticalPath = this.isOnCriticalPath(grid, candidate, playerPos, goalPos);
      if (isOnCriticalPath) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if a position is on a critical path between player and goal
   * @param {ndarray} grid - The cave grid
   * @param {Object} candidate - Placement candidate
   * @param {Object} playerPos - Player position
   * @param {Object} goalPos - Goal position
   * @returns {boolean} True if on critical path
   */
  isOnCriticalPath(grid, candidate, playerPos, goalPos) {
    // Simple heuristic: if the position is on a narrow corridor between player and goal
    const width = grid.shape[0];
    const height = grid.shape[1];
    
    // Check if this is a narrow corridor (choke point)
    const isChokePoint = this.analyzer.detectChokePoints(grid).some(
      point => point.x === candidate.x && point.y === candidate.y
    );
    
    if (!isChokePoint) return false;
    
    // Check if it's between player and goal
    const minX = Math.min(playerPos.x, goalPos.x);
    const maxX = Math.max(playerPos.x, goalPos.x);
    const minY = Math.min(playerPos.y, goalPos.y);
    const maxY = Math.max(playerPos.y, goalPos.y);
    
    return candidate.x >= minX && candidate.x <= maxX && 
           candidate.y >= minY && candidate.y <= maxY;
  }

  /**
   * Creates enemy configuration for placement
   * @param {Object} candidate - Placement candidate
   * @param {Function} rng - Random number generator
   * @returns {Object} Enemy configuration
   */
  createEnemyConfiguration(candidate, rng) {
    // Generate random patrol parameters for LoopHound
    const patrolDistance = Math.floor(rng() * 450) + 50; // 50-500 pixels
    const direction = rng() > 0.5 ? 1 : -1;
    const speed = Math.floor(rng() * 190) + 10; // 10-200 pixels/second

    return {
      type: 'LoopHound',
      x: candidate.x,
      y: candidate.y,
      patrolDistance: patrolDistance,
      direction: direction,
      speed: speed,
      placementType: candidate.type
    };
  }

  /**
   * Calculates distance between two positions
   * @param {Object} pos1 - First position
   * @param {Object} pos2 - Second position
   * @returns {number} Distance
   */
  calculateDistance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
  }
}

module.exports = StrategicEnemyPlacer; 
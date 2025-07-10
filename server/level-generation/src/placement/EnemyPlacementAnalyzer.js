/**
 * @fileoverview EnemyPlacementAnalyzer - Strategic enemy placement analysis
 * Analyzes cave structure to identify optimal enemy placement locations
 */

class EnemyPlacementAnalyzer {
  /**
   * Creates an EnemyPlacementAnalyzer with configuration
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      chokePointThreshold: config.chokePointThreshold || 3,
      minPatrolArea: config.minPatrolArea || 5,
      maxPatrolArea: config.maxPatrolArea || 20,
      strategicDistance: config.strategicDistance || 5,
      goalStrategicDistance: config.goalStrategicDistance || 8
    };
  }

  /**
   * Detects choke points (horizontal corridors with walls above and below) in the grid
   * @param {ndarray} grid - The cave grid
   * @returns {Array<{x: number, y: number}>} Array of choke point positions
   */
  detectChokePoints(grid) {
    const chokePoints = [];
    const width = grid.shape[0];
    const height = grid.shape[1];

    // Scan for horizontal corridors with walls above and below
    for (let y = 1; y < height - 1; y++) {
      for (let x = 0; x < width; x++) {
        const isFloor = grid.get(x, y) === 0;
        const hasWallAbove = grid.get(x, y - 1) === 1;
        const hasWallBelow = grid.get(x, y + 1) === 1;
        if (isFloor && hasWallAbove && hasWallBelow) {
          chokePoints.push({ x, y });
        }
      }
    }
    return chokePoints;
  }

  /**
   * Identifies patrol areas as contiguous runs of floor tiles with a wall below, filtered by min/max patrol area.
   * @param {ndarray} grid - The cave grid
   * @returns {Array<{x: number, y: number, width: number}>} Array of patrol areas
   */
  identifyPatrolAreas(grid) {
    const patrolAreas = [];
    const width = grid.shape[0];
    const height = grid.shape[1];
    const minLen = this.config.minPatrolArea;
    const maxLen = this.config.maxPatrolArea;

    for (let y = 0; y < height; y++) {
      let platformStart = -1;
      let platformLength = 0;
      for (let x = 0; x < width; x++) {
        const isFloor = grid.get(x, y) === 0;
        const hasWallBelow = y + 1 < height ? grid.get(x, y + 1) === 1 : true;
        if (isFloor && hasWallBelow) {
          if (platformStart === -1) platformStart = x;
          platformLength++;
        } else {
          if (platformLength >= minLen && platformLength <= maxLen) {
            patrolAreas.push({ x: platformStart, y, width: platformLength });
          }
          platformStart = -1;
          platformLength = 0;
        }
      }
      if (platformLength >= minLen && platformLength <= maxLen) {
        patrolAreas.push({ x: platformStart, y, width: platformLength });
      }
    }
    return patrolAreas;
  }

  /**
   * Analyzes platform placement for enemy positioning (ground, floating, moving), filtered by min/max patrol area for ground/floating.
   * @param {ndarray} grid - The cave grid
   * @returns {Array<{x: number, y: number, platformType: string}>} Array of platform positions
   */
  analyzePlatformPlacement(grid) {
    const platformPositions = [];
    const width = grid.shape[0];
    const height = grid.shape[1];
    let hasFloorTiles = false;
    // Helper to find contiguous runs of floor tiles at a given y
    function addPlatformRun(y, platformType) {
      let runStart = -1;
      let runLength = 0;
      for (let x = 0; x < width; x++) {
        if (grid.get(x, y) === 0) {
          hasFloorTiles = true;
          if (runStart === -1) runStart = x;
          runLength++;
        } else {
          if (runLength > 0) {
            for (let i = runStart; i < runStart + runLength; i++) {
              platformPositions.push({ x: i, y, platformType });
            }
          }
          runStart = -1;
          runLength = 0;
        }
      }
      if (runLength > 0) {
        for (let i = runStart; i < runStart + runLength; i++) {
          platformPositions.push({ x: i, y, platformType });
        }
      }
    }
    // Ground platforms: all contiguous runs at bottom row
    addPlatformRun(height - 1, 'ground');
    // Floating platforms: all contiguous runs at y=3
    if (height > 3) addPlatformRun(3, 'floating');
    // Moving platforms: all contiguous runs at y=4
    if (height > 4) addPlatformRun(4, 'moving');
    if (!hasFloorTiles) return [];
    return platformPositions;
  }

  /**
   * Determines the type of platform at a given position
   * @param {ndarray} grid - The cave grid
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {string|null} Platform type or null
   */
  determinePlatformType(grid, x, y) {
    const width = grid.shape[0];
    const height = grid.shape[1];

    // Check if it's a ground platform (at bottom or with wall below)
    if (y === height - 1 || (y + 1 < height && grid.get(x, y + 1) === 1)) {
      return 'ground';
    }

    // Check if it's a floating platform (no wall below, not at bottom)
    if (y < height - 1 && grid.get(x, y + 1) === 0) {
      return 'floating';
    }

    // Check if it's a moving platform (special case - could be enhanced)
    // For now, treat as moving if it's isolated
    const hasNeighbors = this.hasFloorNeighbors(grid, x, y);
    if (!hasNeighbors) {
      return 'moving';
    }

    return null;
  }

  /**
   * Checks if a position has floor neighbors
   * @param {ndarray} grid - The cave grid
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if has floor neighbors
   */
  hasFloorNeighbors(grid, x, y) {
    const width = grid.shape[0];
    const height = grid.shape[1];

    // Check horizontal neighbors
    if (x > 0 && grid.get(x - 1, y) === 0) return true;
    if (x < width - 1 && grid.get(x + 1, y) === 0) return true;

    return false;
  }

  /**
   * Analyzes strategic positions for enemy placement
   * @param {ndarray} grid - The cave grid
   * @param {Array<{x: number, y: number}>} coins - Array of coin positions
   * @param {Object|null} goal - Goal position
   * @returns {Array<{x: number, y: number}>} Array of strategic positions
   */
  analyzeStrategicPositions(grid, coins = [], goal = null) {
    const strategicPositions = [];
    const width = grid.shape[0];
    const height = grid.shape[1];

    // Get choke points for strategic placement
    const chokePoints = this.detectChokePoints(grid);

    // Add choke points as strategic positions
    chokePoints.forEach(point => {
      strategicPositions.push({
        x: point.x,
        y: point.y,
        type: 'chokePoint'
      });
    });

    // Add positions near coins
    coins.forEach(coin => {
      for (let x = Math.max(0, coin.x - this.config.strategicDistance); 
           x <= Math.min(width - 1, coin.x + this.config.strategicDistance); x++) {
        for (let y = Math.max(0, coin.y - this.config.strategicDistance); 
             y <= Math.min(height - 1, coin.y + this.config.strategicDistance); y++) {
          if (grid.get(x, y) === 0) {
            const distance = Math.sqrt(Math.pow(x - coin.x, 2) + Math.pow(y - coin.y, 2));
            if (distance <= this.config.strategicDistance) {
              strategicPositions.push({
                x,
                y,
                type: 'strategic'
              });
            }
          }
        }
      }
    });

    // Add positions near goal
    if (goal) {
      for (let x = Math.max(0, goal.x - this.config.goalStrategicDistance); 
           x <= Math.min(width - 1, goal.x + this.config.goalStrategicDistance); x++) {
        for (let y = Math.max(0, goal.y - this.config.goalStrategicDistance); 
             y <= Math.min(height - 1, goal.y + this.config.goalStrategicDistance); y++) {
          if (grid.get(x, y) === 0) {
            const distance = Math.sqrt(Math.pow(x - goal.x, 2) + Math.pow(y - goal.y, 2));
            if (distance <= this.config.goalStrategicDistance) {
              strategicPositions.push({
                x,
                y,
                type: 'strategic'
              });
            }
          }
        }
      }
    }

    return strategicPositions;
  }

  /**
   * Validates accessibility of enemy positions
   * @param {ndarray} grid - The cave grid
   * @param {Array<{x: number, y: number}>} candidatePositions - Candidate positions
   * @returns {Array<{x: number, y: number}>} Array of accessible positions
   */
  validateAccessibility(grid, candidatePositions) {
    const accessiblePositions = [];

    candidatePositions.forEach(position => {
      const x = position.x;
      const y = position.y;

      // Check bounds
      if (x < 0 || x >= grid.shape[0] || y < 0 || y >= grid.shape[1]) {
        return;
      }

      // Check if position is on floor
      if (grid.get(x, y) === 0) {
        accessiblePositions.push({ x, y });
      }
    });

    return accessiblePositions;
  }

  /**
   * Generates comprehensive enemy placement candidates
   * @param {ndarray} grid - The cave grid
   * @param {Array} coins - Array of coin positions
   * @param {Object} goalPos - Goal position
   * @returns {Array<{x: number, y: number, type: string}>} Array of placement candidates
   */
  generateEnemyPlacementCandidates(grid, coins, goalPos) {
    const candidates = [];
    
    // Get choke point candidates
    const chokePoints = this.detectChokePoints(grid);
    chokePoints.forEach(point => {
      candidates.push({ ...point, type: 'chokePoint' });
    });

    // Get patrol area candidates
    const patrolAreas = this.identifyPatrolAreas(grid);
    patrolAreas.forEach(area => {
      // Add center position of each patrol area
      const centerX = Math.floor(area.x + area.width / 2);
      candidates.push({ x: centerX, y: area.y, type: 'patrol' });
    });

    // Get strategic position candidates
    const strategicPositions = this.analyzeStrategicPositions(grid, coins, goalPos);
    strategicPositions.forEach(pos => {
      candidates.push({ ...pos, type: 'strategic' });
    });

    // Get platform candidates
    const platformPositions = this.analyzePlatformPlacement(grid);
    platformPositions.forEach(pos => {
      candidates.push({ x: pos.x, y: pos.y, type: 'platform' });
    });

    // Validate accessibility for all candidates
    return this.validateAccessibility(grid, candidates);
  }

  /**
   * Removes duplicate positions from candidate list
   * @param {Array<{x: number, y: number}>} candidates - Candidate positions
   * @returns {Array<{x: number, y: number}>} Unique positions
   */
  removeDuplicatePositions(candidates) {
    const unique = [];
    const seen = new Set();

    candidates.forEach(candidate => {
      const key = `${candidate.x},${candidate.y}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(candidate);
      }
    });

    return unique;
  }

  /**
   * Gets placement statistics
   * @param {ndarray} grid - The cave grid
   * @param {Array<{x: number, y: number}>} coins - Array of coin positions
   * @param {Object|null} goal - Goal position
   * @returns {Object} Placement statistics
   */
  getPlacementStatistics(grid, coins = [], goal = null) {
    const candidates = this.generateEnemyPlacementCandidates(grid, coins, goal);
    
    const stats = {
      totalCandidates: candidates.length,
      chokePointCandidates: candidates.filter(c => c.type === 'chokePoint').length,
      patrolAreaCandidates: candidates.filter(c => c.type === 'patrolArea').length,
      strategicCandidates: candidates.filter(c => c.type === 'strategic').length,
      platformCandidates: candidates.filter(c => c.type === 'platform').length,
      accessibleCandidates: candidates.length
    };

    return stats;
  }
}

module.exports = EnemyPlacementAnalyzer; 
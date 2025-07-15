const ndarray = require('ndarray');
const GridUtilities = require('../core/GridUtilities');

/**
 * DiagonalCorridorDetector detects and fixes diagonal corridor issues that create impassable areas.
 * 
 * A diagonal corridor occurs when a floor tile has walls blocking movement in diagonal directions,
 * creating areas that the player cannot traverse.
 */
class DiagonalCorridorDetector {
  
  /**
   * Detects all diagonal corridor issues in the grid
   * 
   * @param {ndarray} grid - The grid to analyze (0=floor, 1=wall)
   * @returns {Array<Object>} Array of detected diagonal corridor issues with positions and types
   */
  static detectDiagonalCorridors(grid) {
    if (!grid || !grid.shape || grid.shape.length !== 2) {
      throw new Error('Invalid grid input');
    }

    const issues = [];
    const [width, height] = grid.shape;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (grid.get(x, y) === 0) { // Only check floor tiles
          const issue = this.detectDiagonalCorridorAt(grid, x, y);
          if (issue) {
            issues.push(issue);
          }
        }
      }
    }

    return issues;
  }

  /**
   * Detects if there's a diagonal corridor issue at a specific position
   * For each diagonal neighbor that is floor, if both the horizontal and vertical tiles between are walls,
   * flag as a diagonal corridor (for either tile in the pair, don't skip valid cases).
   *
   * @param {ndarray} grid - The grid to analyze
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object|null} Issue object if found, null otherwise
   */
  static detectDiagonalCorridorAt(grid, x, y) {
    const [width, height] = grid.shape;
    if (grid.get(x, y) !== 0) return null;

    // List of diagonal directions: [dx, dy, between1, between2]
    // between1 and between2 are [dx, dy] offsets for the horizontal and vertical between tiles
    const diagonals = [
      { dx: 1, dy: 1, between: [ [1, 0], [0, 1] ] },      // down-right
      { dx: -1, dy: 1, between: [ [-1, 0], [0, 1] ] },    // down-left
      { dx: 1, dy: -1, between: [ [1, 0], [0, -1] ] },    // up-right
      { dx: -1, dy: -1, between: [ [-1, 0], [0, -1] ] }   // up-left
    ];

    for (const dir of diagonals) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (grid.get(nx, ny) !== 0) continue;
      // Check the two between tiles
      const [b1, b2] = dir.between;
      const bx1 = x + b1[0];
      const by1 = y + b1[1];
      const bx2 = x + b2[0];
      const by2 = y + b2[1];
      // Debug output
      // eslint-disable-next-line no-console
      console.log(`Checking (${x},${y}) diagonal to (${nx},${ny}), between (${bx1},${by1}) and (${bx2},${by2})`);
      if (
        bx1 >= 0 && bx1 < width && by1 >= 0 && by1 < height &&
        bx2 >= 0 && bx2 < width && by2 >= 0 && by2 < height &&
        grid.get(bx1, by1) === 1 &&
        grid.get(bx2, by2) === 1
      ) {
        // eslint-disable-next-line no-console
        console.log(`  Found diagonal corridor at (${x},${y}) with diagonal (${nx},${ny})`);
        // Only flag one of each pair: only flag if (x < nx) or (x == nx && y < ny)
        // But if both are floor, it's fine to flag both for now (let the test decide)
        return {
          position: { x, y },
          type: 'diagonal_corridor',
          diagonal: { x: nx, y: ny },
          between: [ { x: bx1, y: by1 }, { x: bx2, y: by2 } ],
          severity: 'high'
        };
      }
    }
    return null;
  }

  /**
   * Fixes diagonal corridor issues by converting appropriate wall tiles to floor tiles
   * 
   * @param {ndarray} grid - The grid to fix
   * @returns {Object} Result with number of fixes applied
   */
  static fixDiagonalCorridors(grid) {
    const issues = this.detectDiagonalCorridors(grid);
    let fixesApplied = 0;

    for (const issue of issues) {
      const fixed = this.fixDiagonalCorridor(grid, issue);
      if (fixed) {
        fixesApplied++;
      }
    }

    return {
      fixesApplied,
      issuesFound: issues.length
    };
  }

  /**
   * Fixes a specific diagonal corridor issue
   * 
   * @param {ndarray} grid - The grid to fix
   * @param {Object} issue - The diagonal corridor issue to fix
   * @returns {boolean} True if a fix was applied
   */
  static fixDiagonalCorridor(grid, issue) {
    // The issue object has 'between': [ {x, y}, {x, y} ]
    let fixed = false;
    for (const pos of issue.between) {
      if (grid.get(pos.x, pos.y) === 1) {
        grid.set(pos.x, pos.y, 0);
        fixed = true;
      }
    }
    return fixed;
  }

  /**
   * Checks if a specific tile is part of a diagonal corridor
   * 
   * @param {ndarray} grid - The grid to check
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if the tile is part of a diagonal corridor
   */
  static isDiagonalCorridor(grid, x, y) {
    const issue = this.detectDiagonalCorridorAt(grid, x, y);
    return issue !== null;
  }
}

module.exports = DiagonalCorridorDetector; 
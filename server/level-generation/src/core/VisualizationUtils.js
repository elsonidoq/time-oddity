/**
 * @fileoverview Visualization utilities for level generation system
 * Provides ASCII art visualization and debugging capabilities
 * 
 * @module VisualizationUtils
 */

/**
 * Converts a grid to ASCII art for visual inspection, with optional overlays.
 *
 * This function provides comprehensive ASCII visualization of grid data with
 * support for multiple overlay types including reachable tiles, critical ring,
 * platforms, coins, enemies, player, and goal positions. Overlays are applied with
 * priority: player > goal > enemy > coin > platform > criticalRing > reachable.
 *
 * @param {ndarray} grid - The grid to visualize
 * @param {Object} [options] - Optional overlays
 * @param {Array<{x:number, y:number}>} [options.reachableTiles] - Tiles to mark as 'X'
 * @param {Array<{x:number, y:number}>} [options.criticalRing] - Tiles to mark as 'O' (higher priority than reachableTiles)
 * @param {Array<{x:number, y:number}>} [options.platforms] - Tiles to mark as 'l'
 * @param {Array<{x:number, y:number}>} [options.coins] - Tiles to mark as 'C'
 * @param {Array<{x:number, y:number}>} [options.enemies] - Tiles to mark as 'E'
 * @param {{x:number, y:number}} [options.player] - Player position to mark as 'P'
 * @param {{x:number, y:number}} [options.goal] - Goal position to mark as 'G'
 * @returns {string} ASCII art string (rows separated by newlines)
 * @throws {Error} If grid is null/undefined or any overlay is placed on a wall tile (value = 1)
 * 
 * @example
 * const grid = createGrid(10, 5, 0);
 * const ascii = toAsciiArt(grid, {
 *   player: {x: 1, y: 1},
 *   goal: {x: 8, y: 3},
 *   coins: [{x: 3, y: 2}, {x: 5, y: 2}],
 *   platforms: [{x: 4, y: 1}],
 *   criticalRing: [{x: 2, y: 2}]
 * });
 * console.log(ascii);
 */
function toAsciiArt(grid, options = {}) {
  if (!grid) throw new Error('Grid is required');
  const [width, height] = grid.shape;

  // Build a map of overlays, with priority: player > goal > enemy > coin > platform > criticalRing > reachable
  // (P > G > E > C > l > O > X)
  // We'll use a 2D array to store overlay chars, or null if none
  const overlay = Array.from({ length: height }, () => Array(width).fill(null));

  // Helper to check and set overlay, error if on wall
  function setOverlay(x, y, char) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const v = grid.get(x, y);
    // Cannot place anything on walls (except for platforms which are walls)
    if (v === 1 && char !== 'l') {
      throw new Error(`Cannot place overlay '${char}' at (${x},${y}): tile is a wall`);
    }
    overlay[y][x] = char;
  }

  // Track critical ring positions for priority and for reachableTiles filtering
  let criticalRingSet = null;
  if (Array.isArray(options.criticalRing)) {
    criticalRingSet = new Set(options.criticalRing.map(pt => `${pt.x},${pt.y}`));
  }

  // Reachable tiles (lowest priority, but skip if in criticalRing)
  if (Array.isArray(options.reachableTiles)) {
    for (const pt of options.reachableTiles) {
      if (criticalRingSet && criticalRingSet.has(`${pt.x},${pt.y}`)) continue;
      setOverlay(pt.x, pt.y, '+');
    }
  }
  // Critical ring (higher than reachableTiles, lower than platform)
  if (Array.isArray(options.criticalRing)) {
    for (const pt of options.criticalRing) {
      setOverlay(pt.x, pt.y, 'O');
    }
  }
  // Platforms
  if (Array.isArray(options.platforms)) {
    for (const pt of options.platforms) {
      // Support platforms with width (default to 1 if not specified)
      const platformWidth = pt.width && pt.width > 1 ? pt.width : 1;
      for (let dx = 0; dx < platformWidth; dx++) {
        setOverlay(pt.x + dx, pt.y, 'l');
      }
    }
  }
  // Coins
  if (Array.isArray(options.coins)) {
    for (const pt of options.coins) {
      setOverlay(pt.x, pt.y, 'C');
    }
  }
  // Enemies
  if (Array.isArray(options.enemies)) {
    for (const pt of options.enemies) {
      setOverlay(pt.x, pt.y, 'E');
    }
  }
  // Goal (high priority, below player)
  if (options.goal && typeof options.goal.x === 'number' && typeof options.goal.y === 'number') {
    setOverlay(options.goal.x, options.goal.y, 'G');
  }
  // Player (highest priority)
  if (options.player && typeof options.player.x === 'number' && typeof options.player.y === 'number') {
    setOverlay(options.player.x, options.player.y, 'P');
  }

  let lines = [];
  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      const v = grid.get(x, y);
      if (v === 1) {
        if (overlay[y][x] === 'l') {
          line += 'l';
        } else {
          line += '#';
        }
      } else if (overlay[y][x]) {
        line += overlay[y][x];
      } else {
        line += '.';
      }
    }
    lines.push(line);
  }
  return lines.join('\n');
}

module.exports = {
  toAsciiArt
}; 
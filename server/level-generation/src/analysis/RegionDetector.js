// RegionDetector.js
const fill = require('flood-fill');
const ndarray = require('ndarray');

const RegionDetector = {
  /**
   * Detects connected floor regions in a grid and labels them.
   *
   * This function scans the input grid (where 0 = floor, 1 = wall) and assigns a unique label
   * (starting from 2) to each contiguous region of floor tiles using flood fill. It returns a new
   * labelGrid (with regions labeled) and a regionData object containing metadata for each region.
   *
   * @param {ndarray} grid - The input grid (ndarray) with 0 for floor and 1 for wall.
   * @returns {{ labelGrid: ndarray, regionData: Object }} An object containing:
   *   - labelGrid: ndarray with each region labeled by a unique integer (2+)
   *   - regionData: Object mapping region label to { area, bounds }
   *
   * Example:
   *   const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
   */
  detectRegions(grid) {
    // Copy grid to labelGrid
    const labelGrid = ndarray(new Uint8Array(grid.data), grid.shape);
    const [width, height] = grid.shape;
    const regionData = {};
    let currentLabel = 2; // 0=floor, 1=wall, 2+ = regions

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (labelGrid.get(x, y) === 0) {
          // Unlabeled floor, start a new region
          const fillResult = fill(labelGrid, x, y, currentLabel);
          regionData[currentLabel] = {
            area: fillResult.area,
            bounds: { lo: fillResult.lo, hi: fillResult.hi }
          };
          currentLabel++;
        }
      }
    }
    return { labelGrid, regionData };
  },
  toAsciiArt(labelGrid) {
    const [width, height] = labelGrid.shape;
    let out = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const v = labelGrid.get(x, y);
        if (v === 1) out += '#'; // wall
        else if (v === 0) out += '.'; // unlabeled floor (shouldn't happen)
        else out += String.fromCharCode(64 + ((v - 1) % 26)); // region label: A, B, C...
      }
      out += '\n';
    }
    return out;
  }
};

module.exports = RegionDetector; 
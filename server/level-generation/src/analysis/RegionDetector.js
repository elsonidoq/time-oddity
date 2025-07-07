// RegionDetector.js
const fill = require('flood-fill');
const ndarray = require('ndarray');

const RegionDetector = {
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
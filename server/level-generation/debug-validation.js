const CorridorCarver = require('./src/analysis/CorridorCarver');
const RegionDetector = require('./src/analysis/RegionDetector');
const ndarray = require('ndarray');

// Debug the failing test
const grid = ndarray(new Uint8Array([
  0, 0, 1, 1, 0, 0,
  0, 0, 1, 1, 0, 0,
  0, 0, 0, 0, 0, 0, // corridor connecting regions
  0, 0, 1, 1, 0, 0,
  0, 0, 1, 1, 0, 0
]), [6, 5]);

console.log('Original grid:');
console.log(CorridorCarver.toAsciiArt(grid));

const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
console.log('\nOriginal regions:', Object.keys(regionData).length);
console.log('Region data:', regionData);

const isConnected = CorridorCarver.validateConnection(grid, labelGrid, regionData);
console.log('\nIs connected:', isConnected);

// Re-detect regions to see what happens
const { regionData: newRegionData } = RegionDetector.detectRegions(grid);
console.log('\nNew regions after re-detection:', Object.keys(newRegionData).length);
console.log('New region data:', newRegionData); 
const ndarray = require('ndarray');
const RegionDetector = require('./src/analysis/RegionDetector');
const CaveVisualizer = require('./src/visualization/CaveVisualizer');
const RegionVisualizer = require('./src/visualization/RegionVisualizer');
const RandomGenerator = require('./src/core/RandomGenerator');
const { GridSeeder } = require('./src/generation/GridSeeder');

// Generate a 60x60 cave grid using GridSeeder
const width = 60;
const height = 60;
const seed = 'demo-visual-evidence';
const config = { width, height, initialWallRatio: 0.45 };
const rng = new RandomGenerator(seed);
const seeder = new GridSeeder();
const grid = seeder.seedGrid(config, rng);

console.log('Original 60x60 grid (ASCII preview):');
console.log(CaveVisualizer.toAsciiArt(grid));

const { labelGrid, regionData } = RegionDetector.detectRegions(grid);

console.log('\nRegion Visualization (RegionVisualizer):');
const regionViz = RegionVisualizer.visualizeRegions(grid, labelGrid, regionData);
console.log(regionViz.ascii);
console.log(`\nRegion count: ${regionViz.regionCount}`); 
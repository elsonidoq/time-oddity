const { GridSeeder } = require('./src/generation/GridSeeder');
const { CellularAutomata } = require('./src/generation/CellularAutomata');
const CorridorCarver = require('./src/analysis/CorridorCarver');
const RegionDetector = require('./src/analysis/RegionDetector');
const RandomGenerator = require('./src/core/RandomGenerator');

const width = 60;
const height = 60;
const rng = new RandomGenerator(new Date().toISOString());

// 1. Seed the grid
const seeder = new GridSeeder();
const seedConfig = { width, height, initialWallRatio: 0.45 };
const seededGrid = seeder.seedGrid(seedConfig, rng);

console.log('\n=== 60x60 Cave Grid (Seeded) ===');
console.log('Legend: . = floor, # = wall');
console.log(seeder.toAsciiArt(seededGrid));

// 2. Run cellular automata
const ca = new CellularAutomata();
const caConfig = { simulationSteps: 5, birthThreshold: 5, survivalThreshold: 4 };
const caGrid = ca.simulate(seededGrid, caConfig);

console.log('\n=== 60x60 Cave Grid (After Cellular Automata) ===');
console.log('Legend: . = floor, # = wall');
console.log(ca.toAsciiArt(caGrid));

// 3. Region detection
const { labelGrid, regionData } = RegionDetector.detectRegions(caGrid);
console.log('\n=== 60x60 Cave Grid (Region Detection) ===');
console.log('Legend: # = wall, A-Z = regions (each letter = different region)');
console.log(RegionDetector.toAsciiArt(labelGrid));

// 4. Corridor carving
const corridorRng = new RandomGenerator('demao-se ed');
const result = CorridorCarver.carveCorridors(caGrid, labelGrid, regionData, corridorRng);
console.log('\n=== 60x60 Cave Grid (After Corridor Carving) ===');
console.log('Legend: . = floor, # = wall');
console.log(CorridorCarver.toAsciiArt(result));

console.log('\n=== Corridor Carving Statistics ===');
console.log(`Original regions: ${Object.keys(regionData).length}`);
const isConnected = CorridorCarver.validateConnection(result, labelGrid, regionData);
console.log(`Regions connected: ${isConnected}`); 
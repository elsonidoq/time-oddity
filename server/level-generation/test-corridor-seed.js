const { GridSeeder } = require('./src/generation/GridSeeder');
const { CellularAutomata } = require('./src/generation/CellularAutomata');
const CorridorCarver = require('./src/analysis/CorridorCarver');
const RegionDetector = require('./src/analysis/RegionDetector');
const RandomGenerator = require('./src/core/RandomGenerator');

// Test with a configuration that should create multiple regions
const width = 60;
const height = 60;

// Test different seeds
const seeds = ['test-seed-1', 'test-seed-2', 'test-seed-3'];

seeds.forEach((seed, index) => {
  console.log(`\n=== Test ${index + 1}: Seed "${seed}" ===`);
  
  const rng = new RandomGenerator(seed);
  
  // 1. Seed the grid
  const seeder = new GridSeeder();
  const seedConfig = { width, height, initialWallRatio: 0.45 };
  const seededGrid = seeder.seedGrid(seedConfig, rng);
  
  // 2. Run cellular automata
  const ca = new CellularAutomata();
  const caConfig = { simulationSteps: 5, birthThreshold: 5, survivalThreshold: 4 };
  const caGrid = ca.simulate(seededGrid, caConfig);
  
  // 3. Region detection
  const { labelGrid, regionData } = RegionDetector.detectRegions(caGrid);
  console.log(`Regions detected: ${Object.keys(regionData).length}`);
  
  // 4. Corridor carving with different corridor seeds
  const corridorSeeds = ['corridor-seed-1', 'corridor-seed-2'];
  
  corridorSeeds.forEach((corridorSeed, corridorIndex) => {
    const corridorRng = new RandomGenerator(corridorSeed);
    const result = CorridorCarver.carveCorridors(caGrid, labelGrid, regionData, corridorRng);
    const isConnected = CorridorCarver.validateConnection(result, labelGrid, regionData);
    console.log(`  Corridor seed "${corridorSeed}": Connected = ${isConnected}`);
  });
}); 
const { GridSeeder } = require('./src/generation/GridSeeder');
const { CellularAutomata } = require('./src/generation/CellularAutomata');
const RegionDetector = require('./src/analysis/RegionDetector');
const RandomGenerator = require('./src/core/RandomGenerator');

const width = 60;
const height = 60;

// Test different seeds to find one that creates multiple regions
const testSeeds = [
  'test-1', 'test-2', 'test-3', 'test-4', 'test-5',
  'multi-region-1', 'multi-region-2', 'multi-region-3',
  'disconnected-1', 'disconnected-2', 'disconnected-3',
  'separate-1', 'separate-2', 'separate-3'
];

console.log('Searching for a seed that creates multiple regions...\n');

for (const seed of testSeeds) {
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
  const regionCount = Object.keys(regionData).length;
  
  console.log(`Seed "${seed}": ${regionCount} regions`);
  
  if (regionCount > 1) {
    console.log(`\nFOUND! Seed "${seed}" creates ${regionCount} regions.`);
    console.log('Use this seed in the demo to show corridor carving in action.');
    break;
  }
}

console.log('\nIf no multi-region seed was found, try adjusting the CA parameters.'); 
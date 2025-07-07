/**
 * Debug script to test cave generation pipeline
 */

const { GridSeeder } = require('./src/generation/GridSeeder');
const { CellularAutomata } = require('./src/generation/CellularAutomata');
const { CaveQualityValidator } = require('./src/validation/CaveQualityValidator');
const RandomGenerator = require('./src/core/RandomGenerator');

function debugCaveGeneration() {
  console.log('=== Cave Generation Debug ===\n');

  // Step 1: Initial Grid Seeding
  console.log('Step 1: Initial Grid Seeding');
  const seeder = new GridSeeder();
  const rng = new RandomGenerator('debug-seed');
  const config = {
    width: 40,
    height: 40,
    initialWallRatio: 0.45
  };

  const initialGrid = seeder.seedGrid(config, rng);
  console.log('Initial grid wall ratio:', seeder.getWallRatio(initialGrid));
  console.log('Initial grid ASCII:');
  console.log(seeder.toAsciiArt(initialGrid));
  console.log('\n');

  // Step 2: Cellular Automata Simulation + Smoothing
  console.log('Step 2: Cellular Automata Simulation + Smoothing');
  const ca = new CellularAutomata();
  const caConfig = {
    simulationSteps: 5, // match Python reference
    birthThreshold: 5,
    survivalThreshold: 4,
    smoothingPasses: 2 // match Python reference
  };

  const finalGrid = ca.simulateWithSmoothing(initialGrid, caConfig);
  console.log('Final grid wall ratio:', seeder.getWallRatio(finalGrid));
  console.log('Final grid ASCII:');
  console.log(ca.toAsciiArt(finalGrid));
  console.log('\n');

  // Step 3: Quality Validation
  console.log('Step 3: Quality Validation');
  const validator = new CaveQualityValidator();
  const metrics = validator.calculateQualityMetrics(finalGrid);
  const score = validator.calculateQualityScore(finalGrid);
  const validation = validator.validateCave(finalGrid);

  console.log('Quality Metrics:', metrics);
  console.log('Quality Score:', score);
  console.log('Validation Result:', validation);
  console.log('\n');

  // Step 4: Visual Comparison
  console.log('Step 4: Visual Comparison');
  console.log('Initial Grid (40x40):');
  console.log(seeder.toAsciiArt(initialGrid));
  console.log('\nFinal Grid (40x40):');
  console.log(ca.toAsciiArt(finalGrid));

  // Step 5: CaveVisualizer demonstration
  console.log('Step 5: CaveVisualizer (NEW SYSTEM)');
  const CaveVisualizer = require('./src/visualization/CaveVisualizer');
  console.log('CaveVisualizer ASCII (Final Grid):');
  console.log(CaveVisualizer.toAsciiArt(finalGrid));
}

debugCaveGeneration(); 
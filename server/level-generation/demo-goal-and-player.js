const { GridSeeder } = require('./src/generation/GridSeeder');
const { CellularAutomata } = require('./src/generation/CellularAutomata');
const CorridorCarver = require('./src/analysis/CorridorCarver');
const RegionDetector = require('./src/analysis/RegionDetector');
const RandomGenerator = require('./src/core/RandomGenerator');
const GridUtilities = require('./src/core/GridUtilities');
const PlayerSpawnPlacer = require('./src/placement/PlayerSpawnPlacer');
const GoalPlacer = require('./src/placement/GoalPlacer');

const width = 60;
const height = 60;
const rng = new RandomGenerator(new Date().toISOString());

console.log('=== Time Oddity Cave Generation Demo ===');
console.log('Demonstrating CG-04.3: Player Spawn and Goal Placement with Validation\n');

// 1. Seed the grid
console.log('Step 1: Seeding the grid...');
const seeder = new GridSeeder();
const seedConfig = { width, height, initialWallRatio: 0.45 };
const seededGrid = seeder.seedGrid(seedConfig, rng);

console.log('Legend: . = floor, # = wall');
console.log(seeder.toAsciiArt(seededGrid));

// 2. Run cellular automata
console.log('\nStep 2: Running cellular automata...');
const ca = new CellularAutomata();
const caConfig = { simulationSteps: 5, birthThreshold: 5, survivalThreshold: 4 };
const caGrid = ca.simulate(seededGrid, caConfig);

console.log('Legend: . = floor, # = wall');
console.log(ca.toAsciiArt(caGrid));

// 3. Region detection
console.log('\nStep 3: Detecting regions...');
const { labelGrid, regionData } = RegionDetector.detectRegions(caGrid);
console.log('Legend: # = wall, A-Z = regions (each letter = different region)');
console.log(RegionDetector.toAsciiArt(labelGrid));
console.log(`Found ${Object.keys(regionData).length} disconnected regions`);

// 4. Corridor carving
console.log('\nStep 4: Carving corridors to connect regions...');
const corridorRng = new RandomGenerator('corridor-seed');
const connectedGrid = CorridorCarver.carveCorridors(caGrid, labelGrid, regionData, corridorRng);

console.log('Legend: . = floor, # = wall');
console.log(CorridorCarver.toAsciiArt(connectedGrid));

// 5. Player spawn placement
console.log('\nStep 5: Placing player spawn with safety validation...');
const spawnPlacer = new PlayerSpawnPlacer({
  maxAttempts: 100,
  safetyRadius: 2
});

const spawnResult = spawnPlacer.placeSpawn(connectedGrid, rng);

let playerPos = null;
if (spawnResult.success) {
  playerPos = spawnResult.position;
  console.log(`✅ Player spawn placed successfully at (${playerPos.x}, ${playerPos.y})`);
} else {
  console.log(`❌ Failed to place player spawn: ${spawnResult.error}`);
}

// 6. Goal placement
console.log('\nStep 6: Placing goal with reachability validation...');
const goalPlacer = new GoalPlacer();
let goalResult = null;
let goalPos = null;
if (playerPos) {
  goalResult = goalPlacer.placeGoal(connectedGrid, playerPos, rng);
  if (goalResult.success) {
    goalPos = goalResult.position;
    console.log(`✅ Goal placed successfully at (${goalPos.x}, ${goalPos.y})`);
    console.log(`- Distance from player: ${goalResult.distance.toFixed(2)}`);
    console.log(`- Goal currently unreachable (expected): ${goalResult.isUnreachable ? '✅' : '❌'}`);
    console.log(`- Goal visibility: ${goalResult.isVisible ? 'Good' : 'Poor'}`);
  } else {
    console.log(`❌ Failed to place goal: ${goalResult.error}`);
  }
} else {
  console.log('❌ Cannot place goal without player spawn.');
}

// 7. Visualization
console.log('\nFinal cave with player spawn (P) and goal (G):');
console.log('Legend: . = floor, # = wall, P = player spawn, G = goal');
console.log('Note: P and G must be on a floor tile with a wall tile directly below (per architectural invariant)');

const vizGrid = GridUtilities.copyGrid(connectedGrid);
if (playerPos) GridUtilities.setSafe(vizGrid, playerPos.x, playerPos.y, 2); // Mark player as 2
if (goalPos) GridUtilities.setSafe(vizGrid, goalPos.x, goalPos.y, 3); // Mark goal as 3

let ascii = '';
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const value = vizGrid.get(x, y);
    if (value === 0) {
      ascii += '.';
    } else if (value === 1) {
      ascii += '#';
    } else if (value === 2) {
      ascii += 'P';
    } else if (value === 3) {
      ascii += 'G';
    }
  }
  ascii += '\n';
}
console.log(ascii);

if (playerPos && goalPos) {
  // Placement invariant check
  const playerOnFloor = connectedGrid.get(playerPos.x, playerPos.y) === 0;
  const playerWallBelow = playerPos.y + 1 < height && connectedGrid.get(playerPos.x, playerPos.y + 1) === 1;
  const goalOnFloor = connectedGrid.get(goalPos.x, goalPos.y) === 0;
  const goalWallBelow = goalPos.y + 1 < height && connectedGrid.get(goalPos.x, goalPos.y + 1) === 1;

  if (!playerOnFloor || !playerWallBelow) {
    console.warn('WARNING: Player spawn does not satisfy placement invariant!');
  }
  if (!goalOnFloor || !goalWallBelow) {
    console.warn('WARNING: Goal does not satisfy placement invariant!');
  }

  console.log(`Player spawn: (${playerPos.x}, ${playerPos.y})`);
  console.log(`Goal:        (${goalPos.x}, ${goalPos.y})`);
  console.log(`Goal currently unreachable: ${goalResult.isUnreachable ? 'Yes' : 'No'} (expected: Yes)`);
}

console.log('\n=== Demo Complete ===');
console.log('CG-04.3 Player Spawn and Goal Placement: ✅ IMPLEMENTED'); 
const { GridSeeder } = require('./src/generation/GridSeeder');
const { CellularAutomata } = require('./src/generation/CellularAutomata');
const CorridorCarver = require('./src/analysis/CorridorCarver');
const RegionDetector = require('./src/analysis/RegionDetector');
const RandomGenerator = require('./src/core/RandomGenerator');
const GridUtilities = require('./src/core/GridUtilities');
const PlayerSpawnPlacer = require('./src/placement/PlayerSpawnPlacer');
const GoalPlacer = require('./src/placement/GoalPlacer');
const CoinDistributor = require('./src/placement/CoinDistributor');
const PhysicsAwareReachabilityAnalyzer = require('./src/analysis/PhysicsAwareReachabilityAnalyzer');
const FloatingPlatformPlacer = require('./src/placement/FloatingPlatformPlacer');

const width = 100;
const height = 30;
const seed = new Date().toISOString();
console.log(`seed: ${seed}`);
const rng = new RandomGenerator(seed);

console.log('=== Debug Platform Validation ===\n');

// 1. Seed the grid
console.log('Step 1: Seeding the grid...');
const seeder = new GridSeeder();
const seedConfig = { width, height, initialWallRatio: 0.45 };
const seededGrid = seeder.seedGrid(seedConfig, rng);

// 2. Run cellular automata
console.log('\nStep 2: Running cellular automata...');
const ca = new CellularAutomata();
const caConfig = { simulationSteps: 5, birthThreshold: 5, survivalThreshold: 4 };
const caGrid = ca.simulate(seededGrid, caConfig);

// 3. Region detection
console.log('\nStep 3: Detecting regions...');
const { labelGrid, regionData } = RegionDetector.detectRegions(caGrid);

// 4. Corridor carving
console.log('\nStep 4: Carving corridors to connect regions...');
const corridorRng = new RandomGenerator('corridor-seed');
const connectedGrid = CorridorCarver.carveCorridors(caGrid, labelGrid, regionData, corridorRng);

// 5. Player spawn placement
console.log('\nStep 5: Placing player spawn...');
const spawnPlacer = new PlayerSpawnPlacer({
  maxAttempts: 100,
  safetyRadius: 2
});

const spawnResult = spawnPlacer.placeSpawn(connectedGrid, rng);
let playerPos = null;
if (spawnResult.success) {
  playerPos = spawnResult.position;
  console.log(`✅ Player spawn placed at (${playerPos.x}, ${playerPos.y})`);
} else {
  console.log(`❌ Failed to place player spawn: ${spawnResult.error}`);
  process.exit(1);
}

// 6. Goal placement
console.log('\nStep 6: Placing goal...');
const goalPlacer = new GoalPlacer();
let goalResult = null;
let goalPos = null;
if (playerPos) {
  goalResult = goalPlacer.placeGoal(connectedGrid, playerPos, rng);
  if (goalResult.success) {
    goalPos = goalResult.position;
    console.log(`✅ Goal placed at (${goalPos.x}, ${goalPos.y})`);
  } else {
    console.log(`❌ Failed to place goal: ${goalResult.error}`);
    process.exit(1);
  }
}

// 7. Coin placement using CoinDistributor
console.log('\nStep 7: Placing coins strategically...');
const coinDistributor = new CoinDistributor({
  coinCount: 12,
  deadEndWeight: 0.4,
  explorationWeight: 0.3,
  unreachableWeight: 0.3,
  minDistance: 3
});

const coins = coinDistributor.distributeCoins(connectedGrid, playerPos, rng);
console.log(`✅ Placed ${coins.length} coins`);

// 8. Physics-Aware Reachability Analysis
console.log('\nStep 8: Analyzing coin reachability...');
const physicsAnalyzer = new PhysicsAwareReachabilityAnalyzer({
  jumpHeight: 800,
  gravity: 980
});

// Get reachable tiles from player position 
const reachableTiles = physicsAnalyzer.detectReachablePositionsFromStartingPoint(connectedGrid, playerPos, null);

// Create a set of reachable positions for fast lookup
const reachableSet = new Set(reachableTiles.map(tile => `${tile.x},${tile.y}`));

// 9. Debug Floating Platform Placement
console.log('\nStep 9: Debugging floating platform placement...');
const floatingPlatformPlacer = new FloatingPlatformPlacer({
  maxPlatforms: 5,
  minPlatformSize: 3,
  maxPlatformSize: 8,
  visualImpactThreshold: 0.7,
  groupingDistance: 4,
  accessibilityValidationEnabled: true
});

const unreachableAreasForPlatforms = floatingPlatformPlacer.identifyUnreachableAreas(connectedGrid, playerPos);
console.log(`- Unreachable areas identified: ${unreachableAreasForPlatforms.length}`);

const groupedAreas = floatingPlatformPlacer.groupUnreachableAreas(unreachableAreasForPlatforms);
console.log(`- Grouped areas: ${groupedAreas.length}`);

// Debug: Check platform calculation
console.log('\nCalculating platforms...');
const platforms = floatingPlatformPlacer.calculateOptimalPlatforms(connectedGrid, unreachableAreasForPlatforms, playerPos);
console.log(`- Calculated platforms: ${platforms.length}`);

// Debug: Check each platform validation individually
console.log('\nChecking individual platform validation:');
let validPlatforms = 0;
platforms.slice(0, 5).forEach((platform, index) => {
  console.log(`  Platform ${index + 1}: (${platform.x}, ${platform.y}) size ${platform.width}`);
  
  // Check if platform would be valid
  const isValid = physicsAnalyzer.validatePlatformPlacement(connectedGrid, platform);
  console.log(`    validatePlatformPlacement: ${isValid}`);
  
  if (isValid) {
    validPlatforms++;
  }
  
  // Check what's at the platform position
  const platformTiles = Math.ceil(platform.width / 64);
  for (let i = 0; i < Math.min(platformTiles, 3); i++) {
    const tileX = platform.x + i;
    const tileY = platform.y;
    if (tileX < width && tileY < height) {
      const value = connectedGrid.get(tileX, tileY);
      console.log(`    Tile (${tileX}, ${tileY}): value ${value}`);
    }
  }
});

console.log(`\nValid platforms: ${validPlatforms}/${platforms.length}`);

// Debug: Check accessibility validation with all platforms
console.log('\nChecking accessibility validation with all platforms...');
const accessibilityValid = floatingPlatformPlacer.validateAccessibility(connectedGrid, platforms, unreachableAreasForPlatforms);
console.log(`- Accessibility validation passed: ${accessibilityValid}`);

// Debug: Check accessibility validation with only valid platforms
console.log('\nChecking accessibility validation with only valid platforms...');
const validPlatformsOnly = platforms.filter(platform => physicsAnalyzer.validatePlatformPlacement(connectedGrid, platform));
const accessibilityValidFiltered = floatingPlatformPlacer.validateAccessibility(connectedGrid, validPlatformsOnly, unreachableAreasForPlatforms);
console.log(`- Accessibility validation with filtered platforms: ${accessibilityValidFiltered}`);

// Debug: Check final platform placement
console.log('\nFinal platform placement...');
const floatingPlatforms = floatingPlatformPlacer.placeFloatingPlatforms(connectedGrid, unreachableAreasForPlatforms, playerPos);
console.log(`- Final platforms placed: ${floatingPlatforms.length}`);

console.log('\n=== Debug Complete ==='); 
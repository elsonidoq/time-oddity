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
const ReachableFrontierAnalyzer = require('./src/analysis/ReachableFrontierAnalyzer');
const CriticalRingAnalyzer = require('./src/analysis/CriticalRingAnalyzer');
const StrategicPlatformPlacer = require('./src/placement/StrategicPlatformPlacer');

const width = 100;
const height = 30;
const seed = new Date().toISOString();
console.log(`seed: ${seed}`);
const rng = new RandomGenerator(seed);

console.log('=== Time Oddity Cave Generation with Platform Placement Demo ===\n');

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
const reachableTiles = physicsAnalyzer.detectReachablePositionsFromStartingPoint(connectedGrid, playerPos, null);
const reachableSet = new Set(reachableTiles.map(tile => `${tile.x},${tile.y}`));

// 9. Frontier Analysis
console.log('\nStep 9: Analyzing reachable frontier...');
const frontierAnalyzer = new ReachableFrontierAnalyzer({
  jumpHeight: 800,
  gravity: 980
});
const frontierTiles = frontierAnalyzer.findReachableFrontier(playerPos, connectedGrid);
console.log(`✅ Found ${frontierTiles.length} frontier tiles`);
const frontierSet = new Set(frontierTiles.map(tile => `${tile.x},${tile.y}`));

// 10. Critical Ring Analysis
console.log('\nStep 10: Analyzing critical ring...');
const criticalRingAnalyzer = new CriticalRingAnalyzer({
  jumpHeight: 800,
  gravity: 980
});
const criticalRingTiles = criticalRingAnalyzer.findCriticalRing(playerPos, connectedGrid);
console.log(`✅ Found ${criticalRingTiles.length} critical ring tiles`);
const criticalRingSet = new Set(criticalRingTiles.map(tile => `${tile.x},${tile.y}`));

// 11. Platform Placement
console.log('\nStep 11: Placing platforms to achieve 85% reachability...');
const platformPlacer = new StrategicPlatformPlacer({
  targetReachability: 0.85,
  floatingPlatformProbability: 0.4,
  movingPlatformProbability: 0.6,
  minPlatformSize: 2,
  maxPlatformSize: 6
});
const platformRng = new RandomGenerator('platform-seed');
const platforms = platformPlacer.placePlatforms(connectedGrid, playerPos, () => platformRng.random());
console.log(`✅ Placed ${platforms.length} platforms`);

// 12. Recalculate reachability after platform placement
console.log('\nStep 12: Recalculating reachability with platforms...');
const gridWithPlatforms = GridUtilities.copyGrid(connectedGrid);

// Mark platform tiles as walls in the grid
platforms.forEach(platform => {
  platform.getOccupiedTiles().forEach(tile => {
    GridUtilities.setSafe(gridWithPlatforms, tile.x, tile.y, 1); // Mark as wall
  });
});

// Recalculate reachability with platforms
const reachableTilesWithPlatforms = physicsAnalyzer.detectReachablePositionsFromStartingPoint(gridWithPlatforms, playerPos, null);
const reachableSetWithPlatforms = new Set(reachableTilesWithPlatforms.map(tile => `${tile.x},${tile.y}`));

console.log(`✅ Recalculated reachability: ${reachableTilesWithPlatforms.length} reachable tiles with platforms`);

// Helper function to generate ASCII visualization with platforms
function generateMapWithPlatforms() {
  const vizGrid = GridUtilities.copyGrid(connectedGrid);

  // Mark player and goal
  if (playerPos) GridUtilities.setSafe(vizGrid, playerPos.x, playerPos.y, 2);
  if (goalPos) GridUtilities.setSafe(vizGrid, goalPos.x, goalPos.y, 3);

  // Mark reachable tiles AFTER platform placement
  reachableTilesWithPlatforms.forEach(tile => {
    if (vizGrid.get(tile.x, tile.y) === 0) {
      GridUtilities.setSafe(vizGrid, tile.x, tile.y, 4);
    }
  });

  // Mark frontier tiles (from before platform placement)
  frontierTiles.forEach(tile => {
    GridUtilities.setSafe(vizGrid, tile.x, tile.y, 7); // 7 = frontier tile
  });

  // Mark critical ring tiles (from before platform placement)
  criticalRingTiles.forEach(tile => {
    GridUtilities.setSafe(vizGrid, tile.x, tile.y, 8); // 8 = critical ring tile
  });

  // Mark coins with updated reachability
  coins.forEach((coin, index) => {
    const isReachable = reachableSetWithPlatforms.has(`${coin.x},${coin.y}`);
    GridUtilities.setSafe(vizGrid, coin.x, coin.y, isReachable ? 5 : 6); // 5=reachable coin, 6=unreachable coin
  });

  // Mark platforms with 'T'
  platforms.forEach(platform => {
    platform.getOccupiedTiles().forEach(tile => {
      GridUtilities.setSafe(vizGrid, tile.x, tile.y, 9); // 9 = platform tile
    });
  });

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
      } else if (value === 4) {
        ascii += 'R';
      } else if (value === 5) {
        ascii += 'C';
      } else if (value === 6) {
        ascii += 'c';
      } else if (value === 7) {
        ascii += 'X'; // Frontier tiles marked with X
      } else if (value === 8) {
        ascii += 'I'; // Critical ring tiles marked with I
      } else if (value === 9) {
        ascii += 'T'; // Platform tiles marked with T
      }
    }
    ascii += '\n';
  }

  return ascii;
}

// Print the final level
console.log('\n=== Final Level with Platforms, Coins, Frontier, and Critical Ring ===');
console.log('Legend: . = floor, # = wall, P = player, G = goal, R = reachable area, C = reachable coin, c = unreachable coin, X = frontier, I = critical ring, T = platform');
console.log(generateMapWithPlatforms());

// Print coin reachability analysis
console.log('\n=== Coin Reachability Analysis ===');
let reachableCoins = 0;
let unreachableCoins = 0;

coins.forEach((coin, index) => {
  const isReachable = reachableSetWithPlatforms.has(`${coin.x},${coin.y}`);
  const status = isReachable ? 'REACHABLE' : 'UNREACHABLE';
  const symbol = isReachable ? 'C' : 'c';
  console.log(`Coin ${index + 1} at (${coin.x},${coin.y}): ${status} ${symbol}`);
  
  if (isReachable) {
    reachableCoins++;
  } else {
    unreachableCoins++;
  }
});

console.log(`\nSummary:`);
console.log(`- Total coins placed: ${coins.length}`);
console.log(`- Reachable coins: ${reachableCoins}`);
console.log(`- Unreachable coins: ${unreachableCoins}`);
console.log(`- Reachability rate: ${((reachableCoins / coins.length) * 100).toFixed(1)}%`);

// Print strategic placement analysis
console.log('\n=== Strategic Placement Analysis ===');
const deadEnds = coinDistributor.detectDeadEnds(connectedGrid);
const explorationAnalysis = coinDistributor.analyzeExplorationAreas(connectedGrid);
const unreachableAreas = coinDistributor.identifyUnreachableAreas(connectedGrid, playerPos);

console.log(`- Dead-ends detected: ${deadEnds.length}`);
console.log(`- Exploration areas: ${explorationAnalysis.explorationAreas.length}`);
console.log(`- Unreachable areas identified: ${unreachableAreas.length}`);

// Print floating platform analysis
console.log('\n=== Floating Platform Analysis ===');
platforms.forEach((platform, index) => {
  // Visual impact is not stored, so recalculate for display
  const visualImpact = platformPlacer.assessVisualImpact(connectedGrid, platform);
  console.log(`Platform ${index + 1}: (${platform.x},${platform.y}) size ${platform.width}x${platform.height || 1}, visual impact: ${visualImpact.toFixed(3)}`);
});

console.log(`\nPlatform Summary:`);
console.log(`- Total platforms placed: ${platforms.length}`);
console.log(`- Average platform size: ${platforms.length > 0 ? (platforms.reduce((sum, p) => sum + p.width * (p.height || 1), 0) / platforms.length).toFixed(1) : 0} tiles`);
console.log(`- Average visual impact: ${platforms.length > 0 ? (platforms.reduce((sum, p) => sum + platformPlacer.assessVisualImpact(connectedGrid, p), 0) / platforms.length).toFixed(3) : 0}`);

// === Platform Placement Analysis ===
// const groupedAreas = platformPlacer.groupUnreachableAreas(platformPlacer.identifyUnreachableAreas(connectedGrid, playerPos));
// console.log('Grouped unreachable areas:', groupedAreas.length);

console.log('\n=== Demo Complete ==='); 
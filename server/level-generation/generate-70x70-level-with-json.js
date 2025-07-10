#!/usr/bin/env node

// Script: generate-70x70-level-with-json.js
// Description: Runs the full cave generation pipeline and exports the result as test-cave.json

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
const EnemyPlacementAnalyzer = require('./src/placement/EnemyPlacementAnalyzer');
const StrategicEnemyPlacer = require('./src/placement/StrategicEnemyPlacer');
const LevelJSONExporter = require('./src/export/LevelJSONExporter');
const fs = require('fs');

const width = 200;
const height = 40;
const seed = new Date().toISOString();
console.log(`seed: ${seed}`);
const rng = new RandomGenerator(seed);

console.log('=== Time Oddity Cave Generation with JSON Export ===\n');

try {
  // 1. Seed the grid
  const seeder = new GridSeeder();
  const seedConfig = { width, height, initialWallRatio: 0.42 };
  const seededGrid = seeder.seedGrid(seedConfig, rng);

  // 2. Run cellular automata
  const ca = new CellularAutomata();
  const caConfig = { simulationSteps: 5, birthThreshold: 5, survivalThreshold: 4 };
  const caGrid = ca.simulate(seededGrid, caConfig);

  // 3. Region detection
  const { labelGrid, regionData } = RegionDetector.detectRegions(caGrid);

  // 4. Corridor carving
  const corridorRng = new RandomGenerator('corridor-seed');
  const connectedGrid = CorridorCarver.carveCorridors(caGrid, labelGrid, regionData, corridorRng);
  

  // 5. Player spawn placement with left-side constraint
  const spawnPlacer = new PlayerSpawnPlacer({ 
    maxAttempts: 100, 
    safetyRadius: 2,
    leftSideBoundary: 0.25 // Player spawn in left 25% of map
  });
  const spawnResult = spawnPlacer.placeSpawn(connectedGrid, rng);
  let playerPos = null;
  if (spawnResult.success) {
    playerPos = spawnResult.position;
    console.log(`✅ Player spawn placed at (${playerPos.x}, ${playerPos.y})`);
    
    // Log constraint validation
    const leftSideBoundaryX = Math.floor(width * 0.25);
    if (playerPos.x < leftSideBoundaryX) {
      console.log(`✅ Spawn constraint validated: position in left ${Math.round(0.25 * 100)}% of map`);
    } else if (spawnResult.fallbackUsed) {
      console.log(`⚠️  Spawn constraint fallback used: ${spawnResult.warning}`);
    }
  } else {
    throw new Error(`Failed to place player spawn: ${spawnResult.error}`);
  }

  // 6. Goal placement (moved after platform placement)
  const goalPlacer = new GoalPlacer();
  let goalPos = null;

  // 7. Platform placement (before goal placement)
  const platformPlacer = new StrategicPlatformPlacer({
    targetReachability: 0.85,
    floatingPlatformProbability: 1.0,
    movingPlatformProbability: 0.0,
    minPlatformSize: 1,
    maxPlatformSize: 6
  });
  const platformRng = new RandomGenerator('platform-seed');
  const platforms = platformPlacer.placePlatforms(connectedGrid, playerPos, () => platformRng.random());
  console.log(`✅ Placed ${platforms.length} platforms`);

  // 8. Goal placement after platforms
  if (playerPos) {
    try {
      const rightGoalPlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      goalPos = rightGoalPlacer.placeGoalAfterPlatforms(connectedGrid, playerPos, 10, () => rng.random());
      console.log(`✅ Goal placed at (${goalPos.x}, ${goalPos.y}) [after platforms, right-side constraint]`);
    } catch (e) {
      throw new Error(`Failed to place goal after platforms: ${e.message}`);
    }
  }

  // 9. Coin placement
  const ReachableCoinPlacer = require('./src/placement/ReachableCoinPlacer');
  const coinPlacer = new ReachableCoinPlacer({
    coinCount: 100,
    deadEndWeight: 0.6,
    explorationWeight: 0.3,
    unreachableWeight: 0.1,
    minDistance: 1
  });
  const coinRng = new RandomGenerator('coin-seed');
  const coins = coinPlacer.placeCoins(connectedGrid, playerPos, platforms, () => coinRng.random());
  console.log(`✅ Placed ${coins.length} coins (reachable only)`);

  // 10. Enemy placement
  const enemyPlacer = new StrategicEnemyPlacer({
    maxEnemies: 100,
    enemyDensity: 0.05,
    minDistanceFromSpawn: 8,
    minDistanceFromGoal: 5,
    preserveSolvability: true
  });
  const enemyRng = new RandomGenerator('enemy-seed');
  const enemies = enemyPlacer.placeEnemies(connectedGrid, playerPos, coins, goalPos, platforms, () => enemyRng.random());

  // 11. Assemble level data for export
  const levelData = {
    grid: connectedGrid,
    startPos: playerPos,
    goalPos: goalPos,
    coins: coins,
    enemies: enemies,
    platforms: platforms,
    config: { width, height, seed }
  };

  // 12. Export to JSON
  const exportedLevel = LevelJSONExporter.exportLevel(levelData);
  const outputPath = './test-cave.json';
  fs.writeFileSync(outputPath, JSON.stringify(exportedLevel, null, 2));
  console.log(`\nLevel successfully exported to ${outputPath}`);
} catch (err) {
  console.error('Error during level generation or export:', err);
  process.exit(1);
} 
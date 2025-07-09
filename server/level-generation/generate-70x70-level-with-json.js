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
  const seedConfig = { width, height, initialWallRatio: 0.45 };
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
  

  // 5. Player spawn placement
  const spawnPlacer = new PlayerSpawnPlacer({ maxAttempts: 100, safetyRadius: 2 });
  const spawnResult = spawnPlacer.placeSpawn(connectedGrid, rng);
  let playerPos = null;
  if (spawnResult.success) {
    playerPos = spawnResult.position;
    console.log(`✅ Player spawn placed at (${playerPos.x}, ${playerPos.y})`);
  } else {
    throw new Error(`Failed to place player spawn: ${spawnResult.error}`);
  }

  // 6. Goal placement (moved after platform placement)
  const goalPlacer = new GoalPlacer();
  let goalPos = null;

  // 7. Platform placement (before goal placement)
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

  // 8. Goal placement after platforms
  if (playerPos) {
    try {
      goalPos = goalPlacer.placeGoalAfterPlatforms(connectedGrid, playerPos, 10, () => rng.random());
      console.log(`✅ Goal placed at (${goalPos.x}, ${goalPos.y}) [after platforms]`);
    } catch (e) {
      throw new Error(`Failed to place goal after platforms: ${e.message}`);
    }
  }

  // 9. Coin placement
  const ReachableCoinPlacer = require('./src/placement/ReachableCoinPlacer');
  const coinPlacer = new ReachableCoinPlacer({
    coinCount: 100,
    deadEndWeight: 0.4,
    explorationWeight: 0.3,
    unreachableWeight: 0.3,
    minDistance: 3
  });
  const coinRng = new RandomGenerator('coin-seed');
  const coins = coinPlacer.placeCoins(connectedGrid, playerPos, platforms, () => coinRng.random());
  console.log(`✅ Placed ${coins.length} coins (reachable only)`);

  // 10. Assemble level data for export
  const levelData = {
    grid: connectedGrid,
    startPos: playerPos,
    goalPos: goalPos,
    coins: coins,
    enemies: [], // Add enemy placement if available
    platforms: platforms,
    config: { width, height, seed }
  };

  // 11. Export to JSON
  const exportedLevel = LevelJSONExporter.exportLevel(levelData);
  const outputPath = './test-cave.json';
  fs.writeFileSync(outputPath, JSON.stringify(exportedLevel, null, 2));
  console.log(`\nLevel successfully exported to ${outputPath}`);
} catch (err) {
  console.error('Error during level generation or export:', err);
  process.exit(1);
} 
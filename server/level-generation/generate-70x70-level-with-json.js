#!/usr/bin/env node

// Script: generate-70x70-level-with-json.js
// Description: Runs the full cave generation pipeline and exports the result as test-cave.json

const { GraphGridSeeder } = require('./src/generation/GraphGridSeeder');
const GridSeeder = require('./src/generation/GridSeeder');
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
const { toAsciiArt } = require('./src/core/VisualizationUtils');
const ndarray = require('ndarray');
const DiagonalCorridorDetector = require('./src/analysis/DiagonalCorridorDetector');

const width = 80;
const height = 20;
const seed = new Date().toISOString();
// const seed = '2025-07-14T02:56:59.786Z'; //new Date().toISOString();
console.log(`seed: ${seed}`);
const rng = new RandomGenerator(seed);

/**
 * Gets all tiles around the player position and all main points within a specified window
 * 
 * @param {Object} playerPos - Player position {x, y}
 * @param {Array<Object>} mainPoints - Array of main points [{x, y}, ...]
 * @param {ndarray} grid - The grid to check bounds against
 * @param {number} windowSize - Size of the window around each point (default: 5)
 * @returns {Array<Object>} Array of forbidden tile positions {x, y}
 */
function getForbiddenTiles(playerPos, mainPoints = [], grid, windowSize = 5) {
  const forbiddenTiles = [];
  const [width, height] = grid.shape;
  
  // Helper function to add tiles around a point
  const addTilesAroundPoint = (point) => {
    for (let dx = -windowSize; dx <= windowSize; dx++) {
      for (let dy = -windowSize; dy <= windowSize; dy++) {
        const fx = point.x + dx;
        const fy = point.y + dy;
        // Check bounds
        if (fx >= 0 && fx < width && fy >= 0 && fy < height) {
          forbiddenTiles.push({ x: fx, y: fy });
        }
      }
    }
  };
  
  // Add tiles around player position
  if (playerPos) {
    addTilesAroundPoint(playerPos);
  }
  
  // Add tiles around all main points
  for (const mainPoint of mainPoints) {
    addTilesAroundPoint(mainPoint);
  }
  
  return forbiddenTiles;
}

console.log('=== Time Oddity Cave Generation with JSON Export ===\n');

try {
  // 1. Seed the grid
  const seedConfig = { width, height, initialWallRatio: 0.42 };
  // const seeder = new GridSeeder(seedConfig);
  const seeder = new GraphGridSeeder(8, 0.7, 0.5);
  const seededGrid = seeder.seedGrid(seedConfig, rng);

  // 2. Run cellular automata
  const ca = new CellularAutomata();
  const caConfig = { simulationSteps: 5, birthThreshold: 5, survivalThreshold: 4 };
  const caGrid = ca.simulate(seededGrid, caConfig);

  // Mark all edge tiles as wall in caGrid
  for (let x = 0; x < caGrid.shape[0]; x++) {
    for (let y = 0; y < caGrid.shape[1]; y++) {
      if (x === 0 || y === 0 || x === caGrid.shape[0] - 1 || y === caGrid.shape[1] - 1) {
        caGrid.set(x, y, 1);
      }
    }
  }

  console.log('After cellular automata');
  console.log(seeder.toAsciiArt(caGrid));

  // 3. Region detection
  const { labelGrid, regionData } = RegionDetector.detectRegions(caGrid);

  
  // 4. Corridor carving
  const corridorRng = new RandomGenerator('corridor-seed');
  const connectedGrid = CorridorCarver.carveCorridors(caGrid, labelGrid, regionData, corridorRng);


  // Make sure main points are not walls
  let radius = 4;
  for (const mainPoint of seeder.mainPoints) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const fx = mainPoint.x + dx;
        const fy = mainPoint.y + dy;
        // check it is in the circle of radius 5 around the main point
        if(Math.sqrt(dx * dx + dy * dy) > radius) {
          continue;
        }
        if (fx >= 0 && fx < connectedGrid.shape[0] && fy >= 0 && fy < connectedGrid.shape[1]) {
          connectedGrid.set(fx, fy, 0);
        }
      }
    }
  }

  // No 1 tile corridors (not vertical or horizontal)
  let changed = true;
  let iterations = 0;
  while (changed) {
    iterations++;
    console.log(`Iteration ${iterations}`);
    changed = false;
    for (let x = 0; x < connectedGrid.shape[0]; x++) {
      for (let y = 0; y < connectedGrid.shape[1]; y++) {
        if (connectedGrid.get(x, y) === 1) {
          continue;
        }
        // condition for a 1 tile horizontal corridor: 
        // - up: y >= 1 and it is wall, or y = 0 which is the top of the map
        // - down: y < height - 1 and it is wall, or y = height - 1 which is the bottom of the map
        let up_blocked = (y >= 1 && connectedGrid.get(x, y - 1) === 1) || (y === 0);
        let down_blocked = (y < connectedGrid.shape[1] - 1 && connectedGrid.get(x, y + 1) === 1) || (y === connectedGrid.shape[1] - 1);
        if (up_blocked && down_blocked) {
          let otherY = y == 0? 1 : y - 1;
          connectedGrid.set(x, otherY, 0);
          changed = true;
        }
        // same thing for vertical corridors
        let left_blocked = (x >= 1 && connectedGrid.get(x - 1, y) === 1) || (x === 0);
        let right_blocked = (x < connectedGrid.shape[0] - 1 && connectedGrid.get(x + 1, y) === 1) || (x === connectedGrid.shape[0] - 1);
        if (left_blocked && right_blocked){
          let otherX = x == 0? 1 : x - 1;
          connectedGrid.set(otherX, y, 0);
          changed = true;
        }
        // same thing for diagonally blocked corridors
        // in that case mark the diagonally blocked tiles as floor. 
        // Must consider all cases: up and down_left, up and down_right, down and up_left, down and up_right, up_left and down_right, up_right and down_left
      }
    }
  }

  // Fix impassable diagonal corridors
  const diagResult = DiagonalCorridorDetector.fixDiagonalCorridors(connectedGrid);
  console.log(`Diagonal corridor fixes: issues found = ${diagResult.issuesFound}, fixes applied = ${diagResult.fixesApplied}`);

  // ASCII Art Rendering of the grid after corridor carving
  console.log('After corridor carving');
  console.log(seeder.toAsciiArt(connectedGrid))
  

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

  // ASCII Art Rendering of the grid after player spawn placement
  console.log('After player spawn placement');
  console.log(seeder.toAsciiArt(connectedGrid, { player: playerPos }));

  // Debug: print tile value at playerPos
  if (playerPos) {
    console.log(`DEBUG: Tile value at playerPos (${playerPos.x}, ${playerPos.y}) is`, connectedGrid.get(playerPos.x, playerPos.y));
  }

  // 7. Platform placement (before goal placement)
  const platformPlacer = new StrategicPlatformPlacer({
    targetReachability: 0.7,
    floatingPlatformProbability: 1.0,
    movingPlatformProbability: 0.0,
    minPlatformSize: 1,
    maxPlatformSize: 5,
    maxIterations: 1000
  });
  const platformRng = new RandomGenerator('platform-seed');
  
  // Create forbiddenTiles: all tiles around player position and main points
  let forbiddenTiles = getForbiddenTiles(playerPos, seeder.mainPoints || [], connectedGrid, 5);

  // Place platforms from player position
  console.log(`🔍 Placing platforms from player position...`);
  let platforms = platformPlacer.placePlatforms(
    connectedGrid, playerPos, () => platformRng.random(), forbiddenTiles
  );
  console.log(`✅ Placed ${platforms.length} platforms from player position`);

  // ASCII Art Rendering of the grid after platform placement
  console.log('After 1st platform placement');
  console.log(seeder.toAsciiArt(connectedGrid, { platforms: platforms, player: playerPos }));
  console.log('playerPos: ', playerPos);
  
  // Place additional platforms from each main point stored in seeder.mainPoints
  if (seeder.mainPoints && seeder.mainPoints.length > 0) {
    console.log(`🔍 Placing additional platforms from ${seeder.mainPoints.length} main points...`);
    
    for (let i = 0; i < seeder.mainPoints.length; i++) {
      const mainPoint = seeder.mainPoints[i];
      console.log(`📍 Placing platforms from main point ${i + 1}/${seeder.mainPoints.length} at (${mainPoint.x}, ${mainPoint.y})`);
      
      // Place platforms from this main point
      const additionalPlatforms = platformPlacer.placePlatforms(
        connectedGrid, mainPoint, () => platformRng.random(), forbiddenTiles
      );
      
      if (additionalPlatforms.length > 0) {
        platforms = platforms.concat(additionalPlatforms);
        console.log(`✅ Added ${additionalPlatforms.length} platforms from main point ${i + 1}`);

        // ASCII Art Rendering of the grid after additional platform placement
        console.log('After additional platform placement');
        console.log(toAsciiArt(connectedGrid, { platforms: platforms, player: playerPos }));
      } else {
        console.log(`ℹ️  No additional platforms placed from main point ${i + 1}`);
      }
    }
  }
  
  console.log(`✅ Total platforms placed: ${platforms.length}`);

  // Create a copy of connectedGrid and mark all platforms as walls
  const copyGrid = (grid) => {
    const [width, height] = grid.shape;
    // Use native Uint8Array
    const copy = ndarray(new Uint8Array(width * height), [width, height]);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        copy.set(x, y, grid.get(x, y));
      }
    }
    return copy;
  };

  const markPlatformAsWalls = (grid, platform) => {
    const occupiedTiles = platform.getOccupiedTiles();
    
    for (const tile of occupiedTiles) {
      if (tile.x >= 0 && tile.x < grid.shape[0] && 
          tile.y >= 0 && tile.y < grid.shape[1]) {
        grid.set(tile.x, tile.y, 1); // Mark as wall
      }
    }
  };

  // Create a copy of the grid with all platforms marked as walls
  let gridWithPlatforms = copyGrid(connectedGrid);
  for (const platform of platforms) {
    markPlatformAsWalls(gridWithPlatforms, platform);
  }
  
  
  // 8. Goal placement after platforms
  if (playerPos) {
    try {
      const rightGoalPlacer = new GoalPlacer({ rightSideBoundary: 0.75 });
      goalPos = rightGoalPlacer.placeGoalAfterPlatforms(gridWithPlatforms, playerPos, 10, () => rng.random());

      // ASCII Art Rendering of the grid after goal placement
      console.log('After goal placement');
      console.log(toAsciiArt(connectedGrid, { goal: goalPos, player: playerPos , platforms: platforms}));

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

  console.log('After coin placement, before platform placement');
  console.log(seeder.toAsciiArt(connectedGrid, { coins: coins, player: playerPos , platforms: platforms, goal: goalPos}));

  // update forbidden tiles to include coins
  for (let i = 0; i < coins.length; i++) {
    forbiddenTiles = forbiddenTiles.concat(getForbiddenTiles(coins[i], [], connectedGrid, 3));
  }

  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i];
    console.log(`📍 Placing platforms from coin ${i + 1}/${seeder.mainPoints.length} at (${coin.x}, ${coin.y})`);
    
    // Place platforms from this main point
    const additionalPlatforms = platformPlacer.placePlatforms(
      connectedGrid, coin, () => platformRng.random(), forbiddenTiles
    );
    
    if (additionalPlatforms.length > 0) {
      platforms = platforms.concat(additionalPlatforms);
      console.log(`✅ Added ${additionalPlatforms.length} platforms from coin point ${i + 1}`);

      // ASCII Art Rendering of the grid after additional platform placement
      console.log('After additional platform placement');
      console.log(toAsciiArt(connectedGrid, { platforms: platforms, player: playerPos, coins: coins}));
    } else {
      console.log(`ℹ️  No additional platforms placed from coin ${i + 1}`);
    }
  }
  // ASCII Art Rendering of the grid after coin placement
  console.log('After coin placement');
  console.log(seeder.toAsciiArt(connectedGrid, { coins: coins, player: playerPos , platforms: platforms, goal: goalPos}));

  console.log(`✅ Placed ${coins.length} coins (reachable only)`);

  // 10. Enemy placement
  const enemyPlacer = new StrategicEnemyPlacer({
    maxEnemies: 40,
    enemyDensity: 0.05,
    minDistanceFromSpawn: 8,
    minDistanceFromGoal: 5,
    preserveSolvability: true
  });
  const enemyRng = new RandomGenerator('enemy-seed');
  const enemies = enemyPlacer.placeEnemies(connectedGrid, playerPos, coins, goalPos, platforms, () => enemyRng.random());

  // ASCII Art Rendering of the grid after enemy placement
  console.log('After enemy placement');
  console.log(toAsciiArt(connectedGrid, { enemies: enemies, player: playerPos , platforms: platforms, goal: goalPos, coins: coins}));

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
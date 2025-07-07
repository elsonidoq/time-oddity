const { GridSeeder } = require('./src/generation/GridSeeder');
const { CellularAutomata } = require('./src/generation/CellularAutomata');
const CorridorCarver = require('./src/analysis/CorridorCarver');
const RegionDetector = require('./src/analysis/RegionDetector');
const RandomGenerator = require('./src/core/RandomGenerator');
const GridUtilities = require('./src/core/GridUtilities');
const PlayerSpawnPlacer = require('./src/placement/PlayerSpawnPlacer');

const width = 60;
const height = 60;
const rng = new RandomGenerator(new Date().toISOString());

console.log('=== Time Oddity Cave Generation Demo ===');
console.log('Demonstrating CG-04.2: Player Spawn Placement with Safety Validation\n');

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

if (spawnResult.success) {
  console.log(`✅ Player spawn placed successfully at (${spawnResult.position.x}, ${spawnResult.position.y})`);
  
  // Create a visualization with the spawn point marked
  const spawnGrid = GridUtilities.copyGrid(connectedGrid);
  GridUtilities.setSafe(spawnGrid, spawnResult.position.x, spawnResult.position.y, 2); // Mark spawn with value 2
  
  console.log('\nFinal cave with player spawn (P = spawn point):');
  console.log('Legend: . = floor, # = wall, P = player spawn');
  
  // Convert to ASCII art with spawn point
  let ascii = '';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = spawnGrid.get(x, y);
      if (value === 0) {
        ascii += '.';
      } else if (value === 1) {
        ascii += '#';
      } else if (value === 2) {
        ascii += 'P';
      }
    }
    ascii += '\n';
  }
  console.log(ascii);
  
  // Show spawn statistics
  const stats = spawnPlacer.getSpawnStatistics(connectedGrid);
  console.log('\nSpawn Statistics:');
  console.log(`- Total wall positions: ${stats.totalPositions}`);
  console.log(`- Valid spawn positions: ${stats.validPositions}`);
  console.log(`- Validity ratio: ${(stats.validityRatio * 100).toFixed(1)}%`);
  
  // Validate the spawn position
  const isValid = spawnPlacer.isValidSpawnPosition(connectedGrid, spawnResult.position.x, spawnResult.position.y);
  const hasSafeZone = spawnPlacer.hasSafeLandingZone(connectedGrid, spawnResult.position.x, spawnResult.position.y, 2);
  const isWall = spawnPlacer.isWallTile(connectedGrid, spawnResult.position.x, spawnResult.position.y);
  
  console.log('\nSpawn Validation:');
  console.log(`- Is wall tile: ${isWall ? '✅' : '❌'}`);
  console.log(`- Has safe landing zone: ${hasSafeZone ? '✅' : '❌'}`);
  console.log(`- Valid spawn position: ${isValid ? '✅' : '❌'}`);
  
} else {
  console.log(`❌ Failed to place player spawn: ${spawnResult.error}`);
}

// 6. Connectivity validation
console.log('\nStep 6: Validating connectivity...');
const isConnected = CorridorCarver.validateConnection(connectedGrid, labelGrid, regionData);
console.log(`Cave connectivity: ${isConnected ? '✅ Connected' : '❌ Disconnected'}`);

// 7. Final statistics
console.log('\n=== Final Statistics ===');
const floorTiles = Array.from(connectedGrid.data).filter(v => v === 0).length;
const wallTiles = Array.from(connectedGrid.data).filter(v => v === 1).length;
const totalTiles = width * height;

console.log(`Grid size: ${width}x${height} (${totalTiles} total tiles)`);
console.log(`Floor tiles: ${floorTiles} (${(floorTiles/totalTiles*100).toFixed(1)}%)`);
console.log(`Wall tiles: ${wallTiles} (${(wallTiles/totalTiles*100).toFixed(1)}%)`);
console.log(`Regions: ${Object.keys(regionData).length}`);
console.log(`Connectivity: ${isConnected ? 'Connected' : 'Disconnected'}`);

if (spawnResult.success) {
  console.log(`Player spawn: (${spawnResult.position.x}, ${spawnResult.position.y})`);
  console.log(`Spawn validity: ${spawnPlacer.isValidSpawnPosition(connectedGrid, spawnResult.position.x, spawnResult.position.y) ? 'Valid' : 'Invalid'}`);
}

console.log('\n=== Demo Complete ===');
console.log('CG-04.2 Player Spawn Placement with Safety Validation: ✅ IMPLEMENTED'); 
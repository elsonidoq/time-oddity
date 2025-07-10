const ndarray = require('ndarray');
const CoinDistributor = require('./src/placement/CoinDistributor');
const RandomGenerator = require('./src/core/RandomGenerator');

// Create the same sparse grid as the test
const sparseData = new Uint8Array(100);
// Fill with walls first
for (let i = 0; i < 100; i++) {
  sparseData[i] = 1; // wall
}
sparseData[55] = 0; // Only one floor tile at position 55 (x=5, y=5)
const sparseGrid = ndarray(sparseData, [10, 10]);
const playerPos = { x: 5, y: 5 };
const rng = new RandomGenerator('test-seed');
const distributor = new CoinDistributor({ coinCount: 5 });

console.log('Sparse grid contents:');
for (let y = 0; y < 10; y++) {
  let row = '';
  for (let x = 0; x < 10; x++) {
    row += sparseGrid.get(x, y) === 0 ? '.' : '#';
  }
  console.log(row);
}

console.log('Position (5,5):', sparseGrid.get(5, 5));

// Test each component
const deadEnds = distributor.detectDeadEnds(sparseGrid);
const explorationAnalysis = distributor.analyzeExplorationAreas(sparseGrid);
const unreachableAreas = distributor.identifyUnreachableAreas(sparseGrid, playerPos);

console.log('Dead-ends:', deadEnds.length);
console.log('Exploration areas:', explorationAnalysis.explorationAreas.length);
console.log('Unreachable areas:', unreachableAreas.length);

// Count total floor tiles
let totalFloorTiles = 0;
for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 10; x++) {
    if (sparseGrid.get(x, y) === 0) {
      totalFloorTiles++;
    }
  }
}
console.log('Total floor tiles:', totalFloorTiles);

// Test distribution
const coins = distributor.distributeCoins(sparseGrid, playerPos, rng);
console.log('Coins placed:', coins.length);
console.log('Coins:', JSON.stringify(coins)); 
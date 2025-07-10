const PhysicsAwareReachabilityAnalyzer = require('./src/analysis/PhysicsAwareReachabilityAnalyzer');
const ndarray = require('ndarray');

// Create a simple test grid
const width = 10, height = 5;
const data = new Uint8Array(width * height);
// Fill with walls first
for (let i = 0; i < width * height; i++) {
  data[i] = 1; // wall
}
// Create a simple corridor
for (let x = 1; x < 9; x++) {
  data[x + 2 * width] = 0; // floor at y=2
}
// Add some platforms
data[3 + 1 * width] = 0; // platform at (3,1)
data[6 + 1 * width] = 0; // platform at (6,1)

const grid = ndarray(data, [width, height]);
const analyzer = new PhysicsAwareReachabilityAnalyzer();

// Print the values of the corridor row to debug
console.log('Corridor row values (y=2):', Array.from({length: width}, (_, x) => grid.get(x, 2)));

// Find the first floor tile in y=2
let playerPos = { x: 1, y: 2 };
for (let x = 1; x < 9; x++) {
  if (grid.get(x, 2) === 0) {
    playerPos = { x, y: 2 };
    break;
  }
}

console.log('Grid:');
for (let y = 0; y < height; y++) {
  let row = '';
  for (let x = 0; x < width; x++) {
    if (x === playerPos.x && y === playerPos.y) {
      row += 'P'; // Player
    } else {
      row += grid.get(x, y) === 0 ? '.' : '#';
    }
  }
  console.log(row);
}

console.log(`Player position (${playerPos.x}, ${playerPos.y}) value: ${grid.get(playerPos.x, playerPos.y)}`);

console.log('\nTesting with maxMoves = 2:');
const limitedPositions = analyzer.detectReachablePositionsFromStartingPoint(grid, playerPos, 2);
console.log(`Found ${limitedPositions.length} positions with 2 moves:`);
limitedPositions.forEach(pos => console.log(`  (${pos.x}, ${pos.y})`));

console.log('\nTesting with maxMoves = null (unlimited):');
const unlimitedPositions = analyzer.detectReachablePositionsFromStartingPoint(grid, playerPos, null);
console.log(`Found ${unlimitedPositions.length} positions with unlimited moves:`);
unlimitedPositions.forEach(pos => console.log(`  (${pos.x}, ${pos.y})`));

console.log('\nVerification:');
console.log(`Limited moves (2): ${limitedPositions.length} positions`);
console.log(`Unlimited moves: ${unlimitedPositions.length} positions`);
console.log(`Unlimited should be >= limited: ${unlimitedPositions.length >= limitedPositions.length}`); 
const ndarray = require('ndarray');
const CoinDistributor = require('./src/placement/CoinDistributor');

// Create the same grid as the test
const deadEndData = new Uint8Array(100);
// Fill with walls first
for (let i = 0; i < 100; i++) {
  deadEndData[i] = 1; // wall
}
// Main corridor
for (let i = 0; i < 10; i++) {
  deadEndData[i * 10 + 5] = 0; // floor
}
// Dead-end branch (only one connection to main corridor)
deadEndData[5 * 10 + 6] = 0; // floor
deadEndData[5 * 10 + 7] = 0; // floor
deadEndData[5 * 10 + 8] = 0; // floor

const deadEndGrid = ndarray(deadEndData, [10, 10]).transpose(1, 0);

console.log('Grid shape:', deadEndGrid.shape);

// Print the grid
console.log('Grid contents:');
for (let y = 0; y < 10; y++) {
  let row = '';
  for (let x = 0; x < 10; x++) {
    row += deadEndGrid.get(x, y) === 0 ? '.' : '#';
  }
  console.log(row);
}

// Test dead-end detection
const distributor = new CoinDistributor();
const deadEnds = distributor.detectDeadEnds(deadEndGrid);

console.log('Dead-ends found:', JSON.stringify(deadEnds));

// Check specific positions
console.log('Position (0,5):', deadEndGrid.get(0, 5));
console.log('Position (9,5):', deadEndGrid.get(9, 5));
console.log('Position (8,5):', deadEndGrid.get(8, 5));
console.log('Position (6,5):', deadEndGrid.get(6, 5));
console.log('Position (7,5):', deadEndGrid.get(7, 5));

// Check if specific positions are dead-ends
console.log('Is (0,5) dead-end?', distributor.isDeadEnd(deadEndGrid, 0, 5));
console.log('Is (9,5) dead-end?', distributor.isDeadEnd(deadEndGrid, 9, 5));
console.log('Is (8,5) dead-end?', distributor.isDeadEnd(deadEndGrid, 8, 5));
console.log('Is (6,5) dead-end?', distributor.isDeadEnd(deadEndGrid, 6, 5));
console.log('Is (7,5) dead-end?', distributor.isDeadEnd(deadEndGrid, 7, 5)); 
const ndarray = require('ndarray');
const CoinDistributor = require('./src/placement/CoinDistributor');

// Create the same test grid as in the test
const deadEndData = new Uint8Array(100);
// Fill with walls first
for (let i = 0; i < 100; i++) {
  deadEndData[i] = 1; // wall
}
// Main corridor
for (let i = 0; i < 10; i++) {
  deadEndData[i * 10 + 5] = 0; // floor
}
console.log('(9,5) after main corridor:', deadEndData[5 * 10 + 9]);
// Dead-end branch (only one connection to main corridor)
deadEndData[5 * 10 + 6] = 0; // floor
deadEndData[5 * 10 + 7] = 0; // floor
deadEndData[5 * 10 + 8] = 0; // floor
// Set (9,5) to wall so (8,5) is a dead-end
// (must be after main corridor loop)
deadEndData[5 * 10 + 9] = 1; // wall
console.log('deadEndData[59] after set:', deadEndData[59]);
console.log('(9,5) value after set:', deadEndData[5 * 10 + 9]);

const deadEndGrid = ndarray(deadEndData, [10, 10]).transpose(1, 0);

// Print the grid
console.log('Grid layout:');
for (let y = 0; y < 10; y++) {
  let row = '';
  for (let x = 0; x < 10; x++) {
    row += deadEndGrid.get(x, y) === 0 ? '.' : '#';
  }
  console.log(row);
}

console.log('(8,5) value:', deadEndGrid.get(8,5));
console.log('(9,5) value:', deadEndGrid.get(9,5));

// Print row 5 from data array
let dataRow5 = '';
for (let x = 0; x < 10; x++) {
  dataRow5 += deadEndData[5 * 10 + x];
}
console.log('Row 5 from data array:', dataRow5);
// Print row 5 from grid
let gridRow5 = '';
for (let x = 0; x < 10; x++) {
  gridRow5 += deadEndGrid.get(x, 5);
}
console.log('Row 5 from grid:', gridRow5);

const distributor = new CoinDistributor();
const deadEnds = distributor.detectDeadEnds(deadEndGrid);

console.log('Dead-ends found:', JSON.stringify(deadEnds));
console.log('Expected position (8,5) found:', deadEnds.some(pos => pos.x === 8 && pos.y === 5));

// Debug: print floor neighbors for (8,5)
const isDeadEnd = distributor.isDeadEnd(deadEndGrid, 8, 5);
console.log('isDeadEnd(8,5):', isDeadEnd);
// Print neighbor values
const neighbors = [
  { dx: 0, dy: -1 }, // N
  { dx: -1, dy: 0 }, // W
  { dx: 1, dy: 0 },  // E
  { dx: 0, dy: 1 }   // S
];
for (const dir of neighbors) {
  const nx = 8 + dir.dx;
  const ny = 5 + dir.dy;
  if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
    console.log(`Neighbor (${nx},${ny}):`, deadEndGrid.get(nx, ny));
  }
} 
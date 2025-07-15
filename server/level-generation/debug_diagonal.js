const ndarray = require('ndarray');
const DiagonalCorridorDetector = require('./src/analysis/DiagonalCorridorDetector');

// User's example grid - create a true impassable diagonal corridor
// <2,2> and <1,3> are floor tiles, <1,2> and <2,3> are walls
const data = new Uint8Array([
  1, 1, 0, 0, 0, 0,  // Row 0: ##....
  0, 0, 1, 1, 1, 1,  // Row 1: ..####
  0, 1, 0, 0, 0, 0,  // Row 2: .#.... (x=1,y=2 is wall, x=2,y=2 is floor)
  0, 0, 1, 1, 1, 1   // Row 3: ..#### (x=1,y=3 is floor, x=2,y=3 is wall)
]);
// Correction: set <2,2> (x=2,y=2) to 0, <1,3> (x=1,y=3) to 0, <1,2> (x=1,y=2) to 1, <2,3> (x=2,y=3) to 1
const grid = ndarray(data, [6, 4]);
grid.set(2,2,0); // <2,2> floor
grid.set(1,3,0); // <1,3> floor
grid.set(1,2,1); // <1,2> wall
grid.set(2,3,1); // <2,3> wall

// Print the grid as ASCII art with coordinates
console.log('Grid:');
for (let y = 0; y < 4; y++) {
  let row = '';
  for (let x = 0; x < 6; x++) {
    row += grid.get(x, y) === 1 ? '#' : '.';
  }
  console.log(row + '  // y=' + y);
}
console.log(' 012345');

console.log('\nRelevant positions:');
console.log(`<2,2>: ${grid.get(2,2)}`);
console.log(`<1,3>: ${grid.get(1,3)}`);
console.log(`<1,2>: ${grid.get(1,2)}`);
console.log(`<2,3>: ${grid.get(2,3)}`);

console.log('\nChecking floor tiles:');
for (let x = 0; x < 6; x++) {
  for (let y = 0; y < 4; y++) {
    if (grid.get(x, y) === 0) {
      console.log(`Tile (${x},${y}): floor`);
      const result = DiagonalCorridorDetector.detectDiagonalCorridorAt(grid, x, y);
      console.log(`  Result: ${JSON.stringify(result)}`);
    }
  }
}

console.log('\nAll detected issues:');
const issues = DiagonalCorridorDetector.detectDiagonalCorridors(grid);
for (const issue of issues) {
  console.log(`Issue: ${JSON.stringify(issue)}`);
} 
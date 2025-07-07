const PhysicsAwareReachabilityAnalyzer = require('./src/analysis/PhysicsAwareReachabilityAnalyzer');
const ndarray = require('ndarray');

/**
 * Helper function to create a grid with correct data layout
 */
function createGrid(rows) {
  const height = rows.length;
  const width = rows[0].length;
  const data = new Uint8Array(width * height);
  
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const index = x * height + y; // Column-major order for ndarray
      data[index] = rows[y][x];
    }
  }
  
  return ndarray(data, [width, height]);
}

// Create the grid from the failing test
const grid = createGrid([
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],  // Floor tiles (0) with walls (1) on sides
  [1, 1, 1, 1, 1, 1, 1]
]);

console.log('Grid:');
for (let y = 0; y < 3; y++) {
  let row = '';
  for (let x = 0; x < 7; x++) {
    row += grid.get(x, y) + ' ';
  }
  console.log(`Row ${y}: ${row}`);
}

const analyzer = new PhysicsAwareReachabilityAnalyzer({
  jumpHeight: 800,
  gravity: 980
});

const startPos = { x: 1, y: 1 }; // Left edge position

console.log(`\nStarting position: (${startPos.x}, ${startPos.y}), value: ${grid.get(startPos.x, startPos.y)}`);
console.log(`Position to the left: (${startPos.x - 1}, ${startPos.y}), value: ${grid.get(startPos.x - 1, startPos.y)}`);
console.log(`Position to the right: (${startPos.x + 1}, ${startPos.y}), value: ${grid.get(startPos.x + 1, startPos.y)}`);
console.log(`Position below: (${startPos.x}, ${startPos.y + 1}), value: ${grid.get(startPos.x, startPos.y + 1)}`);

console.log(`\nIs start position on solid ground: ${analyzer._isOnSolidGround(startPos, grid)}`);

// Test with different move limits
console.log('\n=== Testing with maxMoves = 1 ===');
const oneMove = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 1);
console.log('Reachable positions with 1 move:', oneMove);
console.log(`Expected: 2 positions (start + right)`);
console.log(`Actual: ${oneMove.length} positions`);

console.log('\n=== Testing with maxMoves = 2 ===');
const twoMoves = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 2);
console.log('Reachable positions with 2 moves:', twoMoves);
console.log(`Should be greater than ${oneMove.length}:`, twoMoves.length > oneMove.length);

console.log('\n=== Analysis ===');
console.log('From position (1,1):');
console.log('- Left (0,1): wall, should not be reachable');
console.log('- Right (2,1): floor, should be reachable in 1 move'); 
console.log('- (3,1): floor, should be reachable in 2 moves');
console.log('- (4,1): floor, should be reachable in 3 moves');
console.log('- etc.'); 
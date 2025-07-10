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
  [1, 0, 0, 1, 0, 0, 1],  // Gap in the middle (floors are 0, wall is 1)
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

const startPos = { x: 2, y: 1 }; // Left side of gap (on floor tile)
const targetPos = { x: 4, y: 1 }; // Right side of gap

console.log(`\nStarting position: (${startPos.x}, ${startPos.y}), value: ${grid.get(startPos.x, startPos.y)}`);
console.log(`Target position: (${targetPos.x}, ${targetPos.y}), value: ${grid.get(targetPos.x, targetPos.y)}`);
console.log(`Gap position: (3, 1), value: ${grid.get(3, 1)}`);

console.log(`\nIs start position on solid ground: ${analyzer._isOnSolidGround(startPos, grid)}`);
console.log(`Is target position on solid ground: ${analyzer._isOnSolidGround(targetPos, grid)}`);

// Test if the jump is physically possible
const canJump = analyzer.isReachableByJump(startPos, targetPos, grid);
console.log(`\nCan jump from (${startPos.x}, ${startPos.y}) to (${targetPos.x}, ${targetPos.y}): ${canJump}`);

// Test the physics calculations
const dx = Math.abs(targetPos.x - startPos.x);
const dy = targetPos.y - startPos.y;
const tileSize = 64;
const dxPixels = dx * tileSize;
const dyPixels = dy * tileSize;
const maxHorizontalDistance = analyzer.calculateJumpDistance();
const maxJumpHeightPixels = analyzer.jumpHeight * 0.3;

console.log(`\nJump physics:`);
console.log(`- Horizontal distance: ${dx} tiles = ${dxPixels}px`);
console.log(`- Vertical distance: ${dy} tiles = ${dyPixels}px`);
console.log(`- Max horizontal distance: ${maxHorizontalDistance}px`);
console.log(`- Max jump height: ${maxJumpHeightPixels}px`);
console.log(`- Horizontal within limits: ${dxPixels <= maxHorizontalDistance}`);
console.log(`- Vertical within limits: ${dyPixels >= -maxJumpHeightPixels}`);

console.log('\n=== Testing reachable positions ===');
const reachablePositions = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 1);

console.log('Reachable positions:', reachablePositions);
console.log(`Contains target (${targetPos.x}, ${targetPos.y}): ${reachablePositions.some(pos => pos.x === targetPos.x && pos.y === targetPos.y)}`); 
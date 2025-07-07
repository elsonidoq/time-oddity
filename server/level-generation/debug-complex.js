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

// Create the complex grid from the failing test
const grid = createGrid([
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],  // Two platforms
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],  // Lower connected area
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]);

console.log('Complex Grid:');
for (let y = 0; y < 5; y++) {
  let row = '';
  for (let x = 0; x < 10; x++) {
    row += grid.get(x, y) + ' ';
  }
  console.log(`Row ${y}: ${row}`);
}

const analyzer = new PhysicsAwareReachabilityAnalyzer({
  jumpHeight: 800,
  gravity: 980
});

const startPos = { x: 2, y: 1 }; // Left platform
const rightPlatformPos = { x: 7, y: 1 }; // Right platform target
const lowerAreaPos = { x: 7, y: 3 }; // Lower area position

console.log(`\nStarting position: (${startPos.x}, ${startPos.y}), value: ${grid.get(startPos.x, startPos.y)}`);
console.log(`Right platform: (${rightPlatformPos.x}, ${rightPlatformPos.y}), value: ${grid.get(rightPlatformPos.x, rightPlatformPos.y)}`);
console.log(`Lower area: (${lowerAreaPos.x}, ${lowerAreaPos.y}), value: ${grid.get(lowerAreaPos.x, lowerAreaPos.y)}`);

console.log(`\nIs start position on solid ground: ${analyzer._isOnSolidGround(startPos, grid)}`);
console.log(`Is right platform on solid ground: ${analyzer._isOnSolidGround(rightPlatformPos, grid)}`);
console.log(`Is lower area on solid ground: ${analyzer._isOnSolidGround(lowerAreaPos, grid)}`);

// Test if jumps are possible
console.log('\n=== Jump Analysis ===');
const canJumpToRightPlatform = analyzer.isReachableByJump(startPos, rightPlatformPos, grid);
console.log(`Can jump from start (${startPos.x}, ${startPos.y}) to right platform (${rightPlatformPos.x}, ${rightPlatformPos.y}): ${canJumpToRightPlatform}`);

const canJumpFromLowerToRightPlatform = analyzer.isReachableByJump(lowerAreaPos, rightPlatformPos, grid);
console.log(`Can jump from lower area (${lowerAreaPos.x}, ${lowerAreaPos.y}) to right platform (${rightPlatformPos.x}, ${rightPlatformPos.y}): ${canJumpFromLowerToRightPlatform}`);

// Test the max jump distance
const maxJumpDistance = analyzer.calculateJumpDistance();
const tileSize = 64;
const maxJumpTiles = Math.floor(maxJumpDistance / tileSize);
const maxJumpHeightTiles = Math.floor((analyzer.jumpHeight * 0.3) / tileSize);

console.log(`\nJump constraints:`);
console.log(`- Max horizontal distance: ${maxJumpDistance}px = ${maxJumpTiles} tiles`);
console.log(`- Max vertical height: ${analyzer.jumpHeight * 0.3}px = ${maxJumpHeightTiles} tiles`);

const horizontalDistance = Math.abs(rightPlatformPos.x - lowerAreaPos.x);
const verticalDistance = lowerAreaPos.y - rightPlatformPos.y; // Positive means jumping up

console.log(`\nJump from lower area to right platform:`);
console.log(`- Horizontal distance: ${horizontalDistance} tiles`);
console.log(`- Vertical distance: ${verticalDistance} tiles (jumping up)`);
console.log(`- Within horizontal limits: ${horizontalDistance <= maxJumpTiles}`);
console.log(`- Within vertical limits: ${verticalDistance <= maxJumpHeightTiles}`);

console.log('\n=== Testing reachable positions ===');
const reachablePositions = analyzer.detectReachablePositionsFromStartingPoint(grid, startPos, 3);

console.log('Reachable positions:', reachablePositions);
console.log(`\nContains right platform (${rightPlatformPos.x}, ${rightPlatformPos.y}): ${reachablePositions.some(pos => pos.x === rightPlatformPos.x && pos.y === rightPlatformPos.y)}`);
console.log(`Contains lower area (${lowerAreaPos.x}, ${lowerAreaPos.y}): ${reachablePositions.some(pos => pos.x === lowerAreaPos.x && pos.y === lowerAreaPos.y)}`); 
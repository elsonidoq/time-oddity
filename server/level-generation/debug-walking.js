const PhysicsAwareReachabilityAnalyzer = require('./src/analysis/PhysicsAwareReachabilityAnalyzer');
const ndarray = require('ndarray');

console.log('=== Testing ndarray data layout ===');

// Method 1: Original test method
const testData1 = new Uint8Array([
  1, 1, 1, 1, 1,
  1, 0, 0, 0, 1,
  1, 1, 1, 1, 1
]);
const grid1 = ndarray(testData1, [5, 3]);

console.log('\nMethod 1 - Raw array [1,1,1,1,1,1,0,0,0,1,1,1,1,1,1] with shape [5,3]:');
for (let y = 0; y < 3; y++) {
  let row = '';
  for (let x = 0; x < 5; x++) {
    row += grid1.get(x, y) + ' ';
  }
  console.log(`Row ${y}: ${row}`);
}

// Method 2: Different arrangement
const testData2 = new Uint8Array(15);
for (let x = 0; x < 5; x++) {
  for (let y = 0; y < 3; y++) {
    const index = x * 3 + y; // Column-major order
    if (y === 1 && x >= 1 && x <= 3) {
      testData2[index] = 0; // Floor tiles in middle row
    } else {
      testData2[index] = 1; // Wall tiles everywhere else
    }
  }
}
const grid2 = ndarray(testData2, [5, 3]);

console.log('\nMethod 2 - Column-major arrangement with shape [5,3]:');
for (let y = 0; y < 3; y++) {
  let row = '';
  for (let x = 0; x < 5; x++) {
    row += grid2.get(x, y) + ' ';
  }
  console.log(`Row ${y}: ${row}`);
}

// Method 3: Let's try manually setting each position
const grid3 = ndarray(new Uint8Array(15), [5, 3]);
// Fill with walls first
for (let x = 0; x < 5; x++) {
  for (let y = 0; y < 3; y++) {
    grid3.set(x, y, 1);
  }
}
// Then set the floor tiles in the middle row
grid3.set(1, 1, 0);
grid3.set(2, 1, 0);
grid3.set(3, 1, 0);

console.log('\nMethod 3 - Manual setting with .set(x,y,value):');
for (let y = 0; y < 3; y++) {
  let row = '';
  for (let x = 0; x < 5; x++) {
    row += grid3.get(x, y) + ' ';
  }
  console.log(`Row ${y}: ${row}`);
}

console.log('\nTesting with Method 3 grid:');
const analyzer = new PhysicsAwareReachabilityAnalyzer({
  jumpHeight: 800,
  gravity: 980
});

const startPos = { x: 2, y: 1 }; // Center position
console.log(`Starting position: (${startPos.x}, ${startPos.y}), value: ${grid3.get(startPos.x, startPos.y)}`);
console.log(`Position below start: (${startPos.x}, ${startPos.y + 1}), value: ${grid3.get(startPos.x, startPos.y + 1)}`);
console.log(`Is on solid ground: ${analyzer._isOnSolidGround(startPos, grid3)}`);

console.log('\n=== Testing with maxMoves = 1 ===');
const reachablePositions = analyzer.detectReachablePositionsFromStartingPoint(grid3, startPos, 1);

console.log('\nReachable positions:', reachablePositions);
console.log(`Total reachable positions: ${reachablePositions.length}`); 
const FloatingPlatformPlacer = require('./src/placement/FloatingPlatformPlacer');
const PhysicsAwareReachabilityAnalyzer = require('./src/analysis/PhysicsAwareReachabilityAnalyzer');

// Create a simple test grid
const ndarray = require('ndarray');
const testGrid = ndarray(new Uint8Array([
  // 0 = floor, 1 = wall
  // Simple test case: unreachable area at (1,1) that needs a platform
  1, 1, 1, 1, 1,
  1, 0, 0, 0, 1,
  1, 0, 0, 0, 1,
  1, 0, 0, 0, 1,
  1, 1, 1, 1, 1
]), [5, 5]);

console.log('Test Grid:');
for (let y = 0; y < 5; y++) {
  let row = '';
  for (let x = 0; x < 5; x++) {
    row += testGrid.get(x, y) === 1 ? '#' : '.';
  }
  console.log(row);
}

const playerSpawn = { x: 2, y: 2 };

// Test the analyzer
const analyzer = new PhysicsAwareReachabilityAnalyzer();
const reachableTiles = analyzer.detectReachablePositionsFromStartingPoint(testGrid, playerSpawn, null);
console.log('\nReachable tiles:', reachableTiles.length);

// Test unreachable areas
const unreachableAreas = analyzer.detectUnreachableAreas(testGrid);
console.log('Unreachable areas:', unreachableAreas.length);
unreachableAreas.forEach(area => {
  console.log(`  Unreachable: (${area.x}, ${area.y}) - Grid value: ${testGrid.get(area.x, area.y)}`);
});

// Test platform placer
const platformPlacer = new FloatingPlatformPlacer({
  accessibilityValidationEnabled: true
});

console.log('\nTesting platform placement...');
const platforms = platformPlacer.calculateOptimalPlatforms(testGrid, unreachableAreas, playerSpawn);
console.log('Calculated platforms:', platforms.length);

platforms.forEach((platform, index) => {
  console.log(`Platform ${index + 1}: (${platform.x}, ${platform.y}) size ${platform.width}`);
  
  // Test individual platform validation
  const isValid = analyzer.validatePlatformPlacement(testGrid, platform);
  console.log(`  validatePlatformPlacement: ${isValid}`);
  
  // Test accessibility validation
  const accessibilityValid = platformPlacer.validateAccessibility(testGrid, [platform], unreachableAreas);
  console.log(`  validateAccessibility: ${accessibilityValid}`);
});

// Test final placement
const finalPlatforms = platformPlacer.placeFloatingPlatforms(testGrid, unreachableAreas, playerSpawn);
console.log('\nFinal platforms placed:', finalPlatforms.length); 
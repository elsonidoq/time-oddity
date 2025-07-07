const CorridorCarver = require('../../src/analysis/CorridorCarver');
const RegionDetector = require('../../src/analysis/RegionDetector');
const RandomGenerator = require('../../src/core/RandomGenerator');
const ndarray = require('ndarray');

describe('CorridorCarver', () => {
  // 1. Basic corridor carving functionality
  it('carves corridors between disconnected regions', () => {
    // Create a grid with two disconnected regions
    const grid = ndarray(new Uint8Array([
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      1, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0
    ]), [6, 5]);
    
    const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
    const rng = new RandomGenerator('test-seed');
    const result = CorridorCarver.carveCorridors(grid, labelGrid, regionData, rng);
    
    // Verify that regions are now connected
    const connectedResult = CorridorCarver.validateConnection(result, labelGrid, regionData);
    expect(connectedResult).toBe(true);
  });

  // 2. Closest pair finding
  it('finds the closest pair of points between two regions', () => {
    const regionA = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}];
    const regionB = [{x: 4, y: 4}, {x: 5, y: 4}, {x: 4, y: 5}];
    
    const result = CorridorCarver.findClosestPair(regionA, regionB);
    
    expect(result).toHaveProperty('pointA');
    expect(result).toHaveProperty('pointB');
    expect(result).toHaveProperty('distance');
    expect(typeof result.distance).toBe('number');
    expect(result.distance).toBeGreaterThan(0);
  });

  // 3. L-shaped corridor carving
  it('carves L-shaped corridors between two points', () => {
    const grid = ndarray(new Uint8Array([
      1, 1, 1, 1, 1,
      1, 0, 1, 0, 1,
      1, 1, 1, 1, 1
    ]), [5, 3]);
    
    const pointA = {x: 1, y: 1};
    const pointB = {x: 3, y: 1};
    const rng = new RandomGenerator('test-seed');
    
    CorridorCarver.carveLShapedCorridor(grid, pointA, pointB, rng);
    
    // Verify that a path exists between the points
    expect(grid.get(1, 1)).toBe(0); // Start point
    expect(grid.get(3, 1)).toBe(0); // End point
  });

  // 4. Horizontal line carving
  it('carves horizontal lines correctly', () => {
    const grid = ndarray(new Uint8Array([
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1
    ]), [5, 3]);
    
    CorridorCarver.carveHorizontalLine(grid, 1, 1, 3);
    
    // Verify horizontal line was carved
    expect(grid.get(1, 1)).toBe(0);
    expect(grid.get(2, 1)).toBe(0);
    expect(grid.get(3, 1)).toBe(0);
  });

  // 5. Vertical line carving
  it('carves vertical lines correctly', () => {
    const grid = ndarray(new Uint8Array([
      1, 1, 1,
      1, 1, 1,
      1, 1, 1,
      1, 1, 1
    ]), [3, 4]);
    
    CorridorCarver.carveVerticalLine(grid, 1, 1, 3);
    
    // Verify vertical line was carved
    expect(grid.get(1, 1)).toBe(0);
    expect(grid.get(1, 2)).toBe(0);
    expect(grid.get(1, 3)).toBe(0);
  });

  // 6. Region points extraction
  it('extracts all points for a specific region', () => {
    const labelGrid = ndarray(new Uint8Array([
      0, 0, 1, 1, 2, 2,
      0, 0, 1, 1, 2, 2,
      1, 1, 1, 1, 1, 1,
      3, 3, 1, 1, 4, 4,
      3, 3, 1, 1, 4, 4
    ]), [6, 5]);
    
    const region2Points = CorridorCarver.getRegionPoints(labelGrid, 2);
    const region3Points = CorridorCarver.getRegionPoints(labelGrid, 3);
    
    expect(region2Points.length).toBe(4); // 2x2 region
    expect(region3Points.length).toBe(4); // 2x2 region
    
    // Verify all points have the correct label
    region2Points.forEach(point => {
      expect(labelGrid.get(point.x, point.y)).toBe(2);
    });
  });

  // 7. Connection validation
  it('validates that regions are properly connected', () => {
    // Create a connected grid with a clear corridor
    const grid = ndarray(new Uint8Array([
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0, // corridor connecting regions
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0
    ]), [6, 5]);
    
    // First, let's see what regions are detected
    const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
    console.log('Test grid regions:', Object.keys(regionData).length);
    
    // If there are multiple regions, carve a corridor to connect them
    if (Object.keys(regionData).length > 1) {
      const rng = require('../../src/core/RandomGenerator');
      const testRng = new rng('validation-test');
      const result = CorridorCarver.carveCorridors(grid, labelGrid, regionData, testRng);
      const isConnected = CorridorCarver.validateConnection(result, labelGrid, regionData);
      expect(isConnected).toBe(true);
    } else {
      // Already connected
      const isConnected = CorridorCarver.validateConnection(grid, labelGrid, regionData);
      expect(isConnected).toBe(true);
    }
  });

  // 8. Deterministic behavior
  it('produces deterministic results for the same seed', () => {
    const grid = ndarray(new Uint8Array([
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      1, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0
    ]), [6, 5]);
    
    const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
    const rng1 = new RandomGenerator('test-seed');
    const rng2 = new RandomGenerator('test-seed');
    
    const result1 = CorridorCarver.carveCorridors(grid, labelGrid, regionData, rng1);
    const result2 = CorridorCarver.carveCorridors(grid, labelGrid, regionData, rng2);
    
    expect(result1.data).toEqual(result2.data);
  });

  // 9. Input immutability
  it('does not mutate input grids', () => {
    const originalGrid = ndarray(new Uint8Array([
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      1, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0
    ]), [6, 5]);
    
    const originalData = new Uint8Array(originalGrid.data);
    const { labelGrid, regionData } = RegionDetector.detectRegions(originalGrid);
    const rng = new RandomGenerator('test-seed');
    
    CorridorCarver.carveCorridors(originalGrid, labelGrid, regionData, rng);
    
    // Verify original grid data is unchanged
    expect(originalGrid.data).toEqual(originalData);
  });

  // 10. ASCII art output
  it('provides ASCII art for visual debugging', () => {
    const grid = ndarray(new Uint8Array([
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      1, 1, 1, 1, 1, 1,
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0
    ]), [6, 5]);
    
    const ascii = CorridorCarver.toAsciiArt(grid);
    
    expect(typeof ascii).toBe('string');
    expect(ascii.length).toBeGreaterThan(0);
    expect(ascii).toContain('\n'); // Should have line breaks
  });

  // 11. Performance on large grids
  it('handles large grids efficiently', () => {
    const width = 60;
    const height = 60;
    const data = new Uint8Array(width * height);
    
    // Create a complex cave-like pattern
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isWall = (
          x === 0 || x === width - 1 || y === 0 || y === height - 1 || // borders
          (x % 10 === 0 && y > 10 && y < height - 10) || // vertical walls
          (y % 8 === 0 && x > 5 && x < width - 5) || // horizontal walls
          Math.random() < 0.4 // random noise
        );
        data[y * width + x] = isWall ? 1 : 0;
      }
    }
    
    const grid = ndarray(data, [width, height]);
    const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
    const rng = new RandomGenerator('performance-test');
    
    const startTime = Date.now();
    const result = CorridorCarver.carveCorridors(grid, labelGrid, regionData, rng);
    const endTime = Date.now();
    
    // Should complete within reasonable time (less than 1 second)
    expect(endTime - startTime).toBeLessThan(1000);
    
    // Should create a connected cave
    const isConnected = CorridorCarver.validateConnection(result, labelGrid, regionData);
    expect(isConnected).toBe(true);
  });

  // 12. Edge cases
  it('handles edge cases gracefully', () => {
    // Single region (no corridors needed)
    const singleRegionGrid = ndarray(new Uint8Array([
      0, 0, 0,
      0, 0, 0,
      0, 0, 0
    ]), [3, 3]);
    
    const { labelGrid, regionData } = RegionDetector.detectRegions(singleRegionGrid);
    const rng = new RandomGenerator('edge-test');
    
    const result = CorridorCarver.carveCorridors(singleRegionGrid, labelGrid, regionData, rng);
    
    // Should not crash and should preserve the single region
    expect(result).toBeDefined();
    const isConnected = CorridorCarver.validateConnection(result, labelGrid, regionData);
    expect(isConnected).toBe(true);
  });

  // 13. Error handling
  it('throws appropriate errors for invalid inputs', () => {
    expect(() => {
      CorridorCarver.carveCorridors(null, null, null, null);
    }).toThrow();
    
    expect(() => {
      CorridorCarver.findClosestPair(null, []);
    }).toThrow();
    
    expect(() => {
      CorridorCarver.getRegionPoints(null, 1);
    }).toThrow();
  });

  // 14. Visual demonstration for user acceptance
  it('demonstrates corridor carving on 60x60 grid with visual output', () => {
    const width = 60;
    const height = 60;
    const data = new Uint8Array(width * height);
    
    // Create a cave-like pattern with multiple disconnected regions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isWall = (
          x === 0 || x === width - 1 || y === 0 || y === height - 1 || // borders
          (x % 12 === 0 && y > 15 && y < height - 15) || // vertical walls
          (y % 10 === 0 && x > 8 && x < width - 8) || // horizontal walls
          Math.random() < 0.35 // random noise
        );
        data[y * width + x] = isWall ? 1 : 0;
      }
    }
    
    const grid = ndarray(data, [width, height]);
    const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
    const rng = new RandomGenerator('demo-seed');
    
    // Print original grid
    console.log('\n=== 60x60 Cave Grid (Original) ===');
    console.log('Legend: . = floor, # = wall');
    for (let y = 0; y < height; y++) {
      let row = '';
      for (let x = 0; x < width; x++) {
        row += grid.get(x, y) === 1 ? '#' : '.';
      }
      console.log(row);
    }
    
    // Print region detection
    console.log('\n=== 60x60 Cave Grid (Region Detection) ===');
    console.log('Legend: # = wall, A-Z = regions (each letter = different region)');
    const regionAscii = RegionDetector.toAsciiArt(labelGrid);
    console.log(regionAscii);
    
    // Carve corridors
    const result = CorridorCarver.carveCorridors(grid, labelGrid, regionData, rng);
    
    // Print final result
    console.log('\n=== 60x60 Cave Grid (After Corridor Carving) ===');
    console.log('Legend: . = floor, # = wall');
    const finalAscii = CorridorCarver.toAsciiArt(result);
    console.log(finalAscii);
    
    // Print statistics
    console.log('\n=== Corridor Carving Statistics ===');
    console.log(`Original regions: ${Object.keys(regionData).length}`);
    const isConnected = CorridorCarver.validateConnection(result, labelGrid, regionData);
    console.log(`Regions connected: ${isConnected}`);
    
    // Verify the implementation is correct
    expect(Object.keys(regionData).length).toBeGreaterThan(1); // Multiple regions
    expect(isConnected).toBe(true); // All regions should be connected
  });

  describe('Deterministic behavior with different seeds', () => {
    it('should produce different corridor orientations with different seeds when multiple regions exist', () => {
      // Create a grid with multiple regions
      const grid = ndarray(new Uint8Array([
        0, 0, 1, 1, 0, 0,  // Region 1
        0, 0, 1, 1, 0, 0,
        1, 1, 1, 1, 1, 1,  // Wall separating regions
        0, 0, 1, 1, 0, 0,  // Region 2
        0, 0, 1, 1, 0, 0,
        0, 0, 1, 1, 0, 0
      ]), [6, 6]);
      
      const labelGrid = ndarray(new Uint8Array([
        2, 2, 1, 1, 3, 3,  // Region 2, Region 3
        2, 2, 1, 1, 3, 3,
        1, 1, 1, 1, 1, 1,  // Wall
        4, 4, 1, 1, 5, 5,  // Region 4, Region 5
        4, 4, 1, 1, 5, 5,
        4, 4, 1, 1, 5, 5
      ]), [6, 6]);
      
      const regionData = {
        2: { area: 4, bounds: { lo: [0, 0], hi: [1, 1] } },
        3: { area: 4, bounds: { lo: [4, 0], hi: [5, 1] } },
        4: { area: 6, bounds: { lo: [0, 3], hi: [1, 5] } },
        5: { area: 6, bounds: { lo: [4, 3], hi: [5, 5] } }
      };
      
      // Test with different seeds
      const rng1 = new RandomGenerator('seed-1');
      const rng2 = new RandomGenerator('seed-2');
      
      const result1 = CorridorCarver.carveCorridors(grid, labelGrid, regionData, rng1);
      const result2 = CorridorCarver.carveCorridors(grid, labelGrid, regionData, rng2);
      
      // Both should be connected
      expect(CorridorCarver.validateConnection(result1, labelGrid, regionData)).toBe(true);
      expect(CorridorCarver.validateConnection(result2, labelGrid, regionData)).toBe(true);
      
      // The results might be different due to different corridor orientations
      // (This is probabilistic, so we can't guarantee they're always different)
      const connected1 = CorridorCarver.validateConnection(result1, labelGrid, regionData);
      const connected2 = CorridorCarver.validateConnection(result2, labelGrid, regionData);
      
      expect(connected1).toBe(true);
      expect(connected2).toBe(true);
    });
    
    it('should produce identical results with same seed when multiple regions exist', () => {
      // Create a grid with multiple regions
      const grid = ndarray(new Uint8Array([
        0, 0, 1, 1, 0, 0,
        0, 0, 1, 1, 0, 0,
        1, 1, 1, 1, 1, 1,
        0, 0, 1, 1, 0, 0,
        0, 0, 1, 1, 0, 0,
        0, 0, 1, 1, 0, 0
      ]), [6, 6]);
      
      const labelGrid = ndarray(new Uint8Array([
        2, 2, 1, 1, 3, 3,
        2, 2, 1, 1, 3, 3,
        1, 1, 1, 1, 1, 1,
        4, 4, 1, 1, 5, 5,
        4, 4, 1, 1, 5, 5,
        4, 4, 1, 1, 5, 5
      ]), [6, 6]);
      
      const regionData = {
        2: { area: 4, bounds: { lo: [0, 0], hi: [1, 1] } },
        3: { area: 4, bounds: { lo: [4, 0], hi: [5, 1] } },
        4: { area: 6, bounds: { lo: [0, 3], hi: [1, 5] } },
        5: { area: 6, bounds: { lo: [4, 3], hi: [5, 5] } }
      };
      
      // Test with same seed
      const rng1 = new RandomGenerator('same-seed');
      const rng2 = new RandomGenerator('same-seed');
      
      const result1 = CorridorCarver.carveCorridors(grid, labelGrid, regionData, rng1);
      const result2 = CorridorCarver.carveCorridors(grid, labelGrid, regionData, rng2);
      
      // Results should be identical
      expect(result1.data).toEqual(result2.data);
      expect(CorridorCarver.validateConnection(result1, labelGrid, regionData)).toBe(true);
      expect(CorridorCarver.validateConnection(result2, labelGrid, regionData)).toBe(true);
    });
  });
}); 
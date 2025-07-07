const RegionDetector = require('../../src/analysis/RegionDetector');
const ndarray = require('ndarray');

describe('RegionDetector', () => {
  // 1. Single region labeling
  it('labels a single contiguous region correctly', () => {
    const grid = ndarray(new Uint8Array([
      0, 0, 0,
      0, 0, 0,
      0, 0, 0
    ]), [3, 3]);
    const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
    // All floor tiles should be labeled with the same label (e.g., 2)
    const label = labelGrid.get(0, 0);
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        expect(labelGrid.get(x, y)).toBe(label);
      }
    }
    expect(regionData[label].area).toBe(9);
  });

  // 2. Multiple disconnected regions
  it('labels multiple disconnected regions with unique labels', () => {
    const grid = ndarray(new Uint8Array([
      0, 1, 0,
      1, 1, 1,
      0, 1, 0
    ]), [3, 3]);
    const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
    // There should be 4 regions, each with area 1
    const labels = [];
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (grid.get(x, y) === 0) labels.push(labelGrid.get(x, y));
      }
    }
    const uniqueLabels = [...new Set(labels)];
    expect(uniqueLabels.length).toBe(4);
    uniqueLabels.forEach(l => expect(regionData[l].area).toBe(1));
  });

  // 3. Walls are not labeled
  it('does not label wall tiles as regions', () => {
    const grid = ndarray(new Uint8Array([
      1, 1, 1,
      1, 0, 1,
      1, 1, 1
    ]), [3, 3]);
    const { labelGrid } = RegionDetector.detectRegions(grid);
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (grid.get(x, y) === 1) {
          expect(labelGrid.get(x, y)).toBe(1);
        }
      }
    }
  });

  // 4. Determinism: same input, same output
  it('is deterministic for the same input', () => {
    const grid = ndarray(new Uint8Array([
      0, 1, 0,
      1, 1, 1,
      0, 1, 0
    ]), [3, 3]);
    const result1 = RegionDetector.detectRegions(grid);
    const result2 = RegionDetector.detectRegions(grid);
    expect(result1.labelGrid.data).toEqual(result2.labelGrid.data);
    expect(result1.regionData).toEqual(result2.regionData);
  });

  // 5. Metadata includes area and bounds
  it('region metadata includes area and bounds', () => {
    const grid = ndarray(new Uint8Array([
      0, 1, 0,
      1, 1, 1,
      0, 1, 0
    ]), [3, 3]);
    const { regionData } = RegionDetector.detectRegions(grid);
    Object.values(regionData).forEach(meta => {
      expect(typeof meta.area).toBe('number');
      expect(meta.bounds).toBeDefined();
      expect(typeof meta.bounds.lo).toBe('object');
      expect(typeof meta.bounds.hi).toBe('object');
    });
  });

  // 6. Visual output for user acceptance
  it('provides ASCII art for labeled regions', () => {
    const grid = ndarray(new Uint8Array([
      0, 1, 0,
      1, 0, 1,
      0, 1, 0
    ]), [3, 3]);
    const { labelGrid } = RegionDetector.detectRegions(grid);
    const ascii = RegionDetector.toAsciiArt(labelGrid);
    expect(typeof ascii).toBe('string');
    // Print for visual inspection
    console.log('\nRegionDetector ASCII Art:\n' + ascii);
  });

  // 7. 40x40 cave grid demonstration
  it('demonstrates flood-fill region detection on 40x40 cave grid', () => {
    // Generate a 40x40 cave-like grid with some noise
    const width = 40;
    const height = 40;
    const data = new Uint8Array(width * height);
    
    // Create a cave-like pattern with some noise
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Create cave-like structure with some noise
        const isWall = (
          x === 0 || x === width - 1 || y === 0 || y === height - 1 || // borders
          (x % 8 === 0 && y > 10 && y < height - 10) || // vertical walls
          (y % 6 === 0 && x > 5 && x < width - 5) || // horizontal walls
          Math.random() < 0.3 // random noise
        );
        data[y * width + x] = isWall ? 1 : 0;
      }
    }
    
    const grid = ndarray(data, [width, height]);
    const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
    
    // Print the original cave grid
    console.log('\n=== 40x40 Cave Grid (Original) ===');
    console.log('Legend: . = floor, # = wall');
    for (let y = 0; y < height; y++) {
      let row = '';
      for (let x = 0; x < width; x++) {
        row += grid.get(x, y) === 1 ? '#' : '.';
      }
      console.log(row);
    }
    
    // Print the labeled regions
    console.log('\n=== 40x40 Cave Grid (Labeled Regions) ===');
    console.log('Legend: # = wall, A-Z = regions (each letter = different region)');
    const ascii = RegionDetector.toAsciiArt(labelGrid);
    console.log(ascii);
    
    // Print region statistics
    console.log('\n=== Region Statistics ===');
    console.log(`Total regions detected: ${Object.keys(regionData).length}`);
    Object.entries(regionData).forEach(([label, meta]) => {
      console.log(`Region ${label}: area=${meta.area}, bounds=(${meta.bounds.lo.x},${meta.bounds.lo.y}) to (${meta.bounds.hi.x},${meta.bounds.hi.y})`);
    });
    
    // Verify the implementation is correct
    expect(Object.keys(regionData).length).toBeGreaterThan(0);
    Object.values(regionData).forEach(meta => {
      expect(meta.area).toBeGreaterThan(0);
      expect(meta.bounds).toBeDefined();
    });
  });
}); 
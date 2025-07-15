const DiagonalCorridorDetector = require('../../src/analysis/DiagonalCorridorDetector');
const ndarray = require('ndarray');

describe('DiagonalCorridorDetector', () => {
  describe('detectDiagonalCorridors', () => {
    test('should detect diagonal corridor issues in simple grid', () => {
      // Create a grid with diagonal corridor issue
      // ##....
      // ..####
      // ......
      // ######
      const data = new Uint8Array([
        1, 1, 0, 0, 0, 0,  // Row 0: ##....
        0, 0, 1, 1, 1, 1,  // Row 1: ..####
        0, 0, 0, 0, 0, 0,  // Row 2: ......
        1, 1, 1, 1, 1, 1   // Row 3: ######
      ]);
      const grid = ndarray(data, [6, 4]);

      // Print the grid as ASCII art for visual verification
      let ascii = '';
      for (let y = 0; y < 4; y++) {
        let row = '';
        for (let x = 0; x < 6; x++) {
          row += grid.get(x, y) === 1 ? '#' : '.';
        }
        ascii += row + '\n';
      }
      // eslint-disable-next-line no-console
      console.log('Grid:\n' + ascii);

      const issues = DiagonalCorridorDetector.detectDiagonalCorridors(grid);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe('diagonal_corridor');
      expect(issues[0].severity).toBe('high');
    });

    test('should detect the specific user example diagonal corridor', () => {
      // User's example:
      // ##....
      // ..####
      // ......
      // .#####
      // The problem is at <2,2> and <1,3> - both should be floor tiles that create impassable diagonal corridor
      const data = new Uint8Array([
        1, 1, 0, 0, 0, 0,  // Row 0: ##....
        0, 0, 1, 1, 1, 1,  // Row 1: ..####
        0, 0, 0, 0, 0, 0,  // Row 2: ......
        0, 0, 1, 1, 1, 1   // Row 3: .##### (changed second tile to floor to match <1,3>)
      ]);
      const grid = ndarray(data, [6, 4]);

      // Print the grid as ASCII art for visual verification
      let ascii = '';
      for (let y = 0; y < 4; y++) {
        let row = '';
        for (let x = 0; x < 6; x++) {
          row += grid.get(x, y) === 1 ? '#' : '.';
        }
        ascii += row + '\n';
      }
      // eslint-disable-next-line no-console
      console.log('Grid:\n' + ascii);

      // Collect debug output for all floor tiles
      let debugOutput = '';
      for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 4; y++) {
          if (grid.get(x, y) === 0) {
            const result = DiagonalCorridorDetector.detectDiagonalCorridorAt(grid, x, y);
            debugOutput += `Tile (${x},${y}): ${JSON.stringify(result)}\n`;
          }
        }
      }

      const issues = DiagonalCorridorDetector.detectDiagonalCorridors(grid);
      for (const issue of issues) {
        debugOutput += 'Detected issue: ' + JSON.stringify(issue) + '\n';
      }

      // Should detect issues at positions that create impassable diagonal paths
      const hasIssueAt21 = issues.some(issue => 
        issue.position.x === 2 && issue.position.y === 1
      );
      const hasIssueAt13 = issues.some(issue => 
        issue.position.x === 1 && issue.position.y === 3
      );
      debugOutput += `hasIssueAt21: ${hasIssueAt21}, hasIssueAt13: ${hasIssueAt13}\n`;

      if (!(hasIssueAt21 || hasIssueAt13)) {
        throw new Error('Debug output:\n' + debugOutput);
      }
      expect(hasIssueAt21 || hasIssueAt13).toBe(true);
    });

    test('should return empty array for grid without diagonal corridors', () => {
      // Create a simple open grid
      const data = new Uint8Array([
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
      ]);
      const grid = ndarray(data, [3, 3]);

      const issues = DiagonalCorridorDetector.detectDiagonalCorridors(grid);

      expect(issues).toEqual([]);
    });

    test('should throw error for invalid grid input', () => {
      expect(() => {
        DiagonalCorridorDetector.detectDiagonalCorridors(null);
      }).toThrow('Invalid grid input');

      expect(() => {
        DiagonalCorridorDetector.detectDiagonalCorridors({});
      }).toThrow('Invalid grid input');
    });

    test('should detect real-world diagonal corridor bug (regression)', () => {
      // Example grid with a diagonal corridor bug (extracted from a real generated level)
      // Adjust the grid to match the problematic pattern from the screenshot
      // Legend: 1 = wall (#), 0 = floor (.)
      // Example (6x6):
      // 1 1 1 1 1 1
      // 1 0 1 1 1 1
      // 1 1 0 1 1 1
      // 1 1 1 0 1 1
      // 1 1 1 1 0 1
      // 1 1 1 1 1 1
      // This creates a diagonal corridor from (1,1) to (4,4) with walls between each diagonal step
      const data = new Uint8Array([
        1, 1, 1, 1, 1, 1,
        1, 0, 1, 1, 1, 1,
        1, 1, 0, 1, 1, 1,
        1, 1, 1, 0, 1, 1,
        1, 1, 1, 1, 0, 1,
        1, 1, 1, 1, 1, 1
      ]);
      const grid = ndarray(data, [6, 6]);

      // Print the grid as ASCII art for visual verification
      let ascii = '';
      for (let y = 0; y < 6; y++) {
        let row = '';
        for (let x = 0; x < 6; x++) {
          row += grid.get(x, y) === 1 ? '#' : '.';
        }
        ascii += row + '\n';
      }
      // eslint-disable-next-line no-console
      console.log('Grid (regression test):\n' + ascii);

      const issues = DiagonalCorridorDetector.detectDiagonalCorridors(grid);
      expect(issues.length).toBeGreaterThan(0);
      // Optionally, check that at least one issue is at a diagonal position
      const hasDiagonalIssue = issues.some(issue => issue.position.x === 1 && issue.position.y === 1);
      expect(hasDiagonalIssue).toBe(true);
    });
  });

  describe('detectDiagonalCorridorAt', () => {
    test('should detect diagonal corridor at specific position', () => {
      // Create a grid with diagonal corridor at (2,1)
      const data = new Uint8Array([
        1, 1, 0, 0, 0,  // Row 0: ##...
        0, 0, 1, 1, 1,  // Row 1: ..###
        0, 0, 0, 0, 0,  // Row 2: .....
        1, 1, 1, 1, 1   // Row 3: #####
      ]);
      const grid = ndarray(data, [5, 4]);

      const issue = DiagonalCorridorDetector.detectDiagonalCorridorAt(grid, 2, 1);

      expect(issue).not.toBeNull();
      expect(issue.position).toEqual({ x: 2, y: 1 });
      expect(issue.type).toBe('diagonal_corridor');
      expect(issue.blockedDirections).toContain('up-left');
      expect(issue.blockedDirections).toContain('up-right');
    });

    test('should return null for floor tile without diagonal corridor', () => {
      const data = new Uint8Array([
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
      ]);
      const grid = ndarray(data, [3, 3]);

      const issue = DiagonalCorridorDetector.detectDiagonalCorridorAt(grid, 1, 1);

      expect(issue).toBeNull();
    });

    test('should return null for wall tile', () => {
      const data = new Uint8Array([
        1, 1, 1,
        1, 1, 1,
        1, 1, 1
      ]);
      const grid = ndarray(data, [3, 3]);

      const issue = DiagonalCorridorDetector.detectDiagonalCorridorAt(grid, 1, 1);

      expect(issue).toBeNull();
    });
  });

  describe('isDiagonalCorridorPattern', () => {
    test('should identify both up directions blocked as diagonal corridor', () => {
      const blockedDirections = ['up-left', 'up-right'];
      const result = DiagonalCorridorDetector.isDiagonalCorridorPattern(blockedDirections);
      expect(result).toBe(true);
    });

    test('should identify both down directions blocked as diagonal corridor', () => {
      const blockedDirections = ['down-left', 'down-right'];
      const result = DiagonalCorridorDetector.isDiagonalCorridorPattern(blockedDirections);
      expect(result).toBe(true);
    });

    test('should identify both left directions blocked as diagonal corridor', () => {
      const blockedDirections = ['up-left', 'down-left'];
      const result = DiagonalCorridorDetector.isDiagonalCorridorPattern(blockedDirections);
      expect(result).toBe(true);
    });

    test('should identify both right directions blocked as diagonal corridor', () => {
      const blockedDirections = ['up-right', 'down-right'];
      const result = DiagonalCorridorDetector.isDiagonalCorridorPattern(blockedDirections);
      expect(result).toBe(true);
    });

    test('should identify diagonal pairs as diagonal corridor', () => {
      const blockedDirections = ['up-left', 'down-right'];
      const result = DiagonalCorridorDetector.isDiagonalCorridorPattern(blockedDirections);
      expect(result).toBe(true);
    });

    test('should identify opposite diagonal pairs as diagonal corridor', () => {
      const blockedDirections = ['up-right', 'down-left'];
      const result = DiagonalCorridorDetector.isDiagonalCorridorPattern(blockedDirections);
      expect(result).toBe(true);
    });

    test('should return false for non-problematic patterns', () => {
      const blockedDirections = ['up-left'];
      const result = DiagonalCorridorDetector.isDiagonalCorridorPattern(blockedDirections);
      expect(result).toBe(false);
    });

    test('should return false for empty blocked directions', () => {
      const blockedDirections = [];
      const result = DiagonalCorridorDetector.isDiagonalCorridorPattern(blockedDirections);
      expect(result).toBe(false);
    });
  });

  describe('fixDiagonalCorridors', () => {
    test('should fix diagonal corridor issues', () => {
      // Create a grid with diagonal corridor issue
      const data = new Uint8Array([
        1, 1, 0, 0, 0,  // Row 0: ##...
        0, 0, 1, 1, 1,  // Row 1: ..###
        0, 0, 0, 0, 0,  // Row 2: .....
        1, 1, 1, 1, 1   // Row 3: #####
      ]);
      const grid = ndarray(data, [5, 4]);

      const result = DiagonalCorridorDetector.fixDiagonalCorridors(grid);

      expect(result.fixesApplied).toBeGreaterThan(0);
      expect(result.issuesFound).toBeGreaterThan(0);
    });

    test('should not fix grid without diagonal corridors', () => {
      const data = new Uint8Array([
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
      ]);
      const grid = ndarray(data, [3, 3]);

      const result = DiagonalCorridorDetector.fixDiagonalCorridors(grid);

      expect(result.fixesApplied).toBe(0);
      expect(result.issuesFound).toBe(0);
    });
  });

  describe('fixDiagonalCorridor', () => {
    test('should fix both up directions blocked by creating path above', () => {
      const data = new Uint8Array([
        1, 1, 1, 1,  // Row 0: ####
        0, 0, 1, 1,  // Row 1: ..##
        0, 0, 0, 0,  // Row 2: ....
        1, 1, 1, 1   // Row 3: ####
      ]);
      const grid = ndarray(data, [4, 4]);

      const issue = {
        position: { x: 2, y: 1 },
        blockedDirections: ['up-left', 'up-right']
      };

      const fixed = DiagonalCorridorDetector.fixDiagonalCorridor(grid, issue);

      expect(fixed).toBe(true);
      expect(grid.get(2, 0)).toBe(0); // Should create path above
    });

    test('should fix both down directions blocked by creating path below', () => {
      const data = new Uint8Array([
        1, 1, 1, 1,  // Row 0: ####
        0, 0, 0, 0,  // Row 1: ....
        0, 0, 1, 1,  // Row 2: ..##
        1, 1, 1, 1   // Row 3: ####
      ]);
      const grid = ndarray(data, [4, 4]);

      const issue = {
        position: { x: 2, y: 1 },
        blockedDirections: ['down-left', 'down-right']
      };

      const fixed = DiagonalCorridorDetector.fixDiagonalCorridor(grid, issue);

      expect(fixed).toBe(true);
      expect(grid.get(2, 2)).toBe(0); // Should create path below
    });

    test('should fix both left directions blocked by creating path to left', () => {
      const data = new Uint8Array([
        1, 0, 0, 1,  // Row 0: #..#
        1, 0, 0, 1,  // Row 1: #..#
        1, 0, 0, 1,  // Row 2: #..#
        1, 1, 1, 1   // Row 3: ####
      ]);
      const grid = ndarray(data, [4, 4]);

      const issue = {
        position: { x: 2, y: 1 },
        blockedDirections: ['up-left', 'down-left']
      };

      const fixed = DiagonalCorridorDetector.fixDiagonalCorridor(grid, issue);

      expect(fixed).toBe(true);
      expect(grid.get(1, 1)).toBe(0); // Should create path to left
    });

    test('should fix both right directions blocked by creating path to right', () => {
      const data = new Uint8Array([
        1, 0, 0, 1,  // Row 0: #..#
        1, 0, 0, 1,  // Row 1: #..#
        1, 0, 0, 1,  // Row 2: #..#
        1, 1, 1, 1   // Row 3: ####
      ]);
      const grid = ndarray(data, [4, 4]);

      const issue = {
        position: { x: 1, y: 1 },
        blockedDirections: ['up-right', 'down-right']
      };

      const fixed = DiagonalCorridorDetector.fixDiagonalCorridor(grid, issue);

      expect(fixed).toBe(true);
      expect(grid.get(2, 1)).toBe(0); // Should create path to right
    });

    test('should return false when no fix can be applied', () => {
      const data = new Uint8Array([
        1, 1, 1, 1,  // Row 0: ####
        1, 0, 0, 1,  // Row 1: #..#
        1, 0, 0, 1,  // Row 2: #..#
        1, 1, 1, 1   // Row 3: ####
      ]);
      const grid = ndarray(data, [4, 4]);

      const issue = {
        position: { x: 1, y: 1 },
        blockedDirections: ['up-left', 'down-right']
      };

      const fixed = DiagonalCorridorDetector.fixDiagonalCorridor(grid, issue);

      expect(fixed).toBe(false); // No fix possible due to bounds
    });
  });

  describe('isDiagonalCorridor', () => {
    test('should return true for tile with diagonal corridor issue', () => {
      const data = new Uint8Array([
        1, 1, 0, 0,  // Row 0: ##..
        0, 0, 1, 1,  // Row 1: ..##
        0, 0, 0, 0,  // Row 2: ....
        1, 1, 1, 1   // Row 3: ####
      ]);
      const grid = ndarray(data, [4, 4]);

      const result = DiagonalCorridorDetector.isDiagonalCorridor(grid, 2, 1);

      expect(result).toBe(true);
    });

    test('should return false for tile without diagonal corridor issue', () => {
      const data = new Uint8Array([
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
      ]);
      const grid = ndarray(data, [3, 3]);

      const result = DiagonalCorridorDetector.isDiagonalCorridor(grid, 1, 1);

      expect(result).toBe(false);
    });

    test('should return false for wall tile', () => {
      const data = new Uint8Array([
        1, 1, 1,
        1, 1, 1,
        1, 1, 1
      ]);
      const grid = ndarray(data, [3, 3]);

      const result = DiagonalCorridorDetector.isDiagonalCorridor(grid, 1, 1);

      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle edge tiles correctly', () => {
      const data = new Uint8Array([
        0, 0, 0,  // Row 0: ...
        0, 0, 0,  // Row 1: ...
        0, 0, 0   // Row 2: ...
      ]);
      const grid = ndarray(data, [3, 3]);

      // Edge tiles should not cause issues
      const issues = DiagonalCorridorDetector.detectDiagonalCorridors(grid);
      expect(issues).toEqual([]);
    });

    test('should handle single tile grid', () => {
      const data = new Uint8Array([0]);
      const grid = ndarray(data, [1, 1]);

      const issues = DiagonalCorridorDetector.detectDiagonalCorridors(grid);
      expect(issues).toEqual([]);
    });

    test('should handle grid with only walls', () => {
      const data = new Uint8Array([
        1, 1, 1,
        1, 1, 1,
        1, 1, 1
      ]);
      const grid = ndarray(data, [3, 3]);

      const issues = DiagonalCorridorDetector.detectDiagonalCorridors(grid);
      expect(issues).toEqual([]);
    });
  });

  test('should fix real-world diagonal corridor bug (regression)', () => {
    // Example grid with a diagonal corridor bug (same as previous regression test)
    const data = new Uint8Array([
      1, 1, 1, 1, 1, 1,
      1, 0, 1, 1, 1, 1,
      1, 1, 0, 1, 1, 1,
      1, 1, 1, 0, 1, 1,
      1, 1, 1, 1, 0, 1,
      1, 1, 1, 1, 1, 1
    ]);
    const grid = ndarray(data, [6, 6]);

    // Apply the fix
    const result = DiagonalCorridorDetector.fixDiagonalCorridors(grid);
    // After fixing, there should be no diagonal corridor issues
    const issuesAfter = DiagonalCorridorDetector.detectDiagonalCorridors(grid);
    // Print the grid after fixing for visual verification
    let ascii = '';
    for (let y = 0; y < 6; y++) {
      let row = '';
      for (let x = 0; x < 6; x++) {
        row += grid.get(x, y) === 1 ? '#' : '.';
      }
      ascii += row + '\n';
    }
    // eslint-disable-next-line no-console
    console.log('Grid after fix (regression test):\n' + ascii);
    expect(issuesAfter.length).toBe(0);
    // Optionally, check that at least one fix was applied
    expect(result.fixesApplied).toBeGreaterThan(0);
  });
}); 
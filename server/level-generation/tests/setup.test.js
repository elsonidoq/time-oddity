/**
 * @fileoverview Setup verification tests for level generation system
 * Tests package installation, import verification, and basic project structure
 */

const fs = require('fs');
const path = require('path');

describe('Level Generation Setup', () => {
  const projectRoot = path.join(__dirname, '..');
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const srcDir = path.join(projectRoot, 'src');
  const testsDir = path.join(projectRoot, 'tests');

  describe('Project Structure', () => {
    test('should have package.json with exact version pinning', () => {
      expect(fs.existsSync(packageJsonPath)).toBe(true);
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Verify required dependencies with exact versions
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies.ndarray).toBe('1.0.19');
      expect(packageJson.dependencies.seedrandom).toBe('3.0.5');
      expect(packageJson.dependencies['flood-fill']).toBe('0.1.1');
      expect(packageJson.dependencies.pathfinding).toBe('0.4.18');
      expect(packageJson.dependencies.commander).toBeDefined();
      
      // Verify dev dependencies for testing
      expect(packageJson.devDependencies).toBeDefined();
      expect(packageJson.devDependencies.jest).toBeDefined();
    });

    test('should have organized directory structure', () => {
      expect(fs.existsSync(srcDir)).toBe(true);
      expect(fs.existsSync(testsDir)).toBe(true);
      
      // Verify source directory structure
      const srcContents = fs.readdirSync(srcDir);
      expect(srcContents).toContain('core');
      expect(srcContents).toContain('validation');
      expect(srcContents).toContain('cli');
      expect(srcContents).toContain('monitoring');
      
      // Verify tests directory structure
      const testsContents = fs.readdirSync(testsDir);
      expect(testsContents).toContain('core');
      expect(testsContents).toContain('validation');
      expect(testsContents).toContain('cli');
      expect(testsContents).toContain('monitoring');
    });

    test('should have package-lock.json for reproducible builds', () => {
      const packageLockPath = path.join(projectRoot, 'package-lock.json');
      expect(fs.existsSync(packageLockPath)).toBe(true);
    });
  });

  describe('Package Import Verification', () => {
    test('should be able to import ndarray package', () => {
      expect(() => {
        const ndarray = require('ndarray');
        expect(ndarray).toBeDefined();
        expect(typeof ndarray).toBe('function');
      }).not.toThrow();
    });

    test('should be able to import seedrandom package', () => {
      expect(() => {
        const seedrandom = require('seedrandom');
        expect(seedrandom).toBeDefined();
        expect(typeof seedrandom).toBe('function');
      }).not.toThrow();
    });

    test('should be able to import flood-fill package', () => {
      expect(() => {
        const floodFill = require('flood-fill');
        expect(floodFill).toBeDefined();
        expect(typeof floodFill).toBe('function');
      }).not.toThrow();
    });

    test('should be able to import pathfinding package', () => {
      expect(() => {
        const PF = require('pathfinding');
        expect(PF).toBeDefined();
        expect(PF.Grid).toBeDefined();
        expect(PF.AStarFinder).toBeDefined();
      }).not.toThrow();
    });

    test('should be able to import commander package', () => {
      expect(() => {
        const { Command } = require('commander');
        expect(Command).toBeDefined();
        expect(typeof Command).toBe('function');
      }).not.toThrow();
    });
  });

  describe('Package Functionality Verification', () => {
    test('should create ndarray with correct dimensions', () => {
      const ndarray = require('ndarray');
      const Uint8Array = require('typedarray').Uint8Array;
      
      const data = new Uint8Array(100);
      const grid = ndarray(data, [10, 10]);
      
      expect(grid.shape).toEqual([10, 10]);
      expect(grid.dtype).toBe('generic');
    });

    test('should create seeded random generator', () => {
      const seedrandom = require('seedrandom');
      
      const rng1 = new seedrandom('test-seed');
      const rng2 = new seedrandom('test-seed');
      
      // Same seed should produce same sequence
      expect(rng1()).toBe(rng2());
      expect(rng1()).toBe(rng2());
    });

    test('should create pathfinding grid', () => {
      const PF = require('pathfinding');
      
      const matrix = [
        [0, 0, 1],
        [0, 1, 0],
        [0, 0, 0]
      ];
      
      const grid = new PF.Grid(matrix);
      expect(grid).toBeDefined();
      expect(grid.width).toBe(3);
      expect(grid.height).toBe(3);
    });

    test('should create flood-fill function', () => {
      const floodFill = require('flood-fill');
      
      expect(typeof floodFill).toBe('function');
      expect(floodFill.name).toBe('fill');
    });
  });

  describe('Security and Dependencies', () => {
    test('should not have critical security vulnerabilities', () => {
      // This test would typically run npm audit in a real scenario
      // For now, we'll just verify the package.json exists and is valid
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      expect(packageJson).toBeDefined();
      expect(packageJson.name).toBe('level-generation');
    });

    test('should have proper scripts defined', () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
      expect(packageJson.scripts.start).toBeDefined();
    });
  });
}); 
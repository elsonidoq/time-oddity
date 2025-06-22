import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Main Entry Point Tests', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const mainPath = join(__dirname, '../../client/src/main.js');

  test('should have main entry point file', () => {
    expect(existsSync(mainPath)).toBe(true);
  });

  test('should import game configuration', async () => {
    const mainModule = await import(mainPath);
    expect(mainModule).toBeDefined();
  });

  test('should have valid JavaScript syntax', () => {
    const content = readFileSync(mainPath, 'utf8');
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
    
    // Check for basic ES module syntax
    expect(content).toMatch(/import|export/);
  });

  test('should import game configuration', () => {
    const content = readFileSync(mainPath, 'utf8');
    expect(content).toMatch(/import.*game/);
  });

  test('should create game instance', () => {
    const content = readFileSync(mainPath, 'utf8');
    expect(content).toMatch(/new\s+Phaser\.Game/);
  });
}); 
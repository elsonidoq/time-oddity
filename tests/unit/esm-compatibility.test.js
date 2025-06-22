import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('ESM Compatibility and Import/Export Structure', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const scenesDir = join(__dirname, '../../client/src/scenes');
  
  const sceneFiles = [
    'BaseScene.js',
    'BootScene.js', 
    'MenuScene.js',
    'GameScene.js'
  ];

  test('should have all scene files exist', () => {
    sceneFiles.forEach(file => {
      const filePath = join(scenesDir, file);
      expect(existsSync(filePath)).toBe(true);
    });
  });

  test('should use ESM import/export in all scene files', () => {
    sceneFiles.forEach(file => {
      const filePath = join(scenesDir, file);
      const content = readFileSync(filePath, 'utf8');
      
      // Check for ESM imports
      expect(content).toMatch(/import.*from/);
      
      // Check for ESM exports
      expect(content).toMatch(/export default/);
      
      // Should NOT use CommonJS require
      expect(content).not.toMatch(/require\(/);
      
      // Should NOT use CommonJS module.exports
      expect(content).not.toMatch(/module\.exports/);
    });
  });

  test('should not use top-level await in any scene file', () => {
    sceneFiles.forEach(file => {
      const filePath = join(scenesDir, file);
      const content = readFileSync(filePath, 'utf8');
      
      // Should NOT have top-level await
      expect(content).not.toMatch(/^[\s]*await/);
      expect(content).not.toMatch(/^[\s]*const.*=.*await/);
    });
  });

  test('should use standard ESM import for Phaser in BaseScene.js', () => {
    const baseScenePath = join(scenesDir, 'BaseScene.js');
    const content = readFileSync(baseScenePath, 'utf8');
    
    // Should use standard ESM import for Phaser
    expect(content).toMatch(/import Phaser from ['"]phaser['"]/);
    
    // Should NOT use dynamic import with await
    expect(content).not.toMatch(/await import\(['"]phaser['"]\)/);
  });

  test('should have proper ESM import structure in game.js', () => {
    const gamePath = join(__dirname, '../../client/src/game.js');
    const content = readFileSync(gamePath, 'utf8');
    
    // Should use ESM imports for scenes
    expect(content).toMatch(/import.*BootScene/);
    expect(content).toMatch(/import.*MenuScene/);
    
    // Should use ESM export
    expect(content).toMatch(/export default/);
    
    // Should NOT use CommonJS
    expect(content).not.toMatch(/require\(/);
    expect(content).not.toMatch(/module\.exports/);
  });

  test('should have correct ESM import statements in scene files', () => {
    // Test that each scene file imports BaseScene correctly
    const sceneFilesToTest = ['BootScene.js', 'MenuScene.js', 'GameScene.js'];
    
    sceneFilesToTest.forEach(file => {
      const filePath = join(scenesDir, file);
      const content = readFileSync(filePath, 'utf8');
      
      // Should import BaseScene using ESM
      expect(content).toMatch(/import BaseScene from ['"]\.\/BaseScene\.js['"]/);
      
      // Should export default the scene class
      expect(content).toMatch(/export default class/);
    });
  });
}); 
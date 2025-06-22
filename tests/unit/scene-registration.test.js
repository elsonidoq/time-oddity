import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Scene Registration in Game Configuration', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const gameConfigPath = join(__dirname, '../../client/src/game.js');

  test('should have game configuration file', () => {
    expect(existsSync(gameConfigPath)).toBe(true);
  });

  test('should import all scene classes', async () => {
    const gameConfig = await import(gameConfigPath);
    expect(gameConfig.default).toBeDefined();
    
    // Check that the game instance exists and has config
    const game = gameConfig.default;
    expect(game).toBeDefined();
    expect(game.config).toBeDefined();
    
    const config = game.config;
    expect(config).toBeDefined();
    expect(config.scene).toBeDefined();
    expect(Array.isArray(config.scene)).toBe(true);
  });

  test('should register all required scenes', async () => {
    const gameConfig = await import(gameConfigPath);
    const game = gameConfig.default;
    const config = game.config;
    
    // Check that all required scenes are registered
    const sceneKeys = config.scene.map(scene => 
      typeof scene === 'string' ? scene : scene.name
    );
    
    expect(sceneKeys).toContain('BootScene');
    expect(sceneKeys).toContain('MenuScene');
    expect(sceneKeys).toContain('GameScene');
  });

  test('should have valid scene configuration', async () => {
    const gameConfig = await import(gameConfigPath);
    const game = gameConfig.default;
    const config = game.config;
    
    // Check that scenes array is not empty
    expect(config.scene.length).toBeGreaterThan(0);
    
    // Check that all scenes are valid
    config.scene.forEach(scene => {
      expect(scene).toBeDefined();
      if (typeof scene === 'string') {
        expect(scene).toMatch(/^[A-Z][a-zA-Z]*Scene$/);
      } else {
        expect(typeof scene).toBe('function');
      }
    });
  });

  test('should have unique scene keys', async () => {
    const gameConfig = await import(gameConfigPath);
    const game = gameConfig.default;
    const config = game.config;
    
    const sceneKeys = config.scene.map(scene => 
      typeof scene === 'string' ? scene : scene.name
    );
    
    // Check that all scene keys are unique
    const uniqueKeys = new Set(sceneKeys);
    expect(uniqueKeys.size).toBe(sceneKeys.length);
  });
}); 
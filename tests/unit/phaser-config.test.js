import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Phaser Configuration Tests', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const gameConfigPath = join(__dirname, '../../client/src/game.js');

  test('should have game configuration file', () => {
    expect(existsSync(gameConfigPath)).toBe(true);
  });

  test('should import Phaser correctly', async () => {
    const gameConfig = await import(gameConfigPath);
    expect(gameConfig.default).toBeDefined();
    
    const game = gameConfig.default;
    expect(game).toBeDefined();
    expect(game.config).toBeDefined();
  });

  test('should have correct game type', async () => {
    const gameConfig = await import(gameConfigPath);
    const game = gameConfig.default;
    const config = game.config;
    
    expect(config.type).toBeDefined();
    // Should be Phaser.AUTO (which is "AUTO" in our mock)
    expect(config.type).toBe('AUTO');
  });

  test('should have correct canvas dimensions', async () => {
    const gameConfig = await import(gameConfigPath);
    const game = gameConfig.default;
    const config = game.config;
    
    expect(config.width).toBe(1280);
    expect(config.height).toBe(720);
  });

  test('should have correct parent container', async () => {
    const gameConfig = await import(gameConfigPath);
    const game = gameConfig.default;
    const config = game.config;
    
    expect(config.parent).toBe('game-container');
  });

  test('should have correct background color', async () => {
    const gameConfig = await import(gameConfigPath);
    const game = gameConfig.default;
    const config = game.config;
    
    expect(config.backgroundColor).toBe('#000000');
  });

  test('should have physics configuration', async () => {
    const gameConfig = await import(gameConfigPath);
    const game = gameConfig.default;
    const config = game.config;
    
    expect(config.physics).toBeDefined();
    expect(config.physics.default).toBe('arcade');
    expect(config.physics.arcade).toBeDefined();
    expect(config.physics.arcade.gravity).toBeDefined();
  });

  test('should have audio configuration', async () => {
    const gameConfig = await import(gameConfigPath);
    const game = gameConfig.default;
    const config = game.config;
    
    expect(config.audio).toBeDefined();
    expect(config.audio.noAudio).toBe(true);
  });

  test('should have scene configuration', async () => {
    const gameConfig = await import(gameConfigPath);
    const game = gameConfig.default;
    const config = game.config;
    
    expect(config.scene).toBeDefined();
    expect(Array.isArray(config.scene)).toBe(true);
    expect(config.scene.length).toBeGreaterThan(0);
  });

  test('should have valid scene keys', async () => {
    const gameConfig = await import(gameConfigPath);
    const game = gameConfig.default;
    const config = game.config;
    
    config.scene.forEach(scene => {
      if (typeof scene === 'string') {
        expect(scene).toMatch(/^[A-Z][a-zA-Z]*Scene$/);
      } else {
        expect(typeof scene).toBe('function');
      }
    });
  });
}); 
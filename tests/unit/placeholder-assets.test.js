import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';

describe('Placeholder Assets', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const assetsDir = join(__dirname, '../../client/src/assets/sprites');
  const placeholderFiles = [
    'placeholder_player.png',
    'placeholder_platform.png',
    'placeholder_coin.png'
  ];

  test('should have placeholder asset files in assets/sprites', () => {
    placeholderFiles.forEach(file => {
      const filePath = join(assetsDir, file);
      expect(existsSync(filePath)).toBe(true);
    });
  });

  let BootScene;

  beforeAll(async () => {
    // Dynamically import BootScene
    const module = await import('../../client/src/scenes/BootScene.js');
    BootScene = module.default;
  });

  test('BootScene should load Kenney assets', () => {
    const scene = new BootScene();
    const mockAtlas = jest.fn();
    // Create a mock for the scene's loader
    const mockLoad = {
      image: jest.fn(),
      spritesheet: jest.fn(),
      atlas: mockAtlas,
      atlasXML: jest.fn(),
      on: jest.fn(),
      start: jest.fn(),
    };
    scene.load = mockLoad;

    scene.preload();
    // Check that Kenney assets were loaded
    expect(scene.load.atlasXML).toHaveBeenCalledWith('characters', '/src/assets/sprites/spritesheet-characters-default.png', '/src/assets/sprites/spritesheet-characters-default.xml');
    expect(scene.load.atlasXML).toHaveBeenCalledWith('tiles', '/src/assets/sprites/spritesheet-tiles-default.png', '/src/assets/sprites/spritesheet-tiles-default.xml');
    // Ensure the placeholder coin is no longer loaded
    expect(scene.load.image).not.toHaveBeenCalledWith('coin', expect.any(String));
  });
}); 
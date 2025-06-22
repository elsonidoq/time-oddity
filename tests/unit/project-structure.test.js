import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Project Structure Tests', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = join(__dirname, '../..');

  describe('Core Directories', () => {
    test('should have client directory', () => {
      expect(existsSync(join(projectRoot, 'client'))).toBe(true);
    });

    test('should have server directory', () => {
      expect(existsSync(join(projectRoot, 'server'))).toBe(true);
    });

    test('should have tests directory', () => {
      expect(existsSync(join(projectRoot, 'tests'))).toBe(true);
    });

    test('should have agent_docs directory', () => {
      expect(existsSync(join(projectRoot, 'agent_docs'))).toBe(true);
    });
  });

  describe('Client Structure', () => {
    test('should have client/src directory', () => {
      expect(existsSync(join(projectRoot, 'client/src'))).toBe(true);
    });

    test('should have client/src/scenes directory', () => {
      expect(existsSync(join(projectRoot, 'client/src/scenes'))).toBe(true);
    });

    test('should have client/src/assets directory', () => {
      expect(existsSync(join(projectRoot, 'client/src/assets'))).toBe(true);
    });

    test('should have client/src/assets/sprites directory', () => {
      expect(existsSync(join(projectRoot, 'client/src/assets/sprites'))).toBe(true);
    });

    test('should have client/src/assets/audio directory', () => {
      expect(existsSync(join(projectRoot, 'client/src/assets/audio'))).toBe(true);
    });

    test('should have client/index.html', () => {
      expect(existsSync(join(projectRoot, 'client/index.html'))).toBe(true);
    });
  });

  describe('Scene Files', () => {
    const scenesDir = join(projectRoot, 'client/src/scenes');

    test('should have BaseScene.js', () => {
      expect(existsSync(join(scenesDir, 'BaseScene.js'))).toBe(true);
    });

    test('should have BootScene.js', () => {
      expect(existsSync(join(scenesDir, 'BootScene.js'))).toBe(true);
    });

    test('should have MenuScene.js', () => {
      expect(existsSync(join(scenesDir, 'MenuScene.js'))).toBe(true);
    });

    test('should have GameScene.js', () => {
      expect(existsSync(join(scenesDir, 'GameScene.js'))).toBe(true);
    });
  });

  describe('Core Game Files', () => {
    test('should have game.js configuration', () => {
      expect(existsSync(join(projectRoot, 'client/src/game.js'))).toBe(true);
    });

    test('should have main.js entry point', () => {
      expect(existsSync(join(projectRoot, 'client/src/main.js'))).toBe(true);
    });
  });

  describe('Configuration Files', () => {
    test('should have package.json', () => {
      expect(existsSync(join(projectRoot, 'package.json'))).toBe(true);
    });

    test('should have vite.config.js', () => {
      expect(existsSync(join(projectRoot, 'vite.config.js'))).toBe(true);
    });

    test('should have jest.config.mjs', () => {
      expect(existsSync(join(projectRoot, 'jest.config.mjs'))).toBe(true);
    });
  });

  describe('Documentation', () => {
    test('should have comprehensive documentation', () => {
      expect(existsSync(join(projectRoot, 'agent_docs/comprehensive_documentation.md'))).toBe(true);
    });

    test('should have task breakdown', () => {
      expect(existsSync(join(projectRoot, 'tasks/01_mvp_tasks.md'))).toBe(true);
    });
  });

  describe('Asset Organization', () => {
    test('should have Kenney assets organized', () => {
      const kenneyPath = join(projectRoot, 'kenney_new-platformer-pack-1.0');
      expect(existsSync(kenneyPath)).toBe(true);
    });

    test('should have character spritesheet copied', () => {
      const spritesPath = join(projectRoot, 'client/src/assets/sprites');
      expect(existsSync(join(spritesPath, 'spritesheet-characters-default.png'))).toBe(true);
      expect(existsSync(join(spritesPath, 'spritesheet-characters-default.xml'))).toBe(true);
    });

    test('should have tile spritesheet copied', () => {
      const spritesPath = join(projectRoot, 'client/src/assets/sprites');
      expect(existsSync(join(spritesPath, 'spritesheet-tiles-default.png'))).toBe(true);
      expect(existsSync(join(spritesPath, 'spritesheet-tiles-default.xml'))).toBe(true);
    });

    test('should have enemy spritesheet copied', () => {
      const spritesPath = join(projectRoot, 'client/src/assets/sprites');
      expect(existsSync(join(spritesPath, 'spritesheet-enemies-default.png'))).toBe(true);
      expect(existsSync(join(spritesPath, 'spritesheet-enemies-default.xml'))).toBe(true);
    });

    test('should have sound effects copied', () => {
      const audioPath = join(projectRoot, 'client/src/assets/audio');
      const soundFiles = [
        'sfx_bump.ogg',
        'sfx_coin.ogg',
        'sfx_disappear.ogg',
        'sfx_jump.ogg'
      ];
      
      soundFiles.forEach(file => {
        expect(existsSync(join(audioPath, file))).toBe(true);
      });
    });
  });
}); 
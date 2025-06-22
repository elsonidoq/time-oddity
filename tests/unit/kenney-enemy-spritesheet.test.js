import { readFileSync, existsSync } from 'fs';
import { jest } from '@jest/globals';
import BootScene from '../../client/src/scenes/BootScene.js';

describe('Task 1.18: Load Kenney Enemy Assets', () => {
  describe('Asset File Verification', () => {
    test('should find the enemy spritesheet PNG file', () => {
      const spritesheetPath = 'client/src/assets/sprites/spritesheet-enemies-default.png';
      expect(existsSync(spritesheetPath)).toBe(true);
    });

    test('should find the enemy spritesheet XML file', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-enemies-default.xml';
      expect(existsSync(xmlPath)).toBe(true);
    });

    test('should validate the enemy spritesheet XML structure for basic enemies', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-enemies-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      
      expect(xmlContent).toContain('<TextureAtlas');
      // Check for basic enemies as per task requirements
      expect(xmlContent).toContain('slime_normal_walk_a');
      expect(xmlContent).toContain('fly_a');
      expect(xmlContent).toContain('mouse_walk_a');
    });
  });

  describe('BootScene Enemy Asset Loading', () => {
    let scene;
    let mockLoad;

    beforeEach(() => {
      scene = new BootScene();
      mockLoad = {
        image: jest.fn(),
        spritesheet: jest.fn(),
        atlas: jest.fn(),
        atlasXML: jest.fn(),
        on: jest.fn(),
        start: jest.fn(),
      };
      scene.load = mockLoad;
    });

    test('should load enemy spritesheet atlas in preload', () => {
      scene.preload();
      expect(scene.load.atlasXML).toHaveBeenCalledWith(
        'enemies',
        '/src/assets/sprites/spritesheet-enemies-default.png',
        '/src/assets/sprites/spritesheet-enemies-default.xml'
      );
    });
  });

  describe('Enemy Animation Creation', () => {
    let scene;

    beforeEach(() => {
      scene = new BootScene();
      scene.anims = {
        create: jest.fn(),
        generateFrameNames: jest.fn().mockReturnValue([]),
      };
    });

    test('should create animations for basic enemies', () => {
      scene.createEnemyAnimations();

      // Slime animations
      expect(scene.anims.create).toHaveBeenCalledWith(expect.objectContaining({ key: 'slime-walk' }));
      
      // Fly animations
      expect(scene.anims.create).toHaveBeenCalledWith(expect.objectContaining({ key: 'fly-fly' }));
      
      // Mouse animations
      expect(scene.anims.create).toHaveBeenCalledWith(expect.objectContaining({ key: 'mouse-walk' }));
    });

    test('should handle potential missing animation frames gracefully', () => {
      // This test ensures that even if frames are missing, the create call is still made.
      // The actual visual result would need to be checked in-game.
      expect(() => scene.createEnemyAnimations()).not.toThrow();
    });
  });
}); 
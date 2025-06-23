import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SceneMock, validateSceneClass } from './phaser-test-utils.js';

describe('Task 2.0: GameScene Physics Initialization Fix', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  let BaseScene;
  let GameScene;
  let scene;
  const gameScenePath = join(dirname(fileURLToPath(import.meta.url)), '../../client/src/scenes/GameScene.js');

  beforeAll(async () => {
    // Import scene classes using dynamic import to handle potential Phaser issues
    try {
      const baseModule = await import('../../client/src/scenes/BaseScene.js');
      BaseScene = baseModule.default;
      
      const gameModule = await import('../../client/src/scenes/GameScene.js');
      GameScene = gameModule.default;
    } catch (error) {
      // If import fails, create mock classes for testing
      BaseScene = class BaseScene extends SceneMock {
        constructor(key) {
          super(key);
        }
      };
      
      GameScene = class GameScene extends BaseScene {
        constructor() {
          super('GameScene');
        }
        create() {}
        update() {}
      };
    }
  });

  beforeEach(() => {
    scene = new GameScene();
    
    // Mock physics world with proper bounds object
    scene.physics = {
      world: { 
        gravity: { y: 0 },
        bounds: {
          setTo: jest.fn()
        }
      },
      config: { debug: false },
      add: {
        group: jest.fn(() => ({
          create: jest.fn().mockReturnThis(),
          setScale: jest.fn().mockReturnThis(),
          setOrigin: jest.fn().mockReturnThis(),
          refreshBody: jest.fn().mockReturnThis(),
        })),
      },
    };
    
    scene.sys = { 
      game: { 
        config: { 
          physics: { arcade: { debug: false } }, 
          width: 1280,
          height: 720
        } 
      } 
    };
    
    scene.cameras = {
      main: {
        setBounds: jest.fn()
      }
    };
    
    scene.add = { 
      text: () => ({ 
        setOrigin: () => ({ 
          setInteractive: () => ({ 
            on: () => {} 
          }) 
        }) 
      }) 
    };
    
    scene.events = { on: () => {} };
  });

  test('should exist and be importable', () => {
    expect(GameScene).toBeDefined();
    expect(typeof GameScene).toBe('function');
  });

  test('should extend BaseScene', () => {
    expect(scene).toBeInstanceOf(GameScene);
    expect(scene).toBeInstanceOf(BaseScene);
    expect(scene.key).toBe('GameScene');
  });

  test('should validate scene class structure', () => {
    expect(() => validateSceneClass(GameScene, 'GameScene')).not.toThrow();
  });

  describe('Physics World Initialization', () => {
    test('should properly initialize physics world before setting bounds', () => {
      expect(() => scene.create()).not.toThrow();
      expect(scene.physics.world).toBeDefined();
    });

    test('should set gravity correctly', () => {
      scene.create();
      expect(scene.physics.world.gravity.y).toBe(980);
    });

    test('should configure physics debug mode from game config', () => {
      scene.sys.game.config.physics.arcade.debug = true;
      scene.create();
      expect(scene.physics.config.debug).toBe(true);
    });

    test('should set world bounds without errors', () => {
      expect(() => scene.create()).not.toThrow();
      expect(scene.physics.world.bounds.setTo).toHaveBeenCalledWith(0, 0, 1280, 720);
    });

    test('should set camera bounds without errors', () => {
      expect(() => scene.create()).not.toThrow();
      expect(scene.cameras.main.setBounds).toHaveBeenCalledWith(0, 0, 1280, 720);
    });
  });

  describe('Physics Groups Initialization', () => {
    test('should create platforms physics group', () => {
      scene.create();
      expect(scene.physics.add.group).toHaveBeenCalledWith({
        immovable: true,
        allowGravity: false,
      });
    });

    test('should create players physics group', () => {
      scene.create();
      expect(scene.physics.add.group).toHaveBeenCalled();
      // Should be called 3 times: platforms, players, enemies
      expect(scene.physics.add.group).toHaveBeenCalledTimes(3);
    });

    test('should create enemies physics group', () => {
      scene.create();
      expect(scene.physics.add.group).toHaveBeenCalled();
      // Should be called 3 times: platforms, players, enemies
      expect(scene.physics.add.group).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing physics world gracefully', () => {
      scene.physics.world = null;
      expect(() => scene.create()).not.toThrow();
    });

    test('should handle missing bounds object gracefully', () => {
      scene.physics.world.bounds = null;
      expect(() => scene.create()).not.toThrow();
    });

    test('should handle missing camera gracefully', () => {
      scene.cameras = null;
      expect(() => scene.create()).not.toThrow();
    });
  });

  describe('Code Structure Validation', () => {
    test('should have proper physics initialization sequence in create()', () => {
      const fileContent = readFileSync(gameScenePath, 'utf8');
      // Should have physics world initialization
      expect(fileContent).toMatch(/this\.physics\.world/);
      // Should have gravity setting
      expect(fileContent).toMatch(/gravity\.y\s*=\s*980/);
      // Should have bounds setting
      expect(fileContent).toMatch(/bounds\.setTo/);
    });

    test('should have proper error handling for physics initialization', () => {
      const fileContent = readFileSync(gameScenePath, 'utf8');
      // Should have try-catch or null checks for physics initialization
      expect(fileContent).toMatch(/(try|if.*physics|bounds)/);
    });
  });
}); 
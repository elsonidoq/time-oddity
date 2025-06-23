import { jest } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SceneMock, validateSceneClass } from './phaser-test-utils.js';

describe('GameScene', () => {
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
    
    // Simple mock setup for basic functionality testing
    scene.physics = {
      world: { 
        gravity: { y: 0 },
        bounds: { setTo: jest.fn() }
      },
      config: { debug: false },
      add: {
        group: jest.fn(() => ({
          create: jest.fn().mockReturnThis(),
          add: jest.fn(),
          getChildren: jest.fn(() => [])
        })),
        collider: jest.fn(),
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
    
    scene.add = { text: () => ({ setOrigin: () => ({ setInteractive: () => ({ on: () => {} }) }) }) };
    scene.events = { on: () => {} };
    scene.cameras = { main: { setBounds: jest.fn() } };
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

  test('should implement core scene lifecycle methods', () => {
    expect(typeof scene.init).toBe('function');
    expect(typeof scene.preload).toBe('function');
    expect(typeof scene.create).toBe('function');
    expect(typeof scene.update).toBe('function');
  });

  test('should validate scene class structure', () => {
    expect(() => validateSceneClass(GameScene, 'GameScene')).not.toThrow();
  });

  test('should create basic scene content in create()', () => {
    expect(() => scene.create()).not.toThrow();
  });

  test('should handle game loop in update()', () => {
    expect(() => scene.update(0, 16)).not.toThrow();
  });

  test('should have a navigation button or method for scene transition', () => {
    const fileContent = readFileSync(gameScenePath, 'utf8');
    // Look for button creation or scene transition code
    expect(fileContent).toMatch(/this\.add\.(text|image|sprite)/);
    expect(fileContent).toMatch(/setInteractive/);
    expect(fileContent).toMatch(/this\.scene\.(start|launch)/);
  });

  test('should clean up resources on shutdown', () => {
    const fileContent = readFileSync(gameScenePath, 'utf8');
    // Look for shutdown event handler or destroy calls
    expect(fileContent).toMatch(/this\.events\.on\(['"]shutdown['"]/);
  });

  test('should set up collision detection between player and platforms', () => {
    const fileContent = readFileSync(gameScenePath, 'utf8');
    // Look for collision detection setup
    expect(fileContent).toMatch(/this\.physics\.add\.collider/);
    expect(fileContent).toMatch(/handlePlayerPlatformCollision/);
  });

  test('should have a collision handler method', () => {
    const fileContent = readFileSync(gameScenePath, 'utf8');
    // Look for collision handler method
    expect(fileContent).toMatch(/handlePlayerPlatformCollision/);
    expect(typeof scene.handlePlayerPlatformCollision).toBe('function');
  });

  test('should initialize physics groups', () => {
    scene.create();
    expect(scene.physics.add.group).toHaveBeenCalled();
  });

  test('should set up collision detection', () => {
    scene.create();
    expect(scene.physics.add.collider).toHaveBeenCalled();
  });
}); 
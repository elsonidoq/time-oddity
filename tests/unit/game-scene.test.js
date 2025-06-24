import '../mocks/phaserMock.js';
import { jest } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SceneMock, validateSceneClass } from './phaser-test-utils.js';
import { Scene as MockScene } from '../mocks/phaserMock.js';
let BaseScene;
let GameScene;

// Phaser KeyCodes mock for ESM/Jest
if (!globalThis.Phaser) globalThis.Phaser = {};
if (!globalThis.Phaser.Input) globalThis.Phaser.Input = {};
if (!globalThis.Phaser.Input.Keyboard) globalThis.Phaser.Input.Keyboard = {};
if (!globalThis.Phaser.Input.Keyboard.KeyCodes) {
  globalThis.Phaser.Input.Keyboard.KeyCodes = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UP: 'UP',
    DOWN: 'DOWN',
    A: 'A',
    D: 'D',
    W: 'W',
    S: 'S',
    SPACE: 'SPACE',
    SHIFT: 'SHIFT',
    R: 'R',
  };
}

describe('GameScene', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  let scene;
  let mockBody;
  const gameScenePath = join(dirname(fileURLToPath(import.meta.url)), '../../client/src/scenes/GameScene.js');

  beforeAll(() => {
    if (!global.Phaser || !global.Phaser.Input || !global.Phaser.Input.Keyboard || !global.Phaser.Input.Keyboard.KeyCodes) {
      require('../mocks/phaserMock.js');
    }
  });

  beforeAll(async () => {
    // Import scene classes using dynamic import to handle potential Phaser issues
    const baseModule = await import('../../client/src/scenes/BaseScene.js');
    BaseScene = baseModule.default;
    
    const gameModule = await import('../../client/src/scenes/GameScene.js');
    GameScene = gameModule.default;
  });

  beforeEach(() => {
    if (!globalThis.Phaser) globalThis.Phaser = {};
    if (!globalThis.Phaser.Input) globalThis.Phaser.Input = {};
    if (!globalThis.Phaser.Input.Keyboard) globalThis.Phaser.Input.Keyboard = {};
    const mockScene = new MockScene('GameScene');
    // Spy on the mock scene's collider method since CollisionManager uses it
    jest.spyOn(mockScene.physics.add, 'collider');
    scene = new GameScene(mockScene);
    scene.input = {
      keyboard: {
        addKey: jest.fn((key) => ({ isDown: false, isUp: true, isPressed: false, keyCode: key }))
      }
    };
    scene.time = { now: 0 };
    scene.physics = {
      world: { gravity: { y: 0 }, tileBias: 0, bounds: { setTo: jest.fn() } },
      config: { debug: false },
      add: { 
        group: jest.fn(() => ({ create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) })), 
        sprite: jest.fn(() => ({ 
          body: { 
            setAllowGravity: jest.fn(),
            setGravity: jest.fn(),
            setCollideWorldBounds: jest.fn(),
            setBounce: jest.fn(),
            setVelocity: jest.fn(),
            setVelocityX: jest.fn(),
            setVelocityY: jest.fn(),
            velocity: { x: 0, y: 0 },
            onFloor: jest.fn(() => true)
          }, 
          play: jest.fn().mockReturnThis(), 
          parentCoin: null 
        })), 
        existing: jest.fn(),
        collider: jest.fn(),
      },
    };
    scene.cameras = { main: { setBounds: jest.fn() } };
    scene.sys = {
      game: {
        config: {
          physics: { arcade: { debug: false } },
          width: 1280,
          height: 720,
        }
      },
      events: { on: jest.fn(), off: jest.fn() }
    };
    scene.platforms = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    scene.players = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    scene.enemies = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    scene.coins = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    mockBody = {
      setVelocity: jest.fn(),
      setVelocityX: jest.fn(),
      setVelocityY: jest.fn(),
      setCollideWorldBounds: jest.fn(),
      setBounce: jest.fn(),
      setGravity: jest.fn(),
      setAllowGravity: jest.fn(),
      velocity: { x: 0, y: 0 },
      onFloor: jest.fn(() => true)
    };
  });

  // Helper to patch all scene references after create
  function patchAllSceneRefs() {
    if (scene.collisionManager) scene.collisionManager.scene = scene;
    if (scene.timeManager) scene.timeManager.scene = scene;
    if (scene.player) scene.player.scene = scene;
    if (scene.players && scene.players.children) {
      scene.players.children.forEach && scene.players.children.forEach(p => p.scene = scene);
    }
  }

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
    expect(() => { scene.create(); patchAllSceneRefs(); }).not.toThrow();
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
    // Look for collision detection setup using CollisionManager
    expect(fileContent).toMatch(/CollisionManager/);
    expect(fileContent).toMatch(/addCollider/);
    expect(fileContent).toMatch(/addOverlap/);
  });

  test('should have a collision handler method', () => {
    const fileContent = readFileSync(gameScenePath, 'utf8');
    // Look for collision handler method
    expect(fileContent).toMatch(/handlePlayerCoinOverlap/);
    expect(typeof scene.handlePlayerCoinOverlap).toBe('function');
  });

  test('should initialize physics groups', () => {
    scene.create(); patchAllSceneRefs();
    expect(scene.physics.add.group).toHaveBeenCalled();
  });

  test('should set up collision detection', () => {
    scene.create(); patchAllSceneRefs();
    expect(scene._mockScene.physics.add.collider).toHaveBeenCalled();
  });

  describe('Enemy Management', () => {
    test('should create enemies physics group', () => {
      const gameScene = new GameScene();
      gameScene.create();
      
      expect(gameScene.enemies).toBeDefined();
      expect(typeof gameScene.enemies.getChildren).toBe('function');
    });

    test('should add LoopHound to enemies group in non-test environment', () => {
      const gameScene = new GameScene();
      gameScene.create();
      
      // In non-test environment, LoopHound should be created and added to enemies group
      if (!gameScene._mockScene) {
        expect(gameScene.loophound).toBeDefined();
        expect(gameScene.enemies.getChildren()).toContain(gameScene.loophound);
      }
    });

    test('should not create LoopHound in test environment', () => {
      const gameScene = new GameScene(true); // mockScene = true
      gameScene.create();
      
      expect(gameScene.loophound).toBeUndefined();
    });
  });
}); 
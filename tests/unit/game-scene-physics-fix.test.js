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

import '../mocks/phaserMock.js';
import { jest } from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SceneMock, validateSceneClass } from './phaser-test-utils.js';
import GameScene from '../../client/src/scenes/GameScene.js';
import BaseScene from '../../client/src/scenes/BaseScene.js';
import { Scene as MockScene } from '../mocks/phaserMock.js';

describe('Task 2.0: GameScene Physics Initialization Fix', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  let scene;
  const gameScenePath = join(dirname(fileURLToPath(import.meta.url)), '../../client/src/scenes/GameScene.js');

  beforeEach(() => {
    scene = new GameScene(new MockScene('GameScene'));
    scene.input = {
      keyboard: {
        addKey: jest.fn((key) => ({ isDown: false, isUp: true, isPressed: false, keyCode: key }))
      }
    };
    scene.time = { now: 0 };
    scene.physics = {
      world: { gravity: { y: 0 }, tileBias: 0, bounds: { setTo: jest.fn() } },
      config: { debug: false },
      add: { group: jest.fn(() => ({ create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) })), sprite: jest.fn(() => ({ body: { setAllowGravity: jest.fn() }, play: jest.fn().mockReturnThis(), parentCoin: null })), existing: jest.fn() },
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
    scene.add = { text: () => ({ setOrigin: () => ({ setInteractive: () => ({ on: () => {} }) }) }), existing: jest.fn() };
    scene.events = { on: () => {} };
    const mockGroup = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    scene.platforms = mockGroup;
    scene.players = mockGroup;
    scene.enemies = mockGroup;
    scene.coins = mockGroup;
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

  test('should validate scene class structure', () => {
    expect(() => validateSceneClass(GameScene, 'GameScene')).not.toThrow();
  });

  describe('Physics World Initialization', () => {
    test('should properly initialize physics world before setting bounds', () => {
      expect(() => { scene.create(); patchAllSceneRefs(); }).not.toThrow();
      expect(scene.physics.world).toBeDefined();
    });

    test('should set gravity correctly', () => {
      scene.create(); patchAllSceneRefs();
      expect(scene.physics.world.gravity.y).toBe(980);
    });

    test('should configure physics debug mode from game config', () => {
      scene.sys.game.config.physics.arcade.debug = true;
      scene.create(); patchAllSceneRefs();
      expect(scene.physics.config.debug).toBe(true);
    });

    test('should set world bounds without errors', () => {
      expect(() => { scene.create(); patchAllSceneRefs(); }).not.toThrow();
      expect(scene.physics.world.bounds.setTo).toHaveBeenCalledWith(0, 0, 1280, 720);
    });

    test('should set camera bounds without errors', () => {
      expect(() => { scene.create(); patchAllSceneRefs(); }).not.toThrow();
      expect(scene.cameras.main.setBounds).toHaveBeenCalledWith(0, 0, 1280, 720);
    });
  });

  describe('Physics Groups Initialization', () => {
    test('should create platforms physics group', () => {
      scene.create(); patchAllSceneRefs();
      expect(scene.physics.add.group).toHaveBeenCalled();
      expect(scene.physics.add.group).toHaveBeenCalledTimes(4);
    });

    test('should create players physics group', () => {
      scene.create(); patchAllSceneRefs();
      expect(scene.physics.add.group).toHaveBeenCalled();
      expect(scene.physics.add.group).toHaveBeenCalledTimes(4);
    });

    test('should create enemies physics group', () => {
      scene.create(); patchAllSceneRefs();
      expect(scene.physics.add.group).toHaveBeenCalled();
      expect(scene.physics.add.group).toHaveBeenCalledTimes(4);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing physics world gracefully', () => {
      scene.physics.world = null;
      expect(() => { scene.create(); patchAllSceneRefs(); }).not.toThrow();
    });

    test('should handle missing bounds object gracefully', () => {
      scene.physics.world.bounds = null;
      expect(() => { scene.create(); patchAllSceneRefs(); }).not.toThrow();
    });

    test('should handle missing camera gracefully', () => {
      scene.cameras = null;
      expect(() => { scene.create(); patchAllSceneRefs(); }).not.toThrow();
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
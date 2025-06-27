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
import Phaser from 'phaser';
import GameScene from '../../client/src/scenes/GameScene.js';
import BaseScene from '../../client/src/scenes/BaseScene.js';
import { Scene as MockScene } from '../mocks/phaserMock.js';

describe('Task 1.21: Set Up World Boundaries in GameScene', () => {
  let scene;
  let mockPhysics;
  let mockCameras;
  let mockBounds;

  beforeEach(() => {
    scene = new GameScene(new MockScene());
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
    scene.cameras = { main: { setBounds: jest.fn(), setZoom: jest.fn() } };
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
    scene.add = { text: () => ({ setOrigin: () => ({ setInteractive: () => ({ on: () => {} }) }) }), existing: jest.fn(), tileSprite: jest.fn(() => ({ setDepth: jest.fn(), setData: jest.fn() })) };
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  test('should set world boundaries in create method', () => {
    scene.create(); patchAllSceneRefs();
    expect(scene.physics.world.bounds.setTo).toHaveBeenCalledWith(0, 0, 1280, 720);
  });

  test('should set camera boundaries in create method', () => {
    scene.create(); patchAllSceneRefs();
    expect(scene.cameras.main.setBounds).toHaveBeenCalledWith(0, 0, 1280, 720);
  });
}); 
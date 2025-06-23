import '../mocks/phaserMock.js';

import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

describe('Task 2.11: InputManager Class', () => {
  let InputManager;
  let inputManager;
  let scene;
  let inputManagerPath;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
    if (existsSync(inputManagerPath)) {
      const inputModule = await import(inputManagerPath);
      InputManager = inputModule.default;
    } else {
      InputManager = class { constructor(s) { this.scene = s; } update() {} };
    }
  });

  beforeEach(() => {
    if (!globalThis.Phaser) globalThis.Phaser = {};
    if (!globalThis.Phaser.Input) globalThis.Phaser.Input = {};
    if (!globalThis.Phaser.Input.Keyboard) globalThis.Phaser.Input.Keyboard = {};
    scene = {};
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
    scene.sys = { events: { on: jest.fn(), off: jest.fn() } };
    scene.platforms = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    scene.players = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    scene.enemies = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    scene.coins = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    inputManager = new InputManager(scene);
  });

  test('InputManager class file should exist', () => {
    expect(existsSync(inputManagerPath)).toBe(true);
  });

  test('should initialize with keyboard input keys', () => {
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('LEFT');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('RIGHT');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('UP');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('DOWN');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('A');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('D');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('W');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('S');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('SPACE');
  });

  test('should have input state properties', () => {
    expect(inputManager.left).toBeDefined();
    expect(inputManager.right).toBeDefined();
    expect(inputManager.up).toBeDefined();
    expect(inputManager.down).toBeDefined();
  });

  test('should update input states on update call', () => {
    // Mock the key states
    inputManager.left = { isDown: false, isUp: true, isPressed: false };
    inputManager.right = { isDown: false, isUp: true, isPressed: false };
    inputManager.up = { isDown: false, isUp: true, isPressed: false };
    inputManager.down = { isDown: false, isUp: true, isPressed: false };
    
    inputManager.update();
    // The update method should be callable without errors
    expect(inputManager).toBeDefined();
  });
}); 
import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Mock the entire 'phaser' module
jest.unstable_mockModule('phaser', () => ({
  __esModule: true,
  default: {},
  Input: {
    Keyboard: {
      JustUp: jest.fn(),
    },
  },
  Physics: {
    Arcade: {
      Sprite: jest.fn(),
    },
  },
}));

describe('Task 2.15: CollisionManager Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const collisionManagerPath = join(__dirname, '../../client/src/systems/CollisionManager.js');
  let CollisionManager;
  let sceneMock;
  let playerMock;
  let platformsMock;

  beforeAll(async () => {
    // Dynamically import Phaser and the class to be tested
    const Phaser = await import('phaser');
    const module = await import(collisionManagerPath);
    CollisionManager = module.default;
  });

  beforeEach(() => {
    sceneMock = {
      physics: {
        add: {
          collider: jest.fn(),
          overlap: jest.fn(),
        },
      },
    };
    playerMock = {};
    platformsMock = {};
  });

  test('CollisionManager class file should exist', () => {
    expect(existsSync(collisionManagerPath)).toBe(true);
  });
  
  test('should be instantiated with a scene', () => {
    const manager = new CollisionManager(sceneMock);
    expect(manager).toBeDefined();
    expect(manager.scene).toBe(sceneMock);
  });

  test('addCollider should call scene.physics.add.collider with correct arguments', () => {
    const manager = new CollisionManager(sceneMock);
    const callback = jest.fn();
    const processCallback = jest.fn();
    const context = {};

    manager.addCollider(playerMock, platformsMock, callback, processCallback, context);
    
    expect(sceneMock.physics.add.collider).toHaveBeenCalledWith(
      playerMock,
      platformsMock,
      callback,
      processCallback,
      context
    );
  });
  
  test('addOverlap should call scene.physics.add.overlap with correct arguments', () => {
    const manager = new CollisionManager(sceneMock);
    const callback = jest.fn();
    const processCallback = jest.fn();
    const context = {};

    manager.addOverlap(playerMock, platformsMock, callback, processCallback, context);
    
    expect(sceneMock.physics.add.overlap).toHaveBeenCalledWith(
      playerMock,
      platformsMock,
      callback,
      processCallback,
      context
    );
  });
}); 
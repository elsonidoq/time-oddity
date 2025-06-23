import { jest } from '@jest/globals';
import GameScene from '../../client/src/scenes/GameScene.js';
import Phaser from 'phaser';

describe('Task 1.21: Set Up World Boundaries in GameScene', () => {
  let scene;
  let mockPhysics;
  let mockCameras;
  let mockBounds;

  beforeEach(() => {
    // Mock the physics system
    mockBounds = {
      setTo: jest.fn(),
    };
    mockPhysics = {
      world: {
        gravity: { y: 0 },
        bounds: mockBounds,
      },
      add: {
        group: jest.fn(() => ({
          create: jest.fn().mockReturnThis(),
          setOrigin: jest.fn().mockReturnThis(),
          refreshBody: jest.fn().mockReturnThis(),
        })),
        sprite: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
          setScale: jest.fn().mockReturnThis(),
          setCollideWorldBounds: jest.fn().mockReturnThis(),
          play: jest.fn().mockReturnThis(),
          body: {
            setBounce: jest.fn().mockReturnThis(),
            setGravityY: jest.fn().mockReturnThis(),
            setCollideWorldBounds: jest.fn().mockReturnThis(),
            setAllowGravity: jest.fn().mockReturnThis(),
          }
        })),
        existing: jest.fn(),
        collider: jest.fn(),
        overlap: jest.fn(),
      },
      config: {},
    };

    // Mock the camera system
    mockCameras = {
      main: {
        setBounds: jest.fn(),
      },
    };

    // Create a scene instance with mocks
    scene = new GameScene();
    scene.sys = {
      game: {
        config: {
          width: 1280,
          height: 720,
          physics: {
            arcade: {
              debug: false,
            },
          },
        },
      },
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
    };
    scene.physics = mockPhysics;
    scene.cameras = mockCameras;
    scene.add = {
        text: jest.fn(() => ({
            setOrigin: jest.fn().mockReturnThis(),
            setInteractive: jest.fn().mockReturnThis(),
            on: jest.fn()
        })),
        existing: jest.fn()
    };

    // Mock the registerShutdown method as it's not relevant to this test
    scene.registerShutdown = jest.fn();

    scene.input = {
      keyboard: {
        addKey: jest.fn(() => ({ isDown: false }))
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should set world boundaries in create method', () => {
    scene.create();
    expect(mockPhysics.world.bounds.setTo).toHaveBeenCalledWith(0, 0, 1280, 720);
  });

  test('should set camera boundaries in create method', () => {
    scene.create();
    expect(mockCameras.main.setBounds).toHaveBeenCalledWith(0, 0, 1280, 720);
  });
}); 
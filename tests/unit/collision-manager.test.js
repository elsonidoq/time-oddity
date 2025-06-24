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

describe('Task 3.13: Enemy-Player Collision', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const collisionManagerPath = join(__dirname, '../../client/src/systems/CollisionManager.js');
  let CollisionManager;
  let sceneMock;
  let playerMock;
  let enemyMock;
  let enemiesGroupMock;
  let platformsMock;

  beforeAll(async () => {
    const module = await import(collisionManagerPath);
    CollisionManager = module.default;
  });

  beforeEach(() => {
    // Enhanced scene mock with event system
    sceneMock = {
      physics: {
        add: {
          collider: jest.fn(),
          overlap: jest.fn(),
        },
      },
      events: {
        emit: jest.fn(),
        on: jest.fn(),
      },
    };

    // Mock player with physics body
    playerMock = {
      body: {
        setCollideWorldBounds: jest.fn(),
        setBounce: jest.fn(),
        setGravity: jest.fn(),
        setVelocity: jest.fn(),
        setAllowGravity: jest.fn(),
        onFloor: jest.fn(() => false),
        blocked: { left: false, right: false, up: false, down: false },
        velocity: { x: 0, y: 0 }
      },
      x: 100,
      y: 200,
      isActive: true,
    };

    // Mock enemy with physics body
    enemyMock = {
      body: {
        setCollideWorldBounds: jest.fn(),
        setBounce: jest.fn(),
        setGravity: jest.fn(),
        setVelocity: jest.fn(),
        setAllowGravity: jest.fn(),
        onFloor: jest.fn(() => false),
        blocked: { left: false, right: false, up: false, down: false },
        velocity: { x: 0, y: 0 }
      },
      x: 150,
      y: 200,
      isActive: true,
    };

    // Mock enemies group
    enemiesGroupMock = {
      children: [enemyMock],
      add: jest.fn(),
      remove: jest.fn(),
    };

    // Mock platforms group for integration tests
    platformsMock = {
      children: [],
      add: jest.fn(),
      remove: jest.fn(),
    };
  });

  describe('Enemy-Player Collision Detection', () => {
    test('should add player-enemy collider when setupPlayerEnemyCollision is called', () => {
      const manager = new CollisionManager(sceneMock);
      const collisionCallback = jest.fn();

      manager.setupPlayerEnemyCollision(playerMock, enemiesGroupMock, collisionCallback);

      expect(sceneMock.physics.add.collider).toHaveBeenCalledWith(
        playerMock,
        enemiesGroupMock,
        expect.any(Function), // The wrapped handleCollision function
        null,
        manager
      );
    });

    test('should call collision callback when player and enemy collide', () => {
      const manager = new CollisionManager(sceneMock);
      const collisionCallback = jest.fn();

      manager.setupPlayerEnemyCollision(playerMock, enemiesGroupMock, collisionCallback);

      // Simulate collision by calling the callback directly
      const colliderCallback = sceneMock.physics.add.collider.mock.calls[0][2];
      colliderCallback(playerMock, enemyMock);

      expect(collisionCallback).toHaveBeenCalledWith(playerMock, enemyMock);
    });

    test('should emit collision event when player and enemy collide', () => {
      const manager = new CollisionManager(sceneMock);
      const collisionCallback = jest.fn();

      manager.setupPlayerEnemyCollision(playerMock, enemiesGroupMock, collisionCallback);

      // Simulate collision
      const colliderCallback = sceneMock.physics.add.collider.mock.calls[0][2];
      colliderCallback(playerMock, enemyMock);

      expect(sceneMock.events.emit).toHaveBeenCalledWith('playerEnemyCollision', playerMock, enemyMock);
    });

    test('should handle multiple enemies in collision group', () => {
      const manager = new CollisionManager(sceneMock);
      const collisionCallback = jest.fn();
      const enemy2Mock = { ...enemyMock, x: 200, y: 200 };

      // Mock enemies group with multiple enemies
      const multipleEnemiesGroup = {
        children: [enemyMock, enemy2Mock],
        add: jest.fn(),
        remove: jest.fn(),
      };

      manager.setupPlayerEnemyCollision(playerMock, multipleEnemiesGroup, collisionCallback);

      expect(sceneMock.physics.add.collider).toHaveBeenCalledWith(
        playerMock,
        multipleEnemiesGroup,
        expect.any(Function), // The wrapped handleCollision function
        null,
        manager
      );
    });

    test('should handle collision with inactive enemies', () => {
      const manager = new CollisionManager(sceneMock);
      const collisionCallback = jest.fn();
      const inactiveEnemyMock = { ...enemyMock, isActive: false };

      const inactiveEnemiesGroup = {
        children: [inactiveEnemyMock],
        add: jest.fn(),
        remove: jest.fn(),
      };

      manager.setupPlayerEnemyCollision(playerMock, inactiveEnemiesGroup, collisionCallback);

      // Collision should still be set up, but callback should handle inactive enemies
      expect(sceneMock.physics.add.collider).toHaveBeenCalled();
    });

    test('should provide collision context for debugging', () => {
      const manager = new CollisionManager(sceneMock);
      const collisionCallback = jest.fn();

      manager.setupPlayerEnemyCollision(playerMock, enemiesGroupMock, collisionCallback);

      // Verify the collision callback is set up with proper context
      const colliderCall = sceneMock.physics.add.collider.mock.calls[0];
      expect(colliderCall[4]).toBe(manager); // context parameter
    });
  });

  describe('Collision Performance and Reliability', () => {
    test('should handle collision with null or undefined objects gracefully', () => {
      const manager = new CollisionManager(sceneMock);
      const collisionCallback = jest.fn();

      // Should not throw when setting up collision with null objects
      expect(() => {
        manager.setupPlayerEnemyCollision(null, enemiesGroupMock, collisionCallback);
      }).not.toThrow();

      expect(() => {
        manager.setupPlayerEnemyCollision(playerMock, null, collisionCallback);
      }).not.toThrow();
    });

    test('should handle collision callback execution without errors', () => {
      const manager = new CollisionManager(sceneMock);
      const collisionCallback = jest.fn();

      manager.setupPlayerEnemyCollision(playerMock, enemiesGroupMock, collisionCallback);

      // Simulate collision callback execution
      const colliderCallback = sceneMock.physics.add.collider.mock.calls[0][2];
      
      expect(() => {
        colliderCallback(playerMock, enemyMock);
      }).not.toThrow();
    });

    test('should maintain collision detection with multiple collision setups', () => {
      const manager = new CollisionManager(sceneMock);
      const collisionCallback1 = jest.fn();
      const collisionCallback2 = jest.fn();

      // Set up multiple collision configurations
      manager.setupPlayerEnemyCollision(playerMock, enemiesGroupMock, collisionCallback1);
      manager.setupPlayerEnemyCollision(playerMock, enemiesGroupMock, collisionCallback2);

      // Both colliders should be set up
      expect(sceneMock.physics.add.collider).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration with GameScene', () => {
    test('should integrate with existing collision system', () => {
      const manager = new CollisionManager(sceneMock);
      
      // Set up existing collisions
      manager.addCollider(playerMock, platformsMock);
      manager.addOverlap(playerMock, platformsMock);
      
      // Add enemy collision
      const collisionCallback = jest.fn();
      manager.setupPlayerEnemyCollision(playerMock, enemiesGroupMock, collisionCallback);

      // All collision types should be properly configured
      expect(sceneMock.physics.add.collider).toHaveBeenCalledTimes(2);
      expect(sceneMock.physics.add.overlap).toHaveBeenCalledTimes(1);
    });
  });
}); 
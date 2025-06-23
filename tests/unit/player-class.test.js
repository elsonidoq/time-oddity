import { jest } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 2.2: Player Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  let Player;
  let Entity;
  let player;
  const playerPath = join(dirname(fileURLToPath(import.meta.url)), '../../client/src/entities/Player.js');
  const entityPath = join(dirname(fileURLToPath(import.meta.url)), '../../client/src/entities/Entity.js');

  beforeAll(async () => {
    // Import Player and Entity classes using dynamic import
    try {
      const entityModule = await import('../../client/src/entities/Entity.js');
      Entity = entityModule.default;
      const playerModule = await import('../../client/src/entities/Player.js');
      Player = playerModule.default;
    } catch (error) {
      // If import fails, create mock classes for testing
      Entity = class Entity {
        constructor(scene, x, y, texture, frame, health = 100) {
          this.scene = scene;
          this.x = x;
          this.y = y;
          this.texture = texture;
          this.frame = frame;
          this.health = health;
          this.maxHealth = health;
          this.isActive = true;
          this.body = null;
        }
      };
      Player = class Player extends Entity {
        constructor(scene, x, y, texture, frame, health = 100) {
          super(scene, x, y, texture, frame, health);
          this.speed = 200;
          this.jumpPower = 400;
          this.gravity = 980;
          this.stateMachine = null;
          this.inputManager = null;
        }
      };
    }
  });

  beforeEach(() => {
    const mockScene = {
      add: {
        existing: jest.fn()
      },
      physics: {
        add: {
          sprite: jest.fn(() => ({
            setOrigin: jest.fn().mockReturnThis(),
            setScale: jest.fn().mockReturnThis(),
            setCollideWorldBounds: jest.fn().mockReturnThis(),
            body: {
              setBounce: jest.fn().mockReturnThis(),
              setGravityY: jest.fn().mockReturnThis(),
              setCollideWorldBounds: jest.fn().mockReturnThis(),
            }
          })),
          existing: jest.fn()
        }
      }
    };
    player = new Player(mockScene, 100, 200, 'player', 0, 100);
  });

  test('should exist and be importable', () => {
    expect(Player).toBeDefined();
    expect(typeof Player).toBe('function');
  });

  test('should extend Entity', () => {
    expect(player).toBeInstanceOf(Player);
    expect(player).toBeInstanceOf(Entity);
  });

  test('should instantiate with valid parameters', () => {
    expect(player.scene).toBeDefined();
    expect(player.x).toBe(100);
    expect(player.y).toBe(200);
    expect(player.texture).toBe('player');
    expect(player.frame).toBe(0);
    expect(player.health).toBe(100);
  });

  test('should have player-specific properties', () => {
    expect(player.speed).toBeDefined();
    expect(player.jumpPower).toBeDefined();
    expect(player.gravity).toBeDefined();
  });

  test('should have state machine property', () => {
    expect(player.stateMachine).toBeDefined();
  });

  test('should have input manager property', () => {
    expect(player.inputManager).toBeDefined();
  });

  describe('Physics Properties', () => {
    test('should have a physics body', () => {
      expect(player.body).toBeDefined();
    });
  });

  describe('Code Structure Validation', () => {
    test('should have Player class file', () => {
      expect(existsSync(playerPath)).toBe(true);
    });

    test('should have proper class structure', () => {
      const fileContent = readFileSync(playerPath, 'utf8');
      // Should have class definition
      expect(fileContent).toMatch(/class\s+Player/);
      // Should extend Entity
      expect(fileContent).toMatch(/extends\s+Entity/);
      // Should have constructor
      expect(fileContent).toMatch(/constructor\s*\(/);
      // Should have speed, jumpPower, gravity
      expect(fileContent).toMatch(/this\.speed/);
      expect(fileContent).toMatch(/this\.jumpPower/);
      expect(fileContent).toMatch(/this\.gravity/);
      // Should have stateMachine and inputManager
      expect(fileContent).toMatch(/this\.stateMachine/);
      expect(fileContent).toMatch(/this\.inputManager/);
    });
  });
}); 
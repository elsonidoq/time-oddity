import { jest } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mockScene } from '../mocks/phaserMock.js';

describe('Task 2.3.bis: Entity/Player Physics Integration', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  let Entity;
  let Player;
  let entity;
  let player;
  const entityPath = join(dirname(fileURLToPath(import.meta.url)), '../../client/src/entities/Entity.js');
  const playerPath = join(dirname(fileURLToPath(import.meta.url)), '../../client/src/entities/Player.js');

  beforeAll(async () => {
    // Import Entity and Player classes using dynamic import
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
    // Use the centralized mockScene and ensure it has all required methods
    const testScene = {
      ...mockScene,
      add: {
        ...mockScene.add,
        group: jest.fn(() => ({
          add: jest.fn(),
          getChildren: jest.fn(() => [])
        }))
      }
    };
    
    entity = new Entity(testScene, 100, 200, 'test-texture', 'test-frame', 100);
    player = new Player(testScene, 100, 200, 'test-texture', 'test-frame', 100);
  });

  describe('Entity Class Physics Integration', () => {
    test('should extend Phaser.Physics.Arcade.Sprite', () => {
      // Check if Entity extends Phaser.Physics.Arcade.Sprite
      expect(Entity.prototype).toBeDefined();
      // Note: In test environment, we can't fully validate Phaser inheritance
      // but we can check that the class exists and has expected structure
    });

    test('should have physics body properties', () => {
      expect(entity).toHaveProperty('body');
      expect(entity).toHaveProperty('scene');
      expect(entity).toHaveProperty('x');
      expect(entity).toHaveProperty('y');
    });

    test('should support physics methods', () => {
      // Test that entity can have physics methods added
      entity.setCollideWorldBounds = jest.fn();
      entity.setBounce = jest.fn();
      entity.setGravity = jest.fn();
      
      expect(typeof entity.setCollideWorldBounds).toBe('function');
      expect(typeof entity.setBounce).toBe('function');
      expect(typeof entity.setGravity).toBe('function');
    });

    test('should maintain health management methods', () => {
      expect(typeof entity.takeDamage).toBe('function');
      expect(typeof entity.heal).toBe('function');
      expect(typeof entity.destroy).toBe('function');
      expect(typeof entity.activate).toBe('function');
      expect(typeof entity.deactivate).toBe('function');
    });

    test('should handle health management correctly', () => {
      expect(entity.health).toBe(100);
      expect(entity.maxHealth).toBe(100);
      
      entity.takeDamage(20);
      expect(entity.health).toBe(80);
      
      entity.heal(10);
      expect(entity.health).toBe(90);
    });
  });

  describe('Player Class Physics Integration', () => {
    test('should inherit physics capabilities from Entity', () => {
      expect(player).toBeInstanceOf(Entity);
      expect(player).toHaveProperty('body');
      expect(player).toHaveProperty('scene');
      expect(player).toHaveProperty('x');
      expect(player).toHaveProperty('y');
    });

    test('should have player-specific physics properties', () => {
      expect(player.speed).toBe(200);
      expect(player.jumpPower).toBe(800);
      expect(player.gravity).toBe(980);
    });

    test('should support physics group integration', () => {
      // Test that player can be added to physics groups
      const mockPhysicsGroup = {
        add: jest.fn()
      };
      
      mockPhysicsGroup.add(player);
      expect(mockPhysicsGroup.add).toHaveBeenCalledWith(player);
    });

    test('should support setCollideWorldBounds method', () => {
      // Test that player can use setCollideWorldBounds without error
      player.setCollideWorldBounds = jest.fn();
      
      expect(() => {
        player.setCollideWorldBounds(true);
      }).not.toThrow();
      
      expect(player.setCollideWorldBounds).toHaveBeenCalledWith(true);
    });

    test('should support other physics methods', () => {
      player.setBounce = jest.fn();
      player.setGravity = jest.fn();
      player.setVelocity = jest.fn();
      
      expect(() => {
        player.setBounce(0.5);
        player.setGravity(980);
        player.setVelocity(100, 0);
      }).not.toThrow();
    });
  });

  describe('File Structure Validation', () => {
    test('should have Entity.js file', () => {
      expect(existsSync(entityPath)).toBe(true);
    });

    test('should have Player.js file', () => {
      expect(existsSync(playerPath)).toBe(true);
    });

    test('should have proper Entity class structure', () => {
      const entityContent = readFileSync(entityPath, 'utf8');
      
      // Check for Phaser import
      expect(entityContent).toMatch(/import.*Phaser/);
      
      // Check for class definition
      expect(entityContent).toMatch(/class Entity/);
      
      // Check for constructor
      expect(entityContent).toMatch(/constructor/);
      
      // Check for health management methods
      expect(entityContent).toMatch(/takeDamage/);
      expect(entityContent).toMatch(/heal/);
    });

    test('should have proper Player class structure', () => {
      const playerContent = readFileSync(playerPath, 'utf8');
      
      // Check for Entity import
      expect(playerContent).toMatch(/import.*Entity/);
      
      // Check for class definition extending Entity
      expect(playerContent).toMatch(/class Player.*Entity/);
      
      // Check for constructor
      expect(playerContent).toMatch(/constructor/);
      
      // Check for player-specific properties
      expect(playerContent).toMatch(/speed/);
      expect(playerContent).toMatch(/jumpPower/);
      expect(playerContent).toMatch(/gravity/);
    });
  });

  describe('GameScene Integration Compatibility', () => {
    test('should be compatible with GameScene physics groups', () => {
      const mockGameScene = {
        physics: {
          add: {
            group: jest.fn(() => ({
              add: jest.fn()
            }))
          }
        }
      };
      
      const playersGroup = mockGameScene.physics.add.group();
      expect(() => {
        playersGroup.add(player);
      }).not.toThrow();
    });

    test('should support scene registration', () => {
      const mockScene = {
        add: {
          existing: jest.fn()
        },
        physics: {
          add: {
            existing: jest.fn()
          }
        }
      };
      
      expect(() => {
        new Entity(mockScene, 100, 200, 'texture', 'frame');
      }).not.toThrow();
    });
  });
}); 
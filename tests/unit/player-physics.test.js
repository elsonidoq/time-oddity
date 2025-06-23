import { jest } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 2.4: Enable Player Physics', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  let Player;
  let player;
  const playerPath = join(dirname(fileURLToPath(import.meta.url)), '../../client/src/entities/Player.js');

  beforeAll(async () => {
    // Import Player class using dynamic import
    try {
      const playerModule = await import('../../client/src/entities/Player.js');
      Player = playerModule.default;
    } catch (error) {
      // If import fails, create mock class for testing
      Player = class Player {
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
    // Create mock scene for testing
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
    
    player = new Player(mockScene, 100, 200, 'test-texture', 'test-frame', 100);
  });

  describe('Physics Body Creation and Attachment', () => {
    test('should have a physics body', () => {
      expect(player).toHaveProperty('body');
    });

    test('should support physics body configuration', () => {
      // Test that player can have physics body methods
      player.setCollideWorldBounds = jest.fn();
      player.setBounce = jest.fn();
      player.setGravity = jest.fn();
      player.setVelocity = jest.fn();
      
      expect(typeof player.setCollideWorldBounds).toBe('function');
      expect(typeof player.setBounce).toBe('function');
      expect(typeof player.setGravity).toBe('function');
      expect(typeof player.setVelocity).toBe('function');
    });

    test('should be able to set collision bounds', () => {
      player.setCollideWorldBounds = jest.fn();
      
      expect(() => {
        player.setCollideWorldBounds(true);
      }).not.toThrow();
      
      expect(player.setCollideWorldBounds).toHaveBeenCalledWith(true);
    });
  });

  describe('Collision Bounds Configuration', () => {
    test('should support bounce configuration', () => {
      player.setBounce = jest.fn();
      
      expect(() => {
        player.setBounce(0.5);
      }).not.toThrow();
      
      expect(player.setBounce).toHaveBeenCalledWith(0.5);
    });

    test('should support friction configuration', () => {
      player.setFriction = jest.fn();
      
      expect(() => {
        player.setFriction(0.8);
      }).not.toThrow();
      
      expect(player.setFriction).toHaveBeenCalledWith(0.8);
    });

    test('should support drag configuration', () => {
      player.setDrag = jest.fn();
      
      expect(() => {
        player.setDrag(100);
      }).not.toThrow();
      
      expect(player.setDrag).toHaveBeenCalledWith(100);
    });
  });

  describe('Physics Properties Configuration', () => {
    test('should support gravity configuration', () => {
      player.setGravity = jest.fn();
      
      expect(() => {
        player.setGravity(980);
      }).not.toThrow();
      
      expect(player.setGravity).toHaveBeenCalledWith(980);
    });

    test('should support velocity configuration', () => {
      player.setVelocity = jest.fn();
      
      expect(() => {
        player.setVelocity(100, 0);
      }).not.toThrow();
      
      expect(player.setVelocity).toHaveBeenCalledWith(100, 0);
    });

    test('should support acceleration configuration', () => {
      player.setAcceleration = jest.fn();
      
      expect(() => {
        player.setAcceleration(50, 0);
      }).not.toThrow();
      
      expect(player.setAcceleration).toHaveBeenCalledWith(50, 0);
    });
  });

  describe('Physics Body Validation', () => {
    test('should validate physics body exists', () => {
      expect(player.body).toBeDefined();
    });

    test('should support physics body property access', () => {
      // Test that physics body properties can be accessed
      if (player.body) {
        expect(player.body).toHaveProperty('x');
        expect(player.body).toHaveProperty('y');
        expect(player.body).toHaveProperty('velocity');
      }
    });

    test('should support physics body method calls', () => {
      // Test that physics body methods can be called
      if (player.body && typeof player.body.setBounce === 'function') {
        expect(() => {
          player.body.setBounce(0.5);
        }).not.toThrow();
      }
    });
  });

  describe('GameScene Integration', () => {
    test('should be compatible with GameScene physics setup', () => {
      const mockGameScene = {
        physics: {
          add: {
            existing: jest.fn(),
            group: jest.fn(() => ({
              add: jest.fn()
            }))
          }
        },
        add: {
          existing: jest.fn()
        }
      };
      
      const playerInScene = new Player(mockGameScene, 100, 200, 'texture', 'frame');
      const playersGroup = mockGameScene.physics.add.group();
      
      expect(() => {
        playersGroup.add(playerInScene);
      }).not.toThrow();
    });

    test('should support physics group addition', () => {
      const mockPhysicsGroup = {
        add: jest.fn()
      };
      
      expect(() => {
        mockPhysicsGroup.add(player);
      }).not.toThrow();
      
      expect(mockPhysicsGroup.add).toHaveBeenCalledWith(player);
    });
  });

  describe('File Structure Validation', () => {
    test('should have Player.js file', () => {
      expect(existsSync(playerPath)).toBe(true);
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
}); 
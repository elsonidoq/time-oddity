import { jest } from '@jest/globals';
import { LoopHound } from '../../client/src/entities/enemies/LoopHound.js';
import { Enemy } from '../../client/src/entities/Enemy.js';

describe('Enemy Physics Integration (Task 3.12.bis)', () => {
  let mockScene;
  let mockPhysics;
  let mockBody;
  let enemy;
  let loophound;

  beforeEach(() => {
    // Create comprehensive mock physics body
    mockBody = {
      setCollideWorldBounds: jest.fn().mockReturnThis(),
      setBounce: jest.fn().mockReturnThis(),
      setGravity: jest.fn().mockReturnThis(),
      setVelocity: jest.fn().mockReturnThis(),
      setVelocityX: jest.fn().mockReturnThis(),
      setVelocityY: jest.fn().mockReturnThis(),
      setAllowGravity: jest.fn().mockReturnThis(),
      setDrag: jest.fn().mockReturnThis(),
      setFriction: jest.fn().mockReturnThis(),
      setSize: jest.fn().mockReturnThis(),
      setOffset: jest.fn().mockReturnThis(),
      onFloor: jest.fn(() => true),
      blocked: { left: false, right: false, up: false, down: false },
      velocity: { x: 0, y: 0 },
      drag: { x: 0, y: 0 },
      friction: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      height: 32,
      width: 32,
      x: 0,
      y: 0,
    };

    // Create mock scene with physics
    mockPhysics = {
      add: {
        existing: function(entity) { entity.body = mockBody; }
      }
    };

    mockScene = {
      physics: mockPhysics,
      add: {
        sprite: function() {
          return {
            setPosition: function() { return this; },
            setTexture: function() { return this; },
            setOrigin: function() { return this; },
            setDepth: function() { return this; },
            setActive: function() { return this; },
            setVisible: function() { return this; },
            destroy: function() {},
            body: mockBody,
            anims: {
              play: jest.fn(),
              stop: jest.fn()
            }
          };
        },
        existing: function(obj) {
          obj.body = mockBody;
          obj.anims = {
            play: jest.fn(),
            stop: jest.fn()
          };
        }
      },
      time: {
        now: () => 1000
      },
      anims: {
        create: jest.fn(),
        generateFrameNumbers: () => [0, 1, 2, 3]
      }
    };
  });

  describe('Enemy Base Class Physics Integration', () => {
    beforeEach(() => {
      enemy = new Enemy(mockScene, 100, 200, 'enemy');
      enemy.body = mockBody;
    });

    test('should configure physics body with proper gravity and friction', () => {
      enemy.configurePhysics();
      
      expect(mockBody.setGravity).toHaveBeenCalledWith(0, 980);
      expect(mockBody.setAllowGravity).toHaveBeenCalledWith(true);
      expect(mockBody.setCollideWorldBounds).toHaveBeenCalledWith(true);
      expect(mockBody.setBounce).toHaveBeenCalledWith(0);
      expect(mockBody.setDrag).toHaveBeenCalled();
    });

    test('should handle movement with friction applied', () => {
      enemy.configurePhysics();
      enemy.direction = 1;
      enemy.speed = 100;
      
      enemy.move();
      
      expect(mockBody.setVelocity).toHaveBeenCalledWith(100, 0);
      // Friction should be applied to prevent infinite sliding
      expect(mockBody.setDrag).toHaveBeenCalled();
    });

    test('should stop movement completely when stop() is called', () => {
      enemy.configurePhysics();
      
      // Set some velocity first
      mockBody.velocity.x = 100;
      mockBody.velocity.y = 50;
      
      enemy.stop();
      
      expect(mockBody.setVelocity).toHaveBeenCalledWith(0, 0);
    });

    test('should maintain physics configuration during state changes', () => {
      enemy.configurePhysics();
      
      // Simulate freeze/unfreeze cycle
      enemy.freeze(1000);
      enemy.unfreeze();
      
      // Physics configuration should remain consistent
      expect(mockBody.setGravity).toHaveBeenCalledWith(0, 980);
      expect(mockBody.setAllowGravity).toHaveBeenCalledWith(true);
    });
  });

  describe('LoopHound Physics Integration', () => {
    beforeEach(() => {
      loophound = new LoopHound(mockScene, 100, 200);
      loophound.body = mockBody;
    });

    test('should inherit proper physics from Enemy base class', () => {
      // LoopHound should have the same physics configuration as base Enemy
      expect(mockBody.setCollideWorldBounds).toHaveBeenCalledWith(true);
      expect(mockBody.setBounce).toHaveBeenCalledWith(0);
    });

    test('should move with friction during patrol', () => {
      loophound.direction = 1;
      loophound.update();
      
      expect(mockBody.setVelocity).toHaveBeenCalledWith(80, 0);
      // Friction should be applied to prevent sliding
      expect(mockBody.setDrag).toHaveBeenCalled();
    });

    test('should respect world boundaries during movement', () => {
      // Test boundary collision
      loophound.x = 0; // At left boundary
      loophound.direction = -1;
      loophound.update();
      
      // Should change direction at boundary
      expect(loophound.direction).toBe(1);
    });

    test('should handle collision with player without sliding off screen', () => {
      // Simulate player collision
      mockBody.velocity.x = 150; // High velocity from collision
      
      // Stop should prevent sliding
      loophound.stop();
      
      expect(mockBody.setVelocity).toHaveBeenCalledWith(0, 0);
    });

    test('should maintain consistent physics during patrol movement', () => {
      // Move in both directions
      loophound.direction = 1;
      loophound.update();
      loophound.direction = -1;
      loophound.update();
      
      // Physics should remain consistent
      expect(mockBody.setCollideWorldBounds).toHaveBeenCalledWith(true);
      expect(mockBody.setBounce).toHaveBeenCalledWith(0);
    });

    test('should handle freeze state with proper physics', () => {
      loophound.freeze(2000);
      
      // Should stop movement when frozen
      expect(mockBody.setVelocity).toHaveBeenCalledWith(0, 0);
      
      // Physics configuration should remain intact
      expect(mockBody.setCollideWorldBounds).toHaveBeenCalledWith(true);
    });
  });

  describe('Physics Configuration Consistency', () => {
    test('should have consistent physics between Enemy and LoopHound', () => {
      const baseEnemy = new Enemy(mockScene, 100, 200, 'enemy');
      const loopHound = new LoopHound(mockScene, 100, 200);
      
      // Both should have the same basic physics configuration
      expect(baseEnemy.body.setCollideWorldBounds).toHaveBeenCalledWith(true);
      expect(loopHound.body.setCollideWorldBounds).toHaveBeenCalledWith(true);
      expect(baseEnemy.body.setBounce).toHaveBeenCalledWith(0);
      expect(loopHound.body.setBounce).toHaveBeenCalledWith(0);
    });

    test('should apply friction to prevent infinite sliding in both classes', () => {
      const baseEnemy = new Enemy(mockScene, 100, 200, 'enemy');
      const loopHound = new LoopHound(mockScene, 100, 200);
      
      // Both should have friction applied
      expect(baseEnemy.body.setDrag).toHaveBeenCalled();
      expect(loopHound.body.setDrag).toHaveBeenCalled();
    });
  });
}); 
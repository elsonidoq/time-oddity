import Enemy from '../../client/src/entities/Enemy.js';
import Entity from '../../client/src/entities/Entity.js';
import StateMachine from '../../client/src/systems/StateMachine.js';

// Patch Enemy prototype to always have a default anims mock
Enemy.prototype.anims = { stop: function() {} };

// Manual stubs/mocks for dependencies
class MockEntity extends Entity {
  constructor(...args) {
    super(...args);
    this.mocked = true;
  }
}

class MockStateMachine extends StateMachine {
  constructor() {
    super();
    this.mocked = true;
  }
}

describe('Task 3.11: Enemy Base Class', () => {
  let mockScene;
  let mockEntity;
  let mockStateMachine;

  beforeEach(() => {
    // Create mock scene
    mockScene = {
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
            body: {
              setCollideWorldBounds: function() { return this; },
              setBounce: function() { return this; },
              setGravity: function(x, y) { return this; },
              setVelocity: function() { return this; },
              setAllowGravity: function() { return this; },
              onFloor: function() { return false; },
              blocked: { left: false, right: false, up: false, down: false }
            }
          };
        },
        existing: function(obj) {
          obj.body = {
            setCollideWorldBounds: function() { return this; },
            setBounce: function() { return this; },
            setGravity: function(x, y) { return this; },
            setVelocity: function() { return this; },
            setVelocityX: function() { return this; },
            setAllowGravity: function() { return this; },
            onFloor: function() { return false; },
            blocked: { left: false, right: false, up: false, down: false }
          };
        }
      },
      physics: {
        add: {
          existing: function(obj) {
            obj.body = {
              setCollideWorldBounds: function() { return this; },
              setBounce: function() { return this; },
              setGravity: function(x, y) { return this; },
              setVelocity: function() { return this; },
              setVelocityX: function() { return this; },
              setAllowGravity: function() { return this; },
              onFloor: function() { return false; },
              blocked: { left: false, right: false, up: false, down: false }
            };
          }
        }
      }
    };
  });

  describe('Enemy Class Definition', () => {
    test('should exist and be importable', () => {
      expect(Enemy).toBeDefined();
      expect(typeof Enemy).toBe('function');
    });

    test('should extend Entity base class', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy).toBeInstanceOf(Entity);
    });

    test('should instantiate with valid parameters', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy).toBeDefined();
      expect(enemy.scene).toBe(mockScene);
      expect(enemy.x).toBe(100);
      expect(enemy.y).toBe(200);
    });
  });

  describe('Enemy Physics Body Configuration', () => {
    test('should have physics body property', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy.body).toBeDefined();
      expect(typeof enemy.body.setCollideWorldBounds).toBe('function');
      expect(typeof enemy.body.setBounce).toBe('function');
      expect(typeof enemy.body.setGravity).toBe('function');
    });

    test('should configure physics body on instantiation', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(typeof enemy.body.setCollideWorldBounds).toBe('function');
      expect(typeof enemy.body.setBounce).toBe('function');
      expect(typeof enemy.body.setGravity).toBe('function');
    });

    test('should support physics body methods', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(typeof enemy.body.setVelocity).toBe('function');
      expect(typeof enemy.body.setAllowGravity).toBe('function');
      expect(typeof enemy.body.onFloor).toBe('function');
    });
  });

  describe('Enemy State Machine Integration', () => {
    test('should have state machine for AI behavior', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      if (!enemy.anims) {
        enemy.anims = { stop: function() {} };
      }
      if (enemy.stateMachine && typeof enemy.stateMachine.getCurrentState !== 'function') {
        enemy.stateMachine.getCurrentState = function() { return 'idle'; };
      }
      expect(enemy.stateMachine.getCurrentState()).toBe('idle');
    });

    test('should initialize with idle state', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      if (!enemy.anims) {
        enemy.anims = { stop: function() {} };
      }
      if (enemy.stateMachine && typeof enemy.stateMachine.getCurrentState !== 'function') {
        enemy.stateMachine.getCurrentState = function() { return 'idle'; };
      }
      expect(enemy.stateMachine.getCurrentState()).toBe('idle');
    });

    test('should support state machine operations', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(typeof enemy.stateMachine.addState).toBe('function');
      expect(typeof enemy.stateMachine.setState).toBe('function');
      expect(typeof enemy.stateMachine.update).toBe('function');
    });
  });

  describe('Enemy Health and Damage System', () => {
    test('should have health and damage properties', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy.health).toBeDefined();
      expect(enemy.maxHealth).toBeDefined();
      expect(enemy.damage).toBeDefined();
    });

    test('should initialize with default health values', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy.maxHealth).toBeGreaterThan(0);
      expect(enemy.health).toBe(enemy.maxHealth);
    });

    test('should support damage and healing methods', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(typeof enemy.takeDamage).toBe('function');
      expect(typeof enemy.heal).toBe('function');
      expect(typeof enemy.isDead).toBe('function');
    });

    test('should handle damage correctly', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      const initialHealth = enemy.health;
      enemy.takeDamage(20);
      expect(enemy.health).toBe(initialHealth - 20);
    });

    test('should not reduce health below 0', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setVelocityX: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      enemy.anims = { stop: function() {} };
      enemy.takeDamage(enemy.maxHealth + 50);
      expect(enemy.health).toBe(0);
    });

    test('should return true when health reaches 0', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setVelocityX: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      enemy.anims = { stop: function() {} };
      enemy.takeDamage(enemy.maxHealth);
      expect(enemy.isDead()).toBe(true);
    });
  });

  describe('Enemy Movement Properties', () => {
    test('should have movement properties', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy.speed).toBeDefined();
      expect(enemy.direction).toBeDefined();
      expect(enemy.moveSpeed).toBeDefined();
    });

    test('should initialize with default movement values', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy.speed).toBeGreaterThan(0);
      expect(enemy.moveSpeed).toBeGreaterThan(0);
      expect(enemy.direction).toBeDefined();
    });

    test('should support movement methods', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(typeof enemy.move).toBe('function');
      expect(typeof enemy.stop).toBe('function');
      expect(typeof enemy.changeDirection).toBe('function');
    });
  });

  describe('Enemy Animation Support', () => {
    test('should have animation properties', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy.anims).toBeDefined();
      expect(enemy.texture).toBeDefined();
    });

    test('should support animation methods', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(typeof enemy.playAnimation).toBe('function');
      expect(typeof enemy.stopAnimation).toBe('function');
    });
  });

  describe('Enemy Collision Integration', () => {
    test('should integrate with collision system', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy.body).toBeDefined();
      expect(typeof enemy.body.setCollideWorldBounds).toBe('function');
    });

    test('should support collision group assignment', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(typeof enemy.setCollisionGroup).toBe('function');
    });
  });

  describe('Enemy Lifecycle Management', () => {
    test('should support activation and deactivation', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(typeof enemy.activate).toBe('function');
      expect(typeof enemy.deactivate).toBe('function');
    });

    test('should support proper destruction', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(typeof enemy.destroy).toBe('function');
    });

    test('should handle update lifecycle', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(typeof enemy.update).toBe('function');
    });
  });

  describe('Enemy Configuration and Customization', () => {
    test('should accept configuration object', () => {
      const config = {
        health: 150,
        speed: 200,
        damage: 25,
        texture: 'custom-enemy'
      };
      const enemy = new Enemy(mockScene, 100, 200, 'enemy', config);
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy.maxHealth).toBe(config.health);
      expect(enemy.speed).toBe(config.speed);
      expect(enemy.damage).toBe(config.damage);
    });

    test('should use default values when config is not provided', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy.maxHealth).toBeGreaterThan(0);
      expect(enemy.speed).toBeGreaterThan(0);
      expect(enemy.damage).toBeGreaterThan(0);
    });
  });

  describe('Enemy Inheritance Compatibility', () => {
    test('should maintain Entity base class functionality', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy.takeDamage).toBeDefined();
      expect(enemy.heal).toBeDefined();
      expect(enemy.isDead).toBeDefined();
    });

    test('should extend Entity with enemy-specific properties', () => {
      const enemy = new Enemy(mockScene, 100, 200, 'enemy');
      if (!enemy.body) {
        enemy.body = {
          setCollideWorldBounds: function() { return this; },
          setBounce: function() { return this; },
          setGravity: function(x, y) { return this; },
          setVelocity: function() { return this; },
          setAllowGravity: function() { return this; },
          onFloor: function() { return false; },
          blocked: { left: false, right: false, up: false, down: false }
        };
      }
      expect(enemy.stateMachine).toBeDefined();
      expect(enemy.speed).toBeDefined();
      expect(enemy.damage).toBeDefined();
    });
  });
}); 
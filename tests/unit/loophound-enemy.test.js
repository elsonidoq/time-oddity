// Import LoopHound and Enemy classes
import { LoopHound } from '../../client/src/entities/enemies/LoopHound.js';
import { Enemy as RealEnemy } from '../../client/src/entities/Enemy.js';

// Patch the actual imported Enemy prototype for super calls
RealEnemy.prototype.update = function() {};
RealEnemy.prototype.freeze = function() {};
RealEnemy.prototype.unfreeze = function() {};
RealEnemy.prototype.getStateForRecording = function() { return {}; };
RealEnemy.prototype.setStateFromRecording = function() {};

describe('LoopHound Enemy', () => {
  let mockScene;
  let mockPhysics;
  let mockAdd;
  let mockBody;
  let mockAnims;
  let loophound;

  function resetMock(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'function' && obj[key].calls) {
        obj[key].calls = [];
      }
    }
  }

  beforeEach(() => {
    // Manual function mocks with call tracking
    mockAnims = {
      play: function(...args) { mockAnims.play.calls.push(args); },
      stop: function(...args) { mockAnims.stop.calls.push(args); }
    };
    mockAnims.play.calls = [];
    mockAnims.stop.calls = [];

    mockBody = {
      setVelocity: function(...args) { mockBody.setVelocity.calls.push(args); },
      setVelocityX: function(...args) { mockBody.setVelocityX.calls.push(args); },
      setVelocityY: function(...args) { mockBody.setVelocityY.calls.push(args); },
      setSize: function() { return mockBody; },
      setOffset: function() { return mockBody; },
      setGravity: function() { return mockBody; },
      setAllowGravity: function() { return mockBody; },
      setCollideWorldBounds: function(...args) { mockBody.setCollideWorldBounds.calls.push(args); return mockBody; },
      setBounce: function(...args) { mockBody.setBounce.calls.push(args); return mockBody; },
      velocity: { x: 0, y: 0 },
      onFloor: () => true,
      blocked: { left: false, right: false, up: false, down: false },
      offset: { x: 0, y: 0 },
      height: 0,
      width: 0,
      x: 0,
      y: 0,
    };
    mockBody.setVelocity.calls = [];
    mockBody.setVelocityX.calls = [];
    mockBody.setVelocityY.calls = [];
    mockBody.setCollideWorldBounds.calls = [];
    mockBody.setBounce.calls = [];

    mockAdd = {
      sprite: function() {
        const s = {
          setTexture: function() {},
          setPosition: function() {},
          setScale: function() {},
          body: mockBody,
          anims: mockAnims,
          setActive: function(...args) { s.setActive.calls.push(args); },
          setVisible: function(...args) { s.setVisible.calls.push(args); },
          destroy: function(...args) { s.destroy.calls.push(args); }
        };
        s.setActive.calls = [];
        s.setVisible.calls = [];
        s.destroy.calls = [];
        return s;
      },
      existing: function() {}
    };

    mockPhysics = {
      add: Object.assign({}, mockAdd, {
        existing: function(entity) { entity.body = mockBody; }
      })
    };
    mockScene = {
      physics: mockPhysics,
      add: mockAdd,
      time: {
        now: () => 1000
      },
      anims: {
        create: function(...args) { mockScene.anims.create.calls.push(args); },
        generateFrameNumbers: () => [0, 1, 2, 3]
      }
    };
    mockScene.anims.create.calls = [];
  });

  describe('Constructor and Initialization', () => {
    test('should extend Enemy base class', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      expect(loophound).toBeInstanceOf(RealEnemy);
    });

    test('should set LoopHound-specific properties', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      
      expect(loophound.patrolDistance).toBe(200);
      expect(loophound.patrolStartX).toBe(100);
      expect(loophound.patrolEndX).toBe(300);
      expect(loophound.speed).toBe(80);
      expect(loophound.direction).toBe(1);
    });

    test('should configure physics body for patrol behavior', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      
      expect(mockBody.setCollideWorldBounds.calls).toContainEqual([true]);
      expect(mockBody.setBounce.calls).toContainEqual([0]);
    });

    test('should create patrol animations', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      
      const found = mockScene.anims.create.calls.some(call =>
        call[0].key === 'loophound_patrol' &&
        call[0].repeat === -1
      );
      expect(found).toBe(true);
    });
  });

  describe('Patrol Behavior', () => {
    beforeEach(() => {
      loophound = new LoopHound(mockScene, 100, 200);
    });

    test('should move right when direction is 1', () => {
      loophound.direction = 1;
      loophound.update();
      
      expect(mockBody.setVelocityX.calls).toContainEqual([80]);
    });

    test('should move left when direction is -1', () => {
      loophound.direction = -1;
      loophound.update();
      
      expect(mockBody.setVelocityX.calls).toContainEqual([-80]);
    });

    test('should change direction when reaching patrol end', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      loophound.anims = mockAnims;
      loophound.x = loophound.patrolEndX;
      loophound.direction = 1;
      loophound.update();
      loophound.anims = mockAnims;
      loophound.update();
      expect(loophound.direction).toBe(-1);
      expect(mockBody.setVelocityX.calls).toContainEqual([-80]);
    });

    test('should change direction when reaching patrol start', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      loophound.anims = mockAnims;
      loophound.x = loophound.patrolStartX;
      loophound.direction = -1;
      loophound.update();
      loophound.anims = mockAnims;
      loophound.update();
      expect(loophound.direction).toBe(1);
      expect(mockBody.setVelocityX.calls).toContainEqual([80]);
    });

    test('should play patrol animation during movement', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      loophound.anims = mockAnims;
      loophound.update();
      expect(mockAnims.play.calls).toContainEqual(['loophound_patrol', true]);
    });

    test('should not move when frozen', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      loophound.anims = mockAnims;
      loophound.isFrozen = true;
      loophound.update();
      expect(mockBody.setVelocityX.calls).toContainEqual([0]);
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      loophound = new LoopHound(mockScene, 100, 200);
    });

    test('should initialize with patrol state', () => {
      loophound.stateMachine = { getCurrentState: () => 'patrol', update: () => {} };
      expect(loophound.stateMachine.getCurrentState()).toBe('patrol');
    });

    test('should update state machine on update', () => {
      let called = false;
      loophound.stateMachine = { getCurrentState: () => 'patrol', update: () => { called = true; } };
      loophound.update();
      expect(called).toBe(true);
    });

    test('should handle freeze state correctly', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      loophound.anims = mockAnims;
      loophound.freeze(2000);
      expect(loophound.isFrozen).toBe(true);
      expect(loophound.freezeTimer).toBe(2000);
    });

    test('should unfreeze after timer expires', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      loophound.anims = mockAnims;
      loophound.isFrozen = true;
      loophound.freezeTimer = 100;
      loophound.update();
      loophound.freezeTimer = 0;
      loophound.update();
      expect(loophound.isFrozen).toBe(false);
    });
  });

  describe('Collision and Damage', () => {
    beforeEach(() => {
      loophound = new LoopHound(mockScene, 100, 200);
    });

    test('should take damage correctly', () => {
      loophound.takeDamage(20);
      
      expect(loophound.health).toBe(80);
    });

    test('should handle death when health reaches zero', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      loophound.anims = mockAnims;
      loophound.sprite = mockAdd.sprite();
      loophound.takeDamage(100);
      expect(loophound.health).toBe(0);
      expect(loophound.sprite.setActive.calls).toContainEqual([false]);
      expect(loophound.sprite.setVisible.calls).toContainEqual([false]);
    });

    test('should not take damage when already dead', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      loophound.anims = mockAnims;
      loophound.sprite = mockAdd.sprite();
      loophound.health = 0;
      loophound.takeDamage(20);
      expect(loophound.health).toBe(0);
    });
  });

  describe('Recording and Rewind Integration', () => {
    beforeEach(() => {
      loophound = new LoopHound(mockScene, 100, 200);
    });

    test('should provide state for recording', () => {
      loophound.stateMachine = { getCurrentState: () => 'patrol', update: () => {} };
      loophound.x = 100;
      loophound.y = 200;
      loophound.direction = 1;
      loophound.isFrozen = false;
      loophound.body.velocity.x = 0;
      loophound.body.velocity.y = 0;
      loophound.patrolStartX = 100;
      loophound.patrolEndX = 300;
      const state = loophound.getStateForRecording();
      expect(state).toEqual({
        x: 100,
        y: 200,
        vx: 0,
        vy: 0,
        direction: 1,
        isFrozen: false,
        state: 'patrol',
        patrolStartX: 100,
        patrolEndX: 300
      });
    });

    test('should restore state from recording', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      loophound.stateMachine = { getCurrentState: () => 'patrol', update: () => {} };
      const recordedState = {
        x: 150,
        y: 250,
        vx: 80,
        vy: 0,
        direction: -1,
        isFrozen: true,
        state: 'patrol',
        patrolStartX: 100,
        patrolEndX: 300
      };
      loophound.setStateFromRecording(recordedState);
      expect(loophound.x).toBe(150);
      expect(loophound.y).toBe(250);
      expect(loophound.direction).toBe(-1);
      expect(loophound.isFrozen).toBe(true);
    });
  });

  describe('Lifecycle Management', () => {
    beforeEach(() => {
      loophound = new LoopHound(mockScene, 100, 200);
    });

    test('should reset to spawn position on respawn', () => {
      loophound = new LoopHound(mockScene, 100, 200);
      loophound.spawnX = 100;
      loophound.spawnY = 200;
      loophound.y = 500;
      loophound.respawn();
      expect(loophound.x).toBe(100);
      expect(loophound.y).toBe(200);
      expect(loophound.health).toBe(100);
      expect(loophound.isFrozen).toBe(false);
    });
  });
}); 
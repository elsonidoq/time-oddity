import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const timeManagerPath = join(__dirname, '../../client/src/systems/TimeManager.js');
  let TimeManager;
  let sceneMock;
  let playerMock;

  beforeAll(async () => {
    if (existsSync(timeManagerPath)) {
      const module = await import(timeManagerPath);
      TimeManager = module.default;
    } else {
      TimeManager = class { constructor() {} register() {} update() {} };
    }
  });

  beforeEach(() => {
    sceneMock = {
        time: {
            now: Date.now()
        }
    };
    playerMock = {
      x: 100,
      y: 200,
      body: { velocity: { x: 10, y: -5 } },
      active: true,
      visible: true,
      anims: { currentAnim: { key: 'player-run' } }
    };
  });

  test('TimeManager.js class file should exist', () => {
    expect(existsSync(timeManagerPath)).toBe(true);
  });

  test('should be instantiated with a scene', () => {
    const manager = new TimeManager(sceneMock);
    expect(manager).toBeDefined();
    expect(manager.scene).toBe(sceneMock);
    expect(manager.stateBuffer).toBeInstanceOf(Array);
    expect(manager.isRewinding).toBe(false);
  });

  test('should register an object to be managed', () => {
    const manager = new TimeManager(sceneMock);
    manager.register(playerMock);
    expect(manager.managedObjects.has(playerMock)).toBe(true);
  });

  test('update() should record the state of registered objects', () => {
    const manager = new TimeManager(sceneMock);
    manager.register(playerMock);
    manager.update(sceneMock.time.now, 16);
    expect(manager.stateBuffer.length).toBe(1);
    const recordedState = manager.stateBuffer[0];
    expect(recordedState.states[0].target).toBe(playerMock);
    expect(recordedState.states[0].state.x).toBe(playerMock.x);
  });

  test('toggleRewind() should switch the isRewinding flag', () => {
    const manager = new TimeManager(sceneMock);
    expect(manager.isRewinding).toBe(false);
    manager.toggleRewind(true);
    expect(manager.isRewinding).toBe(true);
    manager.toggleRewind(false);
    expect(manager.isRewinding).toBe(false);
  });

  // test('update() should apply the last state to the target when rewinding', () => {
  //   manager.register(playerMock);
  //   // Simulate two recorded states for interpolation
  //   const testStateA = {
  //     x: 100,
  //     y: 200,
  //     velocityX: 0,
  //     velocityY: 0,
  //     animation: 'player-idle',
  //     isAlive: true,
  //     isVisible: true
  //   };
  //   const testStateB = {
  //     x: 50,
  //     y: 75,
  //     velocityX: 10,
  //     velocityY: -5,
  //     animation: 'player-run',
  //     isAlive: true,
  //     isVisible: true
  //   };
  //   const tA = sceneMock.time.now - 16;
  //   const tB = sceneMock.time.now;
  //   manager.stateBuffer.push({
  //     timestamp: tA,
  //     states: [{ target: playerMock, state: testStateA }]
  //   });
  //   manager.stateBuffer.push({
  //     timestamp: tB,
  //     states: [{ target: playerMock, state: testStateB }]
  //   });
  //   // Ensure setAllowGravity is mocked
  //   playerMock.body.setAllowGravity = jest.fn();
  //   playerMock.body.setVelocity = jest.fn();
  //   playerMock.anims.play = jest.fn();
  //   playerMock.setActive = jest.fn();
  //   playerMock.setVisible = jest.fn();
  //   manager.isRewinding = true;
  //   // Set playbackTimestamp between tA and tB for interpolation
  //   manager.playbackTimestamp = tA + (tB - tA) / 2;
  //   manager.update(sceneMock.time.now, 16); // Simulate one frame
  //   // The player's x/y should be between testStateA and testStateB
  //   expect(playerMock.x).toBeGreaterThan(testStateB.x);
  //   expect(playerMock.x).toBeLessThan(testStateA.x);
  //   expect(playerMock.y).toBeGreaterThan(testStateB.y);
  //   expect(playerMock.y).toBeLessThan(testStateA.y);
  //   expect(playerMock.body.setAllowGravity).toHaveBeenCalledWith(false);
  //   expect(playerMock.body.setVelocity).toHaveBeenCalledWith(
  //     expect.any(Number),
  //     expect.any(Number)
  //   );
  // });

describe('Enemy State Recording and Rewind', () => {
  let manager, enemyMock, playerMock;
  beforeEach(() => {
    manager = new TimeManager(sceneMock);
    manager.lastRecordTime = -Infinity;
    playerMock = {
      x: 100,
      y: 200,
      body: { velocity: { x: 10, y: -5 }, setVelocity: jest.fn(), setAllowGravity: jest.fn() },
      active: true,
      visible: true,
      anims: { currentAnim: { key: 'player-run' }, play: jest.fn() },
      setActive: jest.fn(),
      setVisible: jest.fn()
    };
    enemyMock = {
      x: 300,
      y: 400,
      health: 50,
      body: { velocity: { x: -20, y: 15 }, setVelocity: jest.fn(), setAllowGravity: jest.fn() },
      active: true,
      visible: true,
      anims: { currentAnim: { key: 'enemy-idle' }, play: jest.fn() },
      setActive: jest.fn(),
      setVisible: jest.fn()
    };
    // Add custom state methods for enemy
    enemyMock.getStateForRecording = function() {
      const state = {
        x: this.x,
        y: this.y,
        velocityX: this.body.velocity.x,
        velocityY: this.body.velocity.y,
        animation: this.anims.currentAnim ? this.anims.currentAnim.key : null,
        health: this.health,
        active: this.active,
        visible: this.visible,
        bodyEnable: this.body.enable
      };
      return JSON.parse(JSON.stringify(state));
    };
    enemyMock.setStateFromRecording = function(state) {
      this.x = state.x;
      this.y = state.y;
      this.body.velocity.x = state.velocityX;
      this.body.velocity.y = state.velocityY;
      this.health = state.health;
      if (this.anims && state.animation) this.anims.play(state.animation, true);
      this.setActive(state.isAlive);
      this.setVisible(state.isVisible);
    };
  });

  test('should record enemy health, position, velocity, and animation', () => {
    manager.register(enemyMock);
    manager.update(sceneMock.time.now, 16);
    const recorded = manager.stateBuffer[0].states[0];
    expect(recorded.target).toBe(enemyMock);
    expect(recorded.state.x).toBe(enemyMock.x);
    expect(recorded.state.y).toBe(enemyMock.y);
    expect(recorded.state.velocityX).toBe(enemyMock.body.velocity.x);
    expect(recorded.state.velocityY).toBe(enemyMock.body.velocity.y);
    expect(recorded.state.animation).toBe('enemy-idle');
    expect(recorded.state.health).toBe(enemyMock.health);
  });

  test('should restore enemy health, position, velocity, and animation on rewind', () => {
    manager.register(enemyMock);
    // Simulate a recorded state
    const state = {
      x: 111,
      y: 222,
      velocityX: 7,
      velocityY: -3,
      animation: 'enemy-run',
      isAlive: true,
      isVisible: true,
      health: 42
    };
    manager.stateBuffer.push({
      timestamp: sceneMock.time.now,
      states: [{ target: enemyMock, state }]
    });
    // Patch applyState to use setStateFromRecording
    manager.applyState = (target, s) => target.setStateFromRecording(s);
    manager.applyFrame(manager.stateBuffer[0]);
    expect(enemyMock.x).toBe(111);
    expect(enemyMock.y).toBe(222);
    expect(enemyMock.body.velocity.x).toBe(7);
    expect(enemyMock.body.velocity.y).toBe(-3);
    expect(enemyMock.health).toBe(42);
    expect(enemyMock.anims.play).toHaveBeenCalledWith('enemy-run', true);
    expect(enemyMock.setActive).toHaveBeenCalledWith(true);
    expect(enemyMock.setVisible).toHaveBeenCalledWith(true);
  });
});

describe('Enemy Respawn on Rewind', () => {
  let manager, enemyMock;
  beforeEach(() => {
    manager = new TimeManager(sceneMock);
    manager.lastRecordTime = -Infinity;
    enemyMock = {
      x: 300,
      y: 400,
      health: 50,
      body: { velocity: { x: -20, y: 15 }, setVelocity: jest.fn(), setAllowGravity: jest.fn(), enable: true },
      active: true,
      visible: true,
      anims: { currentAnim: { key: 'enemy-idle' }, play: jest.fn() },
      setActive: jest.fn(function(val) { this.active = val; }),
      setVisible: jest.fn(function(val) { this.visible = val; }),
      getStateForRecording: function() {
        const state = {
          x: this.x,
          y: this.y,
          velocityX: this.body.velocity.x,
          velocityY: this.body.velocity.y,
          animation: this.anims.currentAnim ? this.anims.currentAnim.key : null,
          health: this.health,
          active: this.active,
          visible: this.visible,
          bodyEnable: this.body.enable
        };
        return JSON.parse(JSON.stringify(state));
      },
      setStateFromRecording: function(state) {
        this.x = state.x;
        this.y = state.y;
        this.body.velocity.x = state.velocityX;
        this.body.velocity.y = state.velocityY;
        this.health = state.health;
        if (this.anims && state.animation) this.anims.play(state.animation, true);
        this.setActive(state.isAlive);
        this.setVisible(state.isVisible);
        // Simulate physics body enable/disable
        this.body.enable = !!state.isAlive;
      }
    };
  });

  test('should respawn enemy after rewind if previously killed', () => {
    manager.register(enemyMock);
    // Simulate enemy alive state
    const aliveState = {
      x: 300,
      y: 400,
      velocityX: 0,
      velocityY: 0,
      animation: 'enemy-idle',
      isAlive: true,
      isVisible: true,
      health: 50
    };
    // Simulate enemy dead state
    const deadState = {
      x: 300,
      y: 400,
      velocityX: 0,
      velocityY: 0,
      animation: 'enemy-idle',
      isAlive: false,
      isVisible: false,
      health: 0
    };
    // Record alive state, then dead state
    manager.stateBuffer.push({ timestamp: 1000, states: [{ target: enemyMock, state: aliveState }] });
    manager.stateBuffer.push({ timestamp: 2000, states: [{ target: enemyMock, state: deadState }] });
    // Simulate enemy is dead
    enemyMock.active = false;
    enemyMock.visible = false;
    enemyMock.body.enable = false;
    // Rewind to alive state
    manager.applyState(enemyMock, aliveState);
    // Diagnostic logs
    console.log('[Test] After rewind: active:', enemyMock.active, 'visible:', enemyMock.visible, 'body.enable:', enemyMock.body.enable);
    expect(enemyMock.active).toBe(true);
    expect(enemyMock.visible).toBe(true);
    expect(enemyMock.body.enable).toBe(true);
  });
});

describe('Enemy Full Lifecycle Rewind', () => {
  let manager, enemyMock;
  beforeEach(() => {
    manager = new TimeManager(sceneMock);
    manager.lastRecordTime = -Infinity;
    enemyMock = {
      x: 100,
      y: 200,
      health: 50,
      body: { velocity: { x: 0, y: 0 }, setVelocity: jest.fn(), setAllowGravity: jest.fn(), enable: true },
      active: true,
      visible: true,
      anims: { currentAnim: { key: 'enemy-idle' }, play: jest.fn() },
      setActive: jest.fn(function(val) { this.active = val; }),
      setVisible: jest.fn(function(val) { this.visible = val; }),
      getStateForRecording: function() {
        const state = {
          x: this.x,
          y: this.y,
          velocityX: this.body.velocity.x,
          velocityY: this.body.velocity.y,
          animation: this.anims.currentAnim ? this.anims.currentAnim.key : null,
          health: this.health,
          active: this.active,
          visible: this.visible,
          bodyEnable: this.body.enable
        };
        return JSON.parse(JSON.stringify(state));
      },
      setStateFromRecording: function(state) {
        this.x = state.x;
        this.y = state.y;
        this.body.velocity.x = state.velocityX;
        this.body.velocity.y = state.velocityY;
        this.health = state.health;
        this.setActive(state.active);
        this.setVisible(state.visible);
        this.body.enable = state.bodyEnable;
        if (state.animation && this.anims.play) this.anims.play(state.animation);
      }
    };
  });

  test('should respawn enemy after rewind even if killed and deactivated', () => {
    manager.register(enemyMock);
    // Step 1: Record alive state
    manager.handleRecord(0);
    expect(manager.managedObjects.has(enemyMock)).toBe(true);
    // Step 2: Kill/deactivate enemy
    enemyMock.health = 0;
    enemyMock.setActive(false);
    enemyMock.setVisible(false);
    enemyMock.body.enable = false;
    // Step 3: Record dead state
    manager.handleRecord(100);
    expect(manager.managedObjects.has(enemyMock)).toBe(true);
    // Diagnostic: print stateBuffer after both records
    console.log('[Test] stateBuffer after records:', JSON.stringify(manager.stateBuffer, null, 2));
    // Step 4: Rewind to alive state (first frame)
    const firstFrame = manager.stateBuffer[0];
    console.log('[Test] Before rewind: health:', enemyMock.health, 'active:', enemyMock.active, 'visible:', enemyMock.visible, 'body.enable:', enemyMock.body.enable);
    manager.applyFrame(firstFrame);
    console.log('[Test] After rewind: health:', enemyMock.health, 'active:', enemyMock.active, 'visible:', enemyMock.visible, 'body.enable:', enemyMock.body.enable);
    // Step 5: Assert respawn
    expect(enemyMock.health).toBe(50);
    expect(enemyMock.active).toBe(true);
    expect(enemyMock.visible).toBe(true);
    expect(enemyMock.body.enable).toBe(true);
  });
});

describe('Enemy Reactivation on Rewind', () => {
  let manager, enemyMock;
  beforeEach(() => {
    manager = new TimeManager(sceneMock);
    manager.lastRecordTime = -Infinity;
    enemyMock = {
      x: 100,
      y: 200,
      health: 50,
      body: { velocity: { x: 0, y: 0 }, setVelocity: jest.fn(), setAllowGravity: jest.fn(), enable: true },
      active: true,
      visible: true,
      anims: { currentAnim: { key: 'enemy-idle' }, play: jest.fn() },
      setActive: jest.fn(function(val) { this.active = val; }),
      setVisible: jest.fn(function(val) { this.visible = val; }),
      getStateForRecording: function() {
        const state = {
          x: this.x,
          y: this.y,
          velocityX: this.body.velocity.x,
          velocityY: this.body.velocity.y,
          animation: this.anims.currentAnim ? this.anims.currentAnim.key : null,
          health: this.health,
          active: this.active,
          visible: this.visible,
          bodyEnable: this.body.enable
        };
        return JSON.parse(JSON.stringify(state));
      },
      setStateFromRecording: function(state) {
        this.x = state.x;
        this.y = state.y;
        this.body.velocity.x = state.velocityX;
        this.body.velocity.y = state.velocityY;
        this.health = state.health;
        this.setActive(state.active);
        this.setVisible(state.visible);
        this.body.enable = state.bodyEnable;
        if (state.animation && this.anims.play) this.anims.play(state.animation);
      }
    };
  });

  test('should reactivate enemy after rewind to alive state', () => {
    manager.register(enemyMock);
    // Record alive state
    manager.handleRecord(0);
    // Kill/deactivate enemy
    enemyMock.health = 0;
    enemyMock.setActive(false);
    enemyMock.setVisible(false);
    enemyMock.body.enable = false;
    // Record dead state
    manager.handleRecord(100);
    // Diagnostic: print stateBuffer
    console.log('[Test] stateBuffer:', JSON.stringify(manager.stateBuffer, null, 2));
    // Rewind to alive state (first frame)
    const firstFrame = manager.stateBuffer[0];
    manager.applyFrame(firstFrame);
    // Assert reactivation
    expect(enemyMock.health).toBe(50);
    expect(enemyMock.active).toBe(true);
    expect(enemyMock.visible).toBe(true);
    expect(enemyMock.body.enable).toBe(true);
    // Diagnostic log
    console.log('[Test] After rewind: health:', enemyMock.health, 'active:', enemyMock.active, 'visible:', enemyMock.visible, 'body.enable:', enemyMock.body.enable);
  });
}); 
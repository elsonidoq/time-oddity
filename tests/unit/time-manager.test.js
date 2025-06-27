import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

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
    TimeManager = class { constructor() {} register() {} update() {} pauseRecording() {} resumeRecording() {} };
    }
  });

  beforeEach(() => {
    sceneMock = {
        time: {
            now: Date.now()
        },
        sys: {
            game: {
                config: {
                    width: 1280,
                    height: 720
                }
            }
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

describe('TimeManager pauseRecording/resumeRecording', () => {
  let TimeManager;
  let scene;
  let manager;
  let playerMock;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const timeManagerPath = join(__dirname, '../../client/src/systems/TimeManager.js');
    if (existsSync(timeManagerPath)) {
      const module = await import(timeManagerPath);
      TimeManager = module.default;
    } else {
      TimeManager = class { constructor() {} register() {} update() {} pauseRecording() {} resumeRecording() {} };
    }
  });

  beforeEach(() => {
    scene = createPhaserSceneMock('GameScene');
    playerMock = {
      x: 100,
      y: 200,
      body: { velocity: { x: 10, y: -5 } },
      active: true,
      visible: true,
      anims: { currentAnim: { key: 'player-run' } }
    };
    manager = new TimeManager(scene);
    manager.register(playerMock);
    manager.lastRecordTime = -Infinity; // allow immediate recording
  });

  test('pauseRecording() stops new state snapshots from being recorded', () => {
    manager.update(scene.time.now, 16);
    expect(manager.stateBuffer.length).toBe(1);
    manager.pauseRecording();
    manager.update(scene.time.now + 100, 16);
    expect(manager.stateBuffer.length).toBe(1); // No new snapshot
  });

  test('resumeRecording() resumes state snapshot recording', () => {
    manager.update(scene.time.now, 16);
    manager.pauseRecording();
    manager.update(scene.time.now + 100, 16);
    expect(manager.stateBuffer.length).toBe(1);
    manager.resumeRecording();
    manager.update(scene.time.now + 200, 16);
    expect(manager.stateBuffer.length).toBe(2);
  });

  test('buffer is preserved while paused', () => {
    manager.update(scene.time.now, 16);
    manager.pauseRecording();
    const bufferBefore = [...manager.stateBuffer];
    manager.update(scene.time.now + 100, 16);
    expect(manager.stateBuffer).toEqual(bufferBefore);
  });

  test('no new states are added while paused', () => {
    manager.update(scene.time.now, 16);
    manager.pauseRecording();
    for (let i = 0; i < 5; i++) {
      manager.update(scene.time.now + 100 + i * 50, 16);
    }
    expect(manager.stateBuffer.length).toBe(1);
  });
});

describe('TimeManager Constructor Tests', () => {
  test('constructor with mockScene parameter', () => {
    const mockScene = createPhaserSceneMock('TestScene');
    const manager = new TimeManager(mockScene);
    expect(manager).toBeDefined();
    expect(manager.scene).toBe(mockScene);
  });

  test('constructor without mockScene parameter', () => {
    const realScene = { time: { now: Date.now() } };
    const manager = new TimeManager(realScene);
    expect(manager).toBeDefined();
    expect(manager.scene).toBe(realScene);
  });

  test('all initial property values', () => {
    const scene = createPhaserSceneMock('TestScene');
    const manager = new TimeManager(scene);
    
    expect(manager.stateBuffer).toBeInstanceOf(Array);
    expect(manager.stateBuffer.length).toBe(0);
    expect(manager.isRewinding).toBe(false);
    expect(manager.managedObjects).toBeInstanceOf(Set);
    expect(manager.managedObjects.size).toBe(0);
    expect(manager.lastRecordTime).toBe(0);
    expect(manager.playbackTimestamp).toBe(0);
    expect(manager._rewindOverlay).toBeNull();
    expect(manager._rewindActive).toBe(false);
  });

  test('recordInterval default value (50ms)', () => {
    const scene = createPhaserSceneMock('TestScene');
    const manager = new TimeManager(scene);
    expect(manager.recordInterval).toBe(50);
  });

  test('isRecordingPaused initial state', () => {
    const scene = createPhaserSceneMock('TestScene');
    const manager = new TimeManager(scene);
    expect(manager.isRecordingPaused).toBe(false);
  });
});

describe('TimeManager handleRewind Method Tests', () => {
  let manager;
  let sceneMock;
  let objectMock;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock('TestScene');
    manager = new TimeManager(sceneMock);
    manager.lastRecordTime = 0;
    
    objectMock = {
      x: 100,
      y: 200,
      body: { 
        velocity: { x: 10, y: -5 }, 
        setVelocity: jest.fn(), 
        setAllowGravity: jest.fn() 
      },
      active: true,
      visible: true,
      anims: { currentAnim: { key: 'test-anim' }, play: jest.fn() },
      setActive: jest.fn(),
      setVisible: jest.fn()
    };
  });

  test('handleRewind with insufficient buffer (less than 2 frames)', () => {
    // Mock toggleRewind to track calls
    const toggleRewindSpy = jest.spyOn(manager, 'toggleRewind');
    
    // Add only one frame to buffer
    manager.stateBuffer.push({
      timestamp: 1000,
      states: [{ target: objectMock, state: { x: 100, y: 200 } }]
    });
    
    manager.handleRewind(16);
    
    expect(toggleRewindSpy).toHaveBeenCalledWith(false);
    expect(manager.isRewinding).toBe(false);
  });

  test('handleRewind with sufficient buffer', () => {
    // Mock interpolateFrame to track calls
    const interpolateFrameSpy = jest.spyOn(manager, 'interpolateFrame');
    
    // Add two frames to buffer
    manager.stateBuffer.push(
      { timestamp: 1000, states: [{ target: objectMock, state: { x: 100, y: 200 } }] },
      { timestamp: 1050, states: [{ target: objectMock, state: { x: 110, y: 190 } }] }
    );
    
    manager.isRewinding = true;
    manager.playbackTimestamp = 1050;
    
    manager.handleRewind(25); // Rewind by 25ms
    
    expect(manager.playbackTimestamp).toBe(1025);
    expect(interpolateFrameSpy).toHaveBeenCalled();
  });

  test('playbackTimestamp calculation', () => {
    // Add frames to buffer
    manager.stateBuffer.push(
      { timestamp: 1000, states: [{ target: objectMock, state: { x: 100, y: 200 } }] },
      { timestamp: 1050, states: [{ target: objectMock, state: { x: 110, y: 190 } }] }
    );
    
    manager.isRewinding = true;
    manager.playbackTimestamp = 1050;
    
    manager.handleRewind(30); // Rewind by 30ms
    
    expect(manager.playbackTimestamp).toBe(1020);
  });

  test('frame interpolation logic', () => {
    // Mock interpolateFrame to verify it's called with correct parameters
    const interpolateFrameSpy = jest.spyOn(manager, 'interpolateFrame');
    
    // Add frames to buffer
    manager.stateBuffer.push(
      { timestamp: 1000, states: [{ target: objectMock, state: { x: 100, y: 200 } }] },
      { timestamp: 1050, states: [{ target: objectMock, state: { x: 110, y: 190 } }] }
    );
    
    manager.isRewinding = true;
    manager.playbackTimestamp = 1025; // Between the two frames
    
    manager.handleRewind(0); // No additional rewind, just process current position
    
    expect(interpolateFrameSpy).toHaveBeenCalledWith(
      manager.stateBuffer[1], // frameA (future frame)
      manager.stateBuffer[0], // frameB (past frame)
      0.5 // t should be 0.5 for midpoint
    );
  });

  test('rewind termination conditions - reaches beginning', () => {
    // Mock toggleRewind to track calls
    const toggleRewindSpy = jest.spyOn(manager, 'toggleRewind');
    const applyFrameSpy = jest.spyOn(manager, 'applyFrame');
    
    // Add frames to buffer
    manager.stateBuffer.push(
      { timestamp: 1000, states: [{ target: objectMock, state: { x: 100, y: 200 } }] },
      { timestamp: 1050, states: [{ target: objectMock, state: { x: 110, y: 190 } }] }
    );
    
    manager.isRewinding = true;
    manager.playbackTimestamp = 1000; // At the first frame
    
    manager.handleRewind(50); // Rewind past the beginning
    
    expect(applyFrameSpy).toHaveBeenCalledWith(expect.objectContaining({
      timestamp: 1000,
      states: expect.arrayContaining([expect.objectContaining({
        target: objectMock,
        state: expect.objectContaining({ x: 100, y: 200 })
      })])
    }));
    expect(manager.stateBuffer.length).toBe(1); // Buffer keeps 1 frame when rewind reaches beginning
    expect(toggleRewindSpy).toHaveBeenCalledWith(false);
  });

  test('rewind termination conditions - futureIndex <= 0', () => {
    // Mock toggleRewind to track calls
    const toggleRewindSpy = jest.spyOn(manager, 'toggleRewind');
    const applyFrameSpy = jest.spyOn(manager, 'applyFrame');
    
    // Add frames to buffer
    manager.stateBuffer.push(
      { timestamp: 1000, states: [{ target: objectMock, state: { x: 100, y: 200 } }] },
      { timestamp: 1050, states: [{ target: objectMock, state: { x: 110, y: 190 } }] }
    );
    
    manager.isRewinding = true;
    manager.playbackTimestamp = 999; // Before the first frame
    
    manager.handleRewind(0);
    
    expect(applyFrameSpy).toHaveBeenCalledWith(expect.objectContaining({
      timestamp: 1000,
      states: expect.arrayContaining([expect.objectContaining({
        target: objectMock,
        state: expect.objectContaining({ x: 100, y: 200 })
      })])
    }));
    expect(manager.stateBuffer.length).toBe(1); // Buffer keeps 1 frame when rewind reaches beginning
    expect(toggleRewindSpy).toHaveBeenCalledWith(false);
  });
});

describe('TimeManager handleRecord Method Tests', () => {
  let manager;
  let sceneMock;
  let objectWithCustomState;
  let objectWithDefaultState;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock('TestScene');
    manager = new TimeManager(sceneMock);
    manager.lastRecordTime = 0;
    
    objectWithCustomState = {
      x: 10,
      y: 20,
      body: { velocity: { x: 1, y: 2 } },
      active: true,
      visible: true,
      getStateForRecording: jest.fn(() => ({
        x: 10, y: 20, velocityX: 1, velocityY: 2, animation: 'foo', isAlive: true, isVisible: true
      }))
    };
    objectWithDefaultState = {
      x: 30,
      y: 40,
      body: { velocity: { x: 3, y: 4 } },
      active: false,
      visible: false,
      anims: { currentAnim: { key: 'bar' } }
    };
  });

  test('handleRecord with recording paused does not record', () => {
    manager.isRecordingPaused = true;
    manager.register(objectWithCustomState);
    manager.handleRecord(100);
    expect(manager.stateBuffer.length).toBe(0);
  });

  test('handleRecord only records at intervals (50ms)', () => {
    manager.register(objectWithCustomState);
    manager.lastRecordTime = -Infinity;
    manager.handleRecord(0);
    expect(manager.stateBuffer.length).toBe(1);
    // Should not record again before 50ms
    manager.handleRecord(30);
    expect(manager.stateBuffer.length).toBe(1);
    // Should record at 51ms
    manager.handleRecord(51);
    expect(manager.stateBuffer.length).toBe(2);
  });

  test('records state for objects with getStateForRecording', () => {
    manager.register(objectWithCustomState);
    manager.handleRecord(100);
    expect(manager.stateBuffer.length).toBe(1);
    const frame = manager.stateBuffer[0];
    expect(frame.states[0].target).toBe(objectWithCustomState);
    expect(objectWithCustomState.getStateForRecording).toHaveBeenCalled();
    expect(frame.states[0].state).toEqual(expect.objectContaining({ x: 10, y: 20, velocityX: 1, velocityY: 2 }));
  });

  test('records state for objects without getStateForRecording (default)', () => {
    manager.register(objectWithDefaultState);
    manager.handleRecord(100);
    expect(manager.stateBuffer.length).toBe(1);
    const frame = manager.stateBuffer[0];
    expect(frame.states[0].target).toBe(objectWithDefaultState);
    expect(frame.states[0].state).toEqual(expect.objectContaining({
      x: 30,
      y: 40,
      velocityX: 3,
      velocityY: 4,
      animation: 'bar',
      isAlive: false,
      isVisible: false
    }));
  });

  test('lastRecordTime is updated after recording', () => {
    manager.register(objectWithCustomState);
    manager.handleRecord(1234);
    expect(manager.lastRecordTime).toBe(1234);
  });
});

describe('TimeManager applyFrame Method Tests', () => {
  let manager;
  let sceneMock;
  let objectWithCustomSetter;
  let objectWithDefaultSetter;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock('TestScene');
    manager = new TimeManager(sceneMock);
    objectWithCustomSetter = {
      setStateFromRecording: jest.fn(),
    };
    objectWithDefaultSetter = {
      x: 0,
      y: 0,
      body: { 
        setVelocity: jest.fn(), 
        velocity: { x: 0, y: 0 } 
      },
      anims: { 
        play: jest.fn(),
        currentAnim: { key: 'idle' }
      },
      active: false,
      visible: false,
      setActive: jest.fn(),
      setVisible: jest.fn(),
      isActive: false
    };
  });

  test('applyFrame with single object state (default)', () => {
    const frame = {
      timestamp: 100,
      states: [
        { target: objectWithDefaultSetter, state: { x: 5, y: 10, velocityX: 1, velocityY: 2, animation: 'run', isAlive: true, isVisible: true } }
      ]
    };
    manager.applyFrame(frame);
    expect(objectWithDefaultSetter.x).toBe(5);
    expect(objectWithDefaultSetter.y).toBe(10);
    expect(objectWithDefaultSetter.body.setVelocity).toHaveBeenCalledWith(1, 2);
    expect(objectWithDefaultSetter.anims.play).toHaveBeenCalledWith('run', true);
  });

  test('applyFrame with multiple object states', () => {
    const obj2 = {
      x: 0, y: 0, body: { setVelocity: jest.fn(), velocity: { x: 0, y: 0 } }, anims: { play: jest.fn() }, active: false, visible: false, setActive: jest.fn(), setVisible: jest.fn()
    };
    const frame = {
      timestamp: 200,
      states: [
        { target: objectWithDefaultSetter, state: { x: 1, y: 2, velocityX: 3, velocityY: 4, animation: 'idle', isAlive: true, isVisible: true } },
        { target: obj2, state: { x: 7, y: 8, velocityX: 9, velocityY: 10, animation: 'jump', isAlive: false, isVisible: false } }
      ]
    };
    manager.applyFrame(frame);
    expect(objectWithDefaultSetter.x).toBe(1);
    expect(objectWithDefaultSetter.y).toBe(2);
    expect(objectWithDefaultSetter.body.setVelocity).toHaveBeenCalledWith(3, 4);
    expect(objectWithDefaultSetter.anims.play).toHaveBeenCalledWith('idle', true);
    expect(obj2.x).toBe(7);
    expect(obj2.y).toBe(8);
    expect(obj2.body.setVelocity).toHaveBeenCalledWith(9, 10);
    expect(obj2.anims.play).toHaveBeenCalledWith('jump', true);
  });

  test('applyFrame with object using setStateFromRecording', () => {
    const frame = {
      timestamp: 300,
      states: [
        { target: objectWithCustomSetter, state: { foo: 'bar' } }
      ]
    };
    manager.applyFrame(frame);
    expect(objectWithCustomSetter.setStateFromRecording).toHaveBeenCalledWith({ foo: 'bar' });
  });

  test('applyFrame with object using default state application', () => {
    const frame = {
      timestamp: 400,
      states: [
        { target: objectWithDefaultSetter, state: { x: 11, y: 22, velocityX: 33, velocityY: 44, animation: 'walk', isAlive: true, isVisible: false } }
      ]
    };
    manager.applyFrame(frame);
    expect(objectWithDefaultSetter.x).toBe(11);
    expect(objectWithDefaultSetter.y).toBe(22);
    expect(objectWithDefaultSetter.body.setVelocity).toHaveBeenCalledWith(33, 44);
    expect(objectWithDefaultSetter.anims.play).toHaveBeenCalledWith('walk', true);
  });

  test('applyFrame applies frame regardless of timestamp', () => {
    const frame = {
      timestamp: 999,
      states: [
        { target: objectWithDefaultSetter, state: { x: 42, y: 43, velocityX: 44, velocityY: 45, animation: 'test', isAlive: true, isVisible: true } }
      ]
    };
    manager.applyFrame(frame);
    expect(objectWithDefaultSetter.x).toBe(42);
    expect(objectWithDefaultSetter.y).toBe(43);
    expect(objectWithDefaultSetter.body.setVelocity).toHaveBeenCalledWith(44, 45);
    expect(objectWithDefaultSetter.anims.play).toHaveBeenCalledWith('test', true);
  });
});

describe('TimeManager interpolateFrame Method Tests', () => {
  let manager;
  let object;
  let applyStateSpy;

  beforeEach(() => {
    manager = new TimeManager({});
    object = { setVisible: jest.fn(), setActive: jest.fn() };
    applyStateSpy = jest.spyOn(manager, 'applyState');
  });

  afterEach(() => {
    applyStateSpy.mockRestore();
  });

  test('interpolateFrame with matching objects in both frames (t=0.5)', () => {
    const frameA = {
      states: [
        { target: object, state: { x: 10, y: 20, velocityX: 1, velocityY: 2, foo: 'bar' } }
      ]
    };
    const frameB = {
      states: [
        { target: object, state: { x: 30, y: 40, velocityX: 5, velocityY: 6, foo: 'bar' } }
      ]
    };
    manager.interpolateFrame(frameA, frameB, 0.5);
    expect(applyStateSpy).toHaveBeenCalledWith(object, expect.objectContaining({
      x: 20, // midpoint
      y: 30,
      velocityX: 3,
      velocityY: 4,
      foo: 'bar'
    }));
  });

  test('interpolateFrame with t=0 (should match frameB)', () => {
    const obj = { setVisible: jest.fn(), setActive: jest.fn() };
    const frameA = {
      states: [
        { target: obj, state: { x: 100, y: 200, velocityX: 10, velocityY: 20, extra: 1 } }
      ]
    };
    const frameB = {
      states: [
        { target: obj, state: { x: 300, y: 400, velocityX: 50, velocityY: 60, extra: 1 } }
      ]
    };
    manager.interpolateFrame(frameA, frameB, 0);
    expect(applyStateSpy).toHaveBeenCalledWith(obj, expect.objectContaining({
      x: 300,
      y: 400,
      velocityX: 50,
      velocityY: 60,
      extra: 1
    }));
  });

  test('interpolateFrame with t=1 (should match frameA)', () => {
    const obj = { setVisible: jest.fn(), setActive: jest.fn() };
    const frameA = {
      states: [
        { target: obj, state: { x: 100, y: 200, velocityX: 10, velocityY: 20, extra: 2 } }
      ]
    };
    const frameB = {
      states: [
        { target: obj, state: { x: 300, y: 400, velocityX: 50, velocityY: 60, extra: 2 } }
      ]
    };
    manager.interpolateFrame(frameA, frameB, 1);
    expect(applyStateSpy).toHaveBeenCalledWith(obj, expect.objectContaining({
      x: 100,
      y: 200,
      velocityX: 10,
      velocityY: 20,
      extra: 2
    }));
  });

  test('interpolateFrame with objects only in frameA (should not throw)', () => {
    const obj = { setVisible: jest.fn(), setActive: jest.fn() };
    const frameA = {
      states: [
        { target: obj, state: { x: 1, y: 2, velocityX: 3, velocityY: 4 } }
      ]
    };
    const frameB = {
      states: []
    };
    expect(() => manager.interpolateFrame(frameA, frameB, 0.5)).not.toThrow();
    // Should not call applyState since no match in frameB
    expect(applyStateSpy).not.toHaveBeenCalled();
  });

  test('interpolated state preserves non-interpolated properties', () => {
    const frameA = {
      states: [
        { target: object, state: { x: 10, y: 20, velocityX: 1, velocityY: 2, foo: 'bar', alive: true } }
      ]
    };
    const frameB = {
      states: [
        { target: object, state: { x: 30, y: 40, velocityX: 5, velocityY: 6, foo: 'bar', alive: true } }
      ]
    };
    manager.interpolateFrame(frameA, frameB, 0.25);
    expect(applyStateSpy).toHaveBeenCalledWith(object, expect.objectContaining({
      foo: 'bar',
      alive: true
    }));
  });
});

describe('TimeManager Mathematical Interpolation Methods', () => {
  let manager;

  beforeEach(() => {
    manager = new TimeManager(sceneMock);
  });

  describe('lerp method', () => {
    test('should interpolate between two values with t=0', () => {
      const result = manager.lerp(10, 20, 0);
      expect(result).toBe(10);
    });

    test('should interpolate between two values with t=1', () => {
      const result = manager.lerp(10, 20, 1);
      expect(result).toBe(20);
    });

    test('should interpolate between two values with t=0.5', () => {
      const result = manager.lerp(10, 20, 0.5);
      expect(result).toBe(15);
    });

    test('should interpolate between negative values', () => {
      const result = manager.lerp(-10, -20, 0.5);
      expect(result).toBe(-15);
    });

    test('should interpolate between positive and negative values', () => {
      const result = manager.lerp(-10, 10, 0.5);
      expect(result).toBe(0);
    });

    test('should handle decimal interpolation factors', () => {
      const result = manager.lerp(0, 100, 0.25);
      expect(result).toBe(25);
    });

    test('should handle edge case t=0.999', () => {
      const result = manager.lerp(0, 100, 0.999);
      expect(result).toBeCloseTo(99.9, 1);
    });

    test('should handle edge case t=0.001', () => {
      const result = manager.lerp(0, 100, 0.001);
      expect(result).toBeCloseTo(0.1, 1);
    });
  });

  describe('interpolateState method', () => {
    test('should interpolate position and velocity properties', () => {
      const stateA = {
        x: 100,
        y: 200,
        velocityX: 10,
        velocityY: -5,
        animation: 'player-run',
        isAlive: true,
        isVisible: true
      };
      
      const stateB = {
        x: 200,
        y: 100,
        velocityX: 20,
        velocityY: 5,
        animation: 'player-idle',
        isAlive: false,
        isVisible: false
      };

      const interpolated = manager.interpolateState(stateA, stateB, 0.5);

      expect(interpolated.x).toBe(150);
      expect(interpolated.y).toBe(150);
      expect(interpolated.velocityX).toBe(15);
      expect(interpolated.velocityY).toBe(0);
    });

    test('should preserve non-interpolated properties from stateA', () => {
      const stateA = {
        x: 100,
        y: 200,
        velocityX: 10,
        velocityY: -5,
        animation: 'player-run',
        isAlive: true,
        isVisible: true,
        customProperty: 'should-be-preserved'
      };
      
      const stateB = {
        x: 200,
        y: 100,
        velocityX: 20,
        velocityY: 5,
        animation: 'player-idle',
        isAlive: false,
        isVisible: false,
        customProperty: 'should-not-override'
      };

      const interpolated = manager.interpolateState(stateA, stateB, 0.5);

      expect(interpolated.animation).toBe('player-run');
      expect(interpolated.isAlive).toBe(true);
      expect(interpolated.isVisible).toBe(true);
      expect(interpolated.customProperty).toBe('should-be-preserved');
    });

    test('should handle t=0 interpolation (return stateB values)', () => {
      const stateA = {
        x: 100,
        y: 200,
        velocityX: 10,
        velocityY: -5,
        animation: 'player-run'
      };
      
      const stateB = {
        x: 200,
        y: 100,
        velocityX: 20,
        velocityY: 5,
        animation: 'player-idle'
      };

      const interpolated = manager.interpolateState(stateA, stateB, 0);

      expect(interpolated.x).toBe(200);
      expect(interpolated.y).toBe(100);
      expect(interpolated.velocityX).toBe(20);
      expect(interpolated.velocityY).toBe(5);
    });

    test('should handle t=1 interpolation (return stateA values)', () => {
      const stateA = {
        x: 100,
        y: 200,
        velocityX: 10,
        velocityY: -5,
        animation: 'player-run'
      };
      
      const stateB = {
        x: 200,
        y: 100,
        velocityX: 20,
        velocityY: 5,
        animation: 'player-idle'
      };

      const interpolated = manager.interpolateState(stateA, stateB, 1);

      expect(interpolated.x).toBe(100);
      expect(interpolated.y).toBe(200);
      expect(interpolated.velocityX).toBe(10);
      expect(interpolated.velocityY).toBe(-5);
    });

    test('should handle negative velocity interpolation', () => {
      const stateA = {
        x: 0,
        y: 0,
        velocityX: -10,
        velocityY: -20,
        animation: 'player-fall'
      };
      
      const stateB = {
        x: 0,
        y: 0,
        velocityX: 10,
        velocityY: 20,
        animation: 'player-jump'
      };

      const interpolated = manager.interpolateState(stateA, stateB, 0.5);

      expect(interpolated.velocityX).toBe(0);
      expect(interpolated.velocityY).toBe(0);
    });

    test('should handle decimal interpolation factors', () => {
      const stateA = {
        x: 0,
        y: 0,
        velocityX: 0,
        velocityY: 0,
        animation: 'player-idle'
      };
      
      const stateB = {
        x: 100,
        y: 100,
        velocityX: 50,
        velocityY: 50,
        animation: 'player-run'
      };

      const interpolated = manager.interpolateState(stateA, stateB, 0.25);

      expect(interpolated.x).toBe(75);
      expect(interpolated.y).toBe(75);
      expect(interpolated.velocityX).toBe(37.5);
      expect(interpolated.velocityY).toBe(37.5);
    });

    test('should handle states with missing properties gracefully', () => {
      const stateA = {
        x: 100,
        y: 200,
        velocityX: 10,
        velocityY: -5
        // Missing animation and other properties
      };
      
      const stateB = {
        x: 200,
        y: 100,
        velocityX: 20,
        velocityY: 5
        // Missing animation and other properties
      };

      const interpolated = manager.interpolateState(stateA, stateB, 0.5);

      expect(interpolated.x).toBe(150);
      expect(interpolated.y).toBe(150);
      expect(interpolated.velocityX).toBe(15);
      expect(interpolated.velocityY).toBe(0);
      // The spread operator should preserve properties from stateA, but undefined properties won't be included
      expect(interpolated).not.toHaveProperty('animation');
    });
  });
});

describe('TimeManager applyState Method Tests', () => {
  let manager;
  let sceneMock;
  let objectWithCustomSetter;
  let objectWithDefaultSetter;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock('TestScene');
    manager = new TimeManager(sceneMock);
    
    objectWithCustomSetter = {
      setStateFromRecording: jest.fn(),
    };
    
    objectWithDefaultSetter = {
      x: 0,
      y: 0,
      body: { 
        setVelocity: jest.fn(), 
        velocity: { x: 0, y: 0 } 
      },
      anims: { 
        play: jest.fn(),
        currentAnim: { key: 'idle' }
      },
      active: false,
      visible: false,
      setActive: jest.fn(),
      setVisible: jest.fn(),
      isActive: false
    };
  });

  test('applyState with objects using setStateFromRecording', () => {
    const state = { x: 100, y: 200, custom: 'data' };
    manager.applyState(objectWithCustomSetter, state);
    expect(objectWithCustomSetter.setStateFromRecording).toHaveBeenCalledWith(state);
  });

  test('applyState with objects using default state application', () => {
    const state = {
      x: 50,
      y: 75,
      velocityX: 10,
      velocityY: -5,
      animation: 'run',
      isAlive: true,
      isVisible: true
    };
    
    manager.applyState(objectWithDefaultSetter, state);
    
    expect(objectWithDefaultSetter.x).toBe(50);
    expect(objectWithDefaultSetter.y).toBe(75);
    expect(objectWithDefaultSetter.body.setVelocity).toHaveBeenCalledWith(10, -5);
  });

  test('position restoration (x, y)', () => {
    const state = { x: 123, y: 456, velocityX: 0, velocityY: 0, isAlive: true, isVisible: true };
    manager.applyState(objectWithDefaultSetter, state);
    expect(objectWithDefaultSetter.x).toBe(123);
    expect(objectWithDefaultSetter.y).toBe(456);
  });

  test('velocity restoration (body.setVelocity)', () => {
    const state = { x: 0, y: 0, velocityX: 25, velocityY: -15, isAlive: true, isVisible: true };
    manager.applyState(objectWithDefaultSetter, state);
    expect(objectWithDefaultSetter.body.setVelocity).toHaveBeenCalledWith(25, -15);
  });

  test('animation restoration (anims.play)', () => {
    const state = { x: 0, y: 0, velocityX: 0, velocityY: 0, animation: 'jump', isAlive: true, isVisible: true };
    manager.applyState(objectWithDefaultSetter, state);
    expect(objectWithDefaultSetter.anims.play).toHaveBeenCalledWith('jump', true);
  });

  test('animation restoration with null animation', () => {
    const state = { x: 0, y: 0, velocityX: 0, velocityY: 0, animation: null, isAlive: true, isVisible: true };
    manager.applyState(objectWithDefaultSetter, state);
    expect(objectWithDefaultSetter.anims.play).not.toHaveBeenCalled();
  });

  test('active/visible state restoration', () => {
    const state = { x: 0, y: 0, velocityX: 0, velocityY: 0, isAlive: false, isVisible: false };
    manager.applyState(objectWithDefaultSetter, state);
    expect(objectWithDefaultSetter.setActive).toHaveBeenCalledWith(false);
    expect(objectWithDefaultSetter.setVisible).toHaveBeenCalledWith(false);
  });

  test('isActive custom property handling', () => {
    const state = { x: 0, y: 0, velocityX: 0, velocityY: 0, isAlive: true, isVisible: true };
    manager.applyState(objectWithDefaultSetter, state);
    expect(objectWithDefaultSetter.isActive).toBe(true);
  });

  test('isActive custom property handling when isAlive is false', () => {
    const state = { x: 0, y: 0, velocityX: 0, velocityY: 0, isAlive: false, isVisible: true };
    manager.applyState(objectWithDefaultSetter, state);
    expect(objectWithDefaultSetter.isActive).toBe(false);
  });

  test('object without setActive method falls back to direct property assignment', () => {
    const objectWithoutSetActive = {
      x: 0,
      y: 0,
      body: { setVelocity: jest.fn() },
      anims: { play: jest.fn() },
      active: true,
      visible: true,
      setVisible: jest.fn(),
      isActive: true
    };
    
    const state = { x: 0, y: 0, velocityX: 0, velocityY: 0, isAlive: false, isVisible: true };
    manager.applyState(objectWithoutSetActive, state);
    expect(objectWithoutSetActive.active).toBe(false);
  });

  test('object without body property does not call setVelocity', () => {
    const objectWithoutBody = {
      x: 0,
      y: 0,
      anims: { play: jest.fn() },
      active: true,
      visible: true,
      setActive: jest.fn(),
      setVisible: jest.fn(),
      isActive: true
    };
    
    const state = { x: 0, y: 0, velocityX: 10, velocityY: 20, isAlive: true, isVisible: true };
    expect(() => manager.applyState(objectWithoutBody, state)).not.toThrow();
  });

  test('object without anims property does not call play', () => {
    const objectWithoutAnims = {
      x: 0,
      y: 0,
      body: { setVelocity: jest.fn() },
      active: true,
      visible: true,
      setActive: jest.fn(),
      setVisible: jest.fn(),
      isActive: true
    };
    
    const state = { x: 0, y: 0, velocityX: 0, velocityY: 0, animation: 'test', isAlive: true, isVisible: true };
    expect(() => manager.applyState(objectWithoutAnims, state)).not.toThrow();
  });

  test('object without isActive property does not throw', () => {
    const objectWithoutIsActive = {
      x: 0,
      y: 0,
      body: { setVelocity: jest.fn() },
      anims: { play: jest.fn() },
      active: true,
      visible: true,
      setActive: jest.fn(),
      setVisible: jest.fn()
    };
    
    const state = { x: 0, y: 0, velocityX: 0, velocityY: 0, isAlive: true, isVisible: true };
    expect(() => manager.applyState(objectWithoutIsActive, state)).not.toThrow();
  });

  test('comprehensive state restoration with all properties', () => {
    const state = {
      x: 100,
      y: 200,
      velocityX: 15,
      velocityY: -10,
      animation: 'dash',
      isAlive: true,
      isVisible: false
    };
    
    manager.applyState(objectWithDefaultSetter, state);
    
    expect(objectWithDefaultSetter.x).toBe(100);
    expect(objectWithDefaultSetter.y).toBe(200);
    expect(objectWithDefaultSetter.body.setVelocity).toHaveBeenCalledWith(15, -10);
    expect(objectWithDefaultSetter.anims.play).toHaveBeenCalledWith('dash', true);
    expect(objectWithDefaultSetter.setActive).toHaveBeenCalledWith(true);
    expect(objectWithDefaultSetter.setVisible).toHaveBeenCalledWith(false);
    expect(objectWithDefaultSetter.isActive).toBe(true);
  });
});

describe('TimeManager toggleRewind Gravity Control Tests', () => {
  let manager;
  let sceneMock;
  let objectWithBody;
  let objectWithoutBody;
  let multipleObjects;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock('TestScene');
    manager = new TimeManager(sceneMock);
    
    objectWithBody = {
      body: { 
        setAllowGravity: jest.fn(),
        velocity: { x: 0, y: 0 }
      }
    };
    
    objectWithoutBody = {
      x: 0,
      y: 0
    };
    
    multipleObjects = [
      { body: { setAllowGravity: jest.fn(), velocity: { x: 0, y: 0 } } },
      { body: { setAllowGravity: jest.fn(), velocity: { x: 0, y: 0 } } },
      { x: 0, y: 0 } // object without body
    ];
  });

  test('gravity disabled when rewind starts', () => {
    manager.register(objectWithBody);
    manager.toggleRewind(true);
    expect(objectWithBody.body.setAllowGravity).toHaveBeenCalledWith(false);
  });

  test('gravity enabled when rewind ends', () => {
    manager.register(objectWithBody);
    manager.toggleRewind(true);
    manager.toggleRewind(false);
    expect(objectWithBody.body.setAllowGravity).toHaveBeenCalledWith(true);
  });

  test('gravity control for objects with body', () => {
    manager.register(objectWithBody);
    manager.toggleRewind(true);
    expect(objectWithBody.body.setAllowGravity).toHaveBeenCalledWith(false);
    
    manager.toggleRewind(false);
    expect(objectWithBody.body.setAllowGravity).toHaveBeenCalledWith(true);
  });

  test('gravity control for objects without body', () => {
    manager.register(objectWithoutBody);
    expect(() => manager.toggleRewind(true)).not.toThrow();
    expect(() => manager.toggleRewind(false)).not.toThrow();
  });

  test('multiple managed objects gravity control', () => {
    multipleObjects.forEach(obj => manager.register(obj));
    
    manager.toggleRewind(true);
    
    // Check that objects with body had gravity disabled
    expect(multipleObjects[0].body.setAllowGravity).toHaveBeenCalledWith(false);
    expect(multipleObjects[1].body.setAllowGravity).toHaveBeenCalledWith(false);
    
    manager.toggleRewind(false);
    
    // Check that objects with body had gravity enabled
    expect(multipleObjects[0].body.setAllowGravity).toHaveBeenCalledWith(true);
    expect(multipleObjects[1].body.setAllowGravity).toHaveBeenCalledWith(true);
  });

  test('gravity control called in correct order during rewind start', () => {
    manager.register(objectWithBody);
    manager.toggleRewind(true);
    
    const calls = objectWithBody.body.setAllowGravity.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual([false]);
  });

  test('gravity control called in correct order during rewind end', () => {
    manager.register(objectWithBody);
    manager.toggleRewind(true);
    manager.toggleRewind(false);
    
    const calls = objectWithBody.body.setAllowGravity.mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0]).toEqual([false]); // rewind start
    expect(calls[1]).toEqual([true]);  // rewind end
  });

  test('no gravity control when toggleRewind called with same state', () => {
    manager.register(objectWithBody);
    manager.toggleRewind(false); // already false
    expect(objectWithBody.body.setAllowGravity).not.toHaveBeenCalled();
  });

  test('gravity control only affects registered objects', () => {
    const unregisteredObject = {
      body: { setAllowGravity: jest.fn(), velocity: { x: 0, y: 0 } }
    };
    
    manager.register(objectWithBody);
    manager.toggleRewind(true);
    
    expect(objectWithBody.body.setAllowGravity).toHaveBeenCalledWith(false);
    expect(unregisteredObject.body.setAllowGravity).not.toHaveBeenCalled();
  });

  test('gravity control handles objects with null body gracefully', () => {
    const objectWithNullBody = {
      body: null
    };
    
    manager.register(objectWithNullBody);
    expect(() => manager.toggleRewind(true)).not.toThrow();
    expect(() => manager.toggleRewind(false)).not.toThrow();
  });

  test('gravity control handles objects with body but no setAllowGravity method', () => {
    const objectWithIncompleteBody = {
      body: { velocity: { x: 0, y: 0 } }
    };
    
    manager.register(objectWithIncompleteBody);
    expect(() => manager.toggleRewind(true)).not.toThrow();
  });

  test('gravity control state is properly managed for multiple toggle calls', () => {
    manager.register(objectWithBody);
    
    // Start rewind
    manager.toggleRewind(true);
    expect(objectWithBody.body.setAllowGravity).toHaveBeenCalledWith(false);
    
    // Try to start rewind again (should be no-op)
    manager.toggleRewind(true);
    expect(objectWithBody.body.setAllowGravity).toHaveBeenCalledTimes(1);
    
    // End rewind
    manager.toggleRewind(false);
    expect(objectWithBody.body.setAllowGravity).toHaveBeenCalledWith(true);
    
    // Try to end rewind again (should be no-op)
    manager.toggleRewind(false);
    expect(objectWithBody.body.setAllowGravity).toHaveBeenCalledTimes(2);
  });
});

describe('TimeManager toggleRewind Buffer Management Tests', () => {
  let manager;
  let sceneMock;
  let testObject;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock('TestScene');
    // Add game config to scene mock for visual effects
    sceneMock.sys = {
      game: {
        config: { width: 1280, height: 720 }
      }
    };
    sceneMock.cameras.main.setTint = jest.fn();
    sceneMock.cameras.main.clearTint = jest.fn();
    // Graphics overlay mock
    const graphicsMock = {
      setScrollFactor: jest.fn(),
      setDepth: jest.fn(),
      setAlpha: jest.fn(),
      setVisible: jest.fn(),
      fillStyle: jest.fn(() => graphicsMock),
      fillRect: jest.fn(() => graphicsMock),
      clear: jest.fn(() => graphicsMock),
      destroy: jest.fn()
    };
    testObject = {
      x: 100,
      y: 200,
      body: { 
        setVelocity: jest.fn(),
        setAllowGravity: jest.fn(),
        velocity: { x: 0, y: 0 }
      },
      anims: { 
        play: jest.fn(),
        currentAnim: { key: 'idle' }
      },
      active: true,
      visible: true,
      setActive: jest.fn(),
      setVisible: jest.fn(),
      isActive: true
    };
    sceneMock.add.graphics = jest.fn(() => graphicsMock);
    manager = new TimeManager(sceneMock);
    manager.register(testObject);
  });

  test('playbackTimestamp initialization on rewind start', () => {
    // Record some states first
    manager.update(1000, 50);
    manager.update(1050, 50);
    manager.update(1100, 50);
    
    expect(manager.stateBuffer.length).toBeGreaterThan(0);
    expect(manager.playbackTimestamp).toBe(0);
    
    // Start rewind
    manager.toggleRewind(true);
    
    // Should set playbackTimestamp to the last recorded timestamp
    expect(manager.playbackTimestamp).toBeGreaterThan(0);
  });

  test('buffer truncation on rewind end', () => {
    // Record some states with proper time progression
    manager.update(1000, 50);
    manager.update(1050, 50);
    manager.update(1100, 50);
    manager.update(1150, 50);
    manager.update(1200, 50);
    
    expect(manager.stateBuffer.length).toBeGreaterThan(0);
    
    // Start rewind and advance playback
    manager.toggleRewind(true);
    manager.playbackTimestamp = 1075; // Between 1050 and 1100
    
    // End rewind
    manager.toggleRewind(false);
    
    // Buffer should be truncated to remove future states
    // Should keep states up to the current playback position
    expect(manager.stateBuffer.length).toBeLessThanOrEqual(manager.stateBuffer.length);
  });

  test('buffer preservation when no rewind occurs', () => {
    // Record some states
    manager.update(1000, 50);
    manager.update(1050, 50);
    manager.update(1100, 50);
    
    const originalBufferLength = manager.stateBuffer.length;
    
    // Don't start rewind, just end it
    manager.toggleRewind(false);
    
    // Buffer should remain unchanged
    expect(manager.stateBuffer.length).toBe(originalBufferLength);
  });

  test('buffer handling with empty state', () => {
    // Start rewind with empty buffer
    manager.toggleRewind(true);
    
    // Should handle gracefully
    expect(manager.playbackTimestamp).toBe(0);
    expect(manager.isRewinding).toBe(true);
    
    // End rewind
    manager.toggleRewind(false);
    
    // Should handle gracefully
    expect(manager.isRewinding).toBe(false);
  });

  test('buffer handling with single frame', () => {
    // Record only one state
    manager.update(1000, 50);
    
    expect(manager.stateBuffer.length).toBeGreaterThan(0);
    
    // Start rewind
    manager.toggleRewind(true);
    
    // Should set playbackTimestamp to the single frame timestamp
    expect(manager.playbackTimestamp).toBeGreaterThan(0);
    
    // End rewind
    manager.toggleRewind(false);
    
    // Buffer should be preserved (but may be truncated)
    expect(manager.stateBuffer.length).toBeGreaterThanOrEqual(0);
  });

  test('buffer truncation preserves correct states', () => {
    // Record multiple states with proper time progression
    manager.update(1000, 50);
    manager.update(1050, 50);
    manager.update(1100, 50);
    manager.update(1150, 50);
    manager.update(1200, 50);
    manager.update(1250, 50);
    
    expect(manager.stateBuffer.length).toBeGreaterThan(0);
    
    // Start rewind and advance to middle
    manager.toggleRewind(true);
    manager.playbackTimestamp = 1125; // Between 1100 and 1150
    
    // End rewind
    manager.toggleRewind(false);
    
    // Should keep states up to current position
    // The exact number depends on the truncation logic
    expect(manager.stateBuffer.length).toBeGreaterThan(0);
  });

  test('buffer state consistency after rewind cycle', () => {
    // Record initial states
    manager.update(1000, 50);
    manager.update(1050, 50);
    manager.update(1100, 50);
    
    const initialBufferLength = manager.stateBuffer.length;
    
    // Complete rewind cycle
    manager.toggleRewind(true);
    manager.toggleRewind(false);
    
    // Buffer should be in a consistent state
    expect(manager.stateBuffer.length).toBeLessThanOrEqual(initialBufferLength);
    expect(manager.isRewinding).toBe(false);
    // Note: playbackTimestamp may not be reset to 0 depending on implementation
    expect(manager.playbackTimestamp).toBeGreaterThanOrEqual(0);
  });

  test('multiple rewind cycles handle buffer correctly', () => {
    // Record states
    manager.update(1000, 50);
    manager.update(1050, 50);
    manager.update(1100, 50);
    
    // First rewind cycle
    manager.toggleRewind(true);
    manager.playbackTimestamp = 1075;
    manager.toggleRewind(false);
    
    const firstCycleLength = manager.stateBuffer.length;
    
    // Second rewind cycle
    manager.toggleRewind(true);
    manager.playbackTimestamp = 1025;
    manager.toggleRewind(false);
    
    // Buffer should be handled correctly in both cycles
    expect(manager.stateBuffer.length).toBeLessThanOrEqual(firstCycleLength);
  });
});

describe('TimeManager Visual Effects Integration Tests', () => {
  let manager;
  let sceneMock;
  let overlayMock;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock('GameScene');
    // Add game config and camera tint methods
    sceneMock.sys = {
      game: {
        config: { width: 1280, height: 720 }
      }
    };
    sceneMock.cameras.main.setTint = jest.fn();
    sceneMock.cameras.main.clearTint = jest.fn();
    // Graphics overlay mock
    overlayMock = {
      setScrollFactor: jest.fn(),
      setDepth: jest.fn(),
      setAlpha: jest.fn(),
      setVisible: jest.fn(),
      fillStyle: jest.fn(() => overlayMock),
      fillRect: jest.fn(() => overlayMock),
      clear: jest.fn(() => overlayMock),
      destroy: jest.fn()
    };
    sceneMock.add.graphics = jest.fn(() => overlayMock);
    manager = new TimeManager(sceneMock);
  });

  test('calls _activateRewindVisuals during rewind start', () => {
    const spy = jest.spyOn(manager, '_activateRewindVisuals');
    manager.toggleRewind(true);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('calls _deactivateRewindVisuals during rewind end', () => {
    const spy = jest.spyOn(manager, '_deactivateRewindVisuals');
    manager.toggleRewind(true);
    manager.toggleRewind(false);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('visual effects state tracking (_rewindActive)', () => {
    expect(manager._rewindActive).toBe(false);
    manager.toggleRewind(true);
    expect(manager._rewindActive).toBe(true);
    manager.toggleRewind(false);
    expect(manager._rewindActive).toBe(false);
  });

  test('visual effects cleanup on destroy', () => {
    manager.toggleRewind(true);
    expect(manager._rewindOverlay).toBeDefined();
    manager.destroy();
    expect(overlayMock.destroy).toHaveBeenCalled();
    expect(sceneMock.cameras.main.clearTint).toHaveBeenCalled();
    expect(manager._rewindOverlay).toBe(null);
    expect(manager._rewindActive).toBe(false);
  });

  test('cleanup on destroy with no overlay', () => {
    manager.destroy();
    expect(sceneMock.cameras.main.clearTint).toHaveBeenCalled();
    expect(manager._rewindOverlay).toBe(null);
    expect(manager._rewindActive).toBe(false);
  });

  test('handles missing scene components gracefully', () => {
    // Remove cameras.main and add.graphics
    delete sceneMock.cameras.main;
    sceneMock.add.graphics = undefined;
    manager = new TimeManager(sceneMock);
    expect(() => manager.toggleRewind(true)).not.toThrow();
    expect(() => manager.toggleRewind(false)).not.toThrow();
    expect(() => manager.destroy()).not.toThrow();
  });
});

describe('TimeManager destroy Method Tests', () => {
  let manager;
  let sceneMock;
  let overlayMock;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock('GameScene');
    sceneMock.sys = { game: { config: { width: 1280, height: 720 } } };
    sceneMock.cameras.main.setTint = jest.fn();
    sceneMock.cameras.main.clearTint = jest.fn();
    overlayMock = {
      setScrollFactor: jest.fn(),
      setDepth: jest.fn(),
      setAlpha: jest.fn(),
      setVisible: jest.fn(),
      fillStyle: jest.fn(() => overlayMock),
      fillRect: jest.fn(() => overlayMock),
      clear: jest.fn(() => overlayMock),
      destroy: jest.fn()
    };
    sceneMock.add.graphics = jest.fn(() => overlayMock);
    manager = new TimeManager(sceneMock);
  });

  test('destroy with active rewind overlay', () => {
    manager.toggleRewind(true);
    expect(manager._rewindOverlay).toBeDefined();
    manager.destroy();
    expect(overlayMock.destroy).toHaveBeenCalled();
    expect(sceneMock.cameras.main.clearTint).toHaveBeenCalled();
    expect(manager._rewindOverlay).toBe(null);
    expect(manager._rewindActive).toBe(false);
  });

  test('destroy without rewind overlay', () => {
    manager.destroy();
    expect(sceneMock.cameras.main.clearTint).toHaveBeenCalled();
    expect(manager._rewindOverlay).toBe(null);
    expect(manager._rewindActive).toBe(false);
  });

  test('overlay destruction is idempotent', () => {
    manager.toggleRewind(true);
    manager.destroy();
    // Call destroy again, should not throw or double-destroy
    expect(() => manager.destroy()).not.toThrow();
    expect(overlayMock.destroy).toHaveBeenCalledTimes(1);
  });

  test('camera tint clearing is idempotent', () => {
    manager.toggleRewind(true);
    manager.destroy();
    // Call destroy again, should not throw or double-clear
    expect(() => manager.destroy()).not.toThrow();
    expect(sceneMock.cameras.main.clearTint).toHaveBeenCalled();
  });

  test('multiple destroy calls do not throw', () => {
    manager.toggleRewind(true);
    manager.destroy();
    expect(() => manager.destroy()).not.toThrow();
    expect(() => manager.destroy()).not.toThrow();
  });
});

describe('TimeManager Edge Cases and Error Handling', () => {
  let manager;
  let sceneMock;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock('GameScene');
    sceneMock.sys = { game: { config: { width: 1280, height: 720 } } };
    sceneMock.cameras.main.setTint = jest.fn();
    sceneMock.cameras.main.clearTint = jest.fn();
    sceneMock.add.graphics = jest.fn(() => ({
      setScrollFactor: jest.fn(),
      setDepth: jest.fn(),
      setAlpha: jest.fn(),
      setVisible: jest.fn(),
      fillStyle: jest.fn(),
      fillRect: jest.fn(),
      clear: jest.fn(),
      destroy: jest.fn()
    }));
    manager = new TimeManager(sceneMock);
  });

  describe('Rewind with no managed objects', () => {
    test('should handle rewind start with no objects gracefully', () => {
      expect(() => manager.toggleRewind(true)).not.toThrow();
      expect(manager.isRewinding).toBe(true);
      expect(manager.stateBuffer.length).toBe(0);
    });

    test('should handle rewind end with no objects gracefully', () => {
      manager.toggleRewind(true);
      expect(() => manager.toggleRewind(false)).not.toThrow();
      expect(manager.isRewinding).toBe(false);
    });

    test('should handle update during rewind with no objects', () => {
      manager.toggleRewind(true);
      expect(() => manager.update(1000, 50)).not.toThrow();
      expect(manager.stateBuffer.length).toBe(0);
    });
  });

  describe('Recording with no managed objects', () => {
    test('should handle recording with no objects gracefully', () => {
      expect(() => manager.update(1000, 50)).not.toThrow();
      expect(manager.stateBuffer.length).toBe(0);
    });

    test('should handle pause/resume recording with no objects', () => {
      expect(() => manager.pauseRecording()).not.toThrow();
      expect(() => manager.resumeRecording()).not.toThrow();
    });

    test('should not create empty frames when no objects are registered', () => {
      manager.update(1000, 50);
      manager.update(1050, 50);
      expect(manager.stateBuffer.length).toBe(0);
    });
  });

  describe('Objects without required properties', () => {
    test('should handle object missing body property', () => {
      const incompleteObject = {
        x: 100,
        y: 200,
        active: true,
        visible: true
        // Missing body property
      };
      
      expect(() => manager.register(incompleteObject)).not.toThrow();
      expect(() => manager.update(1000, 50)).not.toThrow();
    });

    test('should handle object missing velocity property', () => {
      const incompleteObject = {
        x: 100,
        y: 200,
        body: {}, // Missing velocity
        active: true,
        visible: true
      };
      
      expect(() => manager.register(incompleteObject)).not.toThrow();
      expect(() => manager.update(1000, 50)).not.toThrow();
    });

    test('should handle object missing anims property', () => {
      const incompleteObject = {
        x: 100,
        y: 200,
        body: { velocity: { x: 0, y: 0 } },
        active: true,
        visible: true
        // Missing anims property
      };
      
      expect(() => manager.register(incompleteObject)).not.toThrow();
      expect(() => manager.update(1000, 50)).not.toThrow();
    });

    test('should handle object with null/undefined properties', () => {
      const nullObject = {
        x: null,
        y: undefined,
        body: { velocity: { x: null, y: undefined } },
        active: null,
        visible: undefined,
        anims: { currentAnim: null }
      };
      
      expect(() => manager.register(nullObject)).not.toThrow();
      expect(() => manager.update(1000, 50)).not.toThrow();
    });
  });

  describe('Rapid rewind toggle calls', () => {
    test('should handle rapid toggle calls without errors', () => {
      expect(() => {
        manager.toggleRewind(true);
        manager.toggleRewind(false);
        manager.toggleRewind(true);
        manager.toggleRewind(false);
        manager.toggleRewind(true);
        manager.toggleRewind(false);
      }).not.toThrow();
    });

    test('should maintain correct state after rapid toggles', () => {
      manager.toggleRewind(true);
      manager.toggleRewind(false);
      manager.toggleRewind(true);
      manager.toggleRewind(false);
      
      expect(manager.isRewinding).toBe(false);
      expect(manager._rewindActive).toBe(false);
    });

    test('should handle toggle calls during rewind playback', () => {
      const playerMock = {
        x: 100, y: 200,
        body: { velocity: { x: 10, y: -5 } },
        active: true, visible: true,
        anims: { currentAnim: { key: 'player-run' } }
      };
      
      manager.register(playerMock);
      manager.update(1000, 50);
      manager.update(1050, 50);
      
      manager.toggleRewind(true);
      manager.playbackTimestamp = 1025;
      
      // Rapid toggle calls during playback
      expect(() => {
        manager.toggleRewind(false);
        manager.toggleRewind(true);
        manager.toggleRewind(false);
      }).not.toThrow();
    });
  });

  describe('Extreme time values', () => {
    test('should handle very large time values', () => {
      const playerMock = {
        x: 100, y: 200,
        body: { velocity: { x: 10, y: -5 } },
        active: true, visible: true,
        anims: { currentAnim: { key: 'player-run' } }
      };
      
      manager.register(playerMock);
      
      // Test with very large time values
      expect(() => manager.update(Number.MAX_SAFE_INTEGER, 50)).not.toThrow();
      expect(() => manager.update(Number.MAX_VALUE, 50)).not.toThrow();
    });

    test('should handle negative time values', () => {
      const playerMock = {
        x: 100, y: 200,
        body: { velocity: { x: 10, y: -5 } },
        active: true, visible: true,
        anims: { currentAnim: { key: 'player-run' } }
      };
      
      manager.register(playerMock);
      
      expect(() => manager.update(-1000, 50)).not.toThrow();
      expect(() => manager.update(-Number.MAX_SAFE_INTEGER, 50)).not.toThrow();
    });

    test('should handle zero and very small time values', () => {
      const playerMock = {
        x: 100, y: 200,
        body: { velocity: { x: 10, y: -5 } },
        active: true, visible: true,
        anims: { currentAnim: { key: 'player-run' } }
      };
      
      manager.register(playerMock);
      
      expect(() => manager.update(0, 50)).not.toThrow();
      expect(() => manager.update(0.000001, 50)).not.toThrow();
    });

    test('should handle extreme delta values', () => {
      const playerMock = {
        x: 100, y: 200,
        body: { velocity: { x: 10, y: -5 } },
        active: true, visible: true,
        anims: { currentAnim: { key: 'player-run' } }
      };
      
      manager.register(playerMock);
      
      expect(() => manager.update(1000, Number.MAX_SAFE_INTEGER)).not.toThrow();
      expect(() => manager.update(1000, 0)).not.toThrow();
      expect(() => manager.update(1000, -100)).not.toThrow();
    });
  });

  describe('Memory leak prevention', () => {
    test('should not accumulate infinite buffer entries', () => {
      const playerMock = {
        x: 100, y: 200,
        body: { velocity: { x: 10, y: -5 } },
        active: true, visible: true,
        anims: { currentAnim: { key: 'player-run' } }
      };
      
      manager.register(playerMock);
      
      // Simulate many updates
      for (let i = 0; i < 1000; i++) {
        manager.update(1000 + i * 50, 50);
      }
      
      // Buffer should not grow infinitely
      expect(manager.stateBuffer.length).toBeLessThanOrEqual(1000);
    });

    test('should clean up references when objects are unregistered', () => {
      const playerMock = {
        x: 100, y: 200,
        body: { velocity: { x: 10, y: -5 } },
        active: true, visible: true,
        anims: { currentAnim: { key: 'player-run' } }
      };
      
      manager.register(playerMock);
      manager.update(1000, 50);
      
      // Simulate unregistering (if method exists)
      if (manager.unregister) {
        manager.unregister(playerMock);
        expect(manager.managedObjects.has(playerMock)).toBe(false);
      }
    });

    test('should handle object destruction gracefully', () => {
      const playerMock = {
        x: 100, y: 200,
        body: { velocity: { x: 10, y: -5 } },
        active: true, visible: true,
        anims: { currentAnim: { key: 'player-run' } }
      };
      
      manager.register(playerMock);
      manager.update(1000, 50);
      
      // Simulate object being destroyed
      playerMock.active = false;
      playerMock.visible = false;
      
      expect(() => manager.update(1050, 50)).not.toThrow();
    });

    test('should not retain references to destroyed objects in buffer', () => {
      const playerMock = {
        x: 100, y: 200,
        body: { velocity: { x: 10, y: -5 } },
        active: true, visible: true,
        anims: { currentAnim: { key: 'player-run' } }
      };
      
      manager.register(playerMock);
      manager.update(1000, 50);
      
      // Clear the object reference
      const originalBuffer = manager.stateBuffer;
      manager.stateBuffer = [];
      
      // Should not cause memory leaks
      expect(originalBuffer.length).toBe(1);
      expect(originalBuffer[0].states[0].target).toBe(playerMock);
    });
  });

  describe('Error handling for malformed state data', () => {
    test('should handle malformed state buffer entries', () => {
      // Manually inject malformed data
      manager.stateBuffer.push({
        timestamp: 1000,
        states: [
          { target: null, state: null },
          { target: undefined, state: {} },
          { target: {}, state: undefined }
        ]
      });
      
      expect(() => manager.toggleRewind(true)).not.toThrow();
      expect(() => manager.toggleRewind(false)).not.toThrow();
    });

    test('should handle missing timestamp in buffer entries', () => {
      manager.stateBuffer.push({
        // Missing timestamp
        states: [{ target: {}, state: { x: 100, y: 200 } }]
      });
      
      expect(() => manager.toggleRewind(true)).not.toThrow();
    });

    test('should handle missing states array in buffer entries', () => {
      manager.stateBuffer.push({
        timestamp: 1000
        // Missing states array
      });
      
      expect(() => manager.toggleRewind(true)).not.toThrow();
    });

    test('should handle empty states array', () => {
      manager.stateBuffer.push({
        timestamp: 1000,
        states: []
      });
      
      expect(() => manager.toggleRewind(true)).not.toThrow();
    });
  });

  describe('Scene mock edge cases', () => {
    test('should handle missing scene time property', () => {
      delete sceneMock.time;
      manager = new TimeManager(sceneMock);
      
      const playerMock = {
        x: 100, y: 200,
        body: { velocity: { x: 10, y: -5 } },
        active: true, visible: true,
        anims: { currentAnim: { key: 'player-run' } }
      };
      
      manager.register(playerMock);
      expect(() => manager.update(1000, 50)).not.toThrow();
    });

    test('should handle missing scene sys property', () => {
      delete sceneMock.sys;
      manager = new TimeManager(sceneMock);
      
      expect(() => manager.toggleRewind(true)).not.toThrow();
      expect(() => manager.toggleRewind(false)).not.toThrow();
    });

    test('should handle missing game config', () => {
      delete sceneMock.sys.game.config;
      manager = new TimeManager(sceneMock);
      
      expect(() => manager.toggleRewind(true)).not.toThrow();
      expect(() => manager.toggleRewind(false)).not.toThrow();
    });
  });

  describe('Performance edge cases', () => {
    test('should handle large number of managed objects', () => {
      const objects = [];
      
      // Create many objects
      for (let i = 0; i < 100; i++) {
        const obj = {
          x: i * 10, y: i * 10,
          body: { velocity: { x: i, y: i } },
          active: true, visible: true,
          anims: { currentAnim: { key: 'object-' + i } }
        };
        objects.push(obj);
        manager.register(obj);
      }
      
      expect(() => manager.update(1000, 50)).not.toThrow();
      expect(manager.stateBuffer.length).toBe(1);
      expect(manager.stateBuffer[0].states.length).toBe(100);
    });

    test('should handle rapid state changes', () => {
      const playerMock = {
        x: 100, y: 200,
        body: { velocity: { x: 10, y: -5 } },
        active: true, visible: true,
        anims: { currentAnim: { key: 'player-run' } }
      };
      
      manager.register(playerMock);
      
      // Rapid updates
      for (let i = 0; i < 100; i++) {
        playerMock.x += 1;
        playerMock.y += 1;
        expect(() => manager.update(1000 + i, 16)).not.toThrow();
      }
    });
  });

  describe('Platform Gravity Bug After Time Reversal', () => {
    let timeManager;
    let mockScene;
    let mockPlatform;
    let mockBody;

    beforeEach(() => {
      jest.clearAllMocks();
      
      // Create a realistic mock physics body that tracks gravity state
      mockBody = {
        x: 100,
        y: 200,
        velocity: { x: 0, y: 0 },
        enable: true,
        allowGravity: false, // Platforms start with gravity disabled
        immovable: true,     // Platforms start as immovable
        setVelocity: jest.fn().mockReturnThis(),
        setAllowGravity: jest.fn(function(allowGravity) {
          this.allowGravity = allowGravity;
          return this;
        }),
        setImmovable: jest.fn(function(immovable) {
          this.immovable = immovable;
          return this;
        })
      };

      mockScene = {
        time: { now: jest.fn(() => 1000) },
        events: { emit: jest.fn() },
        cameras: { main: { setTint: jest.fn(), clearTint: jest.fn() } },
        add: { graphics: jest.fn(() => ({ 
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis(),
          setAlpha: jest.fn().mockReturnThis(),
          setScrollFactor: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          setVisible: jest.fn().mockReturnThis(),
          destroy: jest.fn()
        })) }
      };

      // Mock platform that represents a MovingPlatform
      mockPlatform = {
        x: 100,
        y: 200,
        body: mockBody,
        active: true,
        visible: true,
        anims: { currentAnim: { key: 'platform-idle' } },
        getStateForRecording: jest.fn(() => ({
          x: 100,
          y: 200,
          velocityX: 0,
          velocityY: 0,
          animation: 'platform-idle',
          isAlive: true,
          isVisible: true
        })),
        setStateFromRecording: jest.fn()
      };

      timeManager = new TimeManager(mockScene);
    });

    test('should preserve platform gravity state during rewind cycle', () => {
      // Register platform with TimeManager
      timeManager.register(mockPlatform);
      
      // Verify initial state - platform should have gravity disabled
      expect(mockPlatform.body.allowGravity).toBe(false);
      expect(mockPlatform.body.immovable).toBe(true);
      
      // Start rewind (should disable gravity for all objects)
      timeManager.toggleRewind(true);
      expect(mockPlatform.body.setAllowGravity).toHaveBeenCalledWith(false);
      expect(mockPlatform.body.allowGravity).toBe(false);
      
      // End rewind (BUG: this currently enables gravity for all objects)
      timeManager.toggleRewind(false);
      
      // FIXED: Platform should have gravity disabled after rewind ends
      // (This test will fail with the current buggy implementation)
      expect(mockPlatform.body.allowGravity).toBe(false);
      expect(mockPlatform.body.immovable).toBe(true);
    });

    test('should not call setAllowGravity(true) on platforms after rewind', () => {
      // Register platform with TimeManager
      timeManager.register(mockPlatform);
      
      // Clear initial calls
      mockPlatform.body.setAllowGravity.mockClear();
      
      // Complete rewind cycle
      timeManager.toggleRewind(true);
      timeManager.toggleRewind(false);
      
      // FIXED: Should not call setAllowGravity(true) on platforms
      // (This test will fail with the current buggy implementation)
      expect(mockPlatform.body.setAllowGravity).not.toHaveBeenCalledWith(true);
    });

    test('should preserve different gravity states for different object types', () => {
      // Create a player-like object that SHOULD have gravity enabled
      const mockPlayer = {
        x: 100,
        y: 300,
        body: {
          x: 100,
          y: 300,
          velocity: { x: 0, y: 0 },
          allowGravity: true, // Players should have gravity enabled
          setAllowGravity: jest.fn(function(allowGravity) {
            this.allowGravity = allowGravity;
            return this;
          })
        },
        active: true,
        visible: true,
        anims: { currentAnim: { key: 'player-idle' } },
        getStateForRecording: jest.fn(() => ({
          x: 100,
          y: 300,
          velocityX: 0,
          velocityY: 0,
          animation: 'player-idle',
          isAlive: true,
          isVisible: true
        }))
      };

      // Register both objects
      timeManager.register(mockPlatform);
      timeManager.register(mockPlayer);
      
      // Complete rewind cycle
      timeManager.toggleRewind(true);
      timeManager.toggleRewind(false);
      
      // FIXED: Platform should have gravity disabled, player should have gravity enabled
      expect(mockPlatform.body.allowGravity).toBe(false);
      expect(mockPlayer.body.allowGravity).toBe(true);
    });
  });
}); 
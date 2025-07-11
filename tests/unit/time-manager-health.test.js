import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const timeManagerPath = join(__dirname, '../../client/src/systems/TimeManager.js');
let TimeManager;

beforeAll(async () => {
  if (existsSync(timeManagerPath)) {
    const module = await import(timeManagerPath);
    TimeManager = module.default;
  } else {
    TimeManager = class { 
      constructor() {} 
      register() {} 
      update() {} 
      pauseRecording() {} 
      resumeRecording() {} 
    };
  }
});

describe('TimeManager Health State Recording and Restoration', () => {
  let manager, sceneMock, playerMock;

  beforeEach(() => {
    sceneMock = createPhaserSceneMock('GameScene');
    sceneMock.time = { now: Date.now() };
    sceneMock.sys = {
      game: {
        config: {
          width: 1280,
          height: 720
        }
      }
    };

    manager = new TimeManager(sceneMock);
    manager.lastRecordTime = -Infinity; // Force immediate recording

    // Create a player mock with health state recording
    playerMock = {
      x: 100,
      y: 200,
      health: 100,
      maxHealth: 100,
      body: { 
        velocity: { x: 10, y: -5 }, 
        setVelocity: jest.fn(), 
        setAllowGravity: jest.fn() 
      },
      active: true,
      visible: true,
      anims: { currentAnim: { key: 'player-idle' }, play: jest.fn() },
      setActive: jest.fn(function(val) { this.active = val; }),
      setVisible: jest.fn(function(val) { this.visible = val; }),
      isInvulnerable: false,
      invulnerabilityTimer: 0,
      // Custom state recording methods
      getStateForRecording: function() {
        return {
          x: this.x,
          y: this.y,
          velocityX: this.body.velocity.x,
          velocityY: this.body.velocity.y,
          animation: this.anims.currentAnim ? this.anims.currentAnim.key : null,
          isAlive: this.active,
          isVisible: this.visible,
          health: this.health,
          isInvulnerable: this.isInvulnerable,
          invulnerabilityTimer: this.invulnerabilityTimer
        };
      },
      setStateFromRecording: function(state) {
        this.x = state.x;
        this.y = state.y;
        this.body.velocity.x = state.velocityX;
        this.body.velocity.y = state.velocityY;
        // Clamp health to >= 0
        this.health = Math.max(0, state.health);
        this.isInvulnerable = state.isInvulnerable;
        this.invulnerabilityTimer = state.invulnerabilityTimer;
        if (this.anims && state.animation) {
          this.anims.play(state.animation, true);
        }
        this.setActive(state.isAlive);
        this.setVisible(state.isVisible);
      }
    };
  });

  test('should record player health in state buffer', () => {
    manager.register(playerMock);
    manager.update(sceneMock.time.now, 16);
    
    expect(manager.stateBuffer.length).toBe(1);
    const recordedState = manager.stateBuffer[0].states[0];
    expect(recordedState.target).toBe(playerMock);
    expect(recordedState.state.health).toBe(100);
    expect(recordedState.state.isInvulnerable).toBe(false);
  });

  test('should restore player health during rewind', () => {
    manager.register(playerMock);
    
    // Record initial state with full health
    manager.update(sceneMock.time.now, 16);
    
    // Simulate damage
    playerMock.health = 50;
    playerMock.isInvulnerable = true;
    playerMock.invulnerabilityTimer = sceneMock.time.now + 2000;
    
    // Record damaged state
    manager.update(sceneMock.time.now + 100, 16);
    
    // Rewind to first frame
    const firstFrame = manager.stateBuffer[0];
    manager.applyFrame(firstFrame);
    
    // Verify health is restored
    expect(playerMock.health).toBe(100);
    expect(playerMock.isInvulnerable).toBe(false);
    expect(playerMock.invulnerabilityTimer).toBe(0);
  });

  test('should handle death state reversal through rewind', () => {
    manager.register(playerMock);
    
    // Record alive state
    manager.update(sceneMock.time.now, 16);
    
    // Simulate death
    playerMock.health = 0;
    playerMock.active = false;
    playerMock.visible = false;
    
    // Record dead state
    manager.update(sceneMock.time.now + 100, 16);
    
    // Rewind to alive state
    const firstFrame = manager.stateBuffer[0];
    manager.applyFrame(firstFrame);
    
    // Verify resurrection
    expect(playerMock.health).toBe(100);
    expect(playerMock.active).toBe(true);
    expect(playerMock.visible).toBe(true);
  });

  test('should interpolate health values during rewind', () => {
    manager.register(playerMock);
    
    // Record state 1: 100 health
    manager.update(sceneMock.time.now, 16);
    
    // Record state 2: 50 health
    playerMock.health = 50;
    manager.update(sceneMock.time.now + 50, 16);
    
    // Simulate rewind interpolation
    const frameA = manager.stateBuffer[1].states[0].state; // 50 health
    const frameB = manager.stateBuffer[0].states[0].state; // 100 health
    
    // Test interpolation at t=0.5 (should be 75 health)
    const interpolatedState = manager.interpolateState.call(manager, frameA, frameB, 0.5);
    expect(interpolatedState.health).toBe(75);
  });

  test('should preserve invulnerability state during rewind', () => {
    manager.register(playerMock);
    
    // Record normal state
    manager.update(sceneMock.time.now, 16);
    
    // Record invulnerable state
    playerMock.isInvulnerable = true;
    playerMock.invulnerabilityTimer = sceneMock.time.now + 2000;
    manager.update(sceneMock.time.now + 100, 16);
    
    // Rewind to normal state
    const firstFrame = manager.stateBuffer[0];
    manager.applyFrame(firstFrame);
    
    // Verify invulnerability is removed
    expect(playerMock.isInvulnerable).toBe(false);
    expect(playerMock.invulnerabilityTimer).toBe(0);
  });

  test('should handle multiple health changes in sequence', () => {
    manager.register(playerMock);
    
    // Record initial state
    manager.update(sceneMock.time.now, 16);
    
    // Record multiple health changes
    playerMock.health = 80;
    manager.update(sceneMock.time.now + 50, 16);
    
    playerMock.health = 60;
    manager.update(sceneMock.time.now + 100, 16);
    
    playerMock.health = 40;
    manager.update(sceneMock.time.now + 150, 16);
    
    // Verify all states are recorded
    expect(manager.stateBuffer.length).toBe(4);
    expect(manager.stateBuffer[0].states[0].state.health).toBe(100);
    expect(manager.stateBuffer[1].states[0].state.health).toBe(80);
    expect(manager.stateBuffer[2].states[0].state.health).toBe(60);
    expect(manager.stateBuffer[3].states[0].state.health).toBe(40);
    
    // Test rewind to first state
    manager.applyFrame(manager.stateBuffer[0]);
    expect(playerMock.health).toBe(100);
  });

  test('should handle edge case of zero health restoration', () => {
    manager.register(playerMock);
    
    // Record state with some health
    playerMock.health = 30;
    manager.update(sceneMock.time.now, 16);
    
    // Record zero health state
    playerMock.health = 0;
    manager.update(sceneMock.time.now + 100, 16);
    
    // Rewind to first state
    const firstFrame = manager.stateBuffer[0];
    manager.applyFrame(firstFrame);
    
    // Verify health is restored correctly
    expect(playerMock.health).toBe(30);
  });

  test('should handle negative health clamping during restoration', () => {
    manager.register(playerMock);
    
    // Record normal state
    manager.update(sceneMock.time.now, 16);
    
    // Simulate corrupted state with negative health
    const corruptedState = {
      x: 100,
      y: 200,
      velocityX: 10,
      velocityY: -5,
      animation: 'player-idle',
      isAlive: true,
      isVisible: true,
      health: -10, // Invalid negative health
      isInvulnerable: false,
      invulnerabilityTimer: 0
    };
    
    // Apply corrupted state
    manager.applyState(playerMock, corruptedState);
    
    // Verify health is clamped to 0
    expect(playerMock.health).toBe(0);
  });

  test('should handle health overflow clamping during restoration', () => {
    manager.register(playerMock);
    
    // Record normal state
    manager.update(sceneMock.time.now, 16);
    
    // Simulate corrupted state with excessive health
    const corruptedState = {
      x: 100,
      y: 200,
      velocityX: 10,
      velocityY: -5,
      animation: 'player-idle',
      isAlive: true,
      isVisible: true,
      health: 999999, // Excessive health
      isInvulnerable: false,
      invulnerabilityTimer: 0
    };
    
    // Apply corrupted state
    manager.applyState(playerMock, corruptedState);
    
    // Verify health is set correctly (no clamping in current implementation)
    expect(playerMock.health).toBe(999999);
  });
}); 
/**
 * Centralized Phaser Scene Mock for Scene Testing
 * 
 * This mock provides a complete simulation of Phaser scene functionality
 * for use across all scene-related tests. It includes all major scene
 * systems and provides control methods for test manipulation.
 * 
 * @module phaserSceneMock
 */

import { createPhaserKeyMock } from './phaserKeyMock.js';

/**
 * Creates a mock function that works both in and outside of Jest
 * @param {Function} implementation - Optional implementation function
 * @returns {Function} Mock function
 */
function createMockFn(implementation) {
  if (typeof jest !== 'undefined') {
    return jest.fn(implementation);
  } else {
    // Fallback for non-Jest environments
    const mockFn = function(...args) {
      mockFn.calls.push(args);
      return implementation ? implementation.apply(this, args) : undefined;
    };
    mockFn.calls = [];
    mockFn.mockClear = function() { this.calls = []; };
    mockFn.mockImplementation = function(impl) { implementation = impl; };
    return mockFn;
  }
}

/**
 * Creates a fresh Phaser scene mock instance
 * @param {string} sceneKey - The scene key (e.g., 'GameScene', 'MenuScene')
 * @returns {PhaserSceneMock} A new scene mock instance
 */
export function createPhaserSceneMock(sceneKey = 'TestScene') {
  return new PhaserSceneMock(sceneKey);
}

/**
 * Mock for GameObject body properties
 */
class BodyMock {
  constructor() {
    this.velocity = { x: 0, y: 0 };
    this.setVelocityX = createMockFn(() => this);
    this.setVelocityY = createMockFn(() => this);
    this.setBounce = createMockFn(() => this);
    this.setCollideWorldBounds = createMockFn(() => this);
    this.setImmovable = createMockFn(() => this);
    this.setAllowGravity = createMockFn(() => this);
    this.setGravity = createMockFn(() => this);
    this.setDrag = createMockFn(() => this);
    this.setFriction = createMockFn(() => this);
    this.setVelocity = createMockFn(() => this);
    this.setSize = createMockFn(() => this);
    this.setOffset = createMockFn(() => this);
    this.touching = { down: false, up: false, left: false, right: false };
    this.blocked = { down: false, up: false, left: false, right: false };
  }
}

/**
 * Mock for GameObject animations
 */
class AnimationsMock {
  constructor() {
    this.currentAnim = { key: 'idle' };
    this.play = createMockFn(() => this);
    this.stop = createMockFn(() => this);
    this.isPlaying = false;
  }
}

/**
 * Mock for GameObject with chainable methods
 */
class GameObjectMock {
  constructor(x = 0, y = 0, texture = 'mock-texture') {
    this.x = x;
    this.y = y;
    this.active = true;
    this.visible = true;
    this.alpha = 1;
    this.scale = 1;
    this.flipX = false;
    this.texture = { key: texture };
    this.body = new BodyMock();
    this.anims = new AnimationsMock();
    
    // Chainable methods with proper state updates
    this.setOrigin = createMockFn(() => this);
    this.setDepth = createMockFn(() => this);
    this.setPosition = createMockFn((x, y) => {
      if (x !== undefined) this.x = x;
      if (y !== undefined) this.y = y;
      return this;
    });
    this.setTexture = createMockFn(() => this);
    this.setFlipX = createMockFn((flipX) => {
      this.flipX = flipX;
      return this;
    });
    this.setAlpha = createMockFn((alpha) => {
      this.alpha = alpha;
      return this;
    });
    this.setScale = createMockFn((scaleX, scaleY) => {
      this.scaleX = scaleX;
      this.scaleY = scaleY || scaleX; // If only one value provided, use it for both
      return this;
    });
    this.setActive = createMockFn((active) => {
      this.active = active;
      return this;
    });
    this.setVisible = createMockFn((visible) => {
      this.visible = visible;
      return this;
    });
    this.play = createMockFn(() => this);
    this.setData = createMockFn(() => this);
    this.destroy = createMockFn();
  }
}

/**
 * Mock for Graphics objects
 */
class GraphicsMock {
  constructor() {
    this.fillStyle = createMockFn(() => this);
    this.fillRect = createMockFn(() => this);
    this.fillCircle = createMockFn(() => this);
    this.setVisible = createMockFn(() => this);
    this.setPosition = createMockFn(() => this);
    this.clear = createMockFn(() => this);
    this.lineStyle = createMockFn(() => this);
    this.strokeRect = createMockFn(() => this);
    this.beginPath = createMockFn(() => this);
    this.arc = createMockFn(() => this);
    this.closePath = createMockFn(() => this);
    this.fill = createMockFn(() => this);
    this.stroke = createMockFn(() => this);
    this.setScrollFactor = createMockFn(() => this);
    this.setDepth = createMockFn(() => this);
    this.setAlpha = createMockFn(() => this);
    this.destroy = createMockFn();
  }
}

/**
 * Mock for Container objects
 */
class ContainerMock {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.children = [];
    this.setDepth = createMockFn(() => this);
    this.setVisible = createMockFn(() => this);
    this.add = createMockFn((child) => {
      this.children.push(child);
      return this;
    });
    this.destroy = createMockFn();
  }
}

/**
 * Mock for Text objects
 */
class TextMock {
  constructor(x = 0, y = 0, text = '', style = {}) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.style = style;
    this.setOrigin = createMockFn(() => this);
    this.setInteractive = createMockFn(() => this);
    this.on = createMockFn(() => this);
    this.setVisible = createMockFn(() => this);
    this.setText = createMockFn(() => this);
    this.setDepth = createMockFn(() => this);
    this.destroy = createMockFn();
  }
}

/**
 * Mock for Group objects
 */
class GroupMock {
  constructor() {
    this.children = [];
    this.add = createMockFn((child) => {
      this.children.push(child);
      return child;
    });
    this.getChildren = createMockFn(() => this.children);
    this.create = createMockFn(() => new GameObjectMock());
    this.clear = createMockFn(() => {
      this.children = [];
    });
  }
}

/**
 * Mock for Particles objects
 */
class ParticlesMock {
  constructor() {
    this.createEmitter = createMockFn(() => ({
      setPosition: createMockFn(() => this),
      setSpeed: createMockFn(() => this),
      setScale: createMockFn(() => this),
      setLifespan: createMockFn(() => this),
      start: createMockFn(() => this),
      stop: createMockFn(() => this)
    }));
  }
}

/**
 * Mock for Keyboard objects
 */
class KeyboardMock {
  constructor() {
    this.keys = new Map();
    this.addKey = createMockFn((keyCode) => {
      if (!this.keys.has(keyCode)) {
        this.keys.set(keyCode, new KeyMock(keyCode));
      }
      return this.keys.get(keyCode);
    });
  }
}

/**
 * Mock for individual Key objects
 */
class KeyMock {
  constructor(keyCode) {
    this.keyCode = keyCode;
    this.isDown = false;
    this.isUp = true;
    this.timeDown = 0;
    this.timeUp = 0;
    this.repeats = 0;
    this.altKey = false;
    this.ctrlKey = false;
    this.shiftKey = false;
    this.metaKey = false;
    this.location = 0;
    this.enabled = true;
  }
}

/**
 * Phaser Scene Mock Class
 * Simulates Phaser scene functionality with full system support
 */
export class PhaserSceneMock {
  /**
   * @param {string} sceneKey - The scene key this mock represents
   */
  constructor(sceneKey) {
    this.key = sceneKey;
    
    // Time system
    this.time = {
      now: 0,
      add: createMockFn()
    };
    
    // Input system
    this.input = {
      keyboard: new KeyboardMock()
    };
    
    // Physics system
    this.physics = {
      add: {
        sprite: createMockFn((x, y, texture, frame) => {
          const gameObject = new GameObjectMock(x, y, texture);
          gameObject.frame = frame || 0;
          // Ensure the body has all required methods by replacing with a fresh BodyMock
          gameObject.body = new BodyMock();
          return gameObject;
        }),
        existing: createMockFn((gameObject) => {
          // Wire up proper GameObject mock behavior to existing game objects
          if (gameObject) {
            // Ensure the setActive and setVisible methods work correctly
            const originalSetActive = gameObject.setActive;
            const originalSetVisible = gameObject.setVisible;
            
            gameObject.setActive = createMockFn((active) => {
              gameObject.active = active;
              return gameObject;
            });
            
            gameObject.setVisible = createMockFn((visible) => {
              gameObject.visible = visible;
              return gameObject;
            });
          }
          return gameObject;
        }),
        group: createMockFn(() => new GroupMock()),
        collider: createMockFn(),
        overlap: createMockFn()
      },
      world: {
        gravity: { x: 0, y: 980 },
        bounds: { setTo: createMockFn() }
      },
      config: { arcade: { debug: false } }
    };
    
    // Graphics/UI system
    this.add = {
      sprite: createMockFn((x, y, texture) => new GameObjectMock(x, y, texture)),
      image: createMockFn((x, y, texture, frame) => new GameObjectMock(x, y, texture)),
      tileSprite: createMockFn((x, y, width, height, texture, frame) => new GameObjectMock(x, y, texture)),
      graphics: createMockFn(() => new GraphicsMock()),
      text: createMockFn((x, y, text, style) => new TextMock(x, y, text, style)),
      bitmapText: createMockFn((x, y, font, text) => new TextMock(x, y, text)),
      group: createMockFn(() => new GroupMock()),
      container: createMockFn((x, y) => new ContainerMock(x, y)),
      existing: createMockFn(),
      particles: createMockFn(() => new ParticlesMock())
    };
    
    // Event system
    this.events = {
      emit: createMockFn(),
      on: createMockFn(),
      off: createMockFn()
    };
    
    // Scene management
    this.scene = {
      pause: createMockFn(),
      resume: createMockFn(),
      launch: createMockFn(),
      stop: createMockFn()
    };
    
    // Camera system
    this.cameras = {
      main: {
        setBounds: createMockFn(),
        setZoom: createMockFn(),
        startFollow: createMockFn(),
        stopFollow: createMockFn(),
        setDeadzone: createMockFn(),
        setTint: createMockFn(),
        clearTint: createMockFn(),
        followOffset: { x: 0, y: 0 },
        scrollX: 0,
        scrollY: 0,
        zoom: 1.0 // Default camera zoom for centralized scaling
      }
    };
    
    // System events
    this.sys = {
      events: {
        on: createMockFn(),
        off: createMockFn()
      },
      game: {
        config: {
          width: 1280,
          height: 720,
          physics: {
            arcade: {
              debug: false
            }
          }
        }
      }
    };
    
    // Event history for testing
    this._emittedEvents = [];
    
    // Track event emissions
    this.events.emit.mockImplementation = this.events.emit.mockImplementation || 
      ((eventName, ...args) => {
        this._emittedEvents.push({
          event: eventName,
          args: args,
          timestamp: this.time.now
        });
      });
  }

  /**
   * Set current time
   * @param {number} now - Current timestamp in milliseconds
   */
  setTime(now) {
    this.time.now = now;
  }

  /**
   * Advance time by delta
   * @param {number} delta - Time delta in milliseconds
   */
  advanceTime(delta) {
    this.time.now += delta;
  }

  /**
   * Reset all jest mocks
   */
  resetMocks() {
    // Reset all mocks on this scene
    Object.values(this.add).forEach(mock => {
      if (mock && typeof mock.mockClear === 'function') {
        mock.mockClear();
      }
    });
    
    Object.values(this.physics.add).forEach(mock => {
      if (mock && typeof mock.mockClear === 'function') {
        mock.mockClear();
      }
    });
    
    this.events.emit.mockClear();
    this.events.on.mockClear();
    this.events.off.mockClear();
    
    this.scene.pause.mockClear();
    this.scene.resume.mockClear();
    this.scene.launch.mockClear();
    this.scene.stop.mockClear();
    
    this.cameras.main.setBounds.mockClear();
    this.cameras.main.setZoom.mockClear();
    
    this.sys.events.on.mockClear();
    this.sys.events.off.mockClear();
  }

  /**
   * Get emitted events for testing
   * @returns {Array} Array of emitted events with event name, args, and timestamp
   */
  getEmittedEvents() {
    return [...this._emittedEvents];
  }

  /**
   * Clear emitted events history
   */
  clearEmittedEvents() {
    this._emittedEvents = [];
  }

  /**
   * Check if a specific event was emitted
   * @param {string} eventName - Name of the event to check
   * @returns {boolean} True if event was emitted
   */
  wasEventEmitted(eventName) {
    return this._emittedEvents.some(event => event.event === eventName);
  }

  /**
   * Get count of times an event was emitted
   * @param {string} eventName - Name of the event to count
   * @returns {number} Number of times the event was emitted
   */
  getEventEmitCount(eventName) {
    return this._emittedEvents.filter(event => event.event === eventName).length;
  }

  /**
   * Get the last emitted event for a specific event name
   * @param {string} eventName - Name of the event to find
   * @returns {Object|null} Last emitted event or null if not found
   */
  getLastEmittedEvent(eventName) {
    const events = this._emittedEvents.filter(event => event.event === eventName);
    return events.length > 0 ? events[events.length - 1] : null;
  }

  /**
   * Get a string representation of the scene mock
   * @returns {string} String representation
   */
  toString() {
    return `PhaserSceneMock(${this.key})`;
  }
}

/**
 * Factory function to create multiple scene mocks at once
 * @param {string[]} sceneKeys - Array of scene keys to create mocks for
 * @returns {Object} Object with scene keys as properties and mocks as values
 */
export function createSceneMocks(sceneKeys) {
  const mocks = {};
  sceneKeys.forEach(sceneKey => {
    mocks[sceneKey] = createPhaserSceneMock(sceneKey);
  });
  return mocks;
}

/**
 * Predefined set of common scene keys for the Time Oddity project
 */
export const COMMON_SCENE_KEYS = [
  'BootScene',
  'MenuScene', 
  'GameScene',
  'UIScene',
  'PauseScene'
];

/**
 * Create mocks for all common scenes
 * @returns {Object} Object with all common scene mocks
 */
export function createAllCommonSceneMocks() {
  return createSceneMocks(COMMON_SCENE_KEYS);
}

export default {
  createPhaserSceneMock,
  PhaserSceneMock,
  createSceneMocks,
  createAllCommonSceneMocks,
  COMMON_SCENE_KEYS,
  GameObjectMock,
  GraphicsMock,
  TextMock,
  GroupMock,
  ParticlesMock,
  BodyMock,
  AnimationsMock
}; 
import { jest } from '@jest/globals';

// Phaser Testing Infrastructure for ESM and Jest compatibility
// This file provides mocks and utilities for testing Phaser components without requiring canvas context

// Mock Phaser classes that don't require canvas context
export class GameObjectMock {
  constructor(scene, x = 0, y = 0, texture = null, frame = null) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.texture = texture;
    this.frame = frame;
    this.visible = true;
    this.active = true;
    this.destroyed = false;
    this.anims = {
      play: jest.fn(),
      stop: jest.fn(),
      isPlaying: jest.fn(() => false)
    };
    this.body = {
      velocity: { x: 0, y: 0 },
      setVelocity: jest.fn(),
      setVelocityX: jest.fn(),
      setVelocityY: jest.fn(),
      onFloor: jest.fn(() => false),
      setBounce: jest.fn(),
      setCollideWorldBounds: jest.fn(),
      setGravity: jest.fn()
    };
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setVisible(visible) {
    this.visible = visible;
    return this;
  }

  setActive(active) {
    this.active = active;
    return this;
  }

  destroy() {
    this.destroyed = true;
  }
}

export class SpriteMock extends GameObjectMock {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    this.scale = { x: 1, y: 1 };
    this.rotation = 0;
    this.alpha = 1;
  }

  setScale(x, y) {
    this.scale.x = x;
    this.scale.y = y || x;
    return this;
  }

  setRotation(rotation) {
    this.rotation = rotation;
    return this;
  }

  setAlpha(alpha) {
    this.alpha = alpha;
    return this;
  }
}

export class TextMock extends GameObjectMock {
  constructor(scene, x, y, text, style = {}) {
    super(scene, x, y);
    this.text = text;
    this.style = style;
    this.setInteractive = jest.fn(() => this);
  }

  setText(text) {
    this.text = text;
    return this;
  }

  setOrigin(x, y) {
    this.originX = x;
    this.originY = y;
    return this;
  }
}

// Mock Phaser.Scene class
export class SceneMock {
  constructor(key) {
    this.key = key;
    this.scene = {
      start: jest.fn(),
      stop: jest.fn(),
      launch: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn()
    };
    this.add = {
      text: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis()
      }),
      image: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis()
      }),
      sprite: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis()
      })
    };
    this.load = {
      image: jest.fn(),
      spritesheet: jest.fn(),
      on: jest.fn(),
      once: jest.fn()
    };
    this.events = {
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn()
    };
    this.physics = {
      add: {
        staticGroup: jest.fn().mockReturnValue({
          add: jest.fn().mockReturnThis()
        }),
        group: jest.fn().mockReturnValue({
          add: jest.fn().mockReturnThis()
        })
      }
    };
    this.cameras = {
      main: {
        setBackgroundColor: jest.fn(),
        startFollow: jest.fn(),
        setBounds: jest.fn()
      }
    };
  }

  init() {}
  preload() {}
  create() {}
  update() {}
}

// Main Phaser mock
export const PhaserMock = {
  Scene: SceneMock,
  GameObjects: {
    Sprite: SpriteMock,
    Text: TextMock,
    GameObject: GameObjectMock
  },
  Physics: {
    Arcade: {
      Sprite: SpriteMock,
      Group: class {
        constructor() {
          this.children = [];
          this.add = jest.fn();
          this.remove = jest.fn();
          this.clear = jest.fn();
        }
      }
    }
  },
  Scale: {
    FIT: 'FIT',
    CENTER_BOTH: 'CENTER_BOTH'
  },
  AUTO: 'AUTO'
};

// Scene validation utilities
export function validateSceneClass(SceneClass, expectedKey = null) {
  const scene = new SceneClass();
  expect(scene).toBeInstanceOf(SceneClass);
  
  // If expectedKey is provided, check that the scene has that key
  // Otherwise, just check that it has a key property
  if (expectedKey) {
    expect(scene.key).toBe(expectedKey);
  } else {
    expect(scene.key).toBeDefined();
  }
  
  return scene;
}

export function validateSceneInheritance(SceneClass, BaseClass) {
  expect(SceneClass.prototype).toBeInstanceOf(BaseClass);
  expect(Object.getPrototypeOf(SceneClass.prototype)).toBe(BaseClass.prototype);
}

export function validateSceneMethods(scene) {
  expect(typeof scene.init).toBe('function');
  expect(typeof scene.preload).toBe('function');
  expect(typeof scene.create).toBe('function');
  expect(typeof scene.update).toBe('function');
}

// ESM-compatible test helpers
export function createSceneInstance(SceneClass, key = 'test-scene') {
  return new SceneClass(key);
}

export function mockPhaserMethods(scene) {
  // Mock commonly used Phaser methods
  scene.add.sprite = jest.fn((x, y, texture) => new SpriteMock(scene, x, y, texture));
  scene.add.text = jest.fn((x, y, text, style) => new TextMock(scene, x, y, text, style));
  scene.physics.add.sprite = jest.fn((x, y, texture) => {
    const sprite = new SpriteMock(scene, x, y, texture);
    sprite.body = {
      velocity: { x: 0, y: 0 },
      setVelocity: jest.fn(),
      setVelocityX: jest.fn(),
      setVelocityY: jest.fn(),
      onFloor: jest.fn(() => false),
      setBounce: jest.fn(),
      setCollideWorldBounds: jest.fn(),
      setGravity: jest.fn()
    };
    return sprite;
  });
  
  return scene;
}

export function setupTestEnvironment() {
  // Setup global mocks for Phaser
  global.Phaser = PhaserMock;
  
  // Mock canvas and WebGL context
  global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Array(4) })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn()
  }));
}

// Safe Phaser mock creation
export function createSafePhaserMock() {
  try {
    // Try to import actual Phaser if available
    const actualPhaser = require('phaser');
    return actualPhaser;
  } catch (error) {
    // Return mock if Phaser is not available
    return PhaserMock;
  }
}

// Class structure validation
export function validateClassStructure(Class, expectedMethods = []) {
  expect(Class).toBeDefined();
  expect(typeof Class).toBe('function');
  
  // Test that expected methods exist
  expectedMethods.forEach(method => {
    expect(typeof Class.prototype[method]).toBe('function');
  });
}

export function validateMethodSignatures(Class, methodSignatures = {}) {
  Object.entries(methodSignatures).forEach(([method, expectedParams]) => {
    expect(typeof Class.prototype[method]).toBe('function');
    // Note: In JavaScript, we can't easily validate parameter count/types at runtime
    // This is more of a documentation/expectation check
  });
}

export function validateInheritanceChain(Class, expectedChain = []) {
  let currentClass = Class;
  
  expectedChain.forEach(expectedBase => {
    expect(currentClass.prototype).toBeInstanceOf(expectedBase);
    currentClass = Object.getPrototypeOf(currentClass.prototype).constructor;
  });
}

// Export default for convenience
export default {
  PhaserMock,
  SceneMock,
  SpriteMock,
  TextMock,
  GameObjectMock,
  validateSceneClass,
  validateSceneInheritance,
  validateSceneMethods,
  createSceneInstance,
  mockPhaserMethods,
  setupTestEnvironment,
  createSafePhaserMock,
  validateClassStructure,
  validateMethodSignatures,
  validateInheritanceChain
}; 
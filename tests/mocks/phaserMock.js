import { jest } from "@jest/globals";
// Centralized Phaser mock for all tests
if (typeof globalThis.Phaser === 'undefined') {
  globalThis.Phaser = {};
}
if (!globalThis.Phaser.Input) {
  globalThis.Phaser.Input = {};
}
if (!globalThis.Phaser.Input.Keyboard) {
  globalThis.Phaser.Input.Keyboard = {};
}
if (!globalThis.Phaser.Input.Keyboard.KeyCodes) {
  globalThis.Phaser.Input.Keyboard.KeyCodes = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UP: 'UP',
    DOWN: 'DOWN',
    A: 'A',
    D: 'D',
    W: 'W',
    S: 'S',
    SPACE: 'SPACE',
    SHIFT: 'SHIFT',
    R: 'R',
  };
}
globalThis.Phaser.Input.Keyboard.JustDown = jest.fn();
globalThis.Phaser.Input.Keyboard.JustUp = jest.fn();

// Provide a global mock for scene.input.keyboard.addKey
if (typeof globalThis.scene === 'undefined') {
  globalThis.scene = {};
}
if (!globalThis.scene.input) {
  globalThis.scene.input = {};
}
if (!globalThis.scene.input.keyboard) {
  globalThis.scene.input.keyboard = {
    addKey: jest.fn(() => ({ isDown: false, isUp: true })),
  };
}

// Mock Phaser.Physics.Arcade.Group
if (!globalThis.Phaser.Physics) {
  globalThis.Phaser.Physics = {};
}
if (!globalThis.Phaser.Physics.Arcade) {
  globalThis.Phaser.Physics.Arcade = {};
}
globalThis.Phaser.Physics.Arcade.Group = class {
  create() {
    return { setOrigin: jest.fn().mockReturnThis() };
  }
};

// Provide a global mock for scene.physics.add.sprite
if (!globalThis.scene.physics) {
  globalThis.scene.physics = {};
}
if (!globalThis.scene.physics.add) {
  globalThis.scene.physics.add = {};
}
globalThis.scene.physics.add.sprite = jest.fn(() => ({
  ...createMockGameObject(),
  body: createMockBody(),
  play: jest.fn().mockReturnThis(),
  parentCoin: null,
}));
globalThis.scene.physics.add.existing = jest.fn();
globalThis.scene.physics.add.collider = jest.fn();
globalThis.scene.physics.add.overlap = jest.fn();

// Mock GameObject with chainable methods
const mockGameObject = {
  x: 0,
  y: 0,
  active: true,
  visible: true,
  alpha: 1,
  scale: 1,
  flipX: false,
  texture: { key: 'mock-texture' },
  setOrigin: jest.fn().mockReturnThis(),
  setDepth: jest.fn().mockReturnThis(),
  setPosition: jest.fn().mockReturnThis(),
  setTexture: jest.fn().mockReturnThis(),
  setFlipX: jest.fn().mockReturnThis(),
  setAlpha: jest.fn().mockReturnThis(),
  setScale: jest.fn().mockReturnThis(),
  setActive: jest.fn().mockReturnThis(),
  setVisible: jest.fn().mockReturnThis(),
  anims: {
    play: jest.fn(),
    isPlaying: false,
    currentAnim: null,
  },
  body: {
    setVelocityX: jest.fn(),
    setVelocityY: jest.fn(),
    setBounce: jest.fn(),
    setCollideWorldBounds: jest.fn(),
    setAllowGravity: jest.fn(),
    setSize: jest.fn().mockReturnThis(),
    setOffset: jest.fn().mockReturnThis(),
    touching: { down: false, up: false, left: false, right: false },
    blocked: { down: false, up: false, left: false, right: false },
  },
  destroy: jest.fn(),
};

// Add AUTO constant
const AUTO = 'AUTO';

// Mock Scene class
class Scene {
  constructor(key) {
    // Deep clone mockScene to ensure all nested methods are present
    const deepClone = obj => JSON.parse(JSON.stringify(obj));
    Object.assign(this, deepClone(mockScene));
    this.key = key;
    // Manually assign function properties from mockScene.add and mockScene.physics.add
    this.add = { ...mockScene.add };
    this.physics = { ...this.physics, add: { ...mockScene.physics.add } };
    // Ensure events property is properly copied
    this.events = { ...mockScene.events };
    // Ensure all function properties from mockScene.physics.add are present
    Object.keys(mockScene.physics.add).forEach(fn => {
      if (typeof mockScene.physics.add[fn] === 'function') {
        this.physics.add[fn] = mockScene.physics.add[fn];
      }
    });
    // Also assign to this.scene.physics.add if present
    if (this.scene && this.scene.physics && this.scene.physics.add) {
      Object.keys(mockScene.physics.add).forEach(fn => {
        if (typeof mockScene.physics.add[fn] === 'function') {
          this.scene.physics.add[fn] = mockScene.physics.add[fn];
        }
      });
    }
    // FINAL fallback: forcibly assign collider as a function on all nested physics.add objects
    if (this.physics && this.physics.add) {
      this.physics.add.collider = jest.fn();
    }
    if (this.scene && this.scene.physics && this.scene.physics.add) {
      this.scene.physics.add.collider = jest.fn();
    }
  }
}

// Mock Input
const Input = {
  Keyboard: {
    KeyCodes: {
      LEFT: 'LEFT',
      RIGHT: 'RIGHT',
      UP: 'UP',
      DOWN: 'DOWN',
      A: 'A',
      D: 'D',
      W: 'W',
      S: 'S',
      SPACE: 'SPACE',
      SHIFT: 'SHIFT',
      R: 'R',
    },
  },
};

// Mock Game class
class Game {
  constructor(config) {
    this.config = config;
    this.scene = { add: jest.fn() };
  }
}

// Mock Physics
class ArcadeSprite {
  constructor(scene, x = 0, y = 0, texture, frame) {
    Object.assign(this, mockGameObject);
    if (scene) this.scene = scene;
    this.x = x;
    this.y = y;
    this.texture = texture;
    this.frame = frame;
    this.body = createMockBody();
  }
}
const Physics = {
  Arcade: {
    Sprite: ArcadeSprite,
    Group: class {},
  },
};

// Helper to create a fresh mockGameObject
function createMockGameObject() {
  return {
    x: 0,
    y: 0,
    active: true,
    visible: true,
    body: createMockBody(),
    setOrigin: jest.fn().mockReturnThis(),
    setDepth: jest.fn().mockReturnThis(),
    setPosition: jest.fn().mockReturnThis(),
    setTexture: jest.fn().mockReturnThis(),
    setFlipX: jest.fn().mockReturnThis(),
    setAlpha: jest.fn().mockReturnThis(),
    setScale: jest.fn().mockReturnThis(),
    setActive: jest.fn().mockReturnThis(),
    setVisible: jest.fn().mockReturnThis(),
    anims: {
      play: jest.fn(),
      isPlaying: false,
      currentAnim: null,
    },
    destroy: jest.fn(),
  };
}

// Mock Scene object (for composition)
const mockScene = {
  add: {
    sprite: jest.fn(() => createMockGameObject()),
    text: jest.fn(() => ({
      setText: jest.fn(),
      setOrigin: jest.fn().mockReturnThis(),
      setInteractive: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      destroy: jest.fn().mockReturnThis(),
    })),
    existing: jest.fn(),
    group: jest.fn(() => ({
      add: jest.fn(),
      getChildren: jest.fn(() => [createMockGameObject(), createMockGameObject(), createMockGameObject(), createMockGameObject(), createMockGameObject()]),
    })),
    graphics: jest.fn(() => ({
      setPosition: jest.fn().mockReturnThis(),
      lineStyle: jest.fn().mockReturnThis(),
      strokeCircle: jest.fn().mockReturnThis(),
      fillStyle: jest.fn().mockReturnThis(),
      fillCircle: jest.fn().mockReturnThis(),
      destroy: jest.fn().mockReturnThis(),
      scale: 1,
      alpha: 1,
    })),
  },
  physics: {
    add: {
      sprite: jest.fn(() => ({
        play: jest.fn().mockReturnThis(),
        body: { setAllowGravity: jest.fn() },
        parentCoin: null,
        destroy: jest.fn(),
      })),
      group: jest.fn(() => ({ create: jest.fn(() => mockGameObject) })),
      existing: jest.fn(),
      collider: jest.fn(),
      overlap: jest.fn(),
    },
    world: {
      enable: jest.fn(),
      gravity: { y: 0 },
      tileBias: 0,
      bounds: { setTo: jest.fn() },
    },
    config: { debug: false },
  },
  input: {
    keyboard: {
      addKey: jest.fn(() => ({ isDown: false, isUp: true })),
      on: jest.fn(),
      keys: {},
    },
    on: jest.fn(),
  },
  anims: {
    create: jest.fn(),
    generateFrameNumbers: jest.fn(),
  },
  time: {
    addEvent: jest.fn(),
    now: 0,
  },
  cameras: {
    main: {
      setBounds: jest.fn(),
      setTint: jest.fn(),
      clearTint: jest.fn(),
    },
  },
  sys: {
    game: {
      config: {
        physics: { arcade: { debug: false } },
        width: 800,
        height: 600,
      },
    },
    events: { on: jest.fn(), off: jest.fn() },
  },
  platforms: { create: jest.fn(() => mockGameObject) },
  players: { create: jest.fn(() => mockGameObject) },
  enemies: { create: jest.fn(() => mockGameObject) },
  coins: { create: jest.fn(() => mockGameObject) },
  events: {
    on: jest.fn(),
  },
  key: 'GameScene',
};

// Mock Scale constants
const Scale = {
  FIT: 'FIT',
  CENTER_BOTH: 'CENTER_BOTH',
};

// Default export for ESM
const PhaserDefault = {
  Scene,
  Input,
  Physics,
  Scale,
  Game,
  AUTO,
};

// Ensure add.existing and physics.add.existing are always present
mockScene.add.existing = jest.fn();
mockScene.physics.add.existing = jest.fn();

// Ensure global scene.add.group is always available
if (!globalThis.scene.add) {
  globalThis.scene.add = {};
}
globalThis.scene.add.group = jest.fn(() => ({
  add: jest.fn(),
  getChildren: jest.fn(() => [createMockGameObject(), createMockGameObject(), createMockGameObject(), createMockGameObject(), createMockGameObject()]),
}));

// Also patch global scene.add.graphics for any global usage
if (!globalThis.scene.add) globalThis.scene.add = {};
globalThis.scene.add.graphics = mockScene.add.graphics;

// Patch for Arcade Physics Body
function createMockBody() {
  return {
    setSize: jest.fn().mockReturnThis(),
    setOffset: jest.fn().mockReturnThis(),
    setGravity: jest.fn().mockReturnThis(),
    setAllowGravity: jest.fn().mockReturnThis(),
    setCollideWorldBounds: jest.fn().mockReturnThis(),
    setBounce: jest.fn().mockReturnThis(),
    setVelocityX: jest.fn().mockReturnThis(),
    setVelocityY: jest.fn().mockReturnThis(),
    setVelocity: jest.fn().mockReturnThis(),
    setImmovable: jest.fn().mockReturnThis(),
    setAllowGravity: jest.fn().mockReturnThis(),
    setCollisionGroup: jest.fn().mockReturnThis(),
    enable: true,
    velocity: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    height: 0,
    width: 0,
    x: 0,
    y: 0,
    blocked: { left: false, right: false, down: false, up: false },
    onFloor: jest.fn().mockReturnValue(false),
  };
}

export default PhaserDefault;
export { Scene, Input, Physics, Scale, Game, AUTO, mockScene, mockGameObject }; 
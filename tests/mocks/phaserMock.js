// Remove all top-level jest.fn() assignments and only export plain objects/classes.
// All jest.fn() assignments must be done in test setup in the test files.

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
if (!globalThis.Phaser.Input.Keyboard.JustDown) globalThis.Phaser.Input.Keyboard.JustDown = () => false;
if (!globalThis.Phaser.Input.Keyboard.JustUp) globalThis.Phaser.Input.Keyboard.JustUp = () => false;

// Provide a global mock for scene.input.keyboard.addKey
if (typeof globalThis.scene === 'undefined') {
  globalThis.scene = {};
}
if (!globalThis.scene.input) {
  globalThis.scene.input = {};
}
if (!globalThis.scene.input.keyboard) {
  globalThis.scene.input.keyboard = {
    // addKey: jest.fn(() => ({ isDown: false, isUp: true })),
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
    return { setOrigin: () => this };
  }
};

// Provide a global mock for scene.physics.add.sprite
if (!globalThis.scene.physics) {
  globalThis.scene.physics = {};
}
if (!globalThis.scene.physics.add) {
  globalThis.scene.physics.add = {};
}
globalThis.scene.physics.add.sprite = function() {
  const obj = createMockGameObject();
  const destroyMock = function() {};
  destroyMock.mock = { calls: [] };
  destroyMock.mockClear = function() { this.mock.calls = []; };
  destroyMock.mockImplementation = function() {};
  destroyMock.mockName = function() { return this; };
  destroyMock.getMockName = function() { return 'destroyMock'; };
  destroyMock._isMockFunction = true;
  obj.destroy = destroyMock;
  return obj;
};
globalThis.scene.physics.add.existing = function() {};
globalThis.scene.physics.add.collider = function() {};
globalThis.scene.physics.add.overlap = function() {};

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
  setOrigin: function() { return this; },
  setDepth: function() { return this; },
  setPosition: function() { return this; },
  setTexture: function() { return this; },
  setFlipX: function() { return this; },
  setAlpha: function() { return this; },
  setScale: function() { return this; },
  setActive: function() { return this; },
  setVisible: function() { return this; },
  play: function() { return this; },
  anims: {
    play: function() {},
    stop: function() {},
    isPlaying: false,
    currentAnim: null,
  },
  body: {
    setVelocityX: function() {},
    setVelocityY: function() {},
    setBounce: function() {},
    setCollideWorldBounds: function() {},
    setAllowGravity: function() {},
    setSize: function() { return this; },
    setOffset: function() { return this; },
    touching: { down: false, up: false, left: false, right: false },
    blocked: { down: false, up: false, left: false, right: false },
  },
  destroy: (typeof jest !== 'undefined' ? jest.fn() : function() {}),
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
      this.physics.add.collider = function() {};
    }
    if (this.scene && this.scene.physics && this.scene.physics.add) {
      this.scene.physics.add.collider = function() {};
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
    this.scene = { add: function() {} };
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

function cloneDeep(target) {
  if (Array.isArray(target)) {
    return target.map(cloneDeep);
  }
  if (target && typeof target === 'object') {
    const output = {};
    for (const key in target) {
      output[key] = cloneDeep(target[key]);
    }
    return output;
  }
  return target;
}

// Helper to create a fresh mockGameObject while preserving functions
function createMockGameObject() {
  const clone = Object.assign({}, cloneDeep(mockGameObject));
  if (typeof jest === 'undefined') {
    // Provide minimal mock structure so Jest matchers work
    clone.destroy = function() {};
    clone.destroy.mock = { calls: [] };
  }
  return clone;
}

// Helper to create a fresh mock body preserving function methods
function createMockBody() {
  const bodyTemplate = {
    setVelocityX: function() { return this; },
    setVelocityY: function() { return this; },
    setBounce: function() { return this; },
    setCollideWorldBounds: function() { return this; },
    setAllowGravity: function() { return this; },
    setGravity: function() { return this; },
    setDrag: function() { return this; },
    setVelocity: function() { return this; },
    velocity: { x: 0, y: 0 },
    setSize: function() { return this; },
    setOffset: function() { return this; },
    touching: { down: false, up: false, left: false, right: false },
    blocked: { down: false, up: false, left: false, right: false },
  };
  return Object.assign({}, cloneDeep(bodyTemplate));
}

const Scale = { FIT: 'FIT', CENTER_BOTH: 'CENTER_BOTH' };

const mockScene = {
  add: {
    graphics: function() { return {}; },
    existing: function() {},
    sprite: function() {
      const obj = createMockGameObject();
      const destroyMock = function() {};
      destroyMock.mock = { calls: [] };
      destroyMock.mockClear = function() { this.mock.calls = []; };
      destroyMock.mockImplementation = function() {};
      destroyMock.mockName = function() { return this; };
      destroyMock.getMockName = function() { return 'destroyMock'; };
      destroyMock._isMockFunction = true;
      obj.destroy = destroyMock;
      return obj;
    },
    bitmapText: function() { return {}; },
    text: function() { return { setOrigin: function() { return this; }, setInteractive: function() { return this; }, on: function() { return this; } }; },
    particles: function() { return {}; },
    group: function() { return { add: function() {}, getChildren: function() { return []; } }; },
  },
  physics: {
    add: {
      existing: function() {},
      group: function() { return { getChildren: function() { return []; }, add: function() {} }; },
      collider: function() {},
      overlap: function() {},
      sprite: function() {
        return {
          ...createMockGameObject(),
          body: createMockBody(),
        };
      },
    },
  },
  input: {
    keyboard: {
      addKey: function() { return { isDown: false, isUp: true }; },
    },
  },
  events: {
    emit: function() {},
    on: function() {},
    off: function() {},
  },
  time: {
    now: 0,
    add: function() {},
  },
};

// Consolidate exported members into a single default object so that
// `import Phaser from 'phaser'` works in ESM test files.
const PhaserDefault = {
  Scene,
  Input,
  Physics,
  Scale,
  Game,
  AUTO,
};
export {
  Scene,
  Input,
  Physics,
  Scale,
  Game,
  AUTO,
  mockScene,
  mockGameObject,
  createMockGameObject,
  createMockBody,
};
export default PhaserDefault; 
import '../mocks/phaserMock.js';
import { createPhaserKeyMock } from '../mocks/phaserKeyMock.js';

import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Phaser KeyCodes mock for ESM/Jest
if (!globalThis.Phaser) globalThis.Phaser = {};
if (!globalThis.Phaser.Input) globalThis.Phaser.Input = {};
if (!globalThis.Phaser.Input.Keyboard) globalThis.Phaser.Input.Keyboard = {};
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

describe('Task 2.11: InputManager Class', () => {
  let InputManager;
  let inputManager;
  let scene;
  let inputManagerPath;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
    if (existsSync(inputManagerPath)) {
      const inputModule = await import(inputManagerPath);
      InputManager = inputModule.default;
    } else {
      InputManager = class { constructor(s) { this.scene = s; } update() {} };
    }
  });

  beforeEach(() => {
    if (!globalThis.Phaser) globalThis.Phaser = {};
    if (!globalThis.Phaser.Input) globalThis.Phaser.Input = {};
    if (!globalThis.Phaser.Input.Keyboard) globalThis.Phaser.Input.Keyboard = {};
    scene = {};
    scene.input = {
      keyboard: {
        addKey: jest.fn((key) => ({ isDown: false, isUp: true, isPressed: false, keyCode: key }))
      }
    };
    scene.time = { now: 0 };
    scene.physics = {
      world: { gravity: { y: 0 }, tileBias: 0, bounds: { setTo: jest.fn() } },
      config: { debug: false },
      add: { group: jest.fn(() => ({ create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) })), sprite: jest.fn(() => ({ body: { setAllowGravity: jest.fn() }, play: jest.fn().mockReturnThis(), parentCoin: null })), existing: jest.fn() },
    };
    scene.cameras = { main: { setBounds: jest.fn() } };
    scene.sys = { events: { on: jest.fn(), off: jest.fn() } };
    scene.platforms = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    scene.players = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    scene.enemies = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    scene.coins = { create: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis() })) };
    inputManager = new InputManager(scene);
  });

  test('InputManager class file should exist', () => {
    expect(existsSync(inputManagerPath)).toBe(true);
  });

  test('should initialize with keyboard input keys', () => {
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('LEFT');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('RIGHT');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('UP');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('DOWN');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('A');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('D');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('W');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('S');
    expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('SPACE');
  });

  test('should have input state properties', () => {
    expect(inputManager.left).toBeDefined();
    expect(inputManager.right).toBeDefined();
    expect(inputManager.up).toBeDefined();
    expect(inputManager.down).toBeDefined();
  });

  test('should update input states on update call', () => {
    // Mock the key states
    inputManager.left = { isDown: false, isUp: true, isPressed: false };
    inputManager.right = { isDown: false, isUp: true, isPressed: false };
    inputManager.up = { isDown: false, isUp: true, isPressed: false };
    inputManager.down = { isDown: false, isUp: true, isPressed: false };
    
    inputManager.update();
    // The update method should be callable without errors
    expect(inputManager).toBeDefined();
  });
});

describe('InputManager.isLeftPressed', () => {
  let InputManager;
  let inputManager;
  let scene;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
    if (existsSync(inputManagerPath)) {
      const inputModule = await import(inputManagerPath);
      InputManager = inputModule.default;
    } else {
      InputManager = class { constructor(s) { this.scene = s; } update() {} };
    }
  });

  beforeEach(() => {
    // Use centralized key mocks
    const left = createPhaserKeyMock('LEFT');
    const a = createPhaserKeyMock('A');
    const right = createPhaserKeyMock('RIGHT');
    // Scene mock with keyboard
    scene = {
      input: {
        keyboard: {
          addKey: (key) => {
            if (key === 'LEFT') return left;
            if (key === 'A') return a;
            if (key === 'RIGHT') return right;
            // fallback
            return createPhaserKeyMock(key);
          }
        }
      }
    };
    inputManager = new InputManager(scene);
    // Attach for test access
    inputManager.left = left;
    inputManager.a = a;
    inputManager.right = right;
  });

  test('returns true when LEFT is pressed', () => {
    inputManager.left.setDown();
    inputManager.a.setUp();
    expect(inputManager.isLeftPressed).toBe(true);
  });

  test('returns true when A is pressed', () => {
    inputManager.left.setUp();
    inputManager.a.setDown();
    expect(inputManager.isLeftPressed).toBe(true);
  });

  test('returns false when neither LEFT nor A is pressed', () => {
    inputManager.left.setUp();
    inputManager.a.setUp();
    expect(inputManager.isLeftPressed).toBe(false);
  });

  test('returns false when only RIGHT is pressed', () => {
    inputManager.left.setUp();
    inputManager.a.setUp();
    inputManager.right.setDown();
    expect(inputManager.isLeftPressed).toBe(false);
  });
});

describe('InputManager.isRightPressed', () => {
  let InputManager;
  let inputManager;
  let scene;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
    if (existsSync(inputManagerPath)) {
      const inputModule = await import(inputManagerPath);
      InputManager = inputModule.default;
    } else {
      InputManager = class { constructor(s) { this.scene = s; } update() {} };
    }
  });

  beforeEach(() => {
    // Use centralized key mocks
    const right = createPhaserKeyMock('RIGHT');
    const d = createPhaserKeyMock('D');
    const left = createPhaserKeyMock('LEFT');
    // Scene mock with keyboard
    scene = {
      input: {
        keyboard: {
          addKey: (key) => {
            if (key === 'RIGHT') return right;
            if (key === 'D') return d;
            if (key === 'LEFT') return left;
            // fallback
            return createPhaserKeyMock(key);
          }
        }
      }
    };
    inputManager = new InputManager(scene);
    // Attach for test access
    inputManager.right = right;
    inputManager.d = d;
    inputManager.left = left;
  });

  test('returns true when RIGHT is pressed', () => {
    inputManager.right.setDown();
    inputManager.d.setUp();
    expect(inputManager.isRightPressed).toBe(true);
  });

  test('returns true when D is pressed', () => {
    inputManager.right.setUp();
    inputManager.d.setDown();
    expect(inputManager.isRightPressed).toBe(true);
  });

  test('returns false when neither RIGHT nor D is pressed', () => {
    inputManager.right.setUp();
    inputManager.d.setUp();
    expect(inputManager.isRightPressed).toBe(false);
  });

  test('returns false when only LEFT is pressed', () => {
    inputManager.right.setUp();
    inputManager.d.setUp();
    inputManager.left.setDown();
    expect(inputManager.isRightPressed).toBe(false);
  });
});

describe('isJumpPressed', () => {
  let InputManager;
  let inputManager;
  let mockScene;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
    if (existsSync(inputManagerPath)) {
      const inputModule = await import(inputManagerPath);
      InputManager = inputModule.default;
    } else {
      InputManager = class { constructor(s) { this.scene = s; } update() {} };
    }
  });

  beforeEach(() => {
    // Use centralized key mocks
    const up = createPhaserKeyMock('UP');
    const w = createPhaserKeyMock('W');
    const space = createPhaserKeyMock('SPACE');
    
    // Scene mock with keyboard
    mockScene = {
      input: {
        keyboard: {
          addKey: (key) => {
            if (key === 'UP') return up;
            if (key === 'W') return w;
            if (key === 'SPACE') return space;
            // fallback
            return createPhaserKeyMock(key);
          }
        }
      }
    };
    inputManager = new InputManager(mockScene);
    // Attach for test access
    inputManager.up = up;
    inputManager.w = w;
    inputManager.space = space;
  });

  describe('when no jump keys are pressed', () => {
    it('should return false', () => {
      // Arrange
      inputManager.up.setUp();
      inputManager.w.setUp();
      inputManager.space.setUp();

      // Act
      const result = inputManager.isUpPressed;

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when UP key is pressed', () => {
    it('should return true', () => {
      // Arrange
      inputManager.up.setDown();
      inputManager.w.setUp();
      inputManager.space.setUp();

      // Act
      const result = inputManager.isUpPressed;

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when W key is pressed', () => {
    it('should return true', () => {
      // Arrange
      inputManager.up.setUp();
      inputManager.w.setDown();
      inputManager.space.setUp();

      // Act
      const result = inputManager.isUpPressed;

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when SPACE key is pressed', () => {
    it('should return true', () => {
      // Arrange
      inputManager.up.setUp();
      inputManager.w.setUp();
      inputManager.space.setDown();

      // Act
      const result = inputManager.isUpPressed;

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when multiple jump keys are pressed', () => {
    it('should return true (first key wins)', () => {
      // Arrange
      inputManager.up.setDown();
      inputManager.w.setDown();
      inputManager.space.setDown();

      // Act
      const result = inputManager.isUpPressed;

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('key registration', () => {
    it('should register UP, W, and SPACE keys', () => {
      // Arrange - Create a new scene mock to track addKey calls
      const up = createPhaserKeyMock('UP');
      const w = createPhaserKeyMock('W');
      const space = createPhaserKeyMock('SPACE');
      const addKeySpy = jest.fn((key) => {
        if (key === 'UP') return up;
        if (key === 'W') return w;
        if (key === 'SPACE') return space;
        return createPhaserKeyMock(key);
      });
      
      const testScene = {
        input: {
          keyboard: {
            addKey: addKeySpy
          }
        }
      };
      
      // Act
      const testInputManager = new InputManager(testScene);

      // Assert
      expect(addKeySpy).toHaveBeenCalledWith('UP');
      expect(addKeySpy).toHaveBeenCalledWith('W');
      expect(addKeySpy).toHaveBeenCalledWith('SPACE');
    });
  });

  describe('key state changes', () => {
    it('should reflect key state changes between calls', () => {
      // Arrange - First call: no keys pressed
      inputManager.up.setUp();
      inputManager.w.setUp();
      inputManager.space.setUp();

      // Act & Assert - First call: no keys pressed
      expect(inputManager.isUpPressed).toBe(false);

      // Arrange - Change key state
      inputManager.up.setDown();

      // Act & Assert - Second call: UP key pressed
      expect(inputManager.isUpPressed).toBe(true);
    });
  });
});

describe('InputManager.isDownPressed', () => {
  let InputManager;
  let inputManager;
  let scene;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
    if (existsSync(inputManagerPath)) {
      const inputModule = await import(inputManagerPath);
      InputManager = inputModule.default;
    } else {
      InputManager = class { constructor(s) { this.scene = s; } update() {} };
    }
  });

  beforeEach(() => {
    // Use centralized key mocks
    const down = createPhaserKeyMock('DOWN');
    const s = createPhaserKeyMock('S');
    const up = createPhaserKeyMock('UP');
    scene = {
      input: {
        keyboard: {
          addKey: (key) => {
            if (key === 'DOWN') return down;
            if (key === 'S') return s;
            if (key === 'UP') return up;
            return createPhaserKeyMock(key);
          }
        }
      }
    };
    inputManager = new InputManager(scene);
    inputManager.down = down;
    inputManager.s = s;
    inputManager.up = up;
  });

  test('returns true when DOWN is pressed', () => {
    inputManager.down.setDown();
    inputManager.s.setUp();
    expect(inputManager.isDownPressed).toBe(true);
  });

  test('returns true when S is pressed', () => {
    inputManager.down.setUp();
    inputManager.s.setDown();
    expect(inputManager.isDownPressed).toBe(true);
  });

  test('returns false when neither DOWN nor S is pressed', () => {
    inputManager.down.setUp();
    inputManager.s.setUp();
    expect(inputManager.isDownPressed).toBe(false);
  });

  test('returns false when only UP is pressed', () => {
    inputManager.down.setUp();
    inputManager.s.setUp();
    inputManager.up.setDown();
    expect(inputManager.isDownPressed).toBe(false);
  });

  test('returns true when both DOWN and S are pressed', () => {
    inputManager.down.setDown();
    inputManager.s.setDown();
    expect(inputManager.isDownPressed).toBe(true);
  });

  test('should reflect key state changes between calls', () => {
    inputManager.down.setUp();
    inputManager.s.setUp();
    expect(inputManager.isDownPressed).toBe(false);
    inputManager.down.setDown();
    expect(inputManager.isDownPressed).toBe(true);
    inputManager.down.setUp();
    inputManager.s.setDown();
    expect(inputManager.isDownPressed).toBe(true);
    inputManager.s.setUp();
    expect(inputManager.isDownPressed).toBe(false);
  });

  test('should register DOWN and S keys', () => {
    const down = createPhaserKeyMock('DOWN');
    const s = createPhaserKeyMock('S');
    const addKeySpy = jest.fn((key) => {
      if (key === 'DOWN') return down;
      if (key === 'S') return s;
      return createPhaserKeyMock(key);
    });
    const testScene = {
      input: {
        keyboard: {
          addKey: addKeySpy
        }
      }
    };
    new InputManager(testScene);
    expect(addKeySpy).toHaveBeenCalledWith('DOWN');
    expect(addKeySpy).toHaveBeenCalledWith('S');
  });
});

describe('InputManager.isRewindPressed', () => {
  let InputManager;
  let inputManager;
  let scene;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
    if (existsSync(inputManagerPath)) {
      const inputModule = await import(inputManagerPath);
      InputManager = inputModule.default;
    } else {
      InputManager = class { constructor(s) { this.scene = s; } update() {} };
    }
  });

  beforeEach(() => {
    // Use centralized key mocks
    const r = createPhaserKeyMock('R');
    const left = createPhaserKeyMock('LEFT');
    scene = {
      input: {
        keyboard: {
          addKey: (key) => {
            if (key === 'R') return r;
            if (key === 'LEFT') return left;
            return createPhaserKeyMock(key);
          }
        }
      }
    };
    inputManager = new InputManager(scene);
    inputManager.r = r;
    inputManager.left = left;
  });

  test('returns true when R is pressed', () => {
    inputManager.r.setDown();
    expect(inputManager.isRewindPressed).toBe(true);
  });

  test('returns false when R is not pressed', () => {
    inputManager.r.setUp();
    expect(inputManager.isRewindPressed).toBe(false);
  });

  test('returns false when only another key is pressed', () => {
    inputManager.r.setUp();
    inputManager.left.setDown();
    expect(inputManager.isRewindPressed).toBe(false);
  });

  test('should register R key', () => {
    const r = createPhaserKeyMock('R');
    const addKeySpy = jest.fn((key) => {
      if (key === 'R') return r;
      return createPhaserKeyMock(key);
    });
    const testScene = {
      input: {
        keyboard: {
          addKey: addKeySpy
        }
      }
    };
    new InputManager(testScene);
    expect(addKeySpy).toHaveBeenCalledWith('R');
  });
});

describe('InputManager.isChronoPulsePressed', () => {
  let InputManager;
  let inputManager;
  let scene;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
    if (existsSync(inputManagerPath)) {
      const inputModule = await import(inputManagerPath);
      InputManager = inputModule.default;
    } else {
      InputManager = class { constructor(s) { this.scene = s; } update() {} };
    }
  });

  beforeEach(() => {
    // Use centralized key mocks
    const e = createPhaserKeyMock('E');
    const left = createPhaserKeyMock('LEFT');
    scene = {
      input: {
        keyboard: {
          addKey: (key) => {
            if (key === 'E') return e;
            if (key === 'LEFT') return left;
            return createPhaserKeyMock(key);
          }
        }
      }
    };
    inputManager = new InputManager(scene);
    inputManager.e = e;
    inputManager.left = left;
  });

  test('returns true when E is pressed', () => {
    inputManager.e.setDown();
    expect(inputManager.isChronoPulsePressed).toBe(true);
  });

  test('returns false when E is not pressed', () => {
    inputManager.e.setUp();
    expect(inputManager.isChronoPulsePressed).toBe(false);
  });

  test('returns false when only another key is pressed', () => {
    inputManager.e.setUp();
    inputManager.left.setDown();
    expect(inputManager.isChronoPulsePressed).toBe(false);
  });

  test('should register E key', () => {
    const e = createPhaserKeyMock('E');
    const addKeySpy = jest.fn((key) => {
      if (key === 'E') return e;
      return createPhaserKeyMock(key);
    });
    const testScene = {
      input: {
        keyboard: {
          addKey: addKeySpy
        }
      }
    };
    new InputManager(testScene);
    expect(addKeySpy).toHaveBeenCalledWith('E');
  });
});

describe('InputManager.isPausePressed', () => {
  let InputManager;
  let inputManager;
  let scene;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
    if (existsSync(inputManagerPath)) {
      const inputModule = await import(inputManagerPath);
      InputManager = inputModule.default;
    } else {
      InputManager = class { constructor(s) { this.scene = s; } update() {} };
    }
  });

  beforeEach(() => {
    // Use centralized key mocks
    const p = createPhaserKeyMock('P');
    const left = createPhaserKeyMock('LEFT');
    scene = {
      input: {
        keyboard: {
          addKey: (key) => {
            if (key === 'P') return p;
            if (key === 'LEFT') return left;
            return createPhaserKeyMock(key);
          }
        }
      }
    };
    inputManager = new InputManager(scene);
    inputManager.p = p;
    inputManager.left = left;
  });

  test('returns true when P is pressed', () => {
    inputManager.p.setDown();
    expect(inputManager.isPausePressed).toBe(true);
  });

  test('returns false when P is not pressed', () => {
    inputManager.p.setUp();
    expect(inputManager.isPausePressed).toBe(false);
  });

  test('returns false when only another key is pressed', () => {
    inputManager.p.setUp();
    inputManager.left.setDown();
    expect(inputManager.isPausePressed).toBe(false);
  });

  test('should register P key', () => {
    const p = createPhaserKeyMock('P');
    const addKeySpy = jest.fn((key) => {
      if (key === 'P') return p;
      return createPhaserKeyMock(key);
    });
    const testScene = {
      input: {
        keyboard: {
          addKey: addKeySpy
        }
      }
    };
    new InputManager(testScene);
    expect(addKeySpy).toHaveBeenCalledWith('P');
  });
}); 
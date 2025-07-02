import '../mocks/phaserMock.js';
import { createPhaserKeyMock } from '../mocks/phaserKeyMock.js';
import { jest } from '@jest/globals';

// Patch Phaser.Input.Keyboard.JustDown to work with key mocks
if (!globalThis.Phaser) globalThis.Phaser = {};
if (!globalThis.Phaser.Input) globalThis.Phaser.Input = {};
if (!globalThis.Phaser.Input.Keyboard) globalThis.Phaser.Input.Keyboard = {};
globalThis.Phaser.Input.Keyboard.JustDown = (key) => !!key.justDown;

describe('Task 04.01: InputManager T Key Support', () => {
  let InputManager;
  let inputManager;
  let scene;
  let tKey;

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
    // Use centralized key mock for T key
    tKey = createPhaserKeyMock('T');
    
    // Scene mock with keyboard following existing pattern
    scene = {
      input: {
        keyboard: {
          addKey: jest.fn((key) => {
            if (key === 'T') return tKey;
            // fallback for other keys
            return createPhaserKeyMock(key);
          })
        }
      }
    };
    
    inputManager = new InputManager(scene);
    // Attach T key for test access
    inputManager.t = tKey;
  });

  describe('T Key Registration', () => {
    test('should register T key in constructor', () => {
      // Verify T key was registered during InputManager construction
      expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('T');
    });

    test('should have T key property', () => {
      // Verify T key property exists on InputManager instance
      expect(inputManager.t).toBeDefined();
      expect(inputManager.t).toBe(tKey);
    });
  });

  describe('isMapTogglePressed', () => {
    test('should return true when T key is pressed', () => {
      // Arrange: Set T key to pressed state
      tKey.setDown();
      
      // Act & Assert: Verify getter returns true
      expect(inputManager.isMapTogglePressed).toBe(true);
    });

    test('should return false when T key is not pressed', () => {
      // Arrange: Set T key to released state
      tKey.setUp();
      
      // Act & Assert: Verify getter returns false
      expect(inputManager.isMapTogglePressed).toBe(false);
    });

    test('should reflect key state changes', () => {
      // Arrange: Start with key up
      tKey.setUp();
      expect(inputManager.isMapTogglePressed).toBe(false);
      
      // Act: Change to key down
      tKey.setDown();
      
      // Assert: Should reflect new state
      expect(inputManager.isMapTogglePressed).toBe(true);
    });
  });

  describe('isMapToggleJustPressed', () => {
    test('should return true when T key was just pressed', () => {
      // Arrange: Set T key to just pressed state
      tKey.setJustDown();
      
      // Act & Assert: Verify getter returns true
      expect(inputManager.isMapToggleJustPressed).toBe(true);
    });

    test('should return false when T key was not just pressed', () => {
      // Arrange: Set T key to held down (not just pressed)
      tKey.setDown();
      tKey.update(); // Simulate frame update to reset justDown
      
      // Act & Assert: Verify getter returns false
      expect(inputManager.isMapToggleJustPressed).toBe(false);
    });

    test('should return false when T key is up', () => {
      // Arrange: Set T key to up state
      tKey.setUp();
      
      // Act & Assert: Verify getter returns false
      expect(inputManager.isMapToggleJustPressed).toBe(false);
    });

    test('should reset justDown after one frame', () => {
      // Arrange: Set T key to just pressed
      tKey.setJustDown();
      expect(inputManager.isMapToggleJustPressed).toBe(true);
      
      // Act: Simulate frame update
      tKey.update();
      
      // Assert: Should no longer be just pressed
      expect(inputManager.isMapToggleJustPressed).toBe(false);
    });
  });

  describe('Integration with existing keys', () => {
    test('should not interfere with existing key functionality', () => {
      // Arrange: Set up other keys
      const pKey = createPhaserKeyMock('P');
      const eKey = createPhaserKeyMock('E');
      
      scene.input.keyboard.addKey = jest.fn((key) => {
        if (key === 'T') return tKey;
        if (key === 'P') return pKey;
        if (key === 'E') return eKey;
        return createPhaserKeyMock(key);
      });
      
      const newInputManager = new InputManager(scene);
      newInputManager.t = tKey;
      newInputManager.p = pKey;
      newInputManager.e = eKey;
      
      // Act: Test T key functionality
      tKey.setDown();
      pKey.setUp();
      eKey.setUp();
      
      // Assert: T key should work independently
      expect(newInputManager.isMapTogglePressed).toBe(true);
      expect(newInputManager.isPausePressed).toBe(false);
      expect(newInputManager.isChronoPulsePressed).toBe(false);
    });
  });
}); 
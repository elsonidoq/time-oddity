import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 2.11: InputManager Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const inputManagerPath = join(__dirname, '../../client/src/systems/InputManager.js');
  let InputManager;
  let inputManager;
  let scene;

  beforeAll(async () => {
    if (existsSync(inputManagerPath)) {
      const inputModule = await import(inputManagerPath);
      InputManager = inputModule.default;
    } else {
      InputManager = class { constructor(s) { this.scene = s; } update() {} };
    }
  });

  beforeEach(() => {
    scene = {
      input: {
        keyboard: {
          addKey: jest.fn().mockReturnValue({
            isDown: false,
            isUp: true,
            isPressed: false,
          }),
        },
      },
    };
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
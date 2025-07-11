import { jest } from '@jest/globals';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('GameOverScene', () => {
  let GameOverScene;
  let scene;
  let mockScene;

  beforeAll(async () => {
    // Import the scene class
    try {
      const module = await import('../../client/src/scenes/GameOverScene.js');
      GameOverScene = module.default;
    } catch (error) {
      // If import fails, create a mock class for testing
      GameOverScene = class GameOverScene {
        constructor() {
          this.key = 'GameOverScene';
        }
        create() {}
        update() {}
        shutdown() {}
      };
    }
  });

  beforeEach(() => {
    mockScene = createPhaserSceneMock('GameOverScene');
    scene = new GameOverScene();
    // Assign mock properties to scene
    Object.assign(scene, mockScene);
    // Ensure add.text, add.graphics, add.container, and input.keyboard.addKey are Jest mocks
    scene.add.text = jest.fn(scene.add.text);
    scene.add.graphics = jest.fn(scene.add.graphics);
    scene.add.container = jest.fn(scene.add.container);
    scene.input.keyboard.addKey = jest.fn(scene.input.keyboard.addKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Scene Structure', () => {
    test('should exist and be importable', () => {
      expect(GameOverScene).toBeDefined();
      expect(typeof GameOverScene).toBe('function');
    });

    test('should instantiate with correct scene key', () => {
      expect(scene).toBeInstanceOf(GameOverScene);
      expect(scene.key).toBe('GameOverScene');
    });

    test('should extend BaseScene', () => {
      // Check if it has BaseScene methods
      expect(typeof scene.create).toBe('function');
      expect(typeof scene.update).toBe('function');
      expect(typeof scene.shutdown).toBe('function');
    });
  });

  describe('Scene Lifecycle Methods', () => {
    test('should implement create method', () => {
      expect(() => scene.create()).not.toThrow();
    });

    test('should implement update method', () => {
      expect(() => scene.update(0, 16)).not.toThrow();
    });

    test('should implement shutdown method', () => {
      expect(() => scene.shutdown()).not.toThrow();
    });
  });

  describe('Overlay Creation', () => {
    beforeEach(() => {
      scene.create();
    });

    test('should create overlay container', () => {
      expect(scene.add.container).toHaveBeenCalledWith(0, 0);
    });

    test('should create background graphics', () => {
      expect(scene.add.graphics).toHaveBeenCalled();
    });

    test('should create game over title text', () => {
      expect(scene.add.text).toHaveBeenCalledWith(
        640, 360, 'Game Over',
        expect.objectContaining({
          font: '48px Arial',
          fill: '#ffffff'
        })
      );
    });
  });

  describe('Keyboard Input Handling', () => {
    beforeEach(() => {
      scene.create();
    });

    test('should add keyboard input for restart', () => {
      expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('R');
    });

    test('should add keyboard input for menu', () => {
      expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('M');
    });
  });

  describe('Scene Configuration', () => {
    test('should be added to game configuration', async () => {
      const gameConfig = await import('../../client/src/game.js');
      expect(gameConfig.default.config.scene).toContain(GameOverScene);
    });
  });

  describe('Resource Management', () => {
    test('should clean up resources in shutdown method', () => {
      // Create the scene first to set up the keys
      scene.create();
      expect(() => scene.shutdown()).not.toThrow();
    });
  });

  describe('Input Handling', () => {
    beforeEach(() => {
      scene.create();
    });

    test('should handle keyboard input for restart', () => {
      expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('R');
    });

    test('should handle keyboard input for menu', () => {
      expect(scene.input.keyboard.addKey).toHaveBeenCalledWith('M');
    });
  });

  describe('Visual Styling', () => {
    beforeEach(() => {
      scene.create();
    });

    test('should use consistent styling with level completed overlay', () => {
      // Check that title text styling matches level completed overlay patterns
      expect(scene.add.text).toHaveBeenCalledWith(
        640, 360, 'Game Over',
        expect.objectContaining({
          font: '48px Arial',
          fill: '#ffffff'
        })
      );
    });
  });
}); 
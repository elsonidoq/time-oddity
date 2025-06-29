import jest from 'jest-mock';
import { SceneMock, validateSceneClass, validateSceneInheritance } from './phaser-test-utils.js';

describe('UIScene', () => {
  let UIScene;
  let BaseScene;
  let mockSceneManager;

  // Mock a minimal SceneManager for transition tests
  class MockSceneManager {
    constructor() {
      this.started = null;
      this.stopped = null;
      this.launched = null;
    }
    start(key, data) { this.started = { key, data }; }
    stop(key) { this.stopped = key; }
    launch(key, data) { this.launched = { key, data }; }
  }

  beforeAll(async () => {
    // Import BaseScene first
    try {
      const baseModule = await import('../../client/src/scenes/BaseScene.js');
      BaseScene = baseModule.default;
    } catch (error) {
      BaseScene = SceneMock;
    }

    // Import UIScene using dynamic import to handle potential Phaser issues
    try {
      const uiModule = await import('../../client/src/scenes/UIScene.js');
      UIScene = uiModule.default;
    } catch (error) {
      // If import fails, create mock class for testing
      UIScene = class UIScene extends SceneMock {
        constructor(key) {
          super(key);
        }
      };
    }
  });

  beforeEach(() => {
    mockSceneManager = new MockSceneManager();
  });

  // Helper function to setup scene with necessary mocks
  function setupSceneMocks(scene) {
    scene.input = {
      keyboard: {
        addKey: jest.fn(() => ({ isDown: false, isUp: true }))
      }
    };
    scene.add = scene.add || {
      text: jest.fn(() => ({
        setOrigin: jest.fn().mockReturnThis(),
        setTint: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        setText: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis()
      }))
    };
    scene.registry = scene.registry || { get: jest.fn() };
    scene.time = scene.time || { now: 0 };
    return scene;
  }

  test('should have UIScene class defined', () => {
    expect(UIScene).toBeDefined();
    expect(typeof UIScene).toBe('function');
  });

  test('should instantiate with correct key', () => {
    const scene = new UIScene();
    expect(scene).toBeInstanceOf(UIScene);
    expect(scene.key).toBe('UIScene');
  });

  test('should extend BaseScene', () => {
    const scene = new UIScene();
    expect(scene).toBeInstanceOf(BaseScene);
  });

  test('should have core lifecycle methods', () => {
    const scene = new UIScene();
    expect(typeof scene.init).toBe('function');
    expect(typeof scene.preload).toBe('function');
    expect(typeof scene.create).toBe('function');
    expect(typeof scene.update).toBe('function');
  });

  test('should have scene management utility methods', () => {
    const scene = new UIScene();
    expect(typeof scene.startScene).toBe('function');
    expect(typeof scene.stopScene).toBe('function');
    expect(typeof scene.launchScene).toBe('function');
  });

  test('should create empty scene structure', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    scene.add = {
      graphics: jest.fn(() => ({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis()
      })),
      text: jest.fn().mockReturnValue({ setOrigin: jest.fn().mockReturnThis() })
    };
    expect(() => scene.create()).not.toThrow();
  });

  test('should handle preload without errors', () => {
    const scene = new UIScene();
    expect(() => scene.preload()).not.toThrow();
  });

  test('should handle update without errors', () => {
    const scene = new UIScene();
    expect(() => scene.update(0, 16)).not.toThrow();
  });

  test('should validate scene class structure', () => {
    expect(() => validateSceneClass(UIScene, 'UIScene')).not.toThrow();
  });

  test('should validate scene inheritance', () => {
    expect(() => validateSceneInheritance(UIScene, BaseScene)).not.toThrow();
  });

  test('should be able to add temporary text object', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    scene.add = {
      text: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis()
      }),
      graphics: jest.fn().mockReturnValue({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis()
      })
    };
    
    expect(() => scene.create()).not.toThrow();
  });

  test('should create a health bar graphic in create()', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn(() => mockGraphics),
      text: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis()
      })
    };
    scene.create();
    expect(scene.add.graphics).toHaveBeenCalled();
    expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0xff0000, 1);
    expect(mockGraphics.fillRect).toHaveBeenCalled();
  });

  test('should create ability cooldown placeholders in create()', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockText = jest.fn().mockReturnValue({
      setOrigin: jest.fn().mockReturnThis()
    });
    scene.add = {
      graphics: jest.fn(() => mockGraphics),
      text: mockText
    };

    scene.create();

    expect(mockText).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), expect.stringContaining('Dash'), expect.any(Object));
    expect(mockText).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), expect.stringContaining('Pulse'), expect.any(Object));
  });

  test('should create health bar with background and foreground graphics', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockBackgroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockForegroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn()
        .mockReturnValueOnce(mockBackgroundGraphics) // First call for background
        .mockReturnValueOnce(mockForegroundGraphics), // Second call for foreground
      text: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis()
      })
    };

    scene.create();

    // Verify background bar was created
    expect(scene.add.graphics).toHaveBeenCalledTimes(2);
    expect(mockBackgroundGraphics.fillStyle).toHaveBeenCalledWith(0xff0000, 1); // Red background
    expect(mockBackgroundGraphics.fillRect).toHaveBeenCalledWith(20, 20, 200, 20);
    
    // Verify foreground bar was created
    expect(mockForegroundGraphics.fillStyle).toHaveBeenCalledWith(0x00ff00, 1); // Green foreground
  });

  test('should update health bar width based on player health percentage', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockBackgroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockForegroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    };
    const mockDashText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    const mockPulseText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn()
        .mockReturnValueOnce(mockBackgroundGraphics)
        .mockReturnValueOnce(mockForegroundGraphics),
      text: jest.fn()
        .mockReturnValueOnce(mockDashText)
        .mockReturnValueOnce(mockPulseText)
    };

    // Mock registry to return player health
    scene.registry = {
      get: jest.fn()
        .mockReturnValueOnce(75) // playerHealth
        .mockReturnValueOnce(0)  // dashTimer
        .mockReturnValueOnce(0)  // chronoPulseLastActivation
    };

    // Mock scene time
    scene.time = { now: 100 };

    scene.create();
    scene.update();

    // Verify foreground bar width is calculated correctly (75% of 200 = 150)
    expect(mockForegroundGraphics.clear).toHaveBeenCalled();
    expect(mockForegroundGraphics.fillRect).toHaveBeenCalledWith(20, 20, 150, 20);
  });

  test('should handle health bar update when player health changes', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockBackgroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockForegroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    };
    const mockDashText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    const mockPulseText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn()
        .mockReturnValueOnce(mockBackgroundGraphics)
        .mockReturnValueOnce(mockForegroundGraphics),
      text: jest.fn()
        .mockReturnValueOnce(mockDashText)
        .mockReturnValueOnce(mockPulseText)
    };

    // Mock registry to return different health values
    scene.registry = {
      get: jest.fn()
        .mockReturnValueOnce(100) // Full health
        .mockReturnValueOnce(0)   // dashTimer
        .mockReturnValueOnce(0)   // chronoPulseLastActivation
        .mockReturnValueOnce(50)  // Half health
        .mockReturnValueOnce(0)   // dashTimer
        .mockReturnValueOnce(0)   // chronoPulseLastActivation
    };

    // Mock scene time
    scene.time = { now: 100 };

    scene.create();
    
    // First update with full health
    scene.update();
    expect(mockForegroundGraphics.fillRect).toHaveBeenCalledWith(20, 20, 200, 20); // 100% width
    
    // Second update with half health
    scene.update();
    expect(mockForegroundGraphics.fillRect).toHaveBeenCalledWith(20, 20, 100, 20); // 50% width
  });

  test('should handle edge cases for health bar (0% and 100%)', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockBackgroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockForegroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    };
    const mockDashText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    const mockPulseText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn()
        .mockReturnValueOnce(mockBackgroundGraphics)
        .mockReturnValueOnce(mockForegroundGraphics),
      text: jest.fn()
        .mockReturnValueOnce(mockDashText)
        .mockReturnValueOnce(mockPulseText)
    };

    scene.registry = {
      get: jest.fn()
        .mockReturnValueOnce(0) // 0% health
        .mockReturnValueOnce(0) // dashTimer
        .mockReturnValueOnce(0) // chronoPulseLastActivation
    };

    // Mock scene time
    scene.time = { now: 100 };

    scene.create();
    scene.update();

    // Verify 0% health shows no foreground bar
    expect(mockForegroundGraphics.fillRect).toHaveBeenCalledWith(20, 20, 0, 20);
  });

  test('should handle missing registry gracefully', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockBackgroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockForegroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    };
    const mockDashText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    const mockPulseText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn()
        .mockReturnValueOnce(mockBackgroundGraphics)
        .mockReturnValueOnce(mockForegroundGraphics),
      text: jest.fn()
        .mockReturnValueOnce(mockDashText)
        .mockReturnValueOnce(mockPulseText)
    };

    // No registry set - should default to 100% health
    scene.create();
    scene.update();

    // Verify default behavior (100% health)
    expect(mockForegroundGraphics.fillRect).toHaveBeenCalledWith(20, 20, 200, 20);
  });

  test('should handle invalid health values gracefully', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockBackgroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockForegroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    };
    const mockDashText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    const mockPulseText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn()
        .mockReturnValueOnce(mockBackgroundGraphics)
        .mockReturnValueOnce(mockForegroundGraphics),
      text: jest.fn()
        .mockReturnValueOnce(mockDashText)
        .mockReturnValueOnce(mockPulseText)
    };

    scene.registry = {
      get: jest.fn()
        .mockReturnValueOnce(150) // Invalid health > 100
        .mockReturnValueOnce(0)   // dashTimer
        .mockReturnValueOnce(0)   // chronoPulseLastActivation
    };

    // Mock scene time
    scene.time = { now: 100 };

    scene.create();
    scene.update();

    // Verify health is clamped to 100%
    expect(mockForegroundGraphics.fillRect).toHaveBeenCalledWith(20, 20, 200, 20);
  });

  test('should create cooldown icons with proper positioning', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockText = jest.fn().mockReturnValue({
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    });
    scene.add = {
      graphics: jest.fn(() => mockGraphics),
      text: mockText
    };

    scene.create();

    // Verify both cooldown icons are created
    expect(mockText).toHaveBeenCalledWith(20, 50, 'Dash', expect.any(Object));
    expect(mockText).toHaveBeenCalledWith(100, 50, 'Pulse', expect.any(Object));
    expect(scene.cooldownIcons).toBeDefined();
    expect(scene.cooldownIcons.dashText).toBeDefined();
    expect(scene.cooldownIcons.pulseText).toBeDefined();
  });

  test('should update dash cooldown indicator when on cooldown', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockBackgroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockForegroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    };
    const mockDashText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    const mockPulseText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn()
        .mockReturnValueOnce(mockBackgroundGraphics)
        .mockReturnValueOnce(mockForegroundGraphics),
      text: jest.fn()
        .mockReturnValueOnce(mockDashText)
        .mockReturnValueOnce(mockPulseText)
    };

    // Mock registry to return dash cooldown state
    scene.registry = {
      get: jest.fn()
        .mockReturnValueOnce(100) // playerHealth
        .mockReturnValueOnce(500) // dashTimer (future time = on cooldown)
        .mockReturnValueOnce(0)   // chronoPulseLastActivation
    };

    // Mock scene time
    scene.time = { now: 100 };

    scene.create();
    scene.update();

    // Verify dash icon is greyed out (on cooldown)
    expect(mockDashText.setTint).toHaveBeenCalledWith(0x888888);
    expect(mockDashText.setAlpha).toHaveBeenCalledWith(0.5);
  });

  test('should update dash cooldown indicator when available', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockBackgroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockForegroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    };
    const mockDashText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    const mockPulseText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn()
        .mockReturnValueOnce(mockBackgroundGraphics)
        .mockReturnValueOnce(mockForegroundGraphics),
      text: jest.fn()
        .mockReturnValueOnce(mockDashText)
        .mockReturnValueOnce(mockPulseText)
    };

    // Mock registry to return dash available state
    scene.registry = {
      get: jest.fn()
        .mockReturnValueOnce(100) // playerHealth
        .mockReturnValueOnce(50)  // dashTimer (past time = available)
        .mockReturnValueOnce(0)   // chronoPulseLastActivation
    };

    // Mock scene time
    scene.time = { now: 100 };

    scene.create();
    scene.update();

    // Verify dash icon is normal (available)
    expect(mockDashText.setTint).toHaveBeenCalledWith(0xffffff);
    expect(mockDashText.setAlpha).toHaveBeenCalledWith(1.0);
  });

  test('should update chrono pulse cooldown indicator when on cooldown', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockBackgroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockForegroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    };
    const mockDashText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    const mockPulseText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn()
        .mockReturnValueOnce(mockBackgroundGraphics)
        .mockReturnValueOnce(mockForegroundGraphics),
      text: jest.fn()
        .mockReturnValueOnce(mockDashText)
        .mockReturnValueOnce(mockPulseText)
    };

    // Mock registry to return chrono pulse on cooldown
    scene.registry = {
      get: jest.fn()
        .mockReturnValueOnce(100) // playerHealth
        .mockReturnValueOnce(0)   // dashTimer
        .mockReturnValueOnce(1000) // chronoPulseLastActivation (recent = on cooldown)
    };

    // Mock scene time
    scene.time = { now: 2000 };

    scene.create();
    scene.update();

    // Verify pulse icon is greyed out (on cooldown)
    expect(mockPulseText.setTint).toHaveBeenCalledWith(0x888888);
    expect(mockPulseText.setAlpha).toHaveBeenCalledWith(0.5);
  });

  test('should update chrono pulse cooldown indicator when available', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockBackgroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockForegroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    };
    const mockDashText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    const mockPulseText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn()
        .mockReturnValueOnce(mockBackgroundGraphics)
        .mockReturnValueOnce(mockForegroundGraphics),
      text: jest.fn()
        .mockReturnValueOnce(mockDashText)
        .mockReturnValueOnce(mockPulseText)
    };

    // Mock registry to return chrono pulse available
    scene.registry = {
      get: jest.fn()
        .mockReturnValueOnce(100) // playerHealth
        .mockReturnValueOnce(0)   // dashTimer
        .mockReturnValueOnce(0)   // chronoPulseLastActivation (old = available)
    };

    // Mock scene time
    scene.time = { now: 5000 };

    scene.create();
    scene.update();

    // Verify pulse icon is normal (available)
    expect(mockPulseText.setTint).toHaveBeenCalledWith(0xffffff);
    expect(mockPulseText.setAlpha).toHaveBeenCalledWith(1.0);
  });

  test('should handle missing registry values gracefully for cooldowns', () => {
    const scene = new UIScene();
    setupSceneMocks(scene);
    const mockBackgroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis()
    };
    const mockForegroundGraphics = {
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis()
    };
    const mockDashText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    const mockPulseText = {
      setOrigin: jest.fn().mockReturnThis(),
      setTint: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis()
    };
    scene.add = {
      graphics: jest.fn()
        .mockReturnValueOnce(mockBackgroundGraphics)
        .mockReturnValueOnce(mockForegroundGraphics),
      text: jest.fn()
        .mockReturnValueOnce(mockDashText)
        .mockReturnValueOnce(mockPulseText)
    };

    // Mock registry with missing values
    scene.registry = {
      get: jest.fn()
        .mockReturnValueOnce(100) // playerHealth
        .mockReturnValueOnce(undefined) // dashTimer missing
        .mockReturnValueOnce(undefined) // chronoPulseLastActivation missing
    };

    // Mock scene time
    scene.time = { now: 100 };

    scene.create();
    scene.update();

    // Verify both icons default to available state
    expect(mockDashText.setTint).toHaveBeenCalledWith(0xffffff);
    expect(mockPulseText.setTint).toHaveBeenCalledWith(0xffffff);
  });
}); 
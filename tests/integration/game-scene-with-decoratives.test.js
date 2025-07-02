import { jest } from '@jest/globals';
import GameScene from '../../client/src/scenes/GameScene.js';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import testLevelConfig from '../../client/src/config/test-level.json' with { type: 'json' };

describe('GameScene with Decorative Platforms', () => {
  let mockScene;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    jest.clearAllMocks();
  });

  test('should create decorative platforms when level configuration contains them', () => {
    // Arrange - verify test config has decorative platforms
    expect(testLevelConfig.decorativePlatforms).toBeDefined();
    expect(Array.isArray(testLevelConfig.decorativePlatforms)).toBe(true);
    expect(testLevelConfig.decorativePlatforms.length).toBeGreaterThan(0);
    
    // Create GameScene and call create to initialize SceneFactory
    const gameScene = new GameScene(mockScene);
    gameScene.create(); // This initializes sceneFactory
    
    // Verify SceneFactory was created and has the decorative method
    expect(gameScene.sceneFactory).toBeDefined();
    expect(typeof gameScene.sceneFactory.createDecorativePlatformsFromConfig).toBe('function');
    
    // Mock the config to use our test config with decorative platforms
    gameScene.sceneFactory.config = testLevelConfig;
    
    // Spy on the decorative platform creation method
    const createDecorativesSpy = jest.spyOn(gameScene.sceneFactory, 'createDecorativePlatformsFromConfig');

    // Act - Call the decorative platform creation method directly
    gameScene.createDecorativePlatformsWithFactory();

    // Assert - Verify decorative platforms were created
    expect(createDecorativesSpy).toHaveBeenCalledWith(testLevelConfig.decorativePlatforms);
    
    // Cleanup
    createDecorativesSpy.mockRestore();
  });

  test('should call decorative platform creation during full scene creation', () => {
    // Arrange
    const gameScene = new GameScene(mockScene);
    
    // Spy on the decorative platform factory method before create is called
    const createDecorativesSpy = jest.spyOn(GameScene.prototype, 'createDecorativePlatformsWithFactory');

    // Act - Full scene creation
    gameScene.create();

    // Assert - Verify the decorative platform method was called during scene creation
    expect(createDecorativesSpy).toHaveBeenCalled();
    
    // Cleanup
    createDecorativesSpy.mockRestore();
  });

  test('test-level.json configuration includes decorative platforms', () => {
    // This test validates that our test configuration is properly set up
    expect(testLevelConfig.decorativePlatforms).toBeDefined();
    expect(Array.isArray(testLevelConfig.decorativePlatforms)).toBe(true);
    expect(testLevelConfig.decorativePlatforms.length).toBeGreaterThan(0);
    
    // Verify the structure of decorative platforms
    testLevelConfig.decorativePlatforms.forEach(platform => {
      expect(platform.type).toBe('decorative');
      expect(typeof platform.x).toBe('number');
      expect(typeof platform.y).toBe('number');
      expect(typeof platform.tilePrefix).toBe('string');
      expect(typeof platform.depth).toBe('number');
      expect(platform.depth).toBeLessThan(0); // Background depth
    });
  });

  test('should log creation of decorative platforms with correct count', () => {
    // Arrange
    const consoleSpy = jest.spyOn(console, 'log');
    const gameScene = new GameScene(mockScene);
    gameScene.create(); // Initialize SceneFactory
    
    // Set config to include decorative platforms
    gameScene.sceneFactory.config = testLevelConfig;

    // Calculate expected tile count based on configurations
    let expectedTileCount = 0;
    testLevelConfig.decorativePlatforms.forEach(config => {
      if (config.width && config.width > 64) {
        expectedTileCount += Math.ceil(config.width / 64);
      } else {
        expectedTileCount += 1;
      }
    });

    // Mock the SceneFactory to return the expected number of tiles
    const mockDecoratives = Array.from({ length: expectedTileCount }, (_, i) => ({
      x: 100 + i * 64,
      y: 200,
      setDepth: jest.fn(),
      setOrigin: jest.fn()
    }));
    
    gameScene.sceneFactory.createDecorativePlatformsFromConfig = jest.fn().mockReturnValue(mockDecoratives);

    // Act
    gameScene.createDecorativePlatformsWithFactory();

    // Assert - Check for the decorative platform creation log
    expect(consoleSpy).toHaveBeenCalledWith(
      `[GameScene] Created ${expectedTileCount} decorative platform tiles`
    );
    
    // Cleanup
    consoleSpy.mockRestore();
  });
}); 
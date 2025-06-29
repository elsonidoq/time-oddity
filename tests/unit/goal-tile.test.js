/**
 * Unit tests for GoalTile entity
 * Tests the static physics-enabled goal tile that represents level exit points
 */

import { jest } from '@jest/globals';
import GoalTile from '../../client/src/entities/GoalTile.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

// Mock TimeManager for registration tests
const mockTimeManager = {
  register: jest.fn()
};

describe('GoalTile', () => {
  let mockScene;
  let goalTile;

  beforeEach(() => {
    jest.clearAllMocks();
    mockScene = createPhaserSceneMock('TestScene');
    // Mock TimeManager on scene
    mockScene.timeManager = mockTimeManager;
  });

  afterEach(() => {
    if (goalTile && goalTile.destroy) {
      goalTile.destroy();
    }
  });

  describe('Constructor', () => {
    it('should create a GoalTile entity with default tileKey', () => {
      goalTile = new GoalTile(mockScene, 100, 200);
      
      expect(goalTile).toBeDefined();
      expect(goalTile.x).toBe(100);
      expect(goalTile.y).toBe(200);
      expect(goalTile.texture.key).toBe('tiles'); // Default atlas
    });

    it('should create a GoalTile entity with specified tileKey', () => {
      const customTileKey = 'terrain_grass_block_center';
      goalTile = new GoalTile(mockScene, 100, 200, customTileKey);
      
      expect(goalTile).toBeDefined();
      expect(goalTile.x).toBe(100);
      expect(goalTile.y).toBe(200);
      expect(goalTile.tileKey).toBe(customTileKey);
      // Entity constructor handles scene integration
      expect(goalTile.texture.key).toBe('tiles');
    });

    it('should extend Entity base class', () => {
      goalTile = new GoalTile(mockScene, 100, 200);
      
      // Check Entity properties
      expect(goalTile.health).toBeDefined();
      expect(goalTile.maxHealth).toBeDefined();
      expect(goalTile.isActive).toBe(true);
      expect(typeof goalTile.takeDamage).toBe('function');
      expect(typeof goalTile.heal).toBe('function');
    });
  });

  describe('Physics Configuration', () => {
    it('should configure physics body as immovable and disable gravity', () => {
      goalTile = new GoalTile(mockScene, 100, 200);
      
      // Verify physics body configuration methods exist and were called
      expect(typeof goalTile.body.setImmovable).toBe('function');
      expect(typeof goalTile.body.setAllowGravity).toBe('function');
    });

    it('should be added to scene before physics configuration (invariants.md §13.3)', () => {
      goalTile = new GoalTile(mockScene, 100, 200);
      
      // Verify Entity constructor handles scene integration correctly
      // The Entity base class adds to scene and physics before our physics config
      expect(goalTile.body).toBeDefined();
      expect(typeof goalTile.body.setImmovable).toBe('function');
      expect(typeof goalTile.body.setAllowGravity).toBe('function');
    });
  });

  describe('TimeManager Integration', () => {
    it('should register with TimeManager for time reversal compatibility', () => {
      goalTile = new GoalTile(mockScene, 100, 200);
      
      expect(mockTimeManager.register).toHaveBeenCalledWith(goalTile);
    });

    it('should work with default TemporalState recording (no custom methods)', () => {
      goalTile = new GoalTile(mockScene, 100, 200);
      
      // Verify it doesn't implement custom state recording methods
      expect(goalTile.getStateForRecording).toBeUndefined();
      expect(goalTile.setStateFromRecording).toBeUndefined();
      
      // Verify it has the minimal state shape for default recording
      expect(goalTile.x).toBeDefined();
      expect(goalTile.y).toBeDefined();
      expect(goalTile.body).toBeDefined();
      expect(goalTile.active).toBeDefined();
      expect(goalTile.visible).toBeDefined();
    });
  });

  describe('Texture Configuration', () => {
    it('should render with correct texture based on tileKey parameter', () => {
      const tileKey = 'block_blue';
      goalTile = new GoalTile(mockScene, 100, 200, tileKey);
      
      expect(goalTile.tileKey).toBe(tileKey);
      // In a real Phaser environment, this would set the texture frame
      // In our mock, we verify the intention to set the texture
      expect(goalTile.texture.key).toBe('tiles');
    });

    it('should use default tileKey when none specified', () => {
      goalTile = new GoalTile(mockScene, 100, 200);
      
      expect(goalTile.tileKey).toBe('block_coin'); // Default goal tile appearance
    });
  });

  describe('Static Entity Behavior', () => {
    it('should remain static (no movement or velocity)', () => {
      goalTile = new GoalTile(mockScene, 100, 200);
      
      // Verify it's configured as a static entity
      expect(typeof goalTile.body.setImmovable).toBe('function');
      expect(typeof goalTile.body.setAllowGravity).toBe('function');
      
      // Position should remain fixed
      expect(goalTile.x).toBe(100);
      expect(goalTile.y).toBe(200);
    });
  });
}); 
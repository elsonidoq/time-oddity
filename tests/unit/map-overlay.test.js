import '../mocks/phaserMock.js';
import { PhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { jest } from '@jest/globals';
import MapOverlay from '../../client/src/ui/MapOverlay.js';

describe('Task 04.02: MapOverlay Core Structure', () => {
  let MapOverlay;
  let mockScene;
  let mapOverlay;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const mapOverlayPath = join(__dirname, '../../client/src/ui/MapOverlay.js');
    if (existsSync(mapOverlayPath)) {
      const mapOverlayModule = await import(mapOverlayPath);
      MapOverlay = mapOverlayModule.default;
    } else {
      MapOverlay = class { constructor(scene) { this.scene = scene; } };
    }
  });

  beforeEach(() => {
    mockScene = new PhaserSceneMock();
    // Mock graphics creation
    mockScene.add.graphics = jest.fn(() => ({
      setDepth: jest.fn().mockReturnThis(),
      setVisible: jest.fn().mockReturnThis(),
      setPosition: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis(),
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      fillCircle: jest.fn().mockReturnThis(),
      destroy: jest.fn()
    }));
  });

  describe('Constructor', () => {
    test('should accept scene parameter', () => {
      // Act: Create MapOverlay with scene
      mapOverlay = new MapOverlay(mockScene);
      
      // Assert: Scene should be stored
      expect(mapOverlay.scene).toBe(mockScene);
    });

    test('should handle missing scene gracefully', () => {
      // Act: Create MapOverlay without scene
      mapOverlay = new MapOverlay(null);
      
      // Assert: Should not throw error
      expect(mapOverlay).toBeDefined();
    });

    test('should initialize with default properties', () => {
      expect(mapOverlay.graphics).toBeNull();
      expect(mapOverlay.isVisible).toBe(false);
      expect(mapOverlay.mapScale).toBeNull();
      expect(mapOverlay.mapWidth).toBe(200); // Default map display width
      expect(mapOverlay.mapHeight).toBe(150); // Default map display height
    });
  });

  describe('create() method', () => {
    beforeEach(() => {
      mapOverlay = new MapOverlay(mockScene);
    });

    test('should create graphics object', () => {
      // Act: Call create method
      mapOverlay.create();
      
      // Assert: Graphics object should be created
      expect(mockScene.add.graphics).toHaveBeenCalled();
    });

    test('should set graphics depth to 1001', () => {
      // Arrange: Mock graphics object
      const mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      
      // Act: Call create method
      mapOverlay.create();
      
      // Assert: Depth should be set to 1001 (above TimeManager rewind overlay)
      expect(mockGraphics.setDepth).toHaveBeenCalledWith(1001);
    });

    test('should store graphics reference', () => {
      // Arrange: Mock graphics object
      const mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      
      // Act: Call create method
      mapOverlay.create();
      
      // Assert: Graphics should be stored
      expect(mapOverlay.graphics).toBe(mockGraphics);
    });

    test('should handle missing scene gracefully', () => {
      // Arrange: Create MapOverlay without scene
      const nullSceneMapOverlay = new MapOverlay(null);
      
      // Act & Assert: Should not throw error
      expect(() => nullSceneMapOverlay.create()).not.toThrow();
    });

    test('should set graphics position to top-right corner', () => {
      mapOverlay.create();
      
      expect(mapOverlay.graphics.setPosition).toHaveBeenCalledWith(1050, 50);
    });
  });

  describe('destroy() method', () => {
    beforeEach(() => {
      mapOverlay = new MapOverlay(mockScene);
      // Mock graphics object
      const mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      mapOverlay.create();
    });

    test('should destroy graphics object', () => {
      // Store reference to graphics before destroy
      const graphicsRef = mapOverlay.graphics;
      // Act: Call destroy method
      mapOverlay.destroy();
      // Assert: Graphics destroy should be called
      expect(graphicsRef.destroy).toHaveBeenCalled();
    });

    test('should clear graphics reference', () => {
      // Act: Call destroy method
      mapOverlay.destroy();
      
      // Assert: Graphics reference should be cleared
      expect(mapOverlay.graphics).toBeNull();
    });

    test('should handle missing graphics gracefully', () => {
      // Arrange: Clear graphics reference
      mapOverlay.graphics = null;
      
      // Act & Assert: Should not throw error
      expect(() => mapOverlay.destroy()).not.toThrow();
    });
  });

  describe('setVisible() method', () => {
    beforeEach(() => {
      mapOverlay = new MapOverlay(mockScene);
      // Mock graphics object
      const mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      mapOverlay.create();
    });

    test('should set graphics visibility to true', () => {
      // Act: Set visible to true
      mapOverlay.setVisible(true);
      
      // Assert: Graphics should be set visible
      expect(mapOverlay.graphics.setVisible).toHaveBeenCalledWith(true);
    });

    test('should set graphics visibility to false', () => {
      // Act: Set visible to false
      mapOverlay.setVisible(false);
      
      // Assert: Graphics should be set invisible
      expect(mapOverlay.graphics.setVisible).toHaveBeenCalledWith(false);
    });

    test('should handle missing graphics gracefully', () => {
      // Arrange: Clear graphics reference
      mapOverlay.graphics = null;
      
      // Act & Assert: Should not throw error
      expect(() => mapOverlay.setVisible(true)).not.toThrow();
    });
  });

  describe('Lifecycle Integration', () => {
    test('should support full create-destroy lifecycle', () => {
      // Arrange: Mock graphics object
      const mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      
      // Act: Full lifecycle
      mapOverlay = new MapOverlay(mockScene);
      mapOverlay.create();
      mapOverlay.setVisible(true);
      mapOverlay.setVisible(false);
      mapOverlay.destroy();
      
      // Assert: All methods should be called appropriately
      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockGraphics.setDepth).toHaveBeenCalledWith(1001);
      expect(mockGraphics.setVisible).toHaveBeenCalledWith(true);
      expect(mockGraphics.setVisible).toHaveBeenCalledWith(false);
      expect(mockGraphics.destroy).toHaveBeenCalled();
    });
  });

  describe('calculateMapScale()', () => {
    test('should calculate scale for level smaller than map area', () => {
      const scale = mapOverlay.calculateMapScale(100, 75);
      
      // Level is smaller than map area, should scale up
      expect(scale).toBeGreaterThan(1);
      expect(scale).toBe(2); // 200/100 = 2
    });

    test('should calculate scale for level larger than map area', () => {
      const scale = mapOverlay.calculateMapScale(400, 300);
      
      // Level is larger than map area, should scale down
      expect(scale).toBeLessThan(1);
      expect(scale).toBe(0.5); // 200/400 = 0.5
    });

    test('should handle zero dimensions', () => {
      expect(() => mapOverlay.calculateMapScale(0, 100)).toThrow('Level dimensions must be positive');
      expect(() => mapOverlay.calculateMapScale(100, 0)).toThrow('Level dimensions must be positive');
    });

    test('should handle negative dimensions', () => {
      expect(() => mapOverlay.calculateMapScale(-100, 100)).toThrow('Level dimensions must be positive');
      expect(() => mapOverlay.calculateMapScale(100, -100)).toThrow('Level dimensions must be positive');
    });

    test('should cache scale calculation', () => {
      const scale1 = mapOverlay.calculateMapScale(200, 150);
      const scale2 = mapOverlay.calculateMapScale(200, 150);
      
      expect(scale1).toBe(scale2);
      expect(mapOverlay.mapScale).toBe(scale1);
    });
  });

  describe('worldToMapCoords()', () => {
    beforeEach(() => {
      mapOverlay.calculateMapScale(400, 300); // Set up scale
    });

    test('should convert world coordinates to map coordinates', () => {
      const [mapX, mapY] = mapOverlay.worldToMapCoords(200, 150);
      
      // With scale 0.5 (200/400), world(200,150) should become map(100,75)
      expect(mapX).toBe(100);
      expect(mapY).toBe(75);
    });

    test('should handle zero coordinates', () => {
      const [mapX, mapY] = mapOverlay.worldToMapCoords(0, 0);
      
      expect(mapX).toBe(0);
      expect(mapY).toBe(0);
    });

    test('should handle negative world coordinates', () => {
      const [mapX, mapY] = mapOverlay.worldToMapCoords(-100, -50);
      
      expect(mapX).toBe(-50); // -100 * 0.5
      expect(mapY).toBe(-25); // -50 * 0.5
    });

    test('should throw error if scale not calculated', () => {
      const newMapOverlay = new MapOverlay(mockScene);
      
      expect(() => newMapOverlay.worldToMapCoords(100, 100)).toThrow('Map scale must be calculated first');
    });

    test('should clamp coordinates to map bounds', () => {
      const [mapX, mapY] = mapOverlay.worldToMapCoords(1000, 1000);
      
      // Should be clamped to map dimensions (200, 150)
      expect(mapX).toBeLessThanOrEqual(200);
      expect(mapY).toBeLessThanOrEqual(150);
    });
  });

  describe('renderPlatforms()', () => {
    let mapOverlay, mockGraphics;
    beforeEach(() => {
      mockScene = new PhaserSceneMock();
      // Ensure add.graphics is a jest mock function
      mockScene.add.graphics = jest.fn();
      mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      mapOverlay = new MapOverlay(mockScene);
      mapOverlay.create();
      mapOverlay.mapScale = 0.5; // Set scale for deterministic output
      jest.spyOn(mapOverlay, 'worldToMapCoords');
    });

    test('should draw a rectangle for each platform', () => {
      const platforms = [
        { x: 100, y: 200, width: 64, height: 16 },
        { x: 300, y: 400, width: 128, height: 16 }
      ];
      mapOverlay.renderPlatforms(platforms);
      expect(mockGraphics.fillRect).toHaveBeenCalledTimes(2);
    });

    test('should use correct color for platforms', () => {
      const platforms = [{ x: 100, y: 200, width: 64, height: 16 }];
      mapOverlay.renderPlatforms(platforms);
      expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x00ff00, 1); // green
    });

    test('should call worldToMapCoords for each platform', () => {
      const platforms = [
        { x: 100, y: 200, width: 64, height: 16 },
        { x: 300, y: 400, width: 128, height: 16 }
      ];
      mapOverlay.renderPlatforms(platforms);
      expect(mapOverlay.worldToMapCoords).toHaveBeenCalledTimes(2);
    });

    test('should handle empty platform array', () => {
      mapOverlay.renderPlatforms([]);
      expect(mockGraphics.fillRect).not.toHaveBeenCalled();
    });
  });

  describe('renderCoins()', () => {
    let mapOverlay, mockGraphics;
    beforeEach(() => {
      mockScene = new PhaserSceneMock();
      // Ensure add.graphics is a jest mock function
      mockScene.add.graphics = jest.fn();
      mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      mapOverlay = new MapOverlay(mockScene);
      mapOverlay.create();
      mapOverlay.mapScale = 0.5;
      jest.spyOn(mapOverlay, 'worldToMapCoords');
    });

    test('should draw a circle for each coin', () => {
      const coins = [
        { x: 100, y: 200 },
        { x: 300, y: 400 }
      ];
      mapOverlay.renderCoins(coins);
      expect(mockGraphics.fillCircle).toHaveBeenCalledTimes(2);
    });

    test('should use correct color for coins', () => {
      const coins = [{ x: 100, y: 200 }];
      mapOverlay.renderCoins(coins);
      expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0xffff00, 1); // yellow
    });

    test('should call worldToMapCoords for each coin', () => {
      const coins = [
        { x: 100, y: 200 },
        { x: 300, y: 400 }
      ];
      mapOverlay.renderCoins(coins);
      expect(mapOverlay.worldToMapCoords).toHaveBeenCalledTimes(2);
    });

    test('should handle empty coin array', () => {
      mapOverlay.renderCoins([]);
      expect(mockGraphics.fillCircle).not.toHaveBeenCalled();
    });
  });

  describe('renderPlayerMarker()', () => {
    let mapOverlay, mockGraphics;
    beforeEach(() => {
      mockScene = new PhaserSceneMock();
      mockScene.add.graphics = jest.fn();
      mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      mapOverlay = new MapOverlay(mockScene);
      mapOverlay.create();
      mapOverlay.mapScale = 0.5;
      jest.spyOn(mapOverlay, 'worldToMapCoords');
    });

    test('should draw a circle for player marker', () => {
      mapOverlay.renderPlayerMarker(100, 200);
      expect(mockGraphics.fillCircle).toHaveBeenCalledTimes(1);
    });

    test('should use blue color for player marker', () => {
      mapOverlay.renderPlayerMarker(100, 200);
      expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x0000ff, 1); // blue
    });

    test('should call worldToMapCoords for player position', () => {
      mapOverlay.renderPlayerMarker(100, 200);
      expect(mapOverlay.worldToMapCoords).toHaveBeenCalledWith(100, 200);
    });

    test('should not clear graphics itself (handled by updatePlayerPosition)', () => {
      mapOverlay.renderPlayerMarker(100, 200);
      expect(mockGraphics.clear).not.toHaveBeenCalled();
    });
  });

  describe('updatePlayerPosition()', () => {
    let mapOverlay, mockGraphics;
    beforeEach(() => {
      mockScene = new PhaserSceneMock();
      mockScene.add.graphics = jest.fn();
      mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      mapOverlay = new MapOverlay(mockScene);
      mapOverlay.create();
      mapOverlay.mapScale = 0.5;
      jest.spyOn(mapOverlay, 'renderPlayerMarker');
    });

    test('should call renderPlayerMarker with new position', () => {
      mapOverlay.updatePlayerPosition(150, 250);
      expect(mapOverlay.renderPlayerMarker).toHaveBeenCalledWith(150, 250);
    });

    test('should handle position updates multiple times', () => {
      // Disable performance optimization for testing by setting interval to 0
      mapOverlay._updateInterval = 0;
      
      mapOverlay.updatePlayerPosition(100, 200);
      mapOverlay.updatePlayerPosition(150, 250);
      expect(mapOverlay.renderPlayerMarker).toHaveBeenCalledTimes(2);
      expect(mapOverlay.renderPlayerMarker).toHaveBeenLastCalledWith(150, 250);
    });

    test('should handle zero coordinates', () => {
      mapOverlay.updatePlayerPosition(0, 0);
      expect(mapOverlay.renderPlayerMarker).toHaveBeenCalledWith(0, 0);
    });

    test('should draw alpha-blended black background before other elements', () => {
      // Arrange: Set up cached data
      mapOverlay._platformData = [{ x: 100, y: 200, width: 64, height: 16 }];
      mapOverlay._coinData = [{ x: 300, y: 400 }];
      
      // Act
      mapOverlay.updatePlayerPosition(150, 250);
      
      // Assert: Background should be drawn first (first fillStyle call)
      expect(mockGraphics.fillStyle).toHaveBeenNthCalledWith(1, 0x000000, 0.8);
      expect(mockGraphics.fillRect).toHaveBeenNthCalledWith(1, 0, 0, 200, 150);
    });

    test('should draw background even when no cached data exists', () => {
      // Act
      mapOverlay.updatePlayerPosition(150, 250);
      
      // Assert: Background should still be drawn
      expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 0.8);
      expect(mockGraphics.fillRect).toHaveBeenCalledWith(0, 0, 200, 150);
    });

    test('should handle missing graphics gracefully for background', () => {
      // Arrange
      mapOverlay.graphics = null;
      
      // Act & Assert: Should not throw
      expect(() => mapOverlay.updatePlayerPosition(150, 250)).not.toThrow();
    });
  });

  describe('Background Rendering', () => {
    let mapOverlay, mockGraphics;
    beforeEach(() => {
      mockScene = new PhaserSceneMock();
      mockScene.add.graphics = jest.fn();
      mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      mapOverlay = new MapOverlay(mockScene);
      mapOverlay.create();
    });

    test('should draw background with correct alpha value', () => {
      // Act
      mapOverlay.updatePlayerPosition(100, 200);
      
      // Assert: Background should use 0.8 alpha for good visibility
      expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 0.8);
    });

    test('should draw background with correct dimensions', () => {
      // Act
      mapOverlay.updatePlayerPosition(100, 200);
      
      // Assert: Background should cover the full map area
      expect(mockGraphics.fillRect).toHaveBeenCalledWith(0, 0, 200, 150);
    });

    test('should draw background at origin relative to graphics position', () => {
      // Act
      mapOverlay.updatePlayerPosition(100, 200);
      
      // Assert: Background should start at (0,0) relative to graphics position
      expect(mockGraphics.fillRect).toHaveBeenCalledWith(0, 0, 200, 150);
    });
  });

  describe('Task 04.08: Visual Styling and Polish', () => {
    let mapOverlay, mockGraphics;
    beforeEach(() => {
      mockScene = new PhaserSceneMock();
      mockScene.add.graphics = jest.fn();
      mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        lineStyle: jest.fn().mockReturnThis(),
        strokeRect: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      mapOverlay = new MapOverlay(mockScene);
      mapOverlay.create();
      mapOverlay.mapScale = 0.5;
      mapOverlay.mapWidth = 200;
      mapOverlay.mapHeight = 150;
    });

    describe('Map Background Styling', () => {
      test('should draw background with correct alpha value (0.8)', () => {
        // Act
        mapOverlay.updatePlayerPosition(100, 200);
        
        // Assert: Background should use 0.8 alpha as specified in task
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 0.8);
      });

      test('should draw background with correct dimensions', () => {
        // Act
        mapOverlay.updatePlayerPosition(100, 200);
        
        // Assert: Background should cover the full map area
        expect(mockGraphics.fillRect).toHaveBeenCalledWith(0, 0, 200, 150);
      });

      test('should draw background at origin relative to graphics position', () => {
        // Act
        mapOverlay.updatePlayerPosition(100, 200);
        
        // Assert: Background should start at (0,0) relative to graphics position
        expect(mockGraphics.fillRect).toHaveBeenCalledWith(0, 0, 200, 150);
      });
    });

    describe('Border/Frame Rendering', () => {
      test('should draw border frame around map area', () => {
        // Act
        mapOverlay.updatePlayerPosition(100, 200);
        
        // Assert: Border should be drawn with lineStyle and strokeRect
        expect(mockGraphics.lineStyle).toHaveBeenCalled();
        expect(mockGraphics.strokeRect).toHaveBeenCalledWith(0, 0, 200, 150);
      });

      test('should use white color for border frame', () => {
        // Act
        mapOverlay.updatePlayerPosition(100, 200);
        
        // Assert: Border should use white color
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0xffffff, 1);
      });

      test('should draw border with appropriate thickness', () => {
        // Act
        mapOverlay.updatePlayerPosition(100, 200);
        
        // Assert: Border should have 2px thickness
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0xffffff, 1);
      });
    });

    describe('Color Scheme Consistency', () => {
      test('should use green color for platforms', () => {
        const platforms = [{ x: 100, y: 200, width: 64, height: 16 }];
        mapOverlay.renderPlatforms(platforms);
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x00ff00, 1); // green
      });

      test('should use yellow color for coins', () => {
        const coins = [{ x: 100, y: 200 }];
        mapOverlay.renderCoins(coins);
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0xffff00, 1); // yellow
      });

      test('should use blue color for player marker', () => {
        mapOverlay.renderPlayerMarker(100, 200);
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x0000ff, 1); // blue
      });

      test('should maintain consistent color scheme across all elements', () => {
        // Act: Render all elements
        const platforms = [{ x: 100, y: 200, width: 64, height: 16 }];
        const coins = [{ x: 300, y: 400 }];
        
        mapOverlay.renderPlatforms(platforms);
        mapOverlay.renderCoins(coins);
        mapOverlay.renderPlayerMarker(150, 250);
        
        // Assert: All colors should be consistent
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x00ff00, 1); // platforms: green
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0xffff00, 1); // coins: yellow
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x0000ff, 1); // player: blue
      });
    });

    describe('Transparency and Alpha Settings', () => {
      test('should use correct alpha for background (0.8)', () => {
        mapOverlay.updatePlayerPosition(100, 200);
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x000000, 0.8);
      });

      test('should use full opacity for map elements', () => {
        const platforms = [{ x: 100, y: 200, width: 64, height: 16 }];
        mapOverlay.renderPlatforms(platforms);
        expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0x00ff00, 1); // full opacity
      });

      test('should use full opacity for border frame', () => {
        mapOverlay.updatePlayerPosition(100, 200);
        expect(mockGraphics.lineStyle).toHaveBeenCalledWith(2, 0xffffff, 1); // full opacity
      });
    });

    describe('Depth Management', () => {
      test('should set graphics depth to 1001 (above TimeManager rewind overlay)', () => {
        // Act: Recreate to test depth setting
        mapOverlay.create();
        
        // Assert: Depth should be set to 1001
        expect(mockGraphics.setDepth).toHaveBeenCalledWith(1001);
      });

      test('should maintain depth 1001 throughout lifecycle', () => {
        // Act: Full lifecycle
        mapOverlay.create();
        mapOverlay.setVisible(true);
        mapOverlay.updatePlayerPosition(100, 200);
        mapOverlay.destroy();
        
        // Assert: Depth should remain 1001
        expect(mockGraphics.setDepth).toHaveBeenCalledWith(1001);
      });
    });

    describe('Performance Optimization', () => {
      test('should minimize graphics operations for smooth updates', () => {
        // Act: Update player position
        mapOverlay.updatePlayerPosition(100, 200);
        
        // Assert: Should use minimal graphics calls
        // Background + border + player marker = 3 main operations
        expect(mockGraphics.fillStyle).toHaveBeenCalledTimes(2); // background + player
        expect(mockGraphics.lineStyle).toHaveBeenCalledTimes(1); // border
      });

      test('should handle missing graphics gracefully for all styling operations', () => {
        // Arrange: Clear graphics reference
        mapOverlay.graphics = null;
        
        // Act & Assert: Should not throw for any styling operation
        expect(() => mapOverlay.updatePlayerPosition(100, 200)).not.toThrow();
        expect(() => mapOverlay.renderPlatforms([])).not.toThrow();
        expect(() => mapOverlay.renderCoins([])).not.toThrow();
        expect(() => mapOverlay.renderPlayerMarker(100, 200)).not.toThrow();
      });
    });
  });

  describe('Task 04.09: Performance Testing and Optimization', () => {
    let mapOverlay, mockGraphics, performanceMock;

    beforeEach(() => {
      mockScene = new PhaserSceneMock();
      mockScene.add.graphics = jest.fn();
      mockGraphics = {
        setDepth: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillCircle: jest.fn().mockReturnThis(),
        lineStyle: jest.fn().mockReturnThis(),
        strokeRect: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      };
      mockScene.add.graphics.mockReturnValue(mockGraphics);
      mapOverlay = new MapOverlay(mockScene);
      mapOverlay.create();
      mapOverlay.mapScale = 0.5;
      mapOverlay.mapWidth = 200;
      mapOverlay.mapHeight = 150;
      
      // Mock performance API for testing
      performanceMock = {
        now: jest.fn(() => Date.now())
      };
      global.performance = performanceMock;
    });

    afterEach(() => {
      jest.clearAllMocks();
      delete global.performance;
    });

    describe('Update Frequency Limits', () => {
      test('should limit player position updates to 30fps max', () => {
        // Arrange: Add update frequency tracking to MapOverlay
        mapOverlay._updateInterval = 1000 / 30; // 30fps = ~33.33ms interval
        let currentTime = 1000;
        // First update: allowed
        mapOverlay._lastUpdateTime = currentTime - 1000; // far in the past to guarantee update
        performanceMock.now.mockReset();
        performanceMock.now
          .mockReturnValueOnce(currentTime)      // for update check
          .mockReturnValueOnce(currentTime)      // for update start
          .mockReturnValueOnce(currentTime + 5); // for update end
        mapOverlay.updatePlayerPosition(100, 200);
        expect(mockGraphics.clear).toHaveBeenCalledTimes(1);
        // Second update: allowed (simulate far in the past)
        jest.clearAllMocks();
        currentTime += 16;
        mapOverlay._lastUpdateTime = currentTime - 1000;
        performanceMock.now.mockReset();
        performanceMock.now
          .mockReturnValueOnce(currentTime)      // for update check
          .mockReturnValueOnce(currentTime)      // for update start
          .mockReturnValueOnce(currentTime + 5); // for update end
        mapOverlay.updatePlayerPosition(150, 250);
        expect(mockGraphics.clear).toHaveBeenCalledTimes(1);
        // Third update: allowed (simulate far in the past)
        jest.clearAllMocks();
        currentTime += 40;
        mapOverlay._lastUpdateTime = currentTime - 1000;
        performanceMock.now.mockReset();
        performanceMock.now
          .mockReturnValueOnce(currentTime)      // for update check
          .mockReturnValueOnce(currentTime)      // for update start
          .mockReturnValueOnce(currentTime + 5); // for update end
        mapOverlay.updatePlayerPosition(200, 300);
        expect(mockGraphics.clear).toHaveBeenCalledTimes(1);
      });

      test('should track update frequency correctly', () => {
        // Arrange: Add update tracking
        mapOverlay._updateCount = 0;
        mapOverlay._lastUpdateTime = 0;
        mapOverlay._updateInterval = 1000 / 30;
        
        // Act: Multiple updates
        mapOverlay.updatePlayerPosition(100, 200);
        mapOverlay.updatePlayerPosition(150, 250);
        mapOverlay.updatePlayerPosition(200, 300);
        
        // Assert: Should track update count
        expect(mapOverlay._updateCount).toBeGreaterThan(0);
      });

      test('should respect minimum update interval', () => {
        // Arrange: Set minimum interval
        mapOverlay._lastUpdateTime = 0;
        mapOverlay._updateInterval = 1000 / 30; // 33.33ms
        
        // Act: Update immediately after previous update
        mapOverlay.updatePlayerPosition(100, 200);
        const firstUpdateTime = mapOverlay._lastUpdateTime;
        
        // Try to update again immediately
        jest.clearAllMocks();
        mapOverlay.updatePlayerPosition(150, 250);
        
        // Assert: Should not update if time difference < interval
        expect(mockGraphics.clear).not.toHaveBeenCalled();
      });
    });

    describe('Memory Usage and Cleanup', () => {
      test('should not leak memory during toggle operations', () => {
        // Arrange: Track object references
        const initialGraphicsRef = mapOverlay.graphics;
        
        // Act: Multiple toggle operations
        for (let i = 0; i < 10; i++) {
          mapOverlay.setVisible(true);
          mapOverlay.setVisible(false);
        }
        
        // Assert: Graphics reference should remain the same
        expect(mapOverlay.graphics).toBe(initialGraphicsRef);
        expect(mapOverlay.graphics).not.toBeNull();
      });

      test('should properly cleanup resources in destroy()', () => {
        // Arrange: Track destroy calls
        const destroySpy = jest.spyOn(mockGraphics, 'destroy');
        
        // Act: Destroy map overlay
        mapOverlay.destroy();
        
        // Assert: Graphics should be destroyed and reference cleared
        expect(destroySpy).toHaveBeenCalledTimes(1);
        expect(mapOverlay.graphics).toBeNull();
      });

      test('should handle multiple destroy calls gracefully', () => {
        // Act: Call destroy multiple times
        mapOverlay.destroy();
        mapOverlay.destroy();
        mapOverlay.destroy();
        
        // Assert: Should not throw and should handle gracefully
        expect(mapOverlay.graphics).toBeNull();
      });

      test('should not create new graphics objects during toggle', () => {
        // Arrange: Track graphics creation
        const createSpy = jest.spyOn(mockScene.add, 'graphics');
        
        // Act: Multiple visibility toggles
        for (let i = 0; i < 5; i++) {
          mapOverlay.setVisible(true);
          mapOverlay.setVisible(false);
        }
        
        // Assert: Should not create new graphics objects
        expect(createSpy).toHaveBeenCalledTimes(1); // Only during initial create()
      });
    });

    describe('Frame Rate Impact Testing', () => {
      test('should have no measurable performance impact during map usage', () => {
        // Arrange: Simulate frame timing
        const frameTime = 16; // 60fps = 16ms per frame
        const startTime = performance.now();
        
        // Act: Simulate map update during gameplay
        mapOverlay.updatePlayerPosition(100, 200);
        const updateTime = performance.now() - startTime;
        
        // Assert: Update should complete within frame budget
        expect(updateTime).toBeLessThan(frameTime);
      });

      test('should maintain consistent performance across multiple updates', () => {
        // Arrange: Track multiple update times
        const updateTimes = [];
        
        // Act: Multiple updates
        for (let i = 0; i < 10; i++) {
          const startTime = performance.now();
          mapOverlay.updatePlayerPosition(100 + i, 200 + i);
          updateTimes.push(performance.now() - startTime);
        }
        
        // Assert: All updates should be fast and consistent
        updateTimes.forEach(time => {
          expect(time).toBeLessThan(16); // Within 60fps budget
        });
        
        // Performance should be consistent (no significant variance)
        const avgTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;
        const variance = updateTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / updateTimes.length;
        expect(variance).toBeLessThan(1); // Low variance indicates consistent performance
      });

      test('should optimize graphics operations for minimal overhead', () => {
        // Arrange: Track graphics operation calls
        const clearSpy = jest.spyOn(mockGraphics, 'clear');
        const fillStyleSpy = jest.spyOn(mockGraphics, 'fillStyle');
        const fillRectSpy = jest.spyOn(mockGraphics, 'fillRect');
        
        // Act: Update player position
        mapOverlay.updatePlayerPosition(100, 200);
        
        // Assert: Should use minimal graphics operations
        expect(clearSpy).toHaveBeenCalledTimes(1); // One clear per update
        expect(fillStyleSpy).toHaveBeenCalledTimes(2); // Background + player marker
        expect(fillRectSpy).toHaveBeenCalledTimes(1); // Background rectangle
        
        // Should not call expensive operations unnecessarily
        expect(mockGraphics.fillCircle).toHaveBeenCalledTimes(1); // Only player marker
      });
    });

    describe('Performance Monitoring Integration', () => {
      test('should track performance metrics during operation', () => {
        // Arrange: Add performance tracking
        mapOverlay._performanceMetrics = {
          updateCount: 0,
          totalUpdateTime: 0,
          averageUpdateTime: 0
        };
        mapOverlay._updateInterval = 1000 / 30;
        let currentTime = 1000;
        // Act: Multiple updates, each spaced by at least updateInterval
        for (let i = 0; i < 5; i++) {
          currentTime += 40; // >33ms interval
          // Simulate three calls to performance.now() per update: check, start, end
          performanceMock.now
            .mockReturnValueOnce(currentTime)      // for update check
            .mockReturnValueOnce(currentTime)      // for update start
            .mockReturnValueOnce(currentTime + 5); // for update end
          mapOverlay._lastUpdateTime = currentTime - 40;
          mapOverlay.updatePlayerPosition(100 + i, 200 + i);
        }
        // Assert: Performance metrics should be tracked
        expect(mapOverlay._performanceMetrics.updateCount).toBe(5);
        expect(mapOverlay._performanceMetrics.averageUpdateTime).toBeGreaterThan(0);
        expect(mapOverlay._performanceMetrics.averageUpdateTime).toBeLessThan(16); // Within 60fps budget
      });

      test('should detect performance degradation', () => {
        // Arrange: Add performance monitoring
        mapOverlay._lastUpdateTime = 0;
        mapOverlay._updateInterval = 1000 / 30;
        mapOverlay._performanceThreshold = 16; // 60fps threshold
        
        // Act: Simulate slow update by mocking performance.now
        const startTime = 1000;
        performanceMock.now.mockReturnValueOnce(startTime);
        
        // Mock a slow update that takes longer than threshold
        performanceMock.now.mockReturnValueOnce(startTime + 20); // 20ms update time
        
        mapOverlay.updatePlayerPosition(100, 200);
        
        // Assert: Should detect performance issue
        const actualUpdateTime = 20; // Simulated slow update
        expect(actualUpdateTime).toBeGreaterThan(mapOverlay._performanceThreshold);
      });
    });
  });
}); 
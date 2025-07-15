/**
 * ViewportCullingManager Unit Tests
 * 
 * Tests for the ViewportCullingManager class that handles sprite visibility
 * based on camera viewport bounds for performance optimization.
 */

import { ViewportCullingManager } from '../../client/src/systems/ViewportCullingManager.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { jest } from '@jest/globals';

// Use jest.fn() directly since we're in a Jest environment
const createMockFn = (implementation) => jest.fn(implementation);

describe('ViewportCullingManager', () => {
  let sceneMock;
  let cameraMock;
  let cullingManager;

  beforeEach(() => {
    // Create scene mock with enhanced camera
    sceneMock = createPhaserSceneMock('TestScene');
    
    // Enhance camera mock with worldView property for culling tests
    cameraMock = {
      worldView: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        right: 1280,
        bottom: 720
      },
      setBounds: sceneMock.cameras.main.setBounds,
      setZoom: sceneMock.cameras.main.setZoom,
      startFollow: sceneMock.cameras.main.startFollow,
      stopFollow: sceneMock.cameras.main.stopFollow,
      setDeadzone: sceneMock.cameras.main.setDeadzone,
      setTint: sceneMock.cameras.main.setTint,
      clearTint: sceneMock.cameras.main.clearTint,
      followOffset: { x: 0, y: 0 },
      scrollX: 0,
      scrollY: 0,
      zoom: 1.0
    };

    cullingManager = new ViewportCullingManager(sceneMock, cameraMock);
  });

  afterEach(() => {
    sceneMock.resetMocks();
  });

  describe('constructor', () => {
    test('should initialize with default cull distance', () => {
      expect(cullingManager.cullDistance).toBe(200);
    });

    test('should initialize with custom cull distance', () => {
      const customManager = new ViewportCullingManager(sceneMock, cameraMock, { cullDistance: 300 });
      expect(customManager.cullDistance).toBe(300);
    });

    test('should initialize performance metrics', () => {
      expect(cullingManager.performanceMetrics).toEqual({
        totalSprites: 0,
        visibleSprites: 0,
        cullTime: 0
      });
    });

    test('should initialize visible sprites set', () => {
      expect(cullingManager.visibleSprites).toBeInstanceOf(Set);
      expect(cullingManager.visibleSprites.size).toBe(0);
    });
  });

  describe('calculateCullBounds', () => {
    test('should calculate bounds with default cull distance', () => {
      const cameraBounds = { x: 100, y: 200, right: 1380, bottom: 920 };
      const bounds = cullingManager.calculateCullBounds(cameraBounds);
      
      expect(bounds).toEqual({
        left: -100,    // 100 - 200
        right: 1580,   // 1380 + 200
        top: 0,        // 200 - 200
        bottom: 1120   // 920 + 200
      });
    });

    test('should calculate bounds with custom cull distance', () => {
      const customManager = new ViewportCullingManager(sceneMock, cameraMock, { cullDistance: 150 });
      const cameraBounds = { x: 50, y: 100, right: 1330, bottom: 820 };
      const bounds = customManager.calculateCullBounds(cameraBounds);
      
      expect(bounds).toEqual({
        left: -100,    // 50 - 150
        right: 1480,   // 1330 + 150
        top: -50,      // 100 - 150
        bottom: 970    // 820 + 150
      });
    });
  });

  describe('isSpriteInBounds', () => {
    test('should return true for sprite within bounds', () => {
      const bounds = { left: 0, right: 1000, top: 0, bottom: 1000 };
      const sprite = { x: 500, y: 500 };
      
      expect(cullingManager.isSpriteInBounds(sprite, bounds)).toBe(true);
    });

    test('should return false for sprite outside bounds', () => {
      const bounds = { left: 0, right: 1000, top: 0, bottom: 1000 };
      const sprite = { x: 1500, y: 500 };
      
      expect(cullingManager.isSpriteInBounds(sprite, bounds)).toBe(false);
    });

    test('should return true for sprite on boundary', () => {
      const bounds = { left: 0, right: 1000, top: 0, bottom: 1000 };
      const sprite = { x: 0, y: 0 };
      
      expect(cullingManager.isSpriteInBounds(sprite, bounds)).toBe(true);
    });

    test('should return false for sprite just outside boundary', () => {
      const bounds = { left: 0, right: 1000, top: 0, bottom: 1000 };
      const sprite = { x: -1, y: 500 };
      
      expect(cullingManager.isSpriteInBounds(sprite, bounds)).toBe(false);
    });
  });

  describe('updateCulling', () => {
    test('should set sprites visible when in bounds', () => {
      cameraMock.worldView = { x: 0, y: 0, right: 1280, bottom: 720 };
      const sprite0 = { x: 500, y: 500, setVisible: jest.fn(), setActive: jest.fn() };
      const sprite1 = { x: 1500, y: 500, setVisible: jest.fn(), setActive: jest.fn() };
      const sprites = [sprite0, sprite1];
      const spriteGroup = {
        getChildren: () => sprites
      };

      cullingManager.updateCulling(spriteGroup);

      expect(sprite0.setVisible).toHaveBeenCalledWith(true);
      expect(sprite0.setActive).toHaveBeenCalledWith(true);
      expect(sprite1.setVisible).toHaveBeenCalledWith(false);
      expect(sprite1.setActive).toHaveBeenCalledWith(false);
    });

    test('should track visible sprites in set', () => {
      const visibleSprite = { x: 500, y: 500, setVisible: createMockFn(), setActive: createMockFn() };
      const hiddenSprite = { x: 1500, y: 500, setVisible: createMockFn(), setActive: createMockFn() };
      
      const spriteGroup = {
        getChildren: () => [visibleSprite, hiddenSprite]
      };

      cullingManager.updateCulling(spriteGroup);

      expect(cullingManager.visibleSprites.has(visibleSprite)).toBe(true);
      expect(cullingManager.visibleSprites.has(hiddenSprite)).toBe(false);
    });

    test('should update performance metrics', () => {
      const spriteGroup = {
        getChildren: () => [
          { x: 500, y: 500, setVisible: createMockFn(), setActive: createMockFn() },
          { x: 1500, y: 500, setVisible: createMockFn(), setActive: createMockFn() }
        ]
      };

      cullingManager.updateCulling(spriteGroup);

      expect(cullingManager.performanceMetrics.totalSprites).toBe(2);
      expect(cullingManager.performanceMetrics.visibleSprites).toBe(1);
      expect(cullingManager.performanceMetrics.cullTime).toBeGreaterThan(0);
    });

    test('should handle empty sprite group', () => {
      const spriteGroup = {
        getChildren: () => []
      };

      cullingManager.updateCulling(spriteGroup);

      expect(cullingManager.performanceMetrics.totalSprites).toBe(0);
      expect(cullingManager.performanceMetrics.visibleSprites).toBe(0);
      expect(cullingManager.visibleSprites.size).toBe(0);
    });

    test('should clear previously visible sprites when they become hidden', () => {
      const sprite1 = { x: 500, y: 500, setVisible: createMockFn(), setActive: createMockFn() };
      const sprite2 = { x: 1500, y: 500, setVisible: createMockFn(), setActive: createMockFn() };
      
      const spriteGroup = {
        getChildren: () => [sprite1, sprite2]
      };

      // First update - sprite1 visible, sprite2 hidden
      cullingManager.updateCulling(spriteGroup);
      expect(cullingManager.visibleSprites.has(sprite1)).toBe(true);
      expect(cullingManager.visibleSprites.has(sprite2)).toBe(false);

      // Move camera so sprite1 is now hidden, sprite2 visible
      cameraMock.worldView = { x: 1000, y: 0, right: 2280, bottom: 720 };
      cullingManager.updateCulling(spriteGroup);
      
      expect(cullingManager.visibleSprites.has(sprite1)).toBe(false);
      expect(cullingManager.visibleSprites.has(sprite2)).toBe(true);
    });
  });

  describe('performance monitoring', () => {
    test('should measure culling operation time', () => {
      const spriteGroup = {
        getChildren: () => [
          { x: 500, y: 500, setVisible: createMockFn(), setActive: createMockFn() }
        ]
      };

      const startTime = performance.now();
      cullingManager.updateCulling(spriteGroup);
      const endTime = performance.now();

      expect(cullingManager.performanceMetrics.cullTime).toBeGreaterThan(0);
      expect(cullingManager.performanceMetrics.cullTime).toBeLessThanOrEqual(endTime - startTime);
    });

    test('should accumulate performance metrics across multiple updates', () => {
      const spriteGroup = {
        getChildren: () => [
          { x: 500, y: 500, setVisible: createMockFn(), setActive: createMockFn() }
        ]
      };

      cullingManager.updateCulling(spriteGroup);
      const firstCullTime = cullingManager.performanceMetrics.cullTime;
      
      // Reset metrics to simulate a fresh update
      cullingManager.performanceMetrics.cullTime = 0;
      cullingManager.updateCulling(spriteGroup);
      
      expect(cullingManager.performanceMetrics.cullTime).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    test('should handle sprites with decimal coordinates', () => {
      const bounds = { left: 0, right: 1000, top: 0, bottom: 1000 };
      const sprite = { x: 500.5, y: 250.75 };
      
      expect(cullingManager.isSpriteInBounds(sprite, bounds)).toBe(true);
    });

    test('should handle very large cull distance', () => {
      const customManager = new ViewportCullingManager(sceneMock, cameraMock, { cullDistance: 10000 });
      const cameraBounds = { x: 0, y: 0, right: 1280, bottom: 720 };
      const bounds = customManager.calculateCullBounds(cameraBounds);
      
      expect(bounds.left).toBe(-10000);
      expect(bounds.right).toBe(11280);
      expect(bounds.top).toBe(-10000);
      expect(bounds.bottom).toBe(10720);
    });

    test('should handle negative camera coordinates', () => {
      const cameraBounds = { x: -500, y: -300, right: 780, bottom: 420 };
      const bounds = cullingManager.calculateCullBounds(cameraBounds);
      
      expect(bounds).toEqual({
        left: -700,    // -500 - 200
        right: 980,    // 780 + 200
        top: -500,     // -300 - 200
        bottom: 620    // 420 + 200
      });
    });
  });
}); 
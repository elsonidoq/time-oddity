// This test file uses centralized mocks from tests/mocks for Phaser, GSAP, and Howler.js.
// It also uses jest.useFakeTimers() to ensure all time-based and animation logic is tested deterministically.
// See agent_docs/comprehensive_documentation.md for best practices.

import { jest } from '@jest/globals';
import gsap from 'gsap';
import TimeManager from '../../client/src/systems/TimeManager.js';

jest.useFakeTimers();

// Mock Phaser Scene
const mockScene = {
  cameras: {
    main: {
      setTint: jest.fn(),
      clearTint: jest.fn(),
      setAlpha: jest.fn()
    }
  },
  add: {
    graphics: jest.fn(() => ({
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      setAlpha: jest.fn().mockReturnThis(),
      setVisible: jest.fn().mockReturnThis(),
      setScrollFactor: jest.fn().mockReturnThis(),
      setDepth: jest.fn().mockReturnThis(),
      destroy: jest.fn()
    }))
  },
  sys: {
    game: {
      config: {
        width: 1280,
        height: 720
      }
    }
  }
};

describe('TimeManager Red Overlay Visual Effects', () => {
  let timeManager;

  beforeEach(() => {
    timeManager = new TimeManager(mockScene);
    jest.clearAllMocks();
  });

  describe('Red Overlay Color Implementation', () => {
    test('should use red color (0xff0000) for camera tint during rewind', () => {
      // Act
      timeManager.toggleRewind(true);

      // Assert - should use red instead of blue
      expect(mockScene.cameras.main.setTint).toHaveBeenCalledWith(0xff0000);
    });

    test('should use red color (0xff0000) for overlay fillStyle during rewind', () => {
      // Act
      timeManager.toggleRewind(true);

      // Assert - should use red instead of blue
      expect(mockScene.add.graphics).toHaveBeenCalled();
      const graphicsMock = mockScene.add.graphics.mock.results[0].value;
      expect(graphicsMock.fillStyle).toHaveBeenCalledWith(0xff0000, 1);
    });

    test('should maintain full screen coverage for red overlay', () => {
      // Act
      timeManager.toggleRewind(true);

      // Assert - should cover full screen
      expect(mockScene.add.graphics).toHaveBeenCalled();
      const graphicsMock = mockScene.add.graphics.mock.results[0].value;
      expect(graphicsMock.fillRect).toHaveBeenCalledWith(0, 0, 1280, 720);
    });

    test('should maintain proper depth (1000) for red overlay', () => {
      // Act
      timeManager.toggleRewind(true);

      // Assert - should maintain depth 1000
      expect(mockScene.add.graphics).toHaveBeenCalled();
      const graphicsMock = mockScene.add.graphics.mock.results[0].value;
      expect(graphicsMock.setDepth).toHaveBeenCalledWith(1000);
    });

    test('should maintain proper alpha animation for red overlay', () => {
      // Act
      timeManager.toggleRewind(true);

      // Assert - should animate to 0.3 alpha over 0.2 seconds
      expect(gsap.to).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          alpha: 0.3,
          duration: 0.2,
          overwrite: true
        })
      );
    });
  });

  describe('Red Overlay Cleanup', () => {
    test('should properly cleanup red overlay when rewind ends', () => {
      // Arrange - start rewind first
      timeManager.toggleRewind(true);
      const overlay = timeManager._rewindOverlay;

      // Act
      timeManager.toggleRewind(false);

      // Assert - should fade out red overlay
      expect(gsap.killTweensOf).toHaveBeenCalledWith(expect.any(Object));
      expect(gsap.to).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          alpha: 0,
          duration: 0.3,
          onComplete: expect.any(Function)
        })
      );
    });

    test('should clear red camera tint when rewind ends', () => {
      // Arrange - start rewind first
      timeManager.toggleRewind(true);

      // Act
      timeManager.toggleRewind(false);

      // Assert - should clear camera tint
      expect(mockScene.cameras.main.clearTint).toHaveBeenCalled();
    });
  });

  describe('Red Overlay State Management', () => {
    test('should not create multiple red overlays if rewind is already active', () => {
      // Arrange
      timeManager.toggleRewind(true);
      const initialCallCount = mockScene.add.graphics.mock.calls.length;

      // Act
      timeManager.toggleRewind(true); // Call again while already rewinding

      // Assert - should not create additional overlays
      expect(mockScene.add.graphics.mock.calls.length).toBe(initialCallCount);
    });

    test('should maintain red overlay state during rewind', () => {
      // Act
      timeManager.toggleRewind(true);

      // Assert - should be in active rewind state
      expect(timeManager._rewindActive).toBe(true);
      expect(timeManager._rewindOverlay).toBeTruthy();
    });
  });

  describe('Red Overlay Fallback Handling', () => {
    test('should handle missing game config gracefully for red overlay', () => {
      // Arrange - scene without game config
      const sceneWithoutConfig = {
        cameras: {
          main: {
            setTint: jest.fn(),
            clearTint: jest.fn()
          }
        },
        add: {
          graphics: jest.fn(() => ({
            fillStyle: jest.fn().mockReturnThis(),
            fillRect: jest.fn().mockReturnThis(),
            setAlpha: jest.fn().mockReturnThis(),
            setVisible: jest.fn().mockReturnThis(),
            setScrollFactor: jest.fn().mockReturnThis(),
            setDepth: jest.fn().mockReturnThis(),
            destroy: jest.fn()
          }))
        }
        // No sys.game.config
      };

      const timeManagerWithoutConfig = new TimeManager(sceneWithoutConfig);

      // Act
      timeManagerWithoutConfig.toggleRewind(true);

      // Assert - should use default dimensions and red color
      expect(sceneWithoutConfig.add.graphics).toHaveBeenCalled();
      const graphicsMock = sceneWithoutConfig.add.graphics.mock.results[0].value;
      expect(graphicsMock.fillStyle).toHaveBeenCalledWith(0xff0000, 1);
      expect(graphicsMock.fillRect).toHaveBeenCalledWith(0, 0, 1280, 720);
    });
  });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.clearAllTimers();
}); 
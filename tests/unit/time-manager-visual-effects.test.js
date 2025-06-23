// This test file uses centralized mocks from tests/mocks for Phaser, GSAP, and Howler.js.
// It also uses jest.useFakeTimers() to ensure all time-based and animation logic is tested deterministically.
// See agent_docs/comprehensive_documentation.md for best practices.

import { jest } from '@jest/globals';
import { gsap } from 'gsap';
import TimeManager from '../../client/src/systems/TimeManager.js';

jest.useFakeTimers();

// Assign jest.fn() mocks to gsap methods
beforeEach(() => {
  gsap.to = jest.fn();
  gsap.fromTo = jest.fn();
  gsap.killTweensOf = jest.fn();
  gsap.updateRoot = jest.fn();
});

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

describe('TimeManager Visual Effects', () => {
  let timeManager;

  beforeEach(() => {
    timeManager = new TimeManager(mockScene);
    jest.clearAllMocks();
  });

  describe('Rewind Visual Effects', () => {
    test('should create rewind overlay when rewind starts', () => {
      // Act
      timeManager.toggleRewind(true);

      // Assert
      expect(mockScene.add.graphics).toHaveBeenCalled();
      const overlay = timeManager._rewindOverlay;
      expect(gsap.to).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          alpha: 0.3,
          duration: 0.2
        })
      );
    });

    test('should remove rewind overlay when rewind ends', () => {
      // Arrange - start rewind first
      timeManager.toggleRewind(true);
      const overlay = timeManager._rewindOverlay;

      // Act
      timeManager.toggleRewind(false);

      // Assert
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

    test('should apply camera tint effect during rewind', () => {
      // Act
      timeManager.toggleRewind(true);

      // Assert
      expect(mockScene.cameras.main.setTint).toHaveBeenCalledWith(0x4444ff);
    });

    test('should clear camera tint when rewind ends', () => {
      // Arrange - start rewind first
      timeManager.toggleRewind(true);

      // Act
      timeManager.toggleRewind(false);

      // Assert
      expect(mockScene.cameras.main.clearTint).toHaveBeenCalled();
    });

    test('should not create multiple overlays if rewind is already active', () => {
      // Arrange
      timeManager.toggleRewind(true);
      const initialCallCount = mockScene.add.graphics.mock.calls.length;

      // Act
      timeManager.toggleRewind(true); // Call again while already rewinding

      // Assert
      expect(mockScene.add.graphics.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('Visual Effect Cleanup', () => {
    test('should cleanup visual effects on destroy', () => {
      // Arrange
      timeManager.toggleRewind(true);
      const overlay = timeManager._rewindOverlay;

      // Act
      timeManager.destroy();

      // Assert
      if (overlay) {
        expect(overlay.destroy).toHaveBeenCalled();
      }
      expect(mockScene.cameras.main.clearTint).toHaveBeenCalled();
    });
  });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.clearAllTimers();
}); 
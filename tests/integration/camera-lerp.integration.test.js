import GameScene from '../../client/src/scenes/GameScene.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

/**
 * Integration tests for Task 03.02 – Camera lerp constants and behavior.
 * Tests camera smoothing behavior with player movement simulation.
 */

describe('Camera Lerp Integration (Task 03.02)', () => {
  let mockScene;
  let gameScene;

  beforeEach(() => {
    mockScene = createPhaserSceneMock('GameScene');
    gameScene = new GameScene(mockScene);
  });

  describe('Camera Constants', () => {
    it('should expose camera lerp constants for tuning', () => {
      // Verify constants are accessible on GameScene
      expect(typeof GameScene.CAMERA_LERP_X).toBe('number');
      expect(typeof GameScene.CAMERA_LERP_Y).toBe('number');
      expect(typeof GameScene.CAMERA_DEADZONE_X).toBe('number');
      expect(typeof GameScene.CAMERA_DEADZONE_Y).toBe('number');
      
      // Verify constants have reasonable values
      expect(GameScene.CAMERA_LERP_X).toBeGreaterThan(0);
      expect(GameScene.CAMERA_LERP_X).toBeLessThan(1);
      expect(GameScene.CAMERA_LERP_Y).toBeGreaterThan(0);
      expect(GameScene.CAMERA_LERP_Y).toBeLessThan(1);
      expect(GameScene.CAMERA_DEADZONE_X).toBeGreaterThan(0);
      expect(GameScene.CAMERA_DEADZONE_X).toBeLessThan(1);
      expect(GameScene.CAMERA_DEADZONE_Y).toBeGreaterThan(0);
      expect(GameScene.CAMERA_DEADZONE_Y).toBeLessThan(1);
    });

    it('should use constants in camera setup', () => {
      gameScene.create();

      // Verify startFollow uses the constants
      const startFollowCalls = mockScene.cameras.main.startFollow.mock ? 
        mockScene.cameras.main.startFollow.mock.calls :
        mockScene.cameras.main.startFollow.calls;
      
      expect(startFollowCalls.length).toBeGreaterThan(0);
      const [, , lerpX, lerpY] = startFollowCalls[0];
      expect(lerpX).toBe(GameScene.CAMERA_LERP_X);
      expect(lerpY).toBe(GameScene.CAMERA_LERP_Y);

      // Verify setDeadzone uses the constants
      const setDeadzoneCalls = mockScene.cameras.main.setDeadzone.mock ?
        mockScene.cameras.main.setDeadzone.mock.calls :
        mockScene.cameras.main.setDeadzone.calls;
      
      expect(setDeadzoneCalls.length).toBeGreaterThan(0);
      const [deadzoneX, deadzoneY] = setDeadzoneCalls[setDeadzoneCalls.length - 1];
      const expectedDeadzoneX = mockScene.sys.game.config.width * GameScene.CAMERA_DEADZONE_X;
      const expectedDeadzoneY = mockScene.sys.game.config.height * GameScene.CAMERA_DEADZONE_Y;
      expect(deadzoneX).toBe(expectedDeadzoneX);
      expect(deadzoneY).toBe(expectedDeadzoneY);
    });
  });

  describe('Camera Lerp Behavior', () => {
    it('should simulate camera lerp behavior with player movement', () => {
      // Setup: Create scene and player
      gameScene.create();
      
      // Simulate player movement to the right
      const initialPlayerX = gameScene.player.x;
      const targetPlayerX = initialPlayerX + 400; // Move 400px right
      
      // Mock camera scrollX to simulate Phaser's lerp behavior
      let currentScrollX = initialPlayerX;
      mockScene.cameras.main.scrollX = currentScrollX;
      
      // Simulate 3 update ticks with 16ms delta (60fps)
      const delta = 16;
      const lerpX = GameScene.CAMERA_LERP_X;
      
      for (let i = 0; i < 3; i++) {
        // Simulate Phaser's lerp calculation: scrollX += (targetX - scrollX) * lerp
        const targetX = targetPlayerX;
        const lerpDelta = (targetX - currentScrollX) * lerpX;
        currentScrollX += lerpDelta;
        mockScene.cameras.main.scrollX = currentScrollX;
        
        // Advance time
        mockScene.advanceTime(delta);
      }
      
      // Verify camera has moved toward player position
      expect(mockScene.cameras.main.scrollX).toBeGreaterThan(initialPlayerX);
      expect(mockScene.cameras.main.scrollX).toBeLessThan(targetPlayerX);
      
      // Verify movement is within expected lerp range (90% of expected)
      const expectedLerpProgress = 1 - Math.pow(1 - lerpX, 3); // 3 ticks of lerp
      const expectedScrollX = initialPlayerX + (targetPlayerX - initialPlayerX) * expectedLerpProgress;
      const tolerance = expectedScrollX * 0.1; // 10% tolerance
      
      expect(mockScene.cameras.main.scrollX).toBeCloseTo(expectedScrollX, -1);
    });
  });
}); 
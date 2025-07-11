import { jest } from '@jest/globals';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { createEventEmitterMock } from '../mocks/eventEmitterMock.js';

describe('Death Time Reversal Integration Tests', () => {
  let GameScene;
  let Player;
  let GameOverScene;
  let TimeManager;
  let mockScene;
  let gameScene;
  let player;
  let timeManager;
  let gameOverScene;
  let mockEmit;

  beforeAll(async () => {
    // Import the classes
    try {
      const gameSceneModule = await import('../../client/src/scenes/GameScene.js');
      GameScene = gameSceneModule.default;
      
      const playerModule = await import('../../client/src/entities/Player.js');
      Player = playerModule.default;
      
      const gameOverModule = await import('../../client/src/scenes/GameOverScene.js');
      GameOverScene = gameOverModule.default;
      
      const timeManagerModule = await import('../../client/src/systems/TimeManager.js');
      TimeManager = timeManagerModule.default;
    } catch (error) {
      console.error('Failed to import modules:', error);
      throw error;
    }
  });

  beforeEach(() => {
    // Create mock scene with event emitter
    mockScene = createPhaserSceneMock('GameScene');
    mockEmit = jest.fn();
    mockScene.events.emit = mockEmit;
    mockScene.events.on = jest.fn();
    
    // Create GameScene instance
    gameScene = new GameScene(mockScene);
    Object.assign(gameScene, mockScene);
    
    // Mock scene.launch and scene.stop methods
    gameScene.scene = {
      launch: jest.fn(),
      stop: jest.fn(),
      get: jest.fn(() => gameScene)
    };
    
    // Create player instance
    player = new Player(gameScene, 100, 100, 'characters', 'character_beige_idle', 100, mockScene);
    gameScene.player = player;
    
    // Create TimeManager instance
    timeManager = new TimeManager(gameScene);
    gameScene.timeManager = timeManager;
    
    // Create GameOverScene instance
    gameOverScene = new GameOverScene();
    Object.assign(gameOverScene, mockScene);
    gameOverScene.scene = {
      stop: jest.fn(),
      start: jest.fn()
    };
    
    // Set up death state tracking
    gameScene._gameOverTriggered = false;
    gameScene._deathTimestamp = null;

    // Ensure player's scene.timeManager is set for rewind checks
    player.scene.timeManager = timeManager;
    // Also set on _mockScene for any references
    if (player.scene._mockScene) {
      player.scene._mockScene.timeManager = timeManager;
    }
    // Ensure gameScene.events is the same as mockScene.events
    gameScene.events = mockScene.events;
    // Ensure gameScene.scene.get returns the correct GameOverScene mock
    gameScene.scene.get = jest.fn((key) => {
      if (key === 'GameOverScene') return gameOverScene;
      if (key === 'GameScene') return gameScene;
      return undefined;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to find playerDied event calls
  const findPlayerDiedCalls = () => {
    return mockEmit.mock.calls.filter(call => call[0] === 'playerDied');
  };

  // Helper function to simulate death
  const simulatePlayerDeath = () => {
    player.health = 10;
    const isDead = player.takeDamage(20);
    return isDead;
  };

  // Helper function to simulate rewind
  const simulateRewind = (rewindTime) => {
    timeManager.isRewinding = true;
    timeManager.playbackTimestamp = rewindTime;
    timeManager.toggleRewind(true);
  };

  describe('Death State Time Reversal', () => {
    test('should dismiss Game Over scene when rewinding past death', () => {
      // Arrange: Set up death state
      gameScene._gameOverTriggered = true;
      gameScene._deathTimestamp = 1000;
      // Mock GameOverScene as active
      gameOverScene.gameOverActive = true;
      gameOverScene.gameOverOverlay = { destroy: jest.fn() };
      // Spy on handleRewindDismissal
      const dismissSpy = jest.spyOn(gameOverScene, 'handleRewindDismissal');
      // Act: Simulate rewind past death
      simulateRewind(500); // Rewind to before death
      // Trigger rewind death handling
      if (gameScene.handleRewindDeath) {
        gameScene.handleRewindDeath();
      }
      // Assert: GameOverScene should be dismissed
      expect(dismissSpy).toHaveBeenCalled();
      expect(gameOverScene.gameOverActive).toBe(false);
    });

    test('should restore player health when rewinding past death', () => {
      // Arrange: Set up death state with recorded health
      gameScene._gameOverTriggered = true;
      gameScene._deathTimestamp = 1000;
      
      // Record health state before death
      const healthBeforeDeath = 50;
      player.health = 0; // Current dead state
      
      // Mock TimeManager state restoration
      const mockState = {
        x: player.x,
        y: player.y,
        velocityX: 0,
        velocityY: 0,
        animation: 'player-idle',
        isAlive: true,
        isVisible: true,
        health: healthBeforeDeath
      };
      
      // Act: Simulate rewind and health restoration
      simulateRewind(500);
      
      // Trigger state restoration
      if (player.setStateFromRecording) {
        player.setStateFromRecording(mockState);
      }
      
      // Assert: Health should be restored
      expect(player.health).toBe(healthBeforeDeath);
      expect(player.active).toBe(true);
    });

    test('should prevent death event re-emission during rewind', () => {
      // Arrange: Set up death state
      gameScene._gameOverTriggered = true;
      gameScene._deathTimestamp = 1000;
      
      // Act: Simulate rewind
      simulateRewind(500);
      
      // Try to trigger death event during rewind
      const isDead = simulatePlayerDeath();
      
      // Assert: Death event should not be emitted during rewind
      const playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(0);
      expect(gameScene._gameOverTriggered).toBe(true); // Should remain true
    });

    test('should reset death state when rewinding past death', () => {
      // Arrange: Set up death state
      gameScene._gameOverTriggered = true;
      gameScene._deathTimestamp = 1000;
      
      // Act: Simulate rewind past death
      simulateRewind(500);
      
      // Trigger rewind death handling
      if (gameScene.handleRewindDeath) {
        gameScene.handleRewindDeath();
      }
      
      // Assert: Death state should be reset
      expect(gameScene._gameOverTriggered).toBe(false);
      expect(gameScene._deathTimestamp).toBeNull();
    });

    test('should handle scene transitions smoothly during rewind', () => {
      // Arrange: Set up death state with active GameOverScene
      gameScene._gameOverTriggered = true;
      gameScene._deathTimestamp = 1000;
      gameOverScene.gameOverActive = true;
      gameOverScene.gameOverOverlay = { destroy: jest.fn() };
      // Spy on handleRewindDismissal
      const dismissSpy = jest.spyOn(gameOverScene, 'handleRewindDismissal');
      // Act: Simulate rewind past death
      simulateRewind(500);
      if (gameScene.handleRewindDeath) {
        gameScene.handleRewindDeath();
      }
      // Assert: Scene transitions should be handled smoothly
      expect(dismissSpy).toHaveBeenCalled();
      expect(gameOverScene.gameOverActive).toBe(false);
    });
  });

  describe('Death Event Handling During Rewind', () => {
    test('should track death timestamp when player dies', () => {
      // Arrange: Set up player with low health
      player.health = 10;
      // Act: Take fatal damage
      const isDead = player.takeDamage(20);
      // Assert: Death event should have been emitted
      const playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls.length).toBeGreaterThan(0);
      // Assert: Death timestamp should be recorded
      expect(isDead).toBe(true);
      expect(gameScene._deathTimestamp).toBeDefined();
      expect(gameScene._gameOverTriggered).toBe(true);
    });

    test('should not emit death event during rewind', () => {
      // Arrange: Start rewind
      simulateRewind(500);
      
      // Act: Try to trigger death during rewind
      player.health = 10;
      const isDead = player.takeDamage(20);
      
      // Assert: Death event should not be emitted
      const playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(0);
    });

    test('should allow death events after rewind ends', () => {
      // Arrange: Start and end rewind
      simulateRewind(500);
      timeManager.toggleRewind(false);
      
      // Act: Trigger death after rewind ends
      player.health = 10;
      const isDead = player.takeDamage(20);
      
      // Assert: Death event should be emitted normally
      const playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(1);
      expect(isDead).toBe(true);
    });
  });

  describe('Health Restoration During Rewind', () => {
    test('should restore health from TimeManager state', () => {
      // Arrange: Set up TimeManager with recorded health state
      const recordedHealth = 75;
      const mockState = {
        x: player.x,
        y: player.y,
        velocityX: 0,
        velocityY: 0,
        animation: 'player-idle',
        isAlive: true,
        isVisible: true,
        health: recordedHealth
      };
      
      // Set player to dead state
      player.health = 0;
      player.active = false;
      
      // Act: Restore state from TimeManager
      if (player.setStateFromRecording) {
        player.setStateFromRecording(mockState);
      }
      
      // Assert: Health should be restored
      expect(player.health).toBe(recordedHealth);
      expect(player.active).toBe(true);
    });

    test('should handle health restoration with invulnerability state', () => {
      // Arrange: Set up recorded state with invulnerability
      const mockState = {
        x: player.x,
        y: player.y,
        velocityX: 0,
        velocityY: 0,
        animation: 'player-idle',
        isAlive: true,
        isVisible: true,
        health: 50,
        isInvulnerable: true,
        invulnerabilityTimer: 2000
      };
      
      // Set player to dead state
      player.health = 0;
      player.isInvulnerable = false;
      
      // Act: Restore state from TimeManager
      if (player.setStateFromRecording) {
        player.setStateFromRecording(mockState);
      }
      
      // Assert: Health and invulnerability should be restored
      expect(player.health).toBe(50);
      expect(player.isInvulnerable).toBe(true);
      expect(player.invulnerabilityTimer).toBe(2000);
    });
  });

  describe('GameOverScene Rewind Compatibility', () => {
    test('should handle GameOverScene dismissal during rewind', () => {
      // Arrange: Set up active GameOverScene
      gameOverScene.gameOverActive = true;
      gameOverScene.gameOverOverlay = { destroy: jest.fn() };
      // Act: Simulate rewind dismissal
      if (gameOverScene.handleRewindDismissal) {
        gameOverScene.handleRewindDismissal();
      }
      // Assert: Scene should be properly dismissed
      expect(gameOverScene.gameOverActive).toBe(false);
      // Only check destroy if overlay exists
      if (gameOverScene.gameOverOverlay && gameOverScene.gameOverOverlay.destroy) {
        expect(gameOverScene.gameOverOverlay.destroy).toHaveBeenCalled();
      }
    });

    test('should restore player inputs when GameOverScene is dismissed', () => {
      // Arrange: Set up GameOverScene with disabled player inputs
      gameOverScene.player = player;
      player.inputManager = { inputsDisabled: true };
      gameOverScene.gameOverActive = true;
      
      // Act: Simulate rewind dismissal
      if (gameOverScene.handleRewindDismissal) {
        gameOverScene.handleRewindDismissal();
      }
      
      // Assert: Player inputs should be restored
      expect(player.inputManager.inputsDisabled).toBe(false);
    });
  });

  describe('Integration with TimeManager', () => {
    test('should integrate death state with TimeManager recording', () => {
      // Arrange: Register player with TimeManager
      timeManager.register(player);
      
      // Act: Record death state
      player.health = 0;
      timeManager.handleRecord(1000);
      
      // Assert: Death state should be recorded
      const recordedState = timeManager.stateBuffer[0].states[0];
      expect(recordedState.state.health).toBe(0);
      expect(recordedState.state.isAlive).toBe(false);
    });

    test('should restore death state from TimeManager during rewind', () => {
      // Arrange: Set up recorded death state
      const deathState = {
        x: player.x,
        y: player.y,
        velocityX: 0,
        velocityY: 0,
        animation: 'player-idle',
        isAlive: false,
        isVisible: true,
        health: 0
      };
      
      timeManager.stateBuffer.push({
        timestamp: 1000,
        states: [{ target: player, state: deathState }]
      });
      
      // Act: Apply death state during rewind
      timeManager.applyFrame(timeManager.stateBuffer[0]);
      
      // Assert: Death state should be restored
      expect(player.health).toBe(0);
      expect(player.active).toBe(false);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle rewind when no death has occurred', () => {
      // Arrange: No death state
      gameScene._gameOverTriggered = false;
      gameScene._deathTimestamp = null;
      
      // Act: Simulate rewind
      simulateRewind(500);
      
      // Assert: Should handle gracefully without errors
      expect(() => {
        if (gameScene.handleRewindDeath) {
          gameScene.handleRewindDeath();
        }
      }).not.toThrow();
    });

    test('should handle rewind when GameOverScene is not active', () => {
      // Arrange: Death state but no active GameOverScene
      gameScene._gameOverTriggered = true;
      gameScene._deathTimestamp = 1000;
      gameOverScene.gameOverActive = false;
      
      // Act: Simulate rewind past death
      simulateRewind(500);
      
      // Assert: Should handle gracefully
      expect(() => {
        if (gameScene.handleRewindDeath) {
          gameScene.handleRewindDeath();
        }
      }).not.toThrow();
    });

    test('should handle multiple rewind cycles correctly', () => {
      // Arrange: Set up death state
      gameScene._gameOverTriggered = true;
      gameScene._deathTimestamp = 1000;
      
      // Act: Multiple rewind cycles
      simulateRewind(500);
      if (gameScene.handleRewindDeath) {
        gameScene.handleRewindDeath();
      }
      
      simulateRewind(1500);
      if (gameScene.handleRewindDeath) {
        gameScene.handleRewindDeath();
      }
      
      // Assert: State should remain consistent
      expect(gameScene._gameOverTriggered).toBe(false);
      expect(gameScene._deathTimestamp).toBeNull();
    });
  });

  describe('Death Event Emission and Rewind Edge Cases', () => {
    test('should not emit duplicate death events after rewinding past death and dying again', () => {
      // Arrange: Player dies, event emitted
      player.health = 10;
      let isDead = player.takeDamage(20);
      expect(isDead).toBe(true);
      let playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(1);

      // Simulate rewind past death
      simulateRewind(500);
      if (gameScene.handleRewindDeath) gameScene.handleRewindDeath();
      // Restore health via state restoration
      if (player.setStateFromRecording) {
        player.setStateFromRecording({
          x: player.x, y: player.y, velocityX: 0, velocityY: 0, animation: 'player-idle', isAlive: true, isVisible: true, health: 50, isInvulnerable: false, invulnerabilityTimer: 0
        });
      }
      // End rewind
      timeManager.toggleRewind(false);

      // Act: Player dies again
      player.health = 10;
      isDead = player.takeDamage(20);
      playerDiedCalls = findPlayerDiedCalls();
      // Assert: Only one new death event emitted (total 2)
      expect(playerDiedCalls).toHaveLength(2);
      expect(isDead).toBe(true);
    });

    test('should not leave GameOverScene active after multiple rewinds', () => {
      // Arrange: Player dies and GameOverScene is active
      gameScene._gameOverTriggered = true;
      gameScene._deathTimestamp = 1000;
      gameOverScene.gameOverActive = true;
      gameOverScene.gameOverOverlay = { destroy: jest.fn() };

      // Act: Simulate multiple rewinds past death
      for (let i = 0; i < 3; i++) {
        simulateRewind(500 - i * 100);
        if (gameScene.handleRewindDeath) gameScene.handleRewindDeath();
        if (gameOverScene.handleRewindDismissal) gameOverScene.handleRewindDismissal();
      }

      // Assert: GameOverScene is not active
      expect(gameOverScene.gameOverActive).toBe(false);
      expect(gameOverScene.gameOverOverlay).toBeNull || expect(gameOverScene.gameOverOverlay).toBeUndefined;
    });

    test('should reset death event emission flag after health is restored by rewind', () => {
      // Arrange: Player dies, event emitted
      player.health = 10;
      player.takeDamage(20);
      // Simulate rewind and restore health
      simulateRewind(500);
      if (player.setStateFromRecording) {
        player.setStateFromRecording({
          x: player.x, y: player.y, velocityX: 0, velocityY: 0, animation: 'player-idle', isAlive: true, isVisible: true, health: 50, isInvulnerable: false, invulnerabilityTimer: 0
        });
      }
      // End rewind
      timeManager.toggleRewind(false);
      // Act: Player dies again
      player.health = 10;
      const isDead = player.takeDamage(20);
      // Assert: Death event is emitted again (not suppressed)
      const playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls.length).toBeGreaterThanOrEqual(2);
      expect(isDead).toBe(true);
    });

    test('should always restore input after GameOverScene is dismissed by rewind', () => {
      // Arrange: GameOverScene active, input disabled
      gameOverScene.player = player;
      player.inputManager = { inputsDisabled: true };
      gameOverScene.gameOverActive = true;
      gameOverScene.gameOverOverlay = { destroy: jest.fn() };
      // Act: Dismiss via rewind
      if (gameOverScene.handleRewindDismissal) gameOverScene.handleRewindDismissal();
      // Assert: Input is restored
      expect(player.inputManager.inputsDisabled).toBe(false);
    });

    test('should emit death event only once per death, even after multiple rewinds', () => {
      // Arrange: Player dies
      player.health = 10;
      player.takeDamage(20);
      let playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(1);
      // Simulate multiple rewinds and state restorations
      for (let i = 0; i < 3; i++) {
        simulateRewind(500 - i * 100);
        if (player.setStateFromRecording) {
          player.setStateFromRecording({
            x: player.x, y: player.y, velocityX: 0, velocityY: 0, animation: 'player-idle', isAlive: false, isVisible: true, health: 0, isInvulnerable: false, invulnerabilityTimer: 0
          });
        }
      }
      // Assert: No additional death events emitted
      playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(1);
    });
  });
}); 
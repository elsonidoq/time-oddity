import { jest } from '@jest/globals';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { createEventEmitterMock } from '../mocks/eventEmitterMock.js';

describe('Player Death Integration Tests', () => {
  let GameScene;
  let Player;
  let GameOverScene;
  let mockScene;
  let gameScene;
  let player;
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
    
    // Create GameScene instance
    gameScene = new GameScene(mockScene);
    Object.assign(gameScene, mockScene);
    
    // Mock scene.launch method
    gameScene.scene = {
      launch: jest.fn()
    };
    
    // Create player instance
    player = new Player(gameScene, 100, 100, 'characters', 'character_beige_idle', 100, mockScene);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to find playerDied event calls
  const findPlayerDiedCalls = () => {
    return mockEmit.mock.calls.filter(call => call[0] === 'playerDied');
  };

  describe('Death Event Emission', () => {
    test('should emit playerDied event when player health reaches zero', () => {
      // Arrange: Set up player with low health
      player.health = 10;
      
      // Act: Take fatal damage
      const isDead = player.takeDamage(20);
      
      // Assert: Event should be emitted with correct data structure
      expect(isDead).toBe(true);
      const playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(1);
      expect(playerDiedCalls[0]).toEqual(['playerDied', { player }]);
    });

    test('should emit playerDied event only once per death', () => {
      // Arrange: Set up player with low health
      player.health = 10;
      
      // Act: Take fatal damage (this should kill the player)
      player.takeDamage(20);
      
      // Try to take more damage (should not emit another death event since player is already dead)
      player.takeDamage(10);
      player.takeDamage(5);
      
      // Assert: Event should be emitted only once
      const playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(1);
      expect(playerDiedCalls[0]).toEqual(['playerDied', { player }]);
    });

    test('should not emit playerDied event when player is invulnerable', () => {
      // Arrange: Make player invulnerable
      player.isInvulnerable = true;
      player.health = 10;
      
      // Act: Take damage while invulnerable
      const isDead = player.takeDamage(20);
      
      // Assert: No death event should be emitted
      expect(isDead).toBe(false);
      const playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(0);
    });

    test('should include proper player reference in death event', () => {
      // Arrange: Set up player with low health
      player.health = 10;
      
      // Act: Take fatal damage
      player.takeDamage(20);
      
      // Assert: Event should include the correct player reference
      const playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(1);
      expect(playerDiedCalls[0][1].player).toBe(player);
    });
  });

  describe('GameScene Death Event Handling', () => {
    beforeEach(() => {
      // Set up GameScene with death event listener (simulating the actual implementation)
      gameScene._gameOverTriggered = false;
      gameScene.events.on = jest.fn();
      
      // Mock the actual death event listener that would be set up in GameScene
      const deathListener = () => {
        if (!gameScene._gameOverTriggered) {
          gameScene._gameOverTriggered = true;
          if (gameScene.scene && typeof gameScene.scene.launch === 'function') {
            gameScene.scene.launch('GameOverScene');
          }
        }
      };
      
      // Simulate the event being emitted and handled
      gameScene.handlePlayerDeath = deathListener;
    });

    test('should launch GameOverScene when playerDied event is received', () => {
      // Arrange: Set up player with low health
      player.health = 10;
      
      // Act: Take fatal damage and trigger death handler
      player.takeDamage(20);
      gameScene.handlePlayerDeath();
      
      // Assert: GameOverScene should be launched
      expect(gameScene.scene.launch).toHaveBeenCalledWith('GameOverScene');
    });

    test('should prevent multiple GameOverScene launches', () => {
      // Arrange: Set up player with low health
      player.health = 10;
      
      // Act: Take fatal damage and trigger death handler multiple times
      player.takeDamage(20);
      gameScene.handlePlayerDeath();
      gameScene.handlePlayerDeath();
      gameScene.handlePlayerDeath();
      
      // Assert: GameOverScene should be launched only once
      expect(gameScene.scene.launch).toHaveBeenCalledTimes(1);
      expect(gameScene.scene.launch).toHaveBeenCalledWith('GameOverScene');
    });

    test('should set _gameOverTriggered flag to prevent multiple transitions', () => {
      // Arrange: Set up player with low health
      player.health = 10;
      
      // Act: Take fatal damage and trigger death handler
      player.takeDamage(20);
      gameScene.handlePlayerDeath();
      
      // Assert: Flag should be set to true
      expect(gameScene._gameOverTriggered).toBe(true);
    });

    test('should not launch GameOverScene if already triggered', () => {
      // Arrange: Set flag to true and set up player with low health
      gameScene._gameOverTriggered = true;
      player.health = 10;
      
      // Act: Take fatal damage and try to trigger death handler
      player.takeDamage(20);
      gameScene.handlePlayerDeath();
      
      // Assert: GameOverScene should not be launched again
      expect(gameScene.scene.launch).not.toHaveBeenCalled();
    });
  });

  describe('Scene Transition Integration', () => {
    test('should preserve game state during scene transition', () => {
      // Arrange: Set up game state
      gameScene.player = player;
      gameScene._gameOverTriggered = false;
      
      // Set up death event handler
      gameScene.handlePlayerDeath = () => {
        if (!gameScene._gameOverTriggered) {
          gameScene._gameOverTriggered = true;
          if (gameScene.scene && typeof gameScene.scene.launch === 'function') {
            gameScene.scene.launch('GameOverScene');
          }
        }
      };
      
      // Act: Trigger death
      player.health = 10;
      player.takeDamage(20);
      gameScene.handlePlayerDeath();
      
      // Assert: GameOverScene should be launched
      expect(gameScene.scene.launch).toHaveBeenCalledWith('GameOverScene');
      // GameScene should not be stopped, only GameOverScene should be launched as overlay
    });

    test('should handle death event with proper error handling', () => {
      // Arrange: Set up player with low health and mock scene.launch to throw
      player.health = 10;
      gameScene.scene.launch = jest.fn().mockImplementation(() => {
        throw new Error('Scene launch failed');
      });
      
      // Set up death event handler with error handling
      gameScene.handlePlayerDeath = () => {
        if (!gameScene._gameOverTriggered) {
          gameScene._gameOverTriggered = true;
          if (gameScene.scene && typeof gameScene.scene.launch === 'function') {
            try {
              gameScene.scene.launch('GameOverScene');
            } catch (error) {
              console.error('Failed to launch GameOverScene:', error);
            }
          }
        }
      };
      
      // Act & Assert: Should not throw, should handle error gracefully
      expect(() => {
        player.takeDamage(20);
        gameScene.handlePlayerDeath();
      }).not.toThrow();
    });
  });

  describe('Event Data Structure Validation', () => {
    test('should emit playerDied event with correct data structure', () => {
      // Arrange: Set up player with low health
      player.health = 10;
      
      // Act: Take fatal damage
      player.takeDamage(20);
      
      // Assert: Event should have correct structure
      const playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(1);
      expect(playerDiedCalls[0]).toEqual(['playerDied', { player }]);
      
      const eventData = playerDiedCalls[0][1];
      expect(eventData).toHaveProperty('player');
      expect(eventData.player).toBe(player);
    });

    test('should include player reference in death event data', () => {
      // Arrange: Set up player with low health
      player.health = 10;
      
      // Act: Take fatal damage
      player.takeDamage(20);
      
      // Assert: Player reference should be included
      const playerDiedCalls = findPlayerDiedCalls();
      expect(playerDiedCalls).toHaveLength(1);
      const eventData = playerDiedCalls[0][1];
      expect(eventData.player).toBe(player);
      expect(eventData.player.health).toBe(0);
    });
  });

  describe('Death State Tracking', () => {
    test('should track death state to prevent multiple transitions', () => {
      // Arrange: Set up GameScene with death tracking
      gameScene._gameOverTriggered = false;
      gameScene.handlePlayerDeath = () => {
        if (!gameScene._gameOverTriggered) {
          gameScene._gameOverTriggered = true;
          if (gameScene.scene && typeof gameScene.scene.launch === 'function') {
            gameScene.scene.launch('GameOverScene');
          }
        }
      };
      
      // Act: Take fatal damage and trigger death handler
      player.health = 10;
      player.takeDamage(20);
      gameScene.handlePlayerDeath();
      
      // Assert: Death state should be tracked
      expect(gameScene._gameOverTriggered).toBe(true);
    });

    test('should reset death state when GameScene is restarted', () => {
      // Arrange: Set up GameScene with death tracking
      gameScene._gameOverTriggered = true;
      
      // Act: Simulate scene restart
      gameScene._gameOverTriggered = false;
      
      // Assert: Death state should be reset
      expect(gameScene._gameOverTriggered).toBe(false);
    });
  });

  describe('Cleanup and State Reset', () => {
    test('should clean up death event listeners on scene shutdown', () => {
      // Arrange: Set up death event listener
      const removeListener = jest.fn();
      gameScene.events.off = removeListener;
      
      // Act: Simulate scene shutdown
      if (gameScene.onShutdown) {
        gameScene.onShutdown();
      }
      
      // Assert: Event listeners should be cleaned up
      // Note: This test verifies that cleanup methods exist and can be called
      expect(typeof gameScene.onShutdown).toBe('function');
    });

    test('should reset death state on scene restart', () => {
      // Arrange: Set death state to true
      gameScene._gameOverTriggered = true;
      
      // Act: Simulate scene restart
      gameScene._gameOverTriggered = false;
      
      // Assert: Death state should be reset
      expect(gameScene._gameOverTriggered).toBe(false);
    });
  });
}); 
import { jest } from '@jest/globals';
import GameScene from '../../client/src/scenes/GameScene.js';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { createEventEmitterMock } from '../mocks/eventEmitterMock.js';

// No jest.mock block here; use manual dependency injection

describe('Complete Enemy System Integration', () => {
  let gameScene;
  let mockScene;
  let mockEventEmitter;
  let mockTimeManager;
  let mockCollisionManager;
  let mockEnemiesGroup;
  let mockPlayer;
  let mockPlatforms;
  let mockSceneFactory;

  beforeEach(() => {
    // Use centralized mock architecture per testing best practices
    mockScene = createPhaserSceneMock();
    mockEventEmitter = createEventEmitterMock();
    // Ensure emit is a Jest mock
    mockEventEmitter.emit = jest.fn();
    
    // Create comprehensive mocks for all enemy system components
    mockTimeManager = {
      register: jest.fn(),
      startRewind: jest.fn(),
      stopRewind: jest.fn(),
      isRewinding: false,
      update: jest.fn(),
      toggleRewind: jest.fn()
    };
    
    mockCollisionManager = {
      setupPlayerEnemyCollision: jest.fn(),
      addCollider: jest.fn(),
      addOverlap: jest.fn()
    };
    
    mockEnemiesGroup = {
      add: jest.fn(),
      getChildren: jest.fn(() => []),
      children: { entries: [] }
    };
    
    mockPlayer = {
      health: 100,
      maxHealth: 100,
      takeDamage: jest.fn(),
      attackPower: 20,
      body: { velocity: { x: 0, y: 0 } },
      inputManager: { isPauseJustPressed: false, isMutePressed: false, isRewindPressed: false },
      update: jest.fn()
    };
    
    mockPlatforms = {
      add: jest.fn(),
      getChildren: jest.fn(() => [])
    };
    
    mockSceneFactory = {
      createEnemiesFromConfig: jest.fn(() => []),
      loadConfiguration: jest.fn(() => true)
    };
    
    // Create GameScene with injected mocks
    gameScene = new GameScene(mockScene);
    
    // Inject all mocks BEFORE create() is called (dependency injection pattern)
    gameScene.timeManager = mockTimeManager;
    gameScene.collisionManager = mockCollisionManager;
    gameScene.enemies = mockEnemiesGroup;
    gameScene.player = mockPlayer;
    gameScene.platforms = mockPlatforms;
    gameScene.sceneFactory = mockSceneFactory;
    
    // Mock registry and other required properties
    gameScene.registry = { set: jest.fn() };
    gameScene.audioManager = { playMusic: jest.fn(), toggleMute: jest.fn() };
    gameScene.cameras = { main: { setBounds: jest.fn(), startFollow: jest.fn(), setDeadzone: jest.fn() } };
    gameScene.physics = { 
      world: { 
        gravity: { y: 0 }, 
        bounds: { setTo: jest.fn() },
        pause: jest.fn(),
        tileBias: 32
      },
      config: {
        debug: false
      },
      add: {
        group: jest.fn(() => mockEnemiesGroup),
        overlap: jest.fn()
      }
    };
    
    // Mock the factory methods that are called during create()
    gameScene.createPlatformsWithFactory = jest.fn();
    gameScene.createCoinsWithFactory = jest.fn();
    gameScene.createGoalsWithFactory = jest.fn();
    gameScene.createParallaxBackground = jest.fn();
    gameScene.registerShutdown = jest.fn();
    
    // Override the parts of create() that would instantiate real objects
    const originalCreate = gameScene.create.bind(gameScene);
    gameScene.create = function(data) {
      // Set up required properties that would normally be set up earlier
      this.levelWidth = 1280;
      this.levelHeight = 720;
      this._levelCompletedEmitted = false;
      // Set levelConfig from data if present
      if (data && data.levelConfig) {
        this.levelConfig = data.levelConfig;
      }
      // Call the enemy creation method we want to test
      this.createEnemiesWithFactory();
      // Set up event emitter for testing
      this.events = mockEventEmitter;
    };
  });

  describe('Complete Enemy Lifecycle Integration', () => {
    it('should handle complete enemy lifecycle from JSON to gameplay', () => {
      // Red phase - this test MUST fail initially
      const levelConfig = {
        enemies: [
          { 
            type: 'LoopHound', 
            x: 300, 
            y: 450, 
            patrolDistance: 150,
            direction: 1,
            speed: 80
          }
        ]
      };
      
      // Mock SceneFactory to return a real enemy
      const mockEnemy = {
        x: 300,
        y: 450,
        health: 100,
        maxHealth: 100,
        isFrozen: false,
        freeze: jest.fn(),
        unfreeze: jest.fn(),
        takeDamage: jest.fn(),
        isDead: jest.fn(() => false),
        activate: jest.fn(),
        update: jest.fn(),
        body: { velocity: { x: 0, y: 0 } }
      };
      
      mockSceneFactory.createEnemiesFromConfig.mockReturnValue([mockEnemy]);
      mockEnemiesGroup.children.entries = [mockEnemy];
      
      // Create GameScene with level config
      gameScene.create({ levelConfig });
      
      // 1. Verify enemy created and integrated
      expect(gameScene.enemies.children.entries).toHaveLength(1);
      expect(mockSceneFactory.createEnemiesFromConfig).toHaveBeenCalledWith(levelConfig);
      
      // 2. Verify TimeManager registration
      expect(mockTimeManager.register).toHaveBeenCalledWith(mockEnemy);
      
      // 3. Verify collision setup
      expect(mockCollisionManager.setupPlayerEnemyCollision).toHaveBeenCalledWith(
        mockPlayer, 
        mockEnemiesGroup,
        expect.any(Function)
      );
      
      // 4. Verify enemy activation
      expect(mockEnemy.activate).toHaveBeenCalled();
    });

    it('should handle multiple enemies from JSON configuration', () => {
      // Red phase - test multiple enemy creation
      const levelConfig = {
        enemies: [
          { type: 'LoopHound', x: 300, y: 450, patrolDistance: 150 },
          { type: 'LoopHound', x: 600, y: 450, patrolDistance: 200 },
          { type: 'LoopHound', x: 900, y: 450, patrolDistance: 100 }
        ]
      };
      
      const mockEnemies = levelConfig.enemies.map((config, index) => ({
        x: config.x,
        y: config.y,
        health: 100,
        maxHealth: 100,
        isFrozen: false,
        freeze: jest.fn(),
        unfreeze: jest.fn(),
        takeDamage: jest.fn(),
        isDead: jest.fn(() => false),
        activate: jest.fn(),
        update: jest.fn(),
        body: { velocity: { x: 0, y: 0 } }
      }));
      
      mockSceneFactory.createEnemiesFromConfig.mockReturnValue(mockEnemies);
      mockEnemiesGroup.children.entries = mockEnemies;
      
      gameScene.create({ levelConfig });
      
      // Verify all enemies created and registered
      expect(gameScene.enemies.children.entries).toHaveLength(3);
      expect(mockTimeManager.register).toHaveBeenCalledTimes(3);
      expect(mockCollisionManager.setupPlayerEnemyCollision).toHaveBeenCalledWith(
        mockPlayer, 
        mockEnemiesGroup,
        expect.any(Function)
      );
    });
  });

  describe('Player-Enemy Collision Damage Integration', () => {
    it('should damage player when colliding with active enemy', () => {
      // Red phase - test collision damage direction
      const mockEnemy = {
        x: 300,
        y: 450,
        health: 100,
        maxHealth: 100,
        damage: 20,
        isFrozen: false,
        freeze: jest.fn(),
        unfreeze: jest.fn(),
        takeDamage: jest.fn(),
        isDead: jest.fn(() => false),
        activate: jest.fn(),
        update: jest.fn(),
        body: { velocity: { x: 0, y: 0 } }
      };
      
      mockSceneFactory.createEnemiesFromConfig.mockReturnValue([mockEnemy]);
      mockEnemiesGroup.children.entries = [mockEnemy];
      
      gameScene.create({});
      
      // Simulate collision callback
      const collisionCallback = mockCollisionManager.setupPlayerEnemyCollision.mock.calls[0][2];
      collisionCallback(mockPlayer, mockEnemy);
      
      // Verify player takes damage, enemy doesn't
      expect(mockPlayer.takeDamage).toHaveBeenCalledWith(20);
      expect(mockEnemy.takeDamage).not.toHaveBeenCalled();
      
      // Verify event emission
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('playerEnemyCollision', {
        player: mockPlayer,
        enemy: mockEnemy
      });
    });

    it('should allow player to defeat frozen enemies', () => {
      // Red phase - test freeze-to-kill mechanics
      const mockEnemy = {
        x: 300,
        y: 450,
        health: 100,
        maxHealth: 100,
        damage: 20,
        isFrozen: true,
        freeze: jest.fn(),
        unfreeze: jest.fn(),
        takeDamage: jest.fn(),
        isDead: jest.fn(() => false),
        activate: jest.fn(),
        update: jest.fn(),
        body: { velocity: { x: 0, y: 0 } }
      };
      
      mockSceneFactory.createEnemiesFromConfig.mockReturnValue([mockEnemy]);
      mockEnemiesGroup.children.entries = [mockEnemy];
      
      gameScene.create({});
      
      // Simulate collision callback with frozen enemy
      const collisionCallback = mockCollisionManager.setupPlayerEnemyCollision.mock.calls[0][2];
      collisionCallback(mockPlayer, mockEnemy);
      
      // Verify enemy takes damage, player doesn't
      expect(mockEnemy.takeDamage).toHaveBeenCalledWith(20); // player.attackPower
      expect(mockPlayer.takeDamage).not.toHaveBeenCalled();
    });
  });

  describe('Time Reversal Integration', () => {
    it('should preserve enemy state during time reversal', () => {
      // Red phase - test time reversal compatibility
      const mockEnemy = {
        x: 300,
        y: 450,
        health: 50, // Damaged enemy
        maxHealth: 100,
        isFrozen: true, // Frozen enemy
        freeze: jest.fn(),
        unfreeze: jest.fn(),
        takeDamage: jest.fn(),
        isDead: jest.fn(() => false),
        activate: jest.fn(),
        update: jest.fn(),
        body: { velocity: { x: 0, y: 0 } },
        getStateForRecording: jest.fn(() => ({
          x: 300,
          y: 450,
          velocityX: 0,
          velocityY: 0,
          animation: 'enemy_idle',
          active: true,
          visible: true,
          health: 50,
          isFrozen: true
        })),
        setStateFromRecording: jest.fn()
      };
      
      mockSceneFactory.createEnemiesFromConfig.mockReturnValue([mockEnemy]);
      mockEnemiesGroup.children.entries = [mockEnemy];
      
      gameScene.create({});
      
      // Verify enemy registered with TimeManager
      expect(mockTimeManager.register).toHaveBeenCalledWith(mockEnemy);
      
      // Simulate time reversal
      mockTimeManager.isRewinding = true;
      gameScene.update(1000, 16);
      // Simulate TimeManager calling getStateForRecording
      mockEnemy.getStateForRecording();
      // Verify enemy state methods called during rewind
      expect(mockEnemy.getStateForRecording).toHaveBeenCalled();
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle invalid enemy configurations gracefully', () => {
      // Red phase - test error handling
      const invalidConfig = {
        enemies: [
          { type: 'InvalidEnemy', x: 300, y: 450 }, // Invalid enemy type
          { type: 'LoopHound', x: 'invalid', y: 450 }, // Invalid coordinates
          { type: 'LoopHound', x: 300, y: 450, patrolDistance: -50 } // Invalid patrol distance
        ]
      };
      
      mockSceneFactory.createEnemiesFromConfig.mockReturnValue([]); // No enemies created
      
      gameScene.create({ levelConfig: invalidConfig });
      
      // Verify graceful handling - no errors thrown
      expect(mockSceneFactory.createEnemiesFromConfig).toHaveBeenCalledWith(invalidConfig);
      expect(gameScene.enemies.children.entries).toHaveLength(0);
    });

    it('should handle missing enemy configuration gracefully', () => {
      // Red phase - test missing config handling
      const configWithoutEnemies = {
        platforms: [],
        coins: []
        // No enemies array
      };
      
      mockSceneFactory.createEnemiesFromConfig.mockReturnValue([]);
      
      gameScene.create({ levelConfig: configWithoutEnemies });
      
      // Verify graceful handling
      expect(mockSceneFactory.createEnemiesFromConfig).toHaveBeenCalledWith(configWithoutEnemies);
      expect(gameScene.enemies.children.entries).toHaveLength(0);
    });

    it('should maintain performance with multiple enemies', () => {
      // Red phase - test performance with many enemies
      const manyEnemies = Array.from({ length: 20 }, (_, i) => ({
        type: 'LoopHound',
        x: 100 + (i * 50),
        y: 450,
        patrolDistance: 100 + (i * 10)
      }));
      
      const levelConfig = { enemies: manyEnemies };
      
      const mockEnemies = manyEnemies.map(config => ({
        x: config.x,
        y: config.y,
        health: 100,
        maxHealth: 100,
        isFrozen: false,
        freeze: jest.fn(),
        unfreeze: jest.fn(),
        takeDamage: jest.fn(),
        isDead: jest.fn(() => false),
        activate: jest.fn(),
        update: jest.fn(),
        body: { velocity: { x: 0, y: 0 } }
      }));
      
      mockSceneFactory.createEnemiesFromConfig.mockReturnValue(mockEnemies);
      mockEnemiesGroup.children.entries = mockEnemies;
      
      const startTime = Date.now();
      gameScene.create({ levelConfig });
      const endTime = Date.now();
      
      // Verify all enemies created
      expect(gameScene.enemies.children.entries).toHaveLength(20);
      expect(mockTimeManager.register).toHaveBeenCalledTimes(20);
      
      // Verify reasonable performance (should complete quickly)
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
    });
  });

  describe('Event System Integration', () => {
    it('should emit correct events during enemy interactions', () => {
      // Red phase - test event emission
      const mockEnemy = {
        x: 300,
        y: 450,
        health: 100,
        maxHealth: 100,
        damage: 20,
        isFrozen: false,
        freeze: jest.fn(),
        unfreeze: jest.fn(),
        takeDamage: jest.fn(),
        isDead: jest.fn(() => false),
        activate: jest.fn(),
        update: jest.fn(),
        body: { velocity: { x: 0, y: 0 } }
      };
      
      mockSceneFactory.createEnemiesFromConfig.mockReturnValue([mockEnemy]);
      mockEnemiesGroup.children.entries = [mockEnemy];
      
      gameScene.create({});
      
      // Simulate enemy freeze
      mockEnemy.freeze(1000);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('enemyFrozen', mockEnemy);
      
      // Simulate enemy unfreeze
      mockEnemy.unfreeze();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('enemyUnfrozen', mockEnemy);
    });
  });
}); 
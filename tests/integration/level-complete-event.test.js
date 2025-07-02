import { jest } from '@jest/globals';
import GameScene from '../../client/src/scenes/GameScene.js';
import { PhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { EventEmitterMock } from '../mocks/eventEmitterMock.js';

describe('Level Complete Event Integration', () => {
  let mockScene;
  let gameScene;
  let eventEmitter;

  beforeEach(() => {
    // Create mock scene with physics and events
    mockScene = new PhaserSceneMock();
    eventEmitter = new EventEmitterMock();
    eventEmitter.emit = jest.fn();
    mockScene.events = eventEmitter;
    
    // Mock physics world with pause method and gravity
    mockScene.physics.world = {
      pause: jest.fn(),
      gravity: { y: 980 },
      tileBias: 32,
      bounds: { setTo: jest.fn() }
    };
    
    // Mock physics config
    mockScene.physics.config = {
      debug: false
    };
    
    // Mock physics groups
    const mockPlatform = { setOrigin: jest.fn().mockReturnThis(), body: { setImmovable: jest.fn(), setAllowGravity: jest.fn(), setSize: jest.fn(), setOffset: jest.fn() } };
    mockScene.physics.add.group = jest.fn(() => ({
      add: jest.fn(),
      create: jest.fn(() => mockPlatform),
      getChildren: jest.fn(() => [])
    }));
    
    // Mock registry
    mockScene.registry = {
      set: jest.fn()
    };
    
    // Mock game config
    mockScene.sys = {
      game: {
        config: {
          width: 1280,
          height: 720,
          physics: {
            arcade: {
              debug: false
            }
          }
        }
      }
    };
    
    // Mock cameras
    mockScene.cameras = {
      main: {
        setBounds: jest.fn(),
        setZoom: jest.fn(),
        startFollow: jest.fn(),
        setDeadzone: jest.fn()
      }
    };
    
    // Mock add method for UI elements
    mockScene.add = {
      tileSprite: jest.fn(() => ({ setDepth: jest.fn(), setData: jest.fn() })),
      text: jest.fn(() => ({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn()
      })),
      existing: jest.fn(),
      group: jest.fn(() => ({
        add: jest.fn(),
        create: jest.fn(() => mockPlatform),
        getChildren: jest.fn(() => [])
      })),
      sprite: jest.fn(() => ({
        setActive: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setOrigin: jest.fn().mockReturnThis(),
        body: { setImmovable: jest.fn(), setAllowGravity: jest.fn(), setSize: jest.fn(), setOffset: jest.fn() }
      }))
    };
    
    // Mock scene management
    mockScene.scene = {
      start: jest.fn(),
      pause: jest.fn(),
      launch: jest.fn()
    };
    
    // Create GameScene instance
    gameScene = new GameScene(mockScene);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Goal Tile Overlap Detection', () => {
    it('should set up overlap between players and goalTiles groups in create()', () => {
      // Mock the physics groups
      const playersGroup = { add: jest.fn() };
      const goalTilesGroup = { add: jest.fn() };
      
      gameScene.players = playersGroup;
      gameScene.goalTiles = goalTilesGroup;
      
      // Mock physics.add.overlap
      const mockOverlap = jest.fn();
      mockScene.physics.add.overlap = mockOverlap;
      
      // Call create method
      gameScene.create();
      
      // Verify overlap was set up between players and goalTiles
      expect(mockOverlap).toHaveBeenCalledWith(
        expect.any(Object), // players group
        expect.any(Object), // goal tiles group
        expect.any(Function), // callback function
        null, // processCallback
        gameScene // context
      );
    });

    it('should emit levelCompleted event when player overlaps goal tile', () => {
      // Mock the physics groups
      const playersGroup = { add: jest.fn() };
      const goalTilesGroup = { add: jest.fn() };
      
      gameScene.players = playersGroup;
      gameScene.goalTiles = goalTilesGroup;
      
      // Mock physics.add.overlap to capture the callback
      let overlapCallback;
      mockScene.physics.add.overlap = jest.fn((obj1, obj2, callback) => {
        overlapCallback = callback;
      });
      
      // Call create method to set up the overlap
      gameScene.create();
      
      // Verify overlap was set up
      expect(mockScene.physics.add.overlap).toHaveBeenCalled();
      expect(overlapCallback).toBeDefined();
      
      // Simulate player overlapping with goal tile
      const mockPlayer = { x: 400, y: 850 };
      const mockGoalTile = { x: 400, y: 850 };
      
      // Call the overlap callback
      overlapCallback(mockPlayer, mockGoalTile);
      
      // Verify levelCompleted event was emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith('levelCompleted');
      
      // Verify physics world was paused
      expect(mockScene.physics.world.pause).toHaveBeenCalled();
    });

    it('should pause physics world when level is completed', () => {
      // Mock the physics groups
      const playersGroup = { add: jest.fn() };
      const goalTilesGroup = { add: jest.fn() };
      
      gameScene.players = playersGroup;
      gameScene.goalTiles = goalTilesGroup;
      
      // Mock physics.add.overlap to capture the callback
      let overlapCallback;
      mockScene.physics.add.overlap = jest.fn((obj1, obj2, callback) => {
        overlapCallback = callback;
      });
      
      // Call create method to set up the overlap
      gameScene.create();
      
      // Simulate player overlapping with goal tile
      const mockPlayer = { x: 400, y: 850 };
      const mockGoalTile = { x: 400, y: 850 };
      
      // Call the overlap callback
      overlapCallback(mockPlayer, mockGoalTile);
      
      // Verify physics world pause was called
      expect(mockScene.physics.world.pause).toHaveBeenCalledTimes(1);
    });

    it('should emit levelCompleted event only once per overlap', () => {
      // Mock the physics groups
      const playersGroup = { add: jest.fn() };
      const goalTilesGroup = { add: jest.fn() };
      
      gameScene.players = playersGroup;
      gameScene.goalTiles = goalTilesGroup;
      
      // Mock physics.add.overlap to capture the callback
      let overlapCallback;
      mockScene.physics.add.overlap = jest.fn((obj1, obj2, callback) => {
        overlapCallback = callback;
      });
      
      // Call create method to set up the overlap
      gameScene.create();
      
      // Simulate multiple overlaps
      const mockPlayer = { x: 400, y: 850 };
      const mockGoalTile = { x: 400, y: 850 };
      
      // Call the overlap callback multiple times
      overlapCallback(mockPlayer, mockGoalTile);
      overlapCallback(mockPlayer, mockGoalTile);
      overlapCallback(mockPlayer, mockGoalTile);
      
      // Verify levelCompleted event was emitted exactly once
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith('levelCompleted');
    });
  });
}); 
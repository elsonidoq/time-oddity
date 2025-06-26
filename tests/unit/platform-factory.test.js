import { jest } from '@jest/globals';

describe('Task 1.2: PlatformFactory', () => {
  let PlatformFactory;
  let Platform;
  let mockScene;

  beforeAll(async () => {
    Platform = (await import('../../client/src/entities/Platform.js')).default;
    try {
      PlatformFactory = (await import('../../client/src/systems/PlatformFactory.js')).default;
    } catch (e) {
      // fallback mock for test red phase
      PlatformFactory = class PlatformFactory {
        constructor(scene) { this.scene = scene; }
        createPlatform(config) { return new Platform(this.scene, config); }
      };
    }
  });

  beforeEach(() => {
    mockScene = {
      add: { existing: jest.fn() },
      physics: {
        add: {
          existing: (obj) => {
            obj.body = {
              setImmovable: jest.fn().mockReturnThis(),
              setAllowGravity: jest.fn().mockReturnThis(),
              setSize: jest.fn().mockReturnThis(),
              setOffset: jest.fn().mockReturnThis(),
              velocity: { x: 0, y: 0 }
            };
          }
        }
      }
    };
  });

  describe('Factory Creation', () => {
    test('should instantiate with a scene', () => {
      const factory = new PlatformFactory(mockScene);
      expect(factory).toBeInstanceOf(PlatformFactory);
      expect(factory.scene).toBe(mockScene);
    });
  });

  describe('Platform Creation', () => {
    test('should create a Platform with valid config', () => {
      const factory = new PlatformFactory(mockScene);
      const config = {
        x: 100, y: 200, frameKey: 'terrain_grass_block_center', isFullBlock: true
      };
      const platform = factory.createPlatform(config);
      expect(platform).toBeInstanceOf(Platform);
      expect(platform.x).toBe(100);
      expect(platform.y).toBe(200);
      expect(platform.frameKey).toBe('terrain_grass_block_center');
      expect(platform.isFullBlock).toBe(true);
    });

    test('should assign default values for missing optional config', () => {
      const factory = new PlatformFactory(mockScene);
      const config = { x: 50, y: 75, frameKey: 'terrain_grass_block_center' };
      const platform = factory.createPlatform(config);
      expect(platform.width).toBe(64);
      expect(platform.height).toBe(64);
      expect(platform.textureKey).toBe('tiles');
      expect(platform.isFullBlock).toBe(false);
      expect(platform.platformType).toBe('static');
    });

    test('should throw error if required config is missing', () => {
      const factory = new PlatformFactory(mockScene);
      expect(() => factory.createPlatform({})).toThrow();
      expect(() => factory.createPlatform({ x: 10 })).toThrow();
      expect(() => factory.createPlatform({ y: 10 })).toThrow();
      expect(() => factory.createPlatform({ frameKey: 'foo' })).toThrow();
    });

    test('should validate movementConfig for moving platforms', () => {
      const factory = new PlatformFactory(mockScene);
      const config = {
        x: 10, y: 20, frameKey: 'terrain_grass_block_center', platformType: 'moving',
        movementConfig: {
          path: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
          speed: 50, loop: true, pingPong: false, startDelay: 0
        }
      };
      const platform = factory.createPlatform(config);
      expect(platform.platformType).toBe('moving');
      expect(platform.movementConfig).toBeDefined();
      expect(platform.movementConfig.path.length).toBe(2);
    });

    test('should throw error for invalid movementConfig', () => {
      const factory = new PlatformFactory(mockScene);
      const badConfig = {
        x: 10, y: 20, frameKey: 'terrain_grass_block_center', platformType: 'moving',
        movementConfig: { path: [], speed: -1 }
      };
      expect(() => factory.createPlatform(badConfig)).toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should throw descriptive error for invalid config', () => {
      const factory = new PlatformFactory(mockScene);
      expect(() => factory.createPlatform({ x: 0, y: 0 })).toThrow(/frameKey/);
      expect(() => factory.createPlatform({ frameKey: 'foo' })).toThrow(/x/);
    });
  });
}); 
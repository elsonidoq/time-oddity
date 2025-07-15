import { GameScene } from '../../client/src/scenes/GameScene.js';
import { ViewportCullingManager } from '../../client/src/systems/ViewportCullingManager.js';
import { jest } from '@jest/globals';

// Centralized mock helpers
function createMockCamera() {
  return {
    worldView: { x: 0, y: 0, right: 1280, bottom: 720 },
    setBounds: jest.fn()
  };
}

function createMockSprite() {
  return {
    setOrigin: jest.fn(),
    setScale: jest.fn(),
    body: { setAllowGravity: jest.fn(), setImmovable: jest.fn() }
  };
}

function createMockGroup() {
  return {
    getChildren: () => [],
    add: jest.fn(),
    create: jest.fn(() => createMockSprite())
  };
}

describe('GameScene Culling Integration', () => {
  let scene;
  let camera;
  let platformsGroup;
  let decorativeGroup;
  let cullingManager;

  beforeEach(() => {
    camera = createMockCamera();
    platformsGroup = createMockGroup();
    decorativeGroup = createMockGroup();
    cullingManager = {
      updateCulling: jest.fn(),
      performanceMetrics: { visibleSprites: 0, totalSprites: 0 }
    };
    
    // Minimal GameScene mock
    scene = new GameScene();
    scene.cameras = { main: camera };
    scene.physics = { add: {
      group: jest.fn(() => platformsGroup),
      sprite: jest.fn(() => createMockSprite()),
      existing: jest.fn(),
      collider: jest.fn(),
      overlap: jest.fn()
    } };
    scene.viewportCullingManager = null;
    scene.platforms = platformsGroup;
    scene.decorativeTiles = decorativeGroup;
    scene.time = 0;
    scene.sys = { game: { config: { width: 1280, height: 720 } } };
    scene.input = { keyboard: { addKey: jest.fn(() => ({})) } };
    // Patch ViewportCullingManager to return our mock
    jest.spyOn(ViewportCullingManager.prototype, 'constructor').mockImplementation(() => cullingManager);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should initialize ViewportCullingManager in create()', () => {
    scene.create();
    expect(scene.viewportCullingManager).toBeDefined();
    expect(scene.viewportCullingManager).toBeInstanceOf(ViewportCullingManager);
  });

  test('should call updateCulling on both groups in update()', () => {
    scene.viewportCullingManager = cullingManager;
    scene.platforms = platformsGroup;
    scene.decorativeTiles = decorativeGroup;
    scene.update(0, 16);
    expect(cullingManager.updateCulling).toHaveBeenCalledWith(platformsGroup);
    expect(cullingManager.updateCulling).toHaveBeenCalledWith(decorativeGroup);
  });

  test('should log performance metrics every 60 frames', () => {
    scene.viewportCullingManager = cullingManager;
    scene.platforms = platformsGroup;
    scene.decorativeTiles = decorativeGroup;
    scene.time = 60;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    scene.update(0, 16);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Culling:')
    );
    logSpy.mockRestore();
  });
}); 
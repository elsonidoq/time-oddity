import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import MovingPlatform from '../../client/src/entities/MovingPlatform.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

describe('Integration: SceneFactory moving platform width', () => {
  let sceneFactory;
  let mockScene;
  let mockPlatformsGroup;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    mockPlatformsGroup = {
      add: jest.fn((platform) => platform),
      getChildren: jest.fn(() => []),
    };
    // Patch mockScene.physics.add.sprite for MovingPlatform
    mockScene.physics = mockScene.physics || {};
    mockScene.physics.add = mockScene.physics.add || {};
    mockScene.physics.add.sprite = jest.fn((x, y, texture, frame) => ({
      x,
      y,
      texture,
      frame,
      setOrigin: jest.fn().mockReturnThis(),
      body: {
        setImmovable: jest.fn(),
        setAllowGravity: jest.fn(),
        setSize: jest.fn(),
        setOffset: jest.fn(),
        setFriction: jest.fn(),
        setBounce: jest.fn(),
        setCollideWorldBounds: jest.fn(),
        setVelocity: jest.fn(),
        velocity: { x: 0, y: 0 },
        touching: { up: false, down: false, left: false, right: false }
      },
      width: 64,
      height: 64,
      active: true,
      visible: true,
      anims: {
        currentAnim: { key: null },
        play: jest.fn()
      }
    }));
    sceneFactory = new SceneFactory(mockScene);
  });

  test('should create a multi-width moving platform with correct sprite count and positions', () => {
    const config = {
      platforms: [
        {
          type: 'moving',
          x: 400,
          y: 300,
          width: 192, // 3 tiles
          tilePrefix: 'terrain_grass_block',
          isFullBlock: true,
          movement: {
            type: 'linear',
            speed: 60,
            startX: 400,
            startY: 300,
            endX: 600,
            endY: 300,
            mode: 'bounce',
            autoStart: false
          }
        }
      ]
    };
    sceneFactory.loadConfiguration(config);
    const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
    // Should return an array with the MovingPlatform instance
    expect(platforms.length).toBe(1);
    const platform = platforms[0];
    expect(platform).toBeInstanceOf(MovingPlatform);
    expect(platform.sprites.length).toBe(3);
    expect(platform.sprites[0].x).toBe(400);
    expect(platform.sprites[1].x).toBe(464);
    expect(platform.sprites[2].x).toBe(528);
  });

  test('should move all sprites together and carry player on any sprite', () => {
    const config = {
      platforms: [
        {
          type: 'moving',
          x: 400,
          y: 300,
          width: 192,
          tilePrefix: 'terrain_grass_block',
          isFullBlock: true,
          movement: {
            type: 'linear',
            speed: 60,
            startX: 400,
            startY: 300,
            endX: 600,
            endY: 300,
            mode: 'bounce',
            autoStart: false
          }
        }
      ]
    };
    sceneFactory.loadConfiguration(config);
    const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
    const platform = platforms[0];
    // Simulate movement
    platform.masterSprite.x = 450;
    platform.masterSprite.y = 300;
    platform.updateSpritePositions();
    expect(platform.sprites[0].x).toBe(450);
    expect(platform.sprites[1].x).toBe(514);
    expect(platform.sprites[2].x).toBe(578);
    // Simulate player standing on third sprite
    const playerBody = {
      x: 578,
      y: 280,
      touching: { down: true, up: false, left: false, right: false }
    };
    platform.sprites[2].body.touching.up = true;
    expect(platform.isPlayerStandingOnAnySprite(playerBody)).toBe(true);
    // Simulate delta
    platform.deltaX = 10;
    platform.deltaY = 0;
    platform.carryPlayerIfStanding(playerBody);
    expect(playerBody.x).toBe(588);
    expect(playerBody.y).toBe(280);
  });

  test('should record and restore state for all sprites', () => {
    const config = {
      platforms: [
        {
          type: 'moving',
          x: 400,
          y: 300,
          width: 192,
          tilePrefix: 'terrain_grass_block',
          isFullBlock: true,
          movement: {
            type: 'linear',
            speed: 60,
            startX: 400,
            startY: 300,
            endX: 600,
            endY: 300,
            mode: 'bounce',
            autoStart: false
          }
        }
      ]
    };
    sceneFactory.loadConfiguration(config);
    const platforms = sceneFactory.createPlatformsFromConfig(mockPlatformsGroup);
    const platform = platforms[0];
    // Simulate movement
    platform.masterSprite.x = 500;
    platform.masterSprite.y = 300;
    platform.updateSpritePositions();
    // Record state
    const state = platform.getStateForRecording();
    // Change position
    platform.masterSprite.x = 400;
    platform.masterSprite.y = 300;
    platform.updateSpritePositions();
    // Restore state
    platform.setStateFromRecording(state);
    expect(platform.masterSprite.x).toBe(500);
    expect(platform.masterSprite.y).toBe(300);
    expect(platform.sprites[1].x).toBe(564);
    expect(platform.sprites[2].x).toBe(628);
  });
}); 
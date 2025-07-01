import { jest } from '@jest/globals';
import { SceneFactory } from '../../client/src/systems/SceneFactory.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

// ESM-compatible GSAP mock
jest.unstable_mockModule('gsap', () => ({
  default: {
    timeline: jest.fn(() => ({
      to: function() { return this; },
      from: function() { return this; },
      set: function() { return this; },
      play: function() {},
      pause: function() {},
      kill: function() {},
    }))
  }
}));

let gsap;
beforeAll(async () => {
  gsap = (await import('gsap')).default;
});

describe('SceneFactory Background Animation Support', () => {
  let mockScene;
  let sceneFactory;

  beforeEach(() => {
    mockScene = createPhaserSceneMock();
    sceneFactory = new SceneFactory(mockScene);
    jest.clearAllMocks();
  });

  test('should not create a timeline if animation config is missing', async () => {
    const config = {
      type: 'layer',
      x: 100, y: 100, width: 400, height: 300,
      spriteKey: 'background_solid_sky',
      depth: -2
      // No animation field
    };
    const bg = await sceneFactory.createBackgroundLayer(config);
    expect(bg).toBeDefined();
    expect(bg.animationTimeline).toBeUndefined();
    expect(gsap.timeline).not.toHaveBeenCalled();
  });

  test('should create a GSAP timeline if valid animation config is present', async () => {
    const config = {
      type: 'layer',
      x: 100, y: 100, width: 400, height: 300,
      spriteKey: 'background_solid_sky',
      depth: -2,
      animation: {
        animationType: 'fade',
        duration: 2,
        ease: 'power1.inOut',
        repeat: -1
      }
    };
    const bg = await sceneFactory.createBackgroundLayer(config);
    expect(bg).toBeDefined();
    expect(gsap.timeline).toHaveBeenCalled();
    expect(bg.animationTimeline).toBeDefined();
    expect(typeof bg.animationTimeline.play).toBe('function');
    expect(typeof bg.animationTimeline.pause).toBe('function');
  });

  test('should validate animation config and ignore invalid configs', async () => {
    const config = {
      type: 'layer',
      x: 100, y: 100, width: 400, height: 300,
      spriteKey: 'background_solid_sky',
      depth: -2,
      animation: {
        animationType: 'unknown', // Invalid type
        duration: -5, // Invalid duration
        ease: 123 // Invalid ease
      }
    };
    const bg = await sceneFactory.createBackgroundLayer(config);
    expect(bg).toBeDefined();
    expect(bg.animationTimeline).toBeUndefined();
    expect(gsap.timeline).not.toHaveBeenCalled();
  });

  test('should attach timeline to background and allow pause/resume', async () => {
    const config = {
      type: 'layer',
      x: 100, y: 100, width: 400, height: 300,
      spriteKey: 'background_solid_sky',
      depth: -2,
      animation: {
        animationType: 'fade',
        duration: 1,
        ease: 'linear',
        repeat: 0
      }
    };
    const bg = await sceneFactory.createBackgroundLayer(config);
    expect(bg).toBeDefined();
    expect(bg.animationTimeline).toBeDefined();
    // Simulate pause/resume
    expect(() => bg.animationTimeline.pause()).not.toThrow();
    expect(() => bg.animationTimeline.play()).not.toThrow();
  });

  test('should support multiple backgrounds with different animations', async () => {
    const configs = [
      {
        type: 'layer',
        x: 100, y: 100, width: 400, height: 300,
        spriteKey: 'background_solid_sky',
        depth: -2,
        animation: {
          animationType: 'fade',
          duration: 1,
          ease: 'linear',
          repeat: 0
        }
      },
      {
        type: 'layer',
        x: 200, y: 200, width: 400, height: 300,
        spriteKey: 'background_color_hills',
        depth: -1,
        animation: {
          animationType: 'move',
          duration: 2,
          ease: 'power2.inOut',
          repeat: -1
        }
      }
    ];
    const backgrounds = await Promise.all(configs.map(cfg => sceneFactory.createBackgroundLayer(cfg)));
    expect(backgrounds[0].animationTimeline).toBeDefined();
    expect(backgrounds[1].animationTimeline).toBeDefined();
    expect(gsap.timeline).toHaveBeenCalledTimes(2);
  });
}); 
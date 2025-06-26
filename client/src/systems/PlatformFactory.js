import Platform from '../entities/Platform.js';

export default class PlatformFactory {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Creates a Platform instance from a configuration object
   * @param {Object} config - Platform configuration
   * @returns {Platform}
   */
  createPlatform(config) {
    // Validate required parameters
    if (typeof config !== 'object' || config == null) {
      throw new Error('Platform config must be an object');
    }
    if (typeof config.x !== 'number') {
      throw new Error('Platform config missing required property: x');
    }
    if (typeof config.y !== 'number') {
      throw new Error('Platform config missing required property: y');
    }
    if (!config.frameKey) {
      throw new Error('Platform config missing required property: frameKey');
    }

    // Validate movementConfig for moving platforms
    if (config.platformType === 'moving') {
      const mc = config.movementConfig;
      if (!mc || !Array.isArray(mc.path) || mc.path.length < 2) {
        throw new Error('Moving platform requires a valid movementConfig.path with at least 2 points');
      }
      if (typeof mc.speed !== 'number' || mc.speed <= 0) {
        throw new Error('Moving platform requires a positive movementConfig.speed');
      }
      if (typeof mc.loop !== 'boolean' || typeof mc.pingPong !== 'boolean') {
        throw new Error('Moving platform requires boolean movementConfig.loop and movementConfig.pingPong');
      }
    }

    // Set defaults for optional parameters
    const fullConfig = {
      width: 64,
      height: 64,
      textureKey: 'tiles',
      isFullBlock: false,
      platformType: 'static',
      properties: {},
      ...config
    };

    return new Platform(this.scene, fullConfig, this.scene);
  }
} 
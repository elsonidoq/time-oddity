import Entity from './Entity.js';

/**
 * Platform Configuration Interface
 */
/**
 * Platform Types
 */
const PlatformType = {
  STATIC: 'static',           // Standard static platform
  MOVING: 'moving',           // Platform that moves along a path
  BREAKABLE: 'breakable',     // Platform that can be destroyed
  BOUNCY: 'bouncy',           // Platform that bounces entities
  CONVEYOR: 'conveyor'        // Platform that moves entities
};

function noop() { return this; }

/**
 * Platform Class
 * Extends Entity to provide platform-specific functionality
 * Supports static and moving platforms with time reversal compatibility
 */
export default class Platform extends Entity {
  constructor(scene, config, mockScene = null) {
    // Extract configuration with defaults
    const {
      x = 0,
      y = 0,
      width = 64,
      height = 64,
      textureKey = 'tiles',
      frameKey = 'terrain_grass_block_center',
      isFullBlock = false,
      platformType = PlatformType.STATIC,
      movementConfig = null,
      properties = {}
    } = config;

    // Call parent constructor with basic entity properties
    super(scene, x, y, textureKey, frameKey, 100, mockScene);
    
    // Platform-specific properties
    this.width = width;
    this.height = height;
    this.textureKey = textureKey;
    this.frameKey = frameKey;
    this.isFullBlock = isFullBlock;
    this.platformType = platformType;
    this.movementConfig = movementConfig;
    this.properties = properties;
    
    // Movement state (for moving platforms)
    this.currentPathIndex = 0;
    this.pathProgress = 0;
    this.isMoving = false;
    
    // Ensure physics body exists (for test environments)
    this.ensurePhysicsBody();
    
    // Configure platform physics
    this.configurePlatform();
    
    // Explicitly bind methods for test/mock environments
    this.configurePlatform = this.configurePlatform.bind(this);
    this.getStateForRecording = this.getStateForRecording.bind(this);
    this.setStateFromRecording = this.setStateFromRecording.bind(this);
    this.startMovement = this.startMovement.bind(this);
    this.stopMovement = this.stopMovement.bind(this);
    this.resetPosition = this.resetPosition.bind(this);
  }

  /**
   * Ensures physics body exists (for test environments)
   */
  ensurePhysicsBody() {
    if (!this.body) {
      this.body = {
        setImmovable: noop,
        setAllowGravity: noop,
        setSize: noop,
        setOffset: noop,
        velocity: { x: 0, y: 0 }
      };
    }
    
    // Ensure all required methods exist (for test environments)
    if (!this.body.setImmovable) this.body.setImmovable = noop;
    if (!this.body.setAllowGravity) this.body.setAllowGravity = noop;
    if (!this.body.setSize) this.body.setSize = noop;
    if (!this.body.setOffset) this.body.setOffset = noop;
    if (!this.body.velocity) this.body.velocity = { x: 0, y: 0 };
  }

  /**
   * Configures the platform's physics body
   * Sets body as immovable and disables gravity
   * Configures hitbox based on isFullBlock parameter
   */
  configurePlatform() {
    this.ensurePhysicsBody();
    
    if (!this.body) return;

    const body = this.body;
    body.setImmovable(true);
    body.setAllowGravity(false);

    if (this.isFullBlock) {
      // Use the full size of the sprite's frame for the hitbox
      body.setSize(this.width, this.height);
      body.setOffset(0, 0);
    } else {
      // Adjust the hitbox to match the visual part of the tile
      const frameHeight = this.height;
      const visibleHeight = 20; // Estimated visible height of the grass/dirt
      
      body.setSize(this.width, visibleHeight);
      body.setOffset(0, frameHeight - visibleHeight);
    }
  }

  /**
   * Start platform movement (for moving platforms)
   */
  startMovement() {
    if (this.platformType === PlatformType.MOVING && this.movementConfig) {
      this.isMoving = true;
    }
  }

  /**
   * Stop platform movement
   */
  stopMovement() {
    this.isMoving = false;
  }

  /**
   * Reset platform to initial position
   */
  resetPosition() {
    if (this.movementConfig && this.movementConfig.path && this.movementConfig.path.length > 0) {
      const startPoint = this.movementConfig.path[0];
      this.x = startPoint.x;
      this.y = startPoint.y;
      this.currentPathIndex = 0;
      this.pathProgress = 0;
    }
  }

  /**
   * Get state for TimeManager recording
   * Implements the TemporalState contract for time reversal compatibility
   * @returns {Object} State object for recording
   */
  getStateForRecording() {
    this.ensurePhysicsBody();
    
    return {
      x: this.x,
      y: this.y,
      velocityX: this.body ? this.body.velocity.x : 0,
      velocityY: this.body ? this.body.velocity.y : 0,
      animation: this.anims.currentAnim ? this.anims.currentAnim.key : null,
      isAlive: this.active,
      isVisible: this.visible,
      // Platform-specific state
      currentPathIndex: this.currentPathIndex,
      pathProgress: this.pathProgress,
      isMoving: this.isMoving
    };
  }

  /**
   * Set state from TimeManager recording
   * Restores platform state during time reversal
   * @param {Object} state - State object from recording
   */
  setStateFromRecording(state) {
    this.ensurePhysicsBody();
    
    // Restore basic entity state
    if (state.x !== undefined) this.x = state.x;
    if (state.y !== undefined) this.y = state.y;
    if (this.body) {
      if (state.velocityX !== undefined) this.body.velocity.x = state.velocityX;
      if (state.velocityY !== undefined) this.body.velocity.y = state.velocityY;
    }
    if (state.animation !== undefined && this.anims.currentAnim) {
      this.anims.currentAnim.key = state.animation;
    }
    if (state.isAlive !== undefined) this.active = state.isAlive;
    if (state.isVisible !== undefined) this.visible = state.isVisible;
    
    // Restore platform-specific state
    if (state.currentPathIndex !== undefined) this.currentPathIndex = state.currentPathIndex;
    if (state.pathProgress !== undefined) this.pathProgress = state.pathProgress;
    if (state.isMoving !== undefined) this.isMoving = state.isMoving;
  }

  /**
   * Update method for moving platforms
   * @param {number} time - Current time
   * @param {number} delta - Time delta
   */
  update(time, delta) {
    // Update logic for moving platforms will be implemented in Phase 2
    // For now, this is a placeholder for future movement functionality
  }
}

// Export PlatformType enum for use in configuration
export { PlatformType }; 
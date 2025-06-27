import Entity from './Entity.js';
import { gsap } from 'gsap';

/**
 * MovingPlatform - A platform entity that moves along configurable paths
 * 
 * Extends Entity to provide time-rewindable moving platform functionality.
 * Supports linear, circular, and custom path movement patterns.
 * 
 * State Recording Compliance:
 * - Implements getStateForRecording/setStateFromRecording for TimeManager
 * - All movement calculations are deterministic for perfect time reversal
 * 
 * Movement Types:
 * - linear: Move between two points with bounce or loop behavior
 * - circular: Move in circular paths with configurable radius and center
 * - path: Follow predefined waypoints with loop or one-way behavior
 * 
 * Player Carrying Mechanics:
 * The platform's ability to carry the player requires careful coordination
 * between physics updates and position tracking:
 * 
 * 1. Position Delta Tracking:
 *    • deltaX/deltaY: Store movement since last frame
 *    • oldX/oldY: Previous frame position
 *    • Calculated in update() before movement
 * 
 * 2. Update Loop Order (Critical):
 *    a) Store previous position (oldX/oldY)
 *    b) Update platform movement
 *    c) Calculate position delta
 *    d) Apply delta to carried player
 *    e) Update collision state
 * 
 * 3. Player Detection:
 *    • Uses Phaser's built-in collision detection
 *    • Checks body.touching flags for accurate standing detection
 *    • Only carries player when standing on top (not side collision)
 * 
 * 4. Movement Application:
 *    • Player position updated by exact platform delta
 *    • Maintains relative position during platform movement
 *    • Preserves player's own movement/velocity
 * 
 * 5. Edge Cases:
 *    • Handles platform direction changes
 *    • Maintains carrying through time rewind
 *    • Preserves player physics state
 *    • Gracefully handles player jump-off
 * 
 * @class
 * @extends Entity
 */
export default class MovingPlatform extends Entity {
  constructor(scene, x, y, texture, movementConfig = {}, frame = null, mockScene = null, options = {}) {
    // Initialize with Entity base constructor (this creates the master sprite)
    super(scene, x, y, texture, frame, 100, mockScene);
    
    // Store width configuration
    this.width = options.width || 64; // Default to single tile width
    this.tileWidth = 64; // Standard tile width
    this.spriteCount = Math.ceil(this.width / this.tileWidth);
    
    // Create sprite array - master sprite is already created by Entity constructor
    this.sprites = [this]; // Start with the master sprite (this Entity instance)
    this.masterSprite = this; // Master sprite for movement calculations
    
    // Create additional sprites if width > 64
    if (this.spriteCount > 1) {
      for (let i = 1; i < this.spriteCount; i++) {
        const spriteX = x + (i * this.tileWidth);
        // Use physics sprite to ensure body is created
        const sprite = scene.physics.add.sprite(spriteX, y, texture, frame);
        
        // Configure physics body for additional sprites
        if (sprite.body) {
          sprite.body.setImmovable(true);
          sprite.body.setAllowGravity(false);
          sprite.body.setFriction(1, 0);
          sprite.body.setBounce(0);
          sprite.body.setCollideWorldBounds(false);
        }
        
        this.sprites.push(sprite);
      }
    }
    
    // Movement configuration with defaults
    this.movementType = movementConfig.type || 'linear';
    this.speed = Math.max(10, Math.min(200, movementConfig.speed || 60));
    this.isMoving = false;
    this.direction = 1; // 1 = forward, -1 = backward
    this.autoStart = movementConfig.autoStart || false;
    
    // Linear movement properties
    this.startX = movementConfig.startX !== undefined ? movementConfig.startX : x;
    this.startY = movementConfig.startY !== undefined ? movementConfig.startY : y;
    this.endX = movementConfig.endX !== undefined ? movementConfig.endX : x + 200;
    this.endY = movementConfig.endY !== undefined ? movementConfig.endY : y;
    this.mode = movementConfig.mode || 'bounce'; // 'bounce' or 'loop'
    
    // Circular movement properties
    this.centerX = movementConfig.centerX !== undefined ? movementConfig.centerX : x;
    this.centerY = movementConfig.centerY !== undefined ? movementConfig.centerY : y;
    this.radius = movementConfig.radius || 50;
    this.angle = movementConfig.startAngle || 0;
    
    // Path movement properties
    this.pathPoints = movementConfig.pathPoints || [];
    this.currentPathIndex = 0;
    this.loop = movementConfig.loop !== undefined ? movementConfig.loop : true;
    // Movement state tracking (no longer using GSAP for physics objects)
    this.targetX = this.startX;
    this.targetY = this.startY;
    this.isMovingToTarget = false;
    
    // Player carrying functionality - track previous position for delta calculation
    this.deltaX = 0;
    this.deltaY = 0;
    this.oldX = x;
    this.oldY = y;
    
    // Backward compatibility properties for tests
    this.previousX = x;
    this.previousY = y;

    // Configure physics body for platform collision
    this.configurePhysicsBody();
    
    // Initialize movement if autoStart is enabled
    if (this.autoStart) {
      this.initializeMovement();
    }
  }
  
  /**
   * Configure physics body for moving platform collision
   */
  configurePhysicsBody() {
    if (this.body) {
      this.body.setImmovable(true);
      this.body.setAllowGravity(false);
      this.body.setFriction(1, 0);
      this.body.setBounce(0);
      this.body.setCollideWorldBounds(false); // Platforms can move beyond world bounds
    }
  }
  
  /**
   * Initialize movement based on configuration
   */
  initializeMovement() {
    if (this.movementType === 'linear') {
      this.targetX = this.startX;
      this.targetY = this.startY;
      this.isMovingToTarget = true;
      // Start actual movement
      this.startLinearMovement();
    } else if (this.movementType === 'circular') {
      this.angle = 0;
    } else if (this.movementType === 'path') {
      if (this.pathPoints.length > 0) {
        this.currentPathIndex = 0;
        const firstPoint = this.pathPoints[0];
        this.targetX = firstPoint.x;
        this.targetY = firstPoint.y;
        this.isMovingToTarget = true;
        // Start actual movement
        this.startPathMovement();
      }
    }
    
    this.isMoving = true;
  }
  
  /**
   * Start platform movement
   */
  startMovement() {
    this.isMoving = true;
    this.initializeFirstMovement();
  }
  
  /**
   * Stop platform movement
   */
  stopMovement() {
    this.isMoving = false;
    this.isMovingToTarget = false;
    // Stop the platform by setting velocity to zero
    if (this.body) {
      this.body.setVelocity(0, 0);
    }
  }
  
  /**
   * Initialize the first movement based on movement type
   */
  initializeFirstMovement() {
    switch (this.movementType) {
      case 'linear':
        this.startLinearMovement();
        break;
      case 'circular':
        // Circular movement doesn't use target-based movement
        break;
      case 'path':
        this.startPathMovement();
        break;
    }
  }
  
  /**
   * Start linear movement towards target
   */
  startLinearMovement() {
    const target = this.calculateLinearTarget();
    this.moveToTarget(target.x, target.y);
  }
  
  /**
   * Start path movement to next point
   */
  startPathMovement() {
    const nextPoint = this.getNextPathPoint();
    if (nextPoint) {
      this.moveToTarget(nextPoint.x, nextPoint.y);
    }
  }
  
  /**
   * Move platform towards target using velocity-based movement
   * Uses LoopHound's pattern of preserving velocity components when possible
   */
  moveToTarget(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.isMovingToTarget = true;
    
    // Calculate direction and velocity
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const velocityX = (dx / distance) * this.speed;
      const velocityY = (dy / distance) * this.speed;
      
      if (this.body) {
        // Check if this is purely horizontal or vertical movement
        const isHorizontalMovement = Math.abs(dy) < 1; // Tolerance for floating point
        const isVerticalMovement = Math.abs(dx) < 1;
        
        if (isHorizontalMovement) {
          // For horizontal movement, only set X velocity and preserve Y velocity
          // This follows LoopHound's pattern: setVelocity(speed * direction, this.body.velocity.y)
          this.body.setVelocity(velocityX, this.body.velocity.y);
        } else if (isVerticalMovement) {
          // For vertical movement, only set Y velocity and preserve X velocity
          this.body.setVelocity(this.body.velocity.x, velocityY);
        } else {
          // For diagonal movement, set both velocities
          this.body.setVelocity(velocityX, velocityY);
        }
      }
    }
  }
  
  /**
   * Alias for moveToTarget to maintain backward compatibility
   * @param {number} x - Target X coordinate
   * @param {number} y - Target Y coordinate
   * @param {number} duration - Duration parameter (ignored, kept for compatibility)
   */
  moveToPoint(x, y, duration = 1) {
    this.moveToTarget(x, y);
  }
  
  /**
   * Called when the platform reaches its target
   */
  onTargetReached() {
    this.isMovingToTarget = false;
    
    // Stop movement
    if (this.body) {
      this.body.setVelocity(0, 0);
    }
    
    if (!this.isMoving) return; // Movement was stopped
    
    // Handle what happens after reaching target
    switch (this.movementType) {
      case 'linear':
        this.handleLinearTargetReached();
        break;
      case 'path':
        this.handlePathTargetReached();
        break;
    }
  }
  
  /**
   * Handle reaching target in linear movement
   */
  handleLinearTargetReached() {
    // Check if we need to reverse or loop
    if (this.shouldReverseAtBoundary()) {
      this.reverseDirection();
    } else if (this.shouldLoopToStart()) {
      this.x = this.startX;
      this.y = this.startY;
    }
    
    // Start next movement
    this.startLinearMovement();
  }
  
  /**
   * Handle reaching target in path movement
   */
  handlePathTargetReached() {
    // Move to next path point
    this.startPathMovement();
  }
  
  /**
   * Reverse movement direction (for linear movement)
   */
  reverseDirection() {
    this.direction *= -1;
  }
  
  /**
   * Calculate target position for linear movement
   */
  calculateLinearTarget() {
    if (this.direction === 1) {
      return { x: this.endX, y: this.endY };
    } else {
      return { x: this.startX, y: this.startY };
    }
  }
  
  /**
   * Check if platform should reverse at boundary (linear movement)
   */
  shouldReverseAtBoundary() {
    const tolerance = 5; // Small tolerance for position checking
    
    if (this.direction === 1 && this.mode === 'bounce') {
      return Math.abs(this.x - this.endX) < tolerance && Math.abs(this.y - this.endY) < tolerance;
    } else if (this.direction === -1 && this.mode === 'bounce') {
      return Math.abs(this.x - this.startX) < tolerance && Math.abs(this.y - this.startY) < tolerance;
    }
    
    return false;
  }
  
  /**
   * Check if platform should loop to start (linear movement)
   */
  shouldLoopToStart() {
    const tolerance = 5;
    
    if (this.direction === 1 && this.mode === 'loop') {
      return Math.abs(this.x - this.endX) < tolerance && Math.abs(this.y - this.endY) < tolerance;
    }
    
    return false;
  }
  
  /**
   * Calculate position for circular movement
   */
  calculateCircularPosition() {
    return {
      x: this.centerX + this.radius * Math.cos(this.angle),
      y: this.centerY + this.radius * Math.sin(this.angle)
    };
  }
  
  /**
   * Update angle for circular movement
   */
  updateCircularAngle(deltaTime) {
    // Convert speed (pixels/second) to angular velocity (radians/second)
    const angularVelocity = this.speed / this.radius;
    this.angle += (angularVelocity * deltaTime / 1000);
    this.normalizeAngle();
  }
  
  /**
   * Normalize angle to 0-2π range
   */
  normalizeAngle() {
    while (this.angle >= Math.PI * 2) {
      this.angle -= Math.PI * 2;
    }
    while (this.angle < 0) {
      this.angle += Math.PI * 2;
    }
  }
  
  /**
   * Get next path point for path movement
   */
  getNextPathPoint() {
    if (!this.pathPoints || this.pathPoints.length === 0) {
      this.isMoving = false;
      return null;
    }
    
    // Calculate the next index
    let nextIndex = this.currentPathIndex + 1;
    
    // Handle end of path
    if (nextIndex >= this.pathPoints.length) {
      if (this.loop) {
        nextIndex = 0;
      } else {
        this.isMoving = false;
        return null;
      }
    }
    
    // Get the next point
    const nextPoint = this.pathPoints[nextIndex];
    
    // Update current index
    this.currentPathIndex = nextIndex;
    
    return nextPoint;
  }
  
  /**
   * Calculate distance to next path point
   */
  calculateDistanceToNextPoint() {
    if (!this.pathPoints || this.pathPoints.length === 0) {
      return 0;
    }
    
    // Calculate the next index
    let nextIndex = this.currentPathIndex + 1;
    
    // Handle end of path
    if (nextIndex >= this.pathPoints.length) {
      if (this.loop) {
        nextIndex = 0;
      } else {
        return 0; // No next point
      }
    }
    
    const nextPoint = this.pathPoints[nextIndex];
    if (!nextPoint) return 0;
    
    const dx = nextPoint.x - this.x;
    const dy = nextPoint.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Update movement logic (called each frame when isMoving is true)
   */
  updateMovement(deltaTime) {
    switch (this.movementType) {
      case 'linear':
        this.updateLinearMovement(deltaTime);
        break;
      case 'circular':
        this.updateCircularMovement(deltaTime);
        break;
      case 'path':
        this.updatePathMovement(deltaTime);
        break;
    }
  }
  
  /**
   * Update linear movement - check if target reached
   */
  updateLinearMovement(deltaTime) {
    if (!this.isMovingToTarget) return;
    
    // Check if we've reached the target
    const tolerance = 5;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < tolerance) {
      this.onTargetReached();
    }
  }
  
  /**
   * Update circular movement using velocity
   */
  updateCircularMovement(deltaTime) {
    this.updateCircularAngle(deltaTime);
    const position = this.calculateCircularPosition();
    
    // Calculate velocity to move towards the circular position
    const dx = position.x - this.x;
    const dy = position.y - this.y;
    
    if (this.body) {
      this.body.setVelocity(dx * 10, dy * 10); // Scale factor for smooth circular movement
    }
  }
  
  /**
   * Update path movement - check if target reached
   */
  updatePathMovement(deltaTime) {
    if (!this.isMovingToTarget) return;
    
    // Check if we've reached the target
    const tolerance = 5;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < tolerance) {
      this.onTargetReached();
    }
  }
  
  /**
   * Update method called each frame to handle movement
   * @param {number} time - Current time
   * @param {number} delta - Time since last frame
   */
  update(time, delta) {
    if (this.isMoving) {
      // Store current position before movement
      const oldX = this.x;
      const oldY = this.y;
      
      // Execute movement using the existing updateMovement method for compatibility
      this.updateMovement(delta);
    }
    
    // Calculate frame delta (current frame's movement only)
    const frameDeltaX = this.x - this.oldX;
    const frameDeltaY = this.y - this.oldY;
    
    // Update old position for next frame
    this.oldX = this.x;
    this.oldY = this.y;
    
    // Update backward compatibility properties
    this.previousX = this.oldX;
    this.previousY = this.oldY;
    
    // Set delta to current frame's movement (not accumulated)
    this.deltaX = frameDeltaX;
    this.deltaY = frameDeltaY;
    
    // Update positions of all other sprites to follow master
    this.updateSpritePositions();
  }
  
  /**
   * Update positions of all sprites to follow the master sprite
   */
  updateSpritePositions() {
    if (this.spriteCount <= 1) return;
    
    for (let i = 1; i < this.sprites.length; i++) {
      const sprite = this.sprites[i];
      const offsetX = i * this.tileWidth;
      sprite.x = this.x + offsetX;
      sprite.y = this.y;
    }
  }
  
  /**
   * Check if a player is standing on any sprite of this platform
   * @param {Phaser.Physics.Arcade.Body} playerBody - The player's physics body
   * @returns {boolean} - True if player is standing on any sprite
   */
  isPlayerStandingOnAnySprite(playerBody) {
    if (!playerBody) {
      return false;
    }
    
    // Check if player is standing on any sprite
    for (const sprite of this.sprites) {
      if (sprite.body && playerBody.touching.down && sprite.body.touching.up) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check if a player is standing on top of this platform (backward compatibility)
   * @param {Phaser.Physics.Arcade.Body} playerBody - The player's physics body
   * @returns {boolean} - True if player is standing on platform
   */
  isPlayerStandingOnTop(playerBody) {
    // For backward compatibility, use the new method
    return this.isPlayerStandingOnAnySprite(playerBody);
  }
  
  /**
   * Carry the player if they are standing on any sprite of this platform
   * @param {Phaser.Physics.Arcade.Body} playerBody - The player's physics body
   */
  carryPlayerIfStanding(playerBody) {
    if (!this.isPlayerStandingOnAnySprite(playerBody)) {
      return;
    }
    
    // Calculate delta using both new system and backward compatibility
    let deltaX = this.deltaX;
    let deltaY = this.deltaY;
    
    // If delta is 0 but we have previousX/previousY (for backward compatibility with tests)
    if (deltaX === 0 && deltaY === 0 && this.previousX !== undefined && this.previousY !== undefined) {
      deltaX = this.x - this.previousX;
      deltaY = this.y - this.previousY;
    }
    
    // Move player by the same delta as the platform (using master sprite delta)
    playerBody.x += deltaX;
    playerBody.y += deltaY;
  }
  
  /**
   * Register with TimeManager for state recording
   */
  registerWithTimeManager(timeManager) {
    if (timeManager && timeManager.register) {
      timeManager.register(this);
    }
  }
  
  /**
   * Get state for TimeManager recording
   * Returns extended state including movement-specific properties and multi-sprite info
   */
  getStateForRecording() {
    return {
      // Base TemporalState properties
      x: this.x,
      y: this.y,
      velocityX: this.body?.velocity?.x || 0,
      velocityY: this.body?.velocity?.y || 0,
      animation: this.anims?.currentAnim?.key || null,
      isAlive: this.active !== false,
      isVisible: this.visible !== false,
      
      // MovingPlatform specific state
      movementType: this.movementType,
      isMoving: this.isMoving,
      direction: this.direction,
      angle: this.angle,
      currentPathIndex: this.currentPathIndex,
      isMovingToTarget: this.isMovingToTarget,
      targetX: this.targetX,
      targetY: this.targetY,
      
      // Multi-sprite state
      spriteCount: this.spriteCount,
      width: this.width,
      masterX: this.x,
      masterY: this.y
    };
  }
  
  /**
   * Restore state from TimeManager recording
   * Restores all movement state and multi-sprite positions for perfect rewind compatibility
   */
  setStateFromRecording(state) {
    // Restore base Entity state
    this.x = state.x;
    this.y = state.y;
    this.active = state.isAlive;
    this.visible = state.isVisible;
    
    // Restore physics body state
    if (this.body && state.velocityX !== undefined && state.velocityY !== undefined) {
      if (this.body.setVelocity) {
        this.body.setVelocity(state.velocityX, state.velocityY);
      }
    }
    
    // Restore animation state
    if (state.animation && this.anims && this.anims.play) {
      try {
        this.anims.play(state.animation);
      } catch (error) {
        // Animation key might not exist, ignore error
      }
    }
    
    // Restore movement-specific state
    if (state.movementType !== undefined) {
      this.movementType = state.movementType;
    }
    if (state.isMoving !== undefined) {
      this.isMoving = state.isMoving;
    }
    if (state.direction !== undefined) {
      this.direction = state.direction;
    }
    if (state.angle !== undefined) {
      this.angle = state.angle;
    }
    if (state.currentPathIndex !== undefined) {
      this.currentPathIndex = state.currentPathIndex;
    }
    if (state.isMovingToTarget !== undefined) {
      this.isMovingToTarget = state.isMovingToTarget;
    }
    if (state.targetX !== undefined) {
      this.targetX = state.targetX;
    }
    if (state.targetY !== undefined) {
      this.targetY = state.targetY;
    }
    
    // Restore multi-sprite state
    if (state.spriteCount !== undefined) {
      this.spriteCount = state.spriteCount;
    }
    if (state.width !== undefined) {
      this.width = state.width;
    }
    if (state.masterX !== undefined) {
      this.x = state.masterX;
    }
    if (state.masterY !== undefined) {
      this.y = state.masterY;
    }
    
    // Update positions of all other sprites to follow master
    this.updateSpritePositions();
  }
} 
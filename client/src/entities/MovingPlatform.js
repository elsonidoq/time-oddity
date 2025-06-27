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
 */
export default class MovingPlatform extends Entity {
  constructor(scene, x, y, texture, movementConfig = {}, frame = null, mockScene = null) {
    // Initialize with Entity base constructor
    super(scene, x, y, texture, frame, 100, mockScene);
    
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

    console.log(`[MovingPlatform] Created at (${x}, ${y}) with autoStart=${this.autoStart}, isMoving=${this.isMoving}`);
    console.log(`[MovingPlatform] Movement config:`, movementConfig);
    console.log(`[MovingPlatform] Movement type: ${this.movementType}, speed: ${this.speed}`);
    
    // Configure physics body for platform collision
    this.configurePhysicsBody();
    
    // Initialize movement if autoStart is enabled
    if (this.autoStart) {
      console.log(`[MovingPlatform] autoStart is true, calling initializeMovement`);
      this.initializeMovement();
    } else {
      console.log(`[MovingPlatform] autoStart is false, not initializing movement`);
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
    console.log(`[MovingPlatform] Initializing movement for ${this.movementType} movement`);
    
    if (this.movementType === 'linear') {
      this.targetX = this.startX;
      this.targetY = this.startY;
      this.isMovingToTarget = true;
      console.log(`[MovingPlatform] Linear movement initialized - target: (${this.targetX}, ${this.targetY})`);
    } else if (this.movementType === 'circular') {
      this.angle = 0;
      console.log(`[MovingPlatform] Circular movement initialized - center: (${this.centerX}, ${this.centerY}), radius: ${this.radius}`);
    } else if (this.movementType === 'path') {
      if (this.pathPoints.length > 0) {
        this.currentPathIndex = 0;
        const firstPoint = this.pathPoints[0];
        this.targetX = firstPoint.x;
        this.targetY = firstPoint.y;
        this.isMovingToTarget = true;
        console.log(`[MovingPlatform] Path movement initialized - first target: (${this.targetX}, ${this.targetY})`);
      }
    }
    
    this.isMoving = true;
    console.log(`[MovingPlatform] Movement initialized - isMoving: ${this.isMoving}`);
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
    if (!this.body) return;
    
    this.targetX = targetX;
    this.targetY = targetY;
    this.isMovingToTarget = true;
    
    // Calculate direction vector to target
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      // Close enough to target, trigger target reached
      this.onTargetReached();
      return;
    }
    
    // Normalize direction and apply speed
    const velocityX = (dx / distance) * this.speed;
    const velocityY = (dy / distance) * this.speed;
    
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
      console.log(`[MovingPlatform] Updating movement at (${this.x}, ${this.y})`);
      
      // Store current position before movement
      const oldX = this.x;
      const oldY = this.y;
      
      // Execute movement using the existing updateMovement method for compatibility
      this.updateMovement(delta);
      
      console.log(`[MovingPlatform] After movement: (${this.x}, ${this.y})`);
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
    
    console.log(`[MovingPlatform] Frame delta: (${frameDeltaX}, ${frameDeltaY})`);
  }
  
  /**
   * Check if a player is standing on top of this platform
   * @param {Phaser.Physics.Arcade.Body} playerBody - The player's physics body
   * @returns {boolean} - True if player is standing on platform
   */
  isPlayerStandingOnTop(playerBody) {
    if (!playerBody || !this.body) {
      console.log('[MovingPlatform] isPlayerStandingOnTop: Missing playerBody or this.body');
      return false;
    }
    
    // Player must be touching down and platform must be touching up
    const isStanding = playerBody.touching.down && this.body.touching.up;
    console.log(`[MovingPlatform] isPlayerStandingOnTop: player.touching.down=${playerBody.touching.down}, platform.touching.up=${this.body.touching.up}, result=${isStanding}`);
    return isStanding;
  }
  
  /**
   * Carry the player if they are standing on top of this platform
   * @param {Phaser.Physics.Arcade.Body} playerBody - The player's physics body
   */
  carryPlayerIfStanding(playerBody) {
    console.log(`[MovingPlatform] carryPlayerIfStanding called for player at (${playerBody.x}, ${playerBody.y})`);
    
    if (!this.isPlayerStandingOnTop(playerBody)) {
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
    
    console.log(`[MovingPlatform] Platform moved by delta: (${deltaX}, ${deltaY})`);
    console.log(`[MovingPlatform] Moving player from (${playerBody.x}, ${playerBody.y}) to (${playerBody.x + deltaX}, ${playerBody.y + deltaY})`);
    
    // Move player by the same delta as the platform
    playerBody.x += deltaX;
    playerBody.y += deltaY;
    
    console.log(`[MovingPlatform] Player carried successfully to (${playerBody.x}, ${playerBody.y})`);
    
    // Reset delta after carrying to prevent accumulation
    this.deltaX = 0;
    this.deltaY = 0;
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
   * Returns extended state including movement-specific properties
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
      targetY: this.targetY
    };
  }
  
  /**
   * Restore state from TimeManager recording
   * Restores all movement state for perfect rewind compatibility
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
  }
} 
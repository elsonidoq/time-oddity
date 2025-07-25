import TemporalState from './TemporalState.js';
import { gsap } from 'gsap';

/**
 * TimeManager – centralised rewind/record system.
 *
 * Invariants are recorded in `agent_docs/invariants.md` §7.
 *  • Snapshot cadence is 50 ms (`recordInterval`).
 *  • Managed objects must provide either {get,set}StateForRecording or expose the minimal state shape.
 *  • During rewind, gravity is disabled on all managed bodies and a camera tint + overlay (depth=1000) is applied.
 * 
 * @class
 * @description The TimeManager is responsible for recording and rewinding game state.
 * It maintains a buffer of temporal states for all registered objects and handles
 * their state interpolation during rewind.
 * 
 * State Recording Contract:
 * 1. Objects must either:
 *    a) Implement getStateForRecording() and setStateFromRecording(state), or
 *    b) Expose the minimal TemporalState shape: {x, y, velocityX, velocityY, animation, isAlive, isVisible}
 * 
 * 2. Custom State Recording Methods:
 *    - getStateForRecording(): Must return a TemporalState object or compatible shape
 *    - setStateFromRecording(state): Must handle all custom state properties
 * 
 * 3. State Buffer Management:
 *    - States are recorded every 50ms (recordInterval)
 *    - Buffer is truncated to current position when exiting rewind
 *    - Interpolation is used for smooth playback between recorded states
 * 
 * 4. Gravity Management:
 *    - Original gravity states are preserved per object
 *    - Gravity is disabled during rewind
 *    - Original states are restored after rewind
 */
export default class TimeManager {
  /**
   * @param {Phaser.Scene} scene The scene to which this manager belongs.
   * @param {Phaser.Scene} mockScene Optional mock scene for testing.
   */
  constructor(scene, mockScene = null) {
    this.scene = mockScene || scene;
    this.stateBuffer = [];
    this.isRewinding = false;
    this.managedObjects = new Set();
    this.lastRecordTime = 0;
    this.recordInterval = 50; // Record state every 50ms for smoother playback
    this.playbackTimestamp = 0;

    // Track original gravity states to restore after rewind
    this.originalGravityStates = new Map();

    // Visual effect state
    this._rewindOverlay = null;
    this._rewindActive = false;

    // Pause state for recording
    this.isRecordingPaused = false;
  }

  /**
   * Registers a game object to be tracked by the TimeManager.
   * @param {Phaser.GameObjects.GameObject} object The object to manage.
   */
  register(object) {
    if (!object) return;
    
    this.managedObjects.add(object);
    
    // Store the original gravity state when registering
    if (object.body && typeof object.body.setAllowGravity === 'function') {
      // Get current gravity state (default to true if not explicitly set)
      const currentGravityState = object.body.allowGravity !== false;
      this.originalGravityStates.set(object, currentGravityState);
      console.log(`[TimeManager] Registered object with gravity state: ${currentGravityState}`);
    }
  }

  /**
   * Toggles the rewind state.
   * @param {boolean} isRewinding Whether to enable or disable rewind.
   */
  toggleRewind(isRewinding) {
    if (this.isRewinding === isRewinding) return;
    
    this.isRewinding = isRewinding;
    
    // Always use the latest audioManager from the scene
    const audioManager = this.scene && this.scene.audioManager;

    if (isRewinding) {
      // --- Play rewind start sound ---
      if (audioManager && typeof audioManager.playRewindStart === 'function') {
        try { audioManager.playRewindStart(); } catch (e) {}
      }
      this.playbackTimestamp = this.stateBuffer.length > 0 ? this.stateBuffer[this.stateBuffer.length - 1].timestamp : 0;
      for (const object of this.managedObjects) {
        if (object.body && typeof object.body.setAllowGravity === 'function') {
          object.body.setAllowGravity(false);
        }
      }
      this._activateRewindVisuals();
    } else {
      // --- Play rewind end sound ---
      if (audioManager && typeof audioManager.playRewindEnd === 'function') {
        try { audioManager.playRewindEnd(); } catch (e) {}
      }
      // Truncate buffer to current position
      if (this.stateBuffer.length > 0) {
        const currentIndex = this.stateBuffer.findIndex(record => record.timestamp >= this.playbackTimestamp);
        if (currentIndex > 0) {
          this.stateBuffer.splice(0, currentIndex);
        }
      }
      
      // Restore original gravity states instead of blindly enabling gravity
      for (const object of this.managedObjects) {
        if (object.body && typeof object.body.setAllowGravity === 'function') {
          const originalGravityState = this.originalGravityStates.get(object);
          if (originalGravityState !== undefined) {
            object.body.setAllowGravity(originalGravityState);
            console.log(`[TimeManager] Restored gravity state for object: ${originalGravityState}`);
          } else {
            // Fallback: enable gravity for objects without stored state
            object.body.setAllowGravity(true);
            console.log(`[TimeManager] No stored gravity state, defaulting to true for object`);
          }
        }
      }
      this._deactivateRewindVisuals();
    }
  }

  /**
   * The update loop for the TimeManager, called by the scene.
   * @param {number} time - The current time.
   * @param {number} delta - The delta time in ms since the last frame.
   */
  update(time, delta) {
    if (this.isRewinding) {
      this.handleRewind(delta);
    } else {
      this.handleRecord(time);
    }
  }
  
  handleRewind(delta) {
    if (this.stateBuffer.length < 2) {
      this.toggleRewind(false);
      return;
    }

    this.playbackTimestamp -= delta;

    const futureIndex = this.stateBuffer.findIndex(record => record.timestamp >= this.playbackTimestamp);

    if (futureIndex <= 0) {
      this.applyFrame(this.stateBuffer[0]);
      this.stateBuffer.length = 1;
      this.toggleRewind(false);
      return;
    }

    const frameA = this.stateBuffer[futureIndex];
    const frameB = this.stateBuffer[futureIndex - 1];
    
    const t = (this.playbackTimestamp - frameB.timestamp) / (frameA.timestamp - frameB.timestamp);
    
    this.interpolateFrame(frameA, frameB, t);
  }

  /**
   * Pauses state recording (for game pause functionality)
   */
  pauseRecording() {
    this.isRecordingPaused = true;
  }

  /**
   * Resumes state recording (for game resume functionality)
   */
  resumeRecording() {
    this.isRecordingPaused = false;
  }

  handleRecord(timestamp) {
    if (this.isRecordingPaused) return;
    
    if (timestamp - this.lastRecordTime < this.recordInterval) return;
    
    this.lastRecordTime = timestamp;
    
    const states = [];
    for (const object of this.managedObjects) {
      try {
        let state;
        if (typeof object.getStateForRecording === 'function') {
          state = object.getStateForRecording();
          // Patch isAlive for Player: if health is 0, isAlive should be false
          if (object.constructor && object.constructor.name === 'Player') {
            state.isAlive = (state.health > 0);
          }
        } else {
          // Default state recording
          state = new TemporalState({
            x: object.x || 0,
            y: object.y || 0,
            velocityX: object.body?.velocity?.x || 0,
            velocityY: object.body?.velocity?.y || 0,
            animation: object.anims?.currentAnim?.key || null,
            isAlive: object.active !== false,
            isVisible: object.visible !== false
          });
        }
        states.push({ target: object, state });
      } catch (error) {
        console.warn('[TimeManager] Error recording state for object:', error);
      }
    }
    // --- Record coinsCollected registry value ---
    let coinsCollected = 0;
    if (this.scene && this.scene.registry && typeof this.scene.registry.get === 'function') {
      coinsCollected = this.scene.registry.get('coinsCollected') || 0;
    }
    if (states.length > 0) {
      this.stateBuffer.push({ timestamp, states, coinsCollected });
    }
  }

  applyFrame(frame) {
    for(const record of frame.states) {
        this.applyState(record.target, record.state);
    }
    // --- Restore coinsCollected registry value ---
    if (this.scene && this.scene.registry && typeof this.scene.registry.set === 'function' && typeof frame.coinsCollected !== 'undefined') {
      this.scene.registry.set('coinsCollected', frame.coinsCollected);
    }
  }

  interpolateFrame(frameA, frameB, t) {
    for (const recordA of frameA.states) {
        const recordB = frameB.states.find(r => r.target === recordA.target);
        if(recordB) {
            const interpolatedState = this.interpolateState(recordA.state, recordB.state, t);
            this.applyState(recordA.target, interpolatedState);
        }
    }
    
    // --- Restore coinsCollected registry value during interpolation ---
    // Use the frameA (future frame) value as the target for interpolation
    if (this.scene && this.scene.registry && typeof this.scene.registry.set === 'function' && 
        typeof frameA.coinsCollected !== 'undefined') {
      // Use the actual value from frameA (future frame) during interpolation
      this.scene.registry.set('coinsCollected', frameA.coinsCollected);
    }
  }
  
  lerp(start, end, t) {
      return start * (1 - t) + end * t;
  }
  
  interpolateState(stateA, stateB, t) {
      const x = this.lerp(stateB.x, stateA.x, t);
      const y = this.lerp(stateB.y, stateA.y, t);
      const velocityX = this.lerp(stateB.velocityX, stateA.velocityX, t);
      const velocityY = this.lerp(stateB.velocityY, stateA.velocityY, t);
      
      // Interpolate health if present in both states
      let health = stateA.health;
      if (stateA.health !== undefined && stateB.health !== undefined) {
        health = this.lerp(stateB.health, stateA.health, t);
      }
      
      // Interpolate invulnerability timer if present in both states
      let invulnerabilityTimer = stateA.invulnerabilityTimer;
      if (stateA.invulnerabilityTimer !== undefined && stateB.invulnerabilityTimer !== undefined) {
        invulnerabilityTimer = this.lerp(stateB.invulnerabilityTimer, stateA.invulnerabilityTimer, t);
      }
      
      return { 
        ...stateA, 
        x, 
        y, 
        velocityX, 
        velocityY,
        health,
        invulnerabilityTimer
      };
  }

  applyState(target, state) {
    const inManaged = this.managedObjects.has(target);
    // console.log('[TimeManager] applyState: Restoring target:', target, 'State:', state, 'In managedObjects:', inManaged);
    if (typeof target.setStateFromRecording === 'function') {
      target.setStateFromRecording(state);
      return;
    }
    target.x = state.x;
    target.y = state.y;
    if (target.body) {
      target.body.setVelocity(state.velocityX, state.velocityY);
    }
    if (target.anims && state.animation) {
      target.anims.play(state.animation, true);
    }

    // --- Sync life/visibility flags ---
    // Built-in Phaser active flag
    if (typeof target.setActive === 'function') {
      target.setActive(state.isAlive);
    } else {
      target.active = state.isAlive;
    }

    // Project-specific custom flag used by ChronoPulse and others
    if ('isActive' in target) {
      target.isActive = state.isAlive;
    }

    target.setVisible(state.isVisible);
  }

  // --- Visual Effects for Rewind ---
  _activateRewindVisuals() {
    if (this._rewindActive) return;
    this._rewindActive = true;
    // Camera tint
    if (this.scene.cameras && this.scene.cameras.main && this.scene.cameras.main.setTint) {
      this.scene.cameras.main.setTint(0xff0000);
    }
    // Overlay
    if (!this._rewindOverlay && this.scene.add && this.scene.add.graphics) {
      const overlay = this.scene.add.graphics();
      if (overlay.fillStyle) {
        overlay.fillStyle(0xff0000, 1);
        // Handle missing game config gracefully
        const width = this.scene.sys?.game?.config?.width ?? 1280;
        const height = this.scene.sys?.game?.config?.height ?? 720;
        overlay.fillRect(0, 0, width, height);
      }
      if (overlay.setAlpha) overlay.setAlpha(0);
      if (overlay.setScrollFactor) overlay.setScrollFactor(0);
      if (overlay.setDepth) overlay.setDepth(1000);
      if (overlay.setVisible) overlay.setVisible(true);
      this._rewindOverlay = overlay;
      if (typeof gsap !== 'undefined' && gsap.to) {
        gsap.to(overlay, { alpha: 0.3, duration: 0.2, overwrite: true });
      }
    }
  }

  _deactivateRewindVisuals() {
    if (!this._rewindActive) return;
    this._rewindActive = false;
    // Remove camera tint
    if (this.scene.cameras && this.scene.cameras.main && this.scene.cameras.main.clearTint) {
      this.scene.cameras.main.clearTint();
    }
    // Fade out and destroy overlay
    if (this._rewindOverlay) {
      if (typeof gsap !== 'undefined') {
        gsap.killTweensOf(this._rewindOverlay);
        gsap.to(this._rewindOverlay, {
          alpha: 0,
          duration: 0.3,
          onComplete: () => {
            if (this._rewindOverlay) {
              this._rewindOverlay.destroy();
              this._rewindOverlay = null;
            }
          }
        });
      } else {
        // Fallback when GSAP is not available
        if (this._rewindOverlay.destroy) {
          this._rewindOverlay.destroy();
        }
        this._rewindOverlay = null;
      }
    }
  }

  destroy() {
    this._deactivateRewindVisuals();
    if (this._rewindOverlay) {
      this._rewindOverlay.destroy();
      this._rewindOverlay = null;
    }
    if (this.scene.cameras && this.scene.cameras.main && this.scene.cameras.main.clearTint) {
      this.scene.cameras.main.clearTint();
    }
  }
} 
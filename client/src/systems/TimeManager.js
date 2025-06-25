import TemporalState from './TemporalState.js';
import { gsap } from 'gsap';

/**
 * Core time manipulation system.
 * See Section 7.1 "The Time Control System: A Deep Dive" in the comprehensive documentation.
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

    // Visual effect state
    this._rewindOverlay = null;
    this._rewindActive = false;
  }

  /**
   * Registers a game object to be tracked by the TimeManager.
   * @param {Phaser.GameObjects.GameObject} object The object to manage.
   */
  register(object) {
    this.managedObjects.add(object);
  }

  /**
   * Toggles the rewind state.
   * @param {boolean} isRewinding Whether to enable or disable rewind.
   */
  toggleRewind(isRewinding) {
    console.log('[TimeManager] toggleRewind: managedObjects before:', Array.from(this.managedObjects));
    if (isRewinding === this.isRewinding) return;
    this.isRewinding = isRewinding;

    if (this.isRewinding) {
      if (this.stateBuffer.length > 0) {
        this.playbackTimestamp = this.stateBuffer[this.stateBuffer.length - 1].timestamp;
      }
      for (const object of this.managedObjects) {
        if (object.body) object.body.setAllowGravity(false);
      }
      this._activateRewindVisuals();
    } else {
      const resumeIndex = this.stateBuffer.findIndex(record => record.timestamp >= this.playbackTimestamp);
      if (resumeIndex > -1) {
        this.stateBuffer.length = resumeIndex;
      }
      for (const object of this.managedObjects) {
        if (object.body) object.body.setAllowGravity(true);
      }
      this._deactivateRewindVisuals();
    }
    console.log('[TimeManager] toggleRewind: managedObjects after:', Array.from(this.managedObjects));
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

  handleRecord(time) {
    if (time - this.lastRecordTime > this.recordInterval) {
      this.lastRecordTime = time;
      const frameStates = [];
      console.log('[TimeManager] handleRecord: managedObjects size:', this.managedObjects.size);
      for (const object of this.managedObjects) {
        let state;
        if (typeof object.getStateForRecording === 'function') {
          state = object.getStateForRecording();
        } else {
          state = new TemporalState({
            x: object.x,
            y: object.y,
            velocityX: object.body.velocity.x,
            velocityY: object.body.velocity.y,
            animation: object.anims.currentAnim ? object.anims.currentAnim.key : null,
            isAlive: object.active,
            isVisible: object.visible,
          });
        }
        console.log('[TimeManager] Recording state for object:', object, state);
        frameStates.push({ target: object, state: state });
      }
      this.stateBuffer.push({ timestamp: time, states: frameStates });
    }
  }

  applyFrame(frame) {
    for(const record of frame.states) {
        this.applyState(record.target, record.state);
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
  }
  
  lerp(start, end, t) {
      return start * (1 - t) + end * t;
  }
  
  interpolateState(stateA, stateB, t) {
      const x = this.lerp(stateB.x, stateA.x, t);
      const y = this.lerp(stateB.y, stateA.y, t);
      const velocityX = this.lerp(stateB.velocityX, stateA.velocityX, t);
      const velocityY = this.lerp(stateB.velocityY, stateA.velocityY, t);
      
      return { ...stateA, x, y, velocityX, velocityY };
  }

  applyState(target, state) {
    const inManaged = this.managedObjects.has(target);
    console.log('[TimeManager] applyState: Restoring target:', target, 'State:', state, 'In managedObjects:', inManaged);
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
      this.scene.cameras.main.setTint(0x4444ff);
    }
    // Overlay
    if (!this._rewindOverlay && this.scene.add && this.scene.add.graphics) {
      const overlay = this.scene.add.graphics();
      overlay.fillStyle(0x4444ff, 1);
      overlay.fillRect(0, 0, this.scene.sys.game.config.width, this.scene.sys.game.config.height);
      overlay.setAlpha(0);
      overlay.setScrollFactor && overlay.setScrollFactor(0);
      overlay.setDepth && overlay.setDepth(1000);
      overlay.setVisible(true);
      this._rewindOverlay = overlay;
      gsap.to(overlay, { alpha: 0.3, duration: 0.2, overwrite: true });
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
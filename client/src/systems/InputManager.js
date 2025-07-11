import Phaser from 'phaser';

// Patch: Use globalThis.Phaser if available for testability
const PhaserLib = (typeof globalThis !== 'undefined' && globalThis.Phaser) ? globalThis.Phaser : Phaser;

/**
 * Centralized input handling system.
 * See Section 1.5 "Input Handling" in the comprehensive documentation.
 */
export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    
    // Initialize keyboard input keys
    this.left = scene.input.keyboard.addKey('LEFT');
    this.right = scene.input.keyboard.addKey('RIGHT');
    this.up = scene.input.keyboard.addKey('UP');
    this.down = scene.input.keyboard.addKey('DOWN');
    
    // Alternative keys (WASD)
    this.a = scene.input.keyboard.addKey('A');
    this.d = scene.input.keyboard.addKey('D');
    this.w = scene.input.keyboard.addKey('W');
    this.s = scene.input.keyboard.addKey('S');
    
    // Space key for jumping
    this.space = scene.input.keyboard.addKey('SPACE');
    
    // R key for rewinding
    this.r = scene.input.keyboard.addKey('R');

    // Shift key for dash
    this.shift = scene.input.keyboard.addKey(PhaserLib.Input.Keyboard.KeyCodes.SHIFT);
    
    // E key for Chrono Pulse ability
    this.e = scene.input.keyboard.addKey('E');

    // P key for pause
    this.p = scene.input.keyboard.addKey('P');

    // M key for mute toggle
    this.m = scene.input.keyboard.addKey('M');

    // T key for map toggle
    this.t = scene.input.keyboard.addKey('T');

    // Flag to disable inputs (used during game over)
    this.inputsDisabled = false;
  }

  /**
   * Update input states - called every frame
   */
  update() {
    // This method can be used for input processing if needed
    // Currently, the input states are automatically updated by Phaser
  }

  /**
   * Check if left movement is active (LEFT arrow or A key)
   */
  get isLeftPressed() {
    if (this.inputsDisabled) return false;
    return this.left.isDown || this.a.isDown;
  }

  /**
   * Check if right movement is active (RIGHT arrow or D key)
   */
  get isRightPressed() {
    if (this.inputsDisabled) return false;
    return this.right.isDown || this.d.isDown;
  }

  /**
   * Check if up/jump is active (UP arrow, W key, or SPACE)
   */
  get isUpPressed() {
    if (this.inputsDisabled) return false;
    return this.up.isDown || this.w.isDown || this.space.isDown;
  }

  /**
   * Check if down is active (DOWN arrow or S key)
   */
  get isDownPressed() {
    if (this.inputsDisabled) return false;
    return this.down.isDown || this.s.isDown;
  }

  /**
   * Check if the jump key was just released.
   */
  get isJumpJustReleased() {
    if (this.inputsDisabled) return false;
    return PhaserLib.Input.Keyboard.JustUp(this.up) || 
           PhaserLib.Input.Keyboard.JustUp(this.w) || 
           PhaserLib.Input.Keyboard.JustUp(this.space);
  }

  /**
   * Check if the jump key was just pressed (SPACE, UP, or W)
   */
  get isJumpJustPressed() {
    if (this.inputsDisabled) return false;
    return PhaserLib.Input.Keyboard.JustDown(this.up) || 
           PhaserLib.Input.Keyboard.JustDown(this.w) || 
           PhaserLib.Input.Keyboard.JustDown(this.space);
  }

  /**
   * Check if the rewind key is pressed.
   */
  get isRewindPressed() {
    // Time reversal is always enabled, even when other inputs are disabled
    return this.r.isDown;
  }

  /**
   * Check if the dash key is pressed (SHIFT)
   */
  get isDashPressed() {
    if (this.inputsDisabled) return false;
    const pressed = this.shift.isDown;
    if (pressed) console.log('[InputManager] Dash key pressed');
    return pressed;
  }

  /**
   * Check if the dash key was just pressed (SHIFT)
   */
  get isDashJustPressed() {
    if (this.inputsDisabled) return false;
    return PhaserLib.Input.Keyboard.JustDown(this.shift);
  }

  /**
   * Check if the Chrono Pulse key is pressed (E)
   */
  get isChronoPulsePressed() {
    if (this.inputsDisabled) return false;
    const pressed = this.e.isDown;
    if (pressed) console.log('[InputManager] Chrono Pulse key pressed');
    return pressed;
  }

  /**
   * Check if the Chrono Pulse key was just pressed (E)
   */
  get isChronoPulseJustPressed() {
    if (this.inputsDisabled) return false;
    const justPressed = PhaserLib.Input.Keyboard.JustDown(this.e);
    if (justPressed) {
      console.log('[InputManager] Chrono Pulse key just pressed (E)');
    }
    return justPressed;
  }

  /**
   * Check if the pause key is pressed (P)
   */
  get isPausePressed() {
    return this.p.isDown;
  }

  /**
   * Check if the pause key was just pressed (P)
   */
  get isPauseJustPressed() {
    return PhaserLib.Input.Keyboard.JustDown(this.p);
  }

  /**
   * Check if the mute key is pressed (M)
   */
  get isMutePressed() {
    return this.m.isDown;
  }

  /**
   * Check if the map toggle key is pressed (T)
   */
  get isMapTogglePressed() {
    return this.t.isDown;
  }

  /**
   * Check if the map toggle key was just pressed (T)
   */
  get isMapToggleJustPressed() {
    return PhaserLib.Input.Keyboard.JustDown(this.t);
  }
} 
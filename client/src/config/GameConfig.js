/**
 * GameConfig - Centralized game configuration
 * 
 * This module provides centralized configuration for the Time Oddity game,
 * including the single source of truth for level scaling that replaces
 * camera zoom with sprite scaling.
 * 
 * Key invariants:
 * - LEVEL_SCALE is the single source of truth for all entity scaling
 * - Modifying this value changes the scale of all game entities
 * - Scale value must be compatible with pixel art rendering
 * - Scale value must maintain visual consistency with previous camera zoom
 */

export const GITHUB_PAGES = false;
/**
 * Single source of truth for level scaling
 * 
 * This constant replaces camera zoom (0.25) with sprite scaling.
 * All game entities should use this value for consistent scaling.
 * 
 * @type {number}
 */
export const LEVEL_SCALE = 0.5;

/**
 * Centralized game configuration object
 * 
 * Provides a structured way to access game configuration values,
 * including the level scale that controls all entity sizing.
 * 
 * @type {Object}
 */
export const GameConfig = Object.freeze({
  /**
   * Level scale value for entity scaling
   * 
   * This value determines the scale of all game entities,
   * replacing the previous camera zoom system.
   * 
   * @type {number}
   */
  levelScale: LEVEL_SCALE,
  
  /**
   * Culling system configuration for performance optimization
   * 
   * Controls viewport-based culling for large level rendering.
   * 
   * @type {Object}
   */
  culling: {
    /**
     * Distance beyond viewport to keep sprites visible (in pixels)
     * 
     * @type {number}
     */
    cullDistance: 200,
    
    /**
     * Tilemap culling configuration for optimized rendering
     * 
     * @type {Object}
     */
    tilemap: {
      /**
       * Enable tilemap layer culling for performance
       * 
       * @type {boolean}
       */
      enabled: true,
      
      /**
       * Padding tiles beyond viewport for tilemap culling
       * 
       * @type {number}
       */
      cullPaddingX: 2,
      
      /**
       * Padding tiles beyond viewport for tilemap culling
       * 
       * @type {number}
       */
      cullPaddingY: 2,
      
      /**
       * Skip culling for tilemap layers (set to false for performance)
       * 
       * @type {boolean}
       */
      skipCull: false
    },
    
    /**
     * Performance monitoring configuration
     * 
     * @type {Object}
     */
    performance: {
      /**
       * Enable performance metrics logging
       * 
       * @type {boolean}
       */
      enableLogging: true,
      
      /**
       * Log performance metrics every N frames
       * 
       * @type {number}
       */
      logInterval: 60,
      
      /**
       * Target frame rate for performance monitoring
       * 
       * @type {number}
       */
      targetFPS: 60
    }
  },
  
  /**
   * Game configuration constants
   * 
   * Additional game configuration can be added here as needed.
   */
  // Future configuration properties can be added here
});

// Ensure the module exports are immutable
Object.freeze(LEVEL_SCALE); 
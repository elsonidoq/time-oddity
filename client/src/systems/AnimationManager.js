import { gsap } from 'gsap';

/**
 * AnimationManager - Wrapper for GSAP animations
 * Provides centralized animation management for the game
 */
export class AnimationManager {
    constructor() {
        this.timeline = gsap.timeline();
        this.isInitialized = true;
    }

    /**
     * Fade in animation
     * @param {Object} target - Target object to animate
     * @param {number} duration - Animation duration
     * @param {Object} options - Additional options
     */
    fadeIn(target, duration = 0.5, options = {}) {
        return gsap.to(target, {
            alpha: 1,
            duration: duration,
            ...options
        });
    }

    /**
     * Fade out animation
     * @param {Object} target - Target object to animate
     * @param {number} duration - Animation duration
     * @param {Object} options - Additional options
     */
    fadeOut(target, duration = 0.5, options = {}) {
        return gsap.to(target, {
            alpha: 0,
            duration: duration,
            ...options
        });
    }

    /**
     * Scale animation
     * @param {Object} target - Target object to animate
     * @param {number} scale - Target scale
     * @param {number} duration - Animation duration
     * @param {Object} options - Additional options
     */
    scale(target, scale, duration = 0.3, options = {}) {
        return gsap.to(target, {
            scale: scale,
            duration: duration,
            ...options
        });
    }

    /**
     * Move animation
     * @param {Object} target - Target object to animate
     * @param {Object} position - Target position {x, y}
     * @param {number} duration - Animation duration
     * @param {Object} options - Additional options
     */
    move(target, position, duration = 0.5, options = {}) {
        return gsap.to(target, {
            x: position.x,
            y: position.y,
            duration: duration,
            ...options
        });
    }

    /**
     * Shake animation
     * @param {Object} target - Target object to animate
     * @param {number} intensity - Shake intensity
     * @param {number} duration - Animation duration
     */
    shake(target, intensity = 10, duration = 0.5) {
        const originalX = target.x;
        const originalY = target.y;
        
        return gsap.to(target, {
            x: originalX + (Math.random() - 0.5) * intensity,
            y: originalY + (Math.random() - 0.5) * intensity,
            duration: 0.05,
            repeat: Math.floor(duration / 0.05),
            yoyo: true,
            onComplete: () => {
                gsap.set(target, { x: originalX, y: originalY });
            }
        });
    }

    /**
     * Kill all animations for a target
     * @param {Object} target - Target object
     */
    kill(target) {
        gsap.killTweensOf(target);
    }

    /**
     * Kill all animations
     */
    killAll() {
        gsap.killTweensOf("*");
    }
}

export default AnimationManager; 
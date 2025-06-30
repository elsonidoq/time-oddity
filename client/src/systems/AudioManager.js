import { Howl, Howler } from 'howler';

/**
 * AudioManager - Centralized audio management using Howler.js
 * 
 * This class provides a singleton interface for managing all game audio,
 * including background music and sound effects. It uses Howler.js as the
 * underlying audio engine, respecting the project's architectural decision
 * to disable Phaser's audio system.
 */
export default class AudioManager {
  constructor() {
    this.isMuted = false;
    this._backgroundMusic = null;
  }

  /**
   * Play background music with looping
   * @param {string} key - The audio key to play
   */
  playMusic(key) {
    // Create Howl instance with correct parameters for background music
    this._backgroundMusic = new Howl({
      src: ['/src/assets/audio/cancion.ogg'],
      loop: true,
      volume: 0.8
    });
    
    // Start playing
    this._backgroundMusic.play();
  }

  /**
   * Stop the currently playing background music
   */
  stopMusic() {
    if (this._backgroundMusic) {
      this._backgroundMusic.stop();
    }
  }

  /**
   * Play a sound effect
   * @param {string} key - The sound effect key to play
   */
  playSfx(key) {
    const sfxConfig = {
      jump: {
        src: ['/src/assets/audio/sfx_jump.ogg'],
        volume: 0.6
      },
      coin: {
        src: ['/src/assets/audio/sfx_coin.ogg'],
        volume: 0.7
      },
      playerHurt: {
        src: ['/src/assets/audio/sfx_hurt.ogg'],
        volume: 0.5
      }
    };

    const config = sfxConfig[key];
    if (config) {
      const sound = new Howl(config);
      sound.play();
    }
  }

  /**
   * Toggle mute state for all audio
   */
  toggleMute() {
    try {
      this.isMuted = !this.isMuted;
      Howler.mute(this.isMuted);
    } catch (error) {
      console.warn('[AudioManager] Failed to toggle mute:', error);
    }
  }
} 
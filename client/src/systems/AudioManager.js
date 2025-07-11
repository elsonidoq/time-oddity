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

    // --- Time reversal sound effects ---
    try {
      this._rewindStartSound = new Howl({
        src: ['/time-oddity/client/src/assets/audio/sfx_rewind_start.ogg'],
        volume: 0.7
      });
    } catch (e) {
      this._rewindStartSound = null;
    }
    try {
      this._rewindEndSound = new Howl({
        src: ['/time-oddity/client/src/assets/audio/sfx_rewind_end.ogg'],
        volume: 0.7
      });
    } catch (e) {
      this._rewindEndSound = null;
    }
    this._isRewindAudioPlaying = false;
  }

  /**
   * Play background music with looping
   * @param {string} key - The audio key to play
   */
  playMusic(key) {
    // Create Howl instance with correct parameters for background music
    this._backgroundMusic = new Howl({
      src: ['/time-oddity/client/src/assets/audio/cancion.ogg'],
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
        src: ['/time-oddity/client/src/assets/audio/sfx_jump.ogg'],
        volume: 0.6
      },
      coin: {
        src: ['/time-oddity/client/src/assets/audio/sfx_coin.ogg'],
        volume: 0.7
      },
      playerHurt: {
        src: ['/time-oddity/client/src/assets/audio/sfx_hurt.ogg'],
        volume: 0.4
      }
    };

    const config = sfxConfig[key];
    if (config) {
      const sound = new Howl(config);
      sound.play();
    }
  }

  /**
   * Play the time reversal start sound effect (if not already playing)
   */
  playRewindStart() {
    console.log('[AudioManager] playRewindStart');
    if (this._isRewindAudioPlaying) return;
    try {
      if (this._rewindStartSound) {
        this._rewindStartSound.play();
        this._isRewindAudioPlaying = true;
      }
    } catch (e) {
      // Fail silently
    }
  }

  /**
   * Play the time reversal end sound effect and stop rewind audio
   */
  playRewindEnd() {
    try {
      if (this._rewindEndSound) {
        this._rewindEndSound.play();
      }
      this.stopRewindAudio();
    } catch (e) {
      // Fail silently
    }
  }

  /**
   * Stop any currently playing rewind audio
   */
  stopRewindAudio() {
    try {
      if (this._rewindStartSound) {
        this._rewindStartSound.stop();
      }
      this._isRewindAudioPlaying = false;
    } catch (e) {
      // Fail silently
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
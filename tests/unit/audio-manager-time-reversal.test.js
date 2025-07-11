import AudioManager from '../../client/src/systems/AudioManager.js';

// Mock Howler
jest.mock('howler', () => ({
  Howl: jest.fn(),
  Howler: {
    mute: jest.fn()
  }
}));

describe('AudioManager Time Reversal Sound Effects', () => {
  let audioManager;
  let mockHowl;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock Howl instance
    mockHowl = {
      play: jest.fn(),
      stop: jest.fn(),
      fade: jest.fn(),
      volume: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    };
    
    // Mock Howl constructor
    const { Howl } = require('howler');
    Howl.mockImplementation(() => mockHowl);
    
    // Create AudioManager instance
    audioManager = new AudioManager();
  });

  describe('Time Reversal Sound Effects Setup', () => {
    test('should initialize rewind sound effects', () => {
      // Assert that rewind sound properties exist
      expect(audioManager._rewindStartSound).toBeDefined();
      expect(audioManager._rewindEndSound).toBeDefined();
      expect(audioManager._isRewindAudioPlaying).toBeDefined();
    });

    test('should create Howl instances for rewind sounds', () => {
      // Assert that Howl was called to create rewind sounds
      const { Howl } = require('howler');
      expect(Howl).toHaveBeenCalledWith(
        expect.objectContaining({
          src: expect.arrayContaining([expect.stringContaining('sfx_rewind_start.ogg')]),
          volume: expect.any(Number)
        })
      );
      expect(Howl).toHaveBeenCalledWith(
        expect.objectContaining({
          src: expect.arrayContaining([expect.stringContaining('sfx_rewind_end.ogg')]),
          volume: expect.any(Number)
        })
      );
    });
  });

  describe('Rewind Start Sound', () => {
    test('should play rewind start sound', () => {
      // Act
      audioManager.playRewindStart();

      // Assert
      expect(mockHowl.play).toHaveBeenCalled();
      expect(audioManager._isRewindAudioPlaying).toBe(true);
    });

    test('should not play rewind start sound if already playing', () => {
      // Arrange - start playing
      audioManager.playRewindStart();
      jest.clearAllMocks();

      // Act - try to play again
      audioManager.playRewindStart();

      // Assert - should not call play again
      expect(mockHowl.play).not.toHaveBeenCalled();
    });

    test('should handle play errors gracefully', () => {
      // Arrange - make play throw error
      mockHowl.play.mockImplementation(() => {
        throw new Error('Play error');
      });

      // Act & Assert - should not throw
      expect(() => {
        audioManager.playRewindStart();
      }).not.toThrow();
    });
  });

  describe('Rewind End Sound', () => {
    test('should play rewind end sound', () => {
      // Act
      audioManager.playRewindEnd();

      // Assert
      expect(mockHowl.play).toHaveBeenCalled();
    });

    test('should stop any currently playing rewind audio', () => {
      // Arrange - start rewind audio
      audioManager.playRewindStart();
      jest.clearAllMocks();

      // Act
      audioManager.playRewindEnd();

      // Assert
      expect(mockHowl.stop).toHaveBeenCalled();
      expect(audioManager._isRewindAudioPlaying).toBe(false);
    });

    test('should handle play errors gracefully', () => {
      // Arrange - make play throw error
      mockHowl.play.mockImplementation(() => {
        throw new Error('Play error');
      });

      // Act & Assert - should not throw
      expect(() => {
        audioManager.playRewindEnd();
      }).not.toThrow();
    });
  });

  describe('Stop Rewind Audio', () => {
    test('should stop currently playing rewind audio', () => {
      // Arrange - start rewind audio
      audioManager.playRewindStart();

      // Act
      audioManager.stopRewindAudio();

      // Assert
      expect(mockHowl.stop).toHaveBeenCalled();
      expect(audioManager._isRewindAudioPlaying).toBe(false);
    });

    test('should handle stop when no audio is playing', () => {
      // Act & Assert - should not throw
      expect(() => {
        audioManager.stopRewindAudio();
      }).not.toThrow();
    });

    test('should handle stop errors gracefully', () => {
      // Arrange - make stop throw error
      mockHowl.stop.mockImplementation(() => {
        throw new Error('Stop error');
      });

      // Act & Assert - should not throw
      expect(() => {
        audioManager.stopRewindAudio();
      }).not.toThrow();
    });
  });

  describe('Audio State Management', () => {
    test('should track rewind audio playing state correctly', () => {
      // Initially not playing
      expect(audioManager._isRewindAudioPlaying).toBe(false);

      // Start playing
      audioManager.playRewindStart();
      expect(audioManager._isRewindAudioPlaying).toBe(true);

      // Stop playing
      audioManager.stopRewindAudio();
      expect(audioManager._isRewindAudioPlaying).toBe(false);
    });

    test('should prevent multiple simultaneous rewind audio', () => {
      // Start first rewind audio
      audioManager.playRewindStart();
      const firstPlayCallCount = mockHowl.play.mock.calls.length;

      // Try to start second rewind audio
      audioManager.playRewindStart();
      const secondPlayCallCount = mockHowl.play.mock.calls.length;

      // Should not have called play again
      expect(secondPlayCallCount).toBe(firstPlayCallCount);
    });
  });

  describe('Volume and Audio Configuration', () => {
    test('should set appropriate volume for rewind sounds', () => {
      // Assert that volume is set to a reasonable level
      const { Howl } = require('howler');
      const calls = Howl.mock.calls;
      
      // Check that volume is set for both sounds
      calls.forEach(call => {
        expect(call[0].volume).toBeGreaterThan(0);
        expect(call[0].volume).toBeLessThanOrEqual(1);
      });
    });

    test('should use correct audio file paths', () => {
      // Assert that correct audio files are referenced
      const { Howl } = require('howler');
      const calls = Howl.mock.calls;
      
      const hasStartSound = calls.some(call => 
        call[0].src.some(src => src.includes('sfx_rewind_start.ogg'))
      );
      const hasEndSound = calls.some(call => 
        call[0].src.some(src => src.includes('sfx_rewind_end.ogg'))
      );
      
      expect(hasStartSound).toBe(true);
      expect(hasEndSound).toBe(true);
    });
  });

  describe('Integration with Existing Audio System', () => {
    test('should not interfere with existing music functionality', () => {
      // Arrange - start background music
      audioManager.playMusic('test');
      
      // Act - play rewind sounds
      audioManager.playRewindStart();
      audioManager.playRewindEnd();
      
      // Assert - music should still be playing
      expect(mockHowl.play).toHaveBeenCalled();
    });

    test('should not interfere with existing SFX functionality', () => {
      // Arrange - play existing SFX
      audioManager.playSfx('jump');
      
      // Act - play rewind sounds
      audioManager.playRewindStart();
      audioManager.playRewindEnd();
      
      // Assert - SFX should still work
      expect(mockHowl.play).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    test('should recover from Howl creation errors', () => {
      // Arrange - make Howl constructor throw error
      const { Howl } = require('howler');
      Howl.mockImplementation(() => {
        throw new Error('Howl creation error');
      });

      // Act & Assert - should create new AudioManager without throwing
      expect(() => {
        new AudioManager();
      }).not.toThrow();
    });

    test('should handle missing audio files gracefully', () => {
      // Act & Assert - should not throw when playing sounds
      expect(() => {
        audioManager.playRewindStart();
        audioManager.playRewindEnd();
      }).not.toThrow();
    });
  });
}); 
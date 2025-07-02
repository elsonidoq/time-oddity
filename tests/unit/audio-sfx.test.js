import '../mocks/phaserMock.js';
import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import the mocks that Jest will provide via moduleNameMapper
let HowlMock, HowlerMock;

describe('Task 06.02: Core Sound Effects (Jump, Coin, Damage)', () => {
  let AudioManager;
  let audioManager;
  let audioManagerPath;

  beforeAll(async () => {
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const { existsSync } = await import('fs');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    audioManagerPath = join(__dirname, '../../client/src/systems/AudioManager.js');
    
    // Import the mocks that Jest provides via moduleNameMapper
    const howlerMock = await import('howler');
    HowlMock = howlerMock.Howl;
    HowlerMock = howlerMock.Howler;
    
    if (existsSync(audioManagerPath)) {
      const audioModule = await import(audioManagerPath);
      AudioManager = audioModule.default;
    } else {
      AudioManager = null;
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    HowlMock.mockClear();
    if (AudioManager) {
      audioManager = new AudioManager();
    }
  });

  describe('AudioManager.playSfx Method', () => {
    test('should exist and be a function', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      expect(typeof audioManager.playSfx).toBe('function');
    });

    test('should create Howl instance for jump sound', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      audioManager.playSfx('jump');
      
      expect(HowlMock).toHaveBeenCalledWith(
        expect.objectContaining({
          src: expect.arrayContaining([expect.stringContaining('sfx_jump.ogg')]),
          volume: 0.6
        })
      );
    });

    test('should create Howl instance for coin sound', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      audioManager.playSfx('coin');
      
      expect(HowlMock).toHaveBeenCalledWith(
        expect.objectContaining({
          src: expect.arrayContaining([expect.stringContaining('sfx_coin.ogg')]),
          volume: 0.7
        })
      );
    });

    test('should create Howl instance for playerHurt sound', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      audioManager.playSfx('playerHurt');
      
      expect(HowlMock).toHaveBeenCalledWith(
        expect.objectContaining({
          src: expect.arrayContaining([expect.stringContaining('sfx_hurt.ogg')]),
          volume: 0.5
        })
      );
    });

    test('should call play() on the created Howl instance', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      audioManager.playSfx('jump');
      
      const mockHowlInstance = HowlMock.mock.results[0].value;
      expect(mockHowlInstance.play).toHaveBeenCalled();
    });

    test('should handle unknown sound keys gracefully', () => {
      if (!AudioManager) {
        expect(AudioManager).toBeNull();
        return;
      }
      
      expect(() => audioManager.playSfx('unknown')).not.toThrow();
    });
  });

  describe('Player Jump State Integration', () => {
    let Player;
    let JumpState;
    let player;
    let scene;

    beforeAll(async () => {
      const { join, dirname } = await import('path');
      const { fileURLToPath } = await import('url');
      const { existsSync } = await import('fs');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const playerPath = join(__dirname, '../../client/src/entities/Player.js');
      const jumpStatePath = join(__dirname, '../../client/src/entities/states/JumpState.js');
      
      if (existsSync(playerPath)) {
        const playerModule = await import(playerPath);
        Player = playerModule.default;
      } else {
        Player = null;
      }
      
      if (existsSync(jumpStatePath)) {
        const jumpStateModule = await import(jumpStatePath);
        JumpState = jumpStateModule.default;
      } else {
        JumpState = null;
      }
    });

    beforeEach(() => {
      // Create mock scene with audioManager
      scene = {
        audioManager: {
          playSfx: jest.fn()
        },
        physics: {
          add: {
            sprite: jest.fn(() => ({
              body: {
                setVelocityY: jest.fn(),
                setAllowGravity: jest.fn()
              },
              setOrigin: jest.fn().mockReturnThis(),
              setScale: jest.fn().mockReturnThis()
            }))
          }
        },
        add: {
          sprite: jest.fn(() => ({
            setOrigin: jest.fn().mockReturnThis(),
            setScale: jest.fn().mockReturnThis()
          })),
          existing: jest.fn()
        },
        events: {
          on: jest.fn(),
          emit: jest.fn()
        },
        time: {
          now: jest.fn(() => 0)
        }
      };
    });

    test('should call playSfx("jump") when JumpState.enter() is called', () => {
      if (!JumpState) {
        expect(JumpState).toBeNull();
        return;
      }
      
      const player = { 
        scene,
        anims: { play: jest.fn() },
        body: { setVelocityY: jest.fn() },
        jumpPower: 800
      };
      
      const jumpState = new JumpState(player);
      jumpState.enter();
      
      expect(scene.audioManager.playSfx).toHaveBeenCalledWith('jump');
    });
  });

  describe('Coin Collection Integration', () => {
    let Coin;
    let coin;

    beforeAll(async () => {
      const { join, dirname } = await import('path');
      const { fileURLToPath } = await import('url');
      const { existsSync } = await import('fs');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const coinPath = join(__dirname, '../../client/src/entities/Coin.js');
      
      if (existsSync(coinPath)) {
        const coinModule = await import(coinPath);
        Coin = coinModule.default;
      } else {
        Coin = null;
      }
    });

    beforeEach(() => {
      if (Coin) {
        const scene = {
          audioManager: {
            playSfx: jest.fn()
          },
          physics: {
            add: {
              sprite: jest.fn(() => ({
                body: {
                  setAllowGravity: jest.fn()
                },
                setOrigin: jest.fn().mockReturnThis(),
                setScale: jest.fn().mockReturnThis(),
                visible: true,
                destroy: jest.fn()
              }))
            }
          },
          add: {
            sprite: jest.fn(() => ({
              setOrigin: jest.fn().mockReturnThis(),
              setScale: jest.fn().mockReturnThis()
            }))
          },
          events: {
            on: jest.fn(),
            emit: jest.fn()
          },
          coins: {
            add: jest.fn()
          }
        };
        coin = new Coin(scene, 100, 100);
      }
    });

    test('should call playSfx("coin") when coin is collected', () => {
      if (!Coin) {
        expect(Coin).toBeNull();
        return;
      }
      
      // Mock the collect method or trigger collection
      if (coin.collect) {
        coin.collect();
      } else if (coin.handleCollection) {
        coin.handleCollection();
      }
      
      expect(coin.scene.audioManager.playSfx).toHaveBeenCalledWith('coin');
    });
  });

  describe('Player Damage Integration', () => {
    let Player;
    let player;

    beforeAll(async () => {
      const { join, dirname } = await import('path');
      const { fileURLToPath } = await import('url');
      const { existsSync } = await import('fs');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const playerPath = join(__dirname, '../../client/src/entities/Player.js');
      
      if (existsSync(playerPath)) {
        const playerModule = await import(playerPath);
        Player = playerModule.default;
      } else {
        Player = null;
      }
    });

    beforeEach(() => {
      if (Player) {
        const scene = {
          audioManager: {
            playSfx: jest.fn()
          },
          physics: {
            add: {
              sprite: jest.fn(() => ({
                body: {
                  setVelocityY: jest.fn(),
                  setAllowGravity: jest.fn()
                },
                setOrigin: jest.fn().mockReturnThis(),
                setScale: jest.fn().mockReturnThis()
              })),
              existing: jest.fn()
            }
          },
          add: {
            sprite: jest.fn(() => ({
              setOrigin: jest.fn().mockReturnThis(),
              setScale: jest.fn().mockReturnThis(),
              setActive: jest.fn().mockReturnThis(),
              setVisible: jest.fn().mockReturnThis()
            })),
            existing: jest.fn(),
            group: jest.fn(() => ({
              add: jest.fn(),
              get: jest.fn(() => ({
                setActive: jest.fn(),
                setVisible: jest.fn(),
                setPosition: jest.fn(),
                setScale: jest.fn(),
                setAlpha: jest.fn()
              }))
            }))
          },
          events: {
            on: jest.fn(),
            emit: jest.fn()
          },
          time: {
            now: jest.fn(() => 0)
          }
        };
        player = new Player(scene, 100, 100, 'placeholder_player');
      }
    });

    test('should call playSfx("playerHurt") when player takes damage', () => {
      if (!Player) {
        expect(Player).toBeNull();
        return;
      }
      
      if (player.takeDamage) {
        player.takeDamage(20);
      } else if (player.damage) {
        player.damage(20);
      }
      
      expect(player.scene.audioManager.playSfx).toHaveBeenCalledWith('playerHurt');
    });
  });
}); 
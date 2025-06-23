import { jest } from '@jest/globals';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 2.18: Collectible Coins', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const coinPath = join(__dirname, '../../client/src/entities/Coin.js');
  let Coin;
  let sceneMock;
  let coinInstance;

  beforeAll(async () => {
    if (existsSync(coinPath)) {
      const module = await import(coinPath);
      Coin = module.default;
    } else {
      Coin = class { constructor() {} collect() {} };
    }
  });

  beforeEach(() => {
    sceneMock = {
      physics: {
        add: {
          sprite: jest.fn().mockReturnThis(),
          existing: jest.fn(),
        },
      },
      add: {
        sprite: jest.fn().mockReturnThis(),
      },
    };
    // A mock sprite with a body and a destroy method
    const spriteMock = {
        body: {
            setAllowGravity: jest.fn(),
        },
        destroy: jest.fn(),
        play: jest.fn(),
    };
    sceneMock.physics.add.sprite.mockReturnValue(spriteMock);
    sceneMock.add.sprite.mockReturnValue(spriteMock);

    coinInstance = new Coin(sceneMock, 100, 100, 'coin_spin');
    coinInstance.sprite = spriteMock; // Attach the mock sprite to the instance
  });

  test('Coin.js class file should exist', () => {
    expect(existsSync(coinPath)).toBe(true);
  });
  
  test('Coin should be instantiated correctly', () => {
    expect(coinInstance).toBeDefined();
    expect(sceneMock.physics.add.sprite).toHaveBeenCalledWith(100, 100, 'coin_spin');
  });

  test('collect() method should destroy the coin sprite', () => {
    coinInstance.collect();
    expect(coinInstance.sprite.destroy).toHaveBeenCalled();
  });
}); 
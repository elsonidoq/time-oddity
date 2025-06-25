import { jest } from '@jest/globals';
import ChronoPulse from '../../client/src/entities/ChronoPulse.js';

// Simple mock scene adhering to required API
const mockSceneFactory = (enemyGroup) => ({
  enemies: enemyGroup,
  time: { now: 4000 },
  add: {
    graphics: jest.fn(() => ({
      setPosition: jest.fn(),
      lineStyle: jest.fn(),
      strokeCircle: jest.fn(),
      fillStyle: jest.fn(),
      fillCircle: jest.fn(),
      destroy: jest.fn()
    })) ,
    existing: jest.fn()
  },
  physics: { add: { existing: jest.fn() } },
  events: { emit: jest.fn() }
});

describe('ChronoPulse - Rewound Enemy Integration Bug', () => {
  test('should freeze enemy whose active flag is true but isActive is false (after rewind)', () => {
    // Arrange: rewound enemy scenario
    const rewoundEnemy = {
      x: 50,
      y: 50,
      active: true,     // Restored by TimeManager
      isActive: false,  // After rewind bug: flag not updated
      freeze: jest.fn()
    };
    const enemyGroup = {
      getChildren: jest.fn(() => [rewoundEnemy])
    };
    const scene = mockSceneFactory(enemyGroup);
    const pulse = new ChronoPulse(scene, 40, 40, { range: 100, duration: 500, cooldown: 0 }, { // minimal gsap mock
      timeline: jest.fn(() => ({ to: jest.fn().mockReturnThis(), kill: jest.fn() })),
      to: jest.fn(() => ({ kill: jest.fn() }))
    });

    // Act
    const activated = pulse.activate();

    // Ability should activate
    expect(activated).toBe(true);

    // Assert: freeze should have been invoked despite isActive false
    expect(rewoundEnemy.freeze).toHaveBeenCalled();
  });
}); 
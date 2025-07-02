import GameScene from '../../client/src/scenes/GameScene.js';
import { createPhaserSceneMock } from '../mocks/phaserSceneMock.js';

// Level config has ground width 6000, so expect setBounds width >= 6000

describe('Camera bounds reflect level width', () => {
  it('sets camera bounds wider than default canvas', () => {
    const mockScene = createPhaserSceneMock('GameScene');
    const gameScene = new GameScene(mockScene);
    gameScene.create();

    const calls = mockScene.cameras.main.setBounds.mock ? mockScene.cameras.main.setBounds.mock.calls : mockScene.cameras.main.setBounds.calls;
    // get last call
    const [ , , width] = calls[calls.length - 1];
    expect(width).toBeGreaterThanOrEqual(6000);
  });
}); 
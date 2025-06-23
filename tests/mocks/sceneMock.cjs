// Mock Phaser.Scene class
const { jest } = require('@jest/globals');

class SceneMock {
  constructor(key) {
    this.key = key;
    this.scene = {
      start: jest.fn(),
      stop: jest.fn(),
      launch: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn()
    };
    this.add = {
      text: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis()
      }),
      image: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis()
      }),
      sprite: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis()
      })
    };
    this.load = {
      image: jest.fn(),
      spritesheet: jest.fn(),
      on: jest.fn(),
      once: jest.fn()
    };
    this.events = {
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn()
    };
    this.physics = {
      add: {
        staticGroup: jest.fn().mockReturnValue({
          add: jest.fn().mockReturnThis()
        }),
        group: jest.fn().mockReturnValue({
          add: jest.fn().mockReturnThis()
        })
      }
    };
    this.cameras = {
      main: {
        setBackgroundColor: jest.fn(),
        startFollow: jest.fn(),
        setBounds: jest.fn()
      }
    };
  }

  init() {}
  preload() {}
  create() {}
  update() {}
}

module.exports = SceneMock; 
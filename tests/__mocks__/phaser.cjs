// Mock Phaser module for testing

// Mock Phaser.Scene class
function SceneMock(key) {
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

SceneMock.prototype.init = function() {};
SceneMock.prototype.preload = function() {};
SceneMock.prototype.create = function() {};
SceneMock.prototype.update = function() {};

module.exports = {
  Scene: SceneMock,
  Game: function Game(config) {
    this.config = config;
    this.scene = {
      start: jest.fn(),
      stop: jest.fn(),
      launch: jest.fn()
    };
  },
  AUTO: 'AUTO',
  CANVAS: 'CANVAS',
  WEBGL: 'WEBGL',
  Scale: {
    FIT: 'FIT',
    CENTER_BOTH: 'CENTER_BOTH'
  },
  Physics: {
    Arcade: {
      Physics: function ArcadePhysics(scene) {
        this.scene = scene;
        this.add = {
          staticGroup: jest.fn().mockReturnValue({
            add: jest.fn().mockReturnThis()
          }),
          group: jest.fn().mockReturnValue({
            add: jest.fn().mockReturnThis()
          }),
          sprite: jest.fn().mockReturnValue({
            setVelocity: jest.fn().mockReturnThis(),
            setBounce: jest.fn().mockReturnThis(),
            setCollideWorldBounds: jest.fn().mockReturnThis()
          })
        };
        this.add = {
          collider: jest.fn(),
          overlap: jest.fn()
        };
      }
    }
  },
  GameObjects: {
    Text: function Text(x, y, text, style) {
      this.x = x;
      this.y = y;
      this.text = text;
      this.style = style;
      this.setOrigin = function(x, y) { return this; };
      this.setInteractive = function() { return this; };
      this.on = function(event, callback) { return this; };
    },
    Sprite: function Sprite(x, y, texture) {
      this.x = x;
      this.y = y;
      this.texture = texture;
      this.setOrigin = function(x, y) { return this; };
      this.setInteractive = function() { return this; };
    },
    Image: function Image(x, y, texture) {
      this.x = x;
      this.y = y;
      this.texture = texture;
      this.setOrigin = function(x, y) { return this; };
      this.setInteractive = function() { return this; };
    }
  }
}; 
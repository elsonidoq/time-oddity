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
    }),
    existing: jest.fn()
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
      }),
      existing: jest.fn(),
      collider: jest.fn(),
      overlap: jest.fn()
    },
    world: {
      gravity: { x: 0, y: 0 },
      bounds: {
        setTo: jest.fn()
      }
    },
    config: {
      debug: false
    }
  };
  this.cameras = {
    main: {
      setBackgroundColor: jest.fn(),
      startFollow: jest.fn(),
      setBounds: jest.fn(),
      setTint: jest.fn(),
      clearTint: jest.fn()
    }
  };
  this.sys = {
    game: {
      config: {
        width: 1280,
        height: 720,
        physics: {
          arcade: {
            debug: false
          }
        }
      }
    }
  };
}

SceneMock.prototype.init = function() {};
SceneMock.prototype.preload = function() {};
SceneMock.prototype.create = function() {};
SceneMock.prototype.update = function() {};

// Mock Phaser.Physics.Arcade.Sprite class
function ArcadeSpriteMock(scene, x, y, texture, frame) {
  this.scene = scene;
  this.x = x;
  this.y = y;
  this.texture = texture;
  this.frame = frame;
  this.active = true;
  this.visible = true;
  this.body = {
    velocity: { x: 0, y: 0 },
    setVelocity: jest.fn().mockReturnThis(),
    setVelocityX: jest.fn().mockReturnThis(),
    setVelocityY: jest.fn().mockReturnThis(),
    setBounce: jest.fn().mockReturnThis(),
    setCollideWorldBounds: jest.fn().mockReturnThis(),
    setGravity: jest.fn().mockReturnThis(),
    setAllowGravity: jest.fn().mockReturnThis(),
    setImmovable: jest.fn().mockReturnThis(),
    setSize: jest.fn().mockReturnThis(),
    setOffset: jest.fn().mockReturnThis(),
    onFloor: jest.fn().mockReturnValue(false),
    reset: jest.fn().mockReturnThis()
  };
  this.anims = {
    play: jest.fn().mockReturnThis(),
    setCurrentFrame: jest.fn().mockReturnThis(),
    currentAnim: null
  };
  this.setOrigin = jest.fn().mockReturnThis();
  this.setInteractive = jest.fn().mockReturnThis();
  
  // Properly implement setActive and setVisible to update the actual properties
  this.setActive = jest.fn().mockImplementation((active) => {
    this.active = active;
    return this;
  });
  this.setVisible = jest.fn().mockImplementation((visible) => {
    this.visible = visible;
    return this;
  });
  
  this.setFlipX = jest.fn().mockReturnThis();
  this.destroy = jest.fn();
}

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
      Sprite: ArcadeSpriteMock,
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
          }),
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

module.exports.default = module.exports; 
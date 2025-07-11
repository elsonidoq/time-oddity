import BaseScene from './BaseScene.js';

export default class BootScene extends BaseScene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const GITHUB_PAGES = false;
    let prefix;
    if (GITHUB_PAGES) {
      prefix = '/time-oddity/client';
    } else {
      prefix = '';
    }
    console.log('prefix', prefix);
    // Load Kenney character spritesheet atlas with XML file
    this.load.atlasXML('characters', prefix + '/src/assets/sprites/spritesheet-characters-default.png', prefix + '/src/assets/sprites/spritesheet-characters-default.xml');
    // Load Kenney tile spritesheet atlas with XML file
    this.load.atlasXML('tiles', prefix + '/src/assets/sprites/spritesheet-tiles-default.png', prefix + '/src/assets/sprites/spritesheet-tiles-default.xml');
    // Load Kenney enemy spritesheet atlas with XML file
    this.load.atlasXML('enemies', prefix + '/src/assets/sprites/spritesheet-enemies-default.png', prefix + '/src/assets/sprites/spritesheet-enemies-default.xml');
    // Load Kenney background spritesheet atlas with XML file
    this.load.atlasXML('backgrounds', prefix + '/src/assets/sprites/spritesheet-backgrounds-default.png', prefix + '/src/assets/sprites/spritesheet-backgrounds-default.xml');
  }

  create() {
    // Create character animations for beige character variant (default player character)
    this.createCharacterAnimations();
    // Create tile animations (e.g., coin block)
    this.createTileAnimations();
    // Create animations for basic enemies
    this.createEnemyAnimations();
    // Transition to the MenuScene once assets are loaded
    this.scene.start('MenuScene');
  }

  createCharacterAnimations() {
    // Create idle animation
    this.anims.create({
      key: 'player-idle',
      frames: [{ key: 'characters', frame: 'character_beige_idle' }],
      frameRate: 10,
      repeat: -1
    });

    // Create walk animation (using both walk_a and walk_b frames)
    this.anims.create({
      key: 'player-walk',
      frames: [
        { key: 'characters', frame: 'character_beige_walk_a' },
        { key: 'characters', frame: 'character_beige_walk_b' }
      ],
      frameRate: 10,
      repeat: -1
    });

    // Create jump animation
    this.anims.create({
      key: 'player-jump',
      frames: [{ key: 'characters', frame: 'character_beige_jump' }],
      frameRate: 10,
      repeat: -1
    });

    // Create fall animation
    this.anims.create({
      key: 'player-fall',
      frames: [{ key: 'characters', frame: 'character_beige_hit' }], // Using 'hit' as a stand-in for fall
      frameRate: 10,
      repeat: -1
    });
  }

  createTileAnimations() {
    // Example: Coin block animation (active/inactive)
    this.anims.create({
      key: 'block-coin-active',
      frames: [
        { key: 'tiles', frame: 'block_coin_active' },
        { key: 'tiles', frame: 'block_coin' }
      ],
      frameRate: 4,
      repeat: -1
    });

    // Spinning coin animation
    this.anims.create({
      key: 'coin_spin',
      frames: [
        { key: 'tiles', frame: 'coin_gold' },
        { key: 'tiles', frame: 'coin_bronze' }
      ],
      frameRate: 8,
      repeat: -1
    });
  }

  createEnemyAnimations() {
    // Slime walk animation
    this.anims.create({
      key: 'slime-walk',
      frames: [
        { key: 'enemies', frame: 'slime_normal_walk_a' },
        { key: 'enemies', frame: 'slime_normal_walk_b' }
      ],
      frameRate: 4,
      repeat: -1
    });

    // Fly animation
    this.anims.create({
      key: 'fly-fly',
      frames: [
        { key: 'enemies', frame: 'fly_a' },
        { key: 'enemies', frame: 'fly_b' }
      ],
      frameRate: 6,
      repeat: -1
    });

    // Mouse walk animation
    this.anims.create({
      key: 'mouse-walk',
      frames: [
        { key: 'enemies', frame: 'mouse_walk_a' },
        { key: 'enemies', frame: 'mouse_walk_b' }
      ],
      frameRate: 6,
      repeat: -1
    });
  }
} 
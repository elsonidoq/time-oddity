import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

const kenneyPath = 'kenney_new-platformer-pack-1.0';
const clientAssetsPath = 'client/src/assets';

// Ensure target directories exist
const ensureDir = (dirPath) => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
};

// Copy file with directory creation
const copyFile = (source, target) => {
  ensureDir(dirname(target));
  copyFileSync(source, target);
  console.log(`Copied: ${source} -> ${target}`);
};

// Assets to copy
const assetsToCopy = [
  // Character spritesheet
  {
    source: join(kenneyPath, 'Spritesheets', 'spritesheet-characters-default.png'),
    target: join(clientAssetsPath, 'sprites', 'spritesheet-characters-default.png')
  },
  {
    source: join(kenneyPath, 'Spritesheets', 'spritesheet-characters-default.xml'),
    target: join(clientAssetsPath, 'sprites', 'spritesheet-characters-default.xml')
  },
  
  // Tile spritesheet
  {
    source: join(kenneyPath, 'Spritesheets', 'spritesheet-tiles-default.png'),
    target: join(clientAssetsPath, 'sprites', 'spritesheet-tiles-default.png')
  },
  {
    source: join(kenneyPath, 'Spritesheets', 'spritesheet-tiles-default.xml'),
    target: join(clientAssetsPath, 'sprites', 'spritesheet-tiles-default.xml')
  },
  
  // Enemy spritesheet
  {
    source: join(kenneyPath, 'Spritesheets', 'spritesheet-enemies-default.png'),
    target: join(clientAssetsPath, 'sprites', 'spritesheet-enemies-default.png')
  },
  {
    source: join(kenneyPath, 'Spritesheets', 'spritesheet-enemies-default.xml'),
    target: join(clientAssetsPath, 'sprites', 'spritesheet-enemies-default.xml')
  },
  
  // Background spritesheet
  {
    source: join(kenneyPath, 'Spritesheets', 'spritesheet-backgrounds-default.png'),
    target: join(clientAssetsPath, 'sprites', 'spritesheet-backgrounds-default.png')
  },
  {
    source: join(kenneyPath, 'Spritesheets', 'spritesheet-backgrounds-default.xml'),
    target: join(clientAssetsPath, 'sprites', 'spritesheet-backgrounds-default.xml')
  }
];

// Sound effects to copy
const soundEffects = [
  'sfx_bump.ogg',
  'sfx_coin.ogg',
  'sfx_disappear.ogg',
  'sfx_gem.ogg',
  'sfx_hurt.ogg',
  'sfx_jump-high.ogg',
  'sfx_jump.ogg',
  'sfx_magic.ogg',
  'sfx_select.ogg',
  'sfx_throw.ogg'
];

console.log('Starting Kenney assets copy...');

// Copy spritesheets
assetsToCopy.forEach(asset => {
  if (existsSync(asset.source)) {
    copyFile(asset.source, asset.target);
  } else {
    console.warn(`Warning: Source file not found: ${asset.source}`);
  }
});

// Copy sound effects
soundEffects.forEach(soundFile => {
  const source = join(kenneyPath, 'Sounds', soundFile);
  const target = join(clientAssetsPath, 'audio', soundFile);
  
  if (existsSync(source)) {
    copyFile(source, target);
  } else {
    console.warn(`Warning: Sound file not found: ${source}`);
  }
});

console.log('Kenney assets copy completed!'); 
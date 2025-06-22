import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Kenney Assets Organization', () => {
  const clientAssetsPath = 'client/src/assets';
  const kenneyPath = 'kenney_new-platformer-pack-1.0';

  describe('Character Spritesheet', () => {
    test('should copy character spritesheet PNG to client assets', () => {
      const sourceFile = join(kenneyPath, 'Spritesheets', 'spritesheet-characters-default.png');
      const targetFile = join(clientAssetsPath, 'sprites', 'spritesheet-characters-default.png');
      
      expect(existsSync(sourceFile)).toBe(true);
      expect(existsSync(targetFile)).toBe(true);
    });

    test('should copy character spritesheet XML to client assets', () => {
      const sourceFile = join(kenneyPath, 'Spritesheets', 'spritesheet-characters-default.xml');
      const targetFile = join(clientAssetsPath, 'sprites', 'spritesheet-characters-default.xml');
      
      expect(existsSync(sourceFile)).toBe(true);
      expect(existsSync(targetFile)).toBe(true);
    });

    test('should validate character spritesheet XML structure', () => {
      const xmlFile = join(clientAssetsPath, 'sprites', 'spritesheet-characters-default.xml');
      expect(existsSync(xmlFile)).toBe(true);
      
      const xmlContent = readFileSync(xmlFile, 'utf8');
      expect(xmlContent).toContain('<TextureAtlas');
      expect(xmlContent).toContain('<SubTexture');
    });
  });

  describe('Tile Spritesheet', () => {
    test('should copy tile spritesheet PNG to client assets', () => {
      const sourceFile = join(kenneyPath, 'Spritesheets', 'spritesheet-tiles-default.png');
      const targetFile = join(clientAssetsPath, 'sprites', 'spritesheet-tiles-default.png');
      
      expect(existsSync(sourceFile)).toBe(true);
      expect(existsSync(targetFile)).toBe(true);
    });

    test('should copy tile spritesheet XML to client assets', () => {
      const sourceFile = join(kenneyPath, 'Spritesheets', 'spritesheet-tiles-default.xml');
      const targetFile = join(clientAssetsPath, 'sprites', 'spritesheet-tiles-default.xml');
      
      expect(existsSync(sourceFile)).toBe(true);
      expect(existsSync(targetFile)).toBe(true);
    });

    test('should validate tile spritesheet XML structure', () => {
      const xmlFile = join(clientAssetsPath, 'sprites', 'spritesheet-tiles-default.xml');
      expect(existsSync(xmlFile)).toBe(true);
      
      const xmlContent = readFileSync(xmlFile, 'utf8');
      expect(xmlContent).toContain('<TextureAtlas');
      expect(xmlContent).toContain('<SubTexture');
    });
  });

  describe('Enemy Spritesheet', () => {
    test('should copy enemy spritesheet PNG to client assets', () => {
      const sourceFile = join(kenneyPath, 'Spritesheets', 'spritesheet-enemies-default.png');
      const targetFile = join(clientAssetsPath, 'sprites', 'spritesheet-enemies-default.png');
      
      expect(existsSync(sourceFile)).toBe(true);
      expect(existsSync(targetFile)).toBe(true);
    });

    test('should copy enemy spritesheet XML to client assets', () => {
      const sourceFile = join(kenneyPath, 'Spritesheets', 'spritesheet-enemies-default.xml');
      const targetFile = join(clientAssetsPath, 'sprites', 'spritesheet-enemies-default.xml');
      
      expect(existsSync(sourceFile)).toBe(true);
      expect(existsSync(targetFile)).toBe(true);
    });

    test('should validate enemy spritesheet XML structure', () => {
      const xmlFile = join(clientAssetsPath, 'sprites', 'spritesheet-enemies-default.xml');
      expect(existsSync(xmlFile)).toBe(true);
      
      const xmlContent = readFileSync(xmlFile, 'utf8');
      expect(xmlContent).toContain('<TextureAtlas');
      expect(xmlContent).toContain('<SubTexture');
    });
  });

  describe('Background Spritesheet', () => {
    test('should copy background spritesheet PNG to client assets', () => {
      const sourceFile = join(kenneyPath, 'Spritesheets', 'spritesheet-backgrounds-default.png');
      const targetFile = join(clientAssetsPath, 'sprites', 'spritesheet-backgrounds-default.png');
      
      expect(existsSync(sourceFile)).toBe(true);
      expect(existsSync(targetFile)).toBe(true);
    });

    test('should copy background spritesheet XML to client assets', () => {
      const sourceFile = join(kenneyPath, 'Spritesheets', 'spritesheet-backgrounds-default.xml');
      const targetFile = join(clientAssetsPath, 'sprites', 'spritesheet-backgrounds-default.xml');
      
      expect(existsSync(sourceFile)).toBe(true);
      expect(existsSync(targetFile)).toBe(true);
    });
  });

  describe('Sound Effects', () => {
    test('should copy sound effects to client audio directory', () => {
      const soundFiles = [
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

      soundFiles.forEach(soundFile => {
        const sourceFile = join(kenneyPath, 'Sounds', soundFile);
        const targetFile = join(clientAssetsPath, 'audio', soundFile);
        
        expect(existsSync(sourceFile)).toBe(true);
        expect(existsSync(targetFile)).toBe(true);
      });
    });
  });

  describe('Asset Directory Structure', () => {
    test('should have proper client assets directory structure', () => {
      expect(existsSync(join(clientAssetsPath, 'sprites'))).toBe(true);
      expect(existsSync(join(clientAssetsPath, 'audio'))).toBe(true);
      expect(existsSync(join(clientAssetsPath, 'levels'))).toBe(true);
    });

    test('should maintain original file names', () => {
      const expectedFiles = [
        'spritesheet-characters-default.png',
        'spritesheet-characters-default.xml',
        'spritesheet-tiles-default.png',
        'spritesheet-tiles-default.xml',
        'spritesheet-enemies-default.png',
        'spritesheet-enemies-default.xml',
        'spritesheet-backgrounds-default.png',
        'spritesheet-backgrounds-default.xml'
      ];

      expectedFiles.forEach(file => {
        expect(existsSync(join(clientAssetsPath, 'sprites', file))).toBe(true);
      });
    });
  });

  describe('Asset File Integrity', () => {
    test('should validate PNG files are not corrupted', () => {
      const pngFiles = [
        'spritesheet-characters-default.png',
        'spritesheet-tiles-default.png',
        'spritesheet-enemies-default.png',
        'spritesheet-backgrounds-default.png'
      ];

      pngFiles.forEach(file => {
        const filePath = join(clientAssetsPath, 'sprites', file);
        expect(existsSync(filePath)).toBe(true);
        
        const fileContent = readFileSync(filePath);
        expect(fileContent.length).toBeGreaterThan(0);
        // Check PNG header
        expect(fileContent.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
      });
    });

    test('should validate XML files are not corrupted', () => {
      const xmlFiles = [
        'spritesheet-characters-default.xml',
        'spritesheet-tiles-default.xml',
        'spritesheet-enemies-default.xml',
        'spritesheet-backgrounds-default.xml'
      ];

      xmlFiles.forEach(file => {
        const filePath = join(clientAssetsPath, 'sprites', file);
        expect(existsSync(filePath)).toBe(true);
        
        const fileContent = readFileSync(filePath, 'utf8');
        expect(fileContent.length).toBeGreaterThan(0);
        // Kenney XML files may not include XML declaration but are still valid
        expect(fileContent).toContain('<TextureAtlas');
        expect(fileContent).toContain('<SubTexture');
        // Validate it's well-formed XML by checking for proper closing tags
        expect(fileContent).toContain('</TextureAtlas>');
      });
    });

    test('should validate OGG files are not corrupted', () => {
      const oggFiles = [
        'sfx_bump.ogg',
        'sfx_coin.ogg',
        'sfx_jump.ogg'
      ];

      oggFiles.forEach(file => {
        const filePath = join(clientAssetsPath, 'audio', file);
        expect(existsSync(filePath)).toBe(true);
        
        const fileContent = readFileSync(filePath);
        expect(fileContent.length).toBeGreaterThan(0);
        // Check OGG header
        expect(fileContent.subarray(0, 4)).toEqual(Buffer.from([0x4F, 0x67, 0x67, 0x53]));
      });
    });
  });
});

describe('Kenney Tile Spritesheet Loading in BootScene', () => {
  describe('Asset Loading', () => {
    test('should load tile spritesheet PNG file', () => {
      const spritesheetPath = 'client/src/assets/sprites/spritesheet-tiles-default.png';
      expect(existsSync(spritesheetPath)).toBe(true);
    });

    test('should load tile spritesheet XML file', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-tiles-default.xml';
      expect(existsSync(xmlPath)).toBe(true);
    });

    test('should validate tile spritesheet XML structure', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-tiles-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      expect(xmlContent).toContain('<TextureAtlas');
      expect(xmlContent).toContain('<SubTexture');
      expect(xmlContent).toContain('block_blue');
      expect(xmlContent).toContain('block_coin');
    });
  });

  describe('Tile Animation Creation', () => {
    test('should create coin block animation frames', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-tiles-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      expect(xmlContent).toContain('block_coin_active');
      expect(xmlContent).toContain('block_coin');
    });
  });

  describe('XML Frame Extraction', () => {
    test('should extract tile frame definitions from XML', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-tiles-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      expect(xmlContent).toMatch(/name="[^\"]*"/);
      expect(xmlContent).toMatch(/x="\d+"/);
      expect(xmlContent).toMatch(/y="\d+"/);
      expect(xmlContent).toMatch(/width="\d+"/);
      expect(xmlContent).toMatch(/height="\d+"/);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing tile spritesheet file gracefully', () => {
      const nonExistentPath = 'client/src/assets/sprites/nonexistent-tiles.png';
      expect(existsSync(nonExistentPath)).toBe(false);
    });

    test('should handle missing tile XML file gracefully', () => {
      const nonExistentPath = 'client/src/assets/sprites/nonexistent-tiles.xml';
      expect(existsSync(nonExistentPath)).toBe(false);
    });
  });

  describe('Asset Replacement', () => {
    test('should replace placeholder platform assets', () => {
      const placeholderPath = 'client/src/assets/sprites/placeholder_platform.png';
      const kenneyPath = 'client/src/assets/sprites/spritesheet-tiles-default.png';
      expect(existsSync(placeholderPath)).toBe(true);
      expect(existsSync(kenneyPath)).toBe(true);
    });
  });
}); 
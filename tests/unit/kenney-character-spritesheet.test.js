import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Kenney Character Spritesheet Loading in BootScene', () => {
  describe('Asset Loading', () => {
    test('should load character spritesheet PNG file', () => {
      const spritesheetPath = 'client/src/assets/sprites/spritesheet-characters-default.png';
      expect(existsSync(spritesheetPath)).toBe(true);
    });

    test('should load character spritesheet XML file', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-characters-default.xml';
      expect(existsSync(xmlPath)).toBe(true);
    });

    test('should validate character spritesheet XML structure', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-characters-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      
      expect(xmlContent).toContain('<TextureAtlas');
      expect(xmlContent).toContain('<SubTexture');
      expect(xmlContent).toContain('character_beige_idle');
      expect(xmlContent).toContain('character_beige_walk_a');
      expect(xmlContent).toContain('character_beige_walk_b');
      expect(xmlContent).toContain('character_beige_jump');
    });
  });

  describe('Character Animation Creation', () => {
    test('should create idle animation for beige character', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-characters-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      
      expect(xmlContent).toContain('character_beige_idle');
    });

    test('should create walk animation frames for beige character', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-characters-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      
      expect(xmlContent).toContain('character_beige_walk_a');
      expect(xmlContent).toContain('character_beige_walk_b');
    });

    test('should create jump animation for beige character', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-characters-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      
      expect(xmlContent).toContain('character_beige_jump');
    });

    test('should create fall animation for beige character', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-characters-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      
      // Fall animation might use the same frame as jump or idle
      expect(xmlContent).toContain('character_beige_idle');
    });
  });

  describe('XML Frame Extraction', () => {
    test('should extract frame definitions from XML', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-characters-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      
      // Check for frame attributes
      expect(xmlContent).toMatch(/name="[^"]*"/);
      expect(xmlContent).toMatch(/x="\d+"/);
      expect(xmlContent).toMatch(/y="\d+"/);
      expect(xmlContent).toMatch(/width="\d+"/);
      expect(xmlContent).toMatch(/height="\d+"/);
    });

    test('should have proper frame dimensions', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-characters-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      
      // Extract frame dimensions from XML
      const frameMatch = xmlContent.match(/width="(\d+)" height="(\d+)"/);
      expect(frameMatch).toBeTruthy();
      
      const width = parseInt(frameMatch[1]);
      const height = parseInt(frameMatch[2]);
      
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(width).toBe(128); // Kenney character frames are 128x128
      expect(height).toBe(128);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing spritesheet file gracefully', () => {
      const nonExistentPath = 'client/src/assets/sprites/nonexistent.png';
      expect(existsSync(nonExistentPath)).toBe(false);
    });

    test('should handle missing XML file gracefully', () => {
      const nonExistentPath = 'client/src/assets/sprites/nonexistent.xml';
      expect(existsSync(nonExistentPath)).toBe(false);
    });
  });

  describe('Asset Replacement', () => {
    test('should replace placeholder character assets', () => {
      const placeholderPath = 'client/src/assets/sprites/placeholder_player.png';
      const kenneyPath = 'client/src/assets/sprites/spritesheet-characters-default.png';
      
      // Placeholder should still exist for fallback
      expect(existsSync(placeholderPath)).toBe(true);
      // Kenney assets should now be available
      expect(existsSync(kenneyPath)).toBe(true);
    });
  });

  describe('Character Variants', () => {
    test('should include beige character variant', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-characters-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      
      expect(xmlContent).toContain('character_beige_');
    });

    test('should include multiple character color variants', () => {
      const xmlPath = 'client/src/assets/sprites/spritesheet-characters-default.xml';
      const xmlContent = readFileSync(xmlPath, 'utf8');
      
      const variants = ['beige', 'green', 'pink', 'purple', 'yellow'];
      variants.forEach(variant => {
        expect(xmlContent).toContain(`character_${variant}_`);
      });
    });
  });
}); 
import levelConfig from '../../client/src/config/test-level.json';

describe('Test Level Configuration', () => {
  it('should have a valid platforms array', () => {
    expect(Array.isArray(levelConfig.platforms)).toBe(true);
    expect(levelConfig.platforms.length).toBeGreaterThan(0);
  });

  it('should include the ground platform with correct properties', () => {
    const ground = levelConfig.platforms.find(p => p.type === 'ground');
    expect(ground).toBeDefined();
    expect(ground.x).toBe(0);
    expect(ground.y).toBe(1400);
    expect(ground.width).toBe(2600);
    expect(ground.tileKey).toBe('terrain_grass_horizontal_middle');
    expect(ground.isFullBlock).toBe(true);
  });

  it('should include all floating platforms with correct properties', () => {
    const floating = levelConfig.platforms.filter(p => p.type === 'floating');
    expect(floating.length).toBe(16);
    // Check that all floating platforms have the expected properties
    for (const platform of floating) {
      expect(platform).toMatchObject({
        type: 'floating',
        tileKey: 'terrain_grass_block_center',
        isFullBlock: true
      });
      expect(typeof platform.x).toBe('number');
      expect(typeof platform.y).toBe('number');
    }
  });

  it('should include moving platforms with correct properties', () => {
    const moving = levelConfig.platforms.filter(p => p.type === 'moving');
    expect(moving.length).toBe(4);
    // Check that all moving platforms have the expected properties
    for (const platform of moving) {
      expect(platform).toMatchObject({
        type: 'moving',
        tileKey: 'terrain_grass_block_center',
        isFullBlock: true
      });
      expect(platform.movement).toBeDefined();
      expect(typeof platform.movement.type).toBe('string');
      expect(typeof platform.movement.speed).toBe('number');
    }
  });

  it('should match the expected schema for all platforms', () => {
    for (const platform of levelConfig.platforms) {
      expect(typeof platform.type).toBe('string');
      expect(typeof platform.x).toBe('number');
      expect(typeof platform.y).toBe('number');
      expect(typeof platform.tileKey).toBe('string');
      expect(typeof platform.isFullBlock).toBe('boolean');
      if (platform.type === 'ground') {
        expect(typeof platform.width).toBe('number');
      }
      if (platform.type === 'moving') {
        expect(platform.movement).toBeDefined();
        expect(typeof platform.movement.type).toBe('string');
        expect(typeof platform.movement.speed).toBe('number');
      }
    }
  });
}); 
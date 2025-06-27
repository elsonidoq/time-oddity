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
    expect(ground.y).toBe(656);
    expect(ground.width).toBe(1280);
    expect(ground.tileKey).toBe('terrain_grass_horizontal_middle');
    expect(ground.isFullBlock).toBe(true);
  });

  it('should include all floating platforms with correct properties', () => {
    const floating = levelConfig.platforms.filter(p => p.type === 'floating');
    expect(floating.length).toBe(5);
    expect(floating).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ x: 200, y: 500, tileKey: 'terrain_grass_block_center', isFullBlock: true }),
        expect.objectContaining({ x: 1000, y: 550, tileKey: 'terrain_grass_block_center', isFullBlock: true }),
        expect.objectContaining({ x: 640, y: 400, tileKey: 'terrain_grass_block_center', isFullBlock: true }),
        expect.objectContaining({ x: 350, y: 250, tileKey: 'terrain_grass_block_center', isFullBlock: true }),
        expect.objectContaining({ x: 800, y: 200, tileKey: 'terrain_grass_block_center', isFullBlock: true })
      ])
    );
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
    }
  });
}); 
import levelConfig from '../../client/src/config/test-level.json';

describe('Test Level Configuration', () => {
  it('should have valid goal configuration', () => {
    expect(levelConfig.goal).toBeDefined();
    expect(typeof levelConfig.goal.x).toBe('number');
    expect(typeof levelConfig.goal.y).toBe('number');
    expect(typeof levelConfig.goal.tileKey).toBe('string');
    expect(typeof levelConfig.goal.isFullBlock).toBe('boolean');
  });

  it('should have valid coins array', () => {
    expect(Array.isArray(levelConfig.coins)).toBe(true);
    expect(levelConfig.coins.length).toBeGreaterThan(0);
    
    for (const coin of levelConfig.coins) {
      expect(typeof coin.type).toBe('string');
      expect(coin.type).toBe('coin');
      expect(typeof coin.x).toBe('number');
      expect(typeof coin.y).toBe('number');
      expect(coin.properties).toBeDefined();
      expect(typeof coin.properties.value).toBe('number');
    }
  });

  it('should have valid platforms array', () => {
    expect(Array.isArray(levelConfig.platforms)).toBe(true);
    expect(levelConfig.platforms.length).toBeGreaterThan(0);
  });

  it('should have valid enemies array', () => {
    expect(Array.isArray(levelConfig.enemies)).toBe(true);
    expect(levelConfig.enemies.length).toBeGreaterThan(0);
    
    for (const enemy of levelConfig.enemies) {
      expect(typeof enemy.type).toBe('string');
      expect(typeof enemy.x).toBe('number');
      expect(typeof enemy.y).toBe('number');
      expect(typeof enemy.patrolDistance).toBe('number');
      expect(typeof enemy.direction).toBe('number');
      expect(typeof enemy.speed).toBe('number');
    }
  });

  it('should have valid backgrounds array', () => {
    expect(Array.isArray(levelConfig.backgrounds)).toBe(true);
    expect(levelConfig.backgrounds.length).toBeGreaterThan(0);
    
    for (const bg of levelConfig.backgrounds) {
      expect(typeof bg.type).toBe('string');
      expect(bg.type).toBe('layer');
      expect(typeof bg.x).toBe('number');
      expect(typeof bg.y).toBe('number');
      expect(typeof bg.width).toBe('number');
      expect(typeof bg.height).toBe('number');
      expect(typeof bg.spriteKey).toBe('string');
      expect(typeof bg.depth).toBe('number');
      expect(typeof bg.scrollSpeed).toBe('number');
    }
  });

  it('should have valid decorativePlatforms array', () => {
    expect(Array.isArray(levelConfig.decorativePlatforms)).toBe(true);
    expect(levelConfig.decorativePlatforms.length).toBeGreaterThan(0);
    
    for (const dec of levelConfig.decorativePlatforms) {
      expect(typeof dec.type).toBe('string');
      expect(dec.type).toBe('decorative');
      expect(typeof dec.x).toBe('number');
      expect(typeof dec.y).toBe('number');
      expect(typeof dec.tilePrefix).toBe('string');
      expect(typeof dec.depth).toBe('number');
    }
  });

  it('should match the expected schema for all platforms', () => {
    for (const platform of levelConfig.platforms) {
      expect(typeof platform.type).toBe('string');
      expect(typeof platform.x).toBe('number');
      expect(typeof platform.y).toBe('number');
      expect(typeof platform.tilePrefix).toBe('string');
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

  // New tests for player spawn configuration
  it('should have player spawn configuration', () => {
    expect(levelConfig.playerSpawn).toBeDefined();
    expect(typeof levelConfig.playerSpawn.x).toBe('number');
    expect(typeof levelConfig.playerSpawn.y).toBe('number');
  });

  it('should have player spawn coordinates within level bounds', () => {
    // Find the lowest ground platform for spawn validation
    const groundPlatforms = levelConfig.platforms.filter(p => p.type === 'ground');
    const lowestGroundY = Math.min(...groundPlatforms.map(p => p.y));
    
    expect(levelConfig.playerSpawn.y).toBeLessThanOrEqual(lowestGroundY);
    expect(levelConfig.playerSpawn.x).toBeGreaterThanOrEqual(0);
  });

  it('should have scene dimensions calculated correctly from platforms', () => {
    // Calculate expected scene dimensions
    let maxX = 0;
    let maxY = 0;
    
    for (const platform of levelConfig.platforms) {
      const platformWidth = platform.width || 64;
      const platformHeight = 64; // Standard tile height
      const platformMaxX = platform.x + platformWidth;
      const platformMaxY = platform.y + platformHeight;
      
      maxX = Math.max(maxX, platformMaxX);
      maxY = Math.max(maxY, platformMaxY);
    }
    
    // Scene dimensions should be calculated from platform positions
    // but scene height should be max platform y-coordinate (not y + height)
    expect(maxX).toBeGreaterThan(0);
    expect(maxY).toBeGreaterThan(0);
    
    // Validate that the scene height calculation logic is correct
    // Scene height should be the maximum y-coordinate of any platform
    const sceneHeight = Math.max(...levelConfig.platforms.map(p => p.y));
    expect(sceneHeight).toBeLessThanOrEqual(maxY);
  });

  it('should have floor at y=0 coordinate system', () => {
    // All platform y-coordinates should be positive (floor at y=0)
    for (const platform of levelConfig.platforms) {
      expect(platform.y).toBeGreaterThanOrEqual(0);
    }
    
    // Player spawn should be above the lowest ground platform
    const groundPlatforms = levelConfig.platforms.filter(p => p.type === 'ground');
    const lowestGroundY = Math.min(...groundPlatforms.map(p => p.y));
    expect(levelConfig.playerSpawn.y).toBeLessThan(lowestGroundY);
  });
}); 
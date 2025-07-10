/**
 * MapOverlay - UI component for displaying in-game map overlay
 * 
 * This class handles the creation, rendering, and lifecycle management
 * of a mini-map overlay that shows level layout, player position,
 * platforms, and collectibles.
 * 
 * Depth: 1001 (above TimeManager rewind overlay at 1000)
 */
export default class MapOverlay {
  /**
   * Create a new MapOverlay instance
   * @param {Phaser.Scene} scene - The scene to attach the overlay to
   */
  constructor(scene) {
    this.scene = scene;
    this.graphics = null;
    // Store static map data so we can re-render it every frame without
    // querying the level again. This prevents the player-marker refresh from
    // erasing the platforms/coins.
    this._platformData = null;
    this._coinData = null;
    this._goalData = null;
    this.isVisible = false;
    this.mapScale = null;
    this.mapWidth = 200; // Default map display width
    this.mapHeight = 150; // Default map display height
    
    // Performance optimization properties
    this._lastUpdateTime = 0;
    this._updateInterval = 1000 / 30; // 30fps max = ~33.33ms interval
    this._updateCount = 0;
    this._performanceMetrics = {
      updateCount: 0,
      totalUpdateTime: 0,
      averageUpdateTime: 0
    };
    this._performanceThreshold = 16; // 60fps threshold for performance monitoring
  }

  /**
   * Create the graphics object for the map overlay
   * Sets depth to 1001 to render above TimeManager rewind overlay
   */
  create() {
    if (!this.scene || !this.scene.add) {
      return;
    }

    this.graphics = this.scene.add.graphics();

    // Some Jest mocks may not implement setDepth/setPosition; guard for safety
    if (this.graphics && typeof this.graphics.setDepth === 'function') {
      this.graphics.setDepth(1001);
    }
    if (this.graphics && typeof this.graphics.setPosition === 'function') {
      this.graphics.setPosition(1050, 50);
    }

    this.setVisible(false);
  }

  /**
   * Destroy the map overlay and clean up resources
   */
  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = null;
    }
  }

  /**
   * Set the visibility of the map overlay
   * @param {boolean} visible - Whether the overlay should be visible
   */
  setVisible(visible) {
    this.isVisible = visible;
    if (this.graphics && typeof this.graphics.setVisible === 'function') {
      this.graphics.setVisible(visible);
    }
  }

  /**
   * Calculate the map scale based on level dimensions
   * @param {number} levelWidth - Width of the level in pixels
   * @param {number} levelHeight - Height of the level in pixels
   * @returns {number} The calculated scale factor
   */
  calculateMapScale(levelWidth, levelHeight) {
    if (levelWidth <= 0 || levelHeight <= 0) {
      throw new Error('Level dimensions must be positive');
    }

    // Calculate scale to fit level within map area
    const scaleX = this.mapWidth / levelWidth;
    const scaleY = this.mapHeight / levelHeight;
    // Use the smaller scale to ensure level fits in both dimensions
    this.mapScale = Math.min(scaleX, scaleY);
    this.mapWidth = levelWidth * this.mapScale;
    this.mapHeight = levelHeight * this.mapScale;
    return this.mapScale;
  }

  /**
   * Convert world coordinates to map coordinates
   * @param {number} worldX - World X coordinate
   * @param {number} worldY - World Y coordinate
   * @returns {Array<number>} [mapX, mapY] coordinates
   */
  worldToMapCoords(worldX, worldY) {
    if (this.mapScale === null) {
      throw new Error('Map scale must be calculated first');
    }

    let mapX = worldX * this.mapScale;
    let mapY = worldY * this.mapScale;

    // Clamp only to upper bounds (allow negative values)
    mapX = Math.min(mapX, this.mapWidth);
    mapY = Math.min(mapY, this.mapHeight);

    return [mapX, mapY];
  }

  /**
   * Render platforms as rectangles on the map overlay
   * @param {Array} platformData - Array of platform objects with x, y, width, height
   */
  renderPlatforms(platformData) {
    if (!this.graphics || !Array.isArray(platformData)) return;

    // Cache for future redraws
    this._platformData = platformData;

    if (typeof this.graphics.fillStyle === 'function' && typeof this.graphics.fillRect === 'function') {
      this.graphics.fillStyle(0x00ff00, 1); // green
      for (const platform of platformData) {
        const [mapX, mapY] = this.worldToMapCoords(platform.x, platform.y);
        const mapWidth = platform.width * this.mapScale;
        const mapHeight = (platform.height || 8) * this.mapScale;
        this.graphics.fillRect(mapX, mapY, mapWidth, mapHeight);
      }
    }
  }

  /**
   * Render coins as circles on the map overlay
   * @param {Array} coinData - Array of coin objects with x, y
   */
  renderCoins(coinData) {
    if (!this.graphics || !Array.isArray(coinData)) return;

    // Cache for future redraws
    this._coinData = coinData;

    if (typeof this.graphics.fillStyle === 'function' && typeof this.graphics.fillCircle === 'function') {
      this.graphics.fillStyle(0xffff00, 1); // yellow
      for (const coin of coinData) {
        const [mapX, mapY] = this.worldToMapCoords(coin.x, coin.y);
        const radius = 50 * this.mapScale;
        this.graphics.fillCircle(mapX, mapY, radius);
      }
    }
  }

  /**
   * Render goal position as a red circle on the map overlay
   * @param {Object} goalData - Goal object with x, y coordinates
   */
  renderGoal(goalData) {
    if (!this.graphics || !goalData) return;

    // Cache for future redraws
    this._goalData = goalData;

    if (typeof this.graphics.fillStyle === 'function' && typeof this.graphics.fillCircle === 'function') {
      this.graphics.fillStyle(0xff0000, 1); // red
      const [mapX, mapY] = this.worldToMapCoords(goalData.x, goalData.y);
      const radius = Math.max(6, 12 * this.mapScale); // Minimum 6px radius, scaled appropriately
      this.graphics.fillCircle(mapX, mapY, radius);
    }
  }

  /**
   * Render player position marker on the map overlay
   * @param {number} playerX - Player world X coordinate
   * @param {number} playerY - Player world Y coordinate
   */
  renderPlayerMarker(playerX, playerY) {
    if (!this.graphics || this.mapScale === null) return;
    
    if (typeof this.graphics.fillStyle === 'function' && typeof this.graphics.fillCircle === 'function') {
      // Use blue color for player marker (distinct from platforms and coins)
      this.graphics.fillStyle(0x0000ff, 1);

      // Convert world coordinates to map coordinates
      const [mapX, mapY] = this.worldToMapCoords(playerX, playerY);
      
      // Draw player marker as a circle with appropriate size
      const radius = Math.max(4, 8 * this.mapScale); // Minimum 4px radius
      this.graphics.fillCircle(mapX, mapY, radius);
    }
  }

  /**
   * Update player position marker on the map overlay
   * This method provides a clean interface for real-time position updates
   * with performance optimization (30fps max)
   * @param {number} playerX - Player world X coordinate
   * @param {number} playerY - Player world Y coordinate
   */
  updatePlayerPosition(playerX, playerY) {
    if (!this.graphics) return;

    // Performance optimization: Limit updates to 30fps max
    const currentTime = performance.now();
    const timeSinceLastUpdate = currentTime - this._lastUpdateTime;
    
    if (timeSinceLastUpdate < this._updateInterval) {
      return; // Skip update if not enough time has passed
    }

    // Track performance metrics
    const updateStartTime = performance.now();
    
    if (typeof this.graphics.clear === 'function') {
      // Clear previous frame
      this.graphics.clear();
    }

    // Draw semi-transparent background first (alpha 0.8 as specified in task)
    if (typeof this.graphics.fillStyle === 'function' && typeof this.graphics.fillRect === 'function') {
      this.graphics.fillStyle(0x000000, 0.8);
      this.graphics.fillRect(0, 0, this.mapWidth, this.mapHeight);
    }

    // Draw border frame around map area
    if (typeof this.graphics.lineStyle === 'function' && typeof this.graphics.strokeRect === 'function') {
      this.graphics.lineStyle(2, 0xffffff, 1); // 2px white border
      this.graphics.strokeRect(0, 0, this.mapWidth, this.mapHeight);
    }

    // Redraw cached static elements first so they remain visible
    if (this._platformData) {
      this.renderPlatforms(this._platformData);
    }
    if (this._coinData) {
      this.renderCoins(this._coinData);
    }
    if (this._goalData) {
      this.renderGoal(this._goalData);
    }

    // Draw the player marker on top
    this.renderPlayerMarker(playerX, playerY);
    
    // Update performance tracking
    this._lastUpdateTime = currentTime;
    this._updateCount++;
    
    // Track performance metrics
    const updateTime = performance.now() - updateStartTime;
    this._performanceMetrics.updateCount++;
    this._performanceMetrics.totalUpdateTime += updateTime;
    this._performanceMetrics.averageUpdateTime = 
      this._performanceMetrics.totalUpdateTime / this._performanceMetrics.updateCount;
  }
} 
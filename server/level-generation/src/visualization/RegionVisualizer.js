/**
 * @fileoverview Region Visualizer
 * Implements comprehensive region visualization and debugging system
 */

const GridUtilities = require('../core/GridUtilities');
const CaveVisualizer = require('./CaveVisualizer');

/**
 * RegionVisualizer provides comprehensive region visualization and debugging capabilities
 * for region detection, connectivity analysis, and corridor carving.
 */
class RegionVisualizer {
  /**
   * Visualizes regions with color coding and detailed analysis
   * 
   * @param {ndarray} grid - The original grid
   * @param {ndarray} labelGrid - The labeled grid from region detection
   * @param {Object} regionData - Region metadata from detection
   * @returns {Object} Visualization result with ASCII art and metadata
   * @throws {Error} If inputs are invalid
   */
  static visualizeRegions(grid, labelGrid, regionData) {
    if (!grid) throw new Error('Grid is required');
    if (!labelGrid) throw new Error('LabelGrid is required');
    if (!regionData) throw new Error('RegionData is required');

    const [width, height] = grid.shape;
    if (width === 0 || height === 0) {
      return {
        ascii: '',
        regionCount: 0,
        regionData: {},
        gridInfo: { width, height }
      };
    }

    // Generate ASCII art with region labels
    let ascii = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const v = labelGrid.get(x, y);
        if (v === 1) {
          ascii += '#'; // wall
        } else if (v === 0) {
          ascii += '.'; // unlabeled floor (shouldn't happen)
        } else {
          // Region label: A, B, C, etc.
          const regionIndex = v - 2; // v starts at 2 for regions
          const regionLabel = String.fromCharCode(65 + (regionIndex % 26)); // A-Z
          ascii += regionLabel;
        }
      }
      ascii += '\n';
    }

    return {
      ascii: ascii.trim(),
      regionCount: Object.keys(regionData).length,
      regionData: { ...regionData },
      gridInfo: { width, height }
    };
  }

  /**
   * Visualizes connectivity with corridor highlighting and analysis
   * 
   * @param {ndarray} grid - The original grid
   * @param {ndarray} labelGrid - The labeled grid
   * @param {Object} regionData - Region metadata
   * @param {Object} connectivityResult - Connectivity validation result
   * @returns {Object} Connectivity visualization with analysis
   */
  static visualizeConnectivity(grid, labelGrid, regionData, connectivityResult) {
    if (!grid || !labelGrid || !regionData || !connectivityResult) {
      throw new Error('All parameters are required');
    }

    // Generate basic region visualization
    const regionViz = this.visualizeRegions(grid, labelGrid, regionData);

    return {
      ascii: regionViz.ascii,
      connectivityInfo: {
        isConnected: connectivityResult.isConnected,
        regionCount: connectivityResult.regionCount,
        connectivityScore: connectivityResult.connectivityScore || 0
      },
      regionInfo: {
        regionCount: regionViz.regionCount,
        regionData: regionViz.regionData
      },
      gridInfo: regionViz.gridInfo
    };
  }

  /**
   * Visualizes corridors between regions
   * 
   * @param {ndarray} originalGrid - The original grid before corridor carving
   * @param {ndarray} modifiedGrid - The grid after corridor carving
   * @param {Object} corridorInfo - Information about carved corridors
   * @returns {Object} Corridor visualization with analysis
   */
  static visualizeCorridors(originalGrid, modifiedGrid, corridorInfo) {
    if (!originalGrid || !modifiedGrid || !corridorInfo) {
      throw new Error('All parameters are required');
    }

    const [width, height] = originalGrid.shape;
    let ascii = '';

    // Create visualization showing corridors
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const original = originalGrid.get(x, y);
        const modified = modifiedGrid.get(x, y);

        if (original === 1 && modified === 0) {
          ascii += 'C'; // Corridor carved through wall
        } else if (modified === 1) {
          ascii += '#'; // Wall
        } else if (modified === 0) {
          ascii += '.'; // Floor
        } else {
          ascii += '?'; // Unknown
        }
      }
      ascii += '\n';
    }

    return {
      ascii: ascii.trim(),
      corridorInfo: {
        corridorCount: corridorInfo.corridors ? corridorInfo.corridors.length : 0,
        connectionPoints: corridorInfo.connectionPoints ? corridorInfo.connectionPoints.length : 0,
        corridors: corridorInfo.corridors || [],
        connectionPoints: corridorInfo.connectionPoints || []
      },
      gridInfo: { width, height }
    };
  }

  /**
   * Generates comprehensive debug report
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {ndarray} labelGrid - The labeled grid
   * @param {Object} regionData - Region metadata
   * @param {Object} connectivityResult - Connectivity validation result
   * @returns {Object} Comprehensive debug report
   */
  static generateDebugReport(grid, labelGrid, regionData, connectivityResult) {
    if (!grid || !labelGrid || !regionData || !connectivityResult) {
      throw new Error('All parameters are required');
    }

    const [width, height] = grid.shape;
    const totalTiles = width * height;
    const floorTiles = GridUtilities.countValue(grid, 0);
    const wallTiles = GridUtilities.countValue(grid, 1);

    // Generate visualizations
    const regionViz = this.visualizeRegions(grid, labelGrid, regionData);
    const connectivityViz = this.visualizeConnectivity(grid, labelGrid, regionData, connectivityResult);

    // Calculate metrics
    const regionCount = Object.keys(regionData).length;
    const largestRegion = regionCount > 0 ? Math.max(...Object.values(regionData).map(r => r.area)) : 0;
    const averageRegionSize = regionCount > 0 ? floorTiles / regionCount : 0;

    const report = {
      gridInfo: {
        width,
        height,
        totalTiles,
        floorTiles,
        wallTiles,
        floorRatio: totalTiles > 0 ? floorTiles / totalTiles : 0
      },
      regionInfo: {
        regionCount,
        largestRegion,
        averageRegionSize,
        regionData: { ...regionData }
      },
      connectivityInfo: {
        isConnected: connectivityResult.isConnected,
        regionCount: connectivityResult.regionCount,
        connectivityScore: connectivityResult.connectivityScore || 0
      },
      visualization: {
        regionAscii: regionViz.ascii,
        connectivityAscii: connectivityViz.ascii
      },
      recommendations: this.generateRecommendations(grid, labelGrid, regionData, connectivityResult)
    };

    // Include performance metrics if available
    if (connectivityResult.performance) {
      report.performance = { ...connectivityResult.performance };
    }

    return report;
  }

  /**
   * Generates step-by-step analysis for debugging
   * 
   * @param {ndarray} grid - The grid to analyze
   * @returns {Array} Array of analysis steps
   */
  static generateStepByStepAnalysis(grid) {
    if (!grid) throw new Error('Grid is required');

    const steps = [];

    // Step 1: Grid analysis
    const [width, height] = grid.shape;
    const floorTiles = GridUtilities.countValue(grid, 0);
    const wallTiles = GridUtilities.countValue(grid, 1);

    steps.push({
      step: 1,
      description: 'Grid Analysis',
      visualization: CaveVisualizer.toAsciiArt(grid),
      metrics: {
        width,
        height,
        floorTiles,
        wallTiles,
        floorRatio: (width * height) > 0 ? floorTiles / (width * height) : 0
      }
    });

    // Step 2: Region detection
    const RegionDetector = require('../analysis/RegionDetector');
    const { labelGrid, regionData } = RegionDetector.detectRegions(grid);
    const regionViz = this.visualizeRegions(grid, labelGrid, regionData);

    steps.push({
      step: 2,
      description: 'Region Detection',
      visualization: regionViz.ascii,
      metrics: {
        regionCount: regionViz.regionCount,
        regionData: regionViz.regionData
      }
    });

    // Step 3: Connectivity analysis
    const { ConnectivityValidator } = require('../validation/ConnectivityValidator');
    const validator = new ConnectivityValidator();
    const connectivityResult = validator.validateConnectivity(grid);

    steps.push({
      step: 3,
      description: 'Connectivity Analysis',
      visualization: regionViz.ascii, // Reuse region visualization
      metrics: {
        isConnected: connectivityResult.isConnected,
        regionCount: connectivityResult.regionCount,
        connectivityScore: connectivityResult.connectivityScore
      }
    });

    return steps;
  }

  /**
   * Generates recommendations for improving cave connectivity
   * 
   * @param {ndarray} grid - The grid to analyze
   * @param {ndarray} labelGrid - The labeled grid
   * @param {Object} regionData - Region metadata
   * @param {Object} connectivityResult - Connectivity validation result
   * @returns {Array} Array of recommendations
   */
  static generateRecommendations(grid, labelGrid, regionData, connectivityResult) {
    if (!grid || !labelGrid || !regionData || !connectivityResult) {
      throw new Error('All parameters are required');
    }

    const recommendations = [];
    const regionCount = Object.keys(regionData).length;

    // Check for disconnected regions
    if (!connectivityResult.isConnected && regionCount > 1) {
      recommendations.push({
        type: 'connectivity',
        priority: 'high',
        description: 'Multiple disconnected regions detected. Consider corridor carving to connect regions.',
        action: 'Apply corridor carving algorithm'
      });
    }

    // Check for small regions
    const smallRegions = Object.values(regionData).filter(r => r.area < 10);
    if (smallRegions.length > 0) {
      recommendations.push({
        type: 'region_size',
        priority: 'medium',
        description: `${smallRegions.length} small regions detected. Consider culling small regions.`,
        action: 'Apply region culling with minimum size threshold'
      });
    }

    // Check for low connectivity score
    if (connectivityResult.connectivityScore < 0.5) {
      recommendations.push({
        type: 'connectivity_score',
        priority: 'medium',
        description: 'Low connectivity score detected. Consider adjusting cellular automata parameters.',
        action: 'Adjust birth/survival thresholds for better connectivity'
      });
    }

    // Check for excessive wall density
    const [width, height] = grid.shape;
    const totalTiles = width * height;
    const wallTiles = GridUtilities.countValue(grid, 1);
    const wallRatio = totalTiles > 0 ? wallTiles / totalTiles : 0;

    if (wallRatio > 0.7) {
      recommendations.push({
        type: 'wall_density',
        priority: 'low',
        description: 'High wall density detected. Consider reducing initial wall ratio.',
        action: 'Reduce initialWallRatio parameter'
      });
    }

    return recommendations;
  }

  /**
   * Generates ASCII art for a grid with custom mapping
   * 
   * @param {ndarray} grid - The grid to visualize
   * @param {Object} options - Visualization options
   * @returns {string} ASCII art string
   */
  static toAsciiArt(grid, options = {}) {
    return CaveVisualizer.toAsciiArt(grid, options);
  }
}

module.exports = RegionVisualizer; 
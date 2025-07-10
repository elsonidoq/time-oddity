class CaveVisualizer {
  /**
   * Converts a grid to ASCII art for visual inspection
   * @param {ndarray} grid - The grid to visualize
   * @param {Object} options - Optional: { mapping: { [value]: char } }
   * @returns {string} ASCII art string (rows separated by newlines)
   */
  static toAsciiArt(grid, options = {}) {
    if (!grid) throw new Error('Grid is required');
    const [width, height] = grid.shape;
    if (width === 0 || height === 0) return '';
    const mapping = options.mapping || { 0: '.', 1: '#' };
    let lines = [];
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const v = grid.get(x, y);
        line += mapping.hasOwnProperty(v) ? mapping[v] : String(v);
      }
      lines.push(line);
    }
    return lines.join('\n');
  }

  /**
   * Renders a sequence of grids as ASCII art frames (for CA progress)
   * @param {ndarray[]} grids - Array of grids
   * @param {Object} options - Passed to toAsciiArt
   * @returns {string[]} Array of ASCII art frames
   */
  static progressAsciiArt(grids, options = {}) {
    if (!Array.isArray(grids)) throw new Error('grids must be an array');
    return grids.map(grid => this.toAsciiArt(grid, options));
  }

  /**
   * (Optional) Converts a grid to an image (PNG or other). Not implemented.
   * @param {ndarray} grid
   * @param {Object} options
   */
  static toImage(grid, options = {}) {
    throw new Error('Image export not implemented in CaveVisualizer');
  }
}

module.exports = CaveVisualizer; 
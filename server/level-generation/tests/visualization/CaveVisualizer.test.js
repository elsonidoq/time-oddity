const CaveVisualizer = require('../../src/visualization/CaveVisualizer');
const ndarray = require('ndarray');

describe('CaveVisualizer', () => {
  describe('toAsciiArt', () => {
    it('should render a 3x3 grid with default mapping', () => {
      const grid = ndarray(new Uint8Array([
        0, 1, 0,
        1, 0, 1,
        0, 1, 0
      ]), [3, 3]);
      const ascii = CaveVisualizer.toAsciiArt(grid);
      expect(ascii).toBe(
        '.#.' + '\n' +
        '#.#' + '\n' +
        '.#.'
      );
    });

    it('should support custom character mapping', () => {
      const grid = ndarray(new Uint8Array([
        0, 1, 2,
        1, 0, 1,
        2, 1, 0
      ]), [3, 3]);
      const ascii = CaveVisualizer.toAsciiArt(grid, { mapping: { 0: ' ', 1: 'X', 2: '*' } });
      expect(ascii).toBe(
        ' X*' + '\n' +
        'X X' + '\n' +
        '*X '
      );
    });

    it('should handle empty grid', () => {
      const grid = ndarray(new Uint8Array([]), [0, 0]);
      expect(CaveVisualizer.toAsciiArt(grid)).toBe('');
    });

    it('should throw on null/undefined grid', () => {
      expect(() => CaveVisualizer.toAsciiArt(null)).toThrow();
      expect(() => CaveVisualizer.toAsciiArt(undefined)).toThrow();
    });
  });

  describe('progressAsciiArt', () => {
    it('should render a sequence of ASCII frames for CA progress', () => {
      const grids = [
        ndarray(new Uint8Array([0, 1]), [2, 1]),
        ndarray(new Uint8Array([1, 0]), [2, 1])
      ];
      const frames = CaveVisualizer.progressAsciiArt(grids);
      expect(frames).toEqual(['.#', '#.']);
    });
  });

  describe('toImage', () => {
    it('should return a stub or throw if image export is not implemented', () => {
      const grid = ndarray(new Uint8Array([0, 1, 0, 1]), [2, 2]);
      expect(() => CaveVisualizer.toImage(grid)).toThrow();
    });
  });

  describe('performance', () => {
    it('should render a 40x40 grid quickly', () => {
      const size = 40;
      const data = new Uint8Array(size * size);
      for (let i = 0; i < data.length; i++) data[i] = i % 2;
      const grid = ndarray(data, [size, size]);
      const start = Date.now();
      const ascii = CaveVisualizer.toAsciiArt(grid);
      const duration = Date.now() - start;
      expect(ascii.split('\n').length).toBe(size);
      expect(duration).toBeLessThan(100); // Should be fast
    });
  });
}); 
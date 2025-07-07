const ndarray = require('ndarray');
const PathfindingIntegration = require('./src/pathfinding/PathfindingIntegration');

const size = 60;
const data = new Uint8Array(size * size);
// Fill with walls
for (let i = 0; i < size * size; i++) data[i] = 1;
// Carve vertical corridor from (1,1) to (1,58)
for (let y = 1; y < size - 1; y++) data[y * size + 1] = 0;
// Carve horizontal corridor from (1,58) to (58,58)
for (let x = 1; x < size - 1; x++) data[(size - 2) * size + x] = 0;

const grid = ndarray(data, [size, size]);
const pf = new PathfindingIntegration();
const start = { x: 1, y: 1 };
const end = { x: size - 2, y: size - 2 };
const path = pf.findPath(grid, start, end);

let out = '';
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    if (x === start.x && y === start.y) {
      out += 'S';
    } else if (x === end.x && y === end.y) {
      out += 'E';
    } else if (path.some(([px, py]) => px === x && py === y)) {
      out += '*';
    } else {
      out += grid.get(x, y) === 1 ? '#' : ' ';
    }
  }
  out += '\n';
}
console.log(out); 
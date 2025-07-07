# Level Generation System

A procedural cave generation system for the Time Oddity game, built with Node.js and following strict TDD methodology.

## Features

- **Deterministic Generation**: Same seed produces identical levels
- **High Performance**: Uses optimized data structures and algorithms
- **Modular Architecture**: Clean separation of concerns
- **Comprehensive Testing**: Full test coverage with TDD approach
- **CLI Interface**: Easy-to-use command-line tools

## Technology Stack

- **ndarray@1.0.19**: High-performance grid data structure
- **seedrandom@3.0.5**: Deterministic random number generation
- **flood-fill@1.0.0**: Region detection and labeling
- **pathfinding@0.4.2**: A* pathfinding for solvability validation
- **commander**: CLI framework

## Installation

```bash
cd server/level-generation
npm install
```

## Usage

### Command Line Interface

```bash
# Generate a level with default parameters
npm start generate

# Generate a level with custom parameters
npm start generate --seed my-seed --width 100 --height 60 --output level.json

# Run tests
npm test
```

### Programmatic Usage

```javascript
const { generateLevel } = require('./src');

const config = {
  seed: 'my-seed',
  width: 100,
  height: 60,
  // ... other parameters
};

const level = generateLevel(config);
```

## Project Structure

```
server/level-generation/
├── src/
│   ├── core/           # Grid utilities, random generation
│   ├── validation/     # Parameter validation, error handling
│   ├── cli/           # Command-line interface
│   ├── monitoring/    # Performance monitoring, logging
│   └── index.js       # Main entry point
├── tests/
│   ├── core/          # Core module tests
│   ├── validation/    # Validation module tests
│   ├── cli/          # CLI module tests
│   ├── monitoring/   # Monitoring module tests
│   └── setup.js      # Test configuration
├── package.json       # Dependencies and scripts
├── jest.config.js     # Jest configuration
├── cli.js            # CLI entry point
└── README.md         # This file
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Architecture

The system follows a 9-step pipeline for cave generation:

1. **Initial Grid Seeding**: Create random noise
2. **Cellular Automata**: Smooth and form cave structures
3. **Region Identification**: Find connected components
4. **Culling**: Remove small regions
5. **Start/Goal Placement**: Position player and exit
6. **Solvability Validation**: Ensure level is playable
7. **Coin Placement**: Add collectibles
8. **Enemy Placement**: Add challenges
9. **JSON Export**: Convert to game format

## Contributing

This project follows strict Test-Driven Development (TDD) methodology:

1. Write failing tests first
2. Implement minimal code to pass tests
3. Refactor while maintaining test coverage

All new features must include comprehensive tests.

## License

MIT License - see LICENSE file for details. 
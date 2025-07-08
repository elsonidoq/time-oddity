# Testing Anti-Patterns: Avoiding phaserMock in Level Generation Tests

## Overview

This document defines critical anti-patterns that must be avoided when testing the level generation system. The primary goal is to maintain clear boundaries between client-side game engine testing and server-side data processing testing.

## The phaserMock ES/CommonJS Problem

### Problem Description

The `phaserMock` is designed for client-side game engine testing and uses ES modules (ESM) syntax. When imported into server-side level generation tests, it creates a module system conflict:

- **Server-side tests** use CommonJS (`require()`) for scientific JS ecosystem libraries
- **phaserMock** uses ES modules (`import/export`) for browser compatibility
- **Conflict**: Mixing ESM and CommonJS in the same test file causes runtime errors

### Error Manifestation

```javascript
// ❌ ANTI-PATTERN: This will cause module system conflicts
const phaserMock = require('../../tests/mocks/phaserMock'); // CommonJS
import { phaserMock } from '../../tests/mocks/phaserMock'; // ESM

// Error: Cannot use import statement outside a module
// Error: Cannot use require() in ES module
```

### Root Cause Analysis

1. **Module System Mismatch**: Server-side level generation uses CommonJS for scientific JS libraries (ndarray, seedrandom, pathfinding)
2. **Browser Dependencies**: phaserMock contains browser-specific APIs (window, document, DOM manipulation)
3. **Architectural Boundary Violation**: Level generation is pure data processing, not game engine logic

## Critical Anti-Patterns

### ❌ NEVER DO: Import phaserMock in Server-Side Tests

```javascript
// ❌ ANTI-PATTERN: Server-side test importing client-side mock
const phaserMock = require('../../tests/mocks/phaserMock'); // WRONG

describe('CellularAutomata', () => {
  test('should generate cave structure', () => {
    // This test should focus on data processing, not game engine
    const grid = testUtils.createMockGrid(10, 10);
    // ... test logic
  });
});
```

### ❌ NEVER DO: Use Game Engine Dependencies for Data Processing

```javascript
// ❌ ANTI-PATTERN: Testing data processing with game engine mocks
const scene = new phaserMock(); // WRONG - game engine dependency

describe('GridUtilities', () => {
  test('should calculate grid dimensions', () => {
    // This should test pure data processing, not game engine integration
    const grid = testUtils.createMockGrid(5, 5);
    // ... test logic
  });
});
```

### ❌ NEVER DO: Mix ESM and CommonJS Patterns

```javascript
// ❌ ANTI-PATTERN: Mixed module systems
const ndarray = require('ndarray'); // CommonJS
import { phaserMock } from './phaserMock'; // ESM - CONFLICT!

// This will cause runtime errors
```

### ❌ NEVER DO: Test Level Generation with Game Engine State

```javascript
// ❌ ANTI-PATTERN: Testing data processing with game state
const gameScene = new phaserMock();
gameScene.physics.add.group(); // Game engine state

describe('LevelGenerator', () => {
  test('should generate level', () => {
    // Level generation is stateless data processing
    // Should not depend on game engine state
  });
});
```

## Proper Boundaries

### Client-Side Testing Domain

**Purpose**: Test game engine integration, rendering, physics, user interaction

**Appropriate Mocks**:
- `phaserMock` - Game engine simulation
- `gsapMock` - Animation library simulation
- `howlerMock` - Audio library simulation

**Test Types**:
- Game scene initialization
- Entity rendering and animation
- User input handling
- Physics interactions
- Audio playback

**Location**: `client/src/` and `tests/integration/`

### Server-Side Testing Domain

**Purpose**: Test data processing, algorithms, mathematical operations

**Appropriate Utilities**:
- `testUtils.createMockGrid()` - ndarray grid creation
- `testUtils.createSeededRandom()` - Deterministic RNG
- `testUtils.createPathfindingGrid()` - Pathfinding grid creation

**Test Types**:
- Cellular automata algorithms
- Pathfinding and reachability analysis
- Grid manipulation and analysis
- Random number generation
- Data serialization

**Location**: `server/level-generation/tests/`

## Architectural Principles

### 1. Separation of Concerns

- **Client**: Game engine integration, rendering, user interaction
- **Server**: Data processing, algorithms, mathematical operations

### 2. Module System Consistency

- **Client**: ES modules for browser compatibility
- **Server**: CommonJS for Node.js scientific ecosystem

### 3. State Management

- **Client**: Stateful game engine objects, scene management
- **Server**: Stateless data processing, pure functions

### 4. Testing Strategy

- **Client**: Integration tests with game engine mocks
- **Server**: Unit tests with scientific JS ecosystem utilities

## Validation Checklist

Before writing any test, verify:

- [ ] **Module System**: Using appropriate module system (CommonJS for server, ESM for client)
- [ ] **Dependencies**: Only importing appropriate dependencies for the domain
- [ ] **State Management**: Testing stateless data processing vs. stateful game logic
- [ ] **Architecture**: Respecting client/server boundaries
- [ ] **Utilities**: Using domain-appropriate test utilities

## Enforcement Guidelines

### For Engineer LLMs

1. **Always check the test location** before importing mocks
2. **Use server test utilities** for level generation tests
3. **Avoid game engine dependencies** in data processing tests
4. **Maintain module system consistency** within each test file
5. **Follow architectural boundaries** between client and server domains

### For Code Review

1. **Reject any server test** that imports phaserMock
2. **Reject any mixed module systems** in test files
3. **Ensure proper test isolation** between client and server domains
4. **Verify appropriate test utilities** are being used
5. **Maintain architectural boundaries** in all test implementations

## Success Metrics

- [ ] No phaserMock imports in server-side tests
- [ ] Clear separation between client and server testing domains
- [ ] Consistent module system usage within each domain
- [ ] Proper test isolation and determinism
- [ ] Architectural boundaries respected in all test implementations

---

This document serves as the definitive guide for avoiding the phaserMock anti-pattern and maintaining proper testing boundaries in the Time Oddity level generation system. 
# Implementation Lessons Learned and Critical Behaviors

This document captures critical lessons learned during implementation and behaviors that must be understood for future development.

## Critical Implementation Findings

### 1. Grid Coordinate System and Visualization

**Issue Encountered**: Grid visualization can be misleading and cause coordinate interpretation errors.

**Problem**: During dead-end detection implementation, the grid appeared transposed, leading to incorrect coordinate interpretation. The test expected dead-ends at positions (0,5), (9,5), and (8,5), but (0,5) and (9,5) were actually walls, not floor tiles.

**Root Cause**: Grid visualization can make the coordinate system appear transposed, but the actual ndarray storage uses (x, y) where x is horizontal (columns) and y is vertical (rows).

**Solution**: Always verify coordinate interpretation when working with grid-based algorithms. Use the actual grid values to confirm tile types rather than relying solely on visualization.

**Invariant**: **COORD-3**: When visualizing grids, verify coordinate interpretation - grids may appear transposed

### 2. Dead-End Detection Logic

**Issue Encountered**: Dead-end detection logic incorrectly identified wall tiles as dead-ends.

**Problem**: The original dead-end detection logic didn't properly distinguish between floor tiles (value 0) and wall tiles (value 1).

**Root Cause**: Dead-end detection must only consider floor tiles (value 0) as potential dead-ends. Wall tiles (value 1) can never be dead-ends.

**Solution**: Implement proper tile type checking in dead-end detection algorithms.

**Invariant**: **COORD-5**: Wall tiles (value 1) are NEVER dead-ends - only floor tiles (value 0) can be dead-ends

### 3. Physics-Aware Reachability Analysis for Platform Placement

**Critical Finding**: `PhysicsAwareReachabilityAnalyzer.detectReachablePositionsFromStartingPoint()` is the PRIMARY tool for platform placement decisions.

**Behavior**: This method analyzes all positions reachable from a starting point considering physics constraints (jump distance, gravity, solid ground requirements).

**Key Parameters**:
- `maxMoves = null`: Explores ALL reachable positions without move count limits
- `maxMoves = number`: Limits exploration to positions reachable within that many moves

**Platform Placement Workflow**:
1. Place coins in strategic locations (dead-ends, exploration areas)
2. Use `detectReachablePositionsFromStartingPoint(playerSpawn, null)` to find ALL reachable areas
3. Compare coin positions with reachable areas to identify unreachable coins
4. Place floating/moving platforms to bridge gaps to unreachable coins
5. Verify all coins are now reachable after platform placement

**Invariant**: **COORD-6**: Physics-aware reachability analysis MUST be used for platform placement decisions

## Implementation Guidelines

### For Platform Placement Tasks:
1. Use `detectReachablePositionsFromStartingPoint(playerSpawn, null)` to find reachable areas
2. Compare with coin positions to identify unreachable coins
3. Place platforms to bridge gaps to unreachable coins
4. Validate that all coins are now reachable

### For Grid-Based Algorithms:
1. Verify coordinate interpretation before implementing
2. Test with known grid configurations
3. Distinguish between floor tiles (0) and wall tiles (1)
4. Document coordinate system assumptions

### For Testing:
1. Use small, known grid configurations for testing
2. Verify coordinate interpretation in test cases
3. Test both floor tiles and wall tiles appropriately
4. Validate reachability analysis results

---

This document serves as a critical reference for future development to prevent similar issues and ensure proper implementation of grid-based algorithms and platform placement systems. 
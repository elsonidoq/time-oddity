## 7. System Invariants

### 7.1 Data Flow Invariants

- **FLOW-1**: Grid objects are passed by reference to avoid copying
- **FLOW-2**: Each pipeline step validates its inputs
- **FLOW-3**: Error conditions propagate up the call stack
- **FLOW-4**: Memory is managed efficiently throughout pipeline
- **FLOW-5**: Deterministic behavior is maintained across all steps

### 7.2 State Management Invariants

- **STATE-1**: RNG state is isolated per instance
- **STATE-2**: Grid modifications are controlled and validated
- **STATE-3**: Configuration objects are immutable after validation
- **STATE-4**: Performance metrics are accumulated correctly
- **STATE-5**: Log state is preserved across operations

### 7.3 Thread Safety Invariants

- **THREAD-1**: All components are stateless where possible
- **THREAD-2**: Shared state is properly synchronized
- **THREAD-3**: RNG instances are thread-local
- **THREAD-4**: Grid operations are atomic
- **THREAD-5**: Error handling is thread-safe

### 7.4 Memory Management Invariants

- **MEMORY-1**: Large grids use TypedArray for efficiency
- **MEMORY-2**: Views are used instead of copies where possible
- **MEMORY-3**: Memory leaks are prevented through proper cleanup
- **MEMORY-4**: Grid dimensions are validated before allocation
- **MEMORY-5**: Memory usage is monitored and reported

### 7.5 Coordinate System and Grid Analysis Invariants

- **COORD-1**: Grid coordinates use (x, y) where x is horizontal (columns) and y is vertical (rows)
- **COORD-2**: Grid is stored as ndarray with shape [width, height] where width = columns, height = rows
- **COORD-3**: When visualizing grids, verify coordinate interpretation - grids may appear transposed
- **COORD-4**: Dead-end detection must check for floor tiles (value 0) with walls (value 1) on multiple sides
- **COORD-5**: Wall tiles (value 1) are NEVER dead-ends - only floor tiles (value 0) can be dead-ends
- **COORD-6**: Physics-aware reachability analysis MUST be used for platform placement decisions
- **COORD-7**: Platform placement MUST follow the sequence: coins → reachability analysis → platform placement → validation

**LESSONS LEARNED**:
- **L-1**: Grid visualization can be misleading - always verify coordinate interpretation
- **L-2**: Dead-end detection logic must distinguish between floor tiles (0) and wall tiles (1)
- **L-3**: PhysicsAwareReachabilityAnalyzer.detectReachablePositionsFromStartingPoint() is the PRIMARY tool for platform placement
- **L-4**: Platform placement must be based on actual reachability analysis, not assumptions
- **L-5**: Coordinate system consistency is critical for all grid-based algorithms

---

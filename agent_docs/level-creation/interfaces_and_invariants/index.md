# Level Creation Interfaces and Invariants

This document defines all interfaces, invariants, and contracts for the Time Oddity cave generation system. It serves as the authoritative reference for all implemented functionality and must be updated whenever new components are added or existing ones are modified.

## Table of Contents

1. [Core System Interfaces](01_core_system_interfaces.md) - RandomGenerator and GridUtilities interfaces for foundational operations
2. [Generation Pipeline Interfaces](02_generation_pipeline_interfaces.md) - GridSeeder and CellularAutomata for cave generation algorithms
3. [Analysis and Validation Interfaces](03_analysis_and_validation_interfaces.md) - Region detection, corridor carving, quality validation, physics-aware reachability analysis, and comprehensive solvability testing systems
4. [Placement and Pathfinding Interfaces](04_placement_and_pathfinding_interfaces.md) - Player spawn, goal placement, A* pathfinding integration, and platform placement system
5. [Visualization and Monitoring Interfaces](05_visualization_and_monitoring_interfaces.md) - ASCII visualization, performance monitoring, and logging systems
6. [CLI and Integration Interfaces](06_cli_and_integration_interfaces.md) - Command-line interface and integration contracts
7. [System Invariants](07_system_invariants.md) - Data flow, state management, thread safety, memory management, and coordinate system invariants
8. [Performance and Error Handling Contracts](08_contracts.md) - Time/space complexity, performance benchmarks, error handling, and integration contracts
9. [Implementation Lessons Learned](09_implementation_lessons_learned.md) - Critical lessons learned during implementation and behaviors for future development

## Testing Documentation

10. [Testing Anti-Patterns](testing_antipatterns.md) - Critical anti-patterns to avoid when testing level generation, including the phaserMock ES/CommonJS problem
11. [Server Testing Patterns](server_testing_patterns.md) - Proper testing patterns and utilities for server-side level generation tests
12. [Test Examples](test_examples.md) - Concrete examples of proper level generation tests for each pipeline step

---

This document serves as the definitive reference for all interfaces, invariants, and contracts in the Time Oddity cave generation system. Any changes to the system must be reflected in this document to maintain consistency and reliability.
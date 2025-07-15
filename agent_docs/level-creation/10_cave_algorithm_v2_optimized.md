## Context

You are contributing to the **Time Oddity** project, a Phaser 3 platformer featuring time manipulation mechanics. The codebase follows **strict architectural and testing standards**. All contributions must adhere to these patterns.

## Prerequisite Documentation (MANDATORY)

Before coding, review the following:

1. `@testing_best_practices.md`, `@server_testing_patterns.md`, `@test_examples.md`, `@testing_antipatterns.md` — Testing strategy, TDD/BDD, and LLM development workflows.
2. `@level-format.md` — JSON structure for level definitions.
3. `@04_comprehensive_documentation.md` — Complete tech stack and architectural patterns for level creation.
4. `@/interfaces_and_invariants`  — Invariants and interfaces to preserve. Maintain this file as you implement. Use `@index.md` as a TOC.

## Task

### Implement a new class: `GraphGridSeeder`

This class must:

- Accept `corridor_height`, `corridor_threshold`, `non_corridor_threshold` as constructor parameters.
- Implement all methods required to be a **drop-in replacement** for `GridSeeder`.
- Follow the architecture and method signatures established in the reference class.

### Implement the algorithm `_fillWithGraphNoise(grid, corridor_height, corridor_threshold, non_corridor_threshold, rng)`

#### Step 1: Build a threshold matrix

- Initialize a matrix `thresholds`, same shape as `grid`, filled with `non_corridor_threshold`.
- Randomly select `N_REGIONS` ∈ {2, 3, 4, 5}.
- Choose `MAIN_POINTS`: N_REGIONS points distributed across the grid, biased toward edges.
- For each point `P` in `MAIN_POINTS`:
  - Select a random `K` ∈ {1, 2}
  - Find `K` closest points in `MAIN_POINTS` to `P` (Euclidean distance)
  - For each closest point `Q`, interpolate a corridor between `P` and `Q` using:
    - Linear interpolation: `P*α + Q*(1-α)`
    - Offset each interpolated point by `<0, d>` for `d` in `[0, corridor_height)`
  - Round each interpolated coordinate using both `floor()` and `ceil()` to find affected grid indices
  - For all affected indices: set `thresholds[i][j] = corridor_threshold`

#### Step 2: Sample wall placement

- For each tile `(i, j)` in `grid`:
  - Set `grid[i][j] = rng.uniform(0, 1) > thresholds[i][j]`
- Return the modified `grid`.

### Code Integration

- Modify `generate-70x70-level-with-json.js` to use `GraphGridSeeder` instead of `GridSeeder`.

## Constraints

### Testing Requirements

- Follow **STRICT TDD**, as defined in the docs.
- **Avoid nested loops** that iterate pixel-by-pixel over the grid.
- Ensure all **unit tests are fast and isolated** (use mocks as needed).
- Write **integration tests** for class interaction when appropriate.
- All tests must **pass** and **run quickly** before finalizing the task.

### Architectural Requirements

- Maintain **decoupling** from Phaser engine internals.
- Respect established patterns in the documentation.
- **Update documentation** to reflect new states and invariants.
- Preserve **event contracts** and runtime naming.
- Ensure compatibility with **existing test utilities and mocks**.

## Implementation Instructions

- Read and understand all relevant documents before coding.
- Write a clear **implementation plan**:
  - Identify abstractions, helper functions, invariants, and edge cases.
- Implement using a TDD approach, executing the full solution without further input.
- If any spec is ambiguous or incomplete, pause and **request clarification**.
- If a test fails 3 times or you encounter architectural conflicts, **halt and report**.

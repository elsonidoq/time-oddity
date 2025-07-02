# Task 05: Level Generation Algorithm

> **Create procedural level generation script with difficulty parameter outputting valid JSON level configurations**

---

## Task Title
Procedural Level Generation Algorithm with Difficulty Scaling

## Objective
Develop a standalone Node.js script that procedurally generates Time Oddity levels with configurable difficulty. The algorithm should create engaging, playable levels with varied platform layouts, collectible placements, and movement patterns while ensuring all areas are reachable and following the established level JSON schema.

## Task ID: 
Task 05.01 - 05.06

## Pre-Implementation Analysis

### Documentation Dependencies
- [ ] **invariants.md sections to review**: §13 "Physics Configuration Order" (platform creation), §9 "ChronoPulse Ability" (jump distance constraints), §4 "Player State Machine" (movement capabilities)
- [ ] **testing_best_practices.md sections to apply**: "Algorithm Testing", "JSON Schema Validation", "Randomized Testing"
- [ ] **small_comprehensive_documentation.md sections to reference**: Level JSON format, available tiles catalog, SceneFactory patterns

### State & Invariant Impact Assessment  
- [ ] **Existing states to preserve**: Level JSON schema compliance, SceneFactory compatibility, tile asset references
- [ ] **New states/invariants to create**: Generation algorithm parameters, difficulty scaling rules, reachability validation
- [ ] **Time reversal compatibility**: Generated levels must work with existing TimeManager system (no special considerations)

## Implementation Plan

### Files/Classes to Change
- **Create**: 
  - `tools/level-generator/generate-level.js` (main generation script)
  - `tools/level-generator/LevelGenerator.js` (core algorithm class)
  - `tools/level-generator/DifficultyConfig.js` (difficulty scaling parameters)
  - `tools/level-generator/ReachabilityValidator.js` (ensure level is completable)
  - `generated-levels/` (output directory for generated levels)
- **Modify**: 
  - `package.json` (add level generation script command)
  - `agent_docs/level-creation/available_tiles.md` (if new tile usage patterns discovered)
- **Delete**: None

### Integration Points
- **Systems affected**: Level JSON schema, SceneFactory loading system, available tiles catalog
- **State machines**: No direct state machine integration (standalone tool)
- **External libraries**: Node.js fs/path modules, potentially command-line argument parsing

### Testing Strategy
- **Test files to create/update**:
  - `tests/tools/level-generator.test.js` (algorithm testing)
  - `tests/tools/difficulty-scaling.test.js` (difficulty parameter validation)
  - `tests/tools/reachability-validator.test.js` (level completability)
  - `tests/tools/json-schema-compliance.test.js` (output format validation)
- **Key test cases**: Valid JSON output, difficulty scaling, reachability validation, tile usage compliance
- **Mock requirements**: File system mocks, random seed control for deterministic testing

## Task Breakdown & Acceptance Criteria

### Task 05.01: Core Level Generator Architecture
- [ ] Create LevelGenerator class with difficulty parameter input
- [ ] Implement basic level boundary generation (ground platforms)
- [ ] Add tile selection logic using available_tiles.md catalog
- [ ] Establish coordinate system and level dimensions (5000x5000px default)
- **Acceptance**: Generator produces basic level structure with ground platforms

### Task 05.02: Platform Generation Algorithm  
- [ ] Implement floating platform placement with difficulty-based density
- [ ] Add platform type variation (ground, floating, moving platforms)
- [ ] Create platform chain generation for vertical/horizontal progression
- [ ] Ensure platform spacing allows for player jump capabilities
- **Acceptance**: Generated levels have varied, appropriately spaced platform layouts

### Task 05.03: Collectible and Goal Placement
- [ ] Implement coin placement algorithm following difficulty curves
- [ ] Add strategic coin placement (reward exploration, mark paths)
- [ ] Generate goal tile placement at level end points
- [ ] Ensure coin accessibility and balanced distribution
- **Acceptance**: Levels have engaging collectible layouts and clear goal placement

### Task 05.04: Difficulty Scaling System
- [ ] Create DifficultyConfig with parameters: platform_density, gap_size, moving_platform_ratio, coin_count
- [ ] Implement linear/exponential scaling curves for difficulty 1-10
- [ ] Add hazard placement for higher difficulties (spikes, complex moving platforms)
- [ ] Scale vertical complexity and level height based on difficulty
- **Acceptance**: Difficulty parameter meaningfully affects level complexity and challenge

### Task 05.05: Reachability Validation
- [ ] Implement ReachabilityValidator to ensure all areas are accessible
- [ ] Add pathfinding algorithm considering player jump/movement capabilities 
- [ ] Validate coin accessibility and goal reachability
- [ ] Regenerate level sections if validation fails
- **Acceptance**: All generated levels are guaranteed completable

### Task 05.06: CLI Tool and Integration
- [ ] Create command-line interface: `npm run generate-level [difficulty] [output-file]`
- [ ] Add JSON schema validation against level-format.md specification
- [ ] Implement random seed support for reproducible generation
- [ ] Create comprehensive documentation and usage examples
- **Acceptance**: Tool is easy to use and produces valid, tested level files

## Expected Output
- Command `npm run generate-level 5 new-level.json` creates a valid level JSON file
- Generated levels load successfully in GameScene via SceneFactory
- Difficulty parameter (1-10) meaningfully affects level complexity:
  - Difficulty 1: Simple horizontal progression, sparse platforms
  - Difficulty 5: Mixed vertical/horizontal, moderate platform density
  - Difficulty 10: Complex vertical challenges, dense moving platforms
- All generated levels are completable and follow established design patterns

## Risk Assessment
- **Potential complexity**: Reachability validation algorithm complexity, ensuring engaging level flow
- **Dependencies**: Available tiles catalog accuracy, level JSON schema stability
- **Fallback plan**: If pathfinding validation is too complex, use simpler heuristics (minimum platform density, maximum gap distances)

## Definition of Done
- [ ] All acceptance criteria are met for tasks 05.01-05.06
- [ ] CLI tool generates valid JSON levels matching level-format.md schema
- [ ] Generated levels load and play correctly in existing game
- [ ] Difficulty scaling produces noticeably different level complexities
- [ ] All project tests pass including new level generator tests
- [ ] Comprehensive documentation for using the generation tool
- [ ] Code follows existing project patterns and style guidelines
- [ ] No breaking changes to existing level loading systems
- [ ] Tool is ready for use by level designers and QA team
- [ ] Task marked as complete in tracking system

## Post-Mortem / Retrospective (fill in if needed)
- _To be filled if issues arise during implementation_

--- 
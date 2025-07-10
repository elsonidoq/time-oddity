# MVP Refactoring Plan: Phase 05 - Clean Architecture & Enhanced Features

## Overview

This phase implements three critical requirements to bring the Time Oddity game closer to MVP by removing technical debt, improving player experience, and enhancing the level creation system.

## Requirements Summary

### 1. Remove Hardcoded Level Creation (Task 05.01)
**Problem**: GameScene.js contains hardcoded level creation methods (`createCoinsHardcoded`, `createPlatformsHardcoded`, `createParallaxBackgroundHardcoded`) that serve as fallbacks when JSON configuration is missing.

**Solution**: Remove all hardcoded methods and require complete JSON-based level definition. This enforces clean architecture and ensures all levels are data-driven.

**Impact**: 
- ✅ Cleaner codebase with single source of truth for level data
- ✅ Forces proper level configuration, preventing silent fallbacks
- ✅ Easier to maintain and debug level creation logic

### 2. Fix Dash Restriction Logic (Task 05.02)
**Problem**: Currently, players cannot dash while jumping because `JumpState.js` lacks dash input handling, unlike other states.

**Solution**: Add dash input check to `JumpState.execute()` method following the same pattern as `IdleState` and `RunState`.

**Impact**:
- ✅ Improved player experience - dash available anytime unless cooling down
- ✅ More responsive and fluid gameplay mechanics
- ✅ Consistent behavior across all player states

### 3. Add Map Matrix Specification (Task 05.03)
**Problem**: Current level format requires individual platform definitions, making it difficult to create tile-based levels efficiently.

**Solution**: Add `"map_matrix"` support - a 2D array where each cell contains `{"tileKey": "valid_tile", "type": "ground|decorative"}`.

**Impact**:
- ✅ Enables efficient tile-based level creation
- ✅ Maintains backward compatibility with existing level format
- ✅ Provides foundation for algorithmic level generation

## Execution Strategy

### Phase Structure
This refactoring follows a **safe, incremental, test-driven approach** where:

1. **Each task is atomic** - can be completed and tested independently
2. **Functional integrity preserved** - game remains playable after each task
3. **Test validation required** - all tests must pass before proceeding
4. **Documentation updated** - invariants and contracts maintained

### Task Dependencies
- **Tasks 05.01 and 05.02** can be executed in parallel (no dependencies)
- **Task 05.03** should be executed after 05.01 to ensure clean SceneFactory architecture

### Risk Mitigation
- **Incremental changes** - each subtask is small and reversible
- **Test-driven validation** - comprehensive test coverage prevents regressions
- **Fallback plans** - clear rollback strategy for each change
- **Documentation tracking** - all architectural changes documented in invariants.md

## Expected Outcomes

After completing all three tasks:

1. **Cleaner Architecture**: No hardcoded level creation, all data-driven
2. **Better UX**: Dash available while jumping, more responsive controls  
3. **Enhanced Level Creation**: Support for both individual platforms and tile matrices
4. **Maintainable Codebase**: Consistent patterns, comprehensive test coverage
5. **MVP Readiness**: Foundation prepared for advanced features and algorithmic level generation

## Implementation Notes

- **Follow task_template.md format** for each implementation
- **Update invariants.md** if new architectural contracts are introduced
- **Run full test suite** after each task completion
- **Maintain backward compatibility** where possible
- **Document any breaking changes** in task post-mortems

## Success Criteria

✅ All hardcoded level creation methods removed  
✅ Player can dash while jumping (respecting cooldown)  
✅ Level format supports map_matrix specification  
✅ All existing functionality preserved  
✅ All tests pass  
✅ Documentation updated  
✅ No performance regressions  

This refactoring plan transforms the Time Oddity codebase into a cleaner, more maintainable, and feature-rich foundation ready for MVP and beyond. 
# Task: Update Dash Restriction Logic

## Task Title
Allow dash to be usable at any time unless cooling down — including while jumping

## Objective
Update the dash restriction logic so that dash can be used at any time unless it's on cooldown, specifically enabling dash while jumping. The current implementation prevents dashing during the jump state.

## Task ID: 05.02

## Pre-Implementation Analysis

### Documentation Dependencies
- [ ] **invariants.md sections to review**: "§6 Player Invariants", "§5 State Machine Contract"
- [ ] **testing_best_practices.md sections to apply**: "State-Based Testing", "Level 1: Unit Tests"
- [ ] **comprehensive_documentation.md sections to reference**: "§7.2 Platformer Character Controller"

### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: All dash timing properties (dashCooldown, dashDuration, dashTimer, canDash, isDashing)
- [ ] **New states/invariants to create**: None - modifying existing state machine behavior
- [ ] **Time reversal compatibility**: No impact - dash timing recalculated from scene.time.now

## Implementation Plan

### Files/Classes to Change
- **Create**: None
- **Modify**: 
  - `client/src/entities/states/JumpState.js` (add dash input check)
  - Integration and unit tests for state transitions
- **Delete**: None

### Integration Points
- **Systems affected**: Player state machine, input handling, dash cooldown system
- **State machines**: Player state machine - adding dash transition from JumpState
- **External libraries**: None

### Testing Strategy
- **Test files to create/update**: 
  - `tests/unit/jump-state.test.js`
  - `tests/integration/player-dash-from-jump.test.js`
- **Key test cases**: 
  - Dash input during jump state triggers dash transition
  - Dash respects cooldown even when triggered from jump
- **Mock requirements**: 
  - Mock InputManager for dash input simulation

## Task Breakdown & Acceptance Criteria

### Task 05.02.1: Add Dash Input Check to JumpState
- [ ] **Add dash input logic**: Insert dash input check in JumpState.execute() method
- [ ] **Maintain state transition priority**: Ensure dash has priority over other inputs
- [ ] **Preserve existing functionality**: Keep variable jump height and horizontal movement logic intact
- [ ] **Acceptance**: JumpState contains same dash input pattern as IdleState and RunState

### Task 05.02.2: Create Unit Tests for Dash from Jump
- [ ] **Test dash input during jump**: Verify dash input during jump triggers state transition to dash
- [ ] **Test cooldown respect**: Ensure dash input during jump respects cooldown timer
- [ ] **Acceptance**: Unit tests cover dash from jump scenarios

### Task 05.02.3: Validate Dash Cooldown Consistency
- [ ] **Test cooldown across states**: Verify cooldown timer works consistently from all states
- [ ] **Test edge cases**: Verify dash cooldown during state transitions
- [ ] **Acceptance**: Dash cooldown system works consistently regardless of triggering state

## Expected Output
- Player can dash while jumping (JumpState allows dash input)
- Dash cooldown is properly respected across all states
- All existing dash functionality remains intact

## Risk Assessment
- **Potential complexity**: State transition logic is well-established, low risk
- **Dependencies**: Must maintain existing dash timing invariants
- **Fallback plan**: If issues arise, revert JumpState changes

## Definition of Done
- [ ] All acceptance criteria are met
- [ ] Expected output is achieved and verified
- [ ] All project tests pass (locally and in CI)
- [ ] Code reviewed and approved
- [ ] No new linter or type errors
- [ ] No regressions in related features
- [ ] Task marked as complete in tracking system 
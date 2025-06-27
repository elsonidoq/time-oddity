## Task 01.01 – Extend Floating Platform Width Support

### Objective
Enable creation of floating platforms with arbitrary widths greater than one tile, removing the current single-block limitation.

### Task Reference
Functional Gap 1 – Core Platforming

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md**: §13 Level / Platform Geometry – especially ordering requirements; §12 Moving Platform Invariants for future compatibility
- [ ] **testing_best_practices.md**: "Decoupled Architecture Testing", "State-Based Testing"
- [ ] **small_comprehensive_documentation.md**: §1.3 Asset and Sprite Management, §14.1 Directory Structure

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Platform hit-box sizing contract; TimeManager recording for MovingPlatform (not affected)
- [ ] **New states/invariants**: None – platform geometry remains per-tile.
- [ ] **Time reversal compatibility**: Unchanged – floating platforms are static.

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `agent_docs/invariants.md` (update example width wording only if needed)
- **Modify**: `client/src/systems/SceneFactory.js` – createFloatingPlatform → iterate over `width` param
- **Modify**: Level config JSON(s) in `client/src/config/` – add `width` where appropriate
- **Create**: `tests/unit/scene-factory-floating-platform-width.test.js`

#### Integration Points
- **Systems affected**: SceneFactory only
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create**: `scene-factory-floating-platform-width.test.js`
- **Key test cases**:
  1. Config with width 192 creates exactly 3 child sprites
  2. Missing width falls back to 64 (single tile)
- **Mock requirements**: Use existing PhaserSceneMock

### Task Breakdown & Acceptance Criteria
- [ ] Update config schema documentation inside SceneFactory JSDoc to mention `width`
- [ ] Extend `createFloatingPlatform` to loop tiles based on `width`, honoring invariant ordering (§13.3)
- [ ] Maintain previous single-tile behaviour when `width` absent
- [ ] Add/adjust level JSON to showcase a 3-tile platform
- [ ] Green unit test proving multi-tile creation

### Expected Output
`npm test` passes; new unit spec proves floating platform width logic; game still loads level with new wider platform visible.

### Risk Assessment
- **Potential complexity**: Low – mirrors existing ground logic. Ensure platforms added to group before `configurePlatform()` per invariant.
- **Dependencies**: None
- **Fallback plan**: Re-enable single-block mode by omitting `width` if regression detected.

### Definition of Done
- [ ] All acceptance criteria satisfied
- [ ] All project tests green (CI)
- [ ] No linter/type errors
- [ ] No new invariants introduced
- [ ] Task marked complete

---

## Task 01.02 – Add Integration Test & Visual Verification for Multi-Width Platforms

### Objective
Validate the in-game behaviour of wider floating platforms via an integration test using PhaserSceneMock and ensure no regressions in collision or hit-box sizing.

### Task Reference
Follows Task 01.01

### Pre-Implementation Analysis
- **Docs**: Same as 01.01 plus testing_best_practices.md → "Integration Tests"
- **State Impact**: None

### Implementation Plan
- **Create**: `tests/integration/floating-platform-width-integration.test.js`
- **Modify**: Jest setup if additional mock data needed

### Testing Strategy
- Spin up SceneFactory with a test config containing a 3-tile floating platform
- Assert:
  1. `platforms.getChildren().length === 3`
  2. Each child has correct x-offset (0,64,128)
  3. Player can stand & collide across full span (simulate collision)

### Acceptance Criteria
- [ ] Test fails before Task 01.01 implementation, passes after
- [ ] No other tests fail

---

## Task 01.03 – Documentation & Cleanup

### Objective
Update developer docs and clean redundant hard-coded ground logic no longer required after width generalisation.

### Plan
- **Modify**: `agent_docs/small_comprehensive_documentation.md` – mention new `width` param
- **Prune**: Obsolete comments in GameScene.createPlatformsHardcoded noting single-block limitation
- **Acceptance**: Docs updated; `npm test` green 
# Time Oddity MVP: Detailed Task Breakdown

## Overview

This document breaks down each phase of the MVP development into granular, testable tasks. Each task is designed to be completed independently by an engineering LLM, with clear start/end points and focused on a single concern.

## Development Workflow

### Branch Management
Each phase will be developed on its own branch and merged into main upon completion:

1. **Phase 1**: `feature/phase-1-foundation`
2. **Phase 2**: `feature/phase-2-player-movement`
3. **Phase 3**: `feature/phase-3-gameplay-mechanics`
4. **Phase 4**: `feature/phase-4-level-design`
5. **Phase 5**: `feature/phase-5-polish`

### Task Completion Tracking
- Mark each task as completed by changing `- [ ]` to `- [x]` when finished
- Add completion date and any notes after each completed task
- Example: `- [x] Task completed on 2024-01-15 - Added error handling for edge cases`

### Phase Completion Checklist
Before merging each phase branch:
- [ ] All tasks in the phase are marked as completed
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Performance is acceptable
- [ ] Code follows established patterns
- [ ] Assets are properly integrated

---

## Phase 5: Polish & MVP Completion

**Branch**: `feature/phase-5-polish`

**CRITICAL IMPLEMENTATION REQUIREMENT**: Before implementing any task in this phase, you MUST read the comprehensive documentation file `agent_docs/comprehensive_documentation.md`. Pay special attention to:
- Section 1.6: Camera Systems, Particles, and Effects
- Section 1.7: Advanced Topics & Best Practices (for performance optimization)
- Section 6: Full-Stack Architecture and Development Tooling

**TDD REQUIREMENT**: All tasks in this phase follow Test-Driven Development (TDD).

### Task 5.1: Add Particle Effects for Player Actions
**Objective**: Enhance visual feedback for player abilities.
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Particle Emitters".
- **Expected output**: Simple particle effects are triggered when the player dashes, uses the chrono pulse, and rewinds time.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.2: Implement Screen Shake Effect
**Objective**: Add impact feedback for game events.
**IMPLEMENTATION REFERENCE**: See Section 1.6 "Camera Manager" for camera shake effects.
- **Expected output**: The camera briefly shakes when the player collides with an enemy.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.3: Add Player Health and Damage
**Objective**: Implement a health system for the player.
**IMPLEMENTATION REFERENCE**: See Section 7.3 for event-driven UI updates.
- **Expected output**: The player now has a health property. When colliding with an enemy, the player's health decreases, and the health bar in the `UIScene` updates to reflect the change.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.4: Create Game Over Scene
**Objective**: Handle the player's death.
**IMPLEMENTATION REFERENCE**: See Section 1.2 "Scene Management".
- **Expected output**: When the player's health reaches zero, the game transitions to a new "Game Over" scene, which provides options to restart or return to the main menu.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.5: Implement Basic Scoring System
**Objective**: Add a score tracking mechanism.
**IMPLEMENTATION REFERENCE**: See Section 7.3 for UI updates.
- **Expected output**: The `UIScene` now displays a score counter. Collecting a coin adds 10 points to the score, and collecting a TimeShard adds 100 points.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.6: Gameplay Tuning Pass
**Objective**: Balance and tune all gameplay values for a better feel.
**IMPLEMENTATION REFERENCE**: Review values in `Player.js`, `Enemy.js`, and state classes.
- **Expected output**: This is a non-visual task focused on balance. Adjust values for player speed, jump height, dash cooldown, enemy speed, and health to create a more enjoyable and balanced experience. The result is validated by gameplay feel.
- **After completion**: Mark task as completed after manual validation.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.7: Performance Optimization with Object Pooling
**Objective**: Optimize particle effects using object pooling.
**IMPLEMENTATION REFERENCE**: See Section 1.7 "Object Pooling".
- **Expected output**: The particle effects for player actions are refactored to use the `ObjectPool` system created in Phase 1. Visually, the game should look the same, but performance will be improved by recycling particle objects instead of creating new ones.
- **After completion**: Mark task as completed only after ALL project tests pass.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.8: Final Bug Bash
**Objective**: Perform a final pass to find and fix any remaining bugs.
**IMPLEMENTATION REFERENCE**: See Section 6.3 "Global Error Handling and Logging".
- **Expected output**: Address any known bugs, visual glitches, or inconsistencies found during playtesting. The game should feel stable and polished.
- **After completion**: Mark task as completed after manual validation.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.9: Create Final MVP Demo Level
**Objective**: Create a single level that showcases all game features.
**IMPLEMENTATION REFERENCE**: See Section 1.3 for level loading.
- **Expected output**: A new `level-mvp-demo.json` file is created and loaded by the game. This level should be a short, curated experience that requires the player to use all of their abilities (jump, dash, rewind, pulse) to complete.
- **After completion**: Mark task as completed after manual validation.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

### Task 5.10: Final Build and Validation
**Objective**: Ensure the production build is working correctly.
**IMPLEMENTATION REFERENCE**: See Section 6.1 on the Vite build pipeline.
- **Expected output**: Running the `npm run build` command successfully generates a production-ready build in the `/dist` directory. The game is fully playable when serving the contents of this directory.
- **After completion**: Mark task as completed after build validation.
- **CRITICAL**: After completion, all changes must be committed to git and pushed to the remote repository.

**Phase 5 Completion**: Merge `feature/phase-5-polish` into `main`

---

## Git Workflow Commands

### For Each Phase:

1. **Create Phase Branch**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/phase-X-[name]
   ```

2. **After Completing All Tasks in Phase**:
   ```bash
   git add .
   git commit -m "Complete Phase X: [Phase Name]"
   git push origin feature/phase-X-[name]
   ```

3. **Merge to Main**:
   ```bash
   git checkout main
   git merge feature/phase-X-[name]
   git push origin main
   ```

4. **Clean Up**:
   ```bash
   git branch -d feature/phase-X-[name]
   git push origin --delete feature/phase-X-[name]
   ```

---

## Testing Guidelines

### For Each Task:
1. **Verify the specific functionality** described in the task
2. **Test edge cases** and error conditions
3. **Ensure no regressions** in previously working features
4. **Check performance** impact of new features
5. **Validate against** the architectural patterns from documentation

### Success Criteria:
- Task functionality works as described
- No console errors or warnings
- Performance remains acceptable
- Code follows established patterns
- Assets are properly integrated

### Common Test Commands:
- `npm run dev` - Start development server
- `npm run build` - Test production build
- Browser dev tools - Check for errors and performance
- Manual gameplay testing - Verify mechanics work as expected

### Task Completion Tracking:
- Mark each task as completed by changing `- [ ]` to `- [x]`
- Add completion date and notes: `- [x] Completed on 2024-01-15 - Added error handling`
- Update progress regularly to track development status
- Update progress regularly to track development status
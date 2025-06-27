# Task Plan: Documentation Refactor for LLM-Assisted Development

## Objective
To refactor and improve the project's documentation to be maximally useful for an engineer LLM. This involves two phases:
1.  **Centralization**: Consolidate all critical high-level documentation into a few definitive files.
2.  **Distribution**: Embed relevant low-level documentation directly into the code using JSDoc.

This plan follows the structure requested, providing atomic tasks with rationales to guide the process. Each phase, and many individual tasks, represent a testable step.

---

## Phase 1: Centralization of High-Level Documentation

The goal of this phase is to create a "single source of truth" for high-level information, making it easier for an LLM to build a comprehensive understanding of the project's architecture, invariants, and best practices.

### Group 1: Consolidate Core Architecture & Tech Stack
**Rationale:** The current documentation splits fundamental architectural concepts and technology choices across `architecture.md` and `tech_stack.md`. Consolidating this information into `small_comprehensive_documentation.md` will create a single, authoritative entry point for understanding the project's overall structure and technical foundations.

- [ ] **Task 1.1:** Migrate the technology stack summary and justifications from `agent_docs/tech_stack.md` into a new "Technology Stack" section in `agent_docs/small_comprehensive_documentation.md`.
- [ ] **Task 1.2:** Migrate the relevant and accurate architectural patterns (Scene Hierarchy, Entity System, System Architecture) from `agent_docs/architecture.md` into `agent_docs/small_comprehensive_documentation.md`. **Crucially, update the file path listings to match the actual project structure.**
- [ ] **Task 1.3:** After verifying the content has been successfully migrated, delete `agent_docs/tech_stack.md` and `agent_docs/architecture.md` to eliminate redundancy.

### Group 2: Consolidate Feature-Specific Architecture & Invariants
**Rationale:** Critical invariants and architectural patterns for specific features like moving platforms are currently isolated in feature-specific documents. Centralizing them is essential for ensuring they are not overlooked during future modifications.

- [ ] **Task 2.1:** Migrate the moving platform invariants (e.g., player carrying logic, custom state recording requirements) from `agent_docs/moving_platform_architecture.md` into the appropriate sections of `agent_docs/invariants.md`.
- [ ] **Task 2.2:** Migrate the moving platform architectural patterns (e.g., the extension to the level's JSON configuration) from `agent_docs/moving_platform_architecture.md` to `agent_docs/small_comprehensive_documentation.md`.
- [ ] **Task 2.3:** After migration, delete `agent_docs/moving_platform_architecture.md`.

### Group 3: Consolidate Testing Best Practices
**Rationale:** The testing documentation contains general best practices, but concrete, feature-specific examples of complex mocking (like for GSAP or moving platforms) are scattered. Centralizing these examples will create a richer, more practical guide.

- [ ] **Task 3.1:** Migrate the specific, concrete mocking strategies for GSAP and advanced Phaser physics from `agent_docs/moving_platform_architecture.md` into `agent_docs/testing_best_practices.md` as illustrative examples.

### Group 4: Deduplicate Comprehensive Documentation
**Rationale:** `agent_docs/comprehensive_documentation_long.md` is overly verbose and contains significant overlap with other documents. The key, non-generic architectural decisions within it should be preserved in the main concise guide.

- [x] **Task 4.1:** Review `agent_docs/comprehensive_documentation_long.md` and merge any unique, critical architectural decisions or project-specific patterns (e.g., the explicit disabling of Phaser's audio) into `agent_docs/small_comprehensive_documentation.md`.
- [x] **Task 4.2:** After merging, delete `agent_docs/comprehensive_documentation_long.md` to serve as the new baseline.
- [x] **Task 4.3:** In-depth review of all consolidated documentation for correctness.
    - [x] **4.3.1:** Carefully read and verify `agent_docs/invariants.md` for accuracy, completeness, and alignment with project architecture and codebase.
    - [x] **4.3.2:** Carefully read and verify `agent_docs/testing_best_practices.md` for accuracy, practical applicability, and alignment with current testing workflows and mocks.
    - [x] **4.3.3:** Carefully read and verify `agent_docs/small_comprehensive_documentation.md` for architectural correctness, up-to-date structure, and clarity for LLM and human engineers.

---

## Phase 2: Distribution of Low-Level Documentation (JSDoc)

The goal of this phase is to embed context-specific documentation directly into the code. This provides the LLM with the immediate, local information needed to understand contracts, pre-conditions, and post-conditions, enabling safer and more accurate code modification.

### Group 1: Document Core System Contracts
**Rationale:** Core systems like the `TimeManager` and `StateMachine` enforce implicit contracts on the objects they manage. Documenting these contracts in the code makes them explicit and reduces the risk of incorrect integration.

- [ ] **Task 5.1:** Add JSDoc to `client/src/systems/TimeManager.js` detailing its state recording contract (the `TemporalState` object structure) and the requirements for custom `getStateForRecording`/`setStateFromRecording` methods, referencing the updated `invariants.md`.
- [ ] **Task 5.2:** Add JSDoc to `client/src/systems/StateMachine.js` clarifying the required state interface (`enter`, `execute`, `exit`) that all state objects must implement.
- [ ] **Task 5.3:** Add JSDoc to `client/src/systems/CollisionManager.js` documenting the key events it emits (e.g., `'playerEnemyCollision'`) and their expected payloads.

### Group 2: Document Entity & Ability Contracts
**Rationale:** Game entities possess complex, state-dependent behaviors and abilities with non-obvious invariants (e.g., cooldowns, state flags). Embedding this information as JSDoc is critical for safe modification of their logic.

- [ ] **Task 6.1:** Add JSDoc to `client/src/entities/Player.js` to document the invariants of the dash mechanic (`dashDuration`, `dashCooldown`, `isDashing` flag) and the contract for the `ChronoPulse` ability.
- [ ] **Task 6.2:** Add JSDoc to `client/src/entities/Enemy.js` to document the freeze/unfreeze contract (`isFrozen` property, `freeze` method).
- [ ] **Task 6.3:** Add JSDoc to `client/src/entities/enemies/LoopHound.js` to specifically comment on why it uses custom state recording methods, explaining what state it preserves beyond the default.
- [ ] **Task 6.4:** Add JSDoc to `client/src/entities/MovingPlatform.js` to document the critical player-carrying logic and its dependence on the `update` loop order.

---

## Definition of Done
- [ ] All Phase 1 tasks are complete, and the specified redundant markdown files have been deleted.
- [ ] All Phase 2 tasks are complete, and the relevant core systems and entities have JSDoc comments explaining their critical invariants and contracts.
- [ ] The project's test suite passes (`npm test`), ensuring that no functional regressions were introduced during documentation changes.
- [ ] The final documentation set (`invariants.md`, `testing_best_practices.md`, `small_comprehensive_documentation.md`) is coherent, concise, and internally consistent. 
## Task 02.01 – Implement Player Damage Reception & Health Display

### Objective
Enable the player to receive damage when colliding with enemies; surface current health in UIScene.

### Task Reference
Functional Gap 2 – Enemy Interactions

### Pre-Implementation Analysis
- **invariants.md**: §6 Player Invariants (dash system, body size); ensure no conflict with damage handling
- **testing_best_practices.md**: "State-Based Testing", "Centralized Mock Architecture"
- **small_comprehensive_documentation.md**: §7.2 Platformer Character Controller, §14.2 Component Architecture (UIScene)

State Impact: Add/confirm `Player.health` & maxHealth inherited; maintain Time Reversal compatibility (health already part of Entity state → recorded)

### Implementation Plan
Files to Modify:
- `client/src/entities/Player.js` – add `takeDamage` override (calls super & triggers hit feedback)
- `client/src/scenes/UIScene.js` – render health bar or text using registry value `playerHealth`

Testing:
- New unit test `player-damage.test.js` verifies health decrements & clamps ≥0.

Acceptance: CollisionManager callback updates registry; UIScene reflects lower health.

---

## Task 02.02 – Deal Damage to Player on Collision

### Objective
Extend CollisionManager.setupPlayerEnemyCollision so default handler inflicts contact damage to the player proportional to enemy power.

Pre-Implementation:
- Preserve existing emission of 'playerEnemyCollision'.
- Ensure TimeManager rewind restores pre-damage health (already handled via state buffer).

Implementation Steps:
1. Add optional `enemyDamage` field to Enemy (default 10).
2. In CollisionManager wrapper, call `player.takeDamage(enemy.damage)` before emitting event.
3. Add Jest integration test `enemy-collision-player-damage.test.js` using PhaserSceneMock.

---

## Task 02.03 – Define Enemy Death Feedback & Removal

Objective: When Enemy.health <=0, play death animation/SFX then remove from scene & award score.

Plan:
- Extend Enemy.die(): play animation, schedule `destroy()` via scene.time.delayedCall(300).
- Emit `'enemyDefeated'` event for score system (see Collectibles plan).
- Unit test ensures die() sets active false and emits event.

Definition of Done for all 02.x tasks:
- Tests green
- UIScene shows dynamic health
- Player loses health on touch; enemies die and dispatch event 
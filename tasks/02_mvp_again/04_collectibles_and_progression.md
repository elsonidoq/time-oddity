## Task 04.01 – Implement TimeShard Entity

### Objective
Add collectible TimeShard sprites that update a global shard counter.

### Reference
Functional Gap 4 – Collectibles

### Plan
- Create `client/src/entities/TimeShard.js` extending `Coin` (reuse collection logic)
- Register new atlas frame placeholder sprite
- SceneFactory `createCollectible` method (future) or manual placement in level config
- Unit test verifies `collect()` increments registry value `shardsCollected`

---

## Task 04.02 – HUD Counter for Time Shards & Points

Objective: Display shard count and total score in UIScene.

Implementation:
- Extend UIScene to listen to `registry` events or poll values `shardsCollected` and `score`
- Style bitmapText in top-left

Tests: UIScene unit test ensures text updates when registry value increments.

---

## Task 04.03 – Basic Scoring System

Objective: Introduce numeric score based on shards (+100 each) and enemyDefeated (+250).

Plan:
- Add `this.registry.set('score', 0)` in BootScene
- Increment score inside TimeShard.collect() and Enemy.die()
- Unit tests confirm score accumulation.

Definition of Done: Collectible visible and picked up; HUD shows counters; all tests pass. 
## Task 05.01 – Define Level Complete Conditions

### Objective
End the level when player collects all Time Shards (primary) or touches a Goal object.

Reference: Functional Gap 5 – Game Flow

Plan:
- Add `GoalTile` entity (static sprite) with overlap detection
- In GameScene.update check if `registry.get('shardsCollected') >= registry.get('totalShards')` OR player overlaps Goal
- Dispatch `'levelCompleted'` event; pause physics

Tests: Integration test where SceneFactory loads level with 1 shard; collects and asserts `levelCompleted` emitted.

---

## Task 05.02 – Level Complete UI & Transition

Objective: Show simple overlay "Level Complete" and return to MenuScene on key press.

Implementation:
- UIScene listens to levelCompleted event -> display panel
- Add key listener for SPACE to `scene.start('MenuScene')`

Unit test ensures event triggers UI method.

Definition of Done: Manual run able to finish level; tests pass. 
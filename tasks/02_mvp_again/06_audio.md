## Task 06.01 – Integrate Background Music Loop

### Objective
Add looping background music to GameScene using Howler.js.

Reference: Functional Gap 6 – Audio

Plan:
- Preload music file (existing `kenney_new-platformer-pack-1.0/Sounds/sfx_magic.ogg` as placeholder)
- In GameScene.create, instantiate Howl and start loop; ensure `Howler.volume` controlled via AudioManager singleton.
- Unit test with howlerMock ensures Howl constructed with loop=true.

---

## Task 06.02 – Basic SFX: Jump, Shard Pickup, Damage

Objective: Trigger sound effects for key actions.

Implementation Steps:
- Map actions to sound keys in AudioManager: `jump`, `shardPickup`, `playerHurt`.
- Hook:
  - Player JumpState.enter(): play `jump`
  - TimeShard.collect(): play `shardPickup`
  - Player.takeDamage(): play `playerHurt`
- Extend howlerMock to record play calls; add unit tests.

---

## Task 06.03 – Volume Controls & Muting

Objective: Add master mute toggle via 'M' key.

Plan:
- InputManager detects key; UI button in UIScene toggles `AudioManager.toggleMute()`
- AudioManager updates `Howler.mute(flag)`
- Unit test ensures `mute` called on toggle.

Definition of Done: Music loops; sounds trigger; mute works; all tests pass. 
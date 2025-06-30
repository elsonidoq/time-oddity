# Task Plan: Enemy Behavior & Rules Configuration

> **Addresses Functional Gap**: 🧠 Enemy Behavior & Rules
> **Goal**: Configure enemy positions via JSON, fix player damage mechanics, maintain freeze-to-kill rule
> **Methodology**: Test-Driven Development (TDD) with incremental implementation

---

## Task 02.01 – Extend Level JSON Schema for Enemy Configuration (Documentation)

### Task Title
Document Enemy Configuration Schema Extension

### Objective
Define the JSON schema specification for enemy configuration in level files, establishing the contract that subsequent implementation tasks will follow.

### Task ID
02.01

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §8 Enemy/Freeze Contract, §18.4 Enemy State, §18.5 LoopHound Extended State, §15 Asset & Animation Keys
- [x] **testing_best_practices.md sections to apply**: "BDD scenario writing", "Schema validation testing"
- [x] **small_comprehensive_documentation.md sections to reference**: Level JSON format patterns, SceneFactory creation patterns

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: LoopHound state structure (§18.5), Enemy base properties (§18.4)
- [x] **New states/invariants to create**: Enemy JSON configuration validation rules
- [x] **Time reversal compatibility**: No impact - schema documentation only

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `agent_docs/level-creation/level-format.md` – add enemy configuration schema section

#### Integration Points
- **Systems affected**: Level JSON validation, SceneFactory interface contract
- **State machines**: None (documentation only)
- **External libraries**: None

#### Testing Strategy
- **Test files to create/update**: Schema validation examples in documentation
- **Key test cases**: Valid enemy config examples, invalid config examples
- **Mock requirements**: None (documentation task)

### Task Breakdown & Acceptance Criteria

#### BDD Scenario Definition
```gherkin
Feature: Enemy Configuration Schema
  As a level designer
  I want to specify enemy positions and types in JSON
  So that I can create varied enemy layouts without code changes

Scenario: Valid enemy configuration
  Given a level JSON file with enemy configuration
  When the level is loaded by SceneFactory
  Then enemies should be created at specified positions
  And enemies should have configured patrol parameters
```

- [x] **Enemy Configuration Schema**: Document JSON structure following level-format.md patterns
- [x] **Required Fields**: type (string), x (number), y (number) 
- [x] **Optional Fields**: patrolDistance (number, default 200), direction (number, default 1)
- [x] **Validation Rules**: Position bounds, patrol distance limits (50-500px)
- [x] **Asset References**: Ensure enemy tileKey values exist in available_tiles.md

### Expected Output
Comprehensive JSON schema documentation that serves as specification for implementation tasks.

### Risk Assessment
- **Potential complexity**: Low - documentation task only
- **Dependencies**: Understanding of existing LoopHound parameters and level JSON patterns
- **Fallback plan**: Use minimal schema if complex configurations prove problematic

### Definition of Done
- [x] Enemy configuration schema documented in level-format.md
- [x] BDD scenarios written for enemy configuration behavior
- [x] Schema examples include valid and invalid configurations
- [x] Documentation follows established level-format.md patterns
- [x] Task marked as complete

---

## Task 02.02 – TDD: Enemy Factory Creation Logic (Red Phase)

### Task Title
Write Failing Tests for Enemy Factory Creation

### Objective
Write comprehensive failing unit tests for SceneFactory enemy creation functionality, following TDD Red phase methodology.

### Task ID
02.02

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §13 Physics Configuration Order, §8 Enemy/Freeze Contract, §18.5 LoopHound Extended State
- [x] **testing_best_practices.md sections to apply**: "TDD Red-Green-Refactor cycle", "Centralized Mock Architecture", "Unit Test Best Practices"
- [x] **small_comprehensive_documentation.md sections to reference**: §2.1 Core API patterns, SceneFactory implementation patterns

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: SceneFactory interface, LoopHound constructor signature
- [x] **New states/invariants to create**: Enemy factory test specifications
- [x] **Time reversal compatibility**: Tests must verify TimeManager registration

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/unit/scene-factory-enemy-creation.test.js`
- **Modify**: None (test-only task)

#### Integration Points
- **Systems affected**: SceneFactory testing interface
- **State machines**: None
- **External libraries**: Jest, centralized mocks

#### Testing Strategy
- **Test files to create**: `scene-factory-enemy-creation.test.js`
- **Key test cases**: 
  1. createEnemiesFromConfig with valid enemy config creates LoopHound
  2. Enemy positioned correctly from JSON coordinates
  3. Patrol parameters configured from JSON
  4. Enemy added to scene.enemies physics group (following §13 ordering)
  5. Enemy registered with TimeManager for time reversal
  6. Graceful handling of missing enemies array
  7. Invalid enemy type handled without crashing
- **Mock requirements**: PhaserSceneMock, LoopHound constructor mock, TimeManager mock

### Task Breakdown & Acceptance Criteria

#### TDD Red Phase Implementation
- [x] **Mock Setup**: Use centralized PhaserSceneMock from `tests/mocks/phaserSceneMock.js`
- [x] **Test Structure**: Follow established SceneFactory testing patterns
- [x] **Physics Group Testing**: Verify enemies added to physics group BEFORE configuration (§13)
- [x] **TimeManager Integration**: Mock and verify TimeManager.register() calls
- [x] **Error Handling Tests**: Invalid configs, missing data, malformed JSON

#### Specific Test Implementation Guidelines
```javascript
// Follow this pattern for enemy creation tests
describe('SceneFactory.createEnemiesFromConfig', () => {
  beforeEach(() => {
    scene = new PhaserSceneMock();
    sceneFactory = new SceneFactory(scene);
    // Use centralized mocks per testing_best_practices.md §2.3
  });
  
  it('should create LoopHound at specified coordinates', () => {
    // Red phase - this test MUST fail initially
    const config = { enemies: [{ type: 'LoopHound', x: 100, y: 200 }] };
    const enemies = sceneFactory.createEnemiesFromConfig(config);
    expect(enemies[0].x).toBe(100);
    expect(enemies[0].y).toBe(200);
  });
});
```

### Expected Output
Comprehensive failing unit test suite that defines exact behavior for enemy factory creation.

### Risk Assessment
- **Potential complexity**: Medium - proper mocking setup required
- **Dependencies**: Understanding of LoopHound constructor and SceneFactory patterns
- **Fallback plan**: Simplify tests if mocking proves complex

### Definition of Done
- [x] All test cases written and currently failing (Red phase)
- [x] Tests use centralized mock architecture per testing_best_practices.md
- [x] Tests verify physics configuration order per invariants.md §13
- [x] TimeManager integration tested
- [x] Error cases covered with appropriate test cases
- [x] Task marked as complete when tests are written and failing

---

## Task 02.03 – TDD: Enemy Factory Implementation (Green Phase)

### Task Title
Implement Enemy Factory Creation to Pass Tests

### Objective
Implement the minimum code required in SceneFactory to make the failing enemy creation tests pass, following TDD Green phase methodology.

### Task ID
02.03

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §13 Physics Configuration Order (CRITICAL), §8 Enemy/Freeze Contract, §3 Scene Lifecycle
- [x] **testing_best_practices.md sections to apply**: "TDD Green phase implementation", "Minimum viable implementation"
- [x] **small_comprehensive_documentation.md sections to reference**: SceneFactory patterns, entity creation best practices

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: SceneFactory interface, existing platform/coin creation patterns
- [x] **New states/invariants to create**: Enemy creation method in SceneFactory
- [x] **Time reversal compatibility**: Must register enemies with TimeManager

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/systems/SceneFactory.js` – add createEnemiesFromConfig method
- **Dependencies**: Task 02.02 completion (failing tests exist)

#### Integration Points
- **Systems affected**: SceneFactory, LoopHound instantiation, physics groups
- **State machines**: None directly
- **External libraries**: Phaser physics groups

#### Testing Strategy
- **Test validation**: Run existing tests from Task 02.02 to verify implementation
- **Green phase criteria**: All tests pass with minimal implementation
- **No additional tests**: Focus on making existing tests pass

### Task Breakdown & Acceptance Criteria

#### TDD Green Phase Implementation
- [x] **Minimal Implementation**: Write only code necessary to pass tests
- [x] **Follow Established Patterns**: Use same structure as createPlatformsFromConfig
- [x] **Physics Order Compliance**: Add enemies to group BEFORE configuration (invariants.md §13)
- [x] **TimeManager Integration**: Register each created enemy with scene.timeManager

#### Specific Implementation Guidelines
```javascript
// Follow this minimal implementation pattern
createEnemiesFromConfig(config) {
  if (!config || !config.enemies || !Array.isArray(config.enemies)) {
    return []; // Graceful fallback
  }
  
  const enemies = [];
  config.enemies.forEach(enemyConfig => {
    if (enemyConfig.type === 'LoopHound') {
      const enemy = new LoopHound(this.scene, enemyConfig.x, enemyConfig.y);
      
      // CRITICAL: Add to group BEFORE configuration (§13)
      if (this.scene.enemies && this.scene.enemies.add) {
        this.scene.enemies.add(enemy);
      }
      
      // Register with TimeManager for time reversal
      if (this.scene.timeManager && this.scene.timeManager.register) {
        this.scene.timeManager.register(enemy);
      }
      
      enemies.push(enemy);
    }
  });
  return enemies;
}
```

### Expected Output
Working enemy factory method that creates LoopHound enemies from JSON configuration, passing all tests from Task 02.02.

### Risk Assessment
- **Potential complexity**: Low - following established SceneFactory patterns
- **Dependencies**: Task 02.02 completion, LoopHound constructor compatibility
- **Fallback plan**: Implement basic creation without advanced features if needed

### Definition of Done
- [x] All tests from Task 02.02 now pass (Green phase achieved)
- [x] Implementation follows physics configuration order (invariants.md §13)
- [x] Enemies properly registered with TimeManager
- [x] Code follows established SceneFactory patterns
- [x] No additional functionality beyond test requirements
- [x] Task marked as complete

---

## Task 02.04 – Add Enemy Configuration to Level JSON Files

### Task Title
Update Level JSON Files with Enemy Configurations

### Objective
Add enemy configuration sections to existing level JSON files, enabling JSON-driven enemy creation in actual gameplay.

### Task ID
02.04

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §15 Asset & Animation Keys, LoopHound specifications
- [x] **testing_best_practices.md sections to apply**: "Configuration testing", "Integration validation"
- [x] **level-format.md sections to reference**: Enemy schema from Task 02.01

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: All existing level configurations (platforms, coins, goals)
- [x] **New states/invariants to create**: Enemy configurations in level JSON files
- [x] **Time reversal compatibility**: No impact - configuration data only

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/config/test-level.json` – add enemies array
- **Modify**: `client/src/config/adventure-level.json` – add enemies array
- **Modify**: `client/src/config/complex-level.json` – add enemies array

#### Integration Points
- **Systems affected**: Level loading, SceneFactory enemy creation
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create/update**: `tests/unit/level-config-enemy-validation.test.js`
- **Key test cases**: 
  1. JSON files are valid JSON
  2. Enemy configurations follow documented schema
  3. Enemy positions are within level bounds
  4. Asset references (tileKey) are valid
- **Mock requirements**: File system mocks for JSON loading

### Task Breakdown & Acceptance Criteria

#### Level Configuration Updates
- [x] **test-level.json**: Add 2-3 LoopHound enemies at strategic positions
- [x] **adventure-level.json**: Add varied enemy placement for progression testing
- [x] **complex-level.json**: Add complex enemy patterns with different patrol distances
- [x] **Schema Validation**: Ensure all enemy configs follow Task 02.01 schema
- [x] **Position Validation**: Verify enemy spawn points are on solid ground

#### Example Enemy Configuration
```json
{
  "platforms": [ /* existing platforms */ ],
  "coins": [ /* existing coins */ ],
  "enemies": [
    {
      "type": "LoopHound",
      "x": 300,
      "y": 450,
      "patrolDistance": 150,
      "direction": 1
    },
    {
      "type": "LoopHound", 
      "x": 800,
      "y": 350,
      "patrolDistance": 200,
      "direction": -1
    }
  ]
}
```

### Expected Output
All level JSON files contain valid enemy configurations that work with the SceneFactory implementation.

### Risk Assessment
- **Potential complexity**: Low - JSON configuration task
- **Dependencies**: Task 02.01 schema definition, Task 02.03 factory implementation
- **Fallback plan**: Start with minimal enemy configs if complex placement problematic

### Definition of Done
- [x] All level JSON files updated with enemy configurations
- [x] Enemy positions tested and validated in game
- [x] JSON syntax and schema compliance verified
- [x] No breaking changes to existing level loading
- [x] Task marked as complete

---

## Task 02.05 – TDD: Player Damage System Tests (Red Phase)

### Task Title
Write Failing Tests for Player-Enemy Collision Damage

### Objective
Create comprehensive failing tests for corrected player-enemy collision behavior, ensuring players take damage when touching enemies.

### Task ID
02.05

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §10 CollisionManager Expectations, §6 Player Invariants, §8 Enemy/Freeze Contract
- [x] **testing_best_practices.md sections to apply**: "TDD Red phase", "Integration testing patterns", "Event-driven testing"
- [x] **small_comprehensive_documentation.md sections to reference**: §7.2 Platformer Character Controller, collision system patterns

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: Player health system, enemy freeze mechanics, ChronoPulse integration
- [x] **New states/invariants to create**: Player damage event specification, collision direction validation
- [x] **Time reversal compatibility**: Player health changes must be recorded by TimeManager

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/unit/player-enemy-collision-damage.test.js`
- **Create**: `tests/integration/collision-damage-integration.test.js`

#### Integration Points
- **Systems affected**: CollisionManager, Player health, event emission
- **State machines**: Player state machine (potential damage reaction)
- **External libraries**: Phaser collision system

#### Testing Strategy
- **Test files to create**: `player-enemy-collision-damage.test.js`, `collision-damage-integration.test.js`
- **Key test cases**:
  1. Player.takeDamage method exists and reduces health
  2. CollisionManager.setupPlayerEnemyCollision damages player (not enemy)
  3. Player health decreases on enemy contact
  4. Enemy health unchanged on player contact (unless frozen)
  5. Frozen enemies can still be defeated by player contact
  6. 'playerEnemyCollision' event emitted correctly
  7. Multiple collisions don't cause double damage
- **Mock requirements**: Player mock with health, Enemy mock, CollisionManager mock, Phaser collision mocks

### Task Breakdown & Acceptance Criteria

#### TDD Red Phase - Unit Tests
- [x] **Player.takeDamage Tests**: Verify method reduces health, handles edge cases (health <= 0)
- [x] **CollisionManager Direction Tests**: Test that collision handler calls player.takeDamage, not enemy.takeDamage
- [x] **Event Emission Tests**: Verify 'playerEnemyCollision' events emitted with correct payload
- [x] **Freeze Exception Tests**: Frozen enemies take damage when contacted by player

#### TDD Red Phase - Integration Tests  
- [x] **Real Collision Tests**: Use actual Phaser collision simulation
- [x] **Multiple Enemy Tests**: Verify behavior with multiple enemies
- [x] **State Preservation Tests**: Ensure ChronoPulse freeze behavior unchanged

#### Specific Test Implementation Guidelines
```javascript
describe('Player-Enemy Collision Damage', () => {
  it('should damage player when colliding with active enemy', () => {
    // Red phase - this test MUST fail initially
    const player = createPlayerMock(100); // 100 health
    const enemy = createEnemyMock(20); // 20 damage
    
    collisionManager.handlePlayerEnemyCollision(player, enemy);
    
    expect(player.health).toBe(80); // 100 - 20 = 80
    expect(enemy.health).toBe(enemy.maxHealth); // unchanged
  });
  
  it('should allow player to defeat frozen enemies', () => {
    const player = createPlayerMock(100);
    const enemy = createEnemyMock(20);
    enemy.freeze(1000); // Freeze enemy first
    
    collisionManager.handlePlayerEnemyCollision(player, enemy);
    
    expect(enemy.health).toBeLessThan(enemy.maxHealth); // Enemy damaged
    expect(player.health).toBe(100); // Player not damaged
  });
});
```

### Expected Output
Comprehensive failing test suite that specifies correct player-enemy collision damage behavior.

### Risk Assessment
- **Potential complexity**: Medium - collision system integration complex
- **Dependencies**: Understanding current CollisionManager implementation
- **Fallback plan**: Simplify tests if collision mocking proves difficult

### Definition of Done
- [x] All unit tests written and currently failing (Red phase)
- [x] Integration tests cover real collision scenarios
- [x] Tests verify event emission per invariants.md §16
- [x] Freeze-to-kill rule preservation tested
- [x] Tests use centralized mock architecture
- [x] Task marked as complete when tests are written and failing

---

## Task 02.06 – TDD: Player Damage Implementation (Green Phase)

### Task Title
Fix CollisionManager to Damage Player Instead of Enemy

### Objective
Implement the minimum changes to CollisionManager and Player classes to make player damage tests pass while preserving freeze-to-kill mechanics.

### Task ID
02.06

### Pre-Implementation Analysis

#### Documentation Dependencies
- [x] **invariants.md sections to review**: §10 CollisionManager Expectations, §16 Runtime Event Names, §8 Enemy/Freeze Contract
- [x] **testing_best_practices.md sections to apply**: "TDD Green phase implementation", "Minimal viable changes"
- [x] **small_comprehensive_documentation.md sections to reference**: Event-driven architecture patterns

#### State & Invariant Impact Assessment
- [x] **Existing states to preserve**: Enemy freeze mechanics, ChronoPulse integration, event emission patterns
- [x] **New states/invariants to create**: Player damage on collision (direction reversal)
- [x] **Time reversal compatibility**: Player health changes recorded by TimeManager

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/systems/CollisionManager.js` – fix setupPlayerEnemyCollision callback
- **Modify**: `client/src/entities/Player.js` – ensure takeDamage method exists and works
- **Dependencies**: Task 02.05 completion (failing tests exist)

#### Integration Points
- **Systems affected**: Player-enemy collision logic, health system, event emission
- **State machines**: None directly modified
- **External libraries**: Phaser collision system

#### Testing Strategy
- **Test validation**: Run tests from Task 02.05 to verify implementation
- **Green phase criteria**: All collision damage tests pass
- **Regression testing**: Ensure ChronoPulse freeze mechanics still work

### Task Breakdown & Acceptance Criteria

#### TDD Green Phase Implementation
- [x] **Collision Direction Fix**: Modify collision callback to damage player, not enemy
- [x] **Player.takeDamage Method**: Ensure method exists, reduces health, handles edge cases
- [x] **Freeze Exception Logic**: Preserve ability for player to damage frozen enemies
- [x] **Event Emission**: Maintain 'playerEnemyCollision' event emission per invariants.md §16

#### Specific Implementation Guidelines
```javascript
// In CollisionManager.js - fix the collision callback direction
setupPlayerEnemyCollision(player, enemies, customCallback = null) {
  this.scene.physics.add.overlap(player, enemies, (player, enemy) => {
    // FIXED: Player takes damage from enemy contact
    if (!enemy.isFrozen) {
      player.takeDamage(enemy.damage || 20);
    } else {
      // Frozen enemies can be defeated by player
      enemy.takeDamage(player.attackPower || 20);
    }
    
    // Emit event for other systems (preserve invariant §16)
    this.scene.events.emit('playerEnemyCollision', { player, enemy });
    
    if (customCallback) customCallback(player, enemy);
  }, null, this.scene);
}

// In Player.js - ensure takeDamage method exists
takeDamage(amount) {
  if (this.health <= 0) return; // Already dead
  
  this.health = Math.max(0, this.health - amount);
  
  // Emit health change event for UI updates
  this.scene.events.emit('playerHealthChanged', { 
    health: this.health, 
    damage: amount 
  });
  
  if (this.health <= 0) {
    this.scene.events.emit('playerDied');
  }
}
```

### Expected Output
Player takes damage when colliding with active enemies; frozen enemies can be defeated; all tests from Task 02.05 pass.

### Risk Assessment
- **Potential complexity**: Medium - must preserve existing freeze mechanics
- **Dependencies**: Task 02.05 completion, understanding of current collision implementation
- **Fallback plan**: Revert to original collision logic if freeze mechanics break

### Definition of Done
- [x] All tests from Task 02.05 now pass (Green phase achieved)
- [x] Player takes damage from enemy collision
- [x] Freeze-to-kill mechanics preserved (frozen enemies defeated by player)
- [x] Event emission maintained per invariants.md §16
- [x] No regressions in ChronoPulse functionality
- [x] Task marked as complete

---

## Task 02.07 – Integrate JSON-Driven Enemies in GameScene

### Task Title
Replace Hardcoded Enemy Creation with JSON Factory

### Objective
Remove hardcoded LoopHound creation from GameScene and replace with SceneFactory.createEnemiesFromConfig call, completing the JSON-driven enemy system.

### Task ID
02.07

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **invariants.md sections to review**: §3 Scene Lifecycle, §13 Physics Configuration Order, §7 TimeManager Rewind System
- [ ] **testing_best_practices.md sections to apply**: "Integration testing", "Regression testing"
- [ ] **small_comprehensive_documentation.md sections to reference**: GameScene architecture, SceneFactory integration patterns

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: Enemy physics group registration, TimeManager registration, collision setup
- [ ] **New states/invariants to create**: JSON-driven enemy initialization in GameScene
- [ ] **Time reversal compatibility**: Unchanged - enemies still registered with TimeManager

### Implementation Plan

#### Files/Classes to Change
- **Modify**: `client/src/scenes/GameScene.js` – remove hardcoded LoopHound, add factory call
- **Dependencies**: Tasks 02.03 and 02.04 completion (factory and JSON configs ready)

#### Integration Points
- **Systems affected**: GameScene enemy initialization, SceneFactory integration
- **State machines**: None
- **External libraries**: None

#### Testing Strategy
- **Test files to create/update**: `tests/integration/game-scene-enemy-integration.test.js`
- **Key test cases**:
  1. GameScene loads enemies from JSON configuration
  2. No hardcoded enemies created
  3. Enemy physics group registration preserved
  4. TimeManager registration works correctly
  5. Collision setup between player and JSON enemies
- **Mock requirements**: GameScene mock, level config mock, SceneFactory mock

### Task Breakdown & Acceptance Criteria

#### GameScene Integration
- [ ] **Remove Hardcoded Creation**: Delete hardcoded LoopHound instantiation from GameScene.create()
- [ ] **Add Factory Call**: Call SceneFactory.createEnemiesFromConfig() with level configuration
- [ ] **Preserve Integrations**: Ensure TimeManager and CollisionManager setup still works
- [ ] **Error Handling**: Graceful fallback if JSON config missing or invalid

#### Specific Implementation Guidelines
```javascript
// In GameScene.create() - replace hardcoded enemy creation
create(data) {
  // ... existing setup code ...
  
  // REMOVE: Hardcoded LoopHound creation
  // this.loophound = new LoopHound(this, 250, groundY, 'enemies', 'slime_normal_rest');
  
  // REPLACE WITH: JSON-driven enemy creation
  if (this.sceneFactory) {
    const enemies = this.sceneFactory.createEnemiesFromConfig(this.levelConfig);
    
    // Register all created enemies with TimeManager
    enemies.forEach(enemy => {
      if (this.timeManager) {
        this.timeManager.register(enemy);
      }
      
      // Add to enemies physics group for collision detection
      if (this.enemies && this.enemies.add) {
        this.enemies.add(enemy);
      }
    });
    
    // Set up collision detection for all enemies
    if (this.collisionManager && this.player && enemies.length > 0) {
      this.collisionManager.setupPlayerEnemyCollision(this.player, this.enemies);
    }
  }
  
  // ... rest of existing setup code ...
}
```

### Expected Output
GameScene creates enemies from JSON configuration instead of hardcoded creation; all enemy systems (physics, collision, time reversal) work correctly.

### Risk Assessment
- **Potential complexity**: Low - replacing existing logic with factory call
- **Dependencies**: Tasks 02.03, 02.04, and 02.06 completion
- **Fallback plan**: Keep hardcoded creation as fallback if JSON factory fails

### Definition of Done
- [ ] Hardcoded enemy creation removed from GameScene
- [ ] JSON-driven enemy creation working correctly
- [ ] All enemy integrations preserved (physics, TimeManager, collision)
- [ ] Integration test verifies complete enemy system works
- [ ] Game behavior identical to before (except JSON-driven)
- [ ] Task marked as complete

---

## Task 02.08 – Comprehensive Integration Test & Documentation

### Task Title
Create End-to-End Enemy System Test and Update Documentation

### Objective
Create comprehensive integration test covering the complete enemy behavior chain from JSON configuration to gameplay, and update all relevant documentation.

### Task ID
02.08

### Pre-Implementation Analysis

#### Documentation Dependencies
- [ ] **testing_best_practices.md sections to apply**: "Integration testing", "End-to-end testing patterns", "Test pyramid guidelines"
- [ ] **invariants.md sections to review**: All enemy-related sections for validation

#### State & Invariant Impact Assessment
- [ ] **Existing states to preserve**: All implemented enemy behaviors
- [ ] **New states/invariants to create**: Complete enemy system validation
- [ ] **Time reversal compatibility**: Full enemy time reversal testing

### Implementation Plan

#### Files/Classes to Change
- **Create**: `tests/integration/enemy-system-complete.test.js`
- **Modify**: `agent_docs/level-creation/level-format.md` – finalize enemy configuration documentation
- **Modify**: `README.md` – update with enemy configuration features
- **Create**: `agent_docs/enemy_system_architecture.md` – comprehensive system documentation

#### Integration Points
- **Systems affected**: Complete enemy system validation
- **State machines**: Enemy AI state validation
- **External libraries**: Full Phaser integration testing

#### Testing Strategy
- **Integration test coverage**:
  1. Complete enemy lifecycle: JSON config → SceneFactory creation → GameScene integration
  2. Player-enemy collision damage (correct direction)
  3. Enemy defeat mechanics (freeze-to-kill rule)
  4. Time reversal with enemy state preservation
  5. Multiple enemies from JSON configuration
  6. Performance with various enemy counts

### Task Breakdown & Acceptance Criteria

#### Comprehensive Integration Test
- [ ] **End-to-End Scenario**: JSON config → enemy creation → collision → damage → freeze → defeat
- [ ] **Time Reversal Testing**: Verify complete enemy state restoration
- [ ] **Performance Validation**: Test with multiple enemies to ensure no performance regression
- [ ] **Error Handling**: Test invalid configurations and graceful degradation

#### Documentation Updates
- [ ] **level-format.md**: Complete enemy configuration documentation with examples
- [ ] **Enemy System Architecture**: Document complete system interaction patterns
- [ ] **README.md**: Update feature list with enemy configuration capabilities
- [ ] **Code Comments**: Ensure all new code has comprehensive documentation

#### Example Integration Test Structure
```javascript
describe('Complete Enemy System Integration', () => {
  it('should handle complete enemy lifecycle from JSON to gameplay', async () => {
    // 1. Load level with enemy configuration
    const levelConfig = {
      enemies: [
        { type: 'LoopHound', x: 300, y: 450, patrolDistance: 150 }
      ]
    };
    
    // 2. Create GameScene with level config
    const gameScene = new GameScene();
    gameScene.create({ levelConfig });
    
    // 3. Verify enemy created and integrated
    expect(gameScene.enemies.children.entries).toHaveLength(1);
    
    // 4. Test player-enemy collision damage
    const player = gameScene.player;
    const enemy = gameScene.enemies.children.entries[0];
    
    simulateCollision(player, enemy);
    expect(player.health).toBeLessThan(100); // Player damaged
    
    // 5. Test freeze-to-kill mechanics
    enemy.freeze(1000);
    simulateCollision(player, enemy);
    expect(enemy.health).toBeLessThan(enemy.maxHealth); // Enemy defeated
    
    // 6. Test time reversal
    gameScene.timeManager.startRewind();
    await advanceTime(1000);
    gameScene.timeManager.stopRewind();
    
    expect(player.health).toBe(100); // Player health restored
    expect(enemy.health).toBe(enemy.maxHealth); // Enemy health restored
  });
});
```

### Expected Output
Complete enemy behavior system working end-to-end with comprehensive test coverage and documentation.

### Risk Assessment
- **Potential complexity**: High - comprehensive integration testing
- **Dependencies**: All previous tasks completion
- **Fallback plan**: Focus on core scenarios if comprehensive testing proves too complex

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Integration test covers complete enemy system lifecycle
- [ ] Documentation accurately reflects implemented system
- [ ] No performance regressions with enemy system
- [ ] All project tests pass (locally and in CI)
- [ ] Enemy system ready for production use
- [ ] Task marked as complete

---

## Post-Mortem / Retrospective (fill in if needed)
- _To be filled if issues arise during implementation_

--- 
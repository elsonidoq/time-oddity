# Enemy Configuration BDD Scenarios

> **Purpose**: Behavior-Driven Development scenarios for enemy configuration system
> **Scope**: JSON-driven enemy creation and behavior validation
> **Methodology**: Gherkin syntax for clear, testable specifications

---

## Feature: Enemy Configuration Schema

**As a** level designer  
**I want to** specify enemy positions and types in JSON  
**So that** I can create varied enemy layouts without code changes

### Scenario: Valid enemy configuration creates LoopHound at specified position

**Given** a level JSON file with enemy configuration  
**And** the enemy type is "LoopHound"  
**And** the enemy has valid x, y coordinates  
**When** the level is loaded by SceneFactory  
**Then** a LoopHound enemy should be created at the specified position  
**And** the enemy should be added to the scene's enemies physics group  
**And** the enemy should be registered with TimeManager for time reversal  

### Scenario: Enemy patrol parameters are configured from JSON

**Given** a LoopHound enemy configuration with patrolDistance and direction  
**When** the enemy is created from the configuration  
**Then** the enemy should patrol between x and x + patrolDistance  
**And** the enemy should start moving in the specified direction  
**And** the enemy should reverse direction at patrol boundaries  

### Scenario: Missing enemy section creates no enemies

**Given** a level JSON file without an enemies array  
**When** the level is loaded by SceneFactory  
**Then** no enemies should be created  
**And** the scene should continue loading normally  

### Scenario: Invalid enemy type is handled gracefully

**Given** a level JSON file with an unknown enemy type  
**When** the level is loaded by SceneFactory  
**Then** the invalid enemy should be skipped  
**And** valid enemies should still be created  
**And** no errors should be thrown  

### Scenario: Enemy spawn positions are validated against level bounds

**Given** a level JSON file with enemy positions outside level bounds  
**When** the level is loaded by SceneFactory  
**Then** out-of-bounds enemies should be handled gracefully  
**And** valid enemies should still be created  

---

## Feature: Enemy Physics Configuration Order

**As a** game developer  
**I want to** ensure enemies follow proper physics configuration order  
**So that** physics properties are preserved during creation

### Scenario: Enemies are added to physics group before configuration

**Given** a valid enemy configuration  
**When** the enemy is created by SceneFactory  
**Then** the enemy should be added to the enemies physics group FIRST  
**And** THEN physics configuration should be applied  
**And** the configuration should not be lost  

---

## Feature: Enemy Time Reversal Compatibility

**As a** game developer  
**I want to** ensure enemies work correctly with time reversal  
**So that** enemy state is properly preserved and restored

### Scenario: LoopHound patrol state is preserved during time reversal

**Given** a LoopHound enemy is patrolling  
**And** the enemy has moved from its spawn position  
**When** time reversal is activated  
**Then** the enemy should return to its previous position  
**And** the enemy should maintain its patrol boundaries  
**And** the enemy should preserve its movement direction  

### Scenario: Enemy freeze state is preserved during time reversal

**Given** a LoopHound enemy is frozen by ChronoPulse  
**When** time reversal is activated  
**Then** the enemy should maintain its frozen state  
**And** the enemy should unfreeze at the correct time  

---

## Feature: Enemy Validation Rules

**As a** level designer  
**I want to** have clear validation rules for enemy configuration  
**So that** I can create valid enemy layouts

### Scenario: Patrol distance validation

**Given** a LoopHound configuration with patrolDistance < 50  
**When** the level is loaded  
**Then** the patrolDistance should be clamped to 50  
**Or** the enemy should be skipped with a warning  

**Given** a LoopHound configuration with patrolDistance > 500  
**When** the level is loaded  
**Then** the patrolDistance should be clamped to 500  
**Or** the enemy should be skipped with a warning  

### Scenario: Direction validation

**Given** a LoopHound configuration with direction not equal to 1 or -1  
**When** the level is loaded  
**Then** the direction should default to 1  
**Or** the enemy should be skipped with a warning  

### Scenario: Speed validation

**Given** a LoopHound configuration with speed < 10  
**When** the level is loaded  
**Then** the speed should be clamped to 10  
**Or** the enemy should be skipped with a warning  

**Given** a LoopHound configuration with speed > 200  
**When** the level is loaded  
**Then** the speed should be clamped to 200  
**Or** the enemy should be skipped with a warning  

---

## Feature: Enemy Integration with Existing Systems

**As a** game developer  
**I want to** ensure enemies integrate properly with existing game systems  
**So that** all functionality works correctly

### Scenario: Enemy collision detection works with JSON-created enemies

**Given** enemies are created from JSON configuration  
**When** the player collides with an enemy  
**Then** the collision should be detected correctly  
**And** the appropriate damage should be applied  
**And** collision events should be emitted  

### Scenario: ChronoPulse freeze works with JSON-created enemies

**Given** enemies are created from JSON configuration  
**When** ChronoPulse is activated near the enemies  
**Then** the enemies should be frozen correctly  
**And** the freeze effect should work with time reversal  

### Scenario: Multiple enemies from JSON configuration

**Given** a level JSON file with multiple enemy configurations  
**When** the level is loaded  
**Then** all enemies should be created correctly  
**And** each enemy should have independent behavior  
**And** performance should not degrade significantly  

---

## Implementation Notes

### BDD to Test Mapping
These scenarios should be implemented as:
- **Unit Tests**: Individual enemy creation and validation logic
- **Integration Tests**: Enemy creation with SceneFactory and GameScene
- **End-to-End Tests**: Complete enemy lifecycle from JSON to gameplay

### Validation Strategy
- **Schema Validation**: JSON structure and required fields
- **Range Validation**: Numeric values within acceptable bounds
- **Position Validation**: Enemy spawn points on valid ground
- **Graceful Degradation**: Skip invalid enemies, continue with valid ones

### Error Handling
- **Missing Configuration**: Default to empty enemies array
- **Invalid Types**: Skip unknown enemy types with warning
- **Out of Bounds**: Clamp values or skip with warning
- **Physics Errors**: Log errors but don't crash level loading

### Performance Considerations
- **Multiple Enemies**: Ensure efficient creation and management
- **Time Reversal**: Verify state recording doesn't impact performance
- **Memory Usage**: Monitor enemy object lifecycle and cleanup 
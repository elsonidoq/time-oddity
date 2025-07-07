
## 6. CLI and Integration Interfaces

### 6.1 CaveGeneratorCLI Interface

**File**: `src/cli/CaveGeneratorCLI.js`

**Purpose**: Provides command-line interface for cave generation.

**Constructor**:
```javascript
constructor()
```

**Public Methods**:
```javascript
setupProgram(): void
setupCommands(): void
handleGenerateCommand(options: Object): Promise<void>
convertParameters(options: Object): Object
generateLevel(config: Object): Promise<Object>
ensureOutputDirectory(outputPath: string): void
writeLevelToFile(outputPath: string, levelData: Object): void
logProgress(message: string, config: Object): void
handleError(error: Error): void
showHelp(): void
parse(): void
```

**CLI Options Interface**:
```javascript
{
  seed: string,                    // Random seed
  width: number,                   // Level width
  height: number,                  // Level height
  initialWallRatio: number,        // Initial wall ratio
  simulationSteps: number,         // CA simulation steps
  birthThreshold: number,          // Birth threshold
  survivalThreshold: number,       // Survival threshold
  minRoomSize: number,             // Minimum room size
  minStartGoalDistance: number,    // Min start-goal distance
  coinCount: number,               // Number of coins
  enemyCount: number,              // Number of enemies
  output: string,                  // Output file path
  verbose: boolean                 // Verbose output
}
```

**Invariants**:
- **CLI-1**: All parameters are validated
- **CLI-2**: Error handling is comprehensive
- **CLI-3**: Progress reporting is clear
- **CLI-4**: Output files are properly formatted
- **CLI-5**: Help system is comprehensive

**Error Conditions**:
- Invalid command line arguments
- File system errors
- Generation failures
- Validation errors

---

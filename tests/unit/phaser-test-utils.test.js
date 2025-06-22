import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

describe('Phaser Testing Infrastructure', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const testUtilsPath = join(__dirname, 'phaser-test-utils.js');

  test('should create phaser-test-utils.js file', () => {
    expect(existsSync(testUtilsPath)).toBe(true);
  });

  test('should export Phaser mock classes', async () => {
    const testUtils = await import(testUtilsPath);
    expect(testUtils.PhaserMock).toBeDefined();
    expect(testUtils.SceneMock).toBeDefined();
    expect(testUtils.GameObjectMock).toBeDefined();
  });

  test('should provide scene validation utilities', async () => {
    const testUtils = await import(testUtilsPath);
    expect(testUtils.validateSceneClass).toBeDefined();
    expect(testUtils.validateSceneInheritance).toBeDefined();
    expect(testUtils.validateSceneMethods).toBeDefined();
  });

  test('should provide ESM-compatible test helpers', async () => {
    const testUtils = await import(testUtilsPath);
    expect(testUtils.createSceneInstance).toBeDefined();
    expect(testUtils.mockPhaserMethods).toBeDefined();
    expect(testUtils.setupTestEnvironment).toBeDefined();
  });

  test('should handle Phaser import errors gracefully', async () => {
    const testUtils = await import(testUtilsPath);
    expect(testUtils.createSafePhaserMock).toBeDefined();
    
    // Test that it doesn't throw when Phaser is not available
    const mock = testUtils.createSafePhaserMock();
    expect(mock).toBeDefined();
    expect(mock.Scene).toBeDefined();
  });

  test('should provide class structure validation', async () => {
    const testUtils = await import(testUtilsPath);
    expect(testUtils.validateClassStructure).toBeDefined();
    expect(testUtils.validateMethodSignatures).toBeDefined();
    expect(testUtils.validateInheritanceChain).toBeDefined();
  });
}); 
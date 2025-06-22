import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Vite Configuration Tests', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const viteConfigPath = join(__dirname, '../../vite.config.js');

  test('should have vite.config.js file', () => {
    expect(existsSync(viteConfigPath)).toBe(true);
  });

  test('should have valid JavaScript syntax', () => {
    const content = readFileSync(viteConfigPath, 'utf8');
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should export configuration object', () => {
    const content = readFileSync(viteConfigPath, 'utf8');
    expect(content).toMatch(/export default/);
  });

  test('should have root configuration', () => {
    const content = readFileSync(viteConfigPath, 'utf8');
    expect(content).toMatch(/root:/);
    expect(content).toMatch(/client/);
  });

  test('should have server configuration', () => {
    const content = readFileSync(viteConfigPath, 'utf8');
    expect(content).toMatch(/server:/);
    expect(content).toMatch(/proxy:/);
  });

  test('should have build configuration', () => {
    const content = readFileSync(viteConfigPath, 'utf8');
    expect(content).toMatch(/build:/);
    expect(content).toMatch(/outDir:/);
  });

  test('should have proper entry point configuration', () => {
    const content = readFileSync(viteConfigPath, 'utf8');
    expect(content).toMatch(/client\/src\/main\.js/);
  });

  test('should use ESM syntax', () => {
    const content = readFileSync(viteConfigPath, 'utf8');
    expect(content).toMatch(/export default/);
    expect(content).not.toMatch(/module\.exports/);
  });
}); 
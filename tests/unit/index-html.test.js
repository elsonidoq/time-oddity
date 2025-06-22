import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Index HTML Tests', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const indexPath = join(__dirname, '../../client/index.html');

  test('should have index.html file', () => {
    expect(existsSync(indexPath)).toBe(true);
  });

  test('should have valid HTML structure', () => {
    const content = readFileSync(indexPath, 'utf8');
    expect(content).toMatch(/<!DOCTYPE html>/);
    expect(content).toMatch(/<html/);
    expect(content).toMatch(/<head/);
    expect(content).toMatch(/<body/);
  });

  test('should have game-container div', () => {
    const content = readFileSync(indexPath, 'utf8');
    expect(content).toMatch(/<div[^>]*id=["']game-container["'][^>]*>/);
  });

  test('should have Vite entry point script', () => {
    const content = readFileSync(indexPath, 'utf8');
    expect(content).toMatch(/<script[^>]*type=["']module["'][^>]*>/);
    expect(content).toMatch(/src=["']\/src\/main\.js["']/);
  });

  test('should have proper meta tags', () => {
    const content = readFileSync(indexPath, 'utf8');
    expect(content).toMatch(/<meta[^>]*charset/);
    expect(content).toMatch(/<meta[^>]*viewport/);
  });

  test('should have proper title', () => {
    const content = readFileSync(indexPath, 'utf8');
    expect(content).toMatch(/<title[^>]*>.*Time.*Oddity.*<\/title>/);
  });

  test('should have proper CSS styling', () => {
    const content = readFileSync(indexPath, 'utf8');
    expect(content).toMatch(/<style/);
    expect(content).toMatch(/game-container/);
  });
}); 
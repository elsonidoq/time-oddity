import { jest } from '@jest/globals';

// A mock class for game objects to be used in the pool
class MockGameObject {
  constructor() {
    this.active = false;
    this.visible = false;
  }

  setActive(isActive) {
    this.active = isActive;
    return this;
  }

  setVisible(isVisible) {
    this.visible = isVisible;
    return this;
  }
}

// Dynamically import the ObjectPool class
let ObjectPool;

describe('Task 1.22: Object Pool System', () => {
  beforeAll(async () => {
    const module = await import('../../client/src/systems/ObjectPool.js');
    ObjectPool = module.default;
  });

  let pool;
  let mockGroup;

  beforeEach(() => {
    // Mock the Phaser Group
    mockGroup = {
      add: jest.fn(),
      remove: jest.fn(),
      getChildren: jest.fn(() => []),
      get: jest.fn(),
    };
    pool = new ObjectPool(mockGroup, () => new MockGameObject());
  });

  test('should create a new object if pool is empty', () => {
    const obj = pool.get();
    expect(obj).toBeInstanceOf(MockGameObject);
    expect(obj.active).toBe(true);
    expect(obj.visible).toBe(true);
    expect(mockGroup.add).toHaveBeenCalledWith(obj);
  });

  test('should recycle an inactive object from the pool', () => {
    const inactiveObj = new MockGameObject();
    inactiveObj.active = false;
    mockGroup.getChildren.mockReturnValue([inactiveObj]);
    
    const obj = pool.get();
    
    expect(obj).toBe(inactiveObj);
    expect(obj.active).toBe(true);
    expect(obj.visible).toBe(true);
    expect(mockGroup.add).not.toHaveBeenCalled();
  });

  test('should release an object back to the pool', () => {
    const obj = new MockGameObject();
    obj.active = true;
    obj.visible = true;

    pool.release(obj);

    expect(obj.active).toBe(false);
    expect(obj.visible).toBe(false);
  });

  test('should handle getting multiple objects', () => {
    const obj1 = pool.get();
    const obj2 = pool.get();

    expect(obj1).not.toBe(obj2);
    expect(obj1).toBeInstanceOf(MockGameObject);
    expect(obj2).toBeInstanceOf(MockGameObject);
  });

  test('should not fail when releasing a null object', () => {
    expect(() => pool.release(null)).not.toThrow();
  });
}); 
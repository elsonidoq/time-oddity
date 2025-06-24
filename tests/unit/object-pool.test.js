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

  describe('Physics Body Cleanup', () => {
    test('should disable physics body when object is released', () => {
      const mockObject = {
        setActive: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        body: {
          enable: true,
          setVelocity: jest.fn(),
          setAllowGravity: jest.fn(),
          setCollideWorldBounds: jest.fn()
        }
      };

      pool.release(mockObject);

      expect(mockObject.body.enable).toBe(false);
      expect(mockObject.body.setVelocity).toHaveBeenCalledWith(0, 0);
      expect(mockObject.body.setAllowGravity).toHaveBeenCalledWith(false);
      expect(mockObject.body.setCollideWorldBounds).toHaveBeenCalledWith(false);
    });

    test('should handle objects without physics bodies gracefully', () => {
      const mockObject = {
        setActive: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis()
        // No body property
      };

      expect(() => pool.release(mockObject)).not.toThrow();
      expect(mockObject.setActive).toHaveBeenCalledWith(false);
      expect(mockObject.setVisible).toHaveBeenCalledWith(false);
    });

    test('should reset object properties when released', () => {
      const mockObject = {
        setActive: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        body: {
          enable: true,
          setVelocity: jest.fn(),
          setAllowGravity: jest.fn(),
          setCollideWorldBounds: jest.fn()
        }
      };

      pool.release(mockObject);

      expect(mockObject.setPosition).toHaveBeenCalledWith(0, 0);
      expect(mockObject.setScale).toHaveBeenCalledWith(1);
      expect(mockObject.setAlpha).toHaveBeenCalledWith(1);
    });

    test('should handle physics bodies with missing methods gracefully', () => {
      const mockObject = {
        setActive: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setPosition: jest.fn().mockReturnThis(),
        setScale: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis(),
        body: {
          enable: true
          // Missing physics methods
        }
      };

      expect(() => pool.release(mockObject)).not.toThrow();
      expect(mockObject.body.enable).toBe(false);
    });
  });
}); 
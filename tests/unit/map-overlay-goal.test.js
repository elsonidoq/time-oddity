// TDD Red Phase: Goal Rendering in MapOverlay
import '../mocks/phaserMock.js';
import { PhaserSceneMock } from '../mocks/phaserSceneMock.js';
import { jest } from '@jest/globals';
import MapOverlay from '../../client/src/ui/MapOverlay.js';

describe('MapOverlay Goal Rendering', () => {
  let mockScene;
  let mapOverlay;
  let mockGraphics;

  beforeEach(() => {
    mockScene = new PhaserSceneMock();
    mockGraphics = {
      setDepth: jest.fn().mockReturnThis(),
      setVisible: jest.fn().mockReturnThis(),
      setPosition: jest.fn().mockReturnThis(),
      clear: jest.fn().mockReturnThis(),
      fillStyle: jest.fn().mockReturnThis(),
      fillRect: jest.fn().mockReturnThis(),
      fillCircle: jest.fn().mockReturnThis(),
      lineStyle: jest.fn().mockReturnThis(),
      strokeRect: jest.fn().mockReturnThis(),
      destroy: jest.fn()
    };
    mockScene.add.graphics = jest.fn(() => mockGraphics);
    
    mapOverlay = new MapOverlay(mockScene);
    mapOverlay.create();
    mapOverlay.calculateMapScale(2000, 1500);
  });

  describe('Goal Data Caching', () => {
    test('should store goal data for efficient re-rendering', () => {
      const goalData = { x: 4000, y: 850 };
      mapOverlay.renderGoal(goalData);
      expect(mapOverlay._goalData).toEqual(goalData);
    });
  });

  describe('Goal Rendering Method', () => {
    test('should render goal as red circle', () => {
      const goalData = { x: 4000, y: 850 };
      mapOverlay.renderGoal(goalData);
      expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0xff0000, 1);
      expect(mockGraphics.fillCircle).toHaveBeenCalled();
    });
  });

  describe('Goal Integration in Update Cycle', () => {
    test('should render goal in updatePlayerPosition cycle', () => {
      // Arrange: Set up goal data and platform data within bounds
      // Use unscaled coordinates to match real game behavior
      const goalData = { x: 3000, y: 1700 }; // within 2000x1500 (scaled by LEVEL_SCALE)
      const platformData = [{ x: 0, y: 1312, width: 2000, height: 128 }];
      
      mapOverlay.renderGoal(goalData);
      mapOverlay.renderPlatforms(platformData);
      
      // Act: Call updatePlayerPosition which should re-render everything
      mapOverlay.updatePlayerPosition(400, 1740);
      
      // Assert: Goal should be rendered as red circle
      expect(mockGraphics.fillStyle).toHaveBeenCalledWith(0xff0000, 1);
      expect(mockGraphics.fillCircle).toHaveBeenCalled();
      
      // Verify the goal circle was drawn with appropriate coordinates
      // Input coordinates are already scaled by LEVEL_SCALE (0.5)
      // So 3000,1700 becomes 6000,3400 after dividing by LEVEL_SCALE
      // Then with mapScale 0.1: 6000*0.1=600, 3400*0.1=340
      const expectedX = 600; // 3000 / 0.5 * 0.1
      const expectedY = 340; // 1700 / 0.5 * 0.1
      
      const goalCall = mockGraphics.fillCircle.mock.calls.find(call => {
        return Math.abs(call[0] - expectedX) < 1 && Math.abs(call[1] - expectedY) < 1;
      });
      expect(goalCall).toBeDefined();
    });

    test('should maintain goal visibility across multiple updates', () => {
      // Arrange: Set up goal data
      const goalData = { x: 4000, y: 850 };
      mapOverlay.renderGoal(goalData);
      
      // Act: Call updatePlayerPosition multiple times
      mapOverlay.updatePlayerPosition(200, 870);
      mapOverlay.updatePlayerPosition(250, 870);
      mapOverlay.updatePlayerPosition(300, 870);
      
      // Assert: Goal should be rendered in each update cycle
      const redStyleCalls = mockGraphics.fillStyle.mock.calls.filter(call => 
        call[0] === 0xff0000 && call[1] === 1
      );
      expect(redStyleCalls.length).toBeGreaterThan(0);
    });
  });
}); 
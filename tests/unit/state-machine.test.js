import { jest } from '@jest/globals';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

describe('Task 2.5: StateMachine Class', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const stateMachinePath = join(__dirname, '../../client/src/systems/StateMachine.js');
  let StateMachine;

  beforeAll(async () => {
    if (existsSync(stateMachinePath)) {
      const stateMachineModule = await import(stateMachinePath);
      StateMachine = stateMachineModule.default;
    } else {
      StateMachine = class StateMachine {
        constructor() {
          this.states = new Map();
          this.currentState = null;
        }
        addState(name, state) { this.states.set(name, state); }
        setState(name) { 
          if (!this.states.has(name)) return;
          if (this.currentState && this.currentState.exit) this.currentState.exit();
          this.currentState = this.states.get(name);
          if (this.currentState.enter) this.currentState.enter();
        }
        update(time, delta) { if (this.currentState && this.currentState.execute) this.currentState.execute(time, delta); }
      };
    }
  });

  test('StateMachine class file should exist', () => {
    expect(existsSync(stateMachinePath)).toBe(true);
  });

  let stateMachine;
  let mockState1;
  let mockState2;

  beforeEach(() => {
    stateMachine = new StateMachine();
    mockState1 = {
      enter: jest.fn(),
      execute: jest.fn(),
      exit: jest.fn(),
    };
    mockState2 = {
      enter: jest.fn(),
      execute: jest.fn(),
      exit: jest.fn(),
    };
    stateMachine.addState('state1', mockState1);
    stateMachine.addState('state2', mockState2);
  });

  test('should add and retrieve states', () => {
    expect(stateMachine.states.get('state1')).toBe(mockState1);
    expect(stateMachine.states.get('state2')).toBe(mockState2);
  });

  test('should set initial state and call enter', () => {
    stateMachine.setState('state1');
    expect(stateMachine.currentState).toBe(mockState1);
    expect(mockState1.enter).toHaveBeenCalledTimes(1);
    expect(mockState1.exit).not.toHaveBeenCalled();
    expect(mockState2.enter).not.toHaveBeenCalled();
  });

  test('should transition between states, calling exit and enter', () => {
    stateMachine.setState('state1');
    stateMachine.setState('state2');

    expect(stateMachine.currentState).toBe(mockState2);
    expect(mockState1.exit).toHaveBeenCalledTimes(1);
    expect(mockState2.enter).toHaveBeenCalledTimes(1);
  });

  test('should not call exit on the first state change', () => {
    stateMachine.setState('state1');
    expect(mockState1.exit).not.toHaveBeenCalled();
  });

  test('should call execute on the current state when update is called', () => {
    stateMachine.setState('state1');
    stateMachine.update(100, 16);
    expect(mockState1.execute).toHaveBeenCalledWith(100, 16);
    expect(mockState2.execute).not.toHaveBeenCalled();
  });
  
  test('should do nothing if setState is called with a non-existent state', () => {
    stateMachine.setState('state1');
    stateMachine.setState('nonExistentState');
    expect(stateMachine.currentState).toBe(mockState1);
  });
}); 
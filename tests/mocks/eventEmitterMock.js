/**
 * Centralized Event Emitter Mock for Event Testing
 * 
 * This mock provides a complete simulation of Phaser event emitter functionality
 * for use across all event-related tests. It supports event registration, emission,
 * listener management, and event history inspection.
 * 
 * @module eventEmitterMock
 */

/**
 * Creates a mock function that works both in and outside of Jest
 * @param {Function} implementation - Optional implementation function
 * @returns {Function} Mock function
 */
function createMockFn(implementation) {
  if (typeof jest !== 'undefined') {
    return jest.fn(implementation);
  } else {
    // Fallback for non-Jest environments
    const mockFn = function(...args) {
      mockFn.calls.push(args);
      return implementation ? implementation.apply(this, args) : undefined;
    };
    mockFn.calls = [];
    mockFn.mockClear = function() { this.calls = []; };
    mockFn.mockImplementation = function(impl) { implementation = impl; };
    return mockFn;
  }
}

/**
 * Creates a fresh event emitter mock instance
 * @returns {EventEmitterMock} A new event emitter mock instance
 */
export function createEventEmitterMock() {
  return new EventEmitterMock();
}

/**
 * Event Emitter Mock Class
 * Simulates Phaser event emitter with full event and listener management
 */
export class EventEmitterMock {
  constructor() {
    this._listeners = {};
    this._emittedEvents = [];

    // Event registration
    this.on = createMockFn((eventName, callback) => {
      if (!this._listeners[eventName]) this._listeners[eventName] = [];
      this._listeners[eventName].push(callback);
    });
    this.off = createMockFn((eventName, callback) => {
      if (!this._listeners[eventName]) return;
      if (!callback) {
        this._listeners[eventName] = [];
      } else {
        this._listeners[eventName] = this._listeners[eventName].filter(fn => fn !== callback);
      }
    });
    this.once = createMockFn((eventName, callback) => {
      const onceWrapper = (...args) => {
        callback(...args);
        this.off(eventName, onceWrapper);
      };
      this.on(eventName, onceWrapper);
    });

    // Event emission
    this.emit = createMockFn((eventName, ...args) => {
      this._emittedEvents.push({
        event: eventName,
        args,
        timestamp: Date.now()
      });
      if (this._listeners[eventName]) {
        this._listeners[eventName].forEach(fn => fn(...args));
      }
    });

    // Event removal
    this.removeAllListeners = createMockFn((eventName) => {
      if (eventName) {
        this._listeners[eventName] = [];
      } else {
        this._listeners = {};
      }
    });
  }

  // Control methods for tests
  resetMocks() {
    this.on.mockClear();
    this.off.mockClear();
    this.once.mockClear();
    this.emit.mockClear();
    this.removeAllListeners.mockClear();
    this._emittedEvents = [];
    this._listeners = {};
  }

  getEmittedEvents() {
    return [...this._emittedEvents];
  }

  getRegisteredListeners(eventName) {
    if (!eventName) return Object.values(this._listeners).flat();
    return this._listeners[eventName] ? [...this._listeners[eventName]] : [];
  }

  clearEmittedEvents() {
    this._emittedEvents = [];
  }

  clearRegisteredListeners() {
    this._listeners = {};
  }

  // Event history inspection
  wasEventEmitted(eventName) {
    return this._emittedEvents.some(e => e.event === eventName);
  }

  getEventEmitCount(eventName) {
    return this._emittedEvents.filter(e => e.event === eventName).length;
  }

  getLastEmittedEvent(eventName) {
    const events = this._emittedEvents.filter(e => e.event === eventName);
    return events.length > 0 ? events[events.length - 1] : null;
  }

  // Listener inspection
  getListenerCount(eventName) {
    return this._listeners[eventName] ? this._listeners[eventName].length : 0;
  }

  hasListener(eventName, callback) {
    if (!this._listeners[eventName]) return false;
    if (!callback) return this._listeners[eventName].length > 0;
    return this._listeners[eventName].includes(callback);
  }
}

export default {
  createEventEmitterMock,
  EventEmitterMock
}; 
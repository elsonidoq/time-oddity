// Global test setup
const mockFn = () => {};
mockFn.mock = { calls: [] };

global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: mockFn,
  // warn: mockFn,
  // error: mockFn,
};

// Mock DOM elements for Phaser tests
global.document = {
  createElement: () => ({
    style: {},
    getContext: () => ({
      fillRect: mockFn,
      clearRect: mockFn,
      getImageData: () => ({ data: new Array(4) }),
      putImageData: mockFn,
      createImageData: () => [],
      setTransform: mockFn,
      drawImage: mockFn,
      save: mockFn,
      fillText: mockFn,
      restore: mockFn,
      beginPath: mockFn,
      moveTo: mockFn,
      lineTo: mockFn,
      closePath: mockFn,
      stroke: mockFn,
      translate: mockFn,
      scale: mockFn,
      rotate: mockFn,
      arc: mockFn,
      fill: mockFn,
      measureText: () => ({ width: 0 }),
      transform: mockFn,
      rect: mockFn,
      clip: mockFn,
    }),
  }),
  body: {
    appendChild: mockFn,
    removeChild: mockFn,
  },
  getElementById: () => ({
    style: {},
    appendChild: mockFn,
    removeChild: mockFn,
  }),
  ontouchstart: null, // Mock for Phaser device input detection
};

global.window = {
  ...global.window,
  innerWidth: 1280,
  innerHeight: 720,
  devicePixelRatio: 1,
  addEventListener: mockFn,
  removeEventListener: mockFn,
  requestAnimationFrame: mockFn,
  cancelAnimationFrame: mockFn,
  ontouchstart: null, // Mock for Phaser device input detection
};

// Mock WebGL context
global.WebGLRenderingContext = function() {
  return {
    createBuffer: mockFn,
    bindBuffer: mockFn,
    bufferData: mockFn,
    createShader: mockFn,
    shaderSource: mockFn,
    compileShader: mockFn,
    createProgram: mockFn,
    attachShader: mockFn,
    linkProgram: mockFn,
    useProgram: mockFn,
    getAttribLocation: mockFn,
    getUniformLocation: mockFn,
    uniformMatrix4fv: mockFn,
    uniform1i: mockFn,
    uniform2f: mockFn,
    uniform3f: mockFn,
    uniform4f: mockFn,
    enableVertexAttribArray: mockFn,
    vertexAttribPointer: mockFn,
    drawArrays: mockFn,
    clearColor: mockFn,
    clear: mockFn,
    viewport: mockFn,
  };
};

// Mock getContext for Phaser in jsdom
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function getContext(type) {
    // Return a minimal mock context object
    return {
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
      createImageData: () => [],
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {},
    };
  };
}

global.HTMLCanvasElement = function() {
  return {
    getContext: () => ({
      fillRect: mockFn,
      clearRect: mockFn,
      getImageData: () => ({ data: new Array(4) }),
      putImageData: mockFn,
      createImageData: () => [],
      setTransform: mockFn,
      drawImage: mockFn,
      save: mockFn,
      fillText: mockFn,
      restore: mockFn,
      beginPath: mockFn,
      moveTo: mockFn,
      lineTo: mockFn,
      closePath: mockFn,
      stroke: mockFn,
      translate: mockFn,
      scale: mockFn,
      rotate: mockFn,
      arc: mockFn,
      fill: mockFn,
      measureText: () => ({ width: 0 }),
      transform: mockFn,
      rect: mockFn,
      clip: mockFn,
    }),
    style: {},
    width: 1280,
    height: 720,
  };
}; 
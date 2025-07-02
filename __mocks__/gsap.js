const timelineMock = () => ({
  to: function() { return this; },
  from: function() { return this; },
  set: function() { return this; },
  play: function() {},
  pause: function() {},
  kill: function() {},
});

export default {
  timeline: jest.fn(timelineMock),
}; 
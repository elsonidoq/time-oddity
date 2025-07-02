export default {
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^phaser$': '<rootDir>/tests/mocks/phaserMock.js',
    '^gsap$': '<rootDir>/tests/mocks/gsapMock.js',
    '^howler$': '<rootDir>/tests/__mocks__/howler.cjs',
    '^matter-js$': '<rootDir>/tests/__mocks__/matter-js.cjs',
    '^\./matter-js$': '<rootDir>/tests/__mocks__/matter-js.cjs',
    '^phaser3spectorjs$': '<rootDir>/tests/__mocks__/phaser3spectorjs.cjs',
    '^(\.{1,2}/.*)\.js$': '$1',
  },
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'client/src/**/*.js',
    'server/**/*.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFiles: ['<rootDir>/tests/mocks/phaserMock.js'],
}; 
/**
 * @fileoverview Main entry point for level generation system
 * Exports all modules and provides the main API
 */

const core = require('./core');
const validation = require('./validation');
const cli = require('./cli');
const monitoring = require('./monitoring');

module.exports = {
  core,
  validation,
  cli,
  monitoring,
  
  // Main generation function will be implemented in subsequent tasks
  generateLevel: (config) => {
    throw new Error('Level generation not yet implemented');
  }
}; 
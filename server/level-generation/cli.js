#!/usr/bin/env node

/**
 * @fileoverview CLI entry point for level generation system
 * Provides command-line interface for cave generation
 */

const CaveGeneratorCLI = require('./src/cli/CaveGeneratorCLI');

// Create and run the CLI
const cli = new CaveGeneratorCLI();
cli.parse(); 
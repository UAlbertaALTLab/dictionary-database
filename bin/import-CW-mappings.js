#!/usr/bin/env node

import importCWMappings from '../lib/import/CW-mappings.js';
import program          from 'commander';

program
.arguments(`<mappingsPath> <databasePath> [outPath]`)
.action(importCWMappings);

program.parse(process.argv);

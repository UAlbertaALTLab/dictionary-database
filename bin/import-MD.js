#!/usr/bin/env node

import importMD from '../lib/import/MD.js';
import program  from 'commander';

program
.arguments(`<mdPath> <databasePath>`)
.usage(`convert-md <mdPath> <databasePath>`)
.action(importMD);

program.parse(process.argv);

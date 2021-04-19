#!/usr/bin/env node

import importCW from '../lib/import/CW.js';
import program  from 'commander';

program
.arguments(`<cwPath> <databasePath>`)
.usage(`convert-cw <cwPath> <databasePath>`)
.action(importCW);

program.parse(process.argv);

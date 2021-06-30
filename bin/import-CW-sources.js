import importCWSources from '../lib/import/CW-sources.js';
import program         from 'commander';

program
.arguments(`<sourcesPath> <toolboxPath> [outPath]`)
.option(`-r, --reportUnmatched [outPath]`, `report unmatched entries`, false)
.action(importCWSources);

program.parse(process.argv);

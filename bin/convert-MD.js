#!/usr/bin/env node

import convert from '../lib/convert/MD.js';
import program from 'commander';

program
.arguments(`<inputPath> <outputPath> [mappingsPath]`)
.usage(`convert-md <inputPath> <outputPath> [mappingsPath]`)
.action(convert);

program.parse(process.argv);

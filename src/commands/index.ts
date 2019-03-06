#!/usr/bin/env node

import * as yargs from 'yargs';
import createMigration from './createMigration';

const argv = yargs
  .command(createMigration)
  .help('h')
  .alias('h', 'help').argv;

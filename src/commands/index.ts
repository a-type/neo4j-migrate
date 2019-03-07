#!/usr/bin/env node

import * as yargs from 'yargs';
import createMigration from './createMigration';
import up from './up';
import down from './down';

const argv = yargs
  .command(createMigration)
  .command(up)
  .command(down)
  .help('h')
  .alias('h', 'help').argv;

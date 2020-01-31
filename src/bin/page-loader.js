#!/usr/bin/env node

import commander from 'commander';
import pageLoader from '..';
import { version } from '../../package.json';


commander
  .version(version)
  .description('Download a website with a given link')
  .option('-o, --output [tempDir]', 'temp output directory')
  .arguments('<linkToDownload>')
  .action((linkToDownload, option) => {
    pageLoader(linkToDownload, option.output);
  })
  .parse(process.argv);

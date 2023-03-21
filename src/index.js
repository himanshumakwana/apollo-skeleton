#!/usr/bin/env node

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('@rollup/plugin-json');

import chalk from "chalk"
import { Command } from "commander"
const packageJson = require("../package.json")

console.log(chalk.blue("Package version: ", packageJson.version))
console.log(chalk.blue("Creating subgraph"))

const program = new Command()

program.version(packageJson.version)

program
  .command('hello')
  .description('say hello')
  .action(() => {
    console.log('Hello!');
  });

program.parse(process.argv);

#!/usr/bin/env node

import { exec } from "child_process"
import chalk from "chalk"

console.log(chalk.blue("Creating subgraph"))

exec('src/scripts/init.sh', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

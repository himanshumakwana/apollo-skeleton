#!/usr/bin/env node

import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("@rollup/plugin-json");

import chalk from "chalk";
import { Command } from "commander";
const packageJson = require("../package.json");

import { exec } from "child_process";
import { exit } from "process";
import ora from "ora";

console.log(
  chalk.blueBright.bold(
    "You are using apollo-skeleton version: ",
    packageJson.version
  )
);

const subgraphTemplate = ({ port }) => `
  import { ApolloServer } from "@apollo/server";
  import { buildSubgraphSchema } from "@apollo/subgraph";
  import { startStandaloneServer } from "@apollo/server/standalone"
  import gql from "graphql-tag";

  const typeDefs = gql\\\`
    extend schema
      @link(url: "https://specs.apollo.dev/federation/v2.3",
            import: ["@key", "@shareable", "@inaccessible"])
    
      type Query {
        hello: string
      }
  \\\`;
  
  const resolvers = {
    Query: {
      hello() {
        return "hello world";
      },
    }
  };
  
  const start = async () => {
    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
    })

    const { url } = await startStandaloneServer(server, { listen: { port: ${port} } })
  
    console.log('server is running on' + url)
  }
  
  start()
`;

const program = new Command();

program.version(packageJson.version);

program
  .command("subgraph")
  .argument("<name>", "Name of subgraph")
  .option("-p, --port <number>", "define port for Apollo Graphql Server", 4001)
  .description("create subgraph using apollo-skeleton")
  .action(async (name, options) => {
    main(name, options);
  });

program.parse(process.argv);

async function main(name, options) {
  let spinner;
  const port = options.port ? options.port : 4001;

  console.log(chalk.bgCyanBright.bold("Creating Folder\n"));

  await folderValidation(name);
  await execAsync(`mkdir ${name}`);

  const cdPath = `cd ${name} && `;

  console.log(chalk.bgCyanBright.bold("Initialising NPM..."));

  await execAsync(`${cdPath} npm init -y`);

  spinner = ora("Installing dependency...");
  spinner.start();
  await execAsync(
    `${cdPath} npm install @apollo/server @apollo/subgraph dotenv graphql graphql-tag`
  );
  spinner.succeed();

  spinner = ora("Installing dev dependency...");
  spinner.start();
  await execAsync(`${cdPath} npm install -D ts-node-dev typescript`);
  spinner.stop();

  await execAsync(`${cdPath} mkdir src`);

  const srcPath = `${name}/src`;
  await execAsync(`cd ${srcPath} && touch app.ts`);

  await execAsync(`cat <<EOF >${srcPath}/app.ts 
    ${subgraphTemplate({ port })}
  \nEOF`);
}

async function execAsync(command) {
  return new Promise((res, rej) => {
    exec(`${command}`, (error, stdout, stderr) => {
      if (error) {
        rej(error);
      } else {
        res(stdout);
      }
    });
  });
}

async function folderValidation(name) {
  const regxFolder = /^[a-zA-Z0-9_\-\.]+$/;
  if (!regxFolder.test(name)) {
    console.log(chalk.redBright.bold("Invalid folder name."));
    exit(1);
  }

  try {
    await execAsync(`[ -d "${name}" ]`);
    console.log(chalk.redBright.bold("Folder already exists."));
    exit(1);
  } catch {
    console.log(chalk.greenBright.overline("Creating Folder"));
  }
}
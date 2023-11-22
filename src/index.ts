#!/usr/bin/env npx ts-node

import { spawnSync } from "child_process";
import * as fs from "fs";
import { Command } from "commander";
import { textSync } from "figlet";

async function doStuff(opts: any) {
  console.log(
    textSync("Handy GraphQL", {
      font: "Big Money-ne",
      horizontalLayout: "default",
      verticalLayout: "default",
      width: 80,
      whitespaceBreak: true,
    })
  );

  fs.copyFileSync(`${__dirname}/generator.ts`, `${process.cwd()}/generator.ts`);
  spawnSync("npm", ["install"]);
  spawnSync(
    "npx",
    [
      "ts-node",
      `${process.cwd()}/generator.ts`,
      opts.destination,
      opts.globPattern,
    ],
    {
      stdio: "inherit",
      timeout: 600000,
    }
  );
  fs.rmSync(`${process.cwd()}/generator.ts`);
}

(async () => {
  try {
    const program = new Command();
    program
      .name("handy-graphql")
      .description(
        "A handy tool to generate GraphQL schema from your NestJS project"
      )
      .version("0.1.0")
      .option(
        "-d, --destination <destination>",
        "Destination of the generated schema file",
        "schema/schema.gql"
      )
      .option(
        "-g, --glob-pattern <globPattern>",
        "Glob pattern to match",
        "./src/**/*.resolver.ts"
      )
      .action(async () => {
        await doStuff(program.opts());
      });
    program.parse(process.argv);
  } catch (e) {
    console.error(e);
  }
})();

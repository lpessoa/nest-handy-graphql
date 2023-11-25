/* eslint-disable no-console */
import { NestFactory } from "@nestjs/core";
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from "@nestjs/graphql";
import { printSchema } from "graphql";
import fs from "fs/promises";
import f from "fs";
import path from "path";
import { exit } from "process";
import { glob } from "glob";
import chalk from "chalk";
import { INestApplication } from "@nestjs/common";

async function generateSchema() {
  const [gqlPath, globPattern] = process.argv.slice(2);
  let app: INestApplication;
  app = await NestFactory.create(GraphQLSchemaBuilderModule, { logger: false });
  console.log(chalk.bold.blueBright("initializing app..."));
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);

  console.log(chalk.bold.blueBright("fetching resolvers..."));
  const jsfiles = await glob(globPattern, {
    absolute: true,
  });
  const resolvers: Function[] = [];
  for (let i = 0; i < jsfiles.length; ++i) {
    const mod = await import(jsfiles[i]);
    const klass = mod[Object.keys(mod)[0]];
    resolvers.push(klass);
  }

  console.log(chalk.bold.blueBright("generating schema..."));
  const schema = await gqlSchemaFactory.create(resolvers);
  const strSchema = printSchema(schema);

  if (!f.existsSync(gqlPath)) {
    f.mkdirSync(path.dirname(gqlPath));
  }

  console.log(chalk.bold.blueBright(`writing schema to ${gqlPath} ...`));
  await fs.writeFile(gqlPath, strSchema);

  console.log(chalk.bold.green(`successfuly wrote schema to ${gqlPath}.`));
  app.close();
}

(async () => {
  try {
    await generateSchema();
  } catch (e) {
    console.error(
      chalk.bold.red(`error while generating SDL: ${JSON.stringify(e)}`)
    );
    exit(1);
  }
})();

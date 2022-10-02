#!/usr/bin/env node
const lib = require("./lib");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

yargs(hideBin(process.argv))
  .command(
    "run",
    "publish messages to gateway",
    lib.commandBuilder,
    lib.commandHandler
  )
  .option("config", {
    type: "string",
    description: "Path to configuration file",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .parse();

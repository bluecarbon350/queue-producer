const lib = require("./lib");
const path = require('path');
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

yargs(hideBin(process.argv))
  .command(
    "run",
    "publish messages to gateway",
    (yargs) => {},
    (argv) => lib.start(argv)
  )
  .option("config", {
    type: "string",
    description: "Path to configuration file",
    default: "",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .parse();

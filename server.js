const lib = require("./lib");
const path = require('path');
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

yargs(hideBin(process.argv))
  .command(
    "simulate",
    "send messages to gateway",
    (yargs) => {},
    (argv) => lib.streamMessages(argv)
  )
  .option("channel", {
    type: "string",
    description: "Message channel name",
    default: "data",
  })
  .option("credentials", {
    type: "string",
    description: "Path to credentials file",
    default: path.join(process.cwd(), 'credentials.json'),
  })
  .option("gateway", {
    describe: "MQTT data collection gateway",
    default: "gateway.bluecarbon.cc",
    type: "string",
  })
  .option("port", {
    describe: "gateway port",
    default: 5672,
    type: "number",
  })
  .option("rate", {
    describe: "Average frequency of messages (ms)",
    default: 1000,
    type: "number",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .parse();

const fs = require("fs");
const mqtt = require("async-mqtt");
const path = require("path");

const DATA_PATH = path.join(process.cwd(), "data");

/**
 * Sleep for N milliseconds.
 * @param {number} ms - duration to sleep in milliseconds
 * @returns {Promise}
 */
async function sleep(ms = 1000) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, ms);
  });
}

/**
 * Send mock data stream to remote MQTT server.
 * @param {object} ctx - configuration
 */
async function streamMessages(ctx) {
  try {
    console.log("reading credentials from", ctx.credentials);
    const credentialsData = fs.readFileSync(ctx.credentials, "utf8");
    const credentials = JSON.parse(credentialsData);
    console.log("connecting to MQTT gateway", ctx.gateway);
    const client = await mqtt.connectAsync(`mqtt://${ctx.gateway}`, {
      clientId: "simulator",
      username: credentials.username,
      password: credentials.password,
    });
    client.on("error", function (err) {
      console.error(err);
    });
    const filepath = path.join(DATA_PATH, "20220530-sensor-data.csv");
    console.log("reading mock data stream from", filePath);
    const data = fs.readFileSync(filepath, "utf8");
    const lines = data.split("\n");
    const columns = lines[0].split(",");
    console.log("found mock data fields", columns);
    console.log("starting data stream");
    let i = 0;
    let running = true;
    while (running) {
      i += 1;
      // TODO messages need device identifier, message sha, type and version
      console.log("sending", lines[i]);
      await client.publish("data", lines[i]);
      await sleep(ctx.rate);
      if (i === lines.length - 1) {
        i = 0;
      }
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  streamMessages,
};

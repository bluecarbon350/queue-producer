const amqp = require("amqplib/callback_api");
const fs = require("fs");
const mqtt = require("async-mqtt");
const path = require("path");

const DATA_PATH = path.join(process.cwd(), "data");

/**
 * Get credentials.
 * @param {*} ctx
 * @returns
 */
function getCredentials(ctx) {
  console.log("reading credentials from", ctx.credentials);
  const credentialsData = fs.readFileSync(ctx.credentials, "utf8");
  return JSON.parse(credentialsData);
}

/**
 * 
 * @param {*} ctx 
 */
async function saveMessage(ctx) {
  // TODO write the message to the specified storage location on disk
}

/**
 * Send messages as AMQP.
 * @param {object} ctx - configuration
 * @return {Promise}
 */
async function sendAmqpMessages(ctx) {
  const credentials = getCredentials(ctx);
  const connection = `amqp://${credentials.username}:${credentials.password}@${ctx.gateway}`;
  console.log("connecting to AMQP broker", credentials);
  amqp.connect(connection, function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(async function (error1, channel) {
      if (error1) {
        throw error1;
      }
      const filepath = path.join(DATA_PATH, "20220530-sensor-data.csv");
      console.log("reading mock data stream from", filepath);
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
        channel.sendToQueue(ctx.queue, Buffer.from(lines[i]));
        await sleep(ctx.rate);
        if (i === lines.length - 1) {
          i = 0;
        }
      }
    });
  });
}

/**
 * Send messages as MQTT.
 * @param {object} ctx - configuration
 * @return {Promise}
 */
async function sendMqttMessages(ctx) {
  console.log("connecting to MQTT broker", ctx.gateway);
  const credentials = getCredentials(ctx);
  const client = await mqtt.connectAsync(`mqtt://${ctx.gateway}`, {
    clientId: "simulator",
    username: credentials.username,
    password: credentials.password,
  });
  client.on("error", function (err) {
    console.error(err);
  });
  const filepath = path.join(DATA_PATH, "20220530-sensor-data.csv");
  console.log("reading mock data stream from", filepath);
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
    await client.publish(ctx.queue, lines[i]);
    await sleep(ctx.rate);
    if (i === lines.length - 1) {
      i = 0;
    }
  }
}

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
 * @return {Promise}
 */
async function streamMessages(ctx) {
  if (ctx.protocol === "amqp") {
    return sendAmqpMessages(ctx);
  } else if (ctx.protocol === "mqtt") {
    return sendMqttMessages(ctx);
  }
}

module.exports = {
  streamMessages,
};

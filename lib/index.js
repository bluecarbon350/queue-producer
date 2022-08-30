const amqp = require("amqplib/callback_api");
const fs = require("fs");
const mqtt = require("async-mqtt");
const path = require("path");

const DATA_PATH = path.join(process.cwd(), "data");

/**
 * Load configuration from file.
 * @param {string} configFilePath
 */
 function loadConfiguration(configFilePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(configFilePath, "utf8", function (err, data) {
      if (err) {
        reject(err);
      }
      try {
        const json = JSON.parse(data);
        resolve(json);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  });
}

/**
 * Send messages as AMQP.
 * @param {object} ctx - configuration
 * @return {Promise}
 */
async function sendAmqpMessages(ctx) {
  const { queue, rate } = ctx;
  const url = `amqp://${queue.username}:${queue.password}@${queue.host}`;
  console.log("connecting to AMQP broker", url);
  amqp.connect(url, function (error0, connection) {
    if (error0) {
      console.error(error0);
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
        channel.sendToQueue(queue.name, Buffer.from(lines[i]));
        await sleep(rate);
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
  const { queue } = ctx;
  console.log("connecting to MQTT broker", queue.host);
  const client = await mqtt.connectAsync(`mqtt://${queue.host}`, {
    clientId: "simulator",
    username: queue.username,
    password: queue.password,
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
    await client.publish(queue.name, lines[i]);
    await sleep(rate);
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
 * @param {object} args - configuration
 * @return {Promise}
 */
async function start(args) {
  loadConfiguration(args.config).then(function (ctx) {
    const { queue } = ctx;
    if (queue.protocol === "amqp") {
      sendAmqpMessages(ctx);
    } else if (queue.protocol === "mqtt") {
      sendMqttMessages(ctx);
    }
  });
}

module.exports = {
  start,
};

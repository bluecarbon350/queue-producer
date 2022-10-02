const amqp = require("amqplib/callback_api");
const fs = require("fs");
const mqtt = require("async-mqtt");

const AccelerometerSensor = require("./AccelerometerSensor");
const Bar100Sensor = require("./Bar100Sensor");

/**
 * Configure command.
 * @param {Object} yargs - command builder
 */
function commandBuilder(yargs) {}

/**
 * Send mock data stream to remote MQTT server.
 * @param {object} args - configuration
 * @return {Promise}
 */
 async function commandHandler(args) {
  loadConfiguration(args.config).then(function (ctx) {
    const { queue } = ctx;
    if (queue.protocol === "amqp") {
      sendAmqpMessages(ctx);
    } else if (queue.protocol === "mqtt") {
      sendMqttMessages(ctx);
    }
  });
}

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
  console.log("connecting to AMQP broker", queue.host);
  const connectionOpts = {
    clientProperties: { connection_name: "myFriendlyName" },
  };
  amqp.connect(url, connectionOpts, function (error0, connection) {
    if (error0) {
      console.error(error0);
      throw error0;
    }
    connection.createChannel(async function (error1, channel) {
      if (error1) {
        throw error1;
      }
      const acceleration = new AccelerometerSensor();
      const pressure = new Bar100Sensor();
      acceleration.open();
      pressure.open();
      console.log("starting AMQP data stream");
      while (true) {
        // TODO messages need device identifier, message sha, type and version
        // TODO need to provide device ID
        // TOOD need to provide sensor ID, which in turn will idenfify the measurement point
        try {
          const [pressureData, pressureOptions] = pressure.getNextMessage();
          const [accelerationData, accelerationOptions] = acceleration.getNextMessage();
          channel.sendToQueue(
            queue.name,
            Buffer.from(pressureData),
            pressureOptions
          );
          channel.sendToQueue(
            queue.name,
            Buffer.from(accelerationData),
            accelerationOptions
          );
          await sleep(rate);
        } catch (err) {
          console.error(err);
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
  const { queue, rate } = ctx;
  console.log("connecting to MQTT broker", queue.host);
  const client = await mqtt.connectAsync(`mqtt://${queue.host}`, {
    clientId: "simulator",
    username: queue.username,
    password: queue.password,
  });
  client.on("error", function (err) {
    console.error(err);
  });
  const acceleration = new AccelerometerSensor("mqtt");
  acceleration.open();
  const pressure = new Bar100Sensor("mqtt");
  pressure.open();
  console.log("starting MQTT data stream");
  while (true) {
    // TODO messages need device identifier, message sha, type and version
    // TODO need to provide device ID
    // TOOD need to provide sensor ID, which in turn will idenfify the measurement point
    const [pressureData, pressureOptions] = pressure.getNextMessage();
    const [accelerationData, accelerationOptions] =
      acceleration.getNextMessage();
    await client.publish(queue.name, Buffer.from(pressureData));
    await client.publish(queue.name, Buffer.from(accelerationData));
    await sleep(rate);
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

module.exports = {
  commandBuilder,
  commandHandler
};

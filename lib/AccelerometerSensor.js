const fs = require("fs");
const path = require("path");

const DEFAULT_OPTIONS = {
  appId: "AppId",
  contentEncoding: 'base64',
  contentType: 'urn:bc:content:senml',
  headers: {},
  type: "urn:bc:type:acceleration",
  userId: "publisher",
};

class AccelerometerSensor {
  columns = [];
  count = 0;
  // filepath = path.join(process.cwd(), "data", "accelerometer-sensor-data.csv");
  filepath = path.join(process.cwd(), "data", "accelerometer.json");
  i = 1;
  lines = [];
  options = {};
  type = "amqp";

  constructor(type = "amqp", options = { ...DEFAULT_OPTIONS }) {
    this.options = options;
    this.type = type;
  }

  getNextMessage() {
    const timestamp = Date.now();
    // update the timestamp in the senml message
    const [first, ...rest] = this.lines[this.i];
    const msg = [ { ...first, bt: timestamp }, ...rest];
    console.log(timestamp, msg);
    this.i = this.i >= this.count ? 1 : this.i + 1;
    return [JSON.stringify(msg), { ...this.options, timestamp }];
  }

  getOptions() {
    return this.options;
  }

  open() {
    console.log("reading mock data stream from", this.filepath);
    const data = fs.readFileSync(this.filepath, "utf8");
    this.lines = JSON.parse(data);
    this.count = this.lines.length;
    this.i = 1;
  }
}

module.exports = AccelerometerSensor;

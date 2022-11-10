const fs = require("fs");
const path = require("path");

const DEFAULT_OPTIONS = {
  appId: "AppId",
  contentEncoding: 'base64',
  contentType: "urn:bc:content-type:senml",
  headers: {},
  type: "urn:bc:type:pressure+temperature",
  userId: "test",
};

class Bar100Sensor {
  columns = [];
  // filepath = path.join(process.cwd(), "data", "bar100-sensor-data.csv");
  filepath = path.join(process.cwd(), "data", "pressure.json");
  i = 1;
  lines = [];
  options = {};
  type = "amqp";

  constructor(type = "amqp", options = { ...DEFAULT_OPTIONS }) {
    this.options = options;
    this.type = type;
  }

  getNextMessage() {
    try {
      const timestamp = Date.now();
      // update the timestamp in the senml message
      const [first, ...rest] = this.lines[this.i];
      const msg = [{ ...first, bt: timestamp }, ...rest];
      const json = JSON.stringify(msg);
      console.log(timestamp, json);
      this.i = this.i >= this.lines.length - 1 ? 1 : this.i + 1;
      return [json, { ...this.options, timestamp }];
    } catch (err) {
      console.error(err);
    }
  }

  getOptions() {
    return this.options;
  }

  open() {
    console.log("reading mock data stream from", this.filepath);
    const data = fs.readFileSync(this.filepath, "utf8");
    this.lines = JSON.parse(data);
    this.i = 1;
  }
}

module.exports = Bar100Sensor;

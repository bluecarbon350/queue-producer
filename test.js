#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const fs = require('fs');
const path = require('path');

console.log("reading credentials from");
const credentialsPath = path.join(process.cwd(), 'credentials.json');
const credentialsData = fs.readFileSync(credentialsPath, "utf8");
const credentials = JSON.parse(credentialsData);
console.log("connecting to MQTT broker", 'gateway.bluecarbon.cc');

amqp.connect('amqp://test:test@gateway.bluecarbon.cc', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'data';
    var msg = 'Hello world';

    // channel.assertQueue(queue, {
    //   durable: false
    // });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });

  setTimeout(function() {
    connection.close();
    process.exit(0)
    }, 500);  
});


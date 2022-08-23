# Queue Producer

Simulates AUP, boat, drone, etc. device data streams and sends mock
data messages to the device gateway.

# Setup

Requires NodeJS 16 or greater. Install module dependencies:

    npm install

# Running

Display help:

    node ./server.js --help

Run the simulator with the default options:

    node ./server.js simulate

Run the simulator with a specific data collection endpoint:

    node ./server.js simulate --gateway gateway.example.com


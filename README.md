# Queue Producer

Simulates AUP, boat, drone, etc. device data streams and sends mock
data messages to the device gateway.

The current data format is SenML.

# Setup

Requires NodeJS 16 or greater. Install module dependencies:

    npm install

# Running

Display help:

    node ./server.js --help

Run the simulator with configuration:

    node ./server.js run --config ./path/to/config.json


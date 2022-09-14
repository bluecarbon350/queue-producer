const fs = require('fs');

function acceleration(arr) {
    return [
        {"bn": "urn:dev:bc:iup-000001:mp1", "bt": Date.now(), "bu": "m/s2" },
        {"n": "vx", "v": parseFloat(arr[1]), "u": 1},
        {"n": "vy", "v": parseFloat(arr[2]), "u": 1},
        {"n": "vz", "v": parseFloat(arr[3]), "u": 1},
        {"n": "gx", "v": parseFloat(arr[4]), "u": 1},
        {"n": "gy", "v": parseFloat(arr[5]), "u": 1},
        {"n": "gz", "v": parseFloat(arr[6]), "u": 1},
        {"n": "ax", "v": parseFloat(arr[7]), "u": 1},
        {"n": "ay", "v": parseFloat(arr[8]), "u": 1},
        {"n": "az", "v": parseFloat(arr[9]), "u": 1},
    ]
}

function pressure(arr) {
    return [
        {"bn": "urn:dev:bc:iup-000001:mp1", "bt": Date.now() },
        {"n": "pressure", "v": parseFloat(arr[1]), "u": "Pa"},
        {"n": "temperature", "v": parseFloat(arr[2]), "u": "Cel"},
        {"n": "altitude", "v": parseFloat(arr[3]), "u": "m"}
    ]
}


let data = fs.readFileSync("accelerometer-sensor-data.csv", "utf8");
let senml = data
  .split("\n")
  .slice(1)
  .map((line) => line.trim().split(","))
  .map((line) => acceleration(line));
fs.writeFileSync("accelerometer.json", JSON.stringify(senml, null, 2), "utf8");

data = fs.readFileSync("bar100-sensor-data.csv", "utf8");
senml = data
  .split("\n")
  .slice(1)
  .map((line) => line.trim().split(","))
  .map((line) => pressure(line));
fs.writeFileSync("pressure.json", JSON.stringify(senml, null, 2), "utf8");

console.log('done');

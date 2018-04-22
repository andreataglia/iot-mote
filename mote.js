///////////////////////////////////////
///////// Vars Config ////////////////
//////////////////////////////////////
const deviceId = 'pizero3';
const minute = 60 * 1000;
const watering_frequency_topic = 'field3';
const watering_duration_topic = 'field4';
var interval = 0.15;
var water_duration = 0.2; //in minutes
const isPi = require('detect-rpi')();

if (isPi) {
  var pump = require("pi-pins").connect(22),
    button = require("pi-pins").connect(17);
    button.mode('in');
    pump.mode('out');
    //set the initial value of the pump to be off.
    pressCount = 0;
    pump.value(false);
    var pumpIsOn = false;

    //look for a button press event and switch on the pump
    button.on('rise', function() {
        console.log("button pressed: " + (++pressCount) + " time(s)");
        pump.value(false);
    });
} else {
  // ...
}

var mqtt = require('mqtt'), url = require('url');
// Parse
var mqtt_url = url.parse('mqtt://bqmqptlw:bUouMU6bIdPx@m14.cloudmqtt.com:10671' || 'mqtt://localhost:1883');
var auth = (mqtt_url.auth || ':').split(':');

var options = {
    port: mqtt_url.port,
    host: mqtt_url.hostname,
    clientId: deviceId,
    username: auth[0],
    password: auth[1],
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};

// Create a client connection
var client = mqtt.connect(options);

////////////////////////////////////////
////////// Events Handling /////////////
///////////////////////////////////////
client.on('packetreceive', function(packet) {
    console.log(packet);
    if (packet.cmd == 'suback') { console.log("subscribed succesfully to topic"); }
    else if (packet.cmd == 'connack') { console.log("connected succesfully to MQTT broker");
    }
})
client.on('packetsend', function(packet) {
    console.log(packet);
})
client.on('message', function(topic, message) {
    // message is Buffer
    console.log("Got new message! Topic: " + topic + "; Message: " + message)
    topic.split("/").map(function(val) {
        if (val == watering_duration_topic) water_duration = Number(message);
        else if (val == watering_frequency_topic) interval = Number(message);
    });
})

///////////////////////////////////////////
//////////// Routine Functions ////////////
///////////////////////////////////////////
function pumpOn() {
  console.log("pump is on!");
  if (isPi) {
    if (!pumpIsOn) {
      pumpIsOn = true;
      pump.value(true);
    }
  }
}

function pumpOff() {
  console.log("pump is off.");
  if (isPi) {
    if (pumpIsOn) {
        pumpIsOn = false;
        pump.value(false);
      }
  }

}

function wakeupRoutine() {
    pumpOn();
    setTimeout(function() {
        pumpOff();
    }, water_duration * minute);
    //client.publish('new/prova', '' + water_duration + ',' + Date.now(), {qos: '1'});
}

setInterval(function() {
    console.log("starting routine function...");
    wakeupRoutine();
}, interval * minute);

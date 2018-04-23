///////////////////////////////////////
///////// Vars Config ////////////////
//////////////////////////////////////
const deviceId = 'bazzini/pizerow/';
const minute = 60 * 1000;
var interval = 0.3; //in minutes
var water_duration = 0.1; //in minutes
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

var mqtt = require('mqtt'),
  url = require('url');
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
  if (packet.cmd == 'suback') {
    console.log("subscribed succesfully to topic");
  } else if (packet.cmd == 'connack') {
    console.log("connected succesfully to MQTT broker");
  }
})
client.on('packetsend', function(packet) {
  console.log(packet);
})
client.on('connect', function(packet) {
  client.subscribe(deviceId + 'config');
  client.publish(deviceId + 'reqconfig', 'freq,time', {
    qos: '1'
  });
  blinkPump();
})
client.on('message', function(topic, message) {
  // message is Buffer
  console.log("Got new message! Topic: " + topic + "; Message: " + message)

  //TODO check if topic is config
  var data = message.toString().split(",");
  interval = Number(data[0]);
  water_duration = Number(data[1]);
  console.log("changed config. new interval=" + interval + "; new water_duration=" + water_duration);
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

//TODO careful to remove this once pump is actually connected
function blinkPump() {
  if (isPi) {
    setTimeout(function() {
      pump.value(true);
    }, 1000);
    setTimeout(function() {
      pump.value(false);
    }, 2000);
    setTimeout(function() {
      pump.value(true);
    }, 3000);
    setTimeout(function() {
      pump.value(false);
    }, 4000);
  }
  console.log("mote ready");
}

function wakeupRoutine() {
  pumpOn();
  setTimeout(function() {
    pumpOff();
  }, water_duration * minute);
  client.publish(deviceId + 'watering', '' + Date.now() + ',' + water_duration, {
    qos: '1'
  });
  setTimeout(function() {
    wakeupRoutine();
  }, interval * minute);
}

setTimeout(function() {
  wakeupRoutine();
}, interval * minute);

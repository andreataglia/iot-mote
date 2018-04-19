///////// Vars Config ///////////////
//////////////////////////////////////
var mqtt = require('mqtt')
const deviceId = '479190';
const minute = 60 * 1000;
const watering_frequency_topic = 'field3';
const watering_duration_topic = 'field4';
const ts_pass_key = 'A1TOKCY6SJL0Z7SY';
const ts_pub_key = '2MNIAA6FGRJPSLQ2';
const ts_sub_key = '1GQ2H4LJL64ISJEZ';
var interval = 0.15;
var water_duration = 0.4; //in minutes
var conn_tries = 0;
var options = {
    port: 1883,
    host: 'mqtt.thingspeak.com',
    clientId: deviceId,
    username: deviceId,
    password: ts_pass_key,
    keepalive: 6000,
    reconnectPeriod: 10000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};
var client = mqtt.connect(options)
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
client.on('connect', function() {
  conn_tries++;
  if (conn_tries <= 1) {
    //client.subscribe('channels/' + deviceId + '/subscribe/fields/' + watering_frequency_topic + ts_sub_key)
    //client.subscribe('channels/' + deviceId + '/subscribe/fields/' + watering_duration_topic + ts_sub_key)
  }
})
client.on('message', function(topic, message) {
    // message is Buffer
    console.log("Got new message! Topic: " + topic + "; Message: " + message)
    topic.split("/").map(function(val) {
        if (val == watering_duration_topic) water_duration = Number(message);
        else if (val == watering_frequency_topic) interval = Number(message);
    });
})
//////////// Routine ///////////////////////
///////////////////////////////////////////
function wakeupRoutine() {
    //TODO pumpOn
    console.log("pump ON");
    //publish watering init timestamp
    client.publish('channels/' + deviceId + '/publish/fields/field2/' + ts_pub_key, '' + water_duration, {qos: '0'});
    client.publish('channels/' + deviceId + '/publish/fields/field1/' + ts_pub_key, '' + Date.now(), {qos: '0'});
    //publish watering duration
    //TODO pumpOff
    console.log("pump OFF");
}
setInterval(function() {
    console.log("starting routine function...");
    wakeupRoutine();
}, interval * minute);

var mqtt = require('mqtt')

var options = {
port: 1883,
host: 'mqtt.thingspeak.com',
clientId: '11111',
username: 'andrea	',
password: 'A1TOKCY6SJL0Z7SY',
keepalive: 60,
reconnectPeriod: 1000,
protocolId: 'MQIsdp',
protocolVersion: 3,
clean: true,
encoding: 'utf8'
};

var client  = mqtt.connect(options)

client.on('packetreceive', function(packet){
	console.log(packet);
	if (packet.cmd == 'connack') {
		console.log('successfully');
	}
})

client.on('packetsend', function(packet){
	console.log(packet);
	if (packet.cmd == 'connack') {
		console.log('successfully');
	}
})
 
client.on('connect', function () {
  // client.publish('channels/449101/publish/fields/field1/EWZAM3J9XMIYV5M5', '400')
  client.subscribe('channels/449101/subscribe/fields/field1/1GQ2H4LJL64ISJEZ')
  console.log("subscribed successfully")
})
 
client.on('message', function (topic, message) {
  // message is Buffer
  console.log("Got new message! Topic: " + topic + "; Message: " + message)
  // client.end()
})
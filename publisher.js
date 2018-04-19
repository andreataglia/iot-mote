var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://192.168.1.8:1883')
 
client.on('connect', function () {
	console.log("connected successfully")
})
 
// client.on('message', function (topic, message) {
//   // message is Buffer
//   console.log("Got new message! Topic: " + topic + "; Message: " + message.toString())
//   // client.end()
// })
// 

var i = 0;

setInterval(function() {
	i++;
  console.log("publishing...");
  client.publish('new/prova', 'ciao mbare' + i)
}, 5*1000);
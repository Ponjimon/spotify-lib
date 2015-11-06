/* 
 * This file is just for demonstration or test purposes
 * Please ignore this file when using this project in productive environment
 */
var SpotifyClient = require("../index.js");
var client = new SpotifyClient();

client.on("ready", function (data) {
    client.play('spotify:track:7HX6O8k7gAHFzm9Dd50Kuz');
}).on("status", function (data) {
    console.log(data);
}).on("play", function (name, data) {
    console.log(name);
});